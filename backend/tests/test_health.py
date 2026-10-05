"""Test cases for FORGE health and system status endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_health_endpoint():
    """Verify that /health returns HTTP 200 and expected sovereign metadata."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "FORGE Control Plane"
    assert data["sovereign_mode"] is True
    assert "version" in data
    assert "model_provider" in data
    assert "default_model" in data
    assert "model_provider_online" in data


def test_system_status():
    """Verify system status reports sovereignty enforcement."""
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["sovereignty_enforced"] is True
    assert data["external_api_calls_blocked"] is True


def test_runtime_capabilities():
    """Verify that /api/runtime/capabilities returns the Section 12.1 typed capability model."""
    for path in ("/api/runtime/capabilities", "/api/v1/system/capabilities"):
        response = client.get(path)
        assert response.status_code == 200
        data = response.json()
        assert "mode" in data
        assert "reasoning" in data
        assert "vision" in data
        assert "embedding" in data
        assert "policy" in data
        assert data["policy"]["default"] == "deny"
        assert data["outside_ai_services_configured"] == 0
        assert data["inference_endpoint_is_loopback"] is True
        assert data["dependency_scan"]["cloud_sdks_found"] == 0
        assert data["egress_counter"] is None
        assert "audit" in data
        assert "security_tests" in data

