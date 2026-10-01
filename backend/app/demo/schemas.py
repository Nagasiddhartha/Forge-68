"""Typed schemas for FORGE Milestone 9 Demo Harness and Scenarios."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.core.schemas import AgentQueryResponse, AgentQueryStatus
from app.security.models import DataClassification, Role
from app.verification.calculations import CalculationResult
from app.vision.models import VisualFinding


class DemoScenarioId(str, Enum):
    """Typed identifiers for the four industrial demonstration scenarios."""
    R204_INVESTIGATION = "r204_investigation"
    R204_PRESSURE_VARIANCE = "r204_pressure_variance"
    POLICY_DENIAL = "policy_denial"
    PROMPT_INJECTION = "prompt_injection"


class DemoScenarioMetadata(BaseModel):
    """Declarative description and expectations for a demo scenario."""
    id: DemoScenarioId
    title: str
    description: str
    prompt: str
    role: Role
    clearance: DataClassification
    image_path: Optional[str] = None
    expected_status: AgentQueryStatus
    expected_verification: str
    highlights: List[str] = Field(default_factory=list)


class DemoRunRequest(BaseModel):
    """Payload to execute an end-to-end industrial demo mission."""
    scenario: DemoScenarioId = Field(..., description="Scenario identifier to execute")
    role: Optional[Role] = Field(default=None, description="Optional override role")
    classification: Optional[DataClassification] = Field(default=None, description="Optional override clearance")
    deterministic: bool = Field(default=True, description="Enforce deterministic sovereign execution mode")


class DemoRunResponse(AgentQueryResponse):
    """Structured response for M8 UI containing complete auditable demo trajectory."""
    scenario: DemoScenarioId
    scenario_title: str
    execution_phases: List[str] = Field(default_factory=list)
    audit_events: List[Dict[str, Any]] = Field(default_factory=list)
    security_events: List[Dict[str, Any]] = Field(default_factory=list)
    visual_findings: List[VisualFinding] = Field(default_factory=list)
    calculations: List[CalculationResult] = Field(default_factory=list)
    is_synthetic: bool = True
    synthetic_notice: str = "SYNTHETIC INDUSTRIAL TELEMETRY — AIR-GAPPED DEMONSTRATION DATA ONLY"
