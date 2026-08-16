"""
app.py
------
Runs on Hugging Face Spaces (Gradio SDK).
Mounts the FastAPI claim-verification endpoints onto Gradio's uvicorn server
so /api/verify and /api/health are reachable alongside the Gradio UI.
"""

import uvicorn
import gradio as gr
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from matching import ClaimMatcher

# ── FastAPI ────────────────────────────────────────────────────────────────────
fast_app = FastAPI(title="Axiom Claim Verifier API", version="1.0.0")

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

_matcher = None


def get_matcher():
    """Lazy-load the ClaimMatcher on first request."""
    global _matcher
    if _matcher is None:
        _matcher = ClaimMatcher()
        _matcher.load_claims()
    return _matcher


class VerifyRequest(BaseModel):
    text: str


@fast_app.get("/api/health")
def health():
    try:
        matcher = get_matcher()
        return {"status": "ok", "claims_loaded": matcher.claims_count, "model_name": matcher.model_name}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@fast_app.post("/api/verify")
def verify(payload: VerifyRequest):
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
        return {
            "matched": False,
            "checklist": GENERIC_CHECKLIST,
            "best_guess_confidence": round(score, 4) if best_claim else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"matched": False, "error": str(e), "checklist": GENERIC_CHECKLIST}


# ── Gradio UI (minimal — required by HF Spaces) ────────────────────────────────
with gr.Blocks(title="Axiom API") as demo:
    gr.Markdown("""
# Axiom — Claim Verification API

This Space hosts the backend API for the **Axiom** fact-checking app.

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/verify` | Verify a claim (`{"text": "..."}`) |

👉 **[Open the app](https://itsmilindsahu.github.io/Axiom/)**
""")

# Mount Gradio onto FastAPI — Gradio UI at "/" and FastAPI routes at /api/*
app = gr.mount_gradio_app(fast_app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
