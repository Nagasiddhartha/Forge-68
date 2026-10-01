"""Sovereign Knowledge Service orchestrating ingestion, embedding, indexing, and retrieval."""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

from app.knowledge.embeddings import BaseEmbeddingProvider, get_embedding_provider
from app.knowledge.index import NumpyCosineVectorIndex, VectorIndex
from app.knowledge.ingestion import LocalDocumentIngestionPipeline
from app.knowledge.models import DocumentChunk, KnowledgeDocument, RetrievalResult
from app.security.models import DataClassification
from app.verification.evidence import EvidenceRecord


class KnowledgeService:
    """Sovereign Knowledge Fabric service.

    Orchestrates local document ingestion, embedding computation, vector indexing,
    and similarity retrieval. Strictly sovereign: no external cloud calls, no LLM calls.
    """

    def __init__(
        self,
        embedding_provider: Optional[BaseEmbeddingProvider] = None,
        vector_index: Optional[VectorIndex] = None,
        ingestion_pipeline: Optional[LocalDocumentIngestionPipeline] = None,
    ):
        self.embedding_provider = embedding_provider or get_embedding_provider()
        self.vector_index = vector_index or NumpyCosineVectorIndex()
        self.ingestion_pipeline = ingestion_pipeline or LocalDocumentIngestionPipeline()
        self._documents: Dict[str, KnowledgeDocument] = {}

    async def ingest_document(
        self,
        file_path: Union[str, Path],
        allowed_base_dir: Optional[Union[str, Path]] = None,
        classification: Optional[DataClassification] = None,
        document_type: Optional[str] = None,
        equipment_ids: Optional[List[str]] = None,
    ) -> Tuple[KnowledgeDocument, int]:
        """Ingest a local document, compute sovereign embeddings, and register in local vector index."""
        # Ingest, compute hash, and chunk
        doc, chunks = self.ingestion_pipeline.ingest_file(
            file_path=file_path,
            allowed_base_dir=allowed_base_dir,
            classification=classification,
            document_type=document_type,
            equipment_ids=equipment_ids,
        )

        if chunks:
            # Generate local embeddings
            texts = [c.text for c in chunks]
            embeddings = await self.embedding_provider.embed_texts(texts)

            # Store in local index
            self.vector_index.add(chunks, embeddings)

        self._documents[doc.document_id] = doc
        return doc, len(chunks)

    async def search(
        self,
        query: str,
        top_k: int = 5,
        classification_filter: Optional[Union[DataClassification, str]] = None,
        max_classification: Optional[Union[DataClassification, str]] = None,
    ) -> List[RetrievalResult]:
        """Execute similarity search against local vector index without calling any LLM."""
        if not query or not query.strip():
            return []

        query_vec = await self.embedding_provider.embed_query(query)
        results = self.vector_index.search(
            query_embedding=query_vec,
            top_k=top_k,
            classification_filter=classification_filter,
            max_classification=max_classification,
        )
        return results

    async def search_as_evidence(
        self,
        query: str,
        top_k: int = 5,
        classification_filter: Optional[Union[DataClassification, str]] = None,
        max_classification: Optional[Union[DataClassification, str]] = None,
    ) -> List[EvidenceRecord]:
        """Search local index and convert ranked results directly to verified EvidenceRecords."""
        results = await self.search(
            query=query,
            top_k=top_k,
            classification_filter=classification_filter,
            max_classification=max_classification,
        )
        evidence_list = [EvidenceRecord.from_retrieval_result(r) for r in results]
        return evidence_list


    def get_document(self, document_id: str) -> Optional[KnowledgeDocument]:
        """Retrieve stored document metadata by ID."""
        return self._documents.get(document_id)

    def list_documents(self) -> List[KnowledgeDocument]:
        """List all ingested documents."""
        return list(self._documents.values())

    def save_index(self, directory: Union[str, Path]) -> None:
        """Persist vector index to local filesystem."""
        self.vector_index.save(directory)

    def load_index(self, directory: Union[str, Path]) -> None:
        """Load vector index from local filesystem."""
        self.vector_index.load(directory)


knowledge_service = KnowledgeService()
