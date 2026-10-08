"""Deliverable orchestration service for FORGE Control Plane."""

import datetime
import hashlib
import logging
from pathlib import Path
import time
from typing import Any, Dict, List, Optional
import uuid

from app.config import settings
from app.core.schemas import AgentQueryResponse
from app.deliverables.docx_generator import generate_mrpl_approval_docx
from app.deliverables.schemas import (
    ApprovalNoteRequest,
    ApprovalNoteResponse,
    DeliverableMetadata,
    DeliverableType,
)
from app.demo.schemas import DemoRunResponse
from app.tools.industrial.equipment import SYNTHETIC_EQUIPMENT_DATA

logger = logging.getLogger("forge.deliverables.service")
logger.setLevel(logging.INFO)

DELIVERABLES_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "deliverables"


class DeliverableService:
    """Manages creation, indexing, and serving of formal sovereign deliverables."""

    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = storage_dir or DELIVERABLES_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._registry: Dict[str, DeliverableMetadata] = {}

    def _cleanup_old_files(self, max_age_seconds: int = 86400) -> None:
        """Purge temporary generated deliverables older than 24 hours."""
        now = time.time()
        for f in self.storage_dir.glob("*.docx"):
            try:
                if (now - f.stat().st_mtime) > max_age_seconds:
                    f.unlink()
            except Exception:
                pass

    def create_approval_note(self, request: ApprovalNoteRequest) -> ApprovalNoteResponse:
        """Generate a formal MRPL Approval Note from query or demo execution context."""
        self._cleanup_old_files()

        asset_id = (request.asset_id or "R-204").upper()
        query = request.query or f"Operational Condition Investigation for Asset {asset_id}"
        role_str = request.role.value if hasattr(request.role, "value") else str(request.role)
        requester = request.requester or "engineer_operator"
        classification_str = request.classification.value if hasattr(request.classification, "value") else str(request.classification)
        locale = request.locale or "en"

        verdict = "VERIFIED"
        checks: List[Dict[str, Any]] = []
        calculations: List[Dict[str, Any]] = []
        evidence_records: List[Dict[str, Any]] = []
        telemetry: Optional[Dict[str, Any]] = None

        # 1. Extract from AgentQueryResponse if available
        if request.agent_response:
            resp: AgentQueryResponse = request.agent_response
            if resp.verification:
                verdict = resp.verification.status.value
                checks = [c.model_dump() for c in resp.verification.checks]
                calculations = [calc.model_dump() for calc in (resp.verification.calculations or resp.verification.calculation_results or [])]
            if resp.evidence_set:
                for e in resp.evidence_set.all_evidence:
                    evidence_records.append(e.model_dump())
            if resp.tool_result and isinstance(resp.tool_result, dict):
                telemetry = resp.tool_result

        # 2. Extract from DemoRunResponse if available
        elif request.demo_response:
            demo: DemoRunResponse = request.demo_response
            if demo.verification:
                verdict = demo.verification.status.value
                checks = [c.model_dump() for c in demo.verification.checks]
                calculations = [calc.model_dump() for calc in (demo.verification.calculations or demo.verification.calculation_results or [])]
            if demo.evidence_records:
                evidence_records = [e.model_dump() for e in demo.evidence_records]
            if demo.tool_result and isinstance(demo.tool_result, dict):
                telemetry = demo.tool_result

        # 3. Fallback to synthetic telemetry for registered asset
        if not telemetry and asset_id in SYNTHETIC_EQUIPMENT_DATA:
            telemetry = SYNTHETIC_EQUIPMENT_DATA[asset_id]

        docx_bytes = generate_mrpl_approval_docx(
            query=query,
            asset_id=asset_id,
            role=role_str,
            requester=requester,
            classification=classification_str,
            verification_verdict=verdict,
            checks=checks,
            calculations=calculations,
            evidence_records=evidence_records,
            telemetry_data=telemetry,
            locale=locale,
        )

        file_id = str(uuid.uuid4())
        timestamp_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"MRPL_Approval_Note_{asset_id}_{timestamp_str}.docx"
        file_path = self.storage_dir / f"{file_id}.docx"

        file_path.write_bytes(docx_bytes)
        sha256_hash = hashlib.sha256(docx_bytes).hexdigest()

        meta = DeliverableMetadata(
            file_id=file_id,
            filename=filename,
            file_path=str(file_path),
            deliverable_type=DeliverableType.MRPL_APPROVAL_NOTE,
            created_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            size_bytes=len(docx_bytes),
            sha256_hash=sha256_hash,
            asset_id=asset_id,
            verification_verdict=verdict,
        )
        self._registry[file_id] = meta

        logger.info("[DELIVERABLE_CREATED] File ID: %s | Asset: %s | Size: %d B | SHA-256: %s", file_id, asset_id, len(docx_bytes), sha256_hash[:16])

        return ApprovalNoteResponse(
            status="SUCCESS",
            file_id=file_id,
            filename=filename,
            download_url=f"/api/v1/deliverables/download/{file_id}",
            deliverable_type=DeliverableType.MRPL_APPROVAL_NOTE,
            asset_id=asset_id,
            sha256_hash=sha256_hash,
            file_size_bytes=len(docx_bytes),
            created_at=meta.created_at,
            verification_verdict=verdict,
        )

    def get_deliverable_metadata(self, file_id: str) -> Optional[DeliverableMetadata]:
        """Fetch metadata for a generated deliverable."""
        return self._registry.get(file_id)

    def get_deliverable_file(self, file_id: str) -> Optional[Path]:
        """Resolve and validate deliverable file path on disk."""
        target = self.storage_dir / f"{file_id}.docx"
        if target.exists() and target.is_file():
            return target
        return None


deliverable_service = DeliverableService()
