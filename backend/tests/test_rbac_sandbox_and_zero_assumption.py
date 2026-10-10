"""Integration tests verifying Zero-Assumption Knowledge Guard and Live RBAC Sandbox Execution."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.tools.industrial.equipment import CALIBRATION_EXECUTION_COUNTER


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_zero_assumption_unknown_asset_rejection(client):
    """Verify queries for unrecorded equipment tags (R1522, R-304) are strictly refused without aliasing."""
    # 1. Query for Reactor R1522 in English
    resp_en = client.post(
        "/api/v1/knowledge/search",
        json={
            "query": "What is reactor R1522?",
            "synthesize": True,
            "language": "en",
            "classification": "CONFIDENTIAL",
        },
    )
    assert resp_en.status_code == 200
    answer_en = resp_en.json()["synthesized_answer"]
    assert "SOVEREIGN ZERO-ASSUMPTION" in answer_en
    assert "R-1522" in answer_en
    assert "assuming it is" not in answer_en.lower()
    assert "assumed to be" not in answer_en.lower()

    # 2. Query in Kannada
    resp_kn = client.post(
        "/api/v1/knowledge/search",
        json={
            "query": "ರಿಯಾಕ್ಟರ್ R-1522 ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಿ",
            "synthesize": True,
            "language": "kn",
            "classification": "CONFIDENTIAL",
        },
    )
    assert resp_kn.status_code == 200
    answer_kn = resp_kn.json()["synthesized_answer"]
    assert "R-1522" in answer_kn
    assert "ಶೂನ್ಯ-ಊಹೆ" in answer_kn

    # 3. Query in Hindi
    resp_hi = client.post(
        "/api/v1/knowledge/search",
        json={
            "query": "रिएक्टर R-304 क्या है?",
            "synthesize": True,
            "language": "hi",
            "classification": "CONFIDENTIAL",
        },
    )
    assert resp_hi.status_code == 200
    answer_hi = resp_hi.json()["synthesized_answer"]
    assert "R-304" in answer_hi
    assert "शून्य-धारणा" in answer_hi


def test_rbac_sandbox_preset_1_inspector_actuation_blocked(client):
    """Preset 1: Inspector attempting valve calibration is blocked by Role policy."""
    initial_count = CALIBRATION_EXECUTION_COUNTER["count"]
    payload = {
        "requester": "inspector_live_tester",
        "role": "INSPECTOR",
        "tool_name": "calibrate_pressure_relief_valve",
        "classification": "INTERNAL",
        "parameters": {"equipment_id": "PRV-204", "target_setpoint_bar": 42.5},
        "has_approval": False,
    }

    # Evaluate dry run
    eval_resp = client.post("/api/v1/policy/evaluate", json=payload)
    assert eval_resp.status_code == 200
    assert eval_resp.json()["decision"] == "DENY"
    assert "not authorized" in eval_resp.json()["reason"].lower()

    # Live execute
    exec_resp = client.post("/api/v1/tools/execute", json=payload)
    assert exec_resp.status_code == 403
    data = exec_resp.json()
    assert data["success"] is False
    assert data["decision"]["decision"] == "DENY"
    # Proof: Tool handler was never called
    assert CALIBRATION_EXECUTION_COUNTER["count"] == initial_count


def test_rbac_sandbox_preset_2_admin_unapproved_calibration_blocked(client):
    """Preset 2: Admin attempting calibration without supervisor approval is blocked."""
    initial_count = CALIBRATION_EXECUTION_COUNTER["count"]
    payload = {
        "requester": "admin_live_tester",
        "role": "ADMIN",
        "tool_name": "calibrate_pressure_relief_valve",
        "classification": "RESTRICTED",
        "parameters": {"equipment_id": "PRV-204", "target_setpoint_bar": 42.5},
        "has_approval": False,
    }

    exec_resp = client.post("/api/v1/tools/execute", json=payload)
    assert exec_resp.status_code == 403
    data = exec_resp.json()
    assert data["success"] is False
    assert data["decision"]["decision"] == "DENY"
    assert "supervisor approval" in data["error"].lower()
    assert CALIBRATION_EXECUTION_COUNTER["count"] == initial_count


def test_rbac_sandbox_preset_3_engineer_telemetry_allowed(client):
    """Preset 3: Engineer looking up equipment history is permitted and executed."""
    payload = {
        "requester": "engineer_live_tester",
        "role": "ENGINEER",
        "tool_name": "equipment_history",
        "classification": "CONFIDENTIAL",
        "parameters": {"equipment_id": "R-204"},
        "has_approval": False,
    }

    exec_resp = client.post("/api/v1/tools/execute", json=payload)
    assert exec_resp.status_code == 200
    data = exec_resp.json()
    assert data["success"] is True
    assert data["decision"]["decision"] == "ALLOW"
    assert data["data"]["equipment_id"] == "R-204"
    assert "Reactor" in data["data"]["equipment_type"]
    assert len(data["data"]["maintenance_events"]) >= 1


def test_rbac_sandbox_preset_4_admin_emergency_shutdown_with_approval(client):
    """Preset 4: Admin emergency trip with approval co-signature is permitted and executed."""
    payload = {
        "requester": "admin_live_tester",
        "role": "ADMIN",
        "tool_name": "emergency_shutdown",
        "classification": "CRITICAL",
        "parameters": {"equipment_id": "R-204", "reason": "Demonstration Trip"},
        "has_approval": True,
    }

    exec_resp = client.post("/api/v1/tools/execute", json=payload)
    assert exec_resp.status_code == 200
    data = exec_resp.json()
    assert data["success"] is True
    assert data["decision"]["decision"] == "ALLOW"
    assert data["data"]["status"] == "EMERGENCY_SHUTDOWN_EXECUTED"
    assert "QCV-204A" in data["data"]["isolated_valves"]


def test_rbac_sandbox_preset_5_arbitrary_tool_default_deny(client):
    """Preset 5: Unknown/arbitrary tool injection is strictly rejected via Default-Deny."""
    payload = {
        "requester": "admin_live_tester",
        "role": "ADMIN",
        "tool_name": "arbitrary_remote_shell",
        "classification": "CRITICAL",
        "parameters": {"cmd": "whoami"},
        "has_approval": True,
    }

    exec_resp = client.post("/api/v1/tools/execute", json=payload)
    assert exec_resp.status_code == 403
    data = exec_resp.json()
    assert data["success"] is False
    assert data["decision"]["decision"] == "DENY"
    assert "unregistered" in data["error"].lower()


def test_rbac_viewer_knowledge_allowed_but_tools_blocked(client):
    """Verify VIEWER role: knowledge search permitted, but all tools blocked."""
    # 1. Knowledge search is allowed
    k_resp = client.post(
        "/api/v1/knowledge/search",
        json={
            "query": "What is reactor R-204?",
            "synthesize": True,
            "language": "en",
            "classification": "INTERNAL",
        },
    )
    assert k_resp.status_code == 200
    assert len(k_resp.json()["results"]) > 0

    # 2. Tool execution is strictly blocked
    t_resp = client.post(
        "/api/v1/tools/execute",
        json={
            "requester": "viewer_user",
            "role": "VIEWER",
            "tool_name": "equipment_history",
            "classification": "PUBLIC",
            "parameters": {"equipment_id": "R-204"},
            "has_approval": False,
        },
    )
    assert t_resp.status_code == 403
    data = t_resp.json()
    assert data["success"] is False
    assert "read-only knowledge" in data["error"].lower()


def test_rbac_intern_requires_approval_for_all_tools(client):
    """Verify INTERN role: requires approval for all tools, but allowed when approved."""
    # 1. Knowledge search is allowed
    k_resp = client.post(
        "/api/v1/knowledge/search",
        json={
            "query": "What is reactor R-204?",
            "synthesize": True,
            "language": "en",
            "classification": "INTERNAL",
        },
    )
    assert k_resp.status_code == 200

    # 2. Equipment history without approval -> DENIED
    unapproved_resp = client.post(
        "/api/v1/tools/execute",
        json={
            "requester": "intern_user",
            "role": "INTERN",
            "tool_name": "equipment_history",
            "classification": "INTERNAL",
            "parameters": {"equipment_id": "R-204"},
            "has_approval": False,
        },
    )
    assert unapproved_resp.status_code == 403
    assert "supervisor approval" in unapproved_resp.json()["error"].lower()

    # 3. Equipment history with approval -> ALLOWED
    approved_resp = client.post(
        "/api/v1/tools/execute",
        json={
            "requester": "intern_user",
            "role": "INTERN",
            "tool_name": "equipment_history",
            "classification": "INTERNAL",
            "parameters": {"equipment_id": "R-204"},
            "has_approval": True,
        },
    )
    assert approved_resp.status_code == 200
    assert approved_resp.json()["success"] is True
    assert approved_resp.json()["data"]["equipment_id"] == "R-204"

