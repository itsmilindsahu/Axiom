"""
models.py
---------
Pydantic schemas for request/response validation and serialization.
Keeping these in one place makes the API contract easy to read and
easy to keep in sync with the README documentation.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Internal / data layer models
# ---------------------------------------------------------------------------

class Claim(BaseModel):
    """A single curated claim record as stored in data/claims.json."""

    id: int
    claim_text: str
    claim_text_hi: str
    verdict: Literal["True", "False", "Misleading", "Unverified"]
    explanation: str
    source_url: str
    category: Literal["health", "financial", "communal"]


# ---------------------------------------------------------------------------
# API request models
# ---------------------------------------------------------------------------

class VerifyRequest(BaseModel):
    """Body for POST /api/verify"""

    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="The forwarded message text pasted by the user (English or Hindi).",
        examples=["Drinking hot water with lemon cures cancer, please forward to everyone!"],
    )


# ---------------------------------------------------------------------------
# API response models
# ---------------------------------------------------------------------------

class MatchedVerifyResponse(BaseModel):
    """Returned by /api/verify when a close-enough claim match is found."""

    matched: Literal[True] = True
    verdict: str
    explanation: str
    source_url: str
    category: str
    confidence: float = Field(
        ..., description="Cosine similarity score between 0 and 1 for the best-matching claim."
    )
    matched_claim_id: int
    matched_claim_text: str


class UnmatchedVerifyResponse(BaseModel):
    """
    Returned by /api/verify when no curated claim clears the similarity
    threshold AND the LLM fallback was unavailable or also failed.
    This is the last-resort response.
    """

    matched: Literal[False] = False
    checklist: List[str]
    message: str = (
        "We couldn't confidently match this to a known claim in our database. "
        "Use the checklist below to verify it yourself before believing or forwarding it."
    )
    best_guess_confidence: Optional[float] = Field(
        None, description="Highest similarity score found, even though it was below the threshold."
    )


class LLMVerifyResponse(BaseModel):
    """
    Returned by /api/verify when no curated claim matches closely enough,
    but the LLM fallback produced a usable assessment.
    """

    matched: Literal[False] = False
    source: Literal["llm"] = "llm"
    verdict: str
    explanation: str
    confidence_label: str = Field(
        ..., description="LLM's self-reported confidence: 'high', 'medium', or 'low'."
    )
    recommend_manual_check: bool = Field(
        ...,
        description=(
            "True when the claim touches money, health, elections, or "
            "communal/religious tension - flagged for extra caution regardless "
            "of the LLM's confidence."
        ),
    )
    checklist: List[str] = Field(
        ..., description="Manual verification steps, always included alongside the LLM verdict."
    )
    message: str = (
        "No curated fact-check exists for this yet, so this verdict was generated "
        "by AI rather than a human fact-checker. Treat it as a starting point, not "
        "a final answer, and use the checklist to verify independently."
    )
    best_guess_confidence: Optional[float] = Field(
        None, description="Highest similarity score against the curated DB, for transparency."
    )


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    claims_loaded: int
    model_name: str
    similarity_threshold: float
