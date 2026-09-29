"""Test cases for the sovereign model-provider abstraction."""

import pytest
from app.models.base import ModelMessage, ModelRequest, BaseModelProvider
from app.models import get_model_provider, MockModelProvider, OllamaModelProvider


def test_get_mock_provider():
    """Verify that provider factory resolves mock provider correctly."""
    provider = get_model_provider("mock")
    assert isinstance(provider, BaseModelProvider)
    assert isinstance(provider, MockModelProvider)


def test_get_ollama_provider():
    """Verify that provider factory resolves ollama provider correctly."""
    provider = get_model_provider("ollama")
    assert isinstance(provider, BaseModelProvider)
    assert isinstance(provider, OllamaModelProvider)


def test_unsupported_provider_rejected():
    """Verify that external cloud providers are rejected by the factory."""
    with pytest.raises(ValueError) as excinfo:
        get_model_provider("openai")
    assert "Unsupported sovereign model provider" in str(excinfo.value)

    with pytest.raises(ValueError) as excinfo2:
        get_model_provider("anthropic")
    assert "Unsupported sovereign model provider" in str(excinfo2.value)


@pytest.mark.asyncio
async def test_mock_provider_generation():
    """Verify mock provider generation returns expected schema without network."""
    provider = MockModelProvider(default_model="qwen3:8b")
    request = ModelRequest(
        messages=[
            ModelMessage(role="user", content="System check")
        ],
        model="qwen3:8b",
    )
    response = await provider.generate(request)
    assert response.content is not None
    assert response.model == "qwen3:8b"
    assert response.usage.total_tokens > 0
