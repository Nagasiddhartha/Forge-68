"""Sovereign Model Provider Abstraction Layer.

FORGE Non-Negotiable Principle:
- Never hard-code models in agent logic.
- Replaceable local model providers (Ollama, vLLM, llama.cpp, etc.).
- ZERO external cloud AI APIs (no OpenAI/Claude/Gemini dependencies).
"""

from abc import ABC, abstractmethod
from typing import AsyncIterator, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class ModelMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ModelRequest(BaseModel):
    messages: List[ModelMessage]
    model: Optional[str] = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = None
    stream: bool = False
    stop: Optional[List[str]] = None


class ModelUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class ModelResponse(BaseModel):
    content: str
    model: str
    usage: ModelUsage = Field(default_factory=ModelUsage)
    finish_reason: Optional[str] = "stop"


class StreamChunk(BaseModel):
    delta: str
    finish_reason: Optional[str] = None


class BaseModelProvider(ABC):
    """Abstract Base Class for sovereign local model inference providers."""

    @abstractmethod
    async def generate(self, request: ModelRequest) -> ModelResponse:
        """Execute a non-streaming completion against the local model."""
        pass

    @abstractmethod
    async def generate_stream(self, request: ModelRequest) -> AsyncIterator[StreamChunk]:
        """Execute a streaming completion yielding StreamChunks."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Check whether the local inference runtime is reachable and operational."""
        pass

    @abstractmethod
    async def list_models(self) -> List[str]:
        """List local models available in the provider runtime."""
        pass
