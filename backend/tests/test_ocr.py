"""Test suite for Sovereign OCR and Document Extraction Service."""

import pytest
from app.ocr.service import ocr_service, OcrExtractResult
from PIL import Image, ImageDraw


def test_ocr_engine_available():
    """Verify local tesseract and tessdata directory are present and online."""
    assert ocr_service.is_available() is True


def test_ocr_image_extraction():
    """Verify local OCR extracts text from an in-memory image without network calls."""
    # Create test image with clear text
    img = Image.new("RGB", (600, 150), color="white")
    d = ImageDraw.Draw(img)
    d.text((30, 50), "FORGE REACTOR R-204 OPERATING PRESSURE 31.2 BAR", fill="black")

    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    raw_bytes = buf.getvalue()

    result = ocr_service.extract_from_image_bytes(
        image_bytes=raw_bytes,
        filename="test_reactor_gauge.png",
        lang="eng",
    )

    assert isinstance(result, OcrExtractResult)
    assert result.total_pages == 1
    assert "R-204" in result.full_text or "REACTOR" in result.full_text or "31.2" in result.full_text
    assert result.is_air_gapped is True
    assert len(result.sha256) == 64


@pytest.mark.asyncio
async def test_ocr_ingest_to_knowledge():
    """Verify extracted OCR text can be automatically ingested into the Plant Knowledge Fabric."""
    img = Image.new("RGB", (600, 150), color="white")
    d = ImageDraw.Draw(img)
    d.text((30, 50), "PUMP P-201 BEARING TEMPERATURE 68.5 C NOMINAL", fill="black")

    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    raw_bytes = buf.getvalue()

    result = ocr_service.extract_from_image_bytes(raw_bytes, "test_p201.png", "eng")
    ingest_res = await ocr_service.ingest_to_knowledge_fabric(
        extract_result=result,
        classification="INTERNAL",
        equipment_ids=["P-201"],
    )

    assert ingest_res["status"] == "success"
    assert ingest_res["chunks_created"] >= 1
    assert "P-201" in ingest_res["file_path"] or "ocr" in ingest_res["file_path"]
