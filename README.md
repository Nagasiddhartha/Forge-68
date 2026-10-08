# FORGE: Sovereign Industrial AI Control Plane

FORGE is an on-premise, air-gapped Sovereign AI Control Plane engineered for high-consequence industrial, petrochemical, and manufacturing environments (tailored for operational facilities such as Mangalore Refinery and Petrochemicals Limited - MRPL).

FORGE orchestrates sovereign local language models, policy gateways, sandboxed tools, local vector knowledge fabric, computer vision inspectors, and independent verification engines without ever transmitting telemetry, documentation, or operational queries to external cloud AI APIs.

---

## Non-Negotiable System Tenets

1. **100% Runtime Sovereignty:** Zero cloud AI calls (strictly no OpenAI, Anthropic, Gemini, or external inference APIs). Zero cloud AI SDK dependencies in backend runtime dependencies.
2. **Dynamic Model Abstraction:** Interactions with language and multimodal models execute through an abstract provider interface (BaseModelProvider) supporting hot-swappable local engines (Ollama, vLLM, llama.cpp, Triton).
3. **Zero Hard-Coded Identifiers:** Model checkpoints and parameters are dynamically injected via environment variables and configuration (FORGE_MODEL_DEFAULT), never hardcoded in application logic.
4. **Deterministic Evidence Verification:** The model never verifies itself. All agent claims must be corroborated by 7 independent deterministic mathematical and policy checks before operational presentation.
5. **Regional Multilingual Fabric:** Native trilingual operational support (**English**, **Hindi / हिंदी**, and **Kannada / ಕನ್ನಡ**) covering the entire UI, trace lifecycles, offline synthesis, and exported regulatory approval dossiers.
6. **Tamper-Evident Auditability:** Every query, tool invocation, policy decision, calculation, and verification result is committed to an immutable append-only event store.

---

## Monorepo Architecture

`
Forge/
├── AGENTS.md                                     # System architecture, sovereignty rules & governance
├── README.md                                     # Engineering documentation & operational runbook
├── FORGE_System_Evaluation_and_Competitor_Analysis.pdf # Enterprise assessment & competitor analysis
├── scripts/
│   └── start-forge.ps1                           # One-command preflight & startup orchestrator
├── backend/                                      # FastAPI Sovereign Backend (Python 3.12)
│   ├── pyproject.toml                            # Dependencies and test configuration
│   ├── requirements.txt                          # Sovereign backend requirements (0 cloud AI SDKs)
│   ├── app/
│   │   ├── main.py                               # FastAPI entrypoint, router dispatch & lifecycle
│   │   ├── config.py                             # Type-safe configuration settings
│   │   ├── preflight.py                          # Runtime diagnostics & dependency scanner
│   │   ├── core/                                 # Agent orchestration, prompts, schemas & reasoning
│   │   ├── models/                               # Sovereign BaseModelProvider & Ollama adapter
│   │   ├── security/                             # PolicyGateway, RBAC, access enforcement & adversarial matrix
│   │   ├── knowledge/                            # Local vector embeddings, chunking & document RAG
│   │   ├── tools/                                # Industrial tool registry, sandboxes & validators
│   │   ├── vision/                               # Local multimodal gauge & defect inspection
│   │   ├── verification/                         # 7 deterministic proof checks & calculation engine
│   │   ├── deliverables/                         # Localized DOCX approval dossier generator (.docx)
│   │   ├── demo/                                 # Deterministic scenario harnesses & reset service
│   │   └── audit/                                # Immutable event bus & SHA-256 hash chains
│   ├── tests/                                    # 168 automated unit & integration tests
│   └── data/
│       ├── demo/                                 # Offline synthetic refinery fixtures & SOPs
│       └── deliverables/                         # Destination for generated regulatory dossiers
└── frontend/                                     # Operational Dashboard (Next.js 16 + React 19)
    ├── package.json                              # Node dependencies
    ├── tsconfig.json                             # Strict TypeScript configuration
    ├── next.config.ts                            # Next.js Turbopack configuration
    └── src/
        ├── app/                                  # Next.js App Router (layout, page, styles)
        ├── components/                           # Control plane views, cards, dials & sub-panels
        └── lib/                                  # Trilingual dictionary (i18n), API clients & permissions
`

---

## Key Platform Capabilities

### 1. Regional Multilingual Operations (English, Hindi, Kannada)
Designed specifically for Indian industrial and refinery contexts:
* **Complete UI/UX Coverage:** Switching locales changes all views, navigation badges, telemetry dials, modal dialogs, execution trace phases, and diagnostic drawers.
* **Dual-Language Engineering Nomenclature:** Engineering identifiers (R-204, 34.8 bar, PAUT-04, SHA-256, timestamps) remain untranslated alongside dual-language terminology for strict statutory compliance.
* **Localized Synthesis:** Offline agent synthesis and deterministic demo scenarios output fully localized technical analyses in English, Hindi, and Kannada.

### 2. Regulatory Engineering Dossiers (DOCX Export)
* Exports formal, print-ready .docx engineering dossiers compliant with plant documentation standards.
* Includes asset metadata, empirical PAUT/ultrasonic readings, deterministic arithmetic calculations, 7 independent verification proofs, cryptographic SHA-256 evidence ledgers, and statutory sign-off tables.
* Output documents are fully localized in **English**, **Hindi**, or **Kannada**.

### 3. Seven Deterministic Independent Proof Checks
The control plane strictly prohibits language models from self-verifying. Instead, 7 deterministic Python routines independently validate all generated responses:
1. **PROVENANCE:** All citations and references resolve to genuine SHA-256 hashes of ingested documents and sensors.
2. **COMPLETENESS:** Every claim in the agent's response is backed by retrieved evidence records.
3. **POLICY:** Evaluates whether operations conform to role-based clearance (blocks critical-risk write actuations).
4. **CLASSIFICATION:** Confirms requester clearance strictly subsumes the classification tier of accessed documents.
5. **PARAMETER_CONSISTENCY:** Cross-references telemetry across multiple independent sensors to detect sensor drifts.
6. **ARITHMETIC_VERIFICATION:** Deterministic calculation engine re-evaluates all mathematical claims (corrosion rates, pressure variances, safety trip margins).
7. **GROUNDING:** Ensures nominal operational statements contain no ungrounded extrapolations or hallucinations.

### 4. Adversarial Security Boundary Matrix
A hardened test suite verifies 10 critical security boundaries against deliberate adversarial bypass:
* **SEC-001 (Cloud Provider Egress):** 0 external cloud calls; triggers SovereigntyViolationError.
* **SEC-002 (Unauthorized Actuation):** Critical-risk tools blocked by default-deny PolicyGateway.
* **SEC-003 (Prompt Injection):** Adversarial instructions quarantined as inert data; zero tool execution.
* **SEC-004 (Fabricated Provenance):** Rejects synthetic or hallucinated citation hashes.
* **SEC-005 (Classification Escalation):** Model text cannot downgrade or bypass document clearance tags.
* **SEC-006 (Path Traversal):** Rejects ../ and absolute path injection attempts.
* **SEC-007 (Arbitrary Code/Math Injection):** Rejects eval, exec, and malicious code injection.
* **SEC-008 (Shell Command Injection):** Rejects OS shell escape attempts.
* **SEC-009 (Vision Safety Assertions):** Visual detections cannot assert operational clearance without physical telemetry.
* **SEC-010 (Verification Bypass):** Prevents model text from self-certifying VERIFIED status.

---

## Quickstart & Installation

### Prerequisites
* **Python:** 3.12+ (or 3.11+)
* **Node.js:** 20+ & npm
* **Ollama (Optional for live local inference):** Configured with local model (e.g. qwen3:8b or qwen2.5-coder). FORGE operates with 100% functional completeness in sovereign deterministic mode even when Ollama is offline.

---

### Backend Setup

`ash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# Install sovereign dependencies (zero external AI SDKs)
pip install -r requirements.txt

# Run backend test suite (168 tests)
pytest tests/

# Launch backend server
uvicorn app.main:app --reload --port 8000
`
Backend Swagger API Documentation: http://localhost:8000/docs  
Backend Health Check: http://localhost:8000/health

---

### Frontend Setup

`ash
cd frontend

# Install Node dependencies
npm install

# Verify production build and TypeScript compilation
npm run build

# Start development server
npm run dev
`
Operational Control Plane UI: http://localhost:3000

---

### One-Command Startup (Windows)

To run preflight diagnostics and launch both backend and frontend concurrently:
`powershell
powershell -ExecutionPolicy Bypass -File scripts\start-forge.ps1
`
*(Use -PreflightOnly to inspect local runtime diagnostics without starting services).*

---

## Automated Test Suites

The repository maintains 100% test pass rates across 168 automated unit and integration tests:

`ash
cd backend
pytest tests/ -v
`

| Test Suite | Tests | Purpose |
| :--- | :---: | :--- |
| 	ests/test_deliverables.py | 5 | Trilingual DOCX generator, OpenXML validation, table integrity |
| 	ests/test_demo.py | 10 | Deterministic scenario dispatch, timing benchmarks, reset service |
| 	ests/test_e2e_full_features.py | 1 | Full end-to-end integration across all subsystems |
| 	ests/test_health.py | 3 | Subsystem health monitors and runtime probes |
| 	ests/test_knowledge.py | 12 | Ingestion, chunking, local vector index & cosine retrieval |
| 	ests/test_models.py | 4 | Sovereign model abstraction & provider interchangeability |
| 	ests/test_offline_fallback.py | 6 | Sovereign offline fallback synthesis & multilingual output |
| 	ests/test_policy.py | 9 | Default-deny policy gateway & RBAC rule evaluation |
| 	ests/test_reasoning.py | 18 | Model planning, tool calling, synthesis & prompt security |
| 	ests/test_runtime_validation.py | 20 | Preflight diagnostics, socket verification & dependency audit |
| 	ests/test_security_hardening.py | 12 | 10 adversarial security boundary verification probes |
| 	ests/test_tools.py | 12 | Sandboxed industrial tool registry & parameter sanitization |
| 	ests/test_unified_agent.py | 15 | Unified agent coordinator with knowledge, tools & verification |
| 	ests/test_verification.py | 20 | 7 independent deterministic mathematical and policy checks |
| 	ests/test_vision.py | 21 | Multimodal dial gauge parsing, bounding boxes & defect detection |
| **Total** | **168** | **All 168 Passing (100%)** |

---

## Operational Walkthrough

1. **Select Operational Persona:** Choose between Plant Engineer, Inspection Specialist, AI Safety Officer, or Plant Administrator.
2. **Choose Interface Language:** Select **English**, **Hindi (हिंदी)**, or **Kannada (ಕನ್ನಡ)** from the header selector. Observe instantaneous re-rendering of all metrics, navigation, and labels.
3. **Run Scenario 1 (Flagship R-204 Nominal Investigation):**
   * Investigates Reactor R-204 operating parameters.
   * Pulls SOP limits, PAUT ultrasonic wall thickness (72.8 mm vs 68.2 mm limit), and historical maintenance records.
   * All 7 verification checks pass (VERIFIED AGAINST AVAILABLE EVIDENCE).
4. **Run Scenario 2 (Multimodal Pressure Variance):**
   * Inspects analog gauge PI-204 image reading 33.0 bar.
   * Mathematical engine calculates +1.8 bar (+5.77%) deviation above SOP nominal 31.2 bar.
   * Verification engine flags parameter variance (NEEDS ENGINEERING REVIEW).
5. **Run Scenario 3 (Unauthorized Tool - Policy Denial):**
   * Requests relief valve calibration actuation.
   * PolicyGateway evaluates role clearance and denies execution prior to dispatch. Handlers executed: 0.
6. **Run Scenario 4 (Prompt Injection Defense):**
   * Ingests adversarial maintenance advisory text.
   * Isolation boundary quarantines instruction payload as untrusted inert data.
7. **Export Regulatory Dossier:**
   * Click **Export Regulatory Approval Dossier (.docx)** in the AI Workspace.
   * Generates and downloads an engineering approval note in the active language (English, Hindi, or Kannada) containing all audit and verification proofs.
8. **Inspect Immutable Audit Trail:**
   * Navigate to the **Audit** destination to inspect chronological event records with SHA-256 hash chains.

---

## Air-Gapped & Synthetic Data Compliance

* **Synthetic Demonstration Fixtures:** All refinery assets (Reactor R-204, Pump P-201, Exchanger E-301), pressure gauge readings, inspection measurements, corrosion logs, ultrasonic reports, and adversarial security advisories are 100% synthetic demonstration fixtures.
* **Zero Cloud Transmissions:** The system runs completely self-contained within local host boundaries.
