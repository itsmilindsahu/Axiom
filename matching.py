"""
matching.py
-----------
Handles everything related to turning text into embeddings and finding the
closest matching claim in the curated database via cosine similarity.

Design notes:
- We use "paraphrase-multilingual-MiniLM-L12-v2" because it supports both
  English and Hindi (and 50+ other languages) in a shared embedding space,
  so a Hindi forward can match an English-authored claim and vice versa.
- Embeddings for the claims database are computed once at startup and
  cached in memory (see load_claims_and_embeddings). This keeps the
  per-request cost of /api/verify limited to embedding just the incoming
  message, not the whole database.
- We embed BOTH the English and Hindi versions of each claim and keep
  whichever gives the higher similarity for a given query, which improves
  recall for mixed-language / code-switched WhatsApp forwards.
"""

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple

import numpy as np
from sentence_transformers import SentenceTransformer

from models import Claim

logger = logging.getLogger("matching")

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
DEFAULT_CLAIMS_PATH = Path(__file__).parent / "data" / "claims.json"


@dataclass
class ClaimStore:
    """In-memory cache of claims + their precomputed embeddings."""

    claims: List[Claim]
    # embeddings[i] corresponds to claims[i], shape: (2, embedding_dim)
    # row 0 = English embedding, row 1 = Hindi embedding
    embeddings: np.ndarray


class ClaimMatcher:
    """Loads the sentence-transformer model once and serves similarity lookups."""

    def __init__(self, model_name: str = MODEL_NAME):
        logger.info("Loading sentence-transformer model: %s", model_name)
        self.model = SentenceTransformer(model_name)
        self.model_name = model_name
        self.store: Optional[ClaimStore] = None

    # -- Loading -----------------------------------------------------------

    def load_claims(self, claims_path: Path = DEFAULT_CLAIMS_PATH) -> None:
        """Read the claims JSON file and precompute + cache embeddings for each claim."""
        with open(claims_path, "r", encoding="utf-8") as f:
            raw_claims = json.load(f)

        claims = [Claim(**c) for c in raw_claims]

        english_texts = [c.claim_text for c in claims]
        hindi_texts = [c.claim_text_hi for c in claims]

        logger.info("Encoding %d claims (EN + HI)...", len(claims))
        english_embeddings = self.model.encode(
            english_texts, normalize_embeddings=True, show_progress_bar=False
        )
        hindi_embeddings = self.model.encode(
            hindi_texts, normalize_embeddings=True, show_progress_bar=False
        )

        # Stack into shape (num_claims, 2, embedding_dim)
        combined = np.stack([english_embeddings, hindi_embeddings], axis=1)

        self.store = ClaimStore(claims=claims, embeddings=combined)
        logger.info("Claim embeddings cached. %d claims ready.", len(claims))

    # -- Querying ------------------------------------------------------------

    def best_match(self, query_text: str) -> Tuple[Optional[Claim], float]:
        """
        Embed the incoming query and return the (claim, similarity_score) of the
        best match across both the English and Hindi embedding of every claim.

        Returns (None, 0.0) if the store hasn't been loaded or is empty.
        """
        if self.store is None or len(self.store.claims) == 0:
            return None, 0.0

        query_embedding = self.model.encode(
            [query_text], normalize_embeddings=True, show_progress_bar=False
        )[0]  # shape: (embedding_dim,)

        # embeddings shape: (num_claims, 2, embedding_dim) -> flatten to (num_claims*2, dim)
        num_claims = self.store.embeddings.shape[0]
        flat = self.store.embeddings.reshape(num_claims * 2, -1)

        # Since embeddings are L2-normalized, cosine similarity == dot product.
        similarities = flat @ query_embedding  # shape: (num_claims*2,)

        best_flat_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_flat_idx])
        best_claim_idx = best_flat_idx // 2  # //2 because each claim has 2 rows (EN, HI)

        return self.store.claims[best_claim_idx], best_score

    @property
    def claims_count(self) -> int:
        return len(self.store.claims) if self.store else 0
