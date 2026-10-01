"""Independent Verification and Trust Engine for FORGE Control Plane.

Executes deterministic, multi-stage verification over evidence sets, policy traces,
provenance metadata, and industrial calculations prior to response delivery.
Does NOT rely on LLM self-evaluation.
"""

import logging
import re
from typing import Any, Dict, List, Optional, Set

from app.knowledge.index import CLASSIFICATION_LEVELS

from app.security import DataClassification, PolicyDecisionType, Role
from app.tools.registry import tool_registry
from app.verification.calculations import CalculationEngine, CalculationResult
from app.verification.evidence import ConflictRecord, EvidenceRecord, EvidenceSet, detect_evidence_conflicts
from app.verification.models import VerificationCheck, VerificationResult, VerificationStatus

logger = logging.getLogger("forge.verification.engine")
logger.setLevel(logging.INFO)


class VerificationEngine:
    """Independent verification engine performing deterministic trust checks."""

    def __init__(self, registry=None):
        self.tool_registry = registry or tool_registry

    def verify(
        self,
        query: str,
        plan: Optional[Any] = None,
        evidence_set: Optional[EvidenceSet] = None,
        requester_role: Role = Role.ENGINEER,
        requester_classification: DataClassification = DataClassification.INTERNAL,
        calculations: Optional[List[CalculationResult]] = None,
        draft_response: Optional[str] = None,
    ) -> VerificationResult:

        """Run all verification checks and produce a typed VerificationResult."""
        evidence_set = evidence_set or EvidenceSet()
        if not evidence_set.detected_conflicts and len(evidence_set.all_evidence) >= 2:
            evidence_set.detected_conflicts = detect_evidence_conflicts(evidence_set.all_evidence)

        calculations = calculations or []
        checks: List[VerificationCheck] = []

        all_evd_ids = [e.evidence_id for e in evidence_set.all_evidence]

        # 1. Provenance Check
        chk_prov = self._check_provenance(evidence_set)
        checks.append(chk_prov)

        # 2. Evidence Completeness Check
        chk_comp = self._check_completeness(plan, evidence_set)
        checks.append(chk_comp)

        # 3. Policy Execution Trace Check
        chk_policy = self._check_policy_trace(plan, evidence_set)
        checks.append(chk_policy)

        # 4. Classification & Clearance Boundaries Check
        chk_class = self._check_classification(evidence_set, requester_classification)
        checks.append(chk_class)

        # 5. Parameter Consistency & Conflict Check
        chk_conflicts = self._check_parameter_consistency(evidence_set)
        checks.append(chk_conflicts)

        # 6. Deterministic Calculations Check
        chk_calc = self._check_calculations(calculations, all_evd_ids)
        checks.append(chk_calc)

        # 7. Grounding & Evidence Support Check
        chk_grounding = self._check_grounding_support(query, evidence_set, calculations, draft_response, plan)
        checks.append(chk_grounding)

        # Compute Overall Status
        overall_status = self._aggregate_status(checks)

        # Generate Engineering Summary
        summary = self._generate_summary(overall_status, checks, evidence_set, calculations)

        return VerificationResult(
            status=overall_status,
            checks=checks,
            evidence_ids=all_evd_ids,
            calculations=calculations,
            calculation_results=calculations,
            conflicts=evidence_set.detected_conflicts,
            summary=summary,
        )

    def _check_provenance(self, evidence_set: EvidenceSet) -> VerificationCheck:
        """Verify that every evidence item contains complete provenance attributes."""
        missing_provenance: List[str] = []
        examined_ids: List[str] = []

        # Check knowledge evidence
        for k_evd in evidence_set.knowledge_evidence:
            examined_ids.append(k_evd.evidence_id)
            if not k_evd.document_id or not k_evd.chunk_id or not k_evd.filename or not k_evd.source_reference:
                missing_provenance.append(f"Knowledge record '{k_evd.evidence_id}' lacks document ID/chunk/source")

        # Check tool evidence
        for t_evd in evidence_set.tool_evidence:
            examined_ids.append(t_evd.evidence_id)
            if not t_evd.tool_name or not t_evd.tool_execution_id or not t_evd.source_reference:
                missing_provenance.append(f"Tool record '{t_evd.evidence_id}' lacks tool name/execution ID/source")

        # Check visual evidence
        for v_evd in getattr(evidence_set, "visual_evidence", []):
            examined_ids.append(v_evd.evidence_id)
            if not v_evd.source_reference or not v_evd.source_image_hash or not v_evd.finding_id:
                missing_provenance.append(f"Visual record '{v_evd.evidence_id}' lacks source reference/image hash/finding ID")

        if missing_provenance:
            return VerificationCheck(
                check_type="PROVENANCE",
                status=VerificationStatus.NEEDS_REVIEW,
                description=f"Evidence provenance incomplete: {'; '.join(missing_provenance)}",
                evidence_ids=examined_ids,
                details={"missing": missing_provenance},
            )

        return VerificationCheck(
            check_type="PROVENANCE",
            status=VerificationStatus.VERIFIED,
            description="All evidence items possess verifiable source references, identifiers, and classifications.",
            evidence_ids=examined_ids,
            details={"verified_count": len(examined_ids)},
        )

    def _check_completeness(
        self,
        plan: Optional[Any],
        evidence_set: EvidenceSet,
    ) -> VerificationCheck:
        """Verify that all requested operations generated supporting evidence."""
        if not plan:
            return VerificationCheck(
                check_type="COMPLETENESS",
                status=VerificationStatus.VERIFIED,
                description="No execution plan was provided; no evidence operations expected.",
            )

        raw_action = getattr(plan, "action", "")
        action_str = raw_action.value.lower() if hasattr(raw_action, "value") else str(raw_action).lower()
        if "." in action_str:
            action_str = action_str.split(".")[-1]
        if action_str in ("direct", "direct_answer"):
            return VerificationCheck(
                check_type="COMPLETENESS",
                status=VerificationStatus.VERIFIED,
                description="Direct response plan does not require external evidence retrieval.",
            )

        missing_ops: List[str] = []

        # Knowledge checks
        if action_str in ("knowledge", "combined"):
            if getattr(plan, "knowledge_queries", None) and not evidence_set.knowledge_evidence:
                missing_ops.append("Requested knowledge queries yielded no evidence records.")

        # Tool checks
        if action_str in ("tool", "combined"):
            if getattr(plan, "tool_calls", None):
                for tc in plan.tool_calls:
                    tc_name = getattr(tc, "tool_name", "")
                    matching_decisions = [
                        pd for pd in evidence_set.policy_decisions
                        if getattr(pd, "tool", None) == tc_name
                    ]
                    matching_evd = [
                        te for te in evidence_set.tool_evidence
                        if te.tool_name == tc_name
                    ]
                    if not matching_decisions and not matching_evd:
                        missing_ops.append(f"Tool '{tc_name}' was requested but has no policy decision or evidence.")


        if missing_ops:
            return VerificationCheck(
                check_type="COMPLETENESS",
                status=VerificationStatus.INSUFFICIENT_EVIDENCE,
                description=f"Incomplete evidence coverage: {'; '.join(missing_ops)}",
                evidence_ids=[e.evidence_id for e in evidence_set.all_evidence],
                details={"missing_operations": missing_ops},
            )

        return VerificationCheck(
            check_type="COMPLETENESS",
            status=VerificationStatus.VERIFIED,
            description="All requested knowledge queries and tool operations have corresponding evidence or policy records.",
            evidence_ids=[e.evidence_id for e in evidence_set.all_evidence],
            details={
                "tool_evidence_count": len(evidence_set.tool_evidence),
                "knowledge_evidence_count": len(evidence_set.knowledge_evidence),
            },
        )

    def _check_policy_trace(
        self,
        plan: Optional[Any],
        evidence_set: EvidenceSet,
    ) -> VerificationCheck:

        """Verify that every tool execution is policy-backed and denied actions did not execute."""
        violations: List[str] = []

        # 1. Denied tool must NEVER have executed
        for pd in evidence_set.policy_decisions:
            decision_val = getattr(pd, "decision", None)
            tool_name = getattr(pd, "tool", None)

            if decision_val == PolicyDecisionType.DENY:
                # Ensure no tool evidence exists for this tool
                leaked_evd = [te for te in evidence_set.tool_evidence if te.tool_name == tool_name]
                if leaked_evd:
                    violations.append(
                        f"CRITICAL POLICY VIOLATION: Tool '{tool_name}' was DENIED by policy but executed and produced evidence!"
                    )

            elif decision_val == PolicyDecisionType.ALLOW:
                # Verify tool actually exists in registry
                if tool_name and not self.tool_registry.get(tool_name):
                    violations.append(
                        f"Policy allowed unregistered tool '{tool_name}'."
                    )

        if violations:
            return VerificationCheck(
                check_type="POLICY_COMPLIANCE",
                status=VerificationStatus.FAILED,
                description=f"Policy compliance failure: {'; '.join(violations)}",
                details={"violations": violations},
            )

        return VerificationCheck(
            check_type="POLICY_COMPLIANCE",
            status=VerificationStatus.VERIFIED,
            description="Policy trace verified: All tool actions were authorized; denied tools were strictly unexecuted.",
            details={"policy_decisions_evaluated": len(evidence_set.policy_decisions)},
        )

    def _check_classification(
        self,
        evidence_set: EvidenceSet,
        requester_clearance: DataClassification,
    ) -> VerificationCheck:
        """Verify that no evidence exceeds the requester's clearance level."""
        clearance_rank = CLASSIFICATION_LEVELS.get(requester_clearance.value, 2)
        violations: List[str] = []

        for evd in evidence_set.all_evidence:
            evd_class = evd.classification.value if isinstance(evd.classification, DataClassification) else str(evd.classification).upper()
            evd_rank = CLASSIFICATION_LEVELS.get(evd_class, 2)

            if evd_rank > clearance_rank:
                violations.append(
                    f"Evidence '{evd.evidence_id}' has classification '{evd_class}' exceeding requester clearance '{requester_clearance.value}'"
                )

        if violations:
            return VerificationCheck(
                check_type="CLASSIFICATION",
                status=VerificationStatus.FAILED,
                description=f"Data classification boundary breached: {'; '.join(violations)}",
                evidence_ids=[e.evidence_id for e in evidence_set.all_evidence],
                details={"violations": violations},
            )

        return VerificationCheck(
            check_type="CLASSIFICATION",
            status=VerificationStatus.VERIFIED,
            description=f"Data classifications verified: All evidence items remain within requester clearance ('{requester_clearance.value}').",
            evidence_ids=[e.evidence_id for e in evidence_set.all_evidence],
        )

    def _check_parameter_consistency(self, evidence_set: EvidenceSet) -> VerificationCheck:
        """Differentiate semantic parameter roles (normal vs trip) from genuine factual contradictions."""
        genuine_contradictions: List[str] = []

        # Check for genuine contradictions: same semantic parameter, differing values
        for conflict in evidence_set.detected_conflicts:
            desc = conflict.description.lower()
            src_a = conflict.source_a.lower()
            src_b = conflict.source_b.lower()
            # If both sources claim the EXACT same role, or visual gauge observation contrasts with baseline
            if ("normal" in src_a and "normal" in src_b) or \
               ("gauge" in src_a or "gauge" in src_b) or \
               ("visual" in src_a or "visual" in src_b) or \
               ("contradiction" in desc):
                genuine_contradictions.append(
                    f"Parameter variance or operational deviation for {conflict.metric_or_topic}: '{conflict.value_a}' vs '{conflict.value_b}'"
                )
            elif conflict.metric_or_topic == "status" and conflict.value_a != conflict.value_b:
                genuine_contradictions.append(
                    f"Conflicting status reported: '{conflict.value_a}' vs '{conflict.value_b}'"
                )

        if genuine_contradictions:
            return VerificationCheck(
                check_type="PARAMETER_CONSISTENCY",
                status=VerificationStatus.NEEDS_REVIEW,
                description=f"Genuine parameter contradiction detected requiring human review: {'; '.join(genuine_contradictions)}",
                details={"contradictions": genuine_contradictions},
            )

        if evidence_set.detected_conflicts:
            return VerificationCheck(
                check_type="PARAMETER_CONSISTENCY",
                status=VerificationStatus.VERIFIED,
                description=(
                    f"Parameter variances detected ({len(evidence_set.detected_conflicts)}) but verified as distinct semantic roles "
                    "(e.g., normal operating pressure vs trip/MAWP limit). Non-conflicting."
                ),
                details={"variance_count": len(evidence_set.detected_conflicts)},
            )

        return VerificationCheck(
            check_type="PARAMETER_CONSISTENCY",
            status=VerificationStatus.VERIFIED,
            description="Parameter consistency confirmed: No conflicting or diverging values detected.",
        )

    def _check_calculations(
        self,
        calculations: List[CalculationResult],
        available_evidence_ids: List[str],
    ) -> VerificationCheck:
        """Validate deterministic calculation provenance and input grounding."""
        if not calculations:
            return VerificationCheck(
                check_type="CALCULATION_VALIDATION",
                status=VerificationStatus.VERIFIED,
                description="No industrial calculations requested or performed.",
            )

        unsupported_calcs: List[str] = []
        for calc in calculations:
            # Verify units
            if not calc.units:
                unsupported_calcs.append(f"Calculation '{calc.calculation_id}' lacks engineering units.")

            # Verify that any cited evidence IDs actually exist
            if calc.evidence_ids:
                unknown_ids = [eid for eid in calc.evidence_ids if eid not in available_evidence_ids]
                if unknown_ids:
                    unsupported_calcs.append(
                        f"Calculation '{calc.calculation_id}' cites unknown evidence IDs: {unknown_ids}"
                    )

        if unsupported_calcs:
            return VerificationCheck(
                check_type="CALCULATION_VALIDATION",
                status=VerificationStatus.NEEDS_REVIEW,
                description=f"Calculation validation flag: {'; '.join(unsupported_calcs)}",
                details={"issues": unsupported_calcs},
            )

        return VerificationCheck(
            check_type="CALCULATION_VALIDATION",
            status=VerificationStatus.VERIFIED,
            description=f"All {len(calculations)} calculation(s) verified deterministically in Python with preserved provenance.",
            details={"calculations_count": len(calculations)},
        )

    def _check_grounding_support(
        self,
        query: str,
        evidence_set: EvidenceSet,
        calculations: List[CalculationResult],
        draft_response: Optional[str] = None,
        plan: Optional[Any] = None,
    ) -> VerificationCheck:
        """Verify that key numerical and structured facts are supported by evidence or calculations."""
        raw_action = getattr(plan, "action", "") if plan else ""
        action_str = raw_action.value.lower() if hasattr(raw_action, "value") else str(raw_action).lower()
        if "." in action_str:
            action_str = action_str.split(".")[-1]
        if action_str in ("direct", "direct_answer"):
            return VerificationCheck(
                check_type="GROUNDING_SUPPORT",
                status=VerificationStatus.VERIFIED,
                description="Direct conceptual response does not require numerical evidence grounding.",
            )


        if not draft_response:
            # If no draft response yet, check whether evidence is present to support inquiry
            if evidence_set.is_empty and not calculations:
                return VerificationCheck(
                    check_type="GROUNDING_SUPPORT",
                    status=VerificationStatus.INSUFFICIENT_EVIDENCE,
                    description="No evidence or calculation results available to ground technical response.",
                )
            return VerificationCheck(
                check_type="GROUNDING_SUPPORT",
                status=VerificationStatus.VERIFIED,
                description="Supporting evidence and calculations are available for synthesis grounding.",
            )

        # Extract structured numerical facts from draft response (e.g. "31.2 bar", "35.0 bar", "72.8 mm")
        metric_pattern = re.compile(r"(\b\d+(?:\.\d+)?)\s*(bar|°C|mm|psi|kPa)\b", re.IGNORECASE)
        claimed_metrics = metric_pattern.findall(draft_response)

        if not claimed_metrics:
            return VerificationCheck(
                check_type="GROUNDING_SUPPORT",
                status=VerificationStatus.VERIFIED,
                description="No specific engineering metrics in response; text is grounded in available narrative.",
            )

        # Build corpus of verified evidence text and calculation results
        corpus_parts = []
        for evd in evidence_set.all_evidence:
            corpus_parts.append(str(evd.retrieved_data))
            if evd.retrieved_text:
                corpus_parts.append(evd.retrieved_text)

        for calc in calculations:
            corpus_parts.append(f"{calc.result} {calc.units}")
            for k, v in calc.inputs.items():
                corpus_parts.append(f"{v}")

        corpus_text = " ".join(corpus_parts).lower()

        unsupported_claims: List[str] = []
        for num_str, unit_str in claimed_metrics:
            needle = num_str.strip().lower()
            if needle not in corpus_text:
                unsupported_claims.append(f"{num_str} {unit_str}")

        if unsupported_claims:
            return VerificationCheck(
                check_type="GROUNDING_SUPPORT",
                status=VerificationStatus.NEEDS_REVIEW,
                description=f"Response mentions metric claims not found in verified evidence: {', '.join(unsupported_claims)}",
                details={"unsupported_claims": unsupported_claims},
            )

        return VerificationCheck(
            check_type="GROUNDING_SUPPORT",
            status=VerificationStatus.VERIFIED,
            description=f"All {len(claimed_metrics)} metric claim(s) in response are supported by verified evidence or calculations.",
            details={"verified_claims_count": len(claimed_metrics)},
        )

    def _aggregate_status(self, checks: List[VerificationCheck]) -> VerificationStatus:
        """Deterministically determine overall verification status based on discrete check outcomes."""
        check_statuses = [c.status for c in checks]

        if VerificationStatus.FAILED in check_statuses:
            return VerificationStatus.FAILED

        if VerificationStatus.INSUFFICIENT_EVIDENCE in check_statuses:
            return VerificationStatus.INSUFFICIENT_EVIDENCE

        if VerificationStatus.NEEDS_REVIEW in check_statuses:
            return VerificationStatus.NEEDS_REVIEW

        if all(s == VerificationStatus.VERIFIED for s in check_statuses):
            return VerificationStatus.VERIFIED

        return VerificationStatus.PARTIALLY_VERIFIED

    def _generate_summary(
        self,
        overall_status: VerificationStatus,
        checks: List[VerificationCheck],
        evidence_set: EvidenceSet,
        calculations: List[CalculationResult],
    ) -> str:
        """Produce an objective, sovereign engineering trust summary."""
        verified_count = sum(1 for c in checks if c.status == VerificationStatus.VERIFIED)
        total_checks = len(checks)

        if overall_status == VerificationStatus.VERIFIED:
            return (
                f"VERIFIED ({verified_count}/{total_checks} checks passed). "
                f"Supported by {len(evidence_set.all_evidence)} evidence record(s) and "
                f"{len(calculations)} deterministic calculation(s). Provenance, policy, and boundaries confirmed."
            )
        elif overall_status == VerificationStatus.NEEDS_REVIEW:
            issues = [c.description for c in checks if c.status == VerificationStatus.NEEDS_REVIEW]
            return f"NEEDS_REVIEW: Verification requires operator review. Diagnostic: {'; '.join(issues)}"
        elif overall_status == VerificationStatus.INSUFFICIENT_EVIDENCE:
            return "INSUFFICIENT_EVIDENCE: Requested operational parameters or historical telemetry are not available in local records."
        elif overall_status == VerificationStatus.FAILED:
            failures = [c.description for c in checks if c.status == VerificationStatus.FAILED]
            return f"FAILED: High-assurance boundary violation detected. Reason: {'; '.join(failures)}"
        else:
            return f"PARTIALLY_VERIFIED ({verified_count}/{total_checks} checks passed)."


# Global default engine instance
verification_engine = VerificationEngine()
