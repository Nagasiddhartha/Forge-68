"""FORGE Sovereign Industrial AI Control Plane - Main Application."""

from contextlib import asynccontextmanager
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core import AgentQueryRequest, AgentQueryResponse, agent_reasoning_service
from app.knowledge import (
    KnowledgeIngestRequest,
    KnowledgeIngestResponse,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    OcrRequiredError,
    PathTraversalError,
    UnsupportedFormatError,
    knowledge_service,
)
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
from app.verification.evidence import EvidenceRecord
from app.vision import (
    ImageSizeLimitError,
    PathTraversalError as VisionPathTraversalError,
    UnsupportedImageType,
    VisionAnalyzeRequest,
    VisionAnalyzeResponse,
    vision_service,
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


# =========================================================================
# Milestone 3: Model-to-Tool Reasoning & Evidence Loop APIs
# =========================================================================

@app.post("/api/v1/agent/query", response_model=AgentQueryResponse, tags=["Agent"])
async def query_agent(request: AgentQueryRequest) -> AgentQueryResponse:
    """Execute end-to-end model reasoning, policy-controlled tool execution, and evidence-grounded response."""
    return await agent_reasoning_service.process_query(request)


# =========================================================================
# Milestone 4: Industrial Knowledge Fabric APIs
# =========================================================================

@app.post("/api/v1/knowledge/ingest", response_model=KnowledgeIngestResponse, tags=["Knowledge"])
async def ingest_knowledge_document(request: KnowledgeIngestRequest) -> KnowledgeIngestResponse:
    """Ingest a local document (.txt, .md, .pdf), compute SHA-256, chunk and index vectors."""
    try:
        doc, chunks_count = await knowledge_service.ingest_document(
            file_path=request.file_path,
            classification=request.classification,
            document_type=request.document_type,
            equipment_ids=request.equipment_ids,
        )
        return KnowledgeIngestResponse(
            status="success",
            document=doc,
            chunks_created=chunks_count,
        )
    except PathTraversalError as pte:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Path traversal rejected: {pte}")
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document file not found: {fnf}")
    except OcrRequiredError as ocr:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Scanned image PDF requires OCR: {ocr}")
    except UnsupportedFormatError as ufe:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=f"Unsupported format: {ufe}")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ingestion failed: {exc}")


@app.post("/api/v1/knowledge/search", response_model=KnowledgeSearchResponse, tags=["Knowledge"])
async def search_knowledge(request: KnowledgeSearchRequest) -> KnowledgeSearchResponse:
    """Execute ranked similarity retrieval against local sovereign vector index."""
    try:
        results = await knowledge_service.search(
            query=request.query,
            top_k=request.top_k,
            classification_filter=request.classification,
        )
        evidence = [EvidenceRecord.from_retrieval_result(r) for r in results]
        return KnowledgeSearchResponse(
            query=request.query,
            total_results=len(results),
            results=results,
            evidence=evidence,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Search failed: {exc}")


# =========================================================================
# Milestone 7: Multimodal Engineering Intelligence APIs
# =========================================================================

@app.post("/api/v1/vision/analyze", response_model=VisionAnalyzeResponse, tags=["Vision"])
async def analyze_vision_image(request: VisionAnalyzeRequest) -> VisionAnalyzeResponse:
    """Analyze engineering imagery, validate observations, and generate sovereign evidence."""
    try:
        return await vision_service.process_request(request)
    except UnsupportedImageType as uit:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=f"Unsupported image type: {uit}")
    except ImageSizeLimitError as isle:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"Image size limit exceeded: {isle}")
    except VisionPathTraversalError as pte:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Path traversal rejected: {pte}")
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Clearance boundary rejected: {pe}")
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Image file not found: {fnf}")
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Validation failed: {ve}")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Vision analysis failed: {exc}")


