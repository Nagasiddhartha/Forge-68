"""Evidence representation and verified artifact capture for FORGE."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from app.security.models import DataClassification


class EvidenceRecord(BaseModel):
    """Structured evidence item captured from an authorized tool execution."""
    evidence_id: str = Field(default_factory=lambda: f"evd-{uuid.uuid4().hex[:12]}")
    source_type: str = Field(
        default="LOCAL_INDUSTRIAL_TOOL",
        description="Origin source category (e.g., LOCAL_INDUSTRIAL_TOOL, AIRGAP_TELEMETRY)"
    )
    source_reference: str = Field(
        ...,
        description="Reference identifier of the source (e.g., tool:equipment_history)"
    )
    tool_name: str = Field(..., description="Name of the executed tool")
    tool_execution_id: str = Field(..., description="Audit event identifier of the execution")
    retrieved_data: Any = Field(..., description="Verified tool response data")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    classification: DataClassification = Field(
        default=DataClassification.INTERNAL,
        description="Data classification level of the evidence payload"
    )
    verified: bool = Field(default=True, description="Whether this record was verified by policy and schema guards")
