"""Verification models and data structures for FORGE Trust Engine."""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, Field

from app.verification.evidence import ConflictRecord


class VerificationStatus(str, Enum):
    """High-assurance verification assessment outcome."""
    VERIFIED = "VERIFIED"
    PARTIALLY_VERIFIED = "PARTIALLY_VERIFIED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    FAILED = "FAILED"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class VerificationCheck(BaseModel):
    """Individual deterministic audit check result."""
    check_id: str = Field(default_factory=lambda: f"chk-{uuid.uuid4().hex[:8]}")
    check_type: str = Field(..., description="Category of verification check")
    status: VerificationStatus = Field(..., description="Outcome of this specific check")
    description: str = Field(..., description="Concise explanation of check outcome")
    evidence_ids: List[str] = Field(default_factory=list, description="IDs of evidence examined")
    details: Dict[str, Any] = Field(default_factory=dict, description="Structured diagnostics")


class VerificationResult(BaseModel):
    """Complete, auditable verification outcome produced prior to model synthesis."""
    verification_id: str = Field(default_factory=lambda: f"vrf-{uuid.uuid4().hex[:10]}")
    status: VerificationStatus = Field(..., description="Overall verification status")
    checks: List[VerificationCheck] = Field(default_factory=list, description="List of discrete audit checks")
    evidence_ids: List[str] = Field(default_factory=list, description="Evidence records involved")
    calculations: List[Any] = Field(default_factory=list, description="Deterministic calculation results")
    calculation_results: List[Any] = Field(default_factory=list, description="Alias for calculation results")
    conflicts: List[ConflictRecord] = Field(default_factory=list, description="Detected parameter variances")
    summary: str = Field(..., description="High-assurance verification summary statement")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def model_post_init(self, __context: Any) -> None:
        """Keep calculations and calculation_results in sync."""
        if self.calculations and not self.calculation_results:
            self.calculation_results = self.calculations
        elif self.calculation_results and not self.calculations:
            self.calculations = self.calculation_results
