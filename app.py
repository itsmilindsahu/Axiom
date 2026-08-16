"""
app.py
------
FastAPI + Gradio entry point for Hugging Face Spaces.
Exposes /api/verify and /api/health for the frontend.
"""

import logging
import gradio as gr
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from matching import ClaimMatcher

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

# 1. Initialize FastAPI app
fast_app = FastAPI(
    title="Axiom Claim Verifier API",
    description="Verify claims against curated database",
    version="1.0.0"
)

# 2. Enable CORS for GitHub Pages frontend
fast_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# 3. Pre-load matcher at startup
logger.info("Initializing ClaimMatcher...")
matcher = ClaimMatcher()
try:
    matcher.load_claims()
    logger.info("Claims loaded successfully!")
except Exception as e:
    logger.error("Failed to load claims: %s", e)


class VerifyRequest(BaseModel):
    text: str


@fast_app.get("/api/health")
def health():
    return {
        "status": "ok" if matcher.store is not None else "degraded",
        "claims_loaded": matcher.claims_count,
        "model_name": matcher.model_name,
    }


@fast_app.post("/api/verify")
def verify(payload: VerifyRequest):
    if matcher.store is None:
        raise HTTPException(status_code=503, detail="Claims database not ready.")
    
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text must not be empty.")

    try:
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

        return {
            "matched": False,
            "checklist": GENERIC_CHECKLIST,
            "best_guess_confidence": round(score, 4) if best_claim else None,
        }
    except Exception as e:
        logger.error("Error verifying claim: %s", e)
        return {"matched": False, "error": str(e), "checklist": GENERIC_CHECKLIST}


# 4. Gradio UI placeholder
with gr.Blocks(title="Axiom API") as gradio_ui:
    gr.Markdown("""
    # Axiom — Claim Verification API
    
    This space runs the backend API for **Axiom** fact-checking system.
    
    - **Frontend**: [https://itsmilindsahu.github.io/Axiom/](https://itsmilindsahu.github.io/Axiom/)
    - **Health Check**: `/api/health`
    - **Verify Endpoint**: `/api/verify`
    """)

# 5. Mount Gradio UI onto FastAPI app
app = gr.mount_gradio_app(fast_app, gradio_ui, path="/")
