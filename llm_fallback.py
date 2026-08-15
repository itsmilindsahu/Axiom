"""
llm_fallback.py
----------------
Fallback logic for claims that don't match the curated database.
For now, this returns None to use the static checklist.
"""

import logging
from typing import Literal, Optional

from pydantic import BaseModel

logger = logging.getLogger("llm_fallback")


class LLMVerdict(BaseModel):
    verdict: Literal["True", "False", "Misleading", "Unverified"]
    explanation: str
    confidence: Literal["high", "medium", "low"]
    recommend_manual_check: bool


def get_llm_verdict(text: str) -> Optional[LLMVerdict]:
    """
    Fallback for unmatched claims. Currently disabled.
    Returns None so main.py falls back to the static checklist.
    """
    logger.info("No LLM fallback configured; using static checklist.")
    return None
