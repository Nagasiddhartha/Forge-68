"""Pydantic request and response schemas for the Knowledge Fabric HTTP API."""

from typing import List, Optional
from pydantic import BaseModel, Field

from app.knowledge.models import KnowledgeDocument, RetrievalResult
from app.security.models import DataClassification
from app.verification.evidence import EvidenceRecord


class KnowledgeIngestRequest(BaseModel):
    """Payload to ingest a local document into the Sovereign Knowledge Fabric."""
    file_path: str = Field(..., description="Local path to the document (.txt, .md, .pdf)")
    classification: Optional[DataClassification] = Field(
        default=None,
        description="Optional security classification override (e.g. PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED, CRITICAL)"
    )
    document_type: Optional[str] = Field(
        default=None,
        description="Optional document type override (e.g. SOP, INSPECTION, SPECIFICATION, MAINTENANCE, SAFETY, GENERAL)"
    )
    equipment_ids: Optional[List[str]] = Field(
        default=None,
        description="Optional equipment identifiers to attach (e.g. ['R-204'])"
    )


class KnowledgeIngestResponse(BaseModel):
    """Response confirming document ingestion, hashing, and chunk indexing."""
    status: str = Field(default="success")
    document: KnowledgeDocument
    chunks_created: int


class KnowledgeSearchRequest(BaseModel):
    """Payload to query the local sovereign vector index."""
    query: str = Field(..., description="Natural language search query")
    top_k: int = Field(default=5, ge=1, le=50, description="Maximum number of chunks to retrieve")
    classification: Optional[DataClassification] = Field(
        default=None,
        description="Optional data classification filter"
    )


class KnowledgeSearchResponse(BaseModel):
    """Ranked retrieval results with document metadata and evidence provenance."""
    query: str
    total_results: int
    results: List[RetrievalResult]
    evidence: List[EvidenceRecord]
