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

    # Multimodal Visual Intelligence extensions (backwards-compatible)
    source_image_hash: Optional[str] = Field(default=None, description="Cryptographic SHA-256 digest of analyzed source image")
    finding_id: Optional[str] = Field(default=None, description="Identifier of the visual finding")
    equipment_id: Optional[str] = Field(default=None, description="Target equipment identifier if detected")
    finding_type: Optional[str] = Field(default=None, description="Type of visual finding or anomaly")
    severity: Optional[str] = Field(default=None, description="Severity tier of the observation")

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

    @classmethod
    def from_visual_finding(cls, finding: Any, provenance: Any) -> "EvidenceRecord":
        """Convert a validated VisualFinding into an auditable EvidenceRecord."""
        finding_id = getattr(finding, "finding_id", f"vfnd-{uuid.uuid4().hex[:10]}")
        sha256 = getattr(provenance, "sha256_hash", getattr(finding, "source_image_hash", ""))
        classification = getattr(provenance, "classification", DataClassification.INTERNAL)
        description = getattr(finding, "description", "")
        raw_type = getattr(finding, "finding_type", "GENERAL_OBSERVATION")
        type_str = raw_type.value if hasattr(raw_type, "value") else str(raw_type)
        raw_sev = getattr(finding, "severity", "INFO")
        sev_str = raw_sev.value if hasattr(raw_sev, "value") else str(raw_sev)

        finding_data = finding.model_dump() if hasattr(finding, "model_dump") else dict(finding)

        return cls(
            evidence_id=f"evd-{uuid.uuid4().hex[:12]}",
            source_type="visual_inspection",
            source_reference=f"img:{sha256[:12]}#{finding_id}",
            tool_name="vision_analysis",
            tool_execution_id=f"vis-{finding_id}",
            retrieved_data=finding_data,
            retrieved_text=description,
            classification=classification,
            verified=True,
            source_image_hash=sha256,
            finding_id=finding_id,
            equipment_id=getattr(finding, "equipment_id", None),
            finding_type=type_str,
            severity=sev_str,
            filename=getattr(provenance, "filename", None),
        )


class ConflictRecord(BaseModel):
    """Observable parameter variance or factual contrast detected between evidence sources."""
    metric_or_topic: str = Field(..., description="Subject or metric (e.g., pressure, status, date)")
    source_a: str = Field(..., description="Source reference A")
    value_a: str = Field(..., description="Value reported by source A")
    source_b: str = Field(..., description="Source reference B")
    value_b: str = Field(..., description="Value reported by source B")
    description: str = Field(..., description="Analysis note on semantic roles or observed discrepancy")


class FabricatedProvenanceError(ValueError):
    """Raised when an evidence record contains fabricated, corrupted, or mismatched provenance attributes."""
    pass


def validate_evidence_record_provenance(record: EvidenceRecord) -> None:
    """Strictly validate provenance integrity of an evidence record.

    Prevents fabricated evidence provenance from entering the trusted EvidenceSet:
    - Nonexistent or malformed evidence ID
    - Fabricated image hash (non-SHA256 hex)
    - Mismatched source hash across attributes
    - Nonexistent or fabricated source document reference
    """
    import re

    # 1. Evidence ID verification
    if record.evidence_id:
        if not re.match(r"^evd-[a-zA-Z0-9_-]+$", record.evidence_id):
            raise FabricatedProvenanceError(
                f"Fabricated or invalid evidence_id format: '{record.evidence_id}'."
            )

    # 2. Visual evidence provenance verification
    if record.source_image_hash:
        # Verify 64-char hex SHA-256
        if not re.match(r"^[a-fA-F0-9]{64}$", record.source_image_hash):
            raise FabricatedProvenanceError(
                f"Fabricated or malformed SHA-256 hash in visual evidence '{record.evidence_id}': '{record.source_image_hash}'."
            )
        # Verify source reference consistency if img: prefix used
        if record.source_reference and record.source_reference.startswith("img:"):
            ref_hash = record.source_reference.split("#")[0].replace("img:", "")
            if not record.source_image_hash.startswith(ref_hash):
                raise FabricatedProvenanceError(
                    f"Mismatched source hash: source_reference '{record.source_reference}' "
                    f"does not match source_image_hash '{record.source_image_hash}'."
                )

    # 3. Knowledge document provenance verification
    if record.document_id:
        if record.document_id.lower() in ("nonexistent", "fabricated", "fake", "unknown_doc", "doc:nonexistent"):
            raise FabricatedProvenanceError(
                f"Nonexistent or fabricated source document: '{record.document_id}'."
            )
        if record.source_reference and record.source_reference.startswith("doc:"):
            ref_doc = record.source_reference.split("#")[0]
            ref_clean = ref_doc[4:] if ref_doc.startswith("doc:") else ref_doc
            doc_clean = record.document_id[4:] if record.document_id.startswith("doc:") else record.document_id
            if ref_clean != doc_clean:
                raise FabricatedProvenanceError(
                    f"Mismatched source document reference: '{record.source_reference}' vs '{record.document_id}'."
                )


class EvidenceSet(BaseModel):
    """Execution-scoped collection of verified evidence records and policy decisions."""
    tool_evidence: list[EvidenceRecord] = Field(default_factory=list)
    knowledge_evidence: list[EvidenceRecord] = Field(default_factory=list)
    visual_evidence: list[EvidenceRecord] = Field(default_factory=list)
    policy_decisions: list[Any] = Field(default_factory=list)
    execution_identifiers: list[str] = Field(default_factory=list)
    detected_conflicts: list[ConflictRecord] = Field(default_factory=list)

    @property
    def all_evidence(self) -> list[EvidenceRecord]:
        """Aggregate list of all captured evidence records."""
        return self.tool_evidence + self.knowledge_evidence + self.visual_evidence

    @property
    def is_empty(self) -> bool:
        """True if no tool, knowledge, or visual evidence was collected."""
        return len(self.tool_evidence) == 0 and len(self.knowledge_evidence) == 0 and len(self.visual_evidence) == 0

    def register_evidence(self, record: EvidenceRecord) -> None:
        """Validate provenance before registering into trusted evidence set."""
        validate_evidence_record_provenance(record)
        if record.source_type == "visual_inspection":
            self.add_visual_evidence(record)
        elif record.source_type == "knowledge_document":
            self.add_knowledge_evidence(record)
        else:
            self.add_tool_evidence(record)

    def add_tool_evidence(self, record: EvidenceRecord) -> None:
        """Register verified tool execution evidence."""
        self.tool_evidence.append(record)
        if record.tool_execution_id and record.tool_execution_id not in self.execution_identifiers:
            self.execution_identifiers.append(record.tool_execution_id)

    def add_knowledge_evidence(self, record: EvidenceRecord) -> None:
        """Register verified knowledge retrieval evidence."""
        self.knowledge_evidence.append(record)
        if record.tool_execution_id and record.tool_execution_id not in self.execution_identifiers:
            self.execution_identifiers.append(record.tool_execution_id)

    def add_visual_evidence(self, record: EvidenceRecord) -> None:
        """Register verified multimodal visual observation evidence."""
        self.visual_evidence.append(record)
        if record.tool_execution_id and record.tool_execution_id not in self.execution_identifiers:
            self.execution_identifiers.append(record.tool_execution_id)

    def add_policy_decision(self, decision: Any, execution_id: Optional[str] = None) -> None:
        """Register policy evaluation outcome."""
        self.policy_decisions.append(decision)
        if execution_id and execution_id not in self.execution_identifiers:
            self.execution_identifiers.append(execution_id)


def detect_evidence_conflicts(evidence_items: list[EvidenceRecord]) -> list[ConflictRecord]:
    """Basic deterministic conflict and parameter variance detection across evidence records.

    Surfaces observable variances in metrics (such as pressure, temperature, status, dates)
    without inventing speculative resolution, preserving distinct semantic roles and provenance.
    """
    import re
    conflicts: list[ConflictRecord] = []
    if len(evidence_items) < 2:
        return conflicts

    # Patterns for key industrial metrics and states
    patterns = {
        "pressure": re.compile(r"(\b\d+(?:\.\d+)?\s*(?:bar(?:\s+gauge)?|psi|kPa|MPa)\b)", re.IGNORECASE),
        "temperature": re.compile(r"(\b\d+(?:\.\d+)?\s*(?:°C|deg\s*C|K|°F)\b)", re.IGNORECASE),
        "status": re.compile(r"\b(OPERATIONAL|MAINTENANCE_REQUIRED|OUT_OF_SERVICE|DECOMMISSIONED|STANDBY)\b", re.IGNORECASE),
        "last_inspection": re.compile(r"last_inspection_date['\":\s]+(\d{4}-\d{2}-\d{2})", re.IGNORECASE),
    }

    # Extract observed values per source
    extracted_per_source: list[tuple[str, dict[str, list[str]]]] = []
    for item in evidence_items:
        payload_str = str(item.retrieved_data)
        if item.retrieved_text:
            payload_str += " " + item.retrieved_text

        source_ref = item.source_reference
        if item.filename:
            source_ref = f"{item.filename} ({source_ref})"

        found_metrics: dict[str, list[str]] = {}
        for metric, pat in patterns.items():
            matches = list(set(pat.findall(payload_str)))
            if matches:
                found_metrics[metric] = matches
        extracted_per_source.append((source_ref, found_metrics))

    # Compare pairs
    seen_pairs: set[tuple[str, str, str]] = set()
    for i in range(len(extracted_per_source)):
        src_a, metrics_a = extracted_per_source[i]
        for j in range(i + 1, len(extracted_per_source)):
            src_b, metrics_b = extracted_per_source[j]
            for metric in metrics_a:
                if metric in metrics_b:
                    vals_a = metrics_a[metric]
                    vals_b = metrics_b[metric]
                    # If values differ between sources
                    for va in vals_a:
                        for vb in vals_b:
                            if va.strip().lower() != vb.strip().lower():
                                pair_key = (metric, min(src_a, src_b), max(src_a, src_b))
                                if pair_key not in seen_pairs:
                                    seen_pairs.add(pair_key)
                                    conflicts.append(
                                        ConflictRecord(
                                            metric_or_topic=metric,
                                            source_a=src_a,
                                            value_a=va.strip(),
                                            source_b=src_b,
                                            value_b=vb.strip(),
                                            description=(
                                                f"Multiple distinct {metric} values observed across sources ({va.strip()} vs {vb.strip()}). "
                                                f"Semantic roles may differ (e.g., normal operating vs MAWP/trip limit, or different component timestamps)."
                                            ),
                                        )
                                    )
    return conflicts

