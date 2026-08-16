"""
API endpoint for Vercel serverless deployment.
Serves FastAPI app as ASGI application.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from matching import ClaimMatcher
except ImportError as e:
    print(f"Error importing matching: {e}")
    raise

# Initialize FastAPI app
app = FastAPI(
    title="Claim Verifier API",
    description="Verify claims against a curated database",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SIMILARITY_THRESHOLD = 0.72
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

# Initialize matcher once
_matcher = None

def get_matcher():
    """Lazy load matcher on first use."""
    global _matcher
    if _matcher is None:
        _matcher = ClaimMatcher()
        try:
            _matcher.load_claims()
        except Exception as e:
            print(f"Error loading claims: {e}")
            raise
    return _matcher


class VerifyRequest(BaseModel):
    text: str


@app.get("/api/health")
def health():
    """Health check endpoint."""
    try:
        matcher = get_matcher()
        return {
            "status": "ok",
            "claims_loaded": matcher.claims_count,
            "model_name": matcher.model_name,
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
        }


@app.post("/api/verify")
def verify(payload: VerifyRequest):
    """Verify a claim against the database."""
    try:
        matcher = get_matcher()
        
        if matcher.store is None:
            raise HTTPException(status_code=503, detail="Claims database not ready.")

        text = payload.text.strip()
        if not text:
            raise HTTPException(status_code=400, detail="Text must not be empty.")

        best_claim, score = matcher.best_match(text)

        if best_claim is not None and score >= SIMILARITY_THRESHOLD:
            return {
                "matched": True,
                "verdict": best_claim.verdict,
                "explanation": best_claim.explanation,
                "source_url": best_claim.source_url,
                "category": best_claim.category,
                "confidence": round(score, 4),
                "matched_claim_id": best_claim.id,
                "matched_claim_text": best_claim.claim_text,
            }

        best_guess_confidence = round(score, 4) if best_claim is not None else None
        return {
            "matched": False,
            "checklist": GENERIC_CHECKLIST,
            "best_guess_confidence": best_guess_confidence,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "matched": False,
            "error": str(e),
            "checklist": GENERIC_CHECKLIST,
        }
