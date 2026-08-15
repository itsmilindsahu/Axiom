"""
llm_fallback.py
----------------
Generates a real verdict via the Groq API when a forwarded message
doesn't match anything in the curated claims database closely enough.

Groq's API is OpenAI-compatible, so this uses the `openai` SDK pointed at
Groq's base URL rather than a Groq-specific client.

This is a *fallback*, not a replacement for the curated DB: matched claims
are still preferred because they're human-reviewed and cite a fixed source.
This module is only invoked when ClaimMatcher.best_match() scores below
SIMILARITY_THRESHOLD, so the curated DB stays authoritative whenever it
has an opinion.

Note: the Groq API is pay-per-token like every other major LLM API.
Groq offers fast inference on various models at competitive pricing.

Failure handling: any error here (missing API key, network error, bad
response) is swallowed and surfaces to main.py as None, so the caller can
fall back to the static checklist instead of a broken response.
"""

import json
import logging
import os
from typing import Literal, Optional

from pydantic import BaseModel, ValidationError

logger = logging.getLogger("llm_fallback")

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

SYSTEM_PROMPT = """You are a fact-checking assistant embedded in a WhatsApp \
forward verification tool used in India. You will be given a forwarded \
message (a rumor, news claim, health tip, financial scheme, or similar). \
The message did NOT match anything in the curated claims database, so you \
are the fallback.

Assess the claim using your own knowledge. Respond ONLY with a JSON object \
(no markdown fences, no preamble) with exactly these fields:

{
  "verdict": one of "True", "False", "Misleading", "Unverified",
  "explanation": 2-4 sentences explaining your reasoning in plain language,
  "confidence": "high", "medium", or "low" - how confident you are given \
you don't have a live web search or a cited fact-check for this specific claim,
  "recommend_manual_check": true or false - true if this touches money, \
health, elections, or communal/religious tension, since those categories \
warrant extra caution regardless of your confidence
}

Rules:
- If the message is not a factual claim at all (e.g. a joke, a personal \
message, a question with no claim), set verdict to "Unverified" and say so.
- Do not invent a source URL or pretend to have searched the web.
- Be direct. Do not hedge more than the actual uncertainty warrants.
- "Unverified" means you genuinely don't know, not that you're being cautious \
about an obviously false claim - obviously false claims should be "False".
"""


class LLMVerdict(BaseModel):
    verdict: Literal["True", "False", "Misleading", "Unverified"]
    explanation: str
    confidence: Literal["high", "medium", "low"]
    recommend_manual_check: bool


def get_llm_verdict(text: str) -> Optional[LLMVerdict]:
    """
    Ask Groq (via Groq's OpenAI-compatible API) to assess a claim that didn't
    match the curated DB. Returns None on any failure (missing key, network
    error, bad JSON, etc.) so main.py can fall back to the static checklist
    rather than 500'ing.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY not set; skipping LLM fallback.")
        return None

    try:
        from openai import OpenAI
    except ImportError:
        logger.warning("openai package not installed; skipping LLM fallback.")
        return None

    try:
        client = OpenAI(api_key=api_key, base_url=GROQ_BASE_URL)
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            max_tokens=500,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
        )
        raw = (response.choices[0].message.content or "").strip()

        # Strip accidental markdown fences just in case.
        if raw.startswith("```"):
            raw = raw.strip("`")
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        data = json.loads(raw)
        return LLMVerdict(**data)

    except (json.JSONDecodeError, ValidationError) as e:
        logger.error("LLM fallback returned unparseable output: %s", e)
        return None
    except Exception as e:  # noqa: BLE001 - any API/network failure -> fallback
        logger.error("LLM fallback call failed: %s", e)
        return None
