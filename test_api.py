#!/usr/bin/env python
"""Test the verify endpoint with an unmatched claim to trigger LLM fallback."""

import os
import json
import requests

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("Set the GROQ_API_KEY environment variable before running this test.")

# Set the API key BEFORE any imports that may depend on it.
os.environ["GROQ_API_KEY"] = api_key

# Test with a claim that won't match the database
test_claim = "Drinking warm water with lemon cures cancer instantly"

print(f"Testing with claim: {test_claim}\n")
print("Sending request to http://localhost:8000/api/verify...\n")

try:
    response = requests.post(
        'http://localhost:8000/api/verify',
        json={'text': test_claim},
        timeout=60
    )
    print(f"Status Code: {response.status_code}\n")
    print("Response:")
    print(json.dumps(response.json(), indent=2))
except requests.exceptions.Timeout:
    print("⏱️ Request timed out. The LLM API might be slow or unresponsive.")
except Exception as e:
    print(f"Error: {e}")
