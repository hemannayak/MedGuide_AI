# MedGuide AI — Development Environment Specification

**Project:** MedGuide AI

**Document:** Development Environment Specification

**Version:** 2.0

**Status:** Approved Development Baseline

**Primary Development Machine:** Laptop A

**Supporting Development Machine:** Laptop B

**Primary Target:** Local-first, reproducible, real-time healthcare-support platform

---

# 1. Purpose

This document defines the development environment, hardware allocation, software runtimes, AI execution strategy, database configuration, development workflow, testing environment, security rules, and milestone execution process for MedGuide AI.

The environment is designed around the following project constraints:

1. The project must remain locally runnable wherever practically possible.
2. Free and open-source resources should be preferred.
3. External services must remain replaceable.
4. The system must support an offline-first architecture.
5. Safety-critical decisions must not depend exclusively on an LLM.
6. AI models must be evaluated before the final production model is selected.
7. Online AI providers must not become mandatory dependencies for the offline system.
8. Development must remain reproducible across machines.
9. All datasets, models, APIs, and external resources must have documented provenance.
10. Development must proceed milestone-by-milestone from M1 through M18.

---

# 2. Development Machine Architecture

MedGuide AI uses a two-machine development strategy.

```text
                         MEDGUIDE AI DEVELOPMENT
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
               LAPTOP A                    LAPTOP B
              MAIN / CORE                SUPPORT / SECONDARY
                    │                           │
        ┌───────────┼───────────┐               │
        │           │           │               │
        ▼           ▼           ▼               ▼
      Backend     Database     Local AI       Frontend /
      FastAPI     PostgreSQL   Ollama          UI / Testing
                   pgvector
        │           │           │
        └───────────┼───────────┘
                    │
                    ▼
             Shared Git Repository
                    │
                    ▼
             College GPU / Colab
             Heavy Experiments
```

Laptop A is the **primary integration and core-development machine**.

Laptop B may be used for parallel frontend work, experimentation, documentation, testing, and other development tasks without becoming a required dependency.

---

# 3. Laptop A — Primary Development Machine

## 3.1 Hardware

| Parameter        | Specification                  |
| ---------------- | ------------------------------ |
| CPU              | Intel Core Ultra 7 255U        |
| Architecture     | x64                            |
| RAM              | 16 GB                          |
| Storage          | 512 GB SSD                     |
| Graphics         | Intel Integrated Graphics      |
| NPU              | Intel AI Boost NPU             |
| Operating System | Windows 11 Home 64-bit         |
| Primary Role     | Core development + integration |

---

## 3.2 Laptop A Responsibilities

Laptop A is responsible for the main working implementation of:

* FastAPI backend
* PostgreSQL
* pgvector
* Alembic migrations
* Authentication
* Consent
* Patient profiles
* Symptom processing
* Deterministic triage
* AI Gateway
* RAG
* Local LLM testing
* Ollama
* Prescription OCR experimentation
* Local speech experimentation
* Medication system
* Healthcare-worker APIs
* Offline synchronization
* Integration testing
* Backend/frontend integration
* End-to-end testing

Laptop A is therefore the machine on which the complete system should eventually be capable of running locally for demonstration and evaluation, subject to hardware limitations of individual AI models.

---

# 4. Laptop B — Supporting Development Machine

Laptop B is a secondary development environment.

Its exact hardware specifications should be documented separately if required.

Primary responsibilities may include:

* Frontend development
* UI/UX implementation
* React/Next.js development
* Responsive testing
* Documentation
* API testing
* Lightweight AI experiments
* Evaluation scripts
* Test execution
* Git-based parallel development

Laptop B must not contain the only copy of any important project resource.

All important project changes must be committed to the shared Git repository.

---

# 5. External / Institutional Compute

Large experiments should not force the local development machine to run models that exceed its practical limits.

Available external compute may include:

* College GPU infrastructure
* Google Colab
* Other approved free compute resources

These environments may be used for:

* Large-model benchmarking
* Model comparison
* Embedding experiments
* Speech model evaluation
* OCR experiments
* Batch evaluation
* Dataset preprocessing
* Research experiments

External compute must not silently become a mandatory runtime dependency for the core application.

---

# 6. Core Technology Stack

## 6.1 Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* PWA capabilities
* IndexedDB for local data/cache where required

---

## 6.2 Backend

* Python 3.12.x
* FastAPI
* Uvicorn
* Pydantic
* SQLAlchemy
* Alembic
* Pytest

---

## 6.3 Database

* PostgreSQL
* pgvector
* SQLAlchemy
* Alembic

Database schema changes must be implemented through migrations.

Manual production-schema modifications are prohibited.

---

## 6.4 AI/ML

The AI layer is divided into independent components:

```text
AI Gateway
    │
    ├── LLM
    │
    ├── RAG
    │
    ├── STT
    │
    ├── TTS
    │
    ├── OCR
    │
    ├── Symptom Extraction
    │
    └── Safety / Triage
```

Each component must have an abstraction boundary.

---

# 7. LLM Runtime — Ollama

## 7.1 Role of Ollama

Ollama is the **local LLM runtime** for MedGuide AI.

It is responsible for running the selected local language model.

Ollama is NOT:

* The RAG database
* The speech system
* The OCR system
* The triage engine
* The safety engine
* The source of medical truth

Ollama provides the runtime for the LLM used for tasks such as:

* Grounded response generation
* Explanation
* Summarization
* Conversational interaction
* Multilingual response generation
* Structured natural-language generation

---

## 7.2 Local Model Selection

The final LLM must not be permanently selected before evaluation.

Candidate models may include:

* Qwen family
* Gemma family
* Other suitable multilingual open-source models

The Phase 1 model evaluation should prioritize:

1. English performance
2. Hindi performance
3. Telugu performance
4. Code-mixed language understanding
5. RAG grounding
6. Medical safety
7. Refusal behavior
8. Instruction following
9. CPU latency
10. RAM consumption
11. Quantized inference feasibility

The final model should be selected based on measured results rather than model popularity.

---

# 8. Sarvam Integration Strategy

Sarvam is an **online external AI provider** used primarily for Indian-language and document-processing capabilities where it provides a meaningful quality advantage.

Sarvam is not the primary LLM runtime.

The architecture is:

```text
                    AI GATEWAY
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
       LLM             Speech            OCR
        │               │                │
     Ollama        Sarvam / Local   Sarvam / Local
```

---

## 8.1 Sarvam STT

When internet connectivity is available, Sarvam may be used for:

* Speech-to-text
* Indian-language speech recognition
* Hindi speech
* Telugu speech
* English speech where appropriate
* Code-mixed speech evaluation

The provider must be accessed through an STT provider interface.

Example:

```text
STTProvider
    ├── SarvamSTTProvider
    └── LocalSTTProvider
```

---

## 8.2 Sarvam TTS

Sarvam may be used for online:

* Hindi TTS
* Telugu TTS
* English TTS
* Natural Indian-language voice output

The architecture must allow:

```text
TTSProvider
    ├── SarvamTTSProvider
    └── LocalTTSProvider
```

Sarvam's voice quality should be empirically evaluated before being treated as the preferred online provider.

---

## 8.3 Sarvam OCR

Where technically and practically appropriate, Sarvam may be evaluated for:

* Prescription OCR
* Indian-language document recognition
* Document text extraction

The architecture must also provide a local OCR path.

```text
OCRProvider
    ├── SarvamOCRProvider
    └── LocalOCRProvider
```

Potential local OCR technologies include:

* PaddleOCR
* Tesseract
* Other evaluated open-source OCR models

---

# 9. Online vs Offline AI Strategy

Online and offline capabilities must be explicitly separated.

## 9.1 Online

When internet connectivity is available:

```text
User
 │
 ▼
MedGuide
 │
 ├── Ollama Local LLM
 │
 ├── Local RAG
 │
 ├── Sarvam STT
 │
 ├── Sarvam TTS
 │
 └── Sarvam OCR
```

Online provider selection may improve language, voice, or document-processing quality.

---

## 9.2 Offline

When internet connectivity is unavailable:

```text
User
 │
 ▼
MedGuide Offline Layer
 │
 ├── Local LLM via Ollama
 ├── Local RAG / Cached Knowledge
 ├── Local STT
 ├── Local TTS
 ├── Local OCR
 ├── Deterministic Triage
 ├── Medication Reminders
 └── Local Sync Queue
```

The exact local STT, TTS, and OCR models must be selected through evaluation.

---

## 9.3 Important Rule

> **Sarvam must improve the online experience without becoming the definition of MedGuide AI's offline capability.**

If Sarvam is unavailable because there is no network:

* The application must not crash.
* The user must receive an appropriate offline state.
* Local alternatives should be used where feasible.
* Safety-critical deterministic functionality must remain available.

---

# 10. AI Gateway

All AI providers must be accessed through an abstraction layer.

Recommended interfaces:

```python
class LLMProvider:
    ...

class STTProvider:
    ...

class TTSProvider:
    ...

class OCRProvider:
    ...

class EmbeddingProvider:
    ...
```

Example architecture:

```text
Application
     │
     ▼
AI Gateway
     │
     ├── LLMProvider
     │      └── Ollama
     │
     ├── STTProvider
     │      ├── Sarvam
     │      └── Local STT
     │
     ├── TTSProvider
     │      ├── Sarvam
     │      └── Local TTS
     │
     └── OCRProvider
            ├── Sarvam
            └── Local OCR
```

Application code must not directly depend on provider-specific implementation details.

---

# 11. RAG Development Environment

The RAG system runs primarily using:

* PostgreSQL
* pgvector
* Embedding model
* Approved medical knowledge corpus

Pipeline:

```text
Approved Medical Sources
        ↓
Validation
        ↓
Cleaning
        ↓
Chunking
        ↓
Embedding
        ↓
pgvector
        ↓
User Query
        ↓
Query Embedding
        ↓
Similarity Search
        ↓
Evidence Gate
        ↓
Ollama LLM
        ↓
Grounded Response
```

---

# 12. Medical Knowledge Resource Requirement

Before implementing M9 fully, the required medical knowledge resources must be identified and acquired.

The project must maintain:

```text
data/
└── knowledge_base/
    ├── raw/
    ├── processed/
    ├── manifests/
    └── evaluation/
```

Each source must record:

* Source name
* Publisher
* URL
* License
* Version
* Publication date
* Language
* Topic
* Processing status
* Last reviewed date

No unverified medical document should be silently added to the production RAG corpus.

---

# 13. Dataset Acquisition Rule

Required datasets/resources must be tracked before the corresponding implementation/evaluation milestone.

Examples:

| Resource                          | Required By |
| --------------------------------- | ----------- |
| Medical RAG corpus                | M9          |
| Symptom/triage evaluation dataset | M6–M7 / M17 |
| Prescription OCR dataset          | M11 / M17   |
| Medicine extraction dataset       | M11 / M17   |
| English speech data               | M14 / M17   |
| Hindi speech data                 | M14 / M17   |
| Telugu speech data                | M14 / M17   |
| TTS evaluation material           | M14 / M17   |
| Multilingual text evaluation set  | M14 / M17   |
| Offline workflow test data        | M15 / M17   |
| Synthetic patient data            | M16         |

Every dataset must have documented provenance.

---

# 14. Python Environment

Backend and AI services use Python 3.12.x.

Recommended environment:

```text
backend/
└── .venv/
```

Create:

```bash
python -m venv .venv
```

Activate on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies using the project's dependency specification.

---

# 15. Core Python Dependencies

Expected categories include:

```text
FastAPI
Uvicorn
Pydantic
SQLAlchemy
Alembic
psycopg
Pytest
JWT library
Password hashing library
HTTP client
NumPy
Pandas
PyTorch
Transformers
Sentence Transformers
```

AI-specific dependencies should be added only when required by the selected implementation.

Avoid unnecessary packages that increase deployment size or security surface.

---

# 16. Node.js Environment

Frontend development uses:

* Node.js LTS
* npm
* `package-lock.json`

Expected frontend stack:

```text
Next.js
React
TypeScript
Tailwind CSS
PWA tooling
```

Dependencies must be installed from the committed lockfile.

---

# 17. Database Environment

## Development Database

```text
Database:
PostgreSQL

Database Name:
medguide_ai_dev

Extension:
pgvector
```

Connection is configured through:

```text
DATABASE_URL
```

Example structure:

```text
postgresql://<user>:<password>@localhost:<port>/medguide_ai_dev
```

Credentials must never be committed to Git.

---

# 18. Database Migration Rules

Alembic is the authoritative migration mechanism.

Typical workflow:

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

Rules:

1. Never manually modify the development database schema as a substitute for migrations.
2. Every schema change must have a migration.
3. Migration files must be committed.
4. Migrations must be tested on a clean database before major releases.

---

# 19. Environment Variables

A `.env.example` file must document required configuration.

Examples:

```text
DATABASE_URL=
JWT_SECRET=
OLLAMA_BASE_URL=
OLLAMA_MODEL=

SARVAM_API_KEY=

STORAGE_PATH=

APP_ENV=
API_BASE_URL=
FRONTEND_URL=
```

Rules:

* Never commit `.env`.
* Never commit API keys.
* Never place secrets directly in source code.
* Use environment variables.
* External provider keys must be optional where the corresponding feature has a local fallback.

---

# 20. Repository Structure

Recommended repository structure:

```text
MedGuide_AI/
│
├── AGENTS.md
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── db/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
│
├── ai/
│   ├── llm/
│   ├── embeddings/
│   ├── rag/
│   ├── ocr/
│   ├── speech/
│   ├── symptom_extraction/
│   ├── triage/
│   ├── prompts/
│   └── evaluation/
│
├── data/
│   ├── raw/
│   ├── processed/
│   ├── knowledge_base/
│   └── evaluation/
│
├── tests/
│   ├── backend/
│   ├── frontend/
│   ├── ai/
│   ├── integration/
│   ├── security/
│   └── offline/
│
├── scripts/
│
└── docs/
```

---

# 21. Security Rules

The following must never be committed:

* Real patient data
* Real prescriptions
* Real health records
* Private audio recordings
* Private transcripts
* API keys
* `.env`
* JWT secrets
* Database passwords
* Production credentials
* Raw production database dumps

Development and evaluation should use:

* Synthetic data
* Public datasets
* De-identified data
* Explicitly authorized data

---

# 22. AI Data Privacy Rules

When using an external online provider:

```text
Patient Input
      ↓
Data Minimization
      ↓
Provider Eligibility Check
      ↓
External Provider
```

Only the minimum information required for the operation should be sent.

Sensitive information that does not need to leave the local system must remain local.

The project must document which information is sent to external providers.

---

# 23. Offline Development Testing

Offline mode must be tested deliberately.

Testing scenarios:

### Scenario 1 — Full Internet

```text
Sarvam available
Ollama available
Database available
```

### Scenario 2 — No Internet

```text
Sarvam unavailable
Local LLM available
Local services available
```

### Scenario 3 — Partial Provider Failure

```text
Sarvam unavailable
Ollama available
```

Expected behavior:

```text
Application remains operational
        ↓
Provider failure detected
        ↓
Local alternative attempted
        ↓
If unavailable:
Safe limitation message
```

### Scenario 4 — Backend unavailable

Core locally cached functionality must degrade gracefully.

---

# 24. Preliminary Symptom Checker Environment

The Preliminary Symptom Checker is the primary patient-facing entry point after sign-in.

It must be developed with low digital literacy in mind.

Core design principles:

* Large touch targets
* Minimal typing
* Clear language
* Native-language labels
* Voice input
* Simple symptom selection
* Duration selection
* Severity selection
* Clear progress indicator
* Clear ROUTINE / URGENT / EMERGENCY states
* Emergency guidance visible immediately when required

Processing:

```text
Patient Input
      ↓
Symptom Structuring
      ↓
Deterministic Red-Flag Rules
      ↓
Risk Classification
      ↓
ROUTINE / URGENT / EMERGENCY
```

The LLM must not be the sole triage authority.

---

# 25. Development Startup

## Backend

```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

Expected development API:

```text
http://localhost:8000
```

Health check:

```text
GET /api/v1/health
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Expected development interface:

```text
http://localhost:3000
```

---

## Ollama

Ollama must be running locally when local LLM functionality is being tested.

The application should communicate with Ollama through the AI Gateway rather than directly from feature modules.

---

# 26. Development Ports

Recommended development ports:

| Service    |  Port |
| ---------- | ----: |
| Next.js    |  3000 |
| FastAPI    |  8000 |
| PostgreSQL |  5432 |
| Ollama     | 11434 |

Ports may be changed if required, but the active configuration must be documented.

---

# 27. API-First Development Rule

Before implementing a backend feature:

```text
Requirement
    ↓
Use Case
    ↓
API Contract
    ↓
Schema
    ↓
Database
    ↓
Implementation
    ↓
Tests
```

API specifications must be maintained in the relevant API documentation.

Frontend implementation must not invent backend response structures independently.

---

# 28. AI Development Rule

Before implementing an AI feature:

```text
Requirement
    ↓
Data Requirement
    ↓
Model / Provider Candidates
    ↓
Evaluation Plan
    ↓
Implementation
    ↓
Safety Test
    ↓
Performance Test
```

No model should be selected solely because it is popular or easy to install.

---

# 29. Model Evaluation Environment

Each candidate model must be evaluated using a controlled test set.

Record:

```text
Model
Version
Quantization
Prompt Version
Temperature
Context Length
Embedding Model
Knowledge Base Version
Dataset Version
Hardware
Inference Time
RAM Usage
Output Quality
Safety Result
Language Result
```

For Phase 1 LLM evaluation, compare at minimum:

* English
* Hindi
* Telugu
* Code-mixed prompts
* RAG grounding
* Refusal behavior
* Safety behavior

---

# 30. Git Strategy

Branches:

```text
main
feature/*
fix/*
experiment/*
docs/*
```

Recommended commit format:

```text
feat:
fix:
docs:
test:
refactor:
chore:
experiment:
```

Every significant milestone completion should produce:

1. Code changes
2. Tests
3. Documentation update
4. Git commit

---

# 31. Development Workflow

Every milestone follows:

```text
1. Read specification
        ↓
2. Confirm dependencies/data
        ↓
3. Implement
        ↓
4. Test
        ↓
5. Review
        ↓
6. Update documentation
        ↓
7. Commit
        ↓
8. Move to next milestone
```

A milestone should not be marked complete merely because the code compiles.

---

# 32. Failure Isolation

Failure of one AI provider must not crash unrelated application features.

Example:

```text
Sarvam STT fails
       ↓
Local STT attempted
       ↓
If unavailable
       ↓
Text input remains available
```

Similarly:

```text
OCR unavailable
       ↓
Prescription image remains stored safely
       ↓
User receives clear processing status
       ↓
Other patient features continue working
```

The same principle applies to:

* TTS
* STT
* OCR
* LLM
* RAG
* Synchronization

---

# 33. Testing Strategy

Testing layers:

```text
Unit Tests
    ↓
API Tests
    ↓
Database Tests
    ↓
AI Component Tests
    ↓
Security Tests
    ↓
Offline Tests
    ↓
Integration Tests
    ↓
End-to-End Tests
    ↓
Evaluation
```

Commands:

```bash
pytest
```

Frontend:

```bash
npm run lint
npm run build
```

---

# 34. Offline Test Categories

Offline tests must cover:

* Application loading
* Cached profile
* Cached health information
* Symptom recording
* Deterministic triage
* Medication schedule
* Medication reminders
* Local STT
* Local TTS
* Local OCR
* Local LLM where hardware permits
* Sync queue creation
* Sync retry
* Duplicate operation handling
* Conflict resolution

---

# 35. Security Testing

Security tests must include:

* Authentication bypass
* RBAC violations
* Unauthorized patient access
* Prescription access control
* File upload validation
* API authentication
* Prompt injection
* RAG poisoning
* Sensitive logging
* Sync authorization
* Secret exposure

---

# 36. Milestone Execution Plan

MedGuide AI follows the M1–M18 sequence.

```text
M1  Backend Foundation
 ↓
M2  Database Models + Migrations
 ↓
M3  Authentication + RBAC
 ↓
M4  Consent Management
 ↓
M5  Patient Profile
 ↓
M6  Symptom Records
 ↓
M7  Deterministic Triage
 ↓
M8  AI Gateway
 ↓
M9  RAG
 ↓
M10 AI Health Companion
 ↓
M11 Prescription OCR
 ↓
M12 Medication + Adherence
 ↓
M13 Healthcare Worker Dashboard
 ↓
M14 Speech + Multilingual
 ↓
M15 Offline/PWA + Synchronization
 ↓
M16 Full Integration Testing
 ↓
M17 AI Safety + Performance Evaluation
 ↓
M18 Deployment + Operations
```

---

# 37. Milestone Resource Dependencies

| Milestone | Required Environment / Resources                                    |
| --------- | ------------------------------------------------------------------- |
| M1        | Python, FastAPI, PostgreSQL                                         |
| M2        | PostgreSQL, pgvector, Alembic                                       |
| M3        | JWT, password hashing, test framework                               |
| M4        | Consent schemas + audit logging                                     |
| M5        | Patient data models                                                 |
| M6        | Symptom data/evaluation resources                                   |
| M7        | Validated red-flag rules + evaluation data                          |
| M8        | AI Gateway + provider interfaces                                    |
| M9        | Medical RAG corpus + embedding model                                |
| M10       | Ollama + evaluated LLM + RAG                                        |
| M11       | Prescription OCR datasets + OCR providers                           |
| M12       | Medication/timeline models                                          |
| M13       | Healthcare-worker workflows                                         |
| M14       | EN/HI/TE speech resources + Sarvam credentials + local alternatives |
| M15       | PWA + IndexedDB + local AI alternatives                             |
| M16       | Synthetic patient data + complete test suite                        |
| M17       | Evaluation datasets + benchmark environment                         |
| M18       | Docker + deployment infrastructure                                  |

---

# 38. M14 Speech and Multilingual Development Environment

M14 should evaluate:

```text
                    Speech Input
                         │
              ┌──────────┴──────────┐
              │                     │
         Online Mode            Offline Mode
              │                     │
         Sarvam STT            Local STT
              │                     │
              └──────────┬──────────┘
                         ↓
                    Transcript
                         ↓
                    AI Gateway
                         ↓
                    Ollama LLM
                         ↓
              ┌──────────┴──────────┐
              │                     │
         Online Mode            Offline Mode
              │                     │
         Sarvam TTS             Local TTS
```

Languages:

* English
* Hindi
* Telugu

No language should be declared fully supported until it passes the required evaluation.

---

# 39. M15 Offline Development Environment

M15 must establish the minimum offline-capable stack:

```text
Next.js PWA
     │
IndexedDB
     │
Local Safety Rules
     │
Local Scheduler
     │
Local AI Services
     │
Sync Queue
     │
PostgreSQL Server
```

Offline capability must be tested under simulated connectivity loss rather than assumed from browser caching alone.

---

# 40. M16 Integration Environment

M16 combines:

```text
Frontend
   +
FastAPI
   +
PostgreSQL
   +
pgvector
   +
Ollama
   +
RAG
   +
OCR
   +
STT
   +
TTS
   +
Offline
   +
Sync
```

Required end-to-end workflows include:

### Patient

```text
Register
 ↓
Consent
 ↓
Profile
 ↓
Symptom Check
 ↓
Triage
 ↓
AI Guidance
 ↓
Prescription
 ↓
OCR
 ↓
Verification
 ↓
Medication
 ↓
Timeline
```

### Healthcare Worker

```text
Login
 ↓
Patient List
 ↓
Patient Review
 ↓
Alerts
 ↓
Summary
 ↓
Follow-Up
```

---

# 41. M17 Evaluation Environment

M17 must produce measurable results for:

## LLM

* Language quality
* RAG grounding
* Hallucination rate
* Safety
* Refusal behavior
* Latency
* Memory usage

## RAG

* Recall@K
* Citation correctness
* Groundedness
* Retrieval latency

## Triage

* Sensitivity
* Specificity
* False-negative rate

## OCR

* Character Error Rate
* Word Error Rate
* Medicine extraction accuracy

## Speech

* Word Error Rate
* Language-wise accuracy
* Code-mixed performance
* Latency

## Offline

* Task completion rate
* Sync reliability
* Conflict rate
* Offline feature availability

No result should be entered into documentation before actual measurement.

---

# 42. M18 Deployment Environment

Deployment should use:

* Docker
* Environment-specific configuration
* Secret management
* PostgreSQL backups
* Logging
* Health checks
* Monitoring
* CI/CD
* Versioned releases

Production configuration must remain separate from local development configuration.

---

# 43. Backup and Recovery

Database backups should be generated using PostgreSQL-supported mechanisms such as:

```bash
pg_dump
```

The project must maintain:

* Backup procedure
* Restore procedure
* Knowledge-base reconstruction procedure
* Database migration procedure

At least one restore test should be performed before final evaluation.

---

# 44. Observability

The system should expose basic operational information:

```text
Application Health
API Latency
Error Rate
Database Health
AI Latency
RAG Retrieval
OCR Failures
STT Failures
TTS Failures
Sync Queue
Provider Availability
```

Logs must not unnecessarily expose patient-sensitive information.

---

# 45. Cost and Dependency Policy

The project follows:

```text
Open Source
    ↓
Local Resources
    ↓
College Compute
    ↓
Free External Services
    ↓
Paid Services only if explicitly approved
```

Sarvam usage must therefore be treated as an **optional online provider dependency**, not as the foundation of the entire system.

The system should remain architecturally functional if Sarvam credentials are absent.

---

# 46. Definition of Environment Readiness

The development environment is considered ready when:

* Backend runs locally.
* Frontend runs locally.
* PostgreSQL runs locally.
* pgvector is enabled.
* Alembic migrations work.
* Authentication can be tested.
* Ollama runs successfully.
* At least one candidate local LLM can be evaluated.
* AI Gateway interfaces exist.
* Sarvam adapter can be configured when credentials are available.
* Local STT/OCR/TTS alternatives are identified or under evaluation.
* Test framework works.
* `.env.example` is complete.
* No secrets are committed.
* Dataset/resource tracking exists.
* Offline test environment can be simulated.
* Git workflow is functional.

---

# 47. Environment Completion Rule

The development environment must not be considered complete simply because all software has been installed.

It is complete only when the project can demonstrate:

```text
Frontend
    ↓
FastAPI
    ↓
PostgreSQL
    ↓
AI Gateway
    ↓
Ollama
    ↓
RAG
    ↓
Safety/Triage
```

and, where available:

```text
Sarvam
 ├── STT
 ├── TTS
 └── OCR
```

with appropriate local alternatives for offline operation.

---

# 48. Final Development Principle

MedGuide AI follows a **local-first, provider-agnostic, safety-first architecture**.

The intended relationship between components is:

```text
                  MEDGUIDE AI
                       │
                  APPLICATION
                       │
                   AI GATEWAY
                       │
        ┌──────────────┼──────────────┐
        │              │              │
       LLM           SPEECH          OCR
        │              │              │
     Ollama       Sarvam / Local  Sarvam / Local
        │
   Evaluated Model
        │
        ▼
       RAG
        │
        ▼
 Deterministic Safety
```

The most important architectural rule is:

> **Ollama provides the local LLM runtime; Sarvam provides selected online language/document services; RAG provides grounded knowledge; deterministic rules provide safety-critical decisions; and the AI Gateway keeps all providers replaceable.**

---

# 49. Development Sequence

The project will proceed strictly as:

```text
Read Requirements
       ↓
Confirm Decision Register
       ↓
Confirm Environment
       ↓
Acquire Required Data / Resources
       ↓
Architecture
       ↓
M1
       ↓
M2
       ↓
...
       ↓
M18
```

No milestone should silently introduce a new architectural dependency without updating the relevant documentation.

---

# 50. Final Rule

> **Laptop A is the primary integration and core-development environment.**

> **Ollama is the local LLM runtime, not the entire AI system.**

> **Sarvam is an online provider for selected STT/TTS/OCR and Indian-language capabilities, not the local LLM.**

> **Offline capability requires local alternatives and must be experimentally verified.**

> **Deterministic safety logic remains independent of the LLM and external AI providers.**

> **All AI models, datasets, providers, and external resources must be evaluated and documented before their performance is claimed.**

> **Every milestone must end with implementation, testing, documentation, and traceability updates.**
