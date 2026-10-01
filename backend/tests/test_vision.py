"""Unit, integration, and security test suite for FORGE Multimodal Engineering Intelligence."""

import base64
import json
import os
import struct
import zlib
import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.core import AgentQueryRequest, AgentQueryResponse, AgentQueryStatus, AgentReasoningService
from app.main import app
from app.models import MockModelProvider
from app.security import DataClassification, Role
from app.verification import EvidenceRecord, EvidenceSet, VerificationEngine, VerificationStatus
from app.vision import (
    FindingType,
    ImageIngestionError,
    ImageProvenance,
    ImageSizeLimitError,
    MockVisionProvider,
    OllamaVisionProvider,
    PathTraversalError,
    SeverityLevel,
    UnsupportedImageType,
    VisionAnalyzeRequest,
    VisionRequest,
    VisionService,
    VisualFinding,
    VisualProvenance,
    detect_mime_and_dimensions,
    get_vision_provider,
    parse_visual_findings,
    validate_and_load_image_file,
    validate_image_bytes,
)

client = TestClient(app)


def make_valid_png_bytes(width: int = 64, height: int = 64, color: tuple = (20, 40, 80)) -> bytes:
    """Construct deterministic minimal valid PNG bytes."""
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    ihdr_crc = struct.pack(">I", zlib.crc32(b"IHDR" + ihdr_data) & 0xFFFFFFFF)
    ihdr = struct.pack(">I", len(ihdr_data)) + b"IHDR" + ihdr_data + ihdr_crc

    raw = bytearray()
    for _ in range(height):
        raw.append(0)
        raw.extend(bytes(color) * width)
    compressed = zlib.compress(bytes(raw))
    idat_crc = struct.pack(">I", zlib.crc32(b"IDAT" + compressed) & 0xFFFFFFFF)
    idat = struct.pack(">I", len(compressed)) + b"IDAT" + compressed + idat_crc

    iend_crc = struct.pack(">I", zlib.crc32(b"IEND") & 0xFFFFFFFF)
    iend = struct.pack(">I", 0) + b"IEND" + iend_crc
    return sig + ihdr + idat + iend


def make_valid_jpeg_bytes() -> bytes:
    """Construct minimal valid JPEG bytes."""
    soi = b"\xff\xd8"
    app0 = b"\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    sof0 = b"\xff\xc0\x00\x0b\x08\x00\x20\x00\x20\x01\x01\x11\x00"
    sos = b"\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00"
    img_data = b"\x00"
    eoi = b"\xff\xd9"
    return soi + app0 + sof0 + sos + img_data + eoi


def make_valid_webp_bytes() -> bytes:
    """Construct minimal valid WebP bytes."""
    vp8l_data = bytes([0x2F, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00])
    return b"RIFF" + struct.pack("<I", 4 + 8 + len(vp8l_data)) + b"WEBPVP8L" + struct.pack("<I", len(vp8l_data)) + vp8l_data


# =========================================================================
# 1. Image Ingestion and Supported Format Tests
# =========================================================================

def test_valid_image_ingestion_png():
    """Verify PNG image validation, SHA-256 computation, and dimension extraction."""
    png_bytes = make_valid_png_bytes(64, 48)
    prov = validate_image_bytes(png_bytes, "gauge_test.png", DataClassification.INTERNAL)

    assert prov.mime_type == "image/png"
    assert prov.filename == "gauge_test.png"
    assert prov.width == 64
    assert prov.height == 48
    assert len(prov.sha256_hash) == 64
    assert prov.classification == DataClassification.INTERNAL


def test_supported_image_types():
    """Verify PNG, JPEG, and WebP formats are all correctly accepted."""
    # 1. PNG
    png_bytes = make_valid_png_bytes(32, 32)
    mime, w, h = detect_mime_and_dimensions(png_bytes)
    assert mime == "image/png"
    assert w == 32 and h == 32

    # 2. JPEG
    jpeg_bytes = make_valid_jpeg_bytes()
    mime, w, h = detect_mime_and_dimensions(jpeg_bytes)
    assert mime == "image/jpeg"
    assert w == 32 and h == 32

    # 3. WebP
    webp_bytes = make_valid_webp_bytes()
    mime, w, h = detect_mime_and_dimensions(webp_bytes)
    assert mime == "image/webp"


def test_unsupported_image_types_rejected():
    """Verify unsupported formats (GIF, BMP, SVG, executable binaries) are rejected."""
    # GIF header
    gif_bytes = b"GIF89a" + b"\x00" * 20
    with pytest.raises(UnsupportedImageType):
        validate_image_bytes(gif_bytes, "test.gif")

    # Windows PE executable header
    exe_bytes = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00" + b"\x00" * 20
    with pytest.raises(UnsupportedImageType):
        validate_image_bytes(exe_bytes, "malware.exe")

    # Extension mismatch
    png_bytes = make_valid_png_bytes(16, 16)
    with pytest.raises(UnsupportedImageType):
        validate_image_bytes(png_bytes, "fraudulent.jpg")


def test_oversized_image_rejected(monkeypatch):
    """Verify images exceeding MAX_IMAGE_SIZE_BYTES are rejected."""
    # Temporarily set limit to 200 bytes
    monkeypatch.setattr(settings, "MAX_IMAGE_SIZE_BYTES", 200)
    png_bytes = make_valid_png_bytes(128, 128)
    assert len(png_bytes) > 200

    with pytest.raises(ImageSizeLimitError):
        validate_image_bytes(png_bytes, "oversized.png")


def test_path_traversal_image_rejected():
    """Verify path traversal escapes are rejected."""
    with pytest.raises(PathTraversalError):
        validate_and_load_image_file("../../etc/shadow", allowed_base_dir="data/demo/images")

    with pytest.raises(PathTraversalError):
        validate_and_load_image_file("../../../windows/system32/cmd.exe", allowed_base_dir="data/demo/images")


# =========================================================================
# 2. Schema Validation, Observer Boundary & Anti-Injection Tests
# =========================================================================

def test_visual_finding_schema_validation():
    """Verify valid VisualFinding model construction with verifiable provenance."""
    img_hash = "a" * 64
    prov = VisualProvenance(
        image_hash=img_hash,
        image_filename="reactor_gauge.png",
        location_notes="Discharge port",
        observer_model="mock-qwen-vl",
    )
    finding = VisualFinding(
        finding_type=FindingType.PRESSURE_GAUGE_READING,
        description="Analog dial shows 33.0 bar gauge.",
        equipment_id="R-204",
        location="Discharge nozzle",
        severity=SeverityLevel.INFO,
        observed_value=33.0,
        unit="bar",
        confidence=0.95,
        source_image_hash=img_hash,
        provenance=prov,
    )
    assert finding.observed_value == 33.0
    assert finding.finding_type == FindingType.PRESSURE_GAUGE_READING


def test_fabricated_provenance_rejected():
    """Verify finding with mismatched image hash is rejected."""
    prov = VisualProvenance(
        image_hash="a" * 64,
        image_filename="reactor.png",
        observer_model="mock-qwen-vl",
    )
    with pytest.raises(ValueError, match="Provenance integrity violation"):
        VisualFinding(
            finding_type=FindingType.CORROSION,
            description="Surface corrosion.",
            equipment_id="R-204",
            confidence=0.8,
            source_image_hash="b" * 64,  # Mismatched hash!
            provenance=prov,
        )


def test_vision_model_cannot_assert_safety_clearance():
    """Observer principle: Vision model cannot declare equipment safe to operate or authorize clearance."""
    img_hash = "c" * 64
    prov = VisualProvenance(
        image_hash=img_hash,
        image_filename="reactor.png",
        observer_model="mock-qwen-vl",
    )
    with pytest.raises(ValueError, match="Observer boundary violation"):
        VisualFinding(
            finding_type=FindingType.GENERAL_OBSERVATION,
            description="Inspection complete: equipment is verified safe to operate without limitation.",
            equipment_id="R-204",
            confidence=0.99,
            source_image_hash=img_hash,
            provenance=prov,
        )


def test_prompt_injection_in_image_text_rejected():
    """Verify executable code or shell injection in finding description is rejected."""
    img_hash = "d" * 64
    prov = VisualProvenance(
        image_hash=img_hash,
        image_filename="reactor.png",
        observer_model="mock-qwen-vl",
    )
    with pytest.raises(ValueError, match="Suspicious executable code"):
        VisualFinding(
            finding_type=FindingType.GENERAL_OBSERVATION,
            description="Observed label: __import__('os').system('rm -rf /')",
            equipment_id="R-204",
            confidence=0.5,
            source_image_hash=img_hash,
            provenance=prov,
        )


def test_malformed_vision_json_rejected():
    """Verify malformed JSON from vision model is cleanly rejected by defensive parser."""
    img_hash = "e" * 64
    with pytest.raises(ValueError, match="Malformed vision model JSON output"):
        parse_visual_findings(
            raw_output="I am Qwen and here is what I saw: {bad_json: invalid",
            source_image_hash=img_hash,
            image_filename="test.png",
            observer_model="mock-vl",
        )


# =========================================================================
# 3. Service, Evidence, Clearance & Verification Integration Tests
# =========================================================================

@pytest.mark.asyncio
async def test_vision_service_analyzes_image_and_creates_evidence():
    """Verify end-to-end service execution converts findings to EvidenceRecord in EvidenceSet."""
    png_bytes = make_valid_png_bytes(64, 64)
    service = VisionService(provider=MockVisionProvider())

    resp = await service.analyze_image(
        image_bytes=png_bytes,
        filename="pressure_gauge.png",
        equipment_id="R-204",
        prompt="Inspect pressure dial",
        classification=DataClassification.INTERNAL,
        role=Role.ENGINEER,
    )

    assert resp.status == "SUCCESS"
    assert len(resp.findings) >= 1
    assert len(resp.evidence_records) >= 1

    evd = resp.evidence_records[0]
    assert isinstance(evd, EvidenceRecord)
    assert evd.source_type == "visual_inspection"
    assert evd.equipment_id == "R-204"
    assert evd.source_image_hash == resp.image_provenance.sha256_hash
    assert "img:" in evd.source_reference
    assert evd.verified is True


@pytest.mark.asyncio
async def test_classification_clearance_enforcement():
    """Verify unauthorized role cannot access RESTRICTED imagery."""
    png_bytes = make_valid_png_bytes(64, 64)
    service = VisionService(provider=MockVisionProvider())

    # AI_OPERATOR (max clearance INTERNAL) cannot access RESTRICTED imagery
    with pytest.raises(PermissionError, match="Classification boundary violation"):
        await service.analyze_image(
            image_bytes=png_bytes,
            filename="classified_reactor.png",
            classification=DataClassification.RESTRICTED,
            role=Role.AI_OPERATOR,
        )

    # ENGINEER (clearance RESTRICTED) is permitted
    resp = await service.analyze_image(
        image_bytes=png_bytes,
        filename="classified_reactor.png",
        classification=DataClassification.RESTRICTED,
        role=Role.ENGINEER,
    )
    assert resp.status == "SUCCESS"


@pytest.mark.asyncio
async def test_verification_engine_integrates_visual_evidence():
    """Verify visual evidence participates in deterministic VerificationEngine checks."""
    png_bytes = make_valid_png_bytes(64, 64)
    service = VisionService(provider=MockVisionProvider())

    resp = await service.analyze_image(
        image_bytes=png_bytes,
        filename="pressure_gauge.png",
        equipment_id="R-204",
        prompt="Verify pressure indicator reading",
        verify_against_limits=True,
    )

    assert resp.verification is not None
    assert resp.verification.status in (VerificationStatus.VERIFIED, VerificationStatus.NEEDS_REVIEW)

    # Verify provenance check passed for visual record
    prov_chk = next(c for c in resp.verification.checks if c.check_type == "PROVENANCE")
    assert prov_chk.status == VerificationStatus.VERIFIED


def test_conflict_detection_between_visual_reading_and_sop():
    """Verify variance between visual gauge reading (34.5 bar) and SOP (31.2 bar) is detected."""
    evd_set = EvidenceSet()

    # 1. SOP knowledge evidence
    evd_set.add_knowledge_evidence(
        EvidenceRecord(
            document_id="doc:sop.md",
            chunk_id="chunk_0",
            filename="sop.md",
            source_reference="doc:sop.md#0",
            retrieved_data="Normal operating pressure for R-204 is 31.2 bar gauge.",
            retrieved_text="Normal operating pressure for R-204 is 31.2 bar gauge.",
            classification=DataClassification.INTERNAL,
        )
    )

    # 2. Visual inspection evidence
    img_hash = "f" * 64
    prov = VisualProvenance(image_hash=img_hash, image_filename="gauge.png", observer_model="mock-vl")
    finding = VisualFinding(
        finding_type=FindingType.PRESSURE_GAUGE_READING,
        description="Analog pressure gauge needle points to 34.5 bar gauge.",
        equipment_id="R-204",
        observed_value=34.5,
        unit="bar",
        confidence=0.95,
        source_image_hash=img_hash,
        provenance=prov,
    )
    visual_evd = EvidenceRecord.from_visual_finding(
        finding,
        ImageProvenance(
            filename="gauge.png",
            mime_type="image/png",
            file_size_bytes=200,
            sha256_hash=img_hash,
            classification=DataClassification.INTERNAL,
        )
    )
    evd_set.add_visual_evidence(visual_evd)

    engine = VerificationEngine()
    result = engine.verify(
        query="Check operating pressure consistency",
        evidence_set=evd_set,
    )

    assert result.status == VerificationStatus.NEEDS_REVIEW
    conflict_chk = next(c for c in result.checks if c.check_type == "PARAMETER_CONSISTENCY")
    assert conflict_chk.status == VerificationStatus.NEEDS_REVIEW


# =========================================================================
# 4. Sovereignty and Provider Tests
# =========================================================================

def test_local_only_provider_enforcement():
    """Verify external cloud vision providers (OpenAI, Anthropic, Gemini) are strictly prohibited."""
    with pytest.raises(ValueError, match="Sovereignty Violation"):
        get_vision_provider("openai")

    with pytest.raises(ValueError, match="Sovereignty Violation"):
        get_vision_provider("anthropic")

    with pytest.raises(ValueError, match="Sovereignty Violation"):
        get_vision_provider("gemini")

    with pytest.raises(ValueError, match="Sovereignty Violation"):
        get_vision_provider("azure-computer-vision")


@pytest.mark.asyncio
async def test_mock_vision_provider_deterministic_custom_findings():
    """Verify MockVisionProvider supports injected findings for reproducible testing."""
    img_hash = "1" * 64
    prov = VisualProvenance(image_hash=img_hash, image_filename="weld.png", observer_model="mock")
    custom_finding = VisualFinding(
        finding_type=FindingType.WELD_DEFECT,
        description="Transverse microcrack detected along seam W-02.",
        equipment_id="R-204",
        severity=SeverityLevel.HIGH,
        confidence=0.98,
        source_image_hash=img_hash,
        provenance=prov,
    )

    mock_provider = MockVisionProvider(custom_findings=[custom_finding])
    req = VisionRequest(
        image_bytes=b"dummy",
        provenance=ImageProvenance(
            filename="weld.png",
            mime_type="image/png",
            file_size_bytes=100,
            sha256_hash=img_hash,
            classification=DataClassification.INTERNAL,
        ),
    )
    res = await mock_provider.analyze_image(req)
    assert len(res.findings) == 1
    assert res.findings[0].finding_type == FindingType.WELD_DEFECT
    assert res.findings[0].severity == SeverityLevel.HIGH


# =========================================================================
# 5. API Endpoint Contract Tests
# =========================================================================

def test_api_vision_analyze_with_image_path():
    """Test POST /api/v1/vision/analyze with local image path returns valid typed contract."""
    payload = {
        "image_path": "r204_pressure_gauge.png",
        "equipment_id": "R-204",
        "prompt": "Analyze pressure indicator",
        "classification": "INTERNAL",
        "role": "ENGINEER",
        "requester": "engineer_qa",
    }
    resp = client.post("/api/v1/vision/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "SUCCESS"
    assert "image_provenance" in data
    assert data["image_provenance"]["filename"] == "r204_pressure_gauge.png"
    assert len(data["findings"]) >= 1
    assert len(data["evidence_records"]) >= 1
    assert data["evidence_records"][0]["source_type"] == "visual_inspection"
    assert "model_metadata" in data
    assert data["verification"] is not None


def test_api_vision_analyze_with_base64_image():
    """Test POST /api/v1/vision/analyze with base64 encoded image."""
    png_bytes = make_valid_png_bytes(48, 48)
    b64_str = base64.b64encode(png_bytes).decode("utf-8")

    payload = {
        "image_base64": b64_str,
        "filename": "in_memory_gauge.png",
        "equipment_id": "R-204",
        "prompt": "Analyze uploaded gauge",
        "classification": "INTERNAL",
    }
    resp = client.post("/api/v1/vision/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["image_provenance"]["mime_type"] == "image/png"


def test_api_vision_analyze_unsupported_format_returns_415():
    """Test POST /api/v1/vision/analyze with unsupported image returns 415."""
    bad_bytes = b"NOT_AN_IMAGE_PAYLOAD_AT_ALL"
    b64_str = base64.b64encode(bad_bytes).decode("utf-8")

    payload = {
        "image_base64": b64_str,
        "filename": "bad.png",
    }
    resp = client.post("/api/v1/vision/analyze", json=payload)
    assert resp.status_code == 415


def test_api_vision_analyze_unauthorized_clearance_returns_403():
    """Test POST /api/v1/vision/analyze with insufficient clearance returns 403."""
    png_bytes = make_valid_png_bytes(32, 32)
    b64_str = base64.b64encode(png_bytes).decode("utf-8")

    payload = {
        "image_base64": b64_str,
        "filename": "critical_spec.png",
        "classification": "CRITICAL",
        "role": "ENGINEER",  # ENGINEER max clearance is RESTRICTED < CRITICAL
    }
    resp = client.post("/api/v1/vision/analyze", json=payload)
    assert resp.status_code == 403
    assert "clearance" in resp.json()["detail"].lower()


# =========================================================================
# 6. Unified Agent Multimodal Reasoning Integration Test
# =========================================================================

@pytest.mark.asyncio
async def test_agent_query_with_multimodal_image_context():
    """Verify AgentReasoningService accepts multimodal image_path and integrates visual evidence."""
    plan_json = json.dumps({
        "action": "knowledge",
        "knowledge_queries": [{"query": "R-204 normal operating pressure"}],
        "reasoning": "Cross-reference visual gauge observation with SOP specifications."
    })
    synthesis_answer = (
        "Visual inspection of PI-204 [img:f99d28b3aca1] shows an observed pressure of 33.0 bar gauge. "
        "According to SOP-R204-REV4 [doc:SOP-R204-REV4#chunk_0], the normal operating pressure is 31.2 bar gauge."
    )

    provider = MockModelProvider(responses=[plan_json, synthesis_answer])
    service = AgentReasoningService(model_provider=provider)

    req = AgentQueryRequest(
        query="Verify current pressure gauge reading against SOP limits",
        image_path="r204_pressure_gauge.png",
        role=Role.ENGINEER,
        classification=DataClassification.INTERNAL,
    )
    resp = await service.process_query(req)

    assert resp.status == AgentQueryStatus.SUCCESS
    assert resp.evidence_set is not None
    assert len(resp.evidence_set.visual_evidence) >= 1
    assert resp.verification is not None
