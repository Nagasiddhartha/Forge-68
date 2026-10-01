"""Multimodal Engineering Intelligence package for FORGE."""

from app.vision.ingestion import (
    ImageIngestionError,
    ImageSizeLimitError,
    PathTraversalError,
    UnsupportedImageType,
    detect_mime_and_dimensions,
    validate_and_load_image_file,
    validate_image_bytes,
)
from app.vision.models import (
    FindingType,
    ImageProvenance,
    SeverityLevel,
    VisionAnalyzeRequest,
    VisionAnalyzeResponse,
    VisualFinding,
    VisualProvenance,
)
from app.vision.prompts import (
    VISION_SYSTEM_PROMPT,
    parse_visual_findings,
)
from app.vision.provider import (
    BaseVisionProvider,
    MockVisionProvider,
    OllamaVisionProvider,
    VisionRequest,
    VisionResponse,
    get_vision_provider,
)
from app.vision.service import (
    VisionService,
    vision_service,
)

__all__ = [
    "ImageIngestionError",
    "UnsupportedImageType",
    "ImageSizeLimitError",
    "PathTraversalError",
    "detect_mime_and_dimensions",
    "validate_image_bytes",
    "validate_and_load_image_file",
    "FindingType",
    "SeverityLevel",
    "ImageProvenance",
    "VisualProvenance",
    "VisualFinding",
    "VisionAnalyzeRequest",
    "VisionAnalyzeResponse",
    "VISION_SYSTEM_PROMPT",
    "parse_visual_findings",
    "BaseVisionProvider",
    "OllamaVisionProvider",
    "MockVisionProvider",
    "VisionRequest",
    "VisionResponse",
    "get_vision_provider",
    "VisionService",
    "vision_service",
]
