"""FORGE Sovereign Industrial OCR & Document Extraction Service."""

from app.ocr.service import (
    OcrEngine,
    OcrExtractResult,
    OcrPageResult,
    ocr_service,
)

__all__ = [
    "OcrEngine",
    "OcrExtractResult",
    "OcrPageResult",
    "ocr_service",
]
