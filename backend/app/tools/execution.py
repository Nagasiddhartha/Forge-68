"""Safe Execution Pipeline enforcing the Sovereign Model Execution Boundary.

Pipeline:
Model / Agent
    ↓
Structured Tool Request (ToolInvocationRequest)
    ↓
Policy Gateway (evaluate)
    ↓
Tool Registry (validate schema)
    ↓
Approved Tool Handler
    ↓
Tool Execution Result
"""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from app.security.events import ExecutionStatus, audit_event_sink
from app.security.gateway import PolicyGateway, policy_gateway
from app.security.models import (
    DataClassification,
    PolicyDecision,
    PolicyDecisionType,
    PolicyEvaluationRequest,
    Role,
)
from app.tools.registry import ToolRegistry, tool_registry


class ToolInvocationRequest(BaseModel):
    """Structured tool call requested by an AI agent or human operator."""
    requester: str = Field(default="agent:qwen3:8b", description="Agent ID, operator tag, or caller identity")
    role: Role = Field(default=Role.ENGINEER, description="Role context of the requester")
    tool_name: str = Field(..., description="Target registered tool name")
    classification: DataClassification = Field(
        default=DataClassification.INTERNAL,
        description="Data classification level for the execution context"
    )
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Typed tool parameters")
    has_approval: bool = Field(default=False, description="Cryptographic or supervisor approval flag")


class ToolExecutionResult(BaseModel):
    """Execution response containing policy decision, execution status, and verified tool output."""
    success: bool
    decision: PolicyDecision
    event_id: str
    data: Optional[Any] = None
    error: Optional[str] = None


def execute_tool_with_policy(
    request: ToolInvocationRequest,
    gateway: Optional[PolicyGateway] = None,
    registry: Optional[ToolRegistry] = None,
) -> ToolExecutionResult:
    """Enforce mandatory policy verification before invoking any registered tool handler."""
    gw = gateway or policy_gateway
    reg = registry or tool_registry

    # 1. Mandatory Policy Evaluation
    eval_req = PolicyEvaluationRequest(
        requester=request.requester,
        role=request.role,
        tool_name=request.tool_name,
        classification=request.classification,
        parameters=request.parameters,
        has_approval=request.has_approval,
    )
    decision = gw.evaluate(eval_req)

    # Fetch latest audit event recorded by policy gateway
    events = audit_event_sink.get_events(limit=1)
    event_id = events[0].event_id if events else "evt-unknown"

    # 2. FAIL-CLOSED / DEFAULT-DENY: If denied, the tool handler is NEVER invoked
    if decision.decision == PolicyDecisionType.DENY:
        return ToolExecutionResult(
            success=False,
            decision=decision,
            event_id=event_id,
            data=None,
            error=decision.reason,
        )

    # 3. Approved Execution
    try:
        raw_result = reg.execute_tool(request.tool_name, request.parameters)
        result_data = raw_result.model_dump() if hasattr(raw_result, "model_dump") else raw_result

        # Update event record if present
        if events:
            events[0].execution_status = ExecutionStatus.EXECUTED
            events[0].output_summary = f"Success: {type(raw_result).__name__}"

        return ToolExecutionResult(
            success=True,
            decision=decision,
            event_id=event_id,
            data=result_data,
            error=None,
        )
    except Exception as exc:
        if events:
            events[0].execution_status = ExecutionStatus.FAILED
            events[0].output_summary = f"Execution error: {str(exc)}"

        return ToolExecutionResult(
            success=False,
            decision=decision,
            event_id=event_id,
            data=None,
            error=f"Tool execution failed: {str(exc)}",
        )
