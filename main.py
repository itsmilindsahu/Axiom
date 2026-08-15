"""
main.py
-------
FastAPI application for the WhatsApp Forward Checker backend.

Endpoints:
  GET  /api/health   -> basic liveness / readiness check
  POST /api/verify    -> the core misinformation-matching endpoint

Run locally with:
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from llm_fallback import get_llm_verdict
from matching import ClaimMatcher
from models import (
    HealthResponse,
    LLMVerifyResponse,
    MatchedVerifyResponse,
    UnmatchedVerifyResponse,
    VerifyRequest,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Similarity threshold above which we consider a claim "matched".
# Configurable via env var so it can be tuned without a code change/redeploy.
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.72"))

GENERIC_CHECKLIST = [
    "Check the sender: is this from someone you personally know and trust, or an unknown/forwarded chain?",
    "Search the exact claim in quotes on Google to see if fact-checkers have already covered it.",
    "Check the date: old news or old photos/videos are often recirculated as if they're current.",
    "Look for a credible, named source (news outlet, government site, official body) — not just 'someone shared it'.",
    "Reverse-image or reverse-video search any photos or videos attached to the message.",
    "Be suspicious of urgent calls to action like 'forward to 10 people' or 'share before it's deleted'.",
    "Check official websites (e.g. RBI, WHO, PIB, ECI) directly for claims about money, health, or government schemes.",
    "If in doubt, don't forward it until you've verified it independently.",
]

# ---------------------------------------------------------------------------
# App + matcher setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="WhatsApp Forward Checker API",
    description=(
        "Backend for verifying forwarded WhatsApp/social messages against a curated "
        "database of known misinformation claims (health myths, financial scams, "
        "and communal/political rumours), using multilingual (EN+HI) semantic matching."
    ),
    version="1.0.0",
)

# CORS enabled for all origins so any frontend (web, mobile webview, etc.) can call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # must be False when allow_origins is "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

matcher = ClaimMatcher()


@app.on_event("startup")
def startup_event() -> None:
    """Load the sentence-transformer model and precompute claim embeddings once."""
    logger.info("Starting up: loading model and precomputing claim embeddings...")
    matcher.load_claims()
    logger.info(
        "Startup complete. %d claims cached. Similarity threshold = %.2f",
        matcher.claims_count,
        SIMILARITY_THRESHOLD,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health", response_model=HealthResponse, tags=["meta"])
def health() -> HealthResponse:
    """Basic health check. Also useful to confirm claims/embeddings loaded successfully."""
    return HealthResponse(
        status="ok",
        claims_loaded=matcher.claims_count,
        model_name=matcher.model_name,
        similarity_threshold=SIMILARITY_THRESHOLD,
    )


@app.post(
    "/api/verify",
    response_model=None,  # union response handled manually below
    tags=["verify"],
    summary="Verify a forwarded message against the curated claims database",
)
def verify(payload: VerifyRequest):
    """
    Embed the incoming text, compare it against all cached claim embeddings via
    cosine similarity, and return either a matched claim (with verdict/explanation)
    or a generic self-verification checklist if nothing matches confidently enough.
    """
    if matcher.store is None:
        # Should not happen in normal operation since startup loads it, but guard anyway.
        raise HTTPException(status_code=503, detail="Claims database is not ready yet. Try again shortly.")

    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="`text` must not be empty.")

    best_claim, score = matcher.best_match(text)

    if best_claim is not None and score >= SIMILARITY_THRESHOLD:
        return MatchedVerifyResponse(
            matched=True,
            verdict=best_claim.verdict,
            explanation=best_claim.explanation,
            source_url=best_claim.source_url,
            category=best_claim.category,
            confidence=round(score, 4),
            matched_claim_id=best_claim.id,
            matched_claim_text=best_claim.claim_text,
        )

    best_guess_confidence = round(score, 4) if best_claim is not None else None

    llm_verdict = get_llm_verdict(text)
    if llm_verdict is not None:
        return LLMVerifyResponse(
            verdict=llm_verdict.verdict,
            explanation=llm_verdict.explanation,
            confidence_label=llm_verdict.confidence,
            recommend_manual_check=llm_verdict.recommend_manual_check,
            checklist=GENERIC_CHECKLIST,
            best_guess_confidence=best_guess_confidence,
        )

    # LLM fallback unavailable or failed - last resort: static checklist only.
    return UnmatchedVerifyResponse(
        matched=False,
        checklist=GENERIC_CHECKLIST,
        best_guess_confidence=best_guess_confidence,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
