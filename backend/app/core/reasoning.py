"""Unified Evidence-Grounded Agent Reasoning Service with Independent Verification.

Executes the unified sovereign workflow:
User Request
     ↓
Local Qwen3 (Planning Stage)
     ↓
Structured Agent Plan (AgentPlan: direct / knowledge / tool / combined / calculations)
     │
     ├──────────────→ Direct Answer
     │
     ├──────────────→ Knowledge Retrieval (Clearance & Classification Guard)
     │
     ├──────────────→ Industrial Tool Execution (Policy Gateway DEFAULT-DENY)
     │
     └──────────────→ Deterministic Industrial Calculations (Python CalculationEngine)
                          ↓
                    Unified EvidenceSet
                          ↓
                    Independent VerificationEngine (7 Deterministic Checks)
                          ↓
                    VerificationResult (VERIFIED / NEEDS_REVIEW / INSUFFICIENT_EVIDENCE / FAILED)
                          ↓
                    Local Qwen3 (Evidence & Verification Grounded Synthesis)
                          ↓
                    Final Response + Verification Status
"""

import json
import logging
import re
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
    CalculationEngine,
    CalculationResult,
    EvidenceRecord,
    EvidenceSet,
    VerificationEngine,
    VerificationResult,
    VerificationStatus,
    detect_evidence_conflicts,
    verification_engine,
)

logger = logging.getLogger("forge.core.reasoning")
logger.setLevel(logging.INFO)


class AgentReasoningService:
    """Orchestrates sovereign reasoning, knowledge retrieval, tool execution, and verification."""

    def __init__(
        self,
        model_provider: Optional[BaseModelProvider] = None,
        gateway: Optional[PolicyGateway] = None,
        registry: Optional[ToolRegistry] = None,
        knowledge: Optional[KnowledgeService] = None,
        verifier: Optional[VerificationEngine] = None,
    ):
        self.model_provider = model_provider or get_model_provider()
        self.policy_gateway = gateway or policy_gateway
        self.tool_registry = registry or tool_registry
        self.knowledge_service = knowledge or knowledge_service
        self.verification_engine = verifier or verification_engine

    async def process_query(self, request: AgentQueryRequest) -> AgentQueryResponse:
        """Execute the unified, sovereign, evidence-grounded and verified agent workflow."""
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
            "[AGENT_PLAN_CREATED] Action: '%s' | Queries: %d | Tools: %d | Calcs: %d | Reasoning: '%s'",
            plan.action.value,
            len(plan.knowledge_queries),
            len(plan.tool_calls),
            len(plan.calculations),
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

            # Direct verification
            direct_verification = self.verification_engine.verify(
                query=request.query,
                plan=plan,
                evidence_set=EvidenceSet(),
                requester_role=request.role,
                requester_classification=request.classification,
                draft_response=final_answer,
            )

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
                verification=direct_verification,
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

                if exec_result.decision.decision == PolicyDecisionType.DENY:
                    logger.warning(
                        "[TOOL_EXECUTION_BLOCKED] Policy denied tool '%s': %s",
                        tc.tool_name,
                        exec_result.decision.reason,
                    )
                    continue

                all_tools_denied = False

                if not exec_result.success:
                    logger.error(
                        "[TOOL_EXECUTION_FAILED] Tool '%s' execution error: %s",
                        tc.tool_name,
                        exec_result.error,
                    )
                    has_tool_error = True
                    continue

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

        # 8. Contradiction & Parameter Variance Detection
        conflicts = detect_evidence_conflicts(evidence_set.all_evidence)
        evidence_set.detected_conflicts = conflicts

        # 9. Deterministic Industrial Calculations
        calculations = self._resolve_calculations(request.query, plan, evidence_set)

        # 10. Independent Verification Engine Execution
        logger.info("[VERIFICATION_STARTED] Commencing independent deterministic verification checks.")
        audit_event_sink.record_agent_event(
            AgentTraceEvent(
                event_type=AgentEventType.VERIFICATION_STARTED,
                requester=request.requester,
                role=request.role,
                details={
                    "evidence_count": len(evidence_set.all_evidence),
                    "calculations_count": len(calculations),
                },
            )
        )

        verification_result = self.verification_engine.verify(
            query=request.query,
            plan=plan,
            evidence_set=evidence_set,
            requester_role=request.role,
            requester_classification=request.classification,
            calculations=calculations,
        )

        for chk in verification_result.checks:
            logger.info(
                "[VERIFICATION_CHECK] Check: '%s' | Status: '%s' | Description: '%s'",
                chk.check_type,
                chk.status.value,
                chk.description,
            )
            audit_event_sink.record_agent_event(
                AgentTraceEvent(
                    event_type=AgentEventType.VERIFICATION_CHECK,
                    requester=request.requester,
                    role=request.role,
                    details={
                        "check_type": chk.check_type,
                        "status": chk.status.value,
                        "description": chk.description,
                    },
                )
            )

        logger.info(
            "[VERIFICATION_COMPLETED] Status: '%s' | Summary: '%s'",
            verification_result.status.value,
            verification_result.summary,
        )
        audit_event_sink.record_agent_event(
            AgentTraceEvent(
                event_type=AgentEventType.VERIFICATION_COMPLETED,
                requester=request.requester,
                role=request.role,
                details={
                    "status": verification_result.status.value,
                    "summary": verification_result.summary,
                },
            )
        )

        # 11. Handle Policy Denial Outcome
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
                verification=verification_result,
                execution_event_id=last_event_id,
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
                verification=verification_result,
                execution_event_id=last_event_id,
                tool_call=plan.tool_calls[0].model_dump() if plan.tool_calls else None,
                policy_decision=evidence_set.policy_decisions[0] if evidence_set.policy_decisions else None,
                tool_result=None,
                evidence=None,
            )

        # 12. Format Evidence & Verification for Phase 2 Synthesis
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

        verification_lines = [
            f"Overall Status: {verification_result.status.value}",
            f"Summary: {verification_result.summary}",
            "Deterministic Checks:",
        ]
        for chk in verification_result.checks:
            verification_lines.append(f"  - [{chk.check_type}] {chk.status.value}: {chk.description}")
        verification_formatted = "\n".join(verification_lines)

        calc_lines = []
        for calc in calculations:
            calc_lines.append(
                f"- Calculation ID: {calc.calculation_id} | Type: {calc.calculation_type} | "
                f"Result: {calc.result} {calc.units} | Description: {calc.description}"
            )
        calculations_formatted = "\n".join(calc_lines) if calc_lines else "None performed."

        synthesis_prompt = UNIFIED_GROUNDED_SYNTHESIS_SYSTEM_PROMPT.format(
            user_query=request.query,
            verification_formatted=verification_formatted,
            calculations_formatted=calculations_formatted,
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

        # 13. Post-Synthesis Grounding Support Re-check
        post_synthesis_check = self.verification_engine._check_grounding_support(
            query=request.query,
            evidence_set=evidence_set,
            calculations=calculations,
            draft_response=final_answer,
            plan=plan,
        )
        if post_synthesis_check.status != VerificationStatus.VERIFIED:
            for idx, chk in enumerate(verification_result.checks):
                if chk.check_type == "GROUNDING_SUPPORT":
                    verification_result.checks[idx] = post_synthesis_check
            verification_result.status = self.verification_engine._aggregate_status(verification_result.checks)
            verification_result.summary = self.verification_engine._generate_summary(
                verification_result.status,
                verification_result.checks,
                evidence_set,
                calculations,
            )

        logger.info("[AGENT_FINAL_RESPONSE] Successfully synthesized grounded response.")
        audit_event_sink.record_agent_event(
            AgentTraceEvent(
                event_type=AgentEventType.AGENT_FINAL_RESPONSE,
                requester=request.requester,
                role=request.role,
                details={
                    "status": AgentQueryStatus.SUCCESS.value,
                    "evidence_count": len(evidence_set.all_evidence),
                    "verification_status": verification_result.status.value,
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
            verification=verification_result,
            execution_event_id=last_event_id,
            tool_call=plan.tool_calls[0].model_dump() if plan.tool_calls else None,
            policy_decision=evidence_set.policy_decisions[0] if evidence_set.policy_decisions else None,
            tool_result=first_tool_result_data,
            evidence=primary_evidence,
        )

    def _resolve_calculations(
        self,
        query: str,
        plan: AgentPlan,
        evidence_set: EvidenceSet,
    ) -> List[CalculationResult]:
        """Execute calculations requested in the plan or deterministically extract parameters from query."""
        results: List[CalculationResult] = []

        # 1. Plan-specified calculations
        for calc_req in plan.calculations:
            try:
                res = CalculationEngine.execute(
                    calculation=calc_req.calculation,
                    inputs=calc_req.inputs,
                    evidence_ids=calc_req.evidence_ids or [e.evidence_id for e in evidence_set.all_evidence],
                )
                results.append(res)
            except Exception as exc:
                logger.warning("[CALCULATION_FAILED] Error executing plan calculation '%s': %s", calc_req.calculation, str(exc))

        if results:
            return results

        # 2. Deterministic query-level extraction for standard demo calculations
        q_lower = query.lower()
        all_evd_ids = [e.evidence_id for e in evidence_set.all_evidence]

        # A. Pressure variance
        if "pressure variance" in q_lower or ("variance" in q_lower and "pressure" in q_lower):
            obs_m = re.search(r"observed(?:\s+pressure)?(?:\s+(?:is|=|of))?\s*(\d+(?:\.\d+)?)\s*bar", query, re.IGNORECASE)
            norm_m = re.search(r"normal(?:\s+pressure)?(?:\s+(?:is|=|of))?\s*(\d+(?:\.\d+)?)\s*bar", query, re.IGNORECASE)
            if not norm_m:
                # Search evidence text for normal operating pressure (e.g., 31.2 bar in SOP)
                for evd in evidence_set.all_evidence:
                    norm_search = re.search(r"normal\s+operating\s+pressure:\s*(\d+(?:\.\d+)?)\s*bar", str(evd.retrieved_data), re.IGNORECASE)
                    if norm_search:
                        norm_m = norm_search
                        break
            if obs_m and norm_m:
                try:
                    res = CalculationEngine.execute(
                        "pressure_variance",
                        {
                            "observed_pressure_bar": float(obs_m.group(1)),
                            "normal_operating_pressure_bar": float(norm_m.group(1)),
                        },
                        evidence_ids=all_evd_ids,
                    )
                    results.append(res)
                except Exception as exc:
                    logger.warning("[AUTO_CALC_FAILED] Pressure variance error: %s", str(exc))

        # B. Pressure margin
        if "pressure margin" in q_lower or "margin to trip" in q_lower or ("margin" in q_lower and "trip" in q_lower):
            trip_m = re.search(r"trip(?:\s+pressure)?(?:\s+(?:is|=|of))?\s*(\d+(?:\.\d+)?)\s*bar", query, re.IGNORECASE)
            obs_m = re.search(r"observed(?:\s+pressure)?(?:\s+(?:is|=|of))?\s*(\d+(?:\.\d+)?)\s*bar", query, re.IGNORECASE)
            if not trip_m:
                for evd in evidence_set.all_evidence:
                    trip_search = re.search(r"trip\s+pressure(?:\s+threshold|\s+limit)?:\s*(\d+(?:\.\d+)?)\s*bar", str(evd.retrieved_data), re.IGNORECASE)
                    if trip_search:
                        trip_m = trip_search
                        break
            if trip_m and obs_m:
                try:
                    res = CalculationEngine.execute(
                        "pressure_margin",
                        {
                            "trip_pressure_bar": float(trip_m.group(1)),
                            "observed_pressure_bar": float(obs_m.group(1)),
                        },
                        evidence_ids=all_evd_ids,
                    )
                    results.append(res)
                except Exception as exc:
                    logger.warning("[AUTO_CALC_FAILED] Pressure margin error: %s", str(exc))

        # C. Corrosion projection
        if "corrosion" in q_lower and ("projection" in q_lower or "projected" in q_lower or "years" in q_lower):
            thick_m = re.search(r"current\s+thickness(?:\s+(?:is|=|of))?\s*(\d+(?:\.\d+)?)\s*mm", query, re.IGNORECASE)
            rate_m = re.search(r"corrosion\s+rate(?:\s+(?:is|=|of))?\s*(\d+(?:\.\d+)?)\s*(?:mm/year|mm/yr)?", query, re.IGNORECASE)
            years_m = re.search(r"(\d+(?:\.\d+)?)\s*years?", query, re.IGNORECASE)
            if thick_m and rate_m and years_m:
                try:
                    res = CalculationEngine.execute(
                        "corrosion_projection",
                        {
                            "current_thickness_mm": float(thick_m.group(1)),
                            "corrosion_rate_mm_year": float(rate_m.group(1)),
                            "projection_years": float(years_m.group(1)),
                        },
                        evidence_ids=all_evd_ids,
                    )
                    results.append(res)
                except Exception as exc:
                    logger.warning("[AUTO_CALC_FAILED] Corrosion projection error: %s", str(exc))

        return results


# Global default service instance
agent_reasoning_service = AgentReasoningService()
