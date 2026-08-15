"""
main.py
-------
Simple verification script for testing the claims database.
No API routes - just load and test directly.

Run with:
  python main.py
"""

import logging
from matching import ClaimMatcher

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# Similarity threshold above which we consider a claim "matched"
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


def verify_claim(text: str) -> dict:
    """
    Verify a claim against the database.
    Returns a dictionary with the verification result.
    """
    if matcher.store is None:
        return {"error": "Claims database not loaded"}

    text = text.strip()
    if not text:
        return {"error": "Text must not be empty"}

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

    # No match found - return checklist
    best_guess_confidence = round(score, 4) if best_claim is not None else None
    return {
        "matched": False,
        "checklist": GENERIC_CHECKLIST,
        "best_guess_confidence": best_guess_confidence,
    }


if __name__ == "__main__":
    # Initialize matcher
    matcher = ClaimMatcher()
    logger.info("Loading claims database...")
    matcher.load_claims()
    logger.info(
        "✓ Loaded %d claims. Similarity threshold = %.2f",
        matcher.claims_count,
        SIMILARITY_THRESHOLD,
    )

    # Test with sample questions
    print("\n" + "=" * 70)
    print("CLAIM VERIFICATION TESTER")
    print("=" * 70)

    test_claims = [
        "Lemon water cures cancer",
        "Garlic protects from COVID",
        "5G spreads coronavirus",
        "WhatsApp lottery 25 lakh rupees",
        "Cow urine cures diabetes",
        "This is just a random question",
    ]

    for claim in test_claims:
        print(f"\n📝 Testing: {claim}")
        print("-" * 70)
        result = verify_claim(claim)

        if result["matched"]:
            print(f"✓ MATCHED - Verdict: {result['verdict']}")
            print(f"  Confidence: {result['confidence']}")
            print(f"  Category: {result['category']}")
            print(f"  Explanation: {result['explanation']}")
            print(f"  Source: {result['source_url']}")
        else:
            conf = result.get("best_guess_confidence")
            if conf:
                print(f"✗ No match found (best confidence: {conf})")
            else:
                print(f"✗ No match found")
            print(f"\n  Quick checklist:")
            for i, tip in enumerate(result["checklist"], 1):
                print(f"  {i}. {tip}")

    print("\n" + "=" * 70)
    print("✓ All tests complete!")
    print("=" * 70)
