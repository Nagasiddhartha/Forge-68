"""FORGE Core Agent Orchestration and Control Plane Module."""

from app.core.prompts import (
    AGENT_PLAN_SYSTEM_PROMPT,
    GROUNDED_RESPONSE_SYSTEM_PROMPT,
    TOOL_DECISION_SYSTEM_PROMPT,
    UNIFIED_GROUNDED_SYNTHESIS_SYSTEM_PROMPT,
    build_tools_catalog_description,
    parse_agent_plan,
    parse_model_decision,
)
from app.core.reasoning import AgentReasoningService, agent_reasoning_service
from app.core.schemas import (
    AgentActionType,
    AgentPlan,
    AgentQueryRequest,
    AgentQueryResponse,
    AgentQueryStatus,
    KnowledgeQueryPlan,
    ModelActionType,
    ModelToolDecision,
    ToolCallPlan,
)

__all__ = [
    "AgentReasoningService",
    "agent_reasoning_service",
    "AgentQueryRequest",
    "AgentQueryResponse",
    "AgentQueryStatus",
    "ModelActionType",
    "ModelToolDecision",
    "AgentActionType",
    "AgentPlan",
    "KnowledgeQueryPlan",
    "ToolCallPlan",
    "TOOL_DECISION_SYSTEM_PROMPT",
    "GROUNDED_RESPONSE_SYSTEM_PROMPT",
    "AGENT_PLAN_SYSTEM_PROMPT",
    "UNIFIED_GROUNDED_SYNTHESIS_SYSTEM_PROMPT",
    "build_tools_catalog_description",
    "parse_agent_plan",
    "parse_model_decision",
]
