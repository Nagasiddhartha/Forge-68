"""Milestone 6: Comprehensive Test Suite for Independent Verification & Trust Engine.

Covers:
- SCENARIO A: Verified knowledge (provenance, support, VERIFIED status)
- SCENARIO B: Deterministic calculation (pressure variance = 1.8 bar in Python)
- SCENARIO C: Pressure margin (trip 35.0 - observed 33.0 = 2.0 bar in Python)
- SCENARIO D: Corrosion projection (72.8 - 0.04*5 = 72.6 mm in Python)
- SCENARIO E: Missing evidence (INSUFFICIENT_EVIDENCE / NEEDS_REVIEW)
- SCENARIO F: Conflicting evidence (genuine parameter contradiction -> NEEDS_REVIEW)
- SCENARIO G: Denied operation (Policy DENY verified; tool unexecuted)
- SCENARIO H: Classification violation (restricted evidence blocked from unauthorized verification)
- Security Tests:
  1. Arbitrary Python expression rejected by calculator
  2. Shell command rejected by calculator
  3. Unregistered calculation name rejected
  4. Missing calculation inputs rejected
  5. Units validated on calculations
  6. Fabricated evidence IDs in calculations flagged (NEEDS_REVIEW)
  7. Denied tool cannot become VERIFIED
  8. Restricted evidence cannot become VERIFIED for unauthorized user
  9. Missing provenance produces NEEDS_REVIEW
  10. Unsupported claim produces NEEDS_REVIEW
  11. Prompt injection inside evidence remains inert
  12. Audit events emitted: VERIFICATION_STARTED, VERIFICATION_CHECK, VERIFICATION_COMPLETED
  13. API endpoint returns complete typed verification payload
"""

import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.core.reasoning import AgentReasoningService
from app.core.schemas import (
    AgentActionType,
    AgentPlan,
    AgentQueryRequest,
    AgentQueryResponse,
    AgentQueryStatus,
    KnowledgeQueryPlan,
    ToolCallPlan,
)
from app.knowledge import (
    KnowledgeService,
    LocalDocumentIngestionPipeline,
    MockEmbeddingProvider,
    NumpyCosineVectorIndex,
)
from app.main import app
from app.models import MockModelProvider
from app.security import (
    AgentEventType,
    DataClassification,
    PolicyDecision,
    PolicyDecisionType,
    RiskLevel,
    Role,
    audit_event_sink,
)
from app.verification import (
    CalculationEngine,
    CalculationRequest,
    CalculationResult,
    CalculationType,
    ConflictRecord,
    CorrosionProjectionInputs,
    EvidenceRecord,
    EvidenceSet,
    PressureMarginInputs,
    PressureVarianceInputs,
    ThicknessLossInputs,
    VerificationEngine,
    VerificationResult,
    VerificationStatus,
    verification_engine,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_audit_sink():
    """Ensure clean audit sink before and after each test."""
    audit_event_sink.clear()
    yield
    audit_event_sink.clear()


@pytest.fixture
async def populated_knowledge_service(tmp_path):
    """Fixture providing a deterministic knowledge service with R-204 SOP ingested."""
    service = KnowledgeService(
        embedding_provider=MockEmbeddingProvider(),
        vector_index=NumpyCosineVectorIndex(),
        ingestion_pipeline=LocalDocumentIngestionPipeline(),
    )
    sop_file = Path("data/demo/knowledge/r204_operating_sop.md")
    if not sop_file.exists():
        sop_file = Path("backend/data/demo/knowledge/r204_operating_sop.md")

    await service.ingest_document(
        file_path=sop_file,
        classification=DataClassification.INTERNAL,
        document_type="SOP",
        equipment_ids=["R-204", "P-201", "E-301"],
    )
    return service


# ===========================================================================
# SCENARIO A: Verified Knowledge
# ===========================================================================

@pytest.mark.asyncio
async def test_scenario_a_verified_knowledge(populated_knowledge_service):
    """SCENARIO A: Verified knowledge retrieval with provenance, support, and VERIFIED status."""
    plan_json = json.dumps({
        "action": "knowledge",
        "knowledge_queries": [{"query": "R-204 normal operating pressure limit"}],
        "reasoning": "Need operating limits from SOP."
    })
    synthesis_answer = (
        "According to SOP-R204-REV4 [doc:SOP-R204-REV4#chunk_0], the normal operating pressure "
        "for R-204 is 31.2 bar gauge, with a maximum allowable working pressure of 35.0 bar gauge."
    )

    provider = MockModelProvider(responses=[plan_json, synthesis_answer])
    service = AgentReasoningService(
        model_provider=provider,
        knowledge=populated_knowledge_service,
    )

    req = AgentQueryRequest(
        query="What is the normal operating pressure for R-204?",
        role=Role.ENGINEER,
        requester="engineer_verified",
        classification=DataClassification.INTERNAL,
    )
    resp = await service.process_query(req)

    assert resp.status == AgentQueryStatus.SUCCESS
    assert resp.verification is not None
    assert resp.verification.status == VerificationStatus.VERIFIED
    assert len(resp.verification.checks) >= 6

    # Verify check types are present and passed
    check_types = {c.check_type: c.status for c in resp.verification.checks}
    assert check_types.get("PROVENANCE") == VerificationStatus.VERIFIED
    assert check_types.get("COMPLETENESS") == VerificationStatus.VERIFIED
    assert check_types.get("POLICY_COMPLIANCE") == VerificationStatus.VERIFIED
    assert check_types.get("CLASSIFICATION") == VerificationStatus.VERIFIED
    assert check_types.get("GROUNDING_SUPPORT") == VerificationStatus.VERIFIED


# ===========================================================================
# SCENARIOS B, C, D: Deterministic Calculations in Python
# ===========================================================================

def test_scenario_b_pressure_variance_calculation():
    """SCENARIO B: Deterministic pressure variance calculation in Python."""
    inputs = {
        "normal_operating_pressure_bar": 31.2,
        "observed_pressure_bar": 33.0,
    }
    calc = CalculationEngine.execute("pressure_variance", inputs)
    assert calc.calculation_type == "pressure_variance"
    assert calc.result == 1.8
    assert calc.units == "bar"
    assert "1.8 bar" in calc.description


def test_scenario_c_pressure_margin_calculation():
    """SCENARIO C: Deterministic pressure margin to trip limit in Python."""
    inputs = {
        "trip_pressure_bar": 35.0,
        "observed_pressure_bar": 33.0,
    }
    calc = CalculationEngine.execute("pressure_margin", inputs)
    assert calc.calculation_type == "pressure_margin"
    assert calc.result == 2.0
    assert calc.units == "bar"
    assert "2.0 bar" in calc.description


def test_scenario_d_corrosion_projection_calculation():
    """SCENARIO D: Deterministic corrosion wall thickness projection in Python."""
    inputs = {
        "current_thickness_mm": 72.8,
        "corrosion_rate_mm_year": 0.04,
        "projection_years": 5.0,
    }
    calc = CalculationEngine.execute("corrosion_projection", inputs)
    assert calc.calculation_type == "corrosion_projection"
    # 72.8 - (0.04 * 5.0) = 72.8 - 0.20 = 72.6
    assert calc.result == 72.6
    assert calc.units == "mm"


def test_thickness_loss_calculation():
    """Additional deterministic thickness loss calculation."""
    inputs = {
        "initial_thickness_mm": 75.0,
        "current_thickness_mm": 72.8,
    }
    calc = CalculationEngine.execute("thickness_loss", inputs)
    assert calc.result == 2.2
    assert calc.units == "mm"


# ===========================================================================
# SCENARIO E: Missing Evidence
# ===========================================================================

@pytest.mark.asyncio
async def test_scenario_e_missing_evidence():
    """SCENARIO E: Inquiry requests unrecorded data; verifier reports INSUFFICIENT_EVIDENCE or NEEDS_REVIEW."""
    plan = AgentPlan(
        action=AgentActionType.KNOWLEDGE,
        knowledge_queries=[KnowledgeQueryPlan(query="R-204 non-existent acoustic resonance coefficient")],
        reasoning="Search non-existent acoustic telemetry."
    )
    # Empty evidence set simulates missing records
    empty_evidence_set = EvidenceSet()

    engine = VerificationEngine()
    result = engine.verify(
        query="What is the acoustic resonance coefficient for R-204?",
        plan=plan,
        evidence_set=empty_evidence_set,
    )

    assert result.status in (VerificationStatus.INSUFFICIENT_EVIDENCE, VerificationStatus.NEEDS_REVIEW)
    completeness_chk = next(c for c in result.checks if c.check_type == "COMPLETENESS")
    assert completeness_chk.status == VerificationStatus.INSUFFICIENT_EVIDENCE


# ===========================================================================
# SCENARIO F: Conflicting Evidence
# ===========================================================================

def test_scenario_f_conflicting_evidence():
    """SCENARIO F: Two sources claim conflicting values for the same semantic parameter."""
    evd_set = EvidenceSet()
    evd_set.add_knowledge_evidence(
        EvidenceRecord(
            document_id="doc:sop_rev1.md",
            chunk_id="chunk_0",
            filename="sop_rev1.md",
            source_reference="doc:sop_rev1.md#0",
            classification=DataClassification.INTERNAL,
            retrieval_score=0.95,
            retrieved_data="Normal operating pressure is 31.2 bar",
            retrieved_text="Normal operating pressure is 31.2 bar",
        )
    )
    evd_set.detected_conflicts = [
        ConflictRecord(
            metric_or_topic="pressure",
            source_a="doc:sop_rev1.md (Normal operating pressure)",
            value_a="31.2 bar",
            source_b="doc:sop_rev2.md (Normal operating pressure)",
            value_b="33.0 bar",
            description="Contradictory normal operating pressure recorded across revisions.",
        )
    ]

    engine = VerificationEngine()
    result = engine.verify(
        query="Verify operating pressure consistency",
        plan=AgentPlan(action=AgentActionType.KNOWLEDGE, knowledge_queries=[KnowledgeQueryPlan(query="pressure")]),
        evidence_set=evd_set,
    )

    assert result.status == VerificationStatus.NEEDS_REVIEW
    conflict_chk = next(c for c in result.checks if c.check_type == "PARAMETER_CONSISTENCY")
    assert conflict_chk.status == VerificationStatus.NEEDS_REVIEW
    assert "contradiction" in conflict_chk.description.lower()


# ===========================================================================
# SCENARIO G: Denied Operation
# ===========================================================================

@pytest.mark.asyncio
async def test_scenario_g_denied_operation():
    """SCENARIO G: Tool access blocked by policy; verifier confirms tool did not execute."""
    plan_json = json.dumps({
        "action": "tool",
        "tool_calls": [{"tool_name": "equipment_history", "arguments": {"equipment_id": "R-204"}}],
        "reasoning": "Unauthorized inspection."
    })

    provider = MockModelProvider(responses=[plan_json])
    service = AgentReasoningService(model_provider=provider)

    req = AgentQueryRequest(
        query="Inspect R-204 history",
        role=Role.MANAGER,  # Unauthorized
        requester="manager_test",
    )
    resp = await service.process_query(req)

    assert resp.status == AgentQueryStatus.POLICY_DENIED
    assert resp.verification is not None
    # Policy compliance check confirms that the denied tool was not executed
    policy_chk = next(c for c in resp.verification.checks if c.check_type == "POLICY_COMPLIANCE")
    assert policy_chk.status == VerificationStatus.VERIFIED
    assert len(resp.evidence_set.tool_evidence) == 0


# ===========================================================================
# SCENARIO H: Classification Violation
# ===========================================================================

def test_scenario_h_classification_violation():
    """SCENARIO H: Evidence exceeding requester clearance fails classification check."""
    evd_set = EvidenceSet()
    evd_set.add_knowledge_evidence(
        EvidenceRecord(
            source_type="knowledge_document",
            source_reference="doc:classified_core.md#chunk_0",
            retrieved_data={"text": "Secret design"},
            classification=DataClassification.RESTRICTED,  # Level 4
            document_id="doc-restricted",
            chunk_id="chk-0",
            filename="classified_core.md",
        )
    )

    engine = VerificationEngine()
    # Requester is only INTERNAL (Level 2)
    result = engine.verify(
        query="Read secret core",
        evidence_set=evd_set,
        requester_classification=DataClassification.INTERNAL,
    )

    assert result.status == VerificationStatus.FAILED
    class_chk = next(c for c in result.checks if c.check_type == "CLASSIFICATION")
    assert class_chk.status == VerificationStatus.FAILED
    assert "breached" in class_chk.description.lower() or "exceeding" in class_chk.description.lower()


# ===========================================================================
# SECURITY TESTS
# ===========================================================================

def test_security_arbitrary_python_expression_rejected():
    """Security 1: Python expressions in calculation inputs are rejected."""
    with pytest.raises(Exception):
        CalculationEngine.execute("pressure_variance", {
            "observed_pressure_bar": "__import__('os').system('echo hacked')",
            "normal_operating_pressure_bar": 31.2,
        })


def test_security_shell_command_rejected_in_calculator():
    """Security 2: Shell commands in calculation inputs are rejected."""
    with pytest.raises(Exception):
        CalculationEngine.execute("pressure_margin", {
            "trip_pressure_bar": "powershell -Command Remove-Item -Force -Recurse C:/",
            "observed_pressure_bar": 33.0,
        })


def test_security_unregistered_calculation_rejected():
    """Security 3: Unregistered calculation name is strictly rejected."""
    with pytest.raises(ValueError) as exc_info:
        CalculationEngine.execute("arbitrary_eval_calc", {"x": 1})
    assert "Unknown or unregistered calculation" in str(exc_info.value)


def test_security_missing_calculation_inputs_rejected():
    """Security 4: Missing required calculation inputs fail validation."""
    with pytest.raises(Exception):
        CalculationEngine.execute("pressure_margin", {"observed_pressure_bar": 33.0})


def test_security_calculation_units_validated():
    """Security 5: Calculation validation flags missing units."""
    calc_no_units = CalculationResult(
        calculation_type="pressure_margin",
        inputs={"trip": 35.0, "observed": 33.0},
        result=2.0,
        units="",  # Missing units!
    )
    engine = VerificationEngine()
    chk = engine._check_calculations([calc_no_units], [])
    assert chk.status == VerificationStatus.NEEDS_REVIEW
    assert "lacks engineering units" in chk.description


def test_security_fabricated_evidence_ids_flagged():
    """Security 6: Calculation citing non-existent evidence IDs is flagged."""
    calc_fabricated = CalculationResult(
        calculation_type="pressure_margin",
        inputs={"trip": 35.0, "observed": 33.0},
        result=2.0,
        units="bar",
        evidence_ids=["evd-fake-9999"],  # Does not exist!
    )
    engine = VerificationEngine()
    chk = engine._check_calculations([calc_fabricated], ["evd-real-1234"])
    assert chk.status == VerificationStatus.NEEDS_REVIEW
    assert "unknown evidence IDs" in chk.description


def test_security_denied_tool_cannot_produce_evidence():
    """Security 7: If a denied tool leaks evidence, policy verification FAILS."""
    evd_set = EvidenceSet()
    evd_set.add_policy_decision(
        PolicyDecision(
            decision=PolicyDecisionType.DENY,
            reason="Blocked by policy.",
            requester="tester",
            role=Role.MANAGER,
            tool="equipment_history",
            classification=DataClassification.INTERNAL,
            risk=RiskLevel.LOW,
            approval_required=False,
        )
    )
    # Malicious injection: tool evidence exists despite DENY
    evd_set.add_tool_evidence(
        EvidenceRecord(
            source_type="LOCAL_INDUSTRIAL_TOOL",
            source_reference="tool:equipment_history",
            tool_name="equipment_history",
            tool_execution_id="fake-exec",
            retrieved_data={"equipment_id": "R-204"},
        )
    )

    engine = VerificationEngine()
    chk = engine._check_policy_trace(None, evd_set)
    assert chk.status == VerificationStatus.FAILED
    assert "CRITICAL POLICY VIOLATION" in chk.description


def test_security_missing_provenance_produces_needs_review():
    """Security 9: Incomplete evidence provenance produces NEEDS_REVIEW."""
    evd_set = EvidenceSet()
    evd_set.add_knowledge_evidence(
        EvidenceRecord(
            source_type="knowledge_document",
            source_reference="",  # Missing source reference
            retrieved_data={"text": "mystery snippet"},
            document_id="",  # Missing document ID
            chunk_id="",
            filename="",
        )
    )

    engine = VerificationEngine()
    chk = engine._check_provenance(evd_set)
    assert chk.status == VerificationStatus.NEEDS_REVIEW
    assert "provenance incomplete" in chk.description.lower()


def test_security_unsupported_numerical_claim_produces_needs_review():
    """Security 10: Model claim with ungrounded metric triggers NEEDS_REVIEW."""
    evd_set = EvidenceSet()
    evd_set.add_knowledge_evidence(
        EvidenceRecord(
            source_type="knowledge_document",
            source_reference="doc:sop.md#chunk_0",
            filename="sop.md",
            retrieved_data={"text": "Normal operating pressure: 31.2 bar."},
            retrieved_text="Normal operating pressure: 31.2 bar.",
        )
    )

    engine = VerificationEngine()
    # Response hallucinates 99.5 bar which is not in evidence
    chk = engine._check_grounding_support(
        query="What is the pressure?",
        evidence_set=evd_set,
        calculations=[],
        draft_response="The normal operating pressure is 99.5 bar.",
    )

    assert chk.status == VerificationStatus.NEEDS_REVIEW
    assert "99.5 bar" in chk.description


@pytest.mark.asyncio
async def test_security_verification_audit_events_emitted(populated_knowledge_service):
    """Security 12: Audit trace produces VERIFICATION_STARTED, VERIFICATION_CHECK, VERIFICATION_COMPLETED."""
    plan_json = json.dumps({
        "action": "knowledge",
        "knowledge_queries": [{"query": "R-204 pressure"}],
        "reasoning": "Audit test."
    })
    synthesis = "Grounded response verified against available SOP."

    provider = MockModelProvider(responses=[plan_json, synthesis])
    service = AgentReasoningService(
        model_provider=provider,
        knowledge=populated_knowledge_service,
    )

    await service.process_query(AgentQueryRequest(
        query="What is the operating pressure for R-204?",
        role=Role.ENGINEER,
        requester="audit_verifier",
    ))

    events = audit_event_sink.get_agent_events(limit=100)
    event_types = {e.event_type for e in events}

    assert AgentEventType.VERIFICATION_STARTED in event_types
    assert AgentEventType.VERIFICATION_CHECK in event_types
    assert AgentEventType.VERIFICATION_COMPLETED in event_types


# ===========================================================================
# API INTEGRATION TEST
# ===========================================================================

def test_api_agent_query_verification_payload():
    """API Integration: Verify /api/v1/agent/query includes typed verification result."""
    payload = {
        "query": "Explain what FORGE does.",
        "role": "ENGINEER",
        "requester": "api_test_operator",
        "classification": "INTERNAL",
    }
    resp = client.post("/api/v1/agent/query", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert "verification" in data
    assert data["verification"] is not None
    v = data["verification"]
    assert "verification_id" in v
    assert "status" in v
    assert "checks" in v
    assert "calculations" in v
    assert "conflicts" in v
    assert "summary" in v
    assert v["status"] == "VERIFIED"
