# MedGuide AI — Development Environment Specification

**Project:** MedGuide AI  
**Document:** Development Environment Specification  
**Version:** 1.0  
**Status:** Pre-Implementation Baseline

---

# 1. Purpose

This document defines the development environment required to build, test, run, and maintain MedGuide AI.

It establishes:

- Development machines
- Operating system requirements
- Runtime versions
- Package managers
- Repository structure
- Environment variables
- Local database setup
- AI development environment
- Testing environment
- Git workflow
- Development commands
- Environment separation
- Reproducibility requirements

This document must remain consistent with:

- `AGENTS.md`
- `docs/PROJECT_SPECIFICATION.md`
- `docs/requirements/SRS.md`
- `docs/requirements/PRE_DEVELOPMENT_DECISIONS.md`
- `docs/architecture/SYSTEM_ARCHITECTURE.md`
- `docs/architecture/TECHNOLOGY_STACK.md`
- `docs/database/DATABASE_DESIGN.md`
- `docs/database/ERD.md`
- `docs/api/API_SPECIFICATION.md`
- `docs/ai/AI_RAG_ARCHITECTURE.md`
- `docs/ai/MODEL_SELECTION_AND_EVALUATION.md`
- `docs/ai/MODEL_REGISTRY.md`

---

# 2. Primary Development Machine

The primary development machine is:

| Component | Specification |
|---|---|
| CPU | Intel Core Ultra 7 255U |
| RAM | 16 GB |
| Graphics | Intel Integrated Graphics |
| Storage | 512 GB-class SSD |
| OS | Windows 11 Home 64-bit |
| NPU | Intel AI Boost |
| Architecture | x64 |

This machine is sufficient for:

- Frontend development
- Backend development
- PostgreSQL
- RAG development
- API development
- Testing
- OCR experimentation
- Embedding experimentation
- Small/local AI experiments

Large-model experimentation may use institutional GPU resources or free external compute.

---

# 3. Institutional GPU

College GPU infrastructure may be used for:

- AI experimentation
- Model benchmarking
- Fine-tuning where justified
- Large-model inference
- Model optimization

Current specifications:

```text
GPU: TBD
VRAM: TBD
RAM: TBD
CPU: TBD
OS: TBD
CUDA: TBD
```

These values must not be guessed.

The absence of this information does not block application development.

---

# 4. Operating System

Primary development OS:

```text
Windows 11 64-bit
```

The application itself should remain portable to Linux-based deployment environments.

Development-specific Windows configuration must not become a production dependency.

---

# 5. Required Core Software

The development environment requires:

```text
Git
Python
Node.js
npm
PostgreSQL
Visual Studio Code or equivalent IDE
```

Additional tools should only be installed when required.

---

# 6. Python Runtime

Backend and AI development use Python.

Target Python version:

```text
Python 3.12.x
```

Status:

`CONFIRMED`

The exact patch version used by the project must be recorded.

Verify:

```bash
python --version
```

Expected format:

```text
Python 3.12.x
```

---

# 7. Python Environment

The backend must use an isolated virtual environment.

Recommended:

```text
backend/.venv/
```

The virtual environment must not be committed to Git.

Create:

```bash
python -m venv .venv
```

Activate on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

---

# 8. Python Dependency Management

Backend dependencies must be explicitly recorded.

Initial baseline:

```text
backend/requirements.txt
```

Development dependencies may be separated if required:

```text
backend/requirements-dev.txt
```

No dependency should be installed only locally without being recorded.

---

# 9. Backend Core Dependencies

The initial backend dependency categories are:

```text
FastAPI
Uvicorn
Pydantic
SQLAlchemy
Alembic
PostgreSQL driver
JWT/authentication libraries
Password hashing library
PyTest
```

Exact package versions will be pinned during environment setup.

---

# 10. Node.js Runtime

Frontend development uses Node.js.

Target:

```text
Node.js LTS
```

The exact major version must be pinned after environment initialization.

Verify:

```bash
node --version
npm --version
```

---

# 11. Frontend Dependency Management

The frontend will use:

```text
npm
```

The lockfile must be committed:

```text
package-lock.json
```

Dependencies must be installed using the lockfile for reproducible builds.

Preferred installation:

```bash
npm ci
```

---

# 12. Frontend Core Dependencies

Initial categories:

```text
Next.js
React
TypeScript
Tailwind CSS
PWA-related tooling
API client utilities
Form validation
UI components where required
```

Additional libraries must be introduced only when justified.

---

# 13. Database

Development database:

```text
PostgreSQL
```

Required extension:

```text
pgvector
```

The database must be available locally during backend development.

---

# 14. Local Database

Recommended development database:

```text
medguide_ai_dev
```

Example configuration:

```text
Host: localhost
Port: 5432
Database: medguide_ai_dev
User: <development-user>
Password: <development-password>
```

Actual credentials must never be committed to Git.

---

# 15. Database Environment Variable

The backend should use:

```text
DATABASE_URL
```

Example structure:

```text
postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE
```

The actual credential must exist only in the local environment.

---

# 16. Database Migrations

All schema changes must use:

```text
Alembic
```

Workflow:

```text
SQLAlchemy Model
      ↓
Migration
      ↓
Database
```

Developers must not manually modify the database schema as a substitute for migrations.

---

# 17. Initial Migration

The initial migration will be generated only after:

* SQLAlchemy models are implemented.
* Relationships are verified.
* Constraints are verified.
* ERD consistency is checked.

Do not generate an initial migration from incomplete models.

---

# 18. Repository Structure

The repository baseline is:

```text
medguide-ai/
│
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
│
├── frontend/
│
├── backend/
│
├── ai/
│
├── data/
│
├── tests/
│
├── scripts/
│
└── docs/
```

---

# 19. Frontend Structure

The frontend should evolve toward:

```text
frontend/
│
├── app/
├── components/
├── features/
├── lib/
├── hooks/
├── services/
├── types/
├── public/
└── tests/
```

Exact organization must follow the frontend architecture once implementation begins.

---

# 20. Backend Structure

The backend should evolve toward:

```text
backend/
│
├── app/
│   ├── main.py
│   ├── core/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── ai/
│   ├── db/
│   └── workers/
│
├── migrations/
├── tests/
├── requirements.txt
└── .env.example
```

The structure must preserve separation between:

```text
API
Business Logic
Database
AI
Infrastructure
```

---

# 21. AI Structure

The AI directory should evolve toward:

```text
ai/
│
├── llm/
├── embeddings/
├── rag/
├── ocr/
├── speech/
├── symptom_extraction/
├── triage/
├── prompts/
├── evaluation/
└── experiments/
```

Experimental code must remain separate from production services.

---

# 22. Data Structure

The data directory should evolve toward:

```text
data/
│
├── raw/
├── processed/
├── knowledge_base/
├── evaluation/
└── README.md
```

---

# 23. Data Rules

Never commit:

* Real patient records
* Personal health information
* API credentials
* Private prescriptions
* Unauthorized datasets
* Production database dumps

The repository should contain only approved development data.

---

# 24. Tests Structure

The project should use:

```text
tests/
│
├── backend/
├── frontend/
├── ai/
├── integration/
├── security/
└── fixtures/
```

Testing must cover both normal and safety-critical behavior.

---

# 25. Environment Files

The repository must contain:

```text
.env.example
```

but never actual secrets.

Example:

```text
DATABASE_URL=
JWT_SECRET=
AI_PROVIDER_API_KEY=
AI_MODEL=
```

Values are placeholders only.

---

# 26. Environment Separation

The project must distinguish:

```text
Development
Testing
Production
```

Conceptually:

```text
.env.development
.env.test
.env.production
```

Actual environment-file strategy depends on deployment infrastructure.

Production secrets must never be stored in Git.

---

# 27. Git Ignore

The `.gitignore` must exclude at minimum:

```text
.env
.env.*
!.env.example

.venv/
__pycache__/
*.pyc

node_modules/
.next/

coverage/
.pytest_cache/

*.log

model weights
large datasets
temporary files
OS-specific files
IDE-specific files
```

The exact `.gitignore` must be reviewed before the first commit.

---

# 28. Git Branching

Baseline:

```text
main
│
├── feature/*
├── fix/*
└── experiment/*
```

`main` should remain stable.

Experimental AI work should use:

```text
experiment/*
```

where appropriate.

---

# 29. Commit Rules

Commits should be:

* Small
* Focused
* Descriptive
* Related to one logical change

Examples:

```text
feat: initialize FastAPI backend
feat: add database configuration
feat: add user model
fix: correct consent validation
test: add authentication tests
docs: update API specification
```

Do not create meaningless commits such as:

```text
update
changes
final
working
test123
```

---

# 30. Documentation Synchronization

When implementation changes a documented contract:

```text
Code Change
    ↓
Check Documentation
    ↓
Update Relevant Document
    ↓
Run Tests
    ↓
Commit
```

Documentation must not intentionally describe behavior that the code does not implement.

---

# 31. API Development Rule

The API specification is the contract.

Before implementing an endpoint:

```text
API_SPECIFICATION.md
        ↓
Endpoint
        ↓
Request Schema
        ↓
Response Schema
        ↓
Authentication
        ↓
Authorization
        ↓
Implementation
        ↓
Tests
```

If implementation requires a new endpoint or changes an existing contract, update the API specification first.

---

# 32. Database Development Rule

Before creating a model:

```text
ERD.md
   ↓
DATABASE_DESIGN.md
   ↓
SQLAlchemy Model
   ↓
Migration
   ↓
Tests
```

Do not invent new entities without checking the existing database specification.

---

# 33. AI Development Rule

Before implementing an AI component:

```text
AI_RAG_ARCHITECTURE.md
        ↓
MODEL_REGISTRY.md
        ↓
Approved/Tentative model
        ↓
AI Interface
        ↓
Implementation
        ↓
Evaluation
```

Unapproved models may be used only in explicitly marked experiments.

---

# 34. AI Provider Abstraction

The backend must not directly couple application logic to a specific LLM provider.

Conceptually:

```text
Application
    ↓
AI Gateway
    ↓
Provider Interface
    ↓
Specific Provider
```

This allows model/provider replacement without rewriting application features.

---

# 35. Local Development Commands

The project should eventually provide simple commands for:

### Backend

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
npm run dev
```

### Tests

```bash
pytest
```

### Database migrations

```bash
alembic upgrade head
```

Exact commands may be adjusted during implementation.

---

# 36. Local Development Startup

The expected local system:

```text
PostgreSQL
    ↓
Backend
    ↓
AI Services
    ↓
Frontend
```

Recommended startup order:

```text
1. PostgreSQL
2. Backend
3. AI dependencies/services
4. Frontend
```

---

# 37. Health Checks

The backend should expose an appropriate health endpoint.

Example:

```text
GET /api/v1/health
```

The health check should distinguish application availability from dependency availability where appropriate.

---

# 38. AI Health Checks

AI providers/services should have appropriate availability checks.

The system must handle:

```text
AI unavailable
RAG unavailable
OCR unavailable
STT unavailable
```

without crashing unrelated application functionality.

---

# 39. Failure Isolation

Failure of an AI component must not automatically cause failure of the entire application.

Example:

```text
OCR unavailable
      ↓
Prescription feature unavailable
      ↓
Medication reminder still works
      ↓
Patient profile still works
```

---

# 40. Development Logging

Development logs may be verbose.

Production logs must avoid unnecessary sensitive health information.

Never log:

```text
Passwords
JWT secrets
API keys
Full patient medical records
Sensitive prescription contents
```

---

# 41. Local AI Models

Local model files should not normally be stored directly inside Git.

Recommended:

```text
Model Identifier
+
Download Instructions
+
Configuration
```

Large model files should remain outside the source repository.

---

# 42. AI Experiment Reproducibility

Every AI experiment should record:

```text
Model
Version
Dataset
Dataset Version
Prompt
Prompt Version
Configuration
Hardware
Software Version
Metrics
Results
```

This follows:

`MODEL_SELECTION_AND_EVALUATION.md`

---

# 43. Free Resource Policy

The project targets:

```text
₹0
```

for student development wherever technically feasible.

Preferred order:

```text
Open Source
   ↓
Local Resources
   ↓
College Infrastructure
   ↓
Free External Compute
   ↓
Free API Tier
```

Paid infrastructure must not be introduced without an explicit project decision.

---

# 44. College GPU Usage

When available, the college GPU may be used for:

* AI benchmarking
* Model experiments
* Fine-tuning
* Quantization
* Large-model inference

The GPU environment must not become a hidden production dependency.

---

# 45. Reproducibility on Another Machine

A new developer should be able to:

```text
Clone Repository
      ↓
Install Dependencies
      ↓
Configure .env
      ↓
Create Database
      ↓
Run Migrations
      ↓
Start Backend
      ↓
Start Frontend
      ↓
Run Tests
```

without manually reconstructing undocumented setup steps.

---

# 46. Setup Documentation

The root `README.md` must eventually contain:

* Prerequisites
* Installation
* Environment setup
* Database setup
* Backend setup
* Frontend setup
* Running the project
* Running tests
* AI setup
* Troubleshooting

The README should reference detailed documentation rather than duplicating every technical specification.

---

# 47. IDE / Coding Agent Rules

AI coding agents must:

1. Read `AGENTS.md` before modifying code.
2. Check relevant specification documents.
3. Inspect existing implementation before creating new files.
4. Avoid duplicating existing functionality.
5. Never invent API contracts.
6. Never invent database fields.
7. Never change architecture silently.
8. Never replace approved technologies without authorization.
9. Keep healthcare safety constraints active.
10. Run relevant tests after implementation.
11. Report failures honestly.
12. Never fabricate successful test results.

---

# 48. Implementation Boundary

The project is now transitioning from:

```text
Planning
```

to:

```text
Implementation
```

However, AI models remain independently evaluable.

Therefore:

```text
Application Development
        +
AI Model Evaluation
```

will proceed as parallel workstreams.

---

# 49. First Implementation Milestone

The first implementation milestone is:

> **Establish a runnable backend + database foundation without implementing healthcare AI behavior.**

It must include:

```text
FastAPI application
Environment configuration
PostgreSQL connection
SQLAlchemy
Alembic
Health endpoint
Basic project configuration
Automated backend test
```

It must NOT yet include:

* LLM integration
* Medical diagnosis
* Prescription interpretation
* Production triage
* Real patient workflows

---

# 50. First Milestone Success Criteria

The milestone is complete only when:

```text
Backend starts successfully
        ↓
Database connects successfully
        ↓
Alembic works
        ↓
Health endpoint responds
        ↓
Basic automated test passes
        ↓
No secrets committed
        ↓
Documentation matches implementation
```

---

# 51. Next Milestones

After Milestone 1:

```text
M1 — Backend Foundation
        ↓
M2 — Database Models + Migrations
        ↓
M3 — Authentication + RBAC
        ↓
M4 — Consent Management
        ↓
M5 — Patient Profile
        ↓
M6 — Symptom Records
        ↓
M7 — Deterministic Triage
        ↓
M8 — AI Gateway
        ↓
M9 — RAG
        ↓
M10 — AI Chat
        ↓
M11 — Prescription OCR
        ↓
M12 — Medication System
        ↓
M13 — Healthcare Worker Dashboard
        ↓
M14 — Speech + Multilingual
        ↓
M15 — Offline/PWA + Sync
        ↓
M16 — Full Integration Testing
        ↓
M17 — AI Evaluation
        ↓
M18 — Deployment
```

---

# 52. Development Golden Rule

> **Implement one controlled milestone at a time.**

Do not ask an AI coding agent to implement the entire MedGuide AI platform in one operation.

Every milestone must:

```text
Read Requirements
      ↓
Implement
      ↓
Test
      ↓
Review
      ↓
Update Documentation
      ↓
Commit
```

---

# 53. Current Status

```text
Repository Foundation             ✅
Requirements                       ✅
Architecture                       ✅
Database Design                    ✅
API Contract                       ✅
AI/RAG Architecture                ✅
Model Evaluation Framework         ✅
Model Registry                     ✅
Candidate Research                 ✅
Technology Stack                   ✅
Development Environment            ✅ THIS DOCUMENT
Implementation                     ⏳ NEXT
```

---

# 54. Final Rule

> **No production feature should be implemented until its requirement, architecture, API/data contract, safety implications, and test strategy are understood.**
