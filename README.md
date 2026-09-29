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
