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

---

### Milestone 5 — Unified Evidence-Grounded Agent

Unifies local Qwen3 reasoning, the Industrial Tool Fabric, Industrial Knowledge Fabric, Sovereign Policy Gateway, and verified EvidenceSet into one controlled industrial agent workflow.

```
User
 ↓
Qwen3 Plan (direct / knowledge / tool / combined)
 ↓
Knowledge / Tools
 ↓
Policy (DEFAULT-DENY / Clearance Guard)
 ↓
Evidence Set (Verified Evidence & Policy Outcomes)
 ↓
Qwen3 (Evidence-Grounded Synthesis)
 ↓
Grounded Answer
```

> **The model proposes actions; FORGE policy determines whether those actions are permitted.**
> The model is NEVER the authority that grants itself access. All protected operations continue through existing FORGE security boundaries.

**Core Principles & Governance:**
1. **Model Proposes, Policy Authorizes:** The model outputs a typed, structured `AgentPlan`. It cannot authorize actions, escalate its clearance, or directly invoke shell commands, Python scripts, filesystem operations, or industrial protocols.
2. **Authoritative Document Classification:** The stored document classification is authoritative and immutable at query time. A plan cannot downgrade document classification (e.g. requesting `PUBLIC` cannot retrieve `RESTRICTED` documents), nor can an agent query escalate clearance beyond the requester's authorized clearance.
3. **Execution-Scoped EvidenceSet:** Gathers verified tool execution records, knowledge retrieval results with provenance, policy decisions, and audit event identifiers into a single structured set.
4. **Parameter Variance & Conflict Preservation:** Surfaces observable variances across distinct sources (e.g. normal operating pressure vs trip/MAWP thresholds) without speculative merging or hallucinated consensus.
5. **Prompt Security & Data Isolation:** Prompts strictly separate authoritative system instructions from untrusted data (user queries, document texts, and tool outputs). Injected commands inside documents are treated strictly as inert textual data.

**Key components added:**
- `backend/app/core/schemas.py` — `AgentPlan`, `AgentActionType`, `KnowledgeQueryPlan`, `ToolCallPlan`, `AgentQueryResponse`
- `backend/app/core/prompts.py` — `AGENT_PLAN_SYSTEM_PROMPT`, `UNIFIED_GROUNDED_SYNTHESIS_SYSTEM_PROMPT`, defensive `parse_agent_plan`
- `backend/app/core/reasoning.py` — `AgentReasoningService` orchestrating the end-to-end unified planning, execution, and synthesis workflow
- `backend/app/verification/evidence.py` — `EvidenceSet`, `ConflictRecord`, `detect_evidence_conflicts()`
- `backend/app/security/events.py` — `AgentEventType`, `AgentTraceEvent` producing audit traces across all 9 lifecycle events
- `backend/app/knowledge/index.py` & `backend/app/knowledge/service.py` — Clearance level bounding and classification enforcement
- `tests/test_unified_agent.py` — 15 comprehensive unit, security, and integration tests covering Scenarios A through F and security safeguards
- `POST /api/v1/agent/query` — Typed API endpoint returning structured plan, queries, tool calls, policy decisions, evidence set, and grounded response

---

### Milestone 6 — Verification & Trust Engine

Builds an independent verification layer that evaluates whether evidence and deterministic Python calculations support the agent's findings before final response synthesis.

```
Evidence
   ↓
Verification (VerificationEngine)
   ├── Evidence completeness
   ├── Source / provenance checks
   ├── Classification / policy checks
   ├── Parameter consistency
   ├── Deterministic calculations (Python)
   └── Grounding / support checks
   ↓
Trust Status (VerificationResult)
   ↓
Qwen3 Synthesis (Informed by Trust Status)
   ↓
Final Response
```

> **FORGE verifies available evidence and deterministic calculations before presenting the final response.**
> Verification is an automated evidence-grounding audit, not a guarantee of correctness in the real physical world. It confirms that the response passed deterministic verification checks against the available evidence and calculation results without claiming "hallucination elimination."

**Core Principles & Architecture:**
1. **Model is NOT the Verifier:** The language model never verifies its own output. Verification runs via deterministic, rule-based Python checks inside `VerificationEngine`.
2. **Deterministic Calculation Engine:** Mathematical evaluations (such as `pressure_variance`, `pressure_margin`, `corrosion_projection`, and `thickness_loss`) are performed entirely by Python logic with typed numeric inputs. Arbitrary Python code execution and shell command execution are strictly prohibited.
3. **Preserved Calculation Provenance:** Every calculated result preserves its calculation ID, type, typed inputs, numerical result, physical units, supporting evidence IDs, and creation timestamp.
4. **Independent Trust Statuses:** Produces explicit status indicators: `VERIFIED`, `PARTIALLY_VERIFIED`, `INSUFFICIENT_EVIDENCE`, `NEEDS_REVIEW`, and `FAILED`.
5. **No Speculative Fabrications:** Missing evidence or unsupported numerical claims immediately produce `INSUFFICIENT_EVIDENCE` or `NEEDS_REVIEW`. Denied tool actions are verified never to be represented as successful executions.
6. **Immutable Verification Audit:** Records `VERIFICATION_STARTED`, `VERIFICATION_CHECK`, and `VERIFICATION_COMPLETED` events in the audit log.

**Key components added:**
- `backend/app/verification/models.py` — `VerificationStatus`, `VerificationCheck`, `VerificationResult`
- `backend/app/verification/calculations.py` — Deterministic `CalculationEngine` with typed schemas and registered industrial formulas
- `backend/app/verification/engine.py` — `VerificationEngine` with 7 discrete audit checks (provenance, completeness, policy compliance, classification, parameter consistency, calculations, and grounding support)
- `backend/app/core/reasoning.py` — Updated `AgentReasoningService` integrating deterministic verification between evidence collection and final response generation
- `backend/app/core/schemas.py` — Extended `AgentPlan` with calculation requests and `AgentQueryResponse` with typed `VerificationResult`
- `backend/app/security/events.py` — Verification lifecycle audit events (`VERIFICATION_STARTED`, `VERIFICATION_CHECK`, `VERIFICATION_COMPLETED`)
- `tests/test_verification.py` — 20 comprehensive unit, security, and end-to-end tests covering Scenarios A through H and all verification security constraints
- `POST /api/v1/agent/query` — Exposes complete verification result payload alongside plan, evidence, and response



