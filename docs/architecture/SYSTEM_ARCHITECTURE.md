# MedGuide AI — System Architecture

**Project:** MedGuide AI

**Document:** System Architecture

**Version:** 2.0

**Status:** Approved Architecture Baseline

**Primary Development Environment:** Laptop A

**Supporting Development Environment:** Laptop B

**Primary Target:** Rural and underserved communities in India

**MVP Languages:** English + Hindi + Telugu

**Related Documents:**

- `AGENTS.md`
- `docs/PROJECT_SPECIFICATION.md`
- `docs/requirements/SRS.md`
- `docs/requirements/USE_CASES.md`
- `docs/requirements/PRE_DEVELOPMENT_DECISIONS.md`
- `docs/requirements/TRACEABILITY_MATRIX.md`
- `docs/development/DEVELOPMENT_ENVIRONMENT.md`

---

# 1. Architecture Objective

The MedGuide AI architecture is designed to provide a secure, modular, multilingual, AI-assisted healthcare-support platform for rural and underserved communities in India.

The architecture must prioritize:

1. Healthcare safety
2. Correctness
3. Privacy and security
4. Low-resource operation
5. Reliability
6. Maintainability
7. Evidence-grounded AI
8. Offline capability
9. Low-bandwidth operation
10. Research reproducibility
11. Provider independence
12. Measurable evaluation

The architecture must prevent the LLM or any external AI provider from becoming an uncontrolled clinical decision-making component.

---

# 2. Core Architectural Principle

MedGuide AI follows:

> **Assist → Inform → Identify Risk → Escalate**

It does not follow:

> **Diagnose → Prescribe → Replace Doctor**

The system provides preliminary healthcare guidance and structured support.

It does not autonomously:

- Diagnose disease
- Prescribe medication
- Change medication
- Stop medication
- Override healthcare professionals
- Make unsupported clinical decisions

---

# 3. Architectural Principles

## 3.1 AI-Assisted, Not AI-Autonomous

AI is used for:

- Natural-language understanding
- Explanation
- Summarization
- Multilingual interaction
- Conversational assistance
- Information extraction
- RAG-grounded response generation

Safety-critical decisions remain outside the LLM.

---

## 3.2 Separation of Responsibilities

The architecture maintains a strict separation between:

```text
PATIENT-REPORTED FACT
        ↓
STRUCTURED DATA
        ↓
RETRIEVED MEDICAL KNOWLEDGE
        ↓
AI-GENERATED INTERPRETATION
        ↓
DETERMINISTIC SAFETY DECISION
        ↓
USER GUIDANCE / ESCALATION
```

These layers must remain distinguishable in storage, processing, logging, and presentation.

---

## 3.3 Grounded AI

The LLM must not be treated as the primary source of medical truth.

For applicable healthcare questions:

```text
Approved Medical Knowledge
        ↓
RAG Retrieval
        ↓
Relevant Evidence
        ↓
LLM
        ↓
Grounded Response
        ↓
Source Attribution
```

The system must distinguish between:

* Grounded response
* General informational response
* Insufficient-evidence response
* Safety escalation

---

## 3.4 Deterministic Safety

Safety-critical pathways must use explicit, testable rules wherever practical.

The LLM may help extract or structure information from natural language, but it must not independently determine emergency status when a deterministic rule can perform that function.

---

## 3.5 Local-First and Offline-Capable

The architecture is designed so that selected core functionality can continue without internet connectivity.

Offline capability is not defined as "the entire system works without internet."

Instead:

```text
Offline Core
    ├── Patient profile/cache
    ├── Health timeline
    ├── Medication schedules
    ├── Reminders
    ├── Basic symptom workflows
    ├── Deterministic safety rules
    ├── Cached medical information
    ├── Local AI where feasible
    └── Offline synchronization queue
```

Cloud-dependent services must degrade gracefully.

---

## 3.6 Provider Agnostic

External AI providers must never be directly embedded into application business logic.

The architecture must allow providers to be replaced.

For example:

```text
Application
     ↓
AI Gateway
     ↓
Provider Interface
     ↓
┌────────────┬──────────────┐
│            │              │
Ollama      Sarvam       Local Models
```

---

## 3.7 Low-Bandwidth Aware

The system must minimize:

* API payload sizes
* Image sizes
* Unnecessary requests
* Duplicate synchronization
* Large client-side assets
* Repeated downloads

Caching, compression, pagination, retries, and delta synchronization should be used where appropriate.

---

# 4. High-Level System Architecture

```text
                         MEDGUIDE AI
                              │
              ┌───────────────┴────────────────┐
              │                                │
              ▼                                ▼
        Patient PWA                    Healthcare Worker
              │                            Dashboard
              └───────────────┬────────────────┘
                              │
                              ▼
                       FastAPI Backend
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
        Authentication    Application       AI Gateway
        & Authorization     Services             │
                              │          ┌────────┼────────┐
                              │          │        │        │
                              │          ▼        ▼        ▼
                              │        LLM      Speech    OCR
                              │          │        │        │
                              │       Ollama   Sarvam/   Sarvam/
                              │                 Local    Local
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
         PostgreSQL        pgvector       File Storage
              │               │
              │               ▼
              │          RAG Engine
              │
              ▼
        Health Records
              │
              ▼
       Timeline / Alerts
```

---

# 5. Development Runtime Architecture

Laptop A is the primary development and integration environment.

```text
LAPTOP A
│
├── Next.js Frontend
├── FastAPI Backend
├── PostgreSQL
├── pgvector
├── Ollama
├── RAG
├── Local AI Experiments
├── OCR Experiments
├── Speech Experiments
└── Integration Tests
```

Laptop B is a supporting development environment.

```text
LAPTOP B
│
├── Frontend Development
├── UI/UX
├── Documentation
├── API Testing
├── Lightweight Experiments
└── Testing
```

External compute may be used for:

* Large-model benchmarking
* Batch evaluation
* Heavy speech experiments
* OCR experiments
* Embedding experiments
* Research experiments

External compute must not become a mandatory runtime dependency.

---

# 6. Client Architecture

## 6.1 Patient Client

The patient-facing application is implemented as a responsive Next.js application with PWA capabilities.

Technology:

* Next.js
* React
* TypeScript
* Tailwind CSS
* PWA
* IndexedDB where required

The UI is designed specifically for users with varying levels of digital literacy.

---

## 6.2 Patient UX Principles

The patient experience should prioritize:

* Large touch targets
* Minimal typing
* Clear language
* Native-language support
* Voice interaction
* Simple navigation
* Visual status indicators
* Short explanations
* Clear emergency instructions

The signed-in patient experience should prioritize the **Preliminary Symptom Checker** as one of the primary entry points.

---

# 7. Patient Application Responsibilities

The patient client handles:

* Authentication
* Consent
* Profile
* Preliminary symptom checker
* Health queries
* Voice input
* Prescription upload
* Medication schedules
* Reminders
* Adherence
* Health timeline
* Language selection
* Notifications where supported
* Offline cache
* Synchronization queue

Sensitive business rules must remain enforced by the backend.

---

# 8. Preliminary Symptom Checker Architecture

The Preliminary Symptom Checker is a major patient-facing workflow.

Its purpose is to make symptom reporting simple for users who may have limited digital literacy.

The workflow is:

```text
Patient
   ↓
"How are you feeling?"
   ↓
Simple Symptom Selection
   ↓
Optional Voice Input
   ↓
Duration
   ↓
Severity
   ↓
Associated Symptoms
   ↓
Structured Symptom Representation
   ↓
Deterministic Red-Flag Rules
   ↓
Risk Category
   ↓
Guidance / Escalation
```

Risk categories:

```text
ROUTINE
   │
   ├── General preliminary guidance
   └── Monitor / follow up

URGENT
   │
   ├── Prompt professional consultation
   └── Healthcare-worker review where applicable

EMERGENCY
   │
   ├── Immediate emergency guidance
   ├── 108 / 112 guidance
   └── Authorized healthcare-worker alert where configured
```

The LLM must not be the sole authority for this classification.

---

# 9. Healthcare Worker Dashboard

Authorized healthcare workers can access permitted patient information.

Responsibilities include:

* Authentication
* Patient list
* Authorized patient search
* Patient profile
* Symptom history
* Medication information
* Health timeline
* AI-generated summaries
* Alerts
* Follow-up management

The dashboard must distinguish:

```text
PATIENT-REPORTED INFORMATION
        ≠
AI-GENERATED INFORMATION
        ≠
DETERMINISTIC SYSTEM ALERT
```

---

# 10. Backend Architecture

The backend uses:

**Python + FastAPI**

The backend acts as the central application boundary.

```text
Client
  ↓
FastAPI API
  ↓
Authentication
  ↓
Authorization
  ↓
Application Services
  ↓
Domain / Safety Services
  ↓
Data + AI Services
```

---

# 11. Backend Layers

## 11.1 API Layer

Responsible for:

* HTTP requests
* Request validation
* Authentication
* Response schemas
* HTTP status codes
* API versioning

Base API:

```text
/api/v1/
```

---

## 11.2 Application Layer

Responsible for:

* Patient management
* Consent
* Symptom workflows
* Prescription processing
* Medication management
* Timeline
* Follow-ups
* Healthcare-worker workflows

---

## 11.3 Domain / Safety Layer

Responsible for:

* Red-flag rules
* Triage
* Permission enforcement
* Consent checks
* Medication schedule validation
* Data-access rules

This layer must not depend on the LLM for safety-critical decisions.

---

# 12. AI Gateway Architecture

The AI Gateway is one of the most important architectural boundaries.

```text
Application Services
        ↓
    AI Gateway
        │
 ┌──────┼────────┬─────────┐
 │      │        │         │
LLM    RAG      STT       TTS
 │               │         │
 │               │         │
Ollama          Sarvam    Sarvam
 │               │         │
 │               ▼         ▼
 │           Local STT  Local TTS
 │
 ▼
Evaluated Local Model
```

The Gateway centralizes:

* Provider selection
* Model configuration
* Prompt management
* Input validation
* Output validation
* Fallback behavior
* Provider availability
* Logging
* Metrics
* Safety controls

---

# 13. LLM Architecture — Ollama

Ollama is the **local LLM runtime**.

Its responsibility is to execute the selected local language model.

Ollama is used for:

* Conversational generation
* RAG-grounded responses
* Explanations
* Summarization
* Multilingual response generation
* Structured natural-language generation

Ollama is not responsible for:

* Medical knowledge storage
* RAG retrieval
* OCR
* STT
* TTS
* Deterministic triage
* Emergency decisions

Architecture:

```text
AI Gateway
    ↓
LLM Provider
    ↓
Ollama
    ↓
Selected Local LLM
```

The final LLM model must be selected after evaluation.

Candidate models may include:

* Qwen family
* Gemma family
* Other suitable multilingual open-source models

Evaluation must include English, Hindi, Telugu, code-mixed inputs, RAG grounding, safety, refusal behavior, latency, and resource usage.

---

# 14. RAG Architecture

RAG is the primary mechanism for grounding medical responses.

## 14.1 Knowledge Ingestion

```text
Authoritative Source
        ↓
Source Verification
        ↓
Metadata Extraction
        ↓
Cleaning
        ↓
Chunking
        ↓
Embedding
        ↓
pgvector
```

---

## 14.2 Query Pipeline

```text
User Query
     ↓
Input Processing
     ↓
Query Embedding
     ↓
pgvector Search
     ↓
Top-K Results
     ↓
Evidence Filtering
     ↓
Evidence Confidence Gate
     ↓
Prompt Construction
     ↓
Ollama LLM
     ↓
Grounded Response
     ↓
Citation
```

---

# 15. RAG Evidence Gate

The system must not silently treat every retrieval result as reliable evidence.

Conceptually:

```text
Retrieved Evidence
       ↓
Evidence Quality Check
       │
 ┌─────┴──────┐
 │            │
Sufficient   Insufficient
 │            │
 ▼            ▼
LLM         Safe limitation
Generation   / refusal
```

The exact retrieval threshold must be determined experimentally during evaluation.

A hard-coded threshold such as `0.70` must not be treated as medically valid until experimentally justified.

---

# 16. Medical Knowledge Governance

Only approved sources may enter the production knowledge base.

Workflow:

```text
Candidate Source
      ↓
Verification
      ↓
Metadata
      ↓
Review
      ↓
Approval
      ↓
Processing
      ↓
Embedding
      ↓
Knowledge Base
```

Required metadata includes:

* Source
* Publisher
* Title
* Publication date
* Version
* Language
* Topic
* License
* Review status
* Last reviewed date

---

# 17. AI Health Companion Architecture

The general conversational pipeline:

```text
User Input
    ↓
Input Validation
    ↓
Language Identification
    ↓
Speech-to-Text if Required
    ↓
Intent / Information Extraction
    ↓
Deterministic Safety Pre-check
    ↓
RAG Retrieval
    ↓
Evidence Gate
    ↓
Context Construction
    ↓
Ollama LLM
    ↓
Output Safety Validation
    ↓
Citation Attachment
    ↓
Response
    ↓
Escalation if Required
```

The LLM must not bypass the safety layer.

---

# 18. Speech Architecture

Speech is separated into STT and TTS.

## 18.1 Speech-to-Text

Online:

```text
User Speech
    ↓
Audio Validation
    ↓
Sarvam STT
    ↓
Transcript
```

Offline:

```text
User Speech
    ↓
Audio Validation
    ↓
Local STT
    ↓
Transcript
```

Both providers are accessed through:

```text
STTProvider
```

---

## 18.2 Text-to-Speech

Online:

```text
AI Response
    ↓
Sarvam TTS
    ↓
Audio
```

Offline:

```text
AI Response
    ↓
Local TTS
    ↓
Audio
```

Both providers are accessed through:

```text
TTSProvider
```

---

# 19. Sarvam Integration Boundary

Sarvam is an **online provider**, not the core MedGuide LLM.

Sarvam may be used for:

* STT
* TTS
* OCR
* Indian-language processing where evaluated and appropriate

Architecture:

```text
                AI Gateway
                    │
       ┌────────────┼────────────┐
       │            │            │
      STT          TTS          OCR
       │            │            │
    Sarvam       Sarvam       Sarvam
       │            │            │
       └────────────┼────────────┘
                    │
              Online Services
```

If Sarvam is unavailable:

```text
Sarvam unavailable
       ↓
Local provider attempted
       ↓
If local provider unavailable
       ↓
Graceful limitation
```

Sarvam credentials must never be required for the core application to start.

---

# 20. OCR Architecture

Prescription processing:

```text
Prescription Image
       ↓
File Validation
       ↓
Safe Storage
       ↓
Image Preprocessing
       ↓
OCR Provider
       ↓
Raw Text
       ↓
Medicine Information Extraction
       ↓
Confidence Assessment
       ↓
Patient Verification
       ↓
Confirmed Medication
       ↓
Medication Schedule
```

Online OCR may use Sarvam.

Local OCR may use an evaluated open-source implementation such as PaddleOCR or another suitable model.

The system must never silently create an active medication schedule from unverified OCR output.

---

# 21. Symptom Processing Architecture

Symptom processing separates language understanding from safety classification.

```text
Patient Input
      ↓
Text / Speech
      ↓
STT if necessary
      ↓
Symptom Extraction
      ↓
Structured Symptoms
      ↓
Validation
      ↓
Deterministic Triage Rules
      ↓
Risk Category
      ↓
Guidance / Escalation
```

The system must not implement:

```text
Free Text
   ↓
LLM
   ↓
Diagnosis
```

---

# 22. Deterministic Triage Engine

The Triage Engine evaluates predefined red-flag conditions.

```text
Structured Symptoms
        ↓
Rule Evaluation
        ↓
┌──────────┬─────────┬───────────┐
ROUTINE    URGENT    EMERGENCY
```

Rules must be:

* Explicit
* Versioned
* Testable
* Traceable to approved medical sources
* Independently testable without an LLM

---

# 23. Emergency Escalation Architecture

When an emergency rule is triggered:

```text
Red Flag Detected
       ↓
Emergency State
       ↓
Prominent Guidance
       ↓
108 / 112 Instructions
       ↓
Healthcare Worker Alert
(if authorized/configured)
```

The MVP does not autonomously place emergency calls.

---

# 24. Medication Architecture

```text
Verified Prescription
        ↓
Medication Record
        ↓
Schedule
        ↓
Reminder
        ↓
Patient Action
        ↓
Adherence Event
        ↓
Health Timeline
```

Medication schedules must originate from verified medication information.

---

# 25. Health Timeline Architecture

The health timeline is event-oriented.

Examples:

```text
SYMPTOM_REPORTED
AI_INTERACTION
TRIAGE_COMPLETED
ALERT_CREATED
PRESCRIPTION_UPLOADED
PRESCRIPTION_VERIFIED
MEDICATION_ADDED
MEDICATION_TAKEN
FOLLOW_UP_CREATED
```

Where practical, health events should be immutable and timestamped.

This supports offline synchronization and auditability.

---

# 26. Offline Architecture

The offline architecture uses:

```text
Next.js PWA
      ↓
IndexedDB
      ↓
Local State
      ↓
Offline Action
      ↓
Sync Queue
      ↓
Connectivity Restored
      ↓
Backend Sync API
```

Offline-capable functions may include:

* Cached profile
* Health timeline
* Medication schedules
* Medication reminders
* Basic symptom workflows
* Cached health information
* Local safety rules
* Local AI where hardware permits
* Queued operations

---

# 27. Offline AI Architecture

Offline AI is provider-independent.

```text
OFFLINE
  │
  ├── Local LLM → Ollama
  │
  ├── Local STT
  │
  ├── Local TTS
  │
  ├── Local OCR
  │
  ├── Local RAG / Cached Knowledge
  │
  └── Deterministic Safety Rules
```

The exact local STT, TTS, OCR, and LLM models must be determined through evaluation.

---

# 28. Online AI Architecture

When connectivity is available:

```text
                    Online
                       │
             ┌─────────┼─────────┐
             │         │         │
          Ollama     Sarvam    Backend
             │         │
             │    ┌────┼────┐
             │    │    │    │
             │   STT  TTS  OCR
             │
             ▼
             RAG
             │
             ▼
          Response
```

Online availability may improve speech, voice, or OCR quality, but must not remove the local architecture.

---

# 29. Offline Synchronization

The synchronization engine must use:

* Idempotency keys
* Timestamped events
* Retry with backoff
* Conflict detection
* Conflict resolution
* Queue state tracking

Preferred model:

```text
Offline Event
     ↓
Local Queue
     ↓
Connectivity Restored
     ↓
Sync
     ↓
Server Validation
     ↓
Persist Event
```

Duplicate operations must be safely deduplicated.

---

# 30. Low-Bandwidth Architecture

The platform should support slow networks using:

* Compressed images
* Pagination
* Lazy loading
* Caching
* Small JSON payloads
* Request retries
* Backoff
* Delta synchronization
* Minimal repeated downloads

---

# 31. Database Architecture

Primary database:

```text
PostgreSQL
     │
     ├── Relational Data
     │
     └── pgvector
```

Major entities include:

* Users
* Patient profiles
* Healthcare workers
* Consent
* Conversations
* Messages
* Symptoms
* Triage records
* Prescriptions
* Medications
* Medication schedules
* Adherence events
* Timeline events
* Alerts
* Follow-ups
* Knowledge documents
* Knowledge chunks
* Audit logs

---

# 32. Vector Storage

`pgvector` stores embeddings for approved medical knowledge.

Conceptually:

```text
Knowledge Chunk
      ↓
Embedding Model
      ↓
Vector
      ↓
pgvector
```

The embedding model must be versioned.

Knowledge-base versions must be traceable to their source manifest.

---

# 33. File Storage Architecture

Prescription images and other uploaded files must be stored separately from relational data.

```text
Patient
   ↓
Secure File Upload
   ↓
Validation
   ↓
Safe Storage
   ↓
Restricted Access
```

Requirements:

* File-type validation
* Size limits
* Safe filenames
* Restricted access
* No executable files
* Ownership checks
* Appropriate deletion policy

---

# 34. Authentication and Authorization

Authentication uses:

* Secure password hashing
* JWT-based authentication
* Token validation

Roles:

```text
PATIENT
HEALTHCARE_WORKER
ADMIN
```

Authorization must be enforced server-side.

A healthcare worker must only access patients they are authorized to access.

---

# 35. Consent Architecture

Consent must be checked before protected health workflows.

```text
Authentication
      ↓
Consent Status
      ↓
Authorized Health Workflow
```

Consent events must be auditable.

---

# 36. AI Data Access Boundary

The LLM must never directly query PostgreSQL.

Instead:

```text
Database
   ↓
Application Service
   ↓
Minimal Required Context
   ↓
AI Gateway
   ↓
LLM
```

Only the minimum necessary patient information should be provided to an AI provider.

---

# 37. External Provider Data Boundary

For online providers such as Sarvam:

```text
Application
    ↓
Data Minimization
    ↓
Provider Adapter
    ↓
External API
```

Provider-specific calls must remain isolated.

The application must document what data is transmitted to external providers.

---

# 38. AI Safety and Prompt Injection

The AI Gateway must protect against:

* Direct prompt injection
* Indirect prompt injection
* RAG poisoning
* Output manipulation
* Unsafe instruction following

Hierarchy:

```text
System Safety Constraints
        ↓
Application Rules
        ↓
Retrieved Evidence
        ↓
User Input
```

Retrieved documents must be treated as evidence, not executable instructions.

---

# 39. Model Failure Architecture

If the LLM fails:

```text
Primary Local LLM
       ↓
Retry
       ↓
Fallback Model if available
       ↓
Safe Non-AI Response
```

If Sarvam STT/TTS/OCR fails:

```text
Sarvam
  ↓
Local Provider
  ↓
Graceful Limitation
```

The system must never fail into fabricated medical content.

---

# 40. Observability

The system should monitor:

* API latency
* API error rate
* Database health
* LLM latency
* RAG retrieval
* STT failures
* TTS failures
* OCR failures
* Sync failures
* Provider availability

Logs must minimize exposure of patient-sensitive information.

---

# 41. Audit Architecture

Sensitive operations should generate audit events.

Examples:

```text
PATIENT_VIEWED
SUMMARY_VIEWED
ALERT_REVIEWED
FOLLOWUP_CREATED
KNOWLEDGE_UPDATED
ADMIN_OPERATION
```

Audit logs should contain the minimum information required for traceability.

---

# 42. Security Architecture

Security controls include:

* Authentication
* RBAC
* Consent
* Secure password hashing
* HTTPS
* Environment secrets
* File validation
* Input validation
* API authorization
* Prompt security
* RAG source governance
* Audit logging
* Secure synchronization

---

# 43. API Architecture

The backend exposes versioned APIs:

```text
/api/v1/
```

Major API groups:

```text
/auth
/consent
/patients
/symptoms
/ai
/prescriptions
/medications
/timeline
/healthcare-workers
/alerts
/follow-ups
/sync
/admin
```

Frontend code must consume defined API contracts rather than inventing response structures.

---

# 44. End-to-End Patient Query Architecture

Text:

```text
Patient
   ↓
Frontend
   ↓
FastAPI
   ↓
Authentication
   ↓
Input Validation
   ↓
Safety Pre-check
   ↓
Symptom / Intent Extraction
   ↓
RAG Retrieval
   ↓
Evidence Gate
   ↓
Ollama
   ↓
Safety Validation
   ↓
Citation
   ↓
Frontend
```

Voice:

```text
Patient Speech
   ↓
Sarvam STT / Local STT
   ↓
Transcript
   ↓
Same AI Pipeline
   ↓
Ollama
   ↓
Sarvam TTS / Local TTS
   ↓
Patient Audio
```

---

# 45. End-to-End Prescription Architecture

```text
Patient
   ↓
Upload Prescription
   ↓
File Validation
   ↓
Secure Storage
   ↓
Sarvam OCR / Local OCR
   ↓
Extracted Text
   ↓
Medicine Extraction
   ↓
Confidence
   ↓
Patient Verification
   ↓
Medication Record
   ↓
Schedule
   ↓
Reminder
   ↓
Adherence
   ↓
Timeline
```

---

# 46. End-to-End Emergency Architecture

```text
Patient Symptom Input
        ↓
Structured Symptoms
        ↓
Deterministic Triage
        ↓
Red Flag
        ↓
EMERGENCY
        ↓
Immediate Guidance
        ↓
108 / 112
        ↓
Healthcare Worker Alert
(where authorized)
```

The LLM does not override the emergency rule engine.

---

# 47. End-to-End Offline Architecture

```text
Internet Available?
        │
   ┌────┴────┐
   │         │
  YES        NO
   │         │
   ▼         ▼
Online     Offline
Providers  Providers
   │         │
   └────┬────┘
        ↓
    AI Gateway
        ↓
  Application
        ↓
 Local / Server Data
```

Provider selection must be transparent to the application layer.

---

# 48. Architecture and M1–M18 Mapping

```text
M1  → Backend Foundation
M2  → Database + Migrations
M3  → Authentication + RBAC
M4  → Consent
M5  → Patient Profile
M6  → Symptom Records
M7  → Deterministic Triage
M8  → AI Gateway
M9  → RAG
M10 → AI Health Companion
M11 → Prescription OCR
M12 → Medication + Adherence
M13 → Healthcare Worker Dashboard
M14 → Speech + Multilingual
M15 → Offline/PWA + Sync
M16 → Integration Testing
M17 → AI Safety + Performance Evaluation
M18 → Deployment + Operations
```

Architecture must evolve through controlled changes as each milestone is implemented.

---

# 49. Development Dependency Order

The implementation should follow:

```text
Requirements
     ↓
Decision Register
     ↓
Traceability Matrix
     ↓
Architecture
     ↓
Database Design
     ↓
API Specification
     ↓
AI/RAG Design
     ↓
Implementation
     ↓
Testing
     ↓
Evaluation
     ↓
Deployment
```

A new implementation dependency must result in a corresponding documentation update.

---

# 50. Research Architecture

The architecture supports research questions including:

1. Does RAG improve medical grounding compared with unconstrained LLM generation?
2. How well do candidate local LLMs handle English, Hindi, Telugu, and code-mixed queries?
3. Does deterministic triage reduce safety-critical dependence on the LLM?
4. How accurately can prescription information be extracted?
5. How does Sarvam compare with local STT/TTS/OCR alternatives?
6. How usable is the platform under intermittent connectivity?
7. What quality trade-offs exist between online and offline AI processing?

All claims must be experimentally evaluated.

---

# 51. Evaluation Architecture

Each AI component must be independently measurable.

```text
LLM
 ├── Grounding
 ├── Safety
 ├── Language Quality
 └── Latency

RAG
 ├── Recall@K
 ├── Citation Correctness
 └── Retrieval Latency

Triage
 ├── Sensitivity
 ├── Specificity
 └── False Negatives

OCR
 ├── CER
 ├── WER
 └── Medicine Accuracy

Speech
 ├── WER
 ├── Language Performance
 └── Code-Mixed Performance

Offline
 ├── Task Completion
 ├── Sync Reliability
 └── Conflict Rate
```

No metric may be claimed before measurement.

---

# 52. Provider Selection Principle

Provider selection is based on function rather than branding.

```text
                    MedGuide AI
                         │
                    AI Gateway
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
      LLM              Speech             OCR
       │                 │                 │
    Ollama          Sarvam/Local       Sarvam/Local
       │
   Evaluated Model
```

The architecture intentionally avoids treating one provider as responsible for every AI capability.

---

# 53. Offline vs Online Capability Matrix

| Capability               | Online                       | Offline                       |
| ------------------------ | ---------------------------- | ----------------------------- |
| Patient profile          | ✅                            | ✅ Cached                      |
| Health timeline          | ✅                            | ✅ Cached                      |
| Medication schedules     | ✅                            | ✅                             |
| Reminders                | ✅                            | ✅                             |
| Basic symptom workflow   | ✅                            | ✅                             |
| Deterministic triage     | ✅                            | ✅                             |
| RAG                      | ✅ Local/Server               | ✅ Local/Cached where feasible |
| LLM                      | Ollama / configured provider | Ollama                        |
| STT                      | Sarvam / Local               | Local                         |
| TTS                      | Sarvam / Local               | Local                         |
| OCR                      | Sarvam / Local               | Local                         |
| Healthcare-worker sync   | ✅                            | Queued                        |
| Cloud synchronization    | ✅                            | ❌                             |
| External provider access | ✅                            | ❌                             |

---

# 54. Architecture Constraints

The following constraints are binding:

1. No autonomous medical diagnosis.
2. No autonomous prescription.
3. No mandatory dependence on Sarvam.
4. No mandatory cloud LLM dependency.
5. No direct database access by the LLM.
6. No unverified medical source in the production RAG corpus.
7. No automatic medication scheduling from unverified OCR.
8. No LLM-only emergency classification.
9. No real patient data during development without appropriate authorization.
10. No unmeasured AI performance claims.

---

# 55. Architectural Golden Rule

```text
                         AI
                          │
               ┌──────────┴──────────┐
               │                     │
          Understand                Assist
               │                     │
               └──────────┬──────────┘
                          ↓
                    RAG / Evidence
                          ↓
                  Safety Validation
                          ↓
                Deterministic Rules
                          ↓
                 Guidance / Escalation
                          ↓
                 Healthcare Worker
```

> **AI helps MedGuide understand and assist. Evidence grounds the response. Deterministic rules protect safety. Healthcare professionals remain responsible for clinical care.**

---

# 56. Final Architecture Statement

MedGuide AI is a:

> **Local-first, multilingual, RAG-grounded, safety-controlled healthcare-support platform for rural and underserved communities in India.**

The architecture intentionally separates:

```text
Ollama
→ Local LLM Runtime

Sarvam
→ Online STT / TTS / OCR Provider

RAG
→ Medical Knowledge Grounding

Deterministic Triage
→ Safety-Critical Risk Classification

FastAPI
→ Application Backend

PostgreSQL + pgvector
→ Structured + Vector Data

PWA + IndexedDB
→ Patient Client + Offline Layer

AI Gateway
→ Provider Abstraction + Control Boundary
```

This separation ensures that the platform can continue evolving even if a particular model, provider, API, or AI technology is replaced.

---

# 57. Architecture Completion Criteria

The architecture is considered implementation-ready when:

* All requirements are traceable.
* Pre-development decisions are recorded.
* Database entities are defined.
* API contracts are defined.
* AI Gateway interfaces are defined.
* Local LLM strategy is defined.
* Online STT/TTS/OCR provider interfaces are defined.
* Offline alternatives are identified.
* RAG knowledge governance is defined.
* Deterministic triage architecture is defined.
* Offline synchronization strategy is defined.
* Security boundaries are defined.
* Evaluation methodology is defined.
* Required datasets/resources are tracked.
* M1 implementation dependencies are available.

---

# 58. Final Development Rule

> **Laptop A is the primary integration environment.**

> **Ollama is the local LLM runtime.**

> **Sarvam is an online provider for selected STT, TTS, OCR, and evaluated Indian-language capabilities.**

> **Sarvam must never be treated as the entire AI architecture.**

> **RAG provides evidence grounding.**

> **Deterministic rules control safety-critical decisions.**

> **Local alternatives are required for meaningful offline capability.**

> **The AI Gateway keeps all providers replaceable.**

> **Every AI component must be evaluated independently before performance claims are made.**

> **Every milestone must update code, tests, documentation, and traceability.**
