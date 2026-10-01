"""Comprehensive M9 test suite: End-to-End Industrial Mission & Demo Harness.

Strictly verifies:
1. test_demo_r204_investigation
2. test_demo_multimodal_pressure_variance
3. test_demo_policy_denial
4. test_demo_prompt_injection
5. test_demo_denied_tool_not_executed
6. test_demo_evidence_provenance
7. test_demo_verification_trace
8. test_demo_audit_trace
"""

import pytest
from fastapi.testclient import TestClient

from app.core.schemas import AgentQueryStatus
from app.demo.schemas import DemoRunRequest, DemoScenarioId
from app.demo.service import demo_orchestration_service
from app.main import app
from app.security import (
    AgentEventType,
    DataClassification,
    PolicyDecisionType,
    Role,
    audit_event_sink,
)
from app.tools.industrial.equipment import CALIBRATION_EXECUTION_COUNTER
from app.verification.models import VerificationStatus

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_audit_sink():
    """Clear audit sink before and after each test."""
    audit_event_sink.clear()
    CALIBRATION_EXECUTION_COUNTER["count"] = 0
    yield
    audit_event_sink.clear()
    CALIBRATION_EXECUTION_COUNTER["count"] = 0


@pytest.mark.asyncio
async def test_demo_r204_investigation():
    """Scenario A: Flagship R-204 Investigation with knowledge, tool, and verified synthesis."""
    req = DemoRunRequest(
        scenario=DemoScenarioId.R204_INVESTIGATION,
        role=Role.ENGINEER,
        classification=DataClassification.CONFIDENTIAL,
        deterministic=True,
    )
    resp = await demo_orchestration_service.run_scenario(req)

    # Status & Verification
    assert resp.status == AgentQueryStatus.SUCCESS
    assert resp.verification is not None
    assert resp.verification.status == VerificationStatus.VERIFIED

    # Evidence coverage: Knowledge + Tool
    assert resp.evidence_set is not None
    assert len(resp.evidence_set.knowledge_evidence) >= 1
    assert len(resp.evidence_set.tool_evidence) >= 1

    # Knowledge evidence provenance from R-204 SOP or Spec
    k_evd = resp.evidence_set.knowledge_evidence[0]
    assert "SOP-R204" in k_evd.source_reference or "r204" in (k_evd.filename or "").lower()

    # Tool evidence from equipment_history
    t_evd = resp.evidence_set.tool_evidence[0]
    assert t_evd.tool_name == "equipment_history"
    assert t_evd.retrieved_data["equipment_id"] == "R-204"
    assert t_evd.retrieved_data["operating_status"] == "OPERATIONAL"

    # Final response grounded in evidence
    assert "31.2 bar" in resp.final_answer
    assert "R-204" in resp.final_answer
    assert "OPERATIONAL" in resp.final_answer
    assert "NOT require" in resp.final_answer or "not require" in resp.final_answer.lower()


@pytest.mark.asyncio
async def test_demo_multimodal_pressure_variance():
    """Scenario B: Multimodal vision inspection PI-204 correlated with SOP operating limits."""
    req = DemoRunRequest(
        scenario=DemoScenarioId.R204_PRESSURE_VARIANCE,
        role=Role.ENGINEER,
        classification=DataClassification.INTERNAL,
        deterministic=True,
    )
    resp = await demo_orchestration_service.run_scenario(req)

    assert resp.status == AgentQueryStatus.SUCCESS
    assert resp.verification is not None

    # Visual Evidence captured
    assert resp.evidence_set is not None
    assert len(resp.evidence_set.visual_evidence) >= 1
    v_evd = resp.evidence_set.visual_evidence[0]
    assert v_evd.source_image_hash is not None
    assert v_evd.finding_id is not None
    assert v_evd.retrieved_data["observed_value"] == 33.0
    assert v_evd.retrieved_data["unit"] == "bar"

    # Deterministic calculations: pressure variance & pressure margin
    assert len(resp.calculations) >= 2
    calc_types = [c.calculation_type for c in resp.calculations]
    assert "pressure_variance" in calc_types
    assert "pressure_margin" in calc_types

    variance_calc = next(c for c in resp.calculations if c.calculation_type == "pressure_variance")
    assert variance_calc.result == pytest.approx(1.8, abs=0.01)

    margin_calc = next(c for c in resp.calculations if c.calculation_type == "pressure_margin")
    assert margin_calc.result == pytest.approx(2.0, abs=0.01)

    # Verification status reflects operational variance detected
    assert resp.verification.status == VerificationStatus.NEEDS_REVIEW
    param_check = next(c for c in resp.verification.checks if c.check_type == "PARAMETER_CONSISTENCY")
    assert param_check.status == VerificationStatus.NEEDS_REVIEW

    # Final response flags review requirement
    assert "NEEDS ENGINEERING REVIEW" in resp.final_answer
    assert "33.0 bar" in resp.final_answer
    assert "1.8 bar" in resp.final_answer or "+1.8" in resp.final_answer


@pytest.mark.asyncio
async def test_demo_policy_denial():
    """Scenario C: Unauthorized critical valve calibration blocked by PolicyGateway."""
    req = DemoRunRequest(
        scenario=DemoScenarioId.POLICY_DENIAL,
        role=Role.ENGINEER,
        classification=DataClassification.INTERNAL,
        deterministic=True,
    )
    resp = await demo_orchestration_service.run_scenario(req)

    # Blocked by sovereign policy
    assert resp.status == AgentQueryStatus.POLICY_DENIED
    assert resp.policy_decisions is not None
    assert len(resp.policy_decisions) >= 1

    denial = resp.policy_decisions[0]
    assert denial.decision == PolicyDecisionType.DENY
    assert "Role 'ENGINEER' is not authorized" in denial.reason or "supervisor approval" in denial.reason

    # Final answer clearly communicates denial
    assert "Execution blocked by sovereign policy" in resp.final_answer
    assert "calibrate_pressure_relief_valve" in resp.final_answer

    # Verification confirms policy compliance: denied tool did not execute
    assert resp.verification is not None
    policy_check = next(c for c in resp.verification.checks if c.check_type == "POLICY_COMPLIANCE")
    assert policy_check.status == VerificationStatus.VERIFIED


@pytest.mark.asyncio
async def test_demo_prompt_injection():
    """Scenario D: Indirect prompt injection in technical bulletin isolated strictly as data."""
    req = DemoRunRequest(
        scenario=DemoScenarioId.PROMPT_INJECTION,
        role=Role.ENGINEER,
        classification=DataClassification.INTERNAL,
        deterministic=True,
    )
    resp = await demo_orchestration_service.run_scenario(req)

    assert resp.status == AgentQueryStatus.SUCCESS

    # Audit sink recorded security alert
    agent_events = audit_event_sink.get_agent_events(limit=50)
    security_alerts = [e for e in agent_events if e.event_type == AgentEventType.SECURITY_ALERT]
    assert len(security_alerts) >= 1
    assert any("previous instructions" in str(alert.details).lower() for alert in security_alerts)


    # Security events populated in demo response
    assert len(resp.security_events) >= 1

    # Zero unauthorized tools executed
    assert len(resp.tool_calls) == 0
    assert len(resp.evidence_set.tool_evidence) == 0

    # Response communicates detection and passive data isolation
    assert "SECURITY ADVISORY" in resp.final_answer
    assert "UNTRUSTED DATA" in resp.final_answer or "untrusted" in resp.final_answer.lower()


@pytest.mark.asyncio
async def test_demo_denied_tool_not_executed():
    """Prove that unauthorized critical tool handler is NEVER called when denied."""
    initial_count = CALIBRATION_EXECUTION_COUNTER["count"]
    assert initial_count == 0

    req = DemoRunRequest(
        scenario=DemoScenarioId.POLICY_DENIAL,
        role=Role.ENGINEER,
        classification=DataClassification.INTERNAL,
        deterministic=True,
    )
    resp = await demo_orchestration_service.run_scenario(req)

    assert resp.status == AgentQueryStatus.POLICY_DENIED
    # Counter must remain strictly zero
    assert CALIBRATION_EXECUTION_COUNTER["count"] == 0
    # No tool evidence was produced
    assert len(resp.evidence_set.tool_evidence) == 0


@pytest.mark.asyncio
async def test_demo_evidence_provenance():
    """Verify that all evidence items have verifiable cryptographic and source provenance."""
    req = DemoRunRequest(
        scenario=DemoScenarioId.R204_INVESTIGATION,
        deterministic=True,
    )
    resp = await demo_orchestration_service.run_scenario(req)

    for evd in resp.evidence_set.all_evidence:
        assert evd.evidence_id.startswith("evd-")
        assert evd.source_reference
        assert evd.classification is not None
        assert evd.verified is True

        if evd.source_type == "knowledge_document":
            assert evd.document_id is not None
            assert evd.chunk_id is not None
            assert evd.filename is not None
        elif evd.source_type == "LOCAL_INDUSTRIAL_TOOL":
            assert evd.tool_name == "equipment_history"
            assert evd.tool_execution_id is not None


@pytest.mark.asyncio
async def test_demo_verification_trace():
    """Verify that VerificationEngine executes all 7 deterministic checks."""
    req = DemoRunRequest(
        scenario=DemoScenarioId.R204_INVESTIGATION,
        deterministic=True,
    )
    resp = await demo_orchestration_service.run_scenario(req)

    assert resp.verification is not None
    checks = resp.verification.checks
    assert len(checks) == 7

    check_types = {c.check_type for c in checks}
    expected_types = {
        "PROVENANCE",
        "COMPLETENESS",
        "POLICY_COMPLIANCE",
        "CLASSIFICATION",
        "PARAMETER_CONSISTENCY",
        "CALCULATION_VALIDATION",
        "GROUNDING_SUPPORT",
    }
    assert check_types == expected_types

    for chk in checks:
        assert chk.status in (VerificationStatus.VERIFIED, VerificationStatus.NEEDS_REVIEW)
        assert len(chk.description) > 0


@pytest.mark.asyncio
async def test_demo_audit_trace():
    """Verify that end-to-end execution generates full auditable lifecycle events."""
    req = DemoRunRequest(
        scenario=DemoScenarioId.R204_INVESTIGATION,
        deterministic=True,
    )
    resp = await demo_orchestration_service.run_scenario(req)

    agent_events = audit_event_sink.get_agent_events(limit=50)
    event_types = [e.event_type.value for e in agent_events]

    # Required lifecycle phases
    assert AgentEventType.AGENT_REQUEST.value in event_types
    assert AgentEventType.AGENT_PLAN_CREATED.value in event_types
    assert AgentEventType.KNOWLEDGE_RETRIEVAL_REQUESTED.value in event_types
    assert AgentEventType.KNOWLEDGE_RETRIEVAL_COMPLETED.value in event_types
    assert AgentEventType.TOOL_REQUESTED.value in event_types
    assert AgentEventType.POLICY_EVALUATED.value in event_types
    assert AgentEventType.TOOL_EXECUTED.value in event_types
    assert AgentEventType.EVIDENCE_CREATED.value in event_types
    assert AgentEventType.VERIFICATION_STARTED.value in event_types
    assert AgentEventType.VERIFICATION_CHECK.value in event_types
    assert AgentEventType.VERIFICATION_COMPLETED.value in event_types
    assert AgentEventType.AGENT_FINAL_RESPONSE.value in event_types


def test_api_demo_scenarios_endpoint():
    """Test GET /api/v1/demo/scenarios endpoint."""
    response = client.get("/api/v1/demo/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    scenario_ids = [s["id"] for s in data]
    assert "r204_investigation" in scenario_ids
    assert "r204_pressure_variance" in scenario_ids
    assert "policy_denial" in scenario_ids
    assert "prompt_injection" in scenario_ids


def test_api_demo_run_endpoint():
    """Test POST /api/v1/demo/run endpoint."""
    payload = {
        "scenario": "r204_investigation",
        "role": "ENGINEER",
        "deterministic": True,
    }
    response = client.post("/api/v1/demo/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario"] == "r204_investigation"
    assert data["status"] == "SUCCESS"
    assert "31.2 bar" in data["final_answer"]
    assert len(data["execution_phases"]) >= 7
    assert data["is_synthetic"] is True
