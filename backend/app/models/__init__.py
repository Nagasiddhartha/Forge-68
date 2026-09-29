"""Model provider factory and abstraction exports."""

from typing import AsyncIterator, Dict, List, Optional, Type
from app.config import settings
from app.models.base import (
    BaseModelProvider,
    ModelMessage,
    ModelRequest,
    ModelResponse,
    ModelUsage,
    StreamChunk,
)
from app.models.ollama import OllamaModelProvider


class MockModelProvider(BaseModelProvider):
    """Offline test model provider for unit tests and deterministic simulation."""

    def __init__(self, default_model: str = "mock-reasoner"):
        self.default_model = default_model

    async def generate(self, request: ModelRequest) -> ModelResponse:
        model_name = request.model or self.default_model
        return ModelResponse(
            content=f"[FORGE SOVEREIGN MOCK] Processed {len(request.messages)} messages.",
            model=model_name,
            usage=ModelUsage(prompt_tokens=10, completion_tokens=10, total_tokens=20),
            finish_reason="stop",
        )

    async def generate_stream(self, request: ModelRequest) -> AsyncIterator[StreamChunk]:
        yield StreamChunk(delta="[FORGE MOCK] ")
        yield StreamChunk(delta="Completed response.")
        yield StreamChunk(delta="", finish_reason="stop")

    async def health_check(self) -> bool:
        return True

    async def list_models(self) -> List[str]:
        return [self.default_model, "mock-classifier"]


_PROVIDERS: Dict[str, Type[BaseModelProvider]] = {
    "ollama": OllamaModelProvider,
    "mock": MockModelProvider,
}


def get_model_provider(provider_name: Optional[str] = None) -> BaseModelProvider:
    """Instantiate a sovereign model provider without hard-coding."""
    name = (provider_name or settings.MODEL_PROVIDER).lower()
    provider_cls = _PROVIDERS.get(name)
    if not provider_cls:
        raise ValueError(
            f"Unsupported sovereign model provider: '{name}'. "
            f"Valid options: {list(_PROVIDERS.keys())}. "
            f"External cloud providers are strictly prohibited."
        )
    return provider_cls()


__all__ = [
    "BaseModelProvider",
    "ModelMessage",
    "ModelRequest",
    "ModelResponse",
    "ModelUsage",
    "StreamChunk",
    "OllamaModelProvider",
    "MockModelProvider",
    "get_model_provider",
]
