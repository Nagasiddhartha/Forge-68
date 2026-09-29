"""Structured schemas for model decision extraction and agent queries."""

from enum import Enum
import re
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field, model_validator

from app.security.models import DataClassification, PolicyDecision, Role
from app.verification.evidence import EvidenceRecord


class ModelActionType(str, Enum):
    """Action category determined by the reasoning model."""
    TOOL_CALL = "tool_call"
    FINAL = "final"


class ModelToolDecision(BaseModel):
    """Structured, machine-readable tool call or final answer requested by local model."""
    action: ModelActionType
    tool_name: Optional[str] = None
    arguments: Dict[str, Any] = Field(default_factory=dict)
    reason: Optional[str] = None
    answer: Optional[str] = None

    @model_validator(mode="after")
    def validate_action_fields(self) -> "ModelToolDecision":
        if self.action == ModelActionType.TOOL_CALL:
            if not self.tool_name or not self.tool_name.strip():
                raise ValueError("tool_name is required when action is 'tool_call'.")
            if not self.reason or not self.reason.strip():
                raise ValueError("reason is required when action is 'tool_call'.")
            
            # Security guard against code injection in arguments
            self._validate_no_code_injection(self.arguments)

        elif self.action == ModelActionType.FINAL:
            if not self.answer or not self.answer.strip():
                raise ValueError("answer is required when action is 'final'.")

        return self

    @staticmethod
    def _validate_no_code_injection(args: Any) -> None:
        """Reject arbitrary Python, shell commands, or code execution patterns in tool arguments."""
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
        text_repr = str(args)
        for pattern in forbidden_patterns:
            if re.search(pattern, text_repr, re.IGNORECASE):
                raise ValueError(
                    f"Security Exception: Suspicious code or shell execution pattern detected in arguments: '{pattern}'."
                )


class AgentQueryStatus(str, Enum):
    """Overall status of the agent query execution loop."""
    SUCCESS = "SUCCESS"
    POLICY_DENIED = "POLICY_DENIED"
    TOOL_ERROR = "TOOL_ERROR"
    DIRECT_ANSWER = "DIRECT_ANSWER"
    INVALID_MODEL_OUTPUT = "INVALID_MODEL_OUTPUT"


class AgentQueryRequest(BaseModel):
    """User or system request to the sovereign agent reasoning loop."""
    query: str = Field(..., description="Industrial operational or maintenance inquiry")
    role: Role = Field(default=Role.ENGINEER, description="Role context of the requester")
    requester: str = Field(default="engineer_operator", description="Identity of requester")
    classification: DataClassification = Field(
        default=DataClassification.INTERNAL,
        description="Data classification level of the query context"
    )
    has_approval: bool = Field(default=False, description="Whether human/supervisor approval is present")


class AgentQueryResponse(BaseModel):
    """Complete, auditable trace of the model-to-tool reasoning and evidence loop."""
    query: str
    final_answer: str
    tool_call: Optional[Dict[str, Any]] = None
    policy_decision: Optional[PolicyDecision] = None
    tool_result: Optional[Dict[str, Any]] = None
    evidence: Optional[EvidenceRecord] = None
    execution_event_id: Optional[str] = None
    status: AgentQueryStatus
