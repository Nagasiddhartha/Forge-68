"""Deterministic text chunking for FORGE Sovereign Knowledge Fabric."""

import re
import uuid
from typing import List, Optional

from app.knowledge.models import DocumentChunk, KnowledgeDocument
from app.security.models import DataClassification


class DeterministicChunker:
    """Configurable, deterministic text chunker preserving document provenance metadata."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be strictly less than chunk_size")
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text: str) -> List[str]:
        """Split text deterministically into overlapping windows on word boundaries."""
        clean_text = text.strip()
        if not clean_text:
            return []

        if len(clean_text) <= self.chunk_size:
            return [clean_text]

        chunks = []
        start = 0
        text_len = len(clean_text)

        while start < text_len:
            end = start + self.chunk_size
            if end >= text_len:
                chunk_slice = clean_text[start:].strip()
                if chunk_slice:
                    chunks.append(chunk_slice)
                break

            # Attempt to split at a clean boundary (newline, period, or space)
            boundary = -1
            search_window = clean_text[start:end]
            # Try newline boundary
            newline_pos = search_window.rfind("\n")
            if newline_pos > self.chunk_size // 2:
                boundary = start + newline_pos
            else:
                # Try sentence boundary (. )
                period_pos = search_window.rfind(". ")
                if period_pos > self.chunk_size // 2:
                    boundary = start + period_pos + 1
                else:
                    # Try space boundary
                    space_pos = search_window.rfind(" ")
                    if space_pos > self.chunk_size // 2:
                        boundary = start + space_pos

            if boundary == -1:
                boundary = end

            chunk_slice = clean_text[start:boundary].strip()
            if chunk_slice:
                chunks.append(chunk_slice)

            # Advance by step size (chunk_size - overlap)
            step = boundary - start - self.chunk_overlap
            if step <= 0:
                step = max(1, self.chunk_size - self.chunk_overlap)
            start += step

        return chunks

    def chunk_document(self, document: KnowledgeDocument, text: str) -> List[DocumentChunk]:
        """Convert extracted document text into DocumentChunk objects with complete metadata."""
        slices = self.split_text(text)
        chunks: List[DocumentChunk] = []

        classification_val = (
            document.classification.value
            if isinstance(document.classification, DataClassification)
            else str(document.classification)
        )

        for idx, slice_text in enumerate(slices):
            chunk_id = f"chk-{document.document_id}-{idx:04d}"
            metadata = {
                "document_id": document.document_id,
                "filename": document.filename,
                "title": document.title,
                "document_type": document.document_type,
                "equipment_ids": document.equipment_ids,
                "classification": classification_val,
                "chunk_index": idx,
                "source_path": document.source_path,
                "content_hash": document.content_hash,
            }
            chunks.append(
                DocumentChunk(
                    chunk_id=chunk_id,
                    document_id=document.document_id,
                    text=slice_text,
                    chunk_index=idx,
                    metadata=metadata,
                )
            )

        return chunks
