# AGENTS.md — FORGE System Architecture & Governance Specification

## 1. System Overview
**FORGE** is a Sovereign Industrial AI Control Plane engineered for air-gapped, on-premise, and high-assurance industrial environments. FORGE provides autonomous agent orchestration, verification gateways, tool execution sandboxes, and immutable auditability without ever transmitting data to third-party public clouds or external AI APIs.

---

## 2. Non-Negotiable Core Principles

### 2.1 Complete Runtime Sovereignty
* **Zero External AI Calls:** The FORGE runtime MUST NEVER make calls to external cloud AI APIs (e.g., OpenAI, Anthropic/Claude, Google Gemini, Cohere, etc.).
* **Zero External AI SDK Dependencies:** Libraries such as `openai`, `anthropic`, `google-generativeai`, or any public cloud LLM SDKs are strictly prohibited from being runtime dependencies of FORGE.
* **On-Premise Model Execution:** All reasoning, classification, parsing, vision, and code generation tasks execute against locally hosted models via sovereign runtimes (such as Ollama, vLLM, llama.cpp, or local Triton inference servers).

### 2.2 Model Abstraction & Zero Hard-Coding
* **Replaceable Provider Architecture:** All interactions with language and multimodal models MUST occur through an abstract interface (`BaseModelProvider`).
* **Zero Hard-Coded Model Identifiers:** No specific model name, checkpoint string, or parameter specification may be hard-coded into business logic or agent code. Model definitions and provider assignments must always be passed via configuration (`FORGE_MODEL_DEFAULT`, environment variables, or control plane policies).
* **Hot-Swappable Backends:** The system must gracefully support switching local providers (e.g. from Ollama to vLLM or custom local endpoints) without refactoring agent logic.

### 2.3 Strict Determinism & Evidence Verification
* **Evidence-Backed Actions:** Agents operating within FORGE cannot trigger industrial actuation, tool actions, or state transitions without cryptographic or rule-based verification evidence.
* **Sandboxed Tooling:** Industrial tools (PLC read/write, SCADA queries, database mutations, file operations) execute inside bounded, audited sandboxes governed by policy checks.
* **Immutable Audit Trail:** Every prompt, completion, tool call, policy evaluation, and error is recorded in an immutable local audit log.

---

## 3. Monorepo Architecture

The repository is structured to maintain clean domain boundaries and strict separation of concerns:

```
Forge/
├── AGENTS.md                 # System governance, architectural principles, agent guidelines
├── README.md                 # Project overview and development quickstart
├── .gitignore                # Workspace gitignore
├── backend/                  # FastAPI sovereign backend
│   ├── pyproject.toml        # Poetry/Pip project config (Python 3.12)
│   ├── requirements.txt      # Core sovereign backend dependencies
│   ├── .env.example          # Environment variables template
│   ├── app/
│   │   ├── main.py           # Application entrypoint & FastAPI factory
│   │   ├── config.py         # Type-safe configuration settings
│   │   ├── core/             # Agent orchestration, control loop & dispatch
│   │   ├── models/           # Sovereign model provider abstraction & adapters
│   │   ├── security/         # Policy gateways, RBAC, access enforcement
│   │   ├── knowledge/        # Local sovereign vector search, embeddings, RAG
│   │   ├── tools/            # Industrial tool registry, validators, sandbox wrappers
│   │   ├── ingestion/        # Local telemetry, telemetry streams, document parsers
│   │   ├── verification/     # Output validation, evidence collectors, safety proofs
│   │   ├── artifacts/        # Artifact store for plans, reports, code, telemetry charts
│   │   └── audit/            # Append-only audit logger and event bus
│   ├── tests/                # Automated unit and integration test suite
│   └── data/
│       └── demo/             # Offline demo datasets and industrial fixtures
└── frontend/                 # Next.js TypeScript operational control plane UI
    ├── package.json          # Next.js / React dependencies
    ├── tsconfig.json         # Strict TypeScript configuration
    ├── next.config.ts        # Next.js runtime configuration
    ├── src/
    │   ├── app/              # Next.js App Router (pages, layout, API routes)
    │   ├── components/       # Design system and UI control components
    │   └── lib/              # Client utilities and backend API clients
```

---

## 4. Module Responsibilities

1. **`backend/app/models/`**:
   Defines `BaseModelProvider`, standard request/response schemas (`ModelRequest`, `ModelResponse`, `StreamChunk`), and local provider adapters (`OllamaProvider`, etc.).
2. **`backend/app/core/`**:
   The central agent scheduler, sovereign task queue, and state machine.
3. **`backend/app/security/`**:
   Validates every agent action against safety policies before execution.
4. **`backend/app/knowledge/`**:
   Manages local vector storage (Qdrant on-premise) and local semantic embeddings.
5. **`backend/app/tools/`**:
   Provides typed interfaces to local databases, simulation engines, file systems, and industrial protocols.
6. **`backend/app/verification/`**:
   Analyzes agent responses for hallucinations, constraint violations, and missing verification proofs.
7. **`backend/app/artifacts/`**:
   Stores generated telemetry reports, runbooks, and control plans.
8. **`backend/app/audit/`**:
   Maintains a tamper-evident event log of all control plane activities.

---

## 5. Development Guidelines for Future Milestones
- **Never bypass the Model Abstraction:** Never invoke `requests.post("http://localhost:11434/api/generate")` directly in application logic; use the injected `ModelProvider`.
- **Maintain Type Safety:** All Python code must be fully type-hinted; all frontend code must pass strict TypeScript checks.
- **Fail Closed:** If a model fails or verification check is inconclusive, the control plane must halt or escalate to a human operator.
