"""Schemas for formal engineering deliverable generation."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.core.schemas import AgentQueryResponse
from app.demo.schemas import DemoRunResponse
from app.security.models import DataClassification, Role


class DeliverableType(str, Enum):
    """Type of engineering deliverable document."""
    MRPL_APPROVAL_NOTE = "MRPL_APPROVAL_NOTE"
    INSPECTION_DOSSIER = "INSPECTION_DOSSIER"


class ApprovalNoteRequest(BaseModel):
    """Request payload to generate a formal MRPL Approval Note (.docx)."""
    query: Optional[str] = Field(default="Reactor R-204 Operating Condition Investigation", description="Original engineering inquiry")
    asset_id: Optional[str] = Field(default="R-204", description="Target industrial equipment identifier")
    role: Role = Field(default=Role.ENGINEER, description="Role of requesting authority")
    requester: str = Field(default="engineer_operator", description="Identity of requester")
    classification: DataClassification = Field(default=DataClassification.CONFIDENTIAL, description="Clearance classification")
    locale: Optional[str] = Field(default="en", description="Document locale: en, hi, kn")
    agent_response: Optional[AgentQueryResponse] = Field(default=None, description="Optional agent query response trace")
    demo_response: Optional[DemoRunResponse] = Field(default=None, description="Optional demo execution response trace")


class DeliverableMetadata(BaseModel):
    """Metadata describing a generated engineering deliverable file."""
    file_id: str
    filename: str
    file_path: str
    deliverable_type: DeliverableType
    created_at: str
    size_bytes: int
    sha256_hash: str
    asset_id: str
    verification_verdict: str


class ApprovalNoteResponse(BaseModel):
    """Response returned upon successful deliverable generation."""
    status: str = "SUCCESS"
    file_id: str
    filename: str
    download_url: str
    deliverable_type: DeliverableType
    asset_id: str
    sha256_hash: str
    file_size_bytes: int
    created_at: str
    verification_verdict: str
