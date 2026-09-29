# FORGE: Sovereign Industrial AI Control Plane

FORGE is an on-premise, air-gapped AI control plane engineered for mission-critical industrial environments.

## Non-Negotiable Core Tenets
1. **100% Sovereign Runtime:** Zero dependency on external AI cloud APIs (OpenAI, Claude, Gemini).
2. **Model Abstraction Layer:** Replaceable local inference backends (Ollama, vLLM, llama.cpp).
3. **No Hard-Coded Models:** All model selections are managed dynamically via configuration.
4. **Evidence-Based Verification:** Rigorous verification and sandboxing for all tool interactions.
5. **Full Auditability:** Tamper-evident logging of all agent actions and system state transitions.

## Project Structure
- `backend/`: FastAPI backend built on Python 3.12, providing modular sovereign agent orchestration, model provider abstraction, and control plane APIs.
- `frontend/`: Next.js TypeScript application providing the operational control dashboard.
- `AGENTS.md`: Architectural specification, governance, and development guidelines.

## Quickstart (Development)

### Prerequisites
- Python 3.12+
- Node.js 20+ & npm
- Ollama (with local reasoning model pulled, e.g. `qwen3:8b`)

### Backend Setup
```bash
cd backend
python -m venv .venv
# Activate virtual environment:
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend health check: `http://localhost:8000/health`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access UI at `http://localhost:3000`.

---

## Milestone History

### Milestone 1 — Foundation
Established monorepo structure, FastAPI backend (Python 3.12), Next.js frontend, model provider abstraction, Ollama integration with `qwen3:8b`, `/health` and `/api/v1/models` endpoints, and git repository.

### Milestone 2 — Sovereign Policy Gateway + Tool Execution Boundary
Implemented default-deny `PolicyGateway`, typed tool registry (`ToolRegistry`), the `equipment_history` industrial demonstration tool (R-204, P-201, E-301), evidence-producing `ExecutionEvent` audit records, and `/api/v1/tools`, `/api/v1/policy/evaluate`, `/api/v1/tools/execute` endpoints.

### Milestone 3 — Model-to-Tool Evidence Loop

Connects local `qwen3:8b` to the sovereign policy gateway and tool registry through a mandatory, policy-controlled evidence loop.

```
Qwen3 8B (Phase 1: Tool Decision)
    ↓
Structured Tool Request  (Pydantic validated, code-injection guarded)
    ↓
Policy Gateway           (DEFAULT-DENY evaluation via PolicyGateway)
    ↓
Tool Registry            (typed schema validation)
    ↓
Tool Execution           (approved handler only)
    ↓
Evidence Record          (EvidenceRecord: id, source, data, classification)
    ↓
Qwen3 8B (Phase 2: Evidence-Grounded Synthesis)
    ↓
Evidence-Grounded Response
```

> **The model does not have direct tool execution authority.**
> Every tool invocation is mediated by the Policy Gateway.
> A denied request never reaches the tool handler.

**Key components added:**
- `backend/app/core/schemas.py` — `ModelToolDecision`, `AgentQueryRequest`, `AgentQueryResponse`
- `backend/app/core/prompts.py` — Constrained prompt templates and defensive JSON parser
- `backend/app/core/reasoning.py` — `AgentReasoningService` orchestration service
- `backend/app/verification/evidence.py` — `EvidenceRecord` schema
- `POST /api/v1/agent/query` — End-to-end sovereign agent query API

**API Usage Example:**
```bash
curl -s -X POST http://localhost:8000/api/v1/agent/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show the maintenance history for R-204", "role": "ENGINEER", "requester": "engineer_ops"}'
```

### Milestone 4 — Industrial Knowledge Fabric (Local Document Retrieval)

Provides local, air-gapped retrieval of organizational technical documents, turning passive text into verified evidence with full provenance tracking.

```
Documents (.txt, .md, .pdf)
    ↓
Local Ingestion (SHA-256 integrity digest, path traversal protection)
    ↓
Chunking (Deterministic boundary slicing & provenance retention)
    ↓
Local Embeddings (BaseEmbeddingProvider: BAAI/bge-m3 / Mock)
    ↓
Local Vector Index (NumPy Cosine Similarity Index)
    ↓
Ranked Retrieval (Top-k similarity scoring & classification filtering)
    ↓
EvidenceRecord (Direct conversion with provenance metadata)
```

> **FORGE does not send organizational documents to cloud inference services.**
> All ingestion, hashing, chunking, embedding, vector search, and evidence conversion execute entirely on-premise.

*Note: The current milestone does NOT yet include multimodal vision or OCR pipelines. Image-only or scanned PDFs are explicitly detected and reported as requiring OCR.*

**Key components added:**
- `backend/app/knowledge/models.py` — `KnowledgeDocument`, `DocumentChunk`, `RetrievalResult`
- `backend/app/knowledge/ingestion.py` — Local ingestion pipeline for `.txt`, `.md`, `.pdf` with SHA-256 hashing and OCR detection
- `backend/app/knowledge/chunker.py` — Deterministic chunker preserving document provenance metadata
- `backend/app/knowledge/embeddings.py` — `BaseEmbeddingProvider`, `MockEmbeddingProvider`, `SentenceTransformerEmbeddingProvider`
- `backend/app/knowledge/index.py` — Local in-memory `NumpyCosineVectorIndex`
- `backend/app/knowledge/service.py` — `KnowledgeService` orchestrating ingest and query pipelines
- `backend/app/verification/evidence.py` — Extended `EvidenceRecord` with `from_retrieval_result()`
- `backend/data/demo/knowledge/` — 5 synthetic R-204 refinery documents (SOP, Inspection, Spec, Maintenance, Safety)
- `POST /api/v1/knowledge/ingest` & `POST /api/v1/knowledge/search` — Typed Knowledge Fabric endpoints

*Note: Ingestion is strictly explicit via `POST /api/v1/knowledge/ingest`. Application startup never mutates the knowledge index or ingests documents implicitly.*


