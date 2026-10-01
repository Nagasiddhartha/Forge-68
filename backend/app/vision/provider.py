"""Sovereign Multimodal Vision Provider Abstraction for FORGE."""

from abc import ABC, abstractmethod
import base64
import json
import logging
from typing import Any, Dict, List, Optional, Type
import httpx
from pydantic import BaseModel, Field

from app.config import settings
from app.vision.models import (
    FindingType,
    ImageProvenance,
    SeverityLevel,
    VisualFinding,
    VisualProvenance,
)
from app.vision.prompts import VISION_SYSTEM_PROMPT, parse_visual_findings

logger = logging.getLogger("forge.vision.provider")


class VisionUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class VisionRequest(BaseModel):
    """Input request payload for sovereign vision model execution."""
    image_bytes: bytes
    provenance: ImageProvenance
    prompt: Optional[str] = None
    model: Optional[str] = None
    equipment_id: Optional[str] = None


class VisionResponse(BaseModel):
    """Execution output from sovereign vision model execution."""
    findings: List[VisualFinding] = Field(default_factory=list)
    raw_content: str
    model: str
    provider: str
    usage: VisionUsage = Field(default_factory=VisionUsage)


class BaseVisionProvider(ABC):
    """Abstract Base Class for sovereign multimodal vision inference providers."""

    @abstractmethod
    async def analyze_image(self, request: VisionRequest) -> VisionResponse:
        """Analyze image payload using local multimodal model and return structured findings."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Check whether local vision inference engine is operational."""
        pass

    @abstractmethod
    async def list_models(self) -> List[str]:
        """List locally hosted vision models."""
        pass


# Canonical alias for VisionProvider
VisionProvider = BaseVisionProvider


class OllamaVisionProvider(BaseVisionProvider):
    """Sovereign multimodal vision provider connecting to local Ollama instance (e.g. Qwen2.5-VL)."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        default_model: Optional[str] = None,
        timeout: Optional[float] = None,
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.default_model = default_model or settings.DEFAULT_VISION_MODEL
        self.timeout = timeout or settings.OLLAMA_TIMEOUT_SECONDS

    def _get_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout)

    async def analyze_image(self, request: VisionRequest) -> VisionResponse:
        target_model = request.model or self.default_model
        b64_img = base64.b64encode(request.image_bytes).decode("utf-8")

        user_content = request.prompt or "Analyze this industrial image and extract all empirical observations and readings."
        if request.equipment_id:
            user_content += f" Target Asset: {request.equipment_id}."

        payload = {
            "model": target_model,
            "messages": [
                {"role": "system", "content": VISION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": user_content,
                    "images": [b64_img],
                },
            ],
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.1,  # Low temperature for deterministic empirical observation
            },
        }

        async with self._get_client() as client:
            resp = await client.post("/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()

            raw_text = data.get("message", {}).get("content", "")
            usage = VisionUsage(
                prompt_tokens=data.get("prompt_eval_count", 0),
                completion_tokens=data.get("eval_count", 0),
                total_tokens=data.get("prompt_eval_count", 0) + data.get("eval_count", 0),
            )

        findings = parse_visual_findings(
            raw_output=raw_text,
            source_image_hash=request.provenance.sha256_hash,
            image_filename=request.provenance.filename,
            observer_model=target_model,
            fallback_equipment_id=request.equipment_id,
        )

        return VisionResponse(
            findings=findings,
            raw_content=raw_text,
            model=target_model,
            provider="ollama",
            usage=usage,
        )

    async def health_check(self) -> bool:
        try:
            async with self._get_client() as client:
                resp = await client.get("/api/tags", timeout=5.0)
                return resp.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> List[str]:
        try:
            async with self._get_client() as client:
                resp = await client.get("/api/tags")
                resp.raise_for_status()
                data = resp.json()
                return [item.get("name") for item in data.get("models", []) if item.get("name")]
        except Exception:
            return []


class MockVisionProvider(BaseVisionProvider):
    """Deterministic offline mock vision provider for testing and air-gapped simulation."""

    def __init__(
        self,
        default_model: str = "mock-qwen-vl",
        custom_responses: Optional[List[str]] = None,
        custom_findings: Optional[List[VisualFinding]] = None,
    ):
        self.default_model = default_model
        self.custom_responses: List[str] = list(custom_responses) if custom_responses else []
        self.custom_findings: Optional[List[VisualFinding]] = custom_findings

    async def analyze_image(self, request: VisionRequest) -> VisionResponse:
        target_model = request.model or self.default_model

        if self.custom_responses:
            raw_text = self.custom_responses.pop(0)
            findings = parse_visual_findings(
                raw_output=raw_text,
                source_image_hash=request.provenance.sha256_hash,
                image_filename=request.provenance.filename,
                observer_model=target_model,
                fallback_equipment_id=request.equipment_id,
            )
            return VisionResponse(
                findings=findings,
                raw_content=raw_text,
                model=target_model,
                provider="mock",
                usage=VisionUsage(prompt_tokens=25, completion_tokens=50, total_tokens=75),
            )

        if self.custom_findings is not None:
            return VisionResponse(
                findings=self.custom_findings,
                raw_content="[FORGE MOCK FINDINGS INJECTED]",
                model=target_model,
                provider="mock",
                usage=VisionUsage(prompt_tokens=10, completion_tokens=20, total_tokens=30),
            )

        # Deterministic simulation based on filename / equipment
        equipment_id = request.equipment_id or "R-204"
        filename_lower = request.provenance.filename.lower()

        prov = VisualProvenance(
            image_hash=request.provenance.sha256_hash,
            image_filename=request.provenance.filename,
            bounding_box={"x_min": 0.25, "y_min": 0.3, "x_max": 0.75, "y_max": 0.8},
            location_notes="Primary discharge dial indicator",
            observer_model=target_model,
        )

        findings: List[VisualFinding] = []
        if "gauge" in filename_lower or "pressure" in filename_lower:
            findings.append(
                VisualFinding(
                    finding_type=FindingType.PRESSURE_GAUGE_READING,
                    description=f"Analog pressure gauge dial needle aligned at 33.0 bar gauge on {equipment_id} discharge.",
                    equipment_id=equipment_id,
                    location="Discharge nozzle pressure indicator PI-204",
                    severity=SeverityLevel.INFO,
                    observed_value=33.0,
                    unit="bar",
                    confidence=0.96,
                    source_image_hash=request.provenance.sha256_hash,
                    provenance=prov,
                    raw_observation="Dial indicator observed at 33.0 bar gauge.",
                )
            )
        elif "corrosion" in filename_lower or "defect" in filename_lower:
            findings.append(
                VisualFinding(
                    finding_type=FindingType.CORROSION,
                    description=f"Localized pitting and surface oxidation observed on {equipment_id} shell weld margin.",
                    equipment_id=equipment_id,
                    location="Reactor shell course 2, weld seam W-04",
                    severity=SeverityLevel.MEDIUM,
                    observed_value=2.2,
                    unit="mm",
                    confidence=0.91,
                    source_image_hash=request.provenance.sha256_hash,
                    provenance=prov,
                    raw_observation="Surface oxidation measured approximately 2.2 mm depth variance.",
                )
            )
        else:
            findings.append(
                VisualFinding(
                    finding_type=FindingType.GENERAL_OBSERVATION,
                    description=f"Equipment asset {equipment_id} visual inspection completed; no critical breach detected.",
                    equipment_id=equipment_id,
                    location="External casing",
                    severity=SeverityLevel.INFO,
                    observed_value=None,
                    unit=None,
                    confidence=0.88,
                    source_image_hash=request.provenance.sha256_hash,
                    provenance=prov,
                    raw_observation="Asset external visual scan completed.",
                )
            )

        raw_content = json.dumps([f.model_dump() for f in findings], indent=2)

        return VisionResponse(
            findings=findings,
            raw_content=raw_content,
            model=target_model,
            provider="mock",
            usage=VisionUsage(prompt_tokens=20, completion_tokens=40, total_tokens=60),
        )

    async def health_check(self) -> bool:
        return True

    async def list_models(self) -> List[str]:
        return [self.default_model, "mock-qwen2.5-vl"]


_VISION_PROVIDERS: Dict[str, Type[BaseVisionProvider]] = {
    "ollama": OllamaVisionProvider,
    "mock": MockVisionProvider,
}


def get_vision_provider(provider_name: Optional[str] = None) -> BaseVisionProvider:
    """Instantiate sovereign vision provider. Strictly rejects public cloud APIs."""
    name = (provider_name or settings.VISION_PROVIDER).lower()

    # Explicit cloud prohibition check
    cloud_keywords = ["openai", "anthropic", "gemini", "google", "azure", "aws", "bedrock", "claude"]
    if any(k in name for k in cloud_keywords):
        raise ValueError(
            f"Sovereignty Violation: External cloud vision provider '{name}' is strictly prohibited. "
            f"FORGE only supports local sovereign providers: {list(_VISION_PROVIDERS.keys())}."
        )

    provider_cls = _VISION_PROVIDERS.get(name)
    if not provider_cls:
        raise ValueError(
            f"Unsupported sovereign vision provider: '{name}'. "
            f"Valid options: {list(_VISION_PROVIDERS.keys())}."
        )
    return provider_cls()
