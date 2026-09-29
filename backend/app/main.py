"""FORGE Sovereign Industrial AI Control Plane - Main Application."""

from contextlib import asynccontextmanager
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import get_model_provider


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup validation
    yield
    # Shutdown cleanup


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Sovereign Industrial AI Control Plane",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check() -> Dict[str, Any]:
    """Health check endpoint reporting sovereign system and model provider status."""
    provider = get_model_provider()
    is_model_online = await provider.health_check()

    return {
        "status": "ok",
        "service": "FORGE Control Plane",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "sovereign_mode": True,
        "model_provider": settings.MODEL_PROVIDER,
        "default_model": settings.DEFAULT_MODEL,
        "model_provider_online": is_model_online,
    }


@app.get("/api/v1/models", tags=["Models"])
async def list_available_models() -> Dict[str, Any]:
    """List sovereign models currently available in the active local provider."""
    try:
        provider = get_model_provider()
        models: List[str] = await provider.list_models()
        return {
            "provider": settings.MODEL_PROVIDER,
            "default_model": settings.DEFAULT_MODEL,
            "models": models,
        }
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Failed to query model provider: {str(exc)}")


@app.get("/api/v1/system/status", tags=["System"])
async def system_status() -> Dict[str, Any]:
    """Detailed sovereign control plane status."""
    provider = get_model_provider()
    model_online = await provider.health_check()
    return {
        "control_plane": "active",
        "sovereignty_enforced": True,
        "external_api_calls_blocked": True,
        "model_provider": {
            "type": settings.MODEL_PROVIDER,
            "default_model": settings.DEFAULT_MODEL,
            "online": model_online,
        },
    }
