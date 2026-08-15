"""
app.py
------
Entry point for running the claim verification script.

Run with:
  python app.py
"""

if __name__ == "__main__":
    from main import matcher, verify_claim, SIMILARITY_THRESHOLD, GENERIC_CHECKLIST

    # Initialize matcher
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("app")

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
