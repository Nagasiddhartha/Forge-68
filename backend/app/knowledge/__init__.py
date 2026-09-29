"""FORGE Sovereign Knowledge & RAG Module.

Industrial Knowledge Fabric providing sovereign document ingestion, chunking,
local embedding generation, local cosine-similarity vector indexing, and
provenance-backed retrieval without cloud transmission.
"""

from app.knowledge.chunker import DeterministicChunker
from app.knowledge.embeddings import (
    BaseEmbeddingProvider,
    MockEmbeddingProvider,
    SentenceTransformerEmbeddingProvider,
    get_embedding_provider,
)
from app.knowledge.index import NumpyCosineVectorIndex, VectorIndex
from app.knowledge.ingestion import (
    LocalDocumentIngestionPipeline,
    OcrRequiredError,
    PathTraversalError,
    UnsupportedFormatError,
    calculate_sha256,
    extract_equipment_ids,
    validate_secure_path,
)
from app.knowledge.models import (
    DocumentChunk,
    DocumentType,
    KnowledgeDocument,
    RetrievalResult,
)
from app.knowledge.schemas import (
    KnowledgeIngestRequest,
    KnowledgeIngestResponse,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
)
from app.knowledge.service import KnowledgeService, knowledge_service

__all__ = [
    "DeterministicChunker",
    "BaseEmbeddingProvider",
    "MockEmbeddingProvider",
    "SentenceTransformerEmbeddingProvider",
    "get_embedding_provider",
    "VectorIndex",
    "NumpyCosineVectorIndex",
    "LocalDocumentIngestionPipeline",
    "PathTraversalError",
    "OcrRequiredError",
    "UnsupportedFormatError",
    "calculate_sha256",
    "extract_equipment_ids",
    "validate_secure_path",
    "DocumentChunk",
    "DocumentType",
    "KnowledgeDocument",
    "RetrievalResult",
    "KnowledgeService",
    "knowledge_service",
    "KnowledgeIngestRequest",
    "KnowledgeIngestResponse",
    "KnowledgeSearchRequest",
    "KnowledgeSearchResponse",
]
