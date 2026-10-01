"""Local sovereign vector index implementation using NumPy cosine similarity."""

import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import numpy as np

from app.knowledge.models import DocumentChunk, RetrievalResult
from app.security.models import DataClassification


CLASSIFICATION_LEVELS: Dict[str, int] = {
    "PUBLIC": 1,
    "INTERNAL": 2,
    "CONFIDENTIAL": 3,
    "RESTRICTED": 4,
    "CRITICAL": 5,
}


class VectorIndex(ABC):
    """Abstract vector index interface."""

    @abstractmethod
    def add(self, chunks: List[DocumentChunk], embeddings: List[List[float]]) -> None:
        """Add document chunks and their corresponding embeddings to the index."""
        pass

    @abstractmethod
    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        classification_filter: Optional[Union[DataClassification, str]] = None,
        max_classification: Optional[Union[DataClassification, str]] = None,
    ) -> List[RetrievalResult]:
        """Perform top-k cosine similarity search, optionally filtered and bounded by classification."""
        pass

    @abstractmethod
    def save(self, directory: Union[str, Path]) -> None:
        """Persist index vectors and chunk metadata to a local directory."""
        pass

    @abstractmethod
    def load(self, directory: Union[str, Path]) -> None:
        """Load index vectors and chunk metadata from a local directory."""
        pass

    @abstractmethod
    def count(self) -> int:
        """Return total number of chunks currently indexed."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Reset index contents."""
        pass


class NumpyCosineVectorIndex(VectorIndex):
    """Sovereign in-memory NumPy-based cosine similarity vector index.

    No network dependencies, no external vector daemon. Fully deterministic.
    """

    def __init__(self):
        self._chunks: List[DocumentChunk] = []
        self._embeddings: Optional[np.ndarray] = None  # shape: (N, D)

    def count(self) -> int:
        return len(self._chunks)

    def clear(self) -> None:
        self._chunks = []
        self._embeddings = None

    def add(self, chunks: List[DocumentChunk], embeddings: List[List[float]]) -> None:
        if not chunks or not embeddings:
            return

        if len(chunks) != len(embeddings):
            raise ValueError(f"Mismatch: received {len(chunks)} chunks but {len(embeddings)} embeddings")

        new_vecs = np.array(embeddings, dtype=np.float32)

        # Normalize to unit length for fast dot-product cosine similarity
        norms = np.linalg.norm(new_vecs, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        new_vecs = new_vecs / norms

        if self._embeddings is None:
            self._embeddings = new_vecs
        else:
            self._embeddings = np.vstack([self._embeddings, new_vecs])

        self._chunks.extend(chunks)

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        classification_filter: Optional[Union[DataClassification, str]] = None,
        max_classification: Optional[Union[DataClassification, str]] = None,
    ) -> List[RetrievalResult]:
        if not self._chunks or self._embeddings is None:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        # Cosine similarity is dot product of unit-normalized vectors
        scores = np.dot(self._embeddings, q_vec)

        # Build candidate pairs (index, score)
        candidates = []
        filter_str = None
        if classification_filter:
            filter_str = (
                classification_filter.value
                if isinstance(classification_filter, DataClassification)
                else str(classification_filter).upper()
            )

        max_level_int: Optional[int] = None
        if max_classification:
            max_key = (
                max_classification.value
                if isinstance(max_classification, DataClassification)
                else str(max_classification).upper()
            )
            max_level_int = CLASSIFICATION_LEVELS.get(max_key)

        for idx, score in enumerate(scores):
            chunk = self._chunks[idx]
            chunk_class = chunk.metadata.get("classification")
            chunk_str = (
                chunk_class.value
                if isinstance(chunk_class, DataClassification)
                else str(chunk_class).upper() if chunk_class else "INTERNAL"
            )

            # Enforce maximum classification clearance level
            if max_level_int is not None:
                chunk_level = CLASSIFICATION_LEVELS.get(chunk_str, 2)
                if chunk_level > max_level_int:
                    continue

            # Exact classification filter
            if filter_str:
                if chunk_str != filter_str:
                    continue

            candidates.append((idx, float(score)))

        # Sort candidates descending by score
        candidates.sort(key=lambda item: item[1], reverse=True)

        results: List[RetrievalResult] = []
        for rank, (idx, score) in enumerate(candidates[:top_k], start=1):
            results.append(
                RetrievalResult(
                    chunk=self._chunks[idx],
                    score=round(score, 4),
                    rank=rank,
                )
            )

        return results


    def save(self, directory: Union[str, Path]) -> None:
        target_dir = Path(directory)
        target_dir.mkdir(parents=True, exist_ok=True)

        if self._embeddings is not None:
            np.savez_compressed(target_dir / "embeddings.npz", embeddings=self._embeddings)

        chunks_data = [chunk.model_dump() for chunk in self._chunks]
        with open(target_dir / "chunks.json", "w", encoding="utf-8") as f:
            json.dump(chunks_data, f, indent=2)

    def load(self, directory: Union[str, Path]) -> None:
        target_dir = Path(directory)
        if not target_dir.exists():
            raise FileNotFoundError(f"Index directory does not exist: {target_dir}")

        vec_file = target_dir / "embeddings.npz"
        meta_file = target_dir / "chunks.json"

        if meta_file.exists():
            with open(meta_file, "r", encoding="utf-8") as f:
                chunks_raw = json.load(f)
            self._chunks = [DocumentChunk(**c) for c in chunks_raw]
        else:
            self._chunks = []

        if vec_file.exists():
            loaded = np.load(vec_file)
            self._embeddings = loaded["embeddings"]
        else:
            self._embeddings = None
