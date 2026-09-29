"""FORGE Sovereign Industrial AI Control Plane - Main Application."""

from contextlib import asynccontextmanager
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.models import get_model_provider
from app.security import (
    PolicyDecision,
    PolicyDecisionType,
    PolicyEvaluationRequest,
    policy_gateway,
)
from app.tools import (
    ToolExecutionResult,
    ToolInvocationRequest,
    ToolMetadata,
    execute_tool_with_policy,
    tool_registry,
)


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
        "registered_tools_count": len(tool_registry.list_tools()),
    }


# =========================================================================
# Milestone 2: Policy & Industrial Tool APIs
# =========================================================================

@app.get("/api/v1/tools", response_model=List[ToolMetadata], tags=["Tools"])
async def list_registered_tools() -> List[ToolMetadata]:
    """List all registered sovereign industrial tools and their safety metadata."""
    return tool_registry.list_tools()


@app.post("/api/v1/policy/evaluate", response_model=PolicyDecision, tags=["Policy"])
async def evaluate_policy(request: PolicyEvaluationRequest) -> PolicyDecision:
    """Evaluate whether an agent or operator action is permitted by sovereign policy rules."""
    return policy_gateway.evaluate(request)


@app.post("/api/v1/tools/execute", response_model=ToolExecutionResult, tags=["Tools"])
async def execute_tool(request: ToolInvocationRequest):
    """Execute an industrial tool through the mandatory Policy Gateway boundary."""
    result = execute_tool_with_policy(request)

    if not result.success and result.decision.decision == PolicyDecisionType.DENY:
        # Return 403 Forbidden with structured result for policy rejections
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=result.model_dump(),
        )

    if not result.success:
        # Tool execution error
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=result.model_dump(),
        )

    return result
