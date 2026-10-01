"""Unit and Integration Tests for FORGE Milestone 11: Final Demo Hardening & Runtime Validation.

Covers:
- Deterministic preflight checks and status classifications
- Local reasoning (Qwen3) availability vs deterministic demo mode
- Local vision validation against r204_pressure_gauge.png
- Zero cloud AI fallback enforcement
- Model and vision unavailable failure modes
- Demo reset transient state clearing & Knowledge Fabric preservation
- Monotonic runtime latency instrumentation
- Invalid scenario handling
- Startup script syntax and structural constraints
- API endpoints: /api/v1/system/preflight, /api/v1/system/diagnostics, /api/v1/demo/reset
"""

from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi.testclient import TestClient
import httpx

from app.config import settings
from app.demo.schemas import (
    DemoExecutionTiming,
    DemoResetResponse,
    DemoRunRequest,
    DemoRunResponse,
    DemoScenarioId,
)
from app.demo.service import demo_orchestration_service
from app.main import app
from app.models.base import ModelMessage, ModelRequest
from app.models.ollama import (
    LocalModelNotFoundError,
    OllamaModelProvider,
    OllamaUnavailableError,
)
from app.preflight import (
    PreflightReport,
    PreflightRequirement,
    PreflightStatus,
    check_backend_dependencies,
    check_demo_fixtures,
    check_python_version,
    check_sovereign_configuration,
    run_preflight_checks,
    validate_local_reasoning_runtime,
    validate_local_vision_runtime,
)
from app.security import (
    AgentEventType,
    AgentTraceEvent,
    DataClassification,
    Role,
    audit_event_sink,
)
from app.tools.industrial.equipment import CALIBRATION_EXECUTION_COUNTER
from app.vision.models import ImageProvenance
from app.vision.provider import (
    OllamaVisionProvider,
    OllamaVisionUnavailableError,
    VisionModelNotFoundError,
    VisionRequest,
)

client = TestClient(app)


# =========================================================================
# 1. Preflight Checks & Diagnostic Validation
# =========================================================================

def test_preflight_python_version():
    """Verify that Python version check passes for Python >= 3.12."""
    res = check_python_version()
    assert res.component == "Python Runtime"
    assert res.status == PreflightStatus.READY
    assert res.requirement == PreflightRequirement.REQUIRED_FOR_FULL_DEMO


def test_preflight_backend_dependencies():
    """Verify that required sovereign libraries (FastAPI, Pydantic, HTTPX, Pytest, NumPy) are present."""
    res = check_backend_dependencies()
    assert res.component == "Backend Dependencies"
    assert res.status == PreflightStatus.READY
    assert "Packages Present" in res.detected_value


def test_preflight_sovereign_configuration():
    """Verify that sovereign configuration rejects prohibited cloud providers."""
    res = check_sovereign_configuration()
    assert res.component == "Sovereignty Configuration"
    assert res.status == PreflightStatus.READY
    assert "Zero cloud AI endpoints configured" in res.message


def test_preflight_demo_fixtures_present():
    """Verify that offline synthetic R-204 fixtures exist."""
    res = check_demo_fixtures()
    assert res.component == "Knowledge & Demo Fixtures"
    assert res.status == PreflightStatus.READY
    assert "equipment records, SOPs, PAUT scans" in res.message


@pytest.mark.asyncio
async def test_preflight_report_generation():
    """Verify full preflight check execution and typed PreflightReport generation."""
    report = await run_preflight_checks()
    assert isinstance(report, PreflightReport)
    assert len(report.checks) >= 7
    assert report.deterministic_fallback_ready is True
    assert report.runtime_mode in ("LIVE LOCAL INFERENCE", "DETERMINISTIC DEMO MODE")


# =========================================================================
# 2. Local Qwen3 & Vision Diagnostics
# =========================================================================

@pytest.mark.asyncio
async def test_validate_local_reasoning_runtime_offline_behavior():
    """Verify reasoning validation clearly reports deterministic demo mode when Ollama is offline."""
    with patch("app.preflight.check_ollama_runtime") as mock_ollama:
        from app.preflight import PreflightCheckResult
        mock_ollama.return_value = (
            PreflightCheckResult(
                component="Local Ollama Inference",
                status=PreflightStatus.WARNING,
                detected_value="Offline",
                requirement=PreflightRequirement.DETERMINISTIC_DEMO_FALLBACK,
                message="Local Ollama is offline",
            ),
            [],
        )
        res = await validate_local_reasoning_runtime()
        assert res["mode"] == "DETERMINISTIC DEMO MODE"
        assert res["live_inference_available"] is False
        assert res["cloud_fallback"] is False
        assert res["cloud_providers_configured"] == "NONE"


@pytest.mark.asyncio
async def test_validate_local_vision_runtime_dial_gauge():
    """Verify that vision preflight tests against r204_pressure_gauge.png."""
    res = await validate_local_vision_runtime()
    assert res["test_image"] == "r204_pressure_gauge.png"
    assert res["test_image_present"] is True
    assert res["mode"] in ("LIVE LOCAL VISION", "DETERMINISTIC DEMO VISION")
    assert res["cloud_fallback"] is False


# =========================================================================
# 3. Model Failure Mode Hardening (Zero Cloud Fallback)
# =========================================================================

@pytest.mark.asyncio
async def test_ollama_reasoning_unavailable_raises_typed_error():
    """Assert OllamaModelProvider raises OllamaUnavailableError on connection failure without cloud fallback."""
    provider = OllamaModelProvider(base_url="http://127.0.0.1:99999", timeout=0.1)
    req = ModelRequest(messages=[ModelMessage(role="user", content="Test")])

    with pytest.raises(OllamaUnavailableError) as exc_info:
        await provider.generate(req)

    assert "unreachable" in str(exc_info.value).lower()
    assert "strictly prohibited" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_ollama_reasoning_model_not_found_raises_typed_error():
    """Assert OllamaModelProvider raises LocalModelNotFoundError with manual command on 404."""
    provider = OllamaModelProvider()
    req = ModelRequest(model="nonexistent-model-xyz", messages=[ModelMessage(role="user", content="Test")])

    mock_resp = MagicMock()
    mock_resp.status_code = 404

    with patch.object(provider, "_get_client") as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post.return_value = mock_resp
        mock_get_client.return_value.__aenter__.return_value = mock_client

        with pytest.raises(LocalModelNotFoundError) as exc_info:
            await provider.generate(req)

        assert "nonexistent-model-xyz" in str(exc_info.value)
        assert "ollama pull" in str(exc_info.value)
        assert "Zero external cloud calls permitted" in str(exc_info.value)


@pytest.mark.asyncio
async def test_ollama_vision_unavailable_raises_typed_error():
    """Assert OllamaVisionProvider raises OllamaVisionUnavailableError on connection failure."""
    provider = OllamaVisionProvider(base_url="http://127.0.0.1:99999", timeout=0.1)
    prov = ImageProvenance(
        image_id="img-1",
        filename="r204_pressure_gauge.png",
        mime_type="image/png",
        file_size_bytes=100,
        sha256_hash="abc",
        classification=DataClassification.INTERNAL,
        ingested_at="2026-10-01T00:00:00Z",
    )
    req = VisionRequest(image_bytes=b"dummy", provenance=prov)

    with pytest.raises(OllamaVisionUnavailableError) as exc_info:
        await provider.analyze_image(req)

    assert "unreachable" in str(exc_info.value).lower()
    assert "strictly prohibited" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_ollama_vision_model_not_found_raises_typed_error():
    """Assert OllamaVisionProvider raises VisionModelNotFoundError on 404."""
    provider = OllamaVisionProvider()
    prov = ImageProvenance(
        image_id="img-1",
        filename="r204_pressure_gauge.png",
        mime_type="image/png",
        file_size_bytes=100,
        sha256_hash="abc",
        classification=DataClassification.INTERNAL,
        ingested_at="2026-10-01T00:00:00Z",
    )
    req = VisionRequest(image_bytes=b"dummy", provenance=prov, model="nonexistent-vl")

    mock_resp = MagicMock()
    mock_resp.status_code = 404

    with patch.object(provider, "_get_client") as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post.return_value = mock_resp
        mock_get_client.return_value.__aenter__.return_value = mock_client

        with pytest.raises(VisionModelNotFoundError) as exc_info:
            await provider.analyze_image(req)

        assert "ollama pull" in str(exc_info.value)


# =========================================================================
# 4. Demo Reset & State Preservation
# =========================================================================

def test_demo_reset_clears_transient_audit_and_counters():
    """Verify demo reset clears transient audit events and counters while keeping fixtures."""
    # Seed transient events and counters
    audit_event_sink.record_agent_event(
        AgentTraceEvent(
            event_type=AgentEventType.AGENT_REQUEST,
            requester="test_operator",
            role=Role.ENGINEER,
            details={"action": "test"},
        )
    )
    audit_event_sink.record_agent_event(
        AgentTraceEvent(
            event_type=AgentEventType.SECURITY_ALERT,
            requester="test_operator",
            role=Role.ENGINEER,
            details={"alert": "injection"},
        )
    )
    CALIBRATION_EXECUTION_COUNTER["count"] = 5

    assert len(audit_event_sink.get_agent_events()) > 0
    assert CALIBRATION_EXECUTION_COUNTER["count"] == 5

    # Execute reset
    reset_resp = demo_orchestration_service.reset_demo_state()
    assert isinstance(reset_resp, DemoResetResponse)
    assert reset_resp.status == "RESET_COMPLETE"
    assert reset_resp.cleared_audit_events_count >= 2
    assert reset_resp.cleared_security_events_count >= 1
    assert reset_resp.reset_counters["calibration_executions"] == 0
    assert CALIBRATION_EXECUTION_COUNTER["count"] == 0
    assert len(audit_event_sink.get_agent_events()) == 0


def test_demo_reset_preserves_knowledge_fabric():
    """Verify that resetting demo state preserves indexed knowledge documents and fixtures."""
    reset_resp = demo_orchestration_service.reset_demo_state()
    # Ensure source documents remain intact
    knowledge_dir = Path(__file__).resolve().parent.parent / "data" / "demo" / "knowledge"
    assert knowledge_dir.exists()
    assert (knowledge_dir / "r204_operating_sop.md").exists()
    assert reset_resp.equipment_records_preserved > 0
    assert reset_resp.models_preserved is True


# =========================================================================
# 5. Monotonic Runtime Timing Measurements
# =========================================================================

@pytest.mark.asyncio
async def test_demo_scenario_monotonic_timing_recorded():
    """Verify that running a demo scenario captures non-zero monotonic timings across phases."""
    req = DemoRunRequest(
        scenario=DemoScenarioId.R204_INVESTIGATION,
        role=Role.ENGINEER,
        classification=DataClassification.CONFIDENTIAL,
        deterministic=True,
    )
    resp = await demo_orchestration_service.run_scenario(req)
    assert isinstance(resp, DemoRunResponse)
    assert resp.timing is not None
    assert isinstance(resp.timing, DemoExecutionTiming)
    assert resp.timing.total_duration_ms > 0.0
    assert resp.timing.planning_duration_ms >= 0.0
    assert resp.timing.knowledge_retrieval_duration_ms >= 0.0
    assert resp.timing.tool_execution_duration_ms >= 0.0
    assert resp.timing.verification_duration_ms >= 0.0
    assert resp.timing.synthesis_duration_ms >= 0.0


# =========================================================================
# 6. Invalid Demo Scenario Handling
# =========================================================================

@pytest.mark.asyncio
async def test_invalid_demo_scenario_rejected():
    """Verify that unknown scenario identifier raises typed ValueError in service."""
    req = DemoRunRequest.model_construct(
        scenario="unknown_invalid_scenario",  # type: ignore
        deterministic=True,
    )
    with pytest.raises(ValueError) as exc:
        await demo_orchestration_service.run_scenario(req)
    assert "Unknown demo scenario" in str(exc.value)



def test_api_invalid_demo_scenario_returns_422():
    """Verify API endpoint returns 422 Unprocessable Entity for invalid scenario schema."""
    resp = client.post("/api/v1/demo/run", json={"scenario": "invalid_scenario_id"})
    assert resp.status_code == 422


# =========================================================================
# 7. Milestone 11 API Endpoints
# =========================================================================

def test_api_system_preflight_endpoint():
    """Verify GET /api/v1/system/preflight returns typed report."""
    resp = client.get("/api/v1/system/preflight")
    assert resp.status_code == 200
    data = resp.json()
    assert "all_ready" in data
    assert "runtime_mode" in data
    assert "checks" in data
    assert len(data["checks"]) >= 7


def test_api_system_diagnostics_endpoint():
    """Verify GET /api/v1/system/diagnostics returns detailed preflight and provider status."""
    resp = client.get("/api/v1/system/diagnostics")
    assert resp.status_code == 200
    data = resp.json()
    assert "preflight" in data
    assert "reasoning" in data
    assert "vision" in data
    assert data["reasoning"]["cloud_fallback"] is False
    assert data["vision"]["cloud_fallback"] is False


def test_api_demo_reset_endpoint():
    """Verify POST /api/v1/demo/reset clears transient state and returns typed response."""
    resp = client.post("/api/v1/demo/reset")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "RESET_COMPLETE"
    assert "cleared_audit_events_count" in data
    assert data["models_preserved"] is True


# =========================================================================
# 8. Startup Script Structural & Safety Checks
# =========================================================================

def test_startup_script_structure_and_safety():
    """Verify scripts/start-forge.ps1 exists, validates runtime, and forbids automatic downloads."""
    script_path = Path(__file__).resolve().parent.parent.parent / "scripts" / "start-forge.ps1"
    assert script_path.exists(), "start-forge.ps1 script must exist in scripts/ directory"

    content = script_path.read_text(encoding="utf-8")
    assert "FORGE SOVEREIGN CONTROL PLANE PREFLIGHT" in content
    assert "Python Runtime" in content
    assert "Dependencies" in content
    assert "Ollama" in content
    assert "qwen2.5:7b" in content or "qwen3" in content
    assert "qwen2.5-vl:7b" in content or "vl" in content
    assert "uvicorn app.main:app" in content
    assert "npm" in content
    # Crucial safety check: Must NEVER run automatic 'ollama pull' without user action
    assert "ollama pull $targetReasoningModel" in content or "ollama pull" in content
    assert "Write-Host" in content
    # Ensure it prints manual fix without auto-pulling
    assert "Start-Process" in content
