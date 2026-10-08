"""Integration tests for resilient offline custom query router and multilingual synthesis."""

from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient

from app.core import (
    AgentActionType,
    AgentQueryRequest,
    AgentQueryResponse,
    AgentQueryStatus,
    AgentReasoningService,
)
from app.main import app
from app.models.base import BaseModelProvider, ModelRequest, ModelResponse
from app.models.ollama import LocalModelNotFoundError, OllamaUnavailableError
from app.security.models import DataClassification, Role

client = TestClient(app)


class FailingModelProvider(BaseModelProvider):
    """Model provider that simulates missing model weights or offline Ollama."""

    async def generate(self, request: ModelRequest) -> ModelResponse:
        raise LocalModelNotFoundError("Local model 'qwen3:8b' not found in Ollama library.")

    async def generate_stream(self, request: ModelRequest):
        raise OllamaUnavailableError("Local Ollama service unreachable.")

    async def health_check(self) -> bool:
        return False

    async def list_models(self):
        return []


@pytest.mark.asyncio
async def test_offline_fallback_pump_p201():
    """Verify custom query for P-201 resolves via offline router when Ollama model is missing."""
    service = AgentReasoningService(model_provider=FailingModelProvider())
    req = AgentQueryRequest(
        query="Show me the maintenance history of Pump P-201",
        role=Role.ENGINEER,
        classification=DataClassification.INTERNAL,
    )
    resp = await service.process_query(req)

    assert resp.status == AgentQueryStatus.OFFLINE_FALLBACK
    assert "P-201" in resp.final_answer
    assert "Centrifugal Slurry Feed Pump" in resp.final_answer
    assert "MAINTENANCE_REQUIRED" in resp.final_answer
    assert "Impeller replacement" in resp.final_answer or "vibration" in resp.final_answer
    assert resp.plan is not None
    assert any(tc.tool_name == "equipment_history" for tc in resp.plan.tool_calls)
    assert resp.verification is not None


@pytest.mark.asyncio
async def test_offline_fallback_reactor_r204():
    """Verify offline query for R-204 resolves tool telemetry and SOP knowledge."""
    service = AgentReasoningService(model_provider=FailingModelProvider())
    req = AgentQueryRequest(
        query="Inspect Reactor R-204 status and maintenance records",
        role=Role.ENGINEER,
        classification=DataClassification.CONFIDENTIAL,
    )
    resp = await service.process_query(req)

    assert resp.status == AgentQueryStatus.OFFLINE_FALLBACK
    assert "R-204" in resp.final_answer
    assert "Continuous Stirred-Tank Reactor" in resp.final_answer
    assert resp.verification is not None
    assert len(resp.verification.checks) >= 5


@pytest.mark.asyncio
async def test_offline_fallback_exchanger_e301():
    """Verify offline query for E-301 resolves maintenance events."""
    service = AgentReasoningService(model_provider=FailingModelProvider())
    req = AgentQueryRequest(
        query="Show maintenance inspection logs for Heat Exchanger E-301",
        role=Role.INSPECTOR,
        classification=DataClassification.INTERNAL,
    )
    resp = await service.process_query(req)

    assert resp.status == AgentQueryStatus.OFFLINE_FALLBACK
    assert "E-301" in resp.final_answer
    assert "hydroblasting" in resp.final_answer.lower() or "tube bundle" in resp.final_answer.lower() or "cooler" in resp.final_answer.lower()


@pytest.mark.asyncio
async def test_offline_fallback_kannada_localization():
    """Verify offline synthesis formats section headers in Kannada when locale='kn'."""
    service = AgentReasoningService(model_provider=FailingModelProvider())
    req = AgentQueryRequest(
        query="Show me the maintenance history of Pump P-201",
        locale="kn",
    )
    resp = await service.process_query(req)

    assert resp.status == AgentQueryStatus.OFFLINE_FALLBACK
    assert "ಸಾರ್ವಭೌಮ ಆಫ್‌ಲೈನ್ ಪರಿಶೀಲನಾ ವರದಿ" in resp.final_answer
    assert "ಪರಿಶೀಲಿಸಿದ ಉಪಕರಣ ಮಾಹಿತಿ" in resp.final_answer
    assert "P-201" in resp.final_answer


@pytest.mark.asyncio
async def test_offline_fallback_no_equipment_tag():
    """Verify general query without equipment tag falls back to knowledge retrieval."""
    service = AgentReasoningService(model_provider=FailingModelProvider())
    req = AgentQueryRequest(
        query="What are the standard operating safety procedures and emergency limits?",
        classification=DataClassification.INTERNAL,
    )
    resp = await service.process_query(req)

    assert resp.status == AgentQueryStatus.OFFLINE_FALLBACK
    assert resp.plan.action == AgentActionType.KNOWLEDGE
    assert len(resp.plan.knowledge_queries) >= 1


def test_api_offline_fallback_custom_query():
    """Verify live API handles missing local model gracefully without HTTP 500."""
    from app.core import agent_reasoning_service
    orig_provider = agent_reasoning_service.model_provider
    agent_reasoning_service.model_provider = FailingModelProvider()
    try:
        resp = client.post(
            "/api/v1/agent/query",
            json={
                "query": "Show maintenance history of Pump P-201",
                "role": "ENGINEER",
                "classification": "INTERNAL",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "OFFLINE_FALLBACK"
        assert "P-201" in data["final_answer"]
    finally:
        agent_reasoning_service.model_provider = orig_provider

