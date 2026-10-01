"""FORGE Verification, Evidence, and Trust Engine Module."""

from app.verification.calculations import (
    CalculationEngine,
    CalculationRequest,
    CalculationResult,
    CalculationType,
    CorrosionProjectionInputs,
    PressureMarginInputs,
    PressureVarianceInputs,
    ThicknessLossInputs,
)
from app.verification.engine import VerificationEngine, verification_engine
from app.verification.evidence import (
    ConflictRecord,
    EvidenceRecord,
    EvidenceSet,
    detect_evidence_conflicts,
)
from app.verification.models import (
    VerificationCheck,
    VerificationResult,
    VerificationStatus,
)

__all__ = [
    "EvidenceRecord",
    "EvidenceSet",
    "ConflictRecord",
    "detect_evidence_conflicts",
    "VerificationStatus",
    "VerificationCheck",
    "VerificationResult",
    "CalculationType",
    "CalculationRequest",
    "CalculationResult",
    "CalculationEngine",
    "VerificationEngine",
    "verification_engine",
    "PressureVarianceInputs",
    "PressureMarginInputs",
    "CorrosionProjectionInputs",
    "ThicknessLossInputs",
]
