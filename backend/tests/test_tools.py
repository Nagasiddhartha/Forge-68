"""Tests for Tool Registry, equipment_history tool, and Policy Execution Pipeline."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.security import (
    DataClassification,
    ExecutionStatus,
    PolicyDecisionType,
    PolicyEvaluationRequest,
    Role,
    audit_event_sink,
)
from app.tools import (
    EquipmentHistoryInput,
    EquipmentHistoryOutput,
    EquipmentHistoryTool,
    ToolInvocationRequest,
    execute_tool_with_policy,
    tool_registry,
)


client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_audit_sink():
    audit_event_sink.clear()
    yield
    audit_event_sink.clear()


# =========================================================================
# Deterministic equipment_history Tool Tests
# =========================================================================

def test_equipment_history_r204():
    """Verify deterministic query for reactor R-204."""
    tool = EquipmentHistoryTool()
    res = tool.definition.handler(EquipmentHistoryInput(equipment_id="R-204"))

    assert isinstance(res, EquipmentHistoryOutput)
    assert res.equipment_id == "R-204"
    assert "Reactor" in res.equipment_type
    assert res.operating_status == "OPERATIONAL"
    assert len(res.maintenance_events) >= 2
    assert "Corrosion rate nominal" in str(res.maintenance_events) or "agitator" in str(res.maintenance_events).lower()


def test_equipment_history_p201():
    """Verify deterministic query for pump P-201."""
    tool = EquipmentHistoryTool()
    res = tool.definition.handler(EquipmentHistoryInput(equipment_id="P-201"))

    assert res.equipment_id == "P-201"
    assert "Pump" in res.equipment_type
    assert res.operating_status == "MAINTENANCE_REQUIRED"
    assert len(res.previous_findings) > 0


def test_equipment_history_e301():
    """Verify deterministic query for heat exchanger E-301."""
    tool = EquipmentHistoryTool()
    res = tool.definition.handler(EquipmentHistoryInput(equipment_id="E-301"))

    assert res.equipment_id == "E-301"
    assert "Exchanger" in res.equipment_type
    assert res.operating_status == "OPERATIONAL"


def test_equipment_history_not_found():
    """Verify that unknown equipment tags fail gracefully with ValueError."""
    tool = EquipmentHistoryTool()
    with pytest.raises(ValueError) as exc:
        tool.definition.handler(EquipmentHistoryInput(equipment_id="Z-999"))
    assert "not found in local registry" in str(exc.value)


# =========================================================================
# Tool Registry Tests
# =========================================================================

def test_registry_lists_tools():
    """Verify tool registry metadata inspection."""
    tools = tool_registry.list_tools()
    tool_names = [t.name for t in tools]
    assert "equipment_history" in tool_names


def test_registry_rejects_arbitrary_or_unregistered_tool():
    """Verify unregistered tools raise KeyError."""
    with pytest.raises(KeyError) as exc:
        tool_registry.execute_tool("arbitrary_bash_exec", {"cmd": "ls"})
    assert "not registered" in str(exc.value)


# =========================================================================
# Policy-Controlled Execution Pipeline Tests
# =========================================================================

def test_pipeline_allowed_execution():
    """Allowed request executes tool and returns structured result."""
    request = ToolInvocationRequest(
        requester="operator_lead",
        role=Role.ENGINEER,
        tool_name="equipment_history",
        classification=DataClassification.INTERNAL,
        parameters={"equipment_id": "R-204"},
    )
    result = execute_tool_with_policy(request)

    assert result.success is True
    assert result.decision.decision == PolicyDecisionType.ALLOW
    assert result.data is not None
    assert result.data["equipment_id"] == "R-204"
    assert result.error is None


def test_pipeline_denied_execution_does_not_execute_tool():
    """Denied request does NOT invoke tool handler."""
    request = ToolInvocationRequest(
        requester="guest_user",
        role=Role.MANAGER,  # Unauthorized for equipment_history
        tool_name="equipment_history",
        classification=DataClassification.INTERNAL,
        parameters={"equipment_id": "R-204"},
    )
    result = execute_tool_with_policy(request)

    assert result.success is False
    assert result.decision.decision == PolicyDecisionType.DENY
    assert result.data is None
    assert "is not authorized" in result.error


# =========================================================================
# API Endpoint Integration Tests
# =========================================================================

def test_api_get_tools():
    """GET /api/v1/tools returns registered tool metadata."""
    resp = client.get("/api/v1/tools")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(t["name"] == "equipment_history" for t in data)


def test_api_post_policy_evaluate():
    """POST /api/v1/policy/evaluate evaluates policy without executing."""
    payload = {
        "requester": "agent_alpha",
        "role": "ENGINEER",
        "tool_name": "equipment_history",
        "classification": "INTERNAL",
        "parameters": {"equipment_id": "R-204"},
        "has_approval": False,
    }
    resp = client.post("/api/v1/policy/evaluate", json=payload)
    assert resp.status_code == 200
    decision = resp.json()
    assert decision["decision"] == "ALLOW"
    assert decision["tool"] == "equipment_history"


def test_api_post_tools_execute_allowed():
    """POST /api/v1/tools/execute executes tool if allowed."""
    payload = {
        "requester": "engineer_alice",
        "role": "ENGINEER",
        "tool_name": "equipment_history",
        "classification": "INTERNAL",
        "parameters": {"equipment_id": "R-204"},
    }
    resp = client.post("/api/v1/tools/execute", json=payload)
    assert resp.status_code == 200
    res = resp.json()
    assert res["success"] is True
    assert res["data"]["equipment_id"] == "R-204"


def test_api_post_tools_execute_denied():
    """POST /api/v1/tools/execute returns HTTP 403 when policy denies."""
    payload = {
        "requester": "manager_bob",
        "role": "MANAGER",
        "tool_name": "equipment_history",
        "classification": "INTERNAL",
        "parameters": {"equipment_id": "R-204"},
    }
    resp = client.post("/api/v1/tools/execute", json=payload)
    assert resp.status_code == 403
    res = resp.json()
    assert res["success"] is False
    assert res["decision"]["decision"] == "DENY"
    assert "is not authorized" in res["error"]
