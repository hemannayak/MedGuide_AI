# MedGuide AI — Technology Stack Specification

**Document:** `docs/architecture/TECHNOLOGY_STACK.md`  
**Version:** 2.0  
**Status:** **Development Baseline — Approved**  
**Last Updated:** August 2026

---

## 1. Purpose

This document defines the technology stack for MedGuide AI and establishes the boundaries between:

* Frontend application
* Backend services
* Database and vector retrieval
* Local AI inference
* Online AI services
* Offline/local fallbacks
* Deterministic healthcare safety logic
* Development, testing, and deployment infrastructure

The stack follows these principles:

1. **Open-source first**
2. **₹0-cost development wherever practically possible**
3. **Local-first for core AI reasoning where feasible**
4. **Online services only where they provide a meaningful capability advantage**
5. **Provider-agnostic AI Gateway**
6. **No direct frontend dependency on AI providers**
7. **Deterministic safety logic must remain independent of the LLM**
8. **Offline functionality must remain useful even when AI/cloud services are unavailable**
9. **EN + HI + TE are the Phase 1 languages**
10. **Models are selected through evaluation rather than assumption**

---

# 2. Technology Architecture Overview

```text
                         MEDGUIDE AI
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
        FRONTEND          BACKEND          AI GATEWAY
             │                │                │
      Next.js / TS        FastAPI        ┌─────┼──────────────┐
      Tailwind / PWA      Python         │     │              │
      IndexedDB           SQLAlchemy     ▼     ▼              ▼
      Service Worker      Alembic      LLM   RAG        Speech / OCR
             │                │          │     │              │
             │                │          ▼     ▼              ▼
             │                │       Ollama pgvector      Providers
             │                │          │                    │
             │                │          │             ┌──────┴──────┐
             │                │          │             │             │
             │                │          │          Sarvam AI      Local
             │                │          │          (Online)      Fallback
             │                │          │
             └────────────────┼──────────┘
                              │
                              ▼
                    PostgreSQL + pgvector
```

---

# 3. Core Technology Stack

| Layer             | Technology                              | Status        | Purpose                                      |
| ----------------- | --------------------------------------- | ------------- | -------------------------------------------- |
| Frontend          | Next.js                                 | **CONFIRMED** | Web application                              |
| Frontend Language | TypeScript                              | **CONFIRMED** | Type-safe frontend development               |
| UI                | Tailwind CSS                            | **CONFIRMED** | Design system and responsive styling         |
| PWA               | Service Worker                          | **CONFIRMED** | Offline caching and application availability |
| Offline Storage   | IndexedDB                               | **CONFIRMED** | Local data/cache and synchronization queue   |
| Backend           | Python 3.12.x                           | **CONFIRMED** | Backend and AI orchestration                 |
| API Framework     | FastAPI                                 | **CONFIRMED** | REST API                                     |
| Validation        | Pydantic                                | **CONFIRMED** | Request/response validation                  |
| ORM               | SQLAlchemy                              | **CONFIRMED** | Database access                              |
| Migrations        | Alembic                                 | **CONFIRMED** | Database schema migrations                   |
| Database          | PostgreSQL                              | **CONFIRMED** | Primary relational database                  |
| Vector Database   | pgvector                                | **CONFIRMED** | Medical knowledge retrieval                  |
| Authentication    | JWT                                     | **CONFIRMED** | Authentication                               |
| Authorization     | Server-side RBAC                        | **CONFIRMED** | Role isolation                               |
| AI Gateway        | Custom abstraction layer                | **CONFIRMED** | Provider/model independence                  |
| Local LLM Runtime | Ollama                                  | **CONFIRMED** | Local LLM execution                          |
| LLM Model         | Evaluated open-source model             | **TENTATIVE** | Medical response generation                  |
| RAG               | pgvector + embeddings                   | **CONFIRMED** | Evidence retrieval                           |
| Embeddings        | Sentence Transformers / evaluated model | **TENTATIVE** | Vector representations                       |
| STT               | Sarvam AI + evaluated local fallback    | **TENTATIVE** | Speech-to-text                               |
| TTS               | Sarvam AI + evaluated local fallback    | **TENTATIVE** | Indian-language speech synthesis             |
| OCR               | Sarvam AI + evaluated local fallback    | **TENTATIVE** | Prescription text extraction                 |
| Triage            | Deterministic rules engine              | **CONFIRMED** | Safety-critical risk classification          |
| Testing           | Pytest                                  | **CONFIRMED** | Backend/AI testing                           |
| Frontend Testing  | Existing Next.js testing stack          | **TENTATIVE** | UI validation                                |
| Version Control   | Git + GitHub                            | **CONFIRMED** | Source control                               |
| Containers        | Docker                                  | **CONFIRMED** | Reproducible deployment                      |
| CI                | GitHub Actions                          | **CONFIRMED** | Automated verification                       |

---

# 4. Frontend Technology

## 4.1 Next.js

**Status:** CONFIRMED

Next.js is used for the patient-facing and healthcare-worker-facing web application.

Primary responsibilities:

* Public website
* Authentication UI
* Patient application
* Healthcare-worker dashboard
* Admin interfaces
* PWA functionality
* Responsive/mobile-first experience
* API client integration

The frontend must communicate with backend APIs rather than directly accessing:

* PostgreSQL
* pgvector
* Ollama
* Sarvam AI
* Internal AI services

---

## 4.2 TypeScript

**Status:** CONFIRMED

TypeScript provides:

* Typed API contracts
* Typed application state
* Safer component development
* Consistent frontend/backend response handling
* Reduced runtime errors

---

## 4.3 Tailwind CSS

**Status:** CONFIRMED

Tailwind is used for the MedGuide design system.

The design system prioritizes:

* High readability
* Large touch targets
* Responsive layouts
* High contrast
* Minimal cognitive load
* English/Hindi/Telugu typography
* Mobile-first interaction

Premium visual components may use open-source component primitives, but they must remain consistent with the MedGuide design system rather than becoming unrelated visual modules.

---

# 5. Progressive Web App & Offline Stack

## 5.1 PWA

**Status:** CONFIRMED

MedGuide AI will use PWA capabilities to support low-connectivity environments.

The PWA layer is responsible for:

* Application shell caching
* Offline UI availability
* Cached resources
* Offline indicators
* Deferred synchronization
* Installability

---

## 5.2 IndexedDB

**Status:** CONFIRMED

IndexedDB provides client-side storage for information that must remain available during connectivity interruptions.

Potential offline data:

* Medication schedules
* Reminder information
* Cached health guidance
* Recent timeline information
* Pending symptom records
* Pending adherence events
* Synchronization queue

Sensitive information stored locally must follow the project's security and privacy requirements.

---

# 6. Backend Technology

## 6.1 Python

**Status:** CONFIRMED

Python 3.12.x is the primary backend and AI-development language.

It is used for:

* FastAPI
* AI Gateway
* RAG
* Embeddings
* OCR orchestration
* Speech orchestration
* Symptom extraction
* Triage
* Evaluation
* Data processing

---

## 6.2 FastAPI

**Status:** CONFIRMED

FastAPI provides the `/api/v1` backend interface.

Responsibilities include:

* Authentication
* Patient profiles
* Consent
* Symptoms
* Triage
* AI chat
* Speech
* OCR
* Medications
* Timeline
* Healthcare-worker workflows
* Synchronization
* Administrative operations

---

## 6.3 SQLAlchemy + Alembic

**Status:** CONFIRMED

SQLAlchemy provides database access.

Alembic provides controlled schema evolution.

**Rule:**

> Database schema changes must be implemented through migrations rather than uncontrolled manual production schema modifications.

---

# 7. PostgreSQL & pgvector

## 7.1 PostgreSQL

**Status:** CONFIRMED

PostgreSQL is the primary application database.

It stores structured entities such as:

* Users
* Patient profiles
* Consent
* Symptoms
* Triage results
* Conversations/health extracts
* Prescriptions
* Medications
* Medication schedules
* Adherence events
* Health timeline
* Alerts
* Follow-ups
* Healthcare-worker relationships
* Audit events

---

## 7.2 pgvector

**Status:** CONFIRMED

`pgvector` provides vector similarity search for the medical knowledge base.

It stores:

```text
Knowledge Document
      ↓
Knowledge Chunk
      ↓
Embedding
      ↓
pgvector
```

During a user query:

```text
User Question
     ↓
Query Embedding
     ↓
pgvector Similarity Search
     ↓
Relevant Evidence
     ↓
Evidence Sufficiency Gate
     ↓
LLM
```

---

# 8. AI Gateway

**Status:** CONFIRMED

The **AI Gateway is one of the most important architectural boundaries in MedGuide AI.**

Application code must not directly depend on Ollama, Sarvam, or any individual model/provider.

Instead:

```text
Frontend
   ↓
FastAPI
   ↓
AI Gateway
   ├── LLM Provider
   ├── Embedding Provider
   ├── STT Provider
   ├── TTS Provider
   └── OCR Provider
```

This allows providers and models to be replaced without rewriting the application.

---

# 9. Ollama — Local LLM Runtime

**Status:** CONFIRMED

Ollama is used specifically as the **local runtime for LLM inference**.

It is **not**:

* The medical knowledge base
* The RAG system
* The triage engine
* The speech system
* The OCR system
* The source of medical truth

Its role is:

```text
Retrieved Medical Evidence
          +
Structured Patient Context
          ↓
       Ollama
          ↓
  Local LLM Inference
          ↓
Natural-language response
```

The exact LLM model remains subject to benchmarking.

Candidate models may include:

* Qwen family
* Gemma family
* Sarvam/open Indic models where technically appropriate
* Other open-source models identified during evaluation

The final model must be selected using measurable evaluation rather than model reputation alone.

---

# 10. Why the LLM Is Separate from Triage

The LLM must **not** be the final authority for emergency classification.

Architecture:

```text
Patient Symptoms
      │
      ├───────────────► Deterministic Triage Engine
      │                         │
      │                         ▼
      │                  Risk Classification
      │
      └───────────────► AI Gateway → LLM
                                │
                                ▼
                         Explanation / Guidance
```

The deterministic safety engine controls:

* Red-flag detection
* Emergency classification
* Escalation recommendation
* Safety-critical thresholds

The LLM is responsible for:

* Explanation
* Conversational interaction
* Simplification
* Summarization
* Multilingual response generation

---

# 11. Sarvam AI Integration

**Status:** ONLINE PROVIDER — EVALUATION / INTEGRATION

Sarvam AI is **not being used as the primary MedGuide LLM runtime**.

Its role is primarily Indian-language and multimodal services where its capabilities provide practical value.

### Planned Service Boundary

| Capability    | Primary Online Candidate | Local/Offline Fallback                        |
| ------------- | ------------------------ | --------------------------------------------- |
| STT           | **Sarvam AI**            | Evaluated open-source speech model            |
| TTS           | **Sarvam AI**            | Evaluated local TTS                           |
| OCR           | **Sarvam AI**            | PaddleOCR / Tesseract / evaluated alternative |
| LLM reasoning | **Ollama/local model**   | Another local model if required               |

Therefore:

```text
                 AI GATEWAY
                     │
        ┌────────────┼─────────────┐
        │            │             │
        ▼            ▼             ▼
      LLM           Speech         OCR
        │            │             │
     Ollama       Sarvam AI      Sarvam AI
        │            │             │
        │       ┌────┴────┐         │
        │       │         │         │
        │      STT        TTS       │
        │                             
        └──── Local fallback ─────────┘
```

When connectivity is unavailable, the system should use evaluated local alternatives where feasible.

---

# 12. Speech-to-Text

**Status:** TENTATIVE / EVALUATION

Phase 1 languages:

* English
* Hindi
* Telugu

The architecture supports:

```text
User Voice
    ↓
AI Gateway
    ↓
Online?
 ┌──┴──────┐
Yes        No
 │          │
 ▼          ▼
Sarvam    Local STT
 │          │
 └────┬─────┘
      ▼
Transcript
      ↓
Language Detection / Validation
      ↓
Symptom Processing / LLM
```

Evaluation must include:

* Word Error Rate
* Language-wise performance
* Medical vocabulary accuracy
* Code-mixed speech
* Rural/accent variation where suitable data is available
* Latency
* Offline feasibility

---

# 13. Text-to-Speech

**Status:** TENTATIVE / EVALUATION

Sarvam AI is the preferred online candidate for Indian-language TTS because natural spoken output is particularly important for users with lower literacy or limited comfort with text interfaces.

Target languages:

* English
* Hindi
* Telugu

Architecture:

```text
Generated Response
       ↓
AI Gateway
       ↓
Sarvam TTS / Local TTS
       ↓
Audio
       ↓
Patient
```

Evaluation should consider:

* Pronunciation
* Naturalness
* Medical terminology
* Language quality
* Intelligibility
* Latency
* Audio size
* Offline alternative availability

---

# 14. Prescription OCR

**Status:** TENTATIVE / EVALUATION

The OCR subsystem processes prescription images.

Architecture:

```text
Prescription Image
       ↓
Validation
       ↓
Image Preprocessing
       ↓
OCR Provider
 ┌─────┴──────────┐
 ▼                ▼
Sarvam           Local OCR
                  │
       PaddleOCR / Tesseract
       / evaluated model
 └───────┬────────┘
         ▼
Extracted Text
         ↓
Medicine Information Extraction
         ↓
Confidence Assessment
         ↓
Patient Verification
         ↓
Medication Schedule
```

OCR must **never silently convert uncertain extraction into an active medication schedule**.

---

# 15. Embedding & RAG Technology

**Status:** CONFIRMED ARCHITECTURE / MODEL TENTATIVE

The RAG subsystem uses:

* Approved medical documents
* Chunking
* Embeddings
* PostgreSQL
* pgvector
* Similarity retrieval
* Evidence sufficiency gate
* LLM generation

Candidate embedding technologies include Sentence Transformers and other evaluated open-source multilingual embedding models.

The final embedding model must be evaluated for:

* English
* Hindi
* Telugu
* Medical terminology
* Cross-language retrieval

---

# 16. Deterministic Symptom & Triage Engine

**Status:** CONFIRMED

The triage engine is deliberately independent of the LLM.

It evaluates structured symptom information against documented safety rules.

Example:

```text
Symptoms
   ↓
Symptom Extraction
   ↓
Structured Symptoms
   ↓
Deterministic Rules
   ↓
┌──────────┬────────┬───────────┐
│ ROUTINE  │ URGENT │ EMERGENCY │
└──────────┴────────┴───────────┘
```

The engine must be:

* Testable
* Versioned
* Auditable
* Deterministic
* Independent of model temperature/output variation

---

# 17. Security Stack

### Authentication

**JWT**

### Authorization

Server-side RBAC:

```text
PATIENT
HEALTHCARE_WORKER
ADMIN
```

### Security requirements

* Password hashing
* Token validation
* RBAC enforcement
* Consent verification
* Input validation
* File validation
* Rate limiting
* Secure environment variables
* Audit logging
* Privacy-conscious error logging
* Restricted patient-data access

---

# 18. Development & Testing Stack

| Purpose              | Technology                      |
| -------------------- | ------------------------------- |
| Source control       | Git                             |
| Repository           | GitHub                          |
| Backend testing      | Pytest                          |
| API testing          | Postman / Thunder Client        |
| Frontend development | Next.js                         |
| AI experiments       | Python / Jupyter / Google Colab |
| Local LLM            | Ollama                          |
| Database             | PostgreSQL + pgvector           |
| Containers           | Docker                          |
| CI                   | GitHub Actions                  |

---

# 19. Deployment Architecture

The system should support:

```text
Development
     ↓
Testing
     ↓
Staging
     ↓
Evaluation
     ↓
Production
```

Containerization:

```text
Docker
 ├── Frontend
 ├── Backend
 ├── PostgreSQL
 └── Supporting services
```

AI services may remain separately managed depending on hardware and deployment constraints.

---

# 20. Offline Technology Strategy

Offline functionality is a **system-level capability**, not simply "running the entire application without internet."

### Must remain available offline where technically feasible

* Application shell
* Cached UI
* Patient profile subset
* Medication schedules
* Reminders
* Cached health information
* Symptom recording
* Basic deterministic safety rules
* Offline event creation
* Synchronization queue

### May require connectivity

* Sarvam STT
* Sarvam TTS
* Sarvam OCR
* Cloud synchronization
* Healthcare-worker synchronization
* Large/remote AI services

### Local AI

Ollama enables local LLM inference where the selected model and hardware permit it.

Therefore, offline AI capability is dependent on:

* Model size
* Quantization
* CPU/RAM performance
* Inference latency
* Selected model quality

It must be experimentally evaluated rather than assumed.

---

# 21. Provider Abstraction Strategy

The application should never contain logic such as:

```text
if Sarvam:
    ...
elif Ollama:
    ...
```

throughout business logic.

Instead:

```text
Application
     ↓
AI Gateway
     ↓
Provider Interface
     ↓
Implementation
```

Example:

```text
LLMProvider
 ├── OllamaLLMProvider
 └── FutureLLMProvider

STTProvider
 ├── SarvamSTTProvider
 └── LocalSTTProvider

TTSProvider
 ├── SarvamTTSProvider
 └── LocalTTSProvider

OCRProvider
 ├── SarvamOCRProvider
 └── LocalOCRProvider
```

This architecture allows future replacement without major application changes.

---

# 22. Technology Selection Rules

A technology may become **CONFIRMED** only when:

1. It satisfies the functional requirement.
2. It fits the project's hardware constraints.
3. It is compatible with the offline strategy where applicable.
4. It has acceptable performance.
5. It can be evaluated reproducibly.
6. Its licensing/cost is acceptable.
7. It does not compromise healthcare safety requirements.

For AI models, benchmark results must be recorded before final selection.

---

# 23. Model Evaluation Requirements

The final model stack must be evaluated against:

### LLM

* Medical RAG grounding
* Hallucination rate
* Instruction following
* English quality
* Hindi quality
* Telugu quality
* Code-mixed input
* Response latency
* CPU/RAM requirements

### STT

* WER
* Medical vocabulary accuracy
* English/Hindi/Telugu performance
* Code-switching
* Latency

### TTS

* Intelligibility
* Naturalness
* Pronunciation
* Language quality
* Medical terminology

### OCR

* CER
* WER
* Medicine extraction accuracy
* Dosage extraction accuracy
* Confidence calibration

---

# 24. Final Technology Decision Matrix

| Component         | Technology / Provider               | Status        |
| ----------------- | ----------------------------------- | ------------- |
| Frontend          | Next.js + TypeScript                | **CONFIRMED** |
| UI                | Tailwind CSS                        | **CONFIRMED** |
| PWA               | Service Worker                      | **CONFIRMED** |
| Offline storage   | IndexedDB                           | **CONFIRMED** |
| Backend           | Python + FastAPI                    | **CONFIRMED** |
| Validation        | Pydantic                            | **CONFIRMED** |
| ORM               | SQLAlchemy                          | **CONFIRMED** |
| Migrations        | Alembic                             | **CONFIRMED** |
| Database          | PostgreSQL                          | **CONFIRMED** |
| Vector search     | pgvector                            | **CONFIRMED** |
| Authentication    | JWT                                 | **CONFIRMED** |
| RBAC              | Server-side                         | **CONFIRMED** |
| AI Gateway        | Custom abstraction                  | **CONFIRMED** |
| Local LLM runtime | Ollama                              | **CONFIRMED** |
| LLM model         | Evaluated open-source model         | **TENTATIVE** |
| RAG               | pgvector + embeddings               | **CONFIRMED** |
| Embeddings        | Evaluated multilingual model        | **TENTATIVE** |
| Online STT        | Sarvam AI                           | **TENTATIVE** |
| Local STT         | Evaluated open-source model         | **TENTATIVE** |
| Online TTS        | Sarvam AI                           | **TENTATIVE** |
| Local TTS         | Evaluated open-source model         | **TENTATIVE** |
| Online OCR        | Sarvam AI                           | **TENTATIVE** |
| Local OCR         | PaddleOCR/Tesseract/evaluated model | **TENTATIVE** |
| Triage            | Deterministic rules                 | **CONFIRMED** |
| Testing           | Pytest                              | **CONFIRMED** |
| Version control   | Git + GitHub                        | **CONFIRMED** |
| Containerization  | Docker                              | **CONFIRMED** |
| CI                | GitHub Actions                      | **CONFIRMED** |

---

# 25. Final Architectural Principle

The MedGuide AI technology stack follows this separation:

```text
                    MEDGUIDE AI
                         │
                    AI GATEWAY
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   REASONING          SPEECH             OCR
       │                 │                 │
    Ollama            Sarvam            Sarvam
       │                 │                 │
       │             Online-first       Online-first
       │                 │                 │
       │          Local fallback   Local fallback
       │
       ▼
   RAG Evidence
       │
       ▼
Deterministic Safety
       │
       ▼
Safe Patient Guidance
```

**Core rule:**

> **Ollama provides local LLM inference. Sarvam AI provides selected online speech/OCR capabilities. RAG provides medical evidence. The deterministic triage engine provides safety decisions. The AI Gateway keeps all providers replaceable.**

No individual AI model or external provider should become the architectural foundation of the entire system.

---

## 26. Development Baseline

This technology stack is now the baseline for **M1–M18**.

Any future technology/model change must update:

1. `TECHNOLOGY_STACK.md`
2. `SYSTEM_ARCHITECTURE.md`
3. Relevant API specifications
4. AI/model documentation
5. Evaluation records
6. Traceability documentation where requirements are affected

**Model selection remains empirical. Architecture is fixed; individual model/provider implementations remain replaceable.**
