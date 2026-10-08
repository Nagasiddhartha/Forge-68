"""Unit and integration tests for formal MRPL deliverable generation."""

import io
import zipfile
import pytest
from fastapi.testclient import TestClient

from app.deliverables import (
    ApprovalNoteRequest,
    deliverable_service,
    generate_mrpl_approval_docx,
)
from app.main import app

client = TestClient(app)


def test_generate_mrpl_approval_docx_structure():
    """Verify ECMA-376 OpenXML structure of generated document."""
    raw_docx = generate_mrpl_approval_docx(
        query="Investigate Reactor R-204 shell thinning",
        asset_id="R-204",
        role="ENGINEER",
        requester="lead_inspector",
        classification="CONFIDENTIAL",
        verification_verdict="VERIFIED",
    )
    assert len(raw_docx) > 2000

    # Validate ZIP package
    with zipfile.ZipFile(io.BytesIO(raw_docx), "r") as z:
        filenames = z.namelist()
        assert "[Content_Types].xml" in filenames
        assert "_rels/.rels" in filenames
        assert "word/document.xml" in filenames
        assert "word/styles.xml" in filenames
        assert "docProps/core.xml" in filenames

        doc_content = z.read("word/document.xml").decode("utf-8")
        assert "MANGALORE REFINERY AND PETROCHEMICALS LIMITED" in doc_content
        assert "R-204" in doc_content
        assert "VERIFIED" in doc_content


def test_generate_mrpl_approval_docx_kannada_and_hindi():
    """Verify regional multilingual section headers, table columns, and sign-offs in generated document."""
    kn_docx = generate_mrpl_approval_docx(
        query="ಪಂಪ್ P-201 ಕಾರ್ಯಾಚರಣೆ ತಪಾಸಣೆ",
        asset_id="P-201",
        locale="kn",
    )
    with zipfile.ZipFile(io.BytesIO(kn_docx), "r") as z:
        content = z.read("word/document.xml").decode("utf-8")
        assert "ಕಾರ್ಯನಿರ್ವಾಹಕ ಪ್ರಕರಣ ಸಾರಾಂಶ" in content
        assert "ನಿಯತಾಂಕ / ಆಯಾಮ" in content
        assert "ತಪಾಸಣಾ ಮೆಟ್ರಿಕ್" in content
        assert "ಪರಿಶೀಲಿಸಿದವರು ಮತ್ತು ಸಿದ್ಧಪಡಿಸಿದವರು" in content

    hi_docx = generate_mrpl_approval_docx(
        query="पंप P-201 परिचालन निरीक्षण",
        asset_id="P-201",
        locale="hi",
    )
    with zipfile.ZipFile(io.BytesIO(hi_docx), "r") as z:
        content = z.read("word/document.xml").decode("utf-8")
        assert "कार्यकारी मामला सारांश" in content
        assert "पैरामीटर / आयाम" in content
        assert "निरीक्षण मीट्रिक" in content
        assert "निरीक्षण एवं तैयारकर्ता" in content


def test_deliverable_service_lifecycle():
    """Verify service file creation and metadata tracking."""
    req = ApprovalNoteRequest(
        query="Routine inspection of Heat Exchanger E-301",
        asset_id="E-301",
        requester="thermal_lead",
    )
    resp = deliverable_service.create_approval_note(req)
    assert resp.status == "SUCCESS"
    assert resp.asset_id == "E-301"
    assert len(resp.file_id) > 10
    assert resp.file_size_bytes > 2000

    file_path = deliverable_service.get_deliverable_file(resp.file_id)
    assert file_path is not None
    assert file_path.exists()


def test_api_deliverable_endpoints():
    """Verify REST endpoints for deliverable generation and download."""
    post_resp = client.post(
        "/api/v1/deliverables/approval-note",
        json={
            "query": "Evaluate Reactor R-204 operating parameters",
            "asset_id": "R-204",
            "locale": "en",
        },
    )
    assert post_resp.status_code == 200
    data = post_resp.json()
    assert data["status"] == "SUCCESS"
    file_id = data["file_id"]

    # Download endpoint
    dl_resp = client.get(f"/api/v1/deliverables/download/{file_id}")
    assert dl_resp.status_code == 200
    assert len(dl_resp.content) > 2000
    assert "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in dl_resp.headers["content-type"]

    # Not found check
    missing_resp = client.get("/api/v1/deliverables/download/non-existent-uuid")
    assert missing_resp.status_code == 404


def test_api_system_egress_endpoint():
    """Verify live network egress audit reporting zero external bytes."""
    resp = client.get("/api/v1/system/egress")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ISOLATED"
    assert data["air_gapped"] is True
    assert data["egress_bytes"] == 0
    assert data["cloud_ai_sdks_blocked"] is True
