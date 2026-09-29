"""Evidence representation and verified artifact capture for FORGE."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from app.security.models import DataClassification


class EvidenceRecord(BaseModel):
    """Structured evidence item captured from an authorized tool execution or sovereign document retrieval."""
    evidence_id: str = Field(default_factory=lambda: f"evd-{uuid.uuid4().hex[:12]}")
    source_type: str = Field(
        default="LOCAL_INDUSTRIAL_TOOL",
        description="Origin source category (e.g., LOCAL_INDUSTRIAL_TOOL, knowledge_document, AIRGAP_TELEMETRY)"
    )
    source_reference: str = Field(
        ...,
        description="Reference identifier of the source (e.g., tool:equipment_history or doc:doc-123#chunk_0)"
    )
    tool_name: Optional[str] = Field(default=None, description="Name of the executed tool if tool-based")
    tool_execution_id: Optional[str] = Field(default=None, description="Audit event identifier of execution or retrieval")
    retrieved_data: Any = Field(..., description="Verified tool response data or document chunk payload")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    classification: DataClassification = Field(
        default=DataClassification.INTERNAL,
        description="Data classification level of the evidence payload"
    )
    verified: bool = Field(default=True, description="Whether this record was verified by policy and schema guards")

    # Knowledge Fabric extensions (backwards-compatible)
    document_id: Optional[str] = Field(default=None, description="Source knowledge document ID")
    chunk_id: Optional[str] = Field(default=None, description="Source document chunk ID")
    filename: Optional[str] = Field(default=None, description="Source document filename")
    retrieval_score: Optional[float] = Field(default=None, description="Relevance similarity score")
    retrieved_text: Optional[str] = Field(default=None, description="Extracted text payload of document chunk")

    @classmethod
    def from_retrieval_result(cls, result: Any) -> "EvidenceRecord":
        """Convert a knowledge fabric RetrievalResult to a verified EvidenceRecord."""
        chunk = getattr(result, "chunk", None)
        if chunk is None:
            raise ValueError("RetrievalResult must contain a chunk")

        meta = getattr(chunk, "metadata", {}) or {}
        doc_id = getattr(chunk, "document_id", "") or meta.get("document_id", "")
        chunk_id = getattr(chunk, "chunk_id", "")
        chunk_index = getattr(chunk, "chunk_index", 0)
        text = getattr(chunk, "text", "")
        filename = meta.get("filename", "unknown")
        raw_classification = meta.get("classification", DataClassification.INTERNAL)

        if isinstance(raw_classification, DataClassification):
            classification = raw_classification
        else:
            try:
                classification = DataClassification(str(raw_classification).upper())
            except ValueError:
                classification = DataClassification.INTERNAL

        score = float(getattr(result, "score", 0.0))
        rank = int(getattr(result, "rank", 1))

        return cls(
            evidence_id=f"evd-{uuid.uuid4().hex[:12]}",
            source_type="knowledge_document",
            source_reference=f"doc:{doc_id}#chunk_{chunk_index}",
            tool_name="knowledge_retrieval",
            tool_execution_id=f"retrieval-{chunk_id}",
            retrieved_data={
                "text": text,
                "document_id": doc_id,
                "chunk_id": chunk_id,
                "chunk_index": chunk_index,
                "filename": filename,
                "score": score,
                "rank": rank,
                "classification": classification.value,
            },
            retrieved_text=text,
            document_id=doc_id,
            chunk_id=chunk_id,
            filename=filename,
            retrieval_score=score,
            classification=classification,
            verified=True,
        )
