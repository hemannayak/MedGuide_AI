# MedGuide AI — Technology Stack

**Project:** MedGuide AI  
**Document:** Technology Stack  
**Version:** 1.0  
**Status:** Baseline — Pre-Implementation  
**Purpose:** Define the technologies, frameworks, libraries, infrastructure and development tools used to implement MedGuide AI.

---

# 1. Purpose

This document defines the approved baseline technology stack for MedGuide AI.

It establishes:

- Frontend technologies
- Backend technologies
- Database technologies
- AI/ML technologies
- RAG infrastructure
- Authentication and authorization
- Offline/PWA technologies
- API technologies
- Testing technologies
- Development tools
- Deployment strategy
- AI model strategy
- Free-resource constraints
- Technology decision status

This document must remain consistent with:

- `AGENTS.md`
- `docs/PROJECT_SPECIFICATION.md`
- `docs/requirements/SRS.md`
- `docs/requirements/USE_CASES.md`
- `docs/requirements/PRE_DEVELOPMENT_DECISIONS.md`
- `docs/requirements/TRACEABILITY_MATRIX.md`
- `docs/architecture/SYSTEM_ARCHITECTURE.md`
- `docs/database/DATABASE_DESIGN.md`
- `docs/database/ERD.md`
- `docs/api/API_SPECIFICATION.md`
- `docs/ai/AI_RAG_ARCHITECTURE.md`
- `docs/ai/MODEL_SELECTION_AND_EVALUATION.md`
- `docs/ai/MODEL_REGISTRY.md`
- `docs/ai/CANDIDATE_RESEARCH_AND_SHORTLIST.md`

---

# 2. Technology Decision Status

Every technology decision uses one of the following states:

| Status | Meaning |
|---|---|
| `CONFIRMED` | Decision is finalized and implementation may proceed |
| `TENTATIVE` | Strong candidate, but final validation/evaluation is pending |
| `TBD` | Decision depends on information or evaluation not yet available |
| `REJECTED` | Explicitly rejected |
| `DEPRECATED` | Previously used but no longer recommended |

A technology marked `TBD` must not be treated as finalized.

---

# 3. Core Technology Principles

MedGuide AI follows these principles:

1. Prefer free and open-source technologies.
2. Avoid unnecessary paid services.
3. Avoid vendor lock-in.
4. Prefer mature and well-supported technologies.
5. Prefer technologies suitable for student development.
6. Prefer technologies that can be reproduced by another developer.
7. Keep AI providers behind an abstraction layer.
8. Keep healthcare data under application-controlled access.
9. Do not expose AI providers directly to the frontend.
10. Do not introduce technologies without a project requirement.
11. Do not introduce microservices unnecessarily.
12. Keep the MVP implementable within the available student resources.
13. Preserve the ability to replace individual AI models.
14. Keep GPU-dependent decisions separate from core application development.

---

# 4. High-Level Technology Stack

```text
                         MEDGUIDE AI
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ↓                ↓                ↓
         FRONTEND          BACKEND            AI
             │                │                │
          Next.js           FastAPI        AI Gateway
          TypeScript        Python             │
          Tailwind          Pydantic           ├── LLM
          PWA               SQLAlchemy         ├── RAG
             │             Alembic             ├── OCR
             │                │                ├── STT
             │                │                └── Triage
             │                │
             └────────────────┼────────────────┘
                              ↓
                         PostgreSQL
                              │
                           pgvector
```

---

# 5. Frontend Stack

## 5.1 Framework

**Technology:** Next.js

**Status:** `CONFIRMED`

Purpose:

* Web application
* Patient interface
* Healthcare-worker interface
* Authentication screens
* Dashboard interfaces
* PWA support
* API integration

---

## 5.2 Programming Language

**Technology:** TypeScript

**Status:** `CONFIRMED`

Reason:

* Static typing
* Better maintainability
* Improved developer tooling
* Suitable for large frontend applications
* Strong Next.js ecosystem

---

## 5.3 UI Styling

**Technology:** Tailwind CSS

**Status:** `CONFIRMED`

Purpose:

* Responsive UI
* Consistent design system
* Rapid component development
* Mobile-first interface

---

## 5.4 Frontend Architecture

The frontend should use:

```text
Next.js
├── App Router
├── TypeScript
├── Reusable Components
├── Feature-based organization
├── API Client Layer
├── Authentication State
├── Offline Storage
└── PWA Layer
```

---

# 6. PWA Stack

## 6.1 Progressive Web Application

**Technology:** PWA

**Status:** `CONFIRMED`

Purpose:

* Installable web application
* Mobile-friendly access
* Offline functionality
* Cached application resources
* Connectivity-aware behavior

---

## 6.2 Service Worker

**Technology:** Service Worker

**Status:** `CONFIRMED`

Responsibilities:

* Cache application resources
* Support offline application loading
* Manage appropriate background operations
* Support PWA behavior

The service worker must not bypass application security controls.

---

## 6.3 Client-Side Offline Storage

**Technology:** IndexedDB

**Status:** `CONFIRMED`

Purpose:

* Offline patient-side data
* Pending actions
* Sync queue
* Temporary application state

Sensitive data stored locally must be minimized and protected appropriately.

---

# 7. Backend Stack

## 7.1 Programming Language

**Technology:** Python

**Status:** `CONFIRMED`

Reason:

* Strong AI/ML ecosystem
* Strong healthcare-data processing ecosystem
* FastAPI compatibility
* PostgreSQL support
* Easy integration with Python AI libraries

---

## 7.2 Backend Framework

**Technology:** FastAPI

**Status:** `CONFIRMED`

Responsibilities:

* REST API
* Authentication endpoints
* Patient endpoints
* Healthcare-worker endpoints
* AI Gateway
* RAG endpoints
* OCR endpoints
* Speech endpoints
* Synchronization endpoints

---

## 7.3 API Validation

**Technology:** Pydantic

**Status:** `CONFIRMED`

Purpose:

* Request validation
* Response validation
* Configuration validation
* Structured AI output validation

---

# 8. Database Stack

## 8.1 Relational Database

**Technology:** PostgreSQL

**Status:** `CONFIRMED`

PostgreSQL will store:

* Users
* Patients
* Healthcare workers
* Consents
* Symptoms
* Prescriptions
* Medications
* Medication schedules
* Medication adherence
* Health timelines
* Knowledge documents
* Knowledge chunks
* Audit records

---

## 8.2 Vector Extension

**Technology:** pgvector

**Status:** `CONFIRMED`

Purpose:

* Store embeddings
* Perform vector similarity search
* Support RAG retrieval

The initial architecture will use PostgreSQL + pgvector rather than introducing a separate vector database.

---

# 9. ORM

**Technology:** SQLAlchemy

**Status:** `CONFIRMED`

Purpose:

* Database abstraction
* ORM models
* Relationships
* Query construction
* Transaction management

---

# 10. Database Migration

**Technology:** Alembic

**Status:** `CONFIRMED`

Purpose:

* Schema versioning
* Database migrations
* Reproducible database setup
* Controlled schema evolution

Database changes must be implemented through migrations rather than manually modifying production schemas.

---

# 11. Authentication

## 11.1 Authentication Method

**Technology:** JWT-based authentication

**Status:** `CONFIRMED`

Purpose:

* User authentication
* Session/API authorization
* Protected API access

JWT implementation must follow the security requirements defined in the SRS.

---

# 12. Authorization

## 12.1 Role-Based Access Control

**Technology:** Application-level RBAC

**Status:** `CONFIRMED`

Initial roles:

```text
PATIENT
HEALTHCARE_WORKER
ADMIN
```

Authorization must be enforced by the backend.

The frontend must never be considered the security boundary.

---

# 13. Password Security

Passwords must never be stored in plaintext.

Use a modern password hashing mechanism supported by the backend security stack.

Exact library/configuration:

**TBD — Security Implementation Phase**

---

# 14. Consent Management

Consent will be implemented as an application/domain feature rather than delegated to an AI model.

Responsibilities include:

* Recording consent
* Consent status
* Consent scope
* Consent timestamps
* Revocation where applicable
* Auditability

AI must never control consent decisions.

---

# 15. AI Stack

The AI subsystem consists of:

```text
AI Gateway
│
├── LLM
├── RAG
│   ├── Embedding Model
│   ├── Knowledge Base
│   └── pgvector
│
├── OCR
├── Speech-to-Text
├── Symptom Extraction
├── Triage Engine
└── Optional Translation
```

---

# 16. AI Gateway

**Technology:** Custom FastAPI AI Gateway module

**Status:** `CONFIRMED`

Purpose:

* Centralize AI requests
* Hide provider implementations
* Validate requests
* Select models
* Construct prompts
* Retrieve RAG context
* Apply safety checks
* Handle failures
* Record AI metadata

Frontend applications must communicate with the AI Gateway through backend APIs.

---

# 17. LLM

**Status:** `TENTATIVE — EVALUATION REQUIRED`

Candidate models currently include:

* Llama-family instruction models
* Gemma-family instruction models
* Qwen-family instruction models

The final model will be selected through the process defined in:

`docs/ai/MODEL_SELECTION_AND_EVALUATION.md`

The exact model/version must not be hardcoded into the architecture until evaluation is complete.

---

# 18. LLM Deployment Strategy

The system should support:

```text
Local inference
        OR
Hosted inference
        OR
Hybrid inference
```

The final approach is:

**TBD — Model + Infrastructure Evaluation**

The application must remain independent of a specific provider.

---

# 19. Embedding Model

**Status:** `TENTATIVE — EVALUATION REQUIRED`

Current candidates include:

* `all-MiniLM-L6-v2`
* `paraphrase-multilingual-MiniLM-L12-v2`

Important:

`all-MiniLM-L6-v2` is treated as an English baseline.

Because the MVP targets:

```text
English
Telugu
Hindi
```

a multilingual embedding model must be evaluated before production selection.

---

# 20. RAG

**Status:** `CONFIRMED`

RAG is a core component of MedGuide AI.

Architecture:

```text
User Query
    ↓
Query Embedding
    ↓
pgvector Search
    ↓
Relevant Knowledge Chunks
    ↓
Context Filtering
    ↓
Prompt Construction
    ↓
LLM
    ↓
Grounded Response
```

---

# 21. RAG Knowledge Base

The knowledge base will contain approved medical information.

Preferred sources include:

* WHO guidance
* Government health authorities
* Official public-health documents
* Approved medical guidance
* Other verified sources where appropriate

Random internet content must not automatically become trusted medical knowledge.

---

# 22. RAG Chunking

Initial baseline:

```text
Chunk size: 500 tokens
Overlap: 50 tokens
```

**Status:** `TENTATIVE`

These values must be validated through retrieval experiments.

---

# 23. RAG Similarity Threshold

Initial baseline:

```text
Similarity threshold: 0.70
```

**Status:** `TENTATIVE`

The final threshold must be determined using the retrieval evaluation dataset.

It must not be treated as a universally valid medical threshold.

---

# 24. OCR

**Status:** `TENTATIVE — EVALUATION REQUIRED`

Candidate technologies:

* PaddleOCR
* Tesseract OCR

Primary purpose:

```text
Prescription Image
        ↓
OCR
        ↓
Text
        ↓
Medicine / dosage extraction
        ↓
Verification
```

OCR output must not automatically be treated as verified prescription information.

---

# 25. Speech-to-Text

**Status:** `TENTATIVE — EVALUATION REQUIRED`

Candidate:

* Whisper-family models

Purpose:

```text
Voice
 ↓
Speech-to-Text
 ↓
Transcript
 ↓
NLP / AI Pipeline
```

Required languages and code-mixed performance must be evaluated.

---

# 26. Symptom Extraction

**Status:** `TENTATIVE — EVALUATION REQUIRED`

Candidate approaches:

```text
LLM structured extraction
Rules + NLP
NER model
Hybrid approach
```

The selected approach must produce structured symptom information.

It must not independently diagnose the patient.

---

# 27. Triage

**Status:** `CONFIRMED — RULE-BASED BASELINE`

Initial implementation:

```text
Structured Symptoms
        ↓
Validated Safety Rules
        ↓
Risk Classification
        ↓
Escalation
```

The LLM must not independently control emergency decisions.

Medical rules must be based on appropriate authoritative guidance and reviewed before production use.

---

# 28. Translation

**Status:** `TENTATIVE — EVALUATION REQUIRED`

The project will evaluate:

```text
Direct multilingual LLM
        vs
Translation → AI → Translation
```

The final approach depends on:

* Accuracy
* Medical terminology
* Telugu performance
* Hindi performance
* Latency
* Resource requirements

---

# 29. Notifications

The application requires:

* Medication reminders
* Important alerts
* Healthcare-worker notifications
* Relevant follow-up notifications

Technology:

**PWA notification mechanisms**

**Status:** `CONFIRMED`

External SMS/WhatsApp services are not part of the required core MVP unless later approved.

---

# 30. Offline Architecture

The application follows an offline-first approach for appropriate functionality.

```text
Frontend
   ↓
Service Worker
   ↓
IndexedDB
   ↓
Local Pending Queue
   ↓
Connectivity Restored
   ↓
Backend Sync API
```

---

# 31. Synchronization

**Technology:** Custom synchronization mechanism

**Status:** `CONFIRMED`

The backend API uses idempotency mechanisms for safe synchronization.

Core principles:

* Idempotent operations
* Conflict detection
* Retry support
* Server validation
* Auditability

---

# 32. API Architecture

The system uses REST APIs.

Base path:

```text
/api/v1/
```

The API contract is defined in:

`docs/api/API_SPECIFICATION.md`

The implementation must not introduce undocumented production endpoints without updating the API specification.

---

# 33. API Documentation

FastAPI's generated OpenAPI documentation will be used during development.

The API contract remains controlled by:

`API_SPECIFICATION.md`

Generated documentation must not replace the manually maintained API specification.

---

# 34. Testing Stack

## Backend

**PyTest**

Status: `CONFIRMED`

Used for:

* Unit tests
* API tests
* Safety-rule tests
* Database tests
* AI gateway tests
* Synchronization tests

---

## Frontend

Use the selected JavaScript/TypeScript testing framework appropriate for the Next.js stack.

Exact framework:

**TBD — Implementation Phase**

---

# 35. AI Evaluation

AI evaluation will use separate controlled datasets.

Evaluation areas:

```text
LLM
RAG
OCR
Speech
Multilingual
Symptom Extraction
Triage
```

Metrics are defined in:

`docs/ai/MODEL_SELECTION_AND_EVALUATION.md`

---

# 36. Development Environment

## Primary Development Machine

```text
CPU:
Intel Core Ultra 7 255U

RAM:
16 GB

Graphics:
Intel Integrated Graphics

Storage:
512 GB-class SSD

OS:
Windows 11 64-bit
```

This machine is the primary development environment.

---

# 37. Institutional GPU

The project may use college GPU infrastructure for:

* Model experimentation
* Benchmarking
* Fine-tuning where justified
* Large-model inference
* AI research experiments
* Model optimization

Current status:

```text
GPU:
TBD

VRAM:
TBD

System RAM:
TBD

OS:
TBD
```

The absence of this information does not block application development.

GPU-dependent model decisions remain open until specifications are verified.

---

# 38. External Compute

Google Colab or other genuinely free compute resources may be used for:

* AI experiments
* Model benchmarking
* Training/fine-tuning where feasible
* Evaluation

Availability and resource limits must be verified at the time of use.

The application must not depend on temporary free compute availability for normal operation.

---

# 39. Local AI Resource Policy

The project should prioritize:

* CPU-compatible models
* Efficient models
* Quantized models where appropriate
* Small models for edge/offline scenarios

Large models may be evaluated using institutional or external GPU resources.

---

# 40. Deployment Architecture

The final deployment architecture is:

```text
                    USERS
                      │
                      ↓
                Web / PWA
                      │
                      ↓
                Backend API
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
      PostgreSQL     RAG       AI Gateway
          │           │           │
          │        pgvector       ↓
          │                   AI Models
          │
          └───────────┬───────────┘
                      ↓
                 Application
```

Exact hosting providers remain:

**TBD — Deployment Phase**

---

# 41. Frontend Deployment

The frontend should use a free hosting platform where suitable.

Candidate:

```text
Vercel
```

Status:

`TENTATIVE`

The final decision depends on:

* PWA requirements
* Build limits
* Environment variables
* API architecture
* Free-tier suitability

---

# 42. Backend Deployment

The backend should use a free/low-cost hosting option suitable for FastAPI.

Status:

`TBD`

The final provider must be selected after evaluating:

* Free-tier limits
* Sleep behavior
* RAM
* CPU
* Request limits
* Deployment reliability
* Database connectivity

---

# 43. Database Deployment

PostgreSQL must support:

* Relational data
* pgvector
* Required storage
* Backup/export capability
* Secure connection

Status:

`TBD — Deployment Phase`

Local PostgreSQL remains the development baseline.

---

# 44. Containerization

Docker may be used where it simplifies:

* Local setup
* PostgreSQL
* Backend deployment
* Reproducibility

Status:

`TENTATIVE`

Docker must not be introduced merely for architectural complexity.

---

# 45. Version Control

**Technology:** Git

**Status:** `CONFIRMED`

Repository:

**GitHub**

**Status:** `CONFIRMED`

All production source code and project documentation should be version-controlled.

---

# 46. Branching Strategy

The project should use a simple branching model suitable for a student project:

```text
main
  │
  ├── feature/*
  ├── fix/*
  └── experiment/*
```

AI experiments should not directly destabilize the production branch.

---

# 47. Environment Configuration

Environment-specific values must be stored outside source code.

Examples:

```text
DATABASE_URL
JWT_SECRET
AI_PROVIDER_KEY
AI_MODEL
VECTOR_DATABASE_URL
```

Secrets must never be committed to Git.

---

# 48. `.env` Policy

Use:

```text
.env
.env.local
```

where appropriate.

Provide:

```text
.env.example
```

containing variable names but no real secrets.

---

# 49. Logging

The backend should implement structured application logging.

Logs may include:

* Request ID
* Endpoint
* Status
* Execution time
* Error category

Sensitive health information must not be unnecessarily written to logs.

---

# 50. Audit Logging

Healthcare-sensitive actions must be auditable.

Examples:

```text
Authentication
Consent changes
Patient record access
Healthcare-worker access
Prescription verification
AI-related critical events
Administrative changes
```

Audit architecture is defined in the database specification.

---

# 51. Security Stack

Security must include:

```text
HTTPS
JWT authentication
RBAC
Password hashing
Input validation
CORS configuration
Rate limiting
Secure headers
Database access control
Audit logging
Secret management
```

Exact implementation libraries may be finalized during backend development.

---

# 52. Privacy Principle

The system follows:

> **Collect the minimum information required to provide the requested functionality.**

AI models must not receive unnecessary patient information.

---

# 53. AI Provider Abstraction

The AI layer must support provider replacement.

Conceptually:

```text
AI Gateway
    │
    ├── Provider A
    ├── Provider B
    └── Local Model
```

The rest of the application should not depend directly on a specific provider.

---

# 54. Cost Strategy

Target development cost:

```text
₹0
```

The project should prioritize:

* Open-source software
* Free APIs where appropriate
* Local development
* College infrastructure
* Free compute
* Free database tiers
* Free deployment tiers

Free-tier limitations must always be verified before relying on them.

---

# 55. Technology Introduction Rule

A new technology may be added only when:

1. A documented requirement needs it.
2. Existing technologies cannot reasonably satisfy the requirement.
3. The addition does not violate project constraints.
4. The architectural impact is understood.
5. Documentation is updated.

---

# 56. Technology Replacement Rule

A confirmed technology should not be replaced casually.

Replacement requires:

```text
Problem Identified
        ↓
Alternative Evaluated
        ↓
Impact Analysis
        ↓
Decision
        ↓
Architecture Update
        ↓
Implementation
```

Major replacements require an ADR.

---

# 57. Current Technology Decision Matrix

| Area                  | Technology                     | Status      |
| --------------------- | ------------------------------ | ----------- |
| Frontend              | Next.js                        | `CONFIRMED` |
| Frontend Language     | TypeScript                     | `CONFIRMED` |
| Styling               | Tailwind CSS                   | `CONFIRMED` |
| Web App               | PWA                            | `CONFIRMED` |
| Offline Storage       | IndexedDB                      | `CONFIRMED` |
| Backend               | Python + FastAPI               | `CONFIRMED` |
| Validation            | Pydantic                       | `CONFIRMED` |
| ORM                   | SQLAlchemy                     | `CONFIRMED` |
| Migrations            | Alembic                        | `CONFIRMED` |
| Database              | PostgreSQL                     | `CONFIRMED` |
| Vector Search         | pgvector                       | `CONFIRMED` |
| Authentication        | JWT                            | `CONFIRMED` |
| Authorization         | RBAC                           | `CONFIRMED` |
| API                   | REST                           | `CONFIRMED` |
| AI Gateway            | FastAPI module                 | `CONFIRMED` |
| RAG                   | Required                       | `CONFIRMED` |
| LLM                   | Candidate evaluation           | `TENTATIVE` |
| Embeddings            | Candidate evaluation           | `TENTATIVE` |
| OCR                   | PaddleOCR/Tesseract evaluation | `TENTATIVE` |
| STT                   | Whisper-family evaluation      | `TENTATIVE` |
| Symptom Extraction    | Evaluation                     | `TENTATIVE` |
| Triage                | Deterministic rules            | `CONFIRMED` |
| Translation           | Evaluation                     | `TENTATIVE` |
| Reranker              | Not initially required         | `TENTATIVE` |
| Backend Testing       | PyTest                         | `CONFIRMED` |
| Version Control       | Git                            | `CONFIRMED` |
| Repository            | GitHub                         | `CONFIRMED` |
| Containerization      | Docker                         | `TENTATIVE` |
| Frontend Hosting      | TBD                            | `TBD`       |
| Backend Hosting       | TBD                            | `TBD`       |
| Database Hosting      | TBD                            | `TBD`       |
| Production AI Hosting | TBD                            | `TBD`       |
| College GPU           | TBD                            | `TBD`       |

---

# 58. Technology Freeze Boundary

The following are considered stable enough to begin implementation:

```text
Next.js
TypeScript
Tailwind CSS
PWA
IndexedDB
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL
pgvector
JWT
RBAC
REST API
Git/GitHub
PyTest
AI Gateway architecture
RAG architecture
Rule-based triage baseline
```

The following remain intentionally open:

```text
Final LLM
Final embedding model
Final OCR engine
Final STT model
Final translation method
Fine-tuning strategy
GPU-specific AI strategy
Production AI hosting
Production backend hosting
Production database hosting
```

---

# 59. Implementation Rule

Development may begin using the confirmed stack.

Development must not require the unresolved AI decisions to be finalized.

For example:

```text
Backend
    ↓
AI Gateway Interface
    ↓
LLM Provider Interface
    ↓
Mock / Test Provider
```

This allows backend development to continue while AI model evaluation is underway.

---

# 60. AI Interface Abstraction

The backend should define interfaces/abstractions conceptually similar to:

```text
LLMProvider
EmbeddingProvider
OCRProvider
SpeechProvider
```

The implementation can then replace:

```text
Mock Provider
      ↓
Experimental Model
      ↓
Approved Model
```

without rewriting the entire application.

---

# 61. Development Sequence

The technology stack supports the following implementation order:

```text
Repository
    ↓
Backend Foundation
    ↓
Database
    ↓
Migrations
    ↓
Authentication
    ↓
RBAC
    ↓
Consent
    ↓
Patient Module
    ↓
Healthcare Worker Module
    ↓
Symptom Module
    ↓
Triage Rules
    ↓
AI Gateway
    ↓
RAG
    ↓
LLM Integration
    ↓
OCR
    ↓
Medication
    ↓
Speech
    ↓
Offline/PWA
    ↓
Synchronization
    ↓
Testing
    ↓
Evaluation
    ↓
Deployment
```

---

# 62. GPU Update Procedure

When the college GPU information becomes available:

```text
GPU Specification
        ↓
Update this document
        ↓
Review LLM candidates
        ↓
Review local inference
        ↓
Review fine-tuning feasibility
        ↓
Update MODEL_REGISTRY.md
        ↓
Create/update ADR if required
```

No other architecture should be changed unless the GPU information reveals a genuine requirement.

---

# 63. Final Technology Principle

The MedGuide AI technology stack follows:

```text
REQUIREMENT
    ↓
ARCHITECTURE
    ↓
TECHNOLOGY
    ↓
IMPLEMENTATION
    ↓
TESTING
    ↓
EVALUATION
    ↓
VALIDATION
```

Not:

```text
POPULAR TECHNOLOGY
    ↓
FIND A USE FOR IT
```

---

# 64. Golden Rules

1. Do not introduce technologies without a requirement.
2. Do not hardcode an unapproved AI model.
3. Do not assume free-tier availability.
4. Do not assume GPU availability.
5. Do not expose AI providers directly to the frontend.
6. Do not give the LLM unrestricted database access.
7. Do not use AI for deterministic application logic unnecessarily.
8. Do not use an LLM as the sole triage mechanism.
9. Do not treat OCR output as verified prescription information.
10. Do not store secrets in source control.
11. Do not store unnecessary patient information.
12. Do not introduce microservices unless justified.
13. Do not replace confirmed technologies without documented evaluation.
14. Keep AI models replaceable through provider abstractions.
15. Keep experimental AI code separate from production functionality.
16. Keep the project within the free-resource constraint wherever technically feasible.
17. Update architecture documentation when implementation decisions change.
18. Never claim a model is accurate or safe without evaluation evidence.
19. Never fabricate benchmarks, licenses, capabilities, or resource requirements.
20. The college GPU specification will be incorporated when available and must not be guessed.

---

# 65. Final Baseline

The implementation baseline is:

```text
FRONTEND
Next.js + TypeScript + Tailwind + PWA + IndexedDB

BACKEND
Python + FastAPI + Pydantic

DATABASE
PostgreSQL + pgvector

ORM
SQLAlchemy

MIGRATIONS
Alembic

AUTH
JWT + RBAC

AI
AI Gateway
    ├── LLM              → TBD
    ├── Embeddings       → TBD
    ├── RAG              → pgvector
    ├── OCR              → TBD
    ├── Speech           → TBD
    ├── Symptom Extract  → TBD
    └── Triage           → Rules

TESTING
PyTest + frontend testing framework TBD

VERSION CONTROL
Git + GitHub

COMPUTE
Developer Laptop
+
College GPU when available
+
Free external compute when necessary

DEPLOYMENT
Free/sustainable infrastructure → TBD
```

---

# 66. Technology Stack Completion Criteria

This document is considered complete for the pre-implementation phase when:

* Core frontend stack is confirmed.
* Core backend stack is confirmed.
* Database stack is confirmed.
* Authentication architecture is confirmed.
* Offline architecture is confirmed.
* AI Gateway is confirmed.
* RAG architecture is confirmed.
* Triage baseline is confirmed.
* AI model candidates are documented.
* Unresolved AI decisions are explicitly marked.
* GPU-dependent decisions are explicitly marked.
* Deployment decisions that require further evaluation are marked.
* Free-resource constraints are documented.
* Technology introduction/replacement rules are documented.
* Implementation sequence is documented.
