"""Model-to-Tool Reasoning and Evidence Loop Orchestration Service.

Execution Flow:
User Request
    ↓
Local Qwen3 8B (Phase 1: Tool Decision)
    ↓
Structured Tool Request (Pydantic validated)
    ↓
FORGE Policy Gateway (DEFAULT-DENY Evaluation)
    ↓
Tool Registry (Schema validation & execution)
    ↓
Tool Result
    ↓
Evidence Event (EvidenceRecord creation)
    ↓
Local Qwen3 8B (Phase 2: Evidence-Grounded Synthesis)
    ↓
Evidence-Grounded Final Response
"""

import json
import logging
from typing import Optional

from app.core.prompts import (
    GROUNDED_RESPONSE_SYSTEM_PROMPT,
    TOOL_DECISION_SYSTEM_PROMPT,
    build_tools_catalog_description,
    parse_model_decision,
)
from app.core.schemas import (
    AgentQueryRequest,
    AgentQueryResponse,
    AgentQueryStatus,
    ModelActionType,
)
from app.models import BaseModelProvider, ModelMessage, ModelRequest, get_model_provider
from app.security import PolicyDecisionType, PolicyGateway, policy_gateway
from app.tools import (
    ToolInvocationRequest,
    ToolRegistry,
    execute_tool_with_policy,
    tool_registry,
)
from app.verification.evidence import EvidenceRecord

logger = logging.getLogger("forge.core.reasoning")
logger.setLevel(logging.INFO)


class AgentReasoningService:
    """Orchestrates sovereign model-to-tool reasoning through the mandatory policy boundary."""

    def __init__(
        self,
        model_provider: Optional[BaseModelProvider] = None,
        gateway: Optional[PolicyGateway] = None,
        registry: Optional[ToolRegistry] = None,
    ):
        self.model_provider = model_provider or get_model_provider()
        self.policy_gateway = gateway or policy_gateway
        self.tool_registry = registry or tool_registry

    async def process_query(self, request: AgentQueryRequest) -> AgentQueryResponse:
        """Execute the end-to-end sovereign reasoning and evidence pipeline."""
        # Step 1: Log initial user request
        logger.info(
            "[MODEL_REQUEST] User Query: '%s' | Role: '%s' | Requester: '%s'",
            request.query,
            request.role.value,
            request.requester,
        )

        # Step 2: Query local model for structured tool decision
        tools_metadata = self.tool_registry.list_tools()
        tools_catalog = build_tools_catalog_description(tools_metadata)
        decision_prompt = TOOL_DECISION_SYSTEM_PROMPT.format(tools_catalog=tools_catalog)

        decision_request = ModelRequest(
            messages=[
                ModelMessage(role="system", content=decision_prompt),
                ModelMessage(role="user", content=request.query),
            ],
            temperature=0.0,
            format="json",
        )

        model_resp = await self.model_provider.generate(decision_request)

        # Step 3: Parse and validate model tool decision
        try:
            decision = parse_model_decision(model_resp.content)
        except Exception as exc:
            logger.warning("[MODEL_PARSING_FAILED] Error: %s", str(exc))
            return AgentQueryResponse(
                query=request.query,
                final_answer=f"Failed to parse structured model decision: {str(exc)}",
                status=AgentQueryStatus.INVALID_MODEL_OUTPUT,
            )

        # Step 4: Handle direct answer (no tool needed)
        if decision.action == ModelActionType.FINAL:
            logger.info("[MODEL_DIRECT_ANSWER] Generated direct response without tool invocation.")
            return AgentQueryResponse(
                query=request.query,
                final_answer=decision.answer or "",
                status=AgentQueryStatus.DIRECT_ANSWER,
            )

        # Step 5: Model requested a tool call
        logger.info(
            "[TOOL_REQUEST] Tool: '%s' | Arguments: %s | Reason: '%s'",
            decision.tool_name,
            json.dumps(decision.arguments),
            decision.reason,
        )

        # Construct ToolInvocationRequest
        tool_invoc_req = ToolInvocationRequest(
            requester=request.requester,
            role=request.role,
            tool_name=decision.tool_name,  # type: ignore[arg-type]
            classification=request.classification,
            parameters=decision.arguments,
            has_approval=request.has_approval,
        )

        # Step 6: Execute via MANDATORY Policy Gateway & Tool Registry boundary
        exec_result = execute_tool_with_policy(
            tool_invoc_req,
            gateway=self.policy_gateway,
            registry=self.tool_registry,
        )

        # Step 7: Log Policy Evaluation
        logger.info(
            "[POLICY_EVALUATION] Decision: '%s' | Policy ID: '%s' | Reason: '%s'",
            exec_result.decision.decision.value,
            exec_result.decision.policy_id or "NONE",
            exec_result.decision.reason,
        )

        # Handle Policy Denial
        if exec_result.decision.decision == PolicyDecisionType.DENY:
            logger.warning(
                "[TOOL_EXECUTION_BLOCKED] Policy denied tool '%s': %s",
                decision.tool_name,
                exec_result.decision.reason,
            )
            return AgentQueryResponse(
                query=request.query,
                final_answer=f"Execution blocked by sovereign policy: {exec_result.decision.reason}",
                tool_call=decision.model_dump(),
                policy_decision=exec_result.decision,
                tool_result=None,
                evidence=None,
                execution_event_id=exec_result.event_id,
                status=AgentQueryStatus.POLICY_DENIED,
            )

        # Handle Execution Errors
        if not exec_result.success:
            logger.error(
                "[TOOL_EXECUTION_FAILED] Tool '%s' execution error: %s",
                decision.tool_name,
                exec_result.error,
            )
            return AgentQueryResponse(
                query=request.query,
                final_answer=f"Industrial tool execution failed: {exec_result.error}",
                tool_call=decision.model_dump(),
                policy_decision=exec_result.decision,
                tool_result=None,
                evidence=None,
                execution_event_id=exec_result.event_id,
                status=AgentQueryStatus.TOOL_ERROR,
            )

        # Step 8: Log Successful Tool Execution
        logger.info("[TOOL_EXECUTION] Tool '%s' executed successfully.", decision.tool_name)

        # Step 9: Create Evidence Record
        evidence = EvidenceRecord(
            source_type="LOCAL_INDUSTRIAL_TOOL",
            source_reference=f"tool:{decision.tool_name}",
            tool_name=decision.tool_name,  # type: ignore[arg-type]
            tool_execution_id=exec_result.event_id,
            retrieved_data=exec_result.data,
            classification=request.classification,
        )
        logger.info(
            "[EVIDENCE_CREATED] Evidence ID: '%s' | Source: '%s'",
            evidence.evidence_id,
            evidence.source_reference,
        )

        # Step 10: Grounded Second Model Pass
        grounding_prompt = GROUNDED_RESPONSE_SYSTEM_PROMPT.format(
            evidence_id=evidence.evidence_id,
            source_reference=evidence.source_reference,
            classification=evidence.classification.value,
            tool_name=evidence.tool_name,
            retrieved_data=json.dumps(evidence.retrieved_data, indent=2),
        )

        grounding_request = ModelRequest(
            messages=[
                ModelMessage(role="system", content=grounding_prompt),
                ModelMessage(role="user", content=request.query),
            ],
            temperature=0.2,
        )

        grounded_resp = await self.model_provider.generate(grounding_request)
        logger.info("[MODEL_GROUNDED_RESPONSE] Synthesized final evidence-grounded response.")

        return AgentQueryResponse(
            query=request.query,
            final_answer=grounded_resp.content,
            tool_call=decision.model_dump(),
            policy_decision=exec_result.decision,
            tool_result=exec_result.data if isinstance(exec_result.data, dict) else {"data": exec_result.data},
            evidence=evidence,
            execution_event_id=exec_result.event_id,
            status=AgentQueryStatus.SUCCESS,
        )


# Global default service instance
agent_reasoning_service = AgentReasoningService()
