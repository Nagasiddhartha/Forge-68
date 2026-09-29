"""Local sovereign embedding provider abstraction and implementations for FORGE."""

import hashlib
import math
import re
from abc import ABC, abstractmethod
from typing import List, Optional

import numpy as np

from app.config import settings


class BaseEmbeddingProvider(ABC):
    """Abstract sovereign embedding provider interface."""

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Vector dimensionality."""
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Identifier of the local embedding model."""
        pass

    @abstractmethod
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Compute embeddings for a batch of text chunks locally."""
        pass

    @abstractmethod
    async def embed_query(self, query: str) -> List[float]:
        """Compute embedding for a single search query locally."""
        pass


class MockEmbeddingProvider(BaseEmbeddingProvider):
    """Deterministic, local hash-based embedding provider for offline/testing environments.

    Uses deterministic token-level feature hashing into a unit-normalized vector space.
    Ensures semantically overlapping terms yield high cosine similarity without downloading
    multi-gigabyte weights during test/offline execution.
    """

    def __init__(self, dimension: int = 384, model_name: str = "deterministic-hashing-384"):
        self._dimension = dimension
        self._model_name = model_name

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def model_name(self) -> str:
        return self._model_name

    def _hash_token(self, token: str) -> tuple[int, float]:
        """Hash a token to an index and sign deterministically."""
        digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
        idx = int(digest[:8], 16) % self._dimension
        sign = 1.0 if int(digest[8:10], 16) % 2 == 0 else -1.0
        return idx, sign

    def _embed_single(self, text: str) -> List[float]:
        vec = np.zeros(self._dimension, dtype=np.float32)
        tokens = re.findall(r"\b\w+\b", text.lower())
        if not tokens:
            # Return deterministic unit vector if text is empty
            vec[0] = 1.0
            return vec.tolist()

        for token in tokens:
            idx, sign = self._hash_token(token)
            vec[idx] += sign

        # Unit-normalize vector
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        else:
            vec[0] = 1.0

        return vec.tolist()

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_single(t) for t in texts]

    async def embed_query(self, query: str) -> List[float]:
        return self._embed_single(query)


class SentenceTransformerEmbeddingProvider(BaseEmbeddingProvider):
    """Local sovereign sentence-transformers provider (e.g. BAAI/bge-m3).

    Requires local sentence-transformers package and local cached weights.
    Strictly local inference: never invokes cloud APIs.
    """

    def __init__(self, model_name: Optional[str] = None):
        self._model_name = model_name or settings.EMBEDDING_MODEL
        self._model = None
        self._dimension = 1024 if "bge-m3" in self._model_name.lower() else 384

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self._model_name)
                self._dimension = self._model.get_sentence_embedding_dimension()
            except ImportError:
                raise RuntimeError(
                    "sentence-transformers package is required for SentenceTransformerEmbeddingProvider. "
                    "Install with: pip install sentence-transformers or configure EMBEDDING_PROVIDER=mock."
                )
            except Exception as e:
                raise RuntimeError(
                    f"Failed to load local embedding model '{self._model_name}'. "
                    f"Ensure weights are available locally. Error: {e}"
                )

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def model_name(self) -> str:
        return self._model_name

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        self._load_model()
        embeddings = self._model.encode(texts, normalize_embeddings=True)
        return embeddings.tolist()

    async def embed_query(self, query: str) -> List[float]:
        self._load_model()
        embedding = self._model.encode(query, normalize_embeddings=True)
        return embedding.tolist()


def get_embedding_provider(provider_type: Optional[str] = None, model_name: Optional[str] = None) -> BaseEmbeddingProvider:
    """Factory to instantiate the configured sovereign embedding provider."""
    provider_str = (provider_type or settings.EMBEDDING_PROVIDER).lower()
    if provider_str == "mock":
        return MockEmbeddingProvider(model_name=model_name or "deterministic-hashing-384")
    elif provider_str in ("local", "sentence_transformers", "bge-m3"):
        return SentenceTransformerEmbeddingProvider(model_name=model_name)
    else:
        # Default fallback to deterministic mock to prevent blocking on network
        return MockEmbeddingProvider(model_name=model_name or "deterministic-hashing-384")
