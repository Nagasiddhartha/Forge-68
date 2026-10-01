"""Typed Pydantic schemas for Multimodal Engineering Intelligence."""

from datetime import datetime, timezone
from enum import Enum
import re
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, Field, field_validator, model_validator

from app.security.models import DataClassification, Role


def validate_no_injection_text(text: Optional[str], field_name: str = "field") -> None:
    """Reject code execution, shell injection, or prompt bypass patterns."""
    if not text:
        return
    forbidden_patterns = [
        r"__import__",
        r"\beval\s*\(",
        r"\bexec\s*\(",
        r"\bos\.system\b",
        r"\bsubprocess\b",
        r"\bsh\s+-c\b",
        r"\bbash\s+-c\b",
        r"\bpowershell\b",
        r"<script\b",
    ]
    for pattern in forbidden_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            raise ValueError(
                f"Security Exception: Suspicious executable code or command pattern detected in {field_name}: '{pattern}'."
            )


class FindingType(str, Enum):
    """Categorization of visual observation in industrial asset inspection."""
    CORROSION = "CORROSION"
    LEAK = "LEAK"
    CRACK = "CRACK"
    PRESSURE_GAUGE_READING = "PRESSURE_GAUGE_READING"
    TEMPERATURE_GAUGE_READING = "TEMPERATURE_GAUGE_READING"
    VALVE_STATE = "VALVE_STATE"
    EQUIPMENT_TAG = "EQUIPMENT_TAG"
    WELD_DEFECT = "WELD_DEFECT"
    STRUCTURAL_ANOMALY = "STRUCTURAL_ANOMALY"
    GENERAL_OBSERVATION = "GENERAL_OBSERVATION"


class SeverityLevel(str, Enum):
    """Visual observation anomaly severity."""
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ImageProvenance(BaseModel):
    """Immutable provenance metadata for ingested engineering imagery."""
    image_id: str = Field(default_factory=lambda: f"img-{uuid.uuid4().hex[:12]}")
    filename: str = Field(..., description="Original image filename")
    mime_type: str = Field(..., description="Verified image MIME type (image/png, image/jpeg, image/webp)")
    file_size_bytes: int = Field(..., ge=0, description="Image payload size in bytes")
    sha256_hash: str = Field(..., description="Cryptographic SHA-256 digest of image content")
    classification: DataClassification = Field(
        default=DataClassification.INTERNAL,
        description="Data classification level of the imagery"
    )
    ingested_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    width: Optional[int] = Field(default=None, description="Image width in pixels")
    height: Optional[int] = Field(default=None, description="Image height in pixels")


class VisualProvenance(BaseModel):
    """Source binding linking a visual finding to its specific originating image artifact."""
    image_hash: str = Field(..., description="SHA-256 hash of the analyzed source image")
    image_filename: str = Field(..., description="Source image filename")
    bounding_box: Optional[Dict[str, float]] = Field(
        default=None,
        description="Normalized coordinates (x_min, y_min, x_max, y_max) if visual region is localized"
    )
    location_notes: Optional[str] = Field(default=None, description="Spatial or component contextual notes")
    observer_model: str = Field(..., description="Sovereign vision model identifier that produced the observation")

    @field_validator("location_notes")
    @classmethod
    def validate_location_notes(cls, v: Optional[str]) -> Optional[str]:
        validate_no_injection_text(v, "location_notes")
        return v


class VisualFinding(BaseModel):
    """Structured, validated empirical observation from engineering image analysis.
    
    The vision model acts strictly as an empirical OBSERVER, not a final engineering verifier.
    It reports physical measurements and defect indications without declaring equipment safe/unsafe.
    """
    finding_id: str = Field(default_factory=lambda: f"vfnd-{uuid.uuid4().hex[:10]}")
    finding_type: FindingType = Field(..., description="Type of visual anomaly or metric observed")
    description: str = Field(..., description="Empirical visual observation description")
    equipment_id: Optional[str] = Field(default=None, description="Identified equipment identifier (e.g. R-204, P-201)")
    location: Optional[str] = Field(default=None, description="Specific location on equipment (e.g. nozzle N2, dial face)")
    severity: SeverityLevel = Field(default=SeverityLevel.INFO, description="Defect severity or observation importance")
    observed_value: Optional[float] = Field(default=None, description="Extracted numerical metric value if applicable")
    unit: Optional[str] = Field(default=None, description="Unit of measurement (bar, mm, degC, etc.)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score (0.0 to 1.0)")
    source_image_hash: str = Field(..., description="Cryptographic hash of the source image")
    provenance: VisualProvenance = Field(..., description="Verifiable image provenance link")
    raw_observation: Optional[str] = Field(default=None, description="Original descriptive text excerpt")

    @field_validator("description", "location", "raw_observation")
    @classmethod
    def check_for_injection(cls, v: Optional[str]) -> Optional[str]:
        validate_no_injection_text(v, "visual finding text")
        return v

    @model_validator(mode="after")
    def validate_provenance_and_role_boundaries(self) -> "VisualFinding":
        # 1. Provenance consistency check
        if self.source_image_hash != self.provenance.image_hash:
            raise ValueError(
                f"Provenance integrity violation: source_image_hash '{self.source_image_hash}' "
                f"does not match provenance.image_hash '{self.provenance.image_hash}'."
            )

        # 2. Bounded Observer Principle: The vision model must not assert final safety clearance verdicts
        combined_text = f"{self.description} {self.raw_observation or ''}".lower()
        forbidden_conclusions = [
            "equipment is verified safe to operate",
            "certified operational clearance",
            "overriding safety shutdown",
            "authorizing full pressure",
            "bypass policy gateway",
        ]
        for phrase in forbidden_conclusions:
            if phrase in combined_text:
                raise ValueError(
                    f"Observer boundary violation: Vision model cannot assert final safety authorizations: '{phrase}'."
                )

        return self


# =========================================================================
# API Request & Response Schemas
# =========================================================================

class VisionAnalyzeRequest(BaseModel):
    """Payload to request local multimodal engineering analysis."""
    image_path: Optional[str] = Field(default=None, description="Path to image within sovereign image base directory")
    image_base64: Optional[str] = Field(default=None, description="Base64 encoded image content for in-memory upload")
    filename: Optional[str] = Field(default="uploaded_image.png", description="Image filename identifier")
    equipment_id: Optional[str] = Field(default=None, description="Target equipment context if known")
    prompt: Optional[str] = Field(default=None, description="Specific inspection or extraction instructions")
    classification: DataClassification = Field(
        default=DataClassification.INTERNAL,
        description="Data classification level of the imagery"
    )
    role: Role = Field(default=Role.ENGINEER, description="Role context of the requester")
    requester: str = Field(default="engineer_operator", description="Identifier of the requester")
    has_approval: bool = Field(default=False, description="Whether supervisory approval is present")


class VisionAnalyzeResponse(BaseModel):
    """Structured response from multimodal engineering intelligence analysis."""
    status: str = Field(..., description="Overall analysis outcome (SUCCESS, ERROR, etc.)")
    image_provenance: ImageProvenance
    findings: List[VisualFinding] = Field(default_factory=list)
    evidence_records: List[Any] = Field(default_factory=list, description="EvidenceRecords generated from findings")
    model_metadata: Dict[str, Any] = Field(default_factory=dict)
    classification: DataClassification
    verification: Optional[Any] = Field(default=None, description="VerificationResult if verified against limits")
