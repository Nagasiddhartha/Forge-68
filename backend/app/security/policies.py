"""Sovereign Industrial Policy Rules definition."""

from typing import List, Optional, Set
from pydantic import BaseModel, Field

from app.security.models import DataClassification, RiskLevel, Role


class PolicyRule(BaseModel):
    """Explicit permission rule within the sovereign policy gateway."""
    rule_id: str
    name: str
    description: str
    target_tool: str = Field(..., description="Tool name or wildcard '*'")
    allowed_roles: Set[Role]
    allowed_classifications: Set[DataClassification]
    max_risk_level: RiskLevel
    require_approval: bool = False
    is_active: bool = True


# Default Sovereign Industrial Policy Set
DEFAULT_POLICIES: List[PolicyRule] = [
    # POL-001: Operational equipment history inspection
    PolicyRule(
        rule_id="POL-IND-001",
        name="Equipment History Access Policy",
        description="Permits Engineers, Inspectors, and Admins to inspect equipment telemetry and maintenance history up to CONFIDENTIAL classification.",
        target_tool="equipment_history",
        allowed_roles={Role.ENGINEER, Role.INSPECTOR, Role.ADMIN},
        allowed_classifications={DataClassification.PUBLIC, DataClassification.INTERNAL, DataClassification.CONFIDENTIAL},
        max_risk_level=RiskLevel.LOW,
        require_approval=False,
    ),
    # POL-002: Critical risk operations require mandatory cryptographic/human approval
    PolicyRule(
        rule_id="POL-CRIT-001",
        name="Critical Risk Actuation Approval Policy",
        description="Enforces mandatory supervisor approval for any critical-risk tools or operations by Engineers and Admins.",
        target_tool="emergency_valve_actuation",
        allowed_roles={Role.ENGINEER, Role.ADMIN, Role.SECURITY_OFFICER},
        allowed_classifications={DataClassification.INTERNAL, DataClassification.RESTRICTED, DataClassification.CRITICAL},
        max_risk_level=RiskLevel.CRITICAL,
        require_approval=True,
    ),
]
