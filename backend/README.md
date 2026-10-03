# Backend

Existing FastAPI REST API with SQLAlchemy models, Alembic migrations, and
patient/healthcare-worker routes. Use synthetic data for development.

## Local setup (PowerShell, from repository root)

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` with your local PostgreSQL credentials and a randomly generated
JWT `SECRET_KEY`. Never commit this file. Configuration always reads this backend
file, regardless of the working directory. AI provider variables currently read
the process environment; keep AI in mock mode during foundation testing.

PostgreSQL with pgvector must be installed and running separately. Create an
empty development database matching `DATABASE_URL`, then run:

```powershell
Set-Location backend
.venv/Scripts/python.exe -m alembic upgrade head
.venv/Scripts/python.exe -m uvicorn app.main:app --env-file .env --reload --host 127.0.0.1 --port 8000
```

Alembic currently creates the `vector` extension; the development database role
must have permission to do this. Do not point migrations or tests at patient data.
API docs: http://127.0.0.1:8000/docs. Health: `/api/v1/health`.
Health returns HTTP 200 for application liveness; inspect `database.status` for
database connectivity. A successful health response does not verify migrations.

## Validation

From `backend`:

```powershell
.venv/Scripts/python.exe -m pytest tests/test_health.py tests/test_setup.py -q
.venv/Scripts/python.exe -m pytest -q
```

The full suite needs a migrated disposable PostgreSQL/pgvector database and
includes database writes. The health and setup tests mock database connectivity.
Dependency ranges are currently unpinned; a validated lockfile remains future work.

## Foundation review, 2026-10-03

The existing architecture is retained. CORS now uses an explicit configurable
origin list, and public database failures no longer include raw exception text.
No new medical rules or model selection are introduced.

Before patient use, review existing deterministic triage source traceability,
authorization, consent enforcement, and RAG safety. In particular,
`knowledge_service.generate_embedding` now fails closed when the semantic model
is unavailable; ingestion fails and chat returns a refusal instead of using
synthetic hash vectors. The model cache lives in ignored `backend/.model-cache`.
Mock AI responses and existing milestone labels do not establish clinical validation.

Validation on this machine: 78 tests passed across `test_health.py`,
`test_setup.py`, and `test_m43_rag.py`; `pip check` found no broken requirements,
Python compilation and Git whitespace checks passed, and Alembic resolved the
existing migration head. Subsequent local integration used a separate
`medguide_ai_integration` database: migrations succeeded and all 9 database/core
API tests passed. Ten health/setup/embedding failure tests passed. Five frontend
API-contract tests passed, including a live synthetic registration, login,
profile, symptom-analysis and emergency-chat flow. TypeScript checking passed.
These checks do not constitute medical or clinical evaluation.

## Running local integration

The ignored frontend `.env.local` selects `NEXT_PUBLIC_API_MODE=REAL` and
`NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1`. Run `npm run dev` from
`frontend` and use `http://127.0.0.1:3000`. Public registration supports patients;
healthcare-worker accounts require authorized provisioning. Registration calls
the existing login endpoint after account creation. Symptom submission records
the narrative and then calls `/symptoms/analyze`.

To repeat the live synthetic frontend-client integration test from `frontend`:

```powershell
$env:LIVE_API_TEST='1'
node --test tests/api-contracts.test.mjs
```

This creates synthetic records in the configured backend database; use the
disposable integration database. The emergency test verifies application
behavior, not the clinical validity of its rules.

Ollama inventory is reachable on port 11434 with `llama3:latest` (8B Q4_0).
Generation currently fails with insufficient available memory: the runtime
reported 4.2 GiB required and 1.4 GiB available. This installed model is an
integration candidate, not an evaluated production selection. Real RAG corpus
ingestion and grounded generation remain pending the semantic model download
and sufficient memory. All four PDF hashes match the repository source register.

Frontend installation audit reports 8 high and 1 critical dependency
vulnerabilities, including the installed Next.js version. These remain
unresolved; review compatible security patches before deployment. Development
servers are bound to loopback for this local verification.
