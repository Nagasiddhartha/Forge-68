"""Unified Evidence-Grounded Agent Reasoning Service.

Executes the unified sovereign workflow:
User Request
     ↓
Local Qwen3 (Planning Stage)
     ↓
Structured Agent Plan (AgentPlan: direct / knowledge / tool / combined)
     │
     ├──────────────→ Direct Answer
     │
     ├──────────────→ Knowledge Retrieval
     │                    ↓
     │                Classification/Clearance Guard
     │                    ↓
     │                Knowledge Evidence
     │
     ├──────────────→ Industrial Tool Execution
     │                    ↓
     │                Policy Gateway (DEFAULT-DENY)
     │                    ↓
     │                Tool Result
     │                    ↓
     │                Tool Evidence
     │
     └──────────────→ Combined Execution
                          ↓
                    Unified EvidenceSet
                          ↓
                    Parameter Variance / Conflict Analysis
                          ↓
                    Local Qwen3 (Evidence-Grounded Synthesis)
                          ↓
                    Final Response
"""

import json
import logging
from typing import Any, Dict, List, Optional

from app.core.prompts import (
    AGENT_PLAN_SYSTEM_PROMPT,
    UNIFIED_GROUNDED_SYNTHESIS_SYSTEM_PROMPT,
    build_tools_catalog_description,
    parse_agent_plan,
)
from app.core.schemas import (
    AgentActionType,
    AgentPlan,
    AgentQueryRequest,
    AgentQueryResponse,
    AgentQueryStatus,
)
from app.knowledge import KnowledgeService, knowledge_service
from app.knowledge.index import CLASSIFICATION_LEVELS
from app.models import BaseModelProvider, ModelMessage, ModelRequest, get_model_provider
from app.security import (
    AgentEventType,
    AgentTraceEvent,
    DataClassification,
    PolicyDecisionType,
    PolicyGateway,
    audit_event_sink,
    policy_gateway,
)
from app.tools import (
    ToolInvocationRequest,
    ToolRegistry,
    execute_tool_with_policy,
    tool_registry,
)
from app.verification import (
    EvidenceRecord,
    EvidenceSet,
    detect_evidence_conflicts,
)

logger = logging.getLogger("forge.core.reasoning")
logger.setLevel(logging.INFO)


class AgentReasoningService:
    """Orchestrates sovereign reasoning, knowledge retrieval, and tool execution through policy boundaries."""

    def __init__(
        self,
        model_provider: Optional[BaseModelProvider] = None,
        gateway: Optional[PolicyGateway] = None,
        registry: Optional[ToolRegistry] = None,
        knowledge: Optional[KnowledgeService] = None,
    ):
        self.model_provider = model_provider or get_model_provider()
        self.policy_gateway = gateway or policy_gateway
        self.tool_registry = registry or tool_registry
        self.knowledge_service = knowledge or knowledge_service

    async def process_query(self, request: AgentQueryRequest) -> AgentQueryResponse:
        """Execute the unified, sovereign, evidence-grounded agent workflow."""
        # 1. Structured trace & log: AGENT_REQUEST
        logger.info(
            "[AGENT_REQUEST] Query: '%s' | Requester: '%s' | Role: '%s' | Clearance: '%s'",
            request.query,
            request.requester,
            request.role.value,
            request.classification.value,
        )
        audit_event_sink.record_agent_event(
            AgentTraceEvent(
                event_type=AgentEventType.AGENT_REQUEST,
                requester=request.requester,
                role=request.role,
                details={
                    "query": request.query,
                    "classification": request.classification.value,
                    "has_approval": request.has_approval,
                },
            )
        )

        # 2. Plan Generation: Model proposes an operational AgentPlan
        tools_metadata = self.tool_registry.list_tools()
        tools_catalog = build_tools_catalog_description(tools_metadata)
        planning_prompt = AGENT_PLAN_SYSTEM_PROMPT.format(tools_catalog=tools_catalog)

        plan_request = ModelRequest(
            messages=[
                ModelMessage(role="system", content=planning_prompt),
                ModelMessage(role="user", content=request.query),
            ],
            temperature=0.0,
            format="json",
        )

        model_resp = await self.model_provider.generate(plan_request)

        # 3. Parse and defensively validate the AgentPlan
        try:
            plan: AgentPlan = parse_agent_plan(model_resp.content)
        except Exception as exc:
            logger.warning("[AGENT_PLAN_FAILED] Malformed agent plan: %s", str(exc))
            return AgentQueryResponse(
                query=request.query,
                final_answer=f"Failed to parse structured model decision: {str(exc)}",
                status=AgentQueryStatus.INVALID_MODEL_OUTPUT,
            )

        logger.info(
            "[AGENT_PLAN_CREATED] Action: '%s' | Queries: %d | Tools: %d | Reasoning: '%s'",
            plan.action.value,
            len(plan.knowledge_queries),
            len(plan.tool_calls),
            plan.reasoning or "None",
        )
        audit_event_sink.record_agent_event(
            AgentTraceEvent(
                event_type=AgentEventType.AGENT_PLAN_CREATED,
                requester=request.requester,
                role=request.role,
                details=plan.model_dump(),
            )
        )

        # 4. Handle Direct Action
        if plan.action == AgentActionType.DIRECT:
            final_answer = plan.direct_answer or plan.reasoning or ""
            if not final_answer.strip():
                # Generate direct response via local model
                direct_req = ModelRequest(
                    messages=[
                        ModelMessage(
                            role="system",
                            content=(
                                "You are the reasoning engine of FORGE Sovereign Industrial AI Control Plane. "
                                "Provide a direct, accurate, and concise industrial engineering response."
                            ),
                        ),
                        ModelMessage(role="user", content=request.query),
                    ],
                    temperature=0.2,
                )
                direct_resp = await self.model_provider.generate(direct_req)
                final_answer = direct_resp.content

            logger.info("[AGENT_FINAL_RESPONSE] Emitted direct response.")
            audit_event_sink.record_agent_event(
                AgentTraceEvent(
                    event_type=AgentEventType.AGENT_FINAL_RESPONSE,
                    requester=request.requester,
                    role=request.role,
                    details={"action": "direct", "final_answer_length": len(final_answer)},
                )
            )
            return AgentQueryResponse(
                query=request.query,
                final_answer=final_answer,
                status=AgentQueryStatus.DIRECT_ANSWER,
                plan=plan,
                agent_plan=plan,
            )

        # 5. Initialize Execution-Scoped EvidenceSet
        evidence_set = EvidenceSet()
        last_event_id: Optional[str] = None
        has_tool_error = False
        all_tools_denied = True if plan.tool_calls else False

        # 6. Execute Knowledge Retrieval (if action is 'knowledge' or 'combined')
        if plan.action in (AgentActionType.KNOWLEDGE, AgentActionType.COMBINED):
            user_clearance_level = CLASSIFICATION_LEVELS.get(request.classification.value, 2)

            for kq in plan.knowledge_queries:
                logger.info(
                    "[KNOWLEDGE_RETRIEVAL_REQUESTED] Query: '%s' | Requested Filter: '%s' | User Clearance: '%s'",
                    kq.query,
                    kq.classification.value if kq.classification else "NONE",
                    request.classification.value,
                )
                audit_event_sink.record_agent_event(
                    AgentTraceEvent(
                        event_type=AgentEventType.KNOWLEDGE_RETRIEVAL_REQUESTED,
                        requester=request.requester,
                        role=request.role,
                        details={"query": kq.query, "user_clearance": request.classification.value},
                    )
                )

                # Clearance Guard: Stored document classification is authoritative
                # The model cannot escalate beyond the requester's clearance level.
                effective_filter = None
                if kq.classification:
                    req_level = CLASSIFICATION_LEVELS.get(kq.classification.value, 2)
                    if req_level > user_clearance_level:
                        logger.warning(
                            "[CLASSIFICATION_ESCALATION_BLOCKED] Plan requested '%s' but requester only has clearance '%s'. Filtering to '%s'.",
                            kq.classification.value,
                            request.classification.value,
                            request.classification.value,
                        )
                        effective_filter = request.classification
                    else:
                        effective_filter = kq.classification

                # Execute local retrieval strictly bounded by user's clearance level
                results = await self.knowledge_service.search_as_evidence(
                    query=kq.query,
                    top_k=5,
                    classification_filter=effective_filter,
                    max_classification=request.classification,
                )

                logger.info(
                    "[KNOWLEDGE_RETRIEVAL_COMPLETED] Query: '%s' | Chunks retrieved: %d",
                    kq.query,
                    len(results),
                )
                audit_event_sink.record_agent_event(
                    AgentTraceEvent(
                        event_type=AgentEventType.KNOWLEDGE_RETRIEVAL_COMPLETED,
                        requester=request.requester,
                        role=request.role,
                        details={"query": kq.query, "retrieved_count": len(results)},
                    )
                )

                for evd in results:
                    evidence_set.add_knowledge_evidence(evd)
                    logger.info("[EVIDENCE_CREATED] Knowledge Evidence ID: '%s' | Source: '%s'", evd.evidence_id, evd.source_reference)
                    audit_event_sink.record_agent_event(
                        AgentTraceEvent(
                            event_type=AgentEventType.EVIDENCE_CREATED,
                            requester=request.requester,
                            role=request.role,
                            details={"evidence_id": evd.evidence_id, "source_reference": evd.source_reference},
                        )
                    )

        # 7. Execute Industrial Tools (if action is 'tool' or 'combined')
        first_tool_result_data: Optional[Dict[str, Any]] = None
        if plan.action in (AgentActionType.TOOL, AgentActionType.COMBINED):
            for tc in plan.tool_calls:
                logger.info(
                    "[TOOL_REQUESTED] Tool: '%s' | Arguments: %s",
                    tc.tool_name,
                    json.dumps(tc.arguments),
                )
                audit_event_sink.record_agent_event(
                    AgentTraceEvent(
                        event_type=AgentEventType.TOOL_REQUESTED,
                        requester=request.requester,
                        role=request.role,
                        details={"tool_name": tc.tool_name, "arguments": tc.arguments},
                    )
                )

                tool_invoc_req = ToolInvocationRequest(
                    requester=request.requester,
                    role=request.role,
                    tool_name=tc.tool_name,
                    classification=request.classification,
                    parameters=tc.arguments,
                    has_approval=request.has_approval,
                )

                # Execute strictly through MANDATORY Policy Gateway & Tool Registry boundary
                exec_result = execute_tool_with_policy(
                    tool_invoc_req,
                    gateway=self.policy_gateway,
                    registry=self.tool_registry,
                )
                last_event_id = exec_result.event_id
                evidence_set.add_policy_decision(exec_result.decision, exec_result.event_id)

                logger.info(
                    "[POLICY_EVALUATED] Tool: '%s' | Decision: '%s' | Policy ID: '%s' | Reason: '%s'",
                    tc.tool_name,
                    exec_result.decision.decision.value,
                    exec_result.decision.policy_id or "NONE",
                    exec_result.decision.reason,
                )
                audit_event_sink.record_agent_event(
                    AgentTraceEvent(
                        event_type=AgentEventType.POLICY_EVALUATED,
                        requester=request.requester,
                        role=request.role,
                        details={
                            "tool_name": tc.tool_name,
                            "decision": exec_result.decision.decision.value,
                            "reason": exec_result.decision.reason,
                        },
                    )
                )

                # Handle Policy Denial
                if exec_result.decision.decision == PolicyDecisionType.DENY:
                    logger.warning(
                        "[TOOL_EXECUTION_BLOCKED] Policy denied tool '%s': %s",
                        tc.tool_name,
                        exec_result.decision.reason,
                    )
                    continue

                all_tools_denied = False

                # Handle Tool Execution Failure
                if not exec_result.success:
                    logger.error(
                        "[TOOL_EXECUTION_FAILED] Tool '%s' execution error: %s",
                        tc.tool_name,
                        exec_result.error,
                    )
                    has_tool_error = True
                    continue

                # Successful Tool Execution
                logger.info("[TOOL_EXECUTED] Tool '%s' executed successfully.", tc.tool_name)
                audit_event_sink.record_agent_event(
                    AgentTraceEvent(
                        event_type=AgentEventType.TOOL_EXECUTED,
                        requester=request.requester,
                        role=request.role,
                        details={"tool_name": tc.tool_name, "event_id": exec_result.event_id},
                    )
                )

                if first_tool_result_data is None:
                    first_tool_result_data = (
                        exec_result.data if isinstance(exec_result.data, dict) else {"data": exec_result.data}
                    )

                tool_evd = EvidenceRecord(
                    source_type="LOCAL_INDUSTRIAL_TOOL",
                    source_reference=f"tool:{tc.tool_name}",
                    tool_name=tc.tool_name,
                    tool_execution_id=exec_result.event_id,
                    retrieved_data=exec_result.data,
                    classification=request.classification,
                )
                evidence_set.add_tool_evidence(tool_evd)

                logger.info("[EVIDENCE_CREATED] Tool Evidence ID: '%s' | Source: '%s'", tool_evd.evidence_id, tool_evd.source_reference)
                audit_event_sink.record_agent_event(
                    AgentTraceEvent(
                        event_type=AgentEventType.EVIDENCE_CREATED,
                        requester=request.requester,
                        role=request.role,
                        details={"evidence_id": tool_evd.evidence_id, "source_reference": tool_evd.source_reference},
                    )
                )

        # 8. Check for Policy Denial Outcome
        # If all tool calls were denied and no knowledge evidence was found
        if plan.tool_calls and all_tools_denied and not evidence_set.knowledge_evidence:
            first_denial_reason = (
                evidence_set.policy_decisions[0].reason
                if evidence_set.policy_decisions
                else "Execution blocked by sovereign policy."
            )
            logger.info("[AGENT_FINAL_RESPONSE] Blocked by policy: %s", first_denial_reason)
            audit_event_sink.record_agent_event(
                AgentTraceEvent(
                    event_type=AgentEventType.AGENT_FINAL_RESPONSE,
                    requester=request.requester,
                    role=request.role,
                    details={"status": AgentQueryStatus.POLICY_DENIED.value, "reason": first_denial_reason},
                )
            )
            return AgentQueryResponse(
                query=request.query,
                final_answer=f"Execution blocked by sovereign policy: {first_denial_reason}",
                status=AgentQueryStatus.POLICY_DENIED,
                plan=plan,
                agent_plan=plan,
                knowledge_queries=plan.knowledge_queries,
                tool_calls=plan.tool_calls,
                policy_decisions=evidence_set.policy_decisions,
                evidence_set=evidence_set,
                execution_event_id=last_event_id,
                # Backwards compatibility
                tool_call=plan.tool_calls[0].model_dump() if plan.tool_calls else None,
                policy_decision=evidence_set.policy_decisions[0] if evidence_set.policy_decisions else None,
                tool_result=None,
                evidence=None,
            )

        if has_tool_error and evidence_set.is_empty:
            logger.error("[AGENT_FINAL_RESPONSE] Tool execution error occurred with no evidence.")
            return AgentQueryResponse(
                query=request.query,
                final_answer="Industrial tool execution failed.",
                status=AgentQueryStatus.TOOL_ERROR,
                plan=plan,
                agent_plan=plan,
                knowledge_queries=plan.knowledge_queries,
                tool_calls=plan.tool_calls,
                policy_decisions=evidence_set.policy_decisions,
                evidence_set=evidence_set,
                execution_event_id=last_event_id,
                tool_call=plan.tool_calls[0].model_dump() if plan.tool_calls else None,
                policy_decision=evidence_set.policy_decisions[0] if evidence_set.policy_decisions else None,
                tool_result=None,
                evidence=None,
            )

        # 9. Contradiction & Parameter Variance Detection
        conflicts = detect_evidence_conflicts(evidence_set.all_evidence)
        evidence_set.detected_conflicts = conflicts

        # 10. Evidence-Grounded Synthesis (Phase 2 Local Qwen3)
        evidence_formatted_parts = []
        for evd in evidence_set.all_evidence:
            data_str = json.dumps(evd.retrieved_data, indent=2) if not isinstance(evd.retrieved_data, str) else evd.retrieved_data
            evidence_formatted_parts.append(
                f"- Evidence ID: {evd.evidence_id}\n"
                f"  Source: {evd.source_reference}\n"
                f"  Classification: {evd.classification.value}\n"
                f"  Data:\n{data_str}"
            )
        evidence_formatted = "\n\n".join(evidence_formatted_parts) if evidence_formatted_parts else "No evidence retrieved."

        policy_formatted_parts = []
        for pd in evidence_set.policy_decisions:
            policy_formatted_parts.append(
                f"- Tool: {pd.tool} | Decision: {pd.decision.value} | Policy ID: {pd.policy_id or 'NONE'} | Reason: {pd.reason}"
            )
        policy_outcomes_formatted = "\n".join(policy_formatted_parts) if policy_formatted_parts else "None."

        conflict_formatted_parts = []
        for c in conflicts:
            conflict_formatted_parts.append(
                f"- Metric: {c.metric_or_topic} | Source A: {c.source_a} ({c.value_a}) vs Source B: {c.source_b} ({c.value_b})\n"
                f"  Analysis Note: {c.description}"
            )
        conflicts_formatted = "\n".join(conflict_formatted_parts) if conflict_formatted_parts else "None detected."

        synthesis_prompt = UNIFIED_GROUNDED_SYNTHESIS_SYSTEM_PROMPT.format(
            user_query=request.query,
            evidence_formatted=evidence_formatted,
            policy_outcomes_formatted=policy_outcomes_formatted,
            conflicts_formatted=conflicts_formatted,
        )

        synthesis_req = ModelRequest(
            messages=[
                ModelMessage(role="system", content=synthesis_prompt),
                ModelMessage(role="user", content=request.query),
            ],
            temperature=0.2,
        )

        synthesis_resp = await self.model_provider.generate(synthesis_req)
        final_answer = synthesis_resp.content

        logger.info("[AGENT_FINAL_RESPONSE] Successfully synthesized grounded response.")
        audit_event_sink.record_agent_event(
            AgentTraceEvent(
                event_type=AgentEventType.AGENT_FINAL_RESPONSE,
                requester=request.requester,
                role=request.role,
                details={
                    "status": AgentQueryStatus.SUCCESS.value,
                    "evidence_count": len(evidence_set.all_evidence),
                    "conflicts_count": len(conflicts),
                },
            )
        )

        first_tool_evidence = evidence_set.tool_evidence[0] if evidence_set.tool_evidence else None
        first_knowledge_evidence = evidence_set.knowledge_evidence[0] if evidence_set.knowledge_evidence else None
        primary_evidence = first_tool_evidence or first_knowledge_evidence

        return AgentQueryResponse(
            query=request.query,
            final_answer=final_answer,
            status=AgentQueryStatus.SUCCESS,
            plan=plan,
            agent_plan=plan,
            knowledge_queries=plan.knowledge_queries,
            tool_calls=plan.tool_calls,
            policy_decisions=evidence_set.policy_decisions,
            evidence_set=evidence_set,
            execution_event_id=last_event_id,
            # Backwards compatibility
            tool_call=plan.tool_calls[0].model_dump() if plan.tool_calls else None,
            policy_decision=evidence_set.policy_decisions[0] if evidence_set.policy_decisions else None,
            tool_result=first_tool_result_data,
            evidence=primary_evidence,
        )


# Global default service instance
agent_reasoning_service = AgentReasoningService()
