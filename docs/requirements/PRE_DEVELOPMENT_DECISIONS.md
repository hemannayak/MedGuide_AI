# MedGuide AI — Pre-Development Decisions

**Project:** MedGuide AI  
**Document:** Pre-Development Decision Register  
**Version:** 2.0  
**Status:** APPROVED — Development Baseline  
**Last Updated:** 2026-08-22

**Related Documents:**

* `AGENTS.md`
* `docs/PROJECT_SPECIFICATION.md`
* `docs/requirements/SRS.md`
* `docs/requirements/USE_CASES.md`
* `docs/requirements/TRACEABILITY_MATRIX.md`
* `docs/development/DEVELOPMENT_ENVIRONMENT.md`

---

# 1. Purpose

This document defines the architectural, product, AI/ML, data, security, infrastructure, and evaluation decisions that establish the development baseline for MedGuide AI.

These decisions are based on the current project requirements, prototype implementation, M1–M4 backend development, RAG validation work, local LLM benchmarking, frontend development, and the planned M5–M18 implementation roadmap.

Once approved, a decision becomes the baseline for implementation unless it is formally revised and documented.

The project follows the principle:

> **Build the safest practical system first, then optimize quality, latency, multilingual capability, and offline capability through measurable evaluation.**

---

# 2. Current Development Baseline

The following decisions are now considered established project direction.

| Area | Current Baseline |
|---|---|
| Target | Rural and underserved communities in India |
| Phase-1 Languages | English + Hindi + Telugu |
| Primary Patient Workflow | Preliminary Symptom Checker |
| AI Assistant | RAG-grounded health companion |
| Safety | Deterministic triage before LLM generation |
| LLM Runtime | Ollama for local inference |
| Local LLM | Model remains configurable and evaluation-driven |
| Candidate LLMs | Qwen, Gemma, Sarvam/local candidates, and other suitable models |
| Speech | Local/open-source and Sarvam candidates to be evaluated |
| TTS | Sarvam and suitable local/open-source candidates to be evaluated |
| OCR | Sarvam and Tesseract/PaddleOCR/local candidates to be evaluated |
| Database | PostgreSQL + pgvector |
| RAG | Approved medical knowledge corpus |
| Frontend | Next.js + TypeScript + PWA direction |
| Backend | FastAPI |
| Offline | Offline-first for selected core workflows |
| Cloud Dependency | Optional for capabilities that cannot practically run offline |
| Safety-Critical Decisions | Never delegated solely to the LLM |
| Development Core | Laptop A |
| Frontend Development | Laptop B |
| Evaluation | Quantitative + qualitative + safety evaluation |

---

# 3. Product Scope Decisions

---

## PD-01 — Target Geography

### Context

The project targets rural and underserved communities where healthcare access, connectivity, language, and digital literacy can create barriers to primary healthcare information.

### Decision

> **Rural and underserved communities in India.**

The initial implementation and evaluation will focus on the Indian healthcare context.

This affects:

* Languages
* Medical knowledge sources
* Emergency guidance
* Healthcare-worker workflows
* UI accessibility
* Offline requirements
* Speech evaluation
* Research framing

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-02 — Phase-1 Languages

### Context

The original proposal considered multiple Indian languages. However, every language must be technically implemented and empirically evaluated before being claimed as supported.

### Decision

> **Phase 1: English + Hindi + Telugu**

The system must support these languages across the applicable text interaction pipeline.

Speech capabilities must separately pass language-specific evaluation before being advertised as production-ready.

Odiya and additional Indian languages remain future extensions.

### Language Requirements

For each Phase-1 language, evaluate:

* Text input
* Text output
* Code-mixed input
* Romanized input where applicable
* LLM instruction following
* RAG grounding
* Citation preservation
* Refusal behavior
* Emergency detection
* Speech-to-text
* Text-to-speech
* UI localization

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-03 — Healthcare Worker Definition

### Decision

> **Authorized Healthcare Worker / Personnel**

The system may support authorized:

* Community Health Workers
* ANMs
* Nurses
* Doctors
* Rural clinic personnel
* Other approved healthcare personnel

The system must enforce role-based access and must not assume that every healthcare worker has physician-level authority.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-04 — Emergency Escalation Behavior

### Context

Emergency safety must not depend on the LLM correctly following a prompt.

### Decision

> **Deterministic emergency detection + immediate localized guidance + optional authorized healthcare-worker alert.**

Emergency flow:

```text
User Text / Voice
       ↓
ASR if voice
       ↓
Deterministic Red-Flag Engine
       ↓
EMERGENCY detected
       ↓
Bypass LLM
       ↓
Localized Emergency Response
       ↓
108 / 112 Guidance
       ↓
Optional Healthcare Worker Alert
```

The LLM must not be responsible for deciding whether an emergency response should occur.

The system must never claim that an emergency service has been contacted unless an actual integration has successfully performed that action.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-05 — Healthcare Resource Locator

### Decision

> **Phase 2**

Nearby hospital/PHC/resource discovery is valuable but introduces:

* Geolocation
* Maps
* Rural POI accuracy
* Data freshness
* Privacy considerations

It is therefore not required for the core M1–M18 MVP implementation unless feasibility allows.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-06 — Notification Mechanism

### Decision

> **PWA/browser notifications + local scheduling where supported**

Medication reminders should work without requiring paid SMS infrastructure.

The system should prioritize:

* Local reminders
* PWA notifications
* Browser notifications where supported
* Offline reminder scheduling

SMS/WhatsApp integrations are not mandatory for MVP.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-07 — Prescription Verification Workflow

OCR must never automatically create a medication schedule from uncertain extraction.

### Required Workflow

```text
Prescription Image
       ↓
Image Validation
       ↓
OCR
       ↓
Text Extraction
       ↓
Medicine / Dosage / Frequency Extraction
       ↓
Confidence Assessment
       ↓
Human Verification
       ↓
Confirmed Medication
       ↓
Schedule Creation
```

### Rules

1. OCR output must be visible for verification.
2. Low-confidence fields must be flagged.
3. The system must not silently substitute medication names.
4. Unverified OCR data must not become an active medication schedule.
5. Prescription interpretation must not be presented as medical diagnosis.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-08 — Medical Knowledge Governance

The RAG corpus is a safety-critical project asset.

### Governance

```text
Candidate Source
       ↓
Authority Verification
       ↓
License / Usage Verification
       ↓
Metadata Registration
       ↓
Human Review
       ↓
Approved Source
       ↓
Cleaning
       ↓
Chunking
       ↓
Embedding
       ↓
Knowledge Base
```

### Required Metadata

* Source name
* Publisher
* Title
* Publication date
* Version
* Topic
* Language
* License
* Source URL
* Status
* Last reviewed date

Only approved sources may enter the production RAG corpus.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-09 — Data Retention and Deletion

### Decision

Health information is retained only for a defined purpose.

| Data                       | Baseline                                              |
| -------------------------- | ----------------------------------------------------- |
| Patient profile            | While account is active                               |
| Consent                    | Retained for auditability                             |
| Symptoms                   | While account is active / applicable retention policy |
| Medication records         | While relevant                                        |
| Prescription images        | Until no longer required, subject to deletion         |
| Health timeline            | While account is active                               |
| Raw AI conversations       | Limited retention                                     |
| Structured health extracts | Retained where required for continuity                |
| Audit logs                 | Defined audit period                                  |
| Uploaded files             | Deletable by authorized policy                        |

Account deletion must trigger deletion or anonymization of applicable personal health data.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-10 — AI Conversation Storage

### Decision

> **Retain health-relevant structured information rather than indefinitely storing raw conversations.**

The system may retain structured information such as:

* Reported symptom
* Duration
* Severity
* Guidance category
* Escalation event
* Relevant follow-up

Raw conversations should have a defined retention policy and must not be retained indefinitely without a documented purpose.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-11 — Source Citation in AI Responses

### Decision

Grounded medical responses must expose source provenance to the user.

Example:

```text
Guidance

Sources
WHO — Document Title
Section — Page
```

The backend must also retain structured source metadata.

### Important Rule

The LLM is not trusted to invent or authoritatively define citations.

Citation metadata is controlled by the application/RAG layer.

The frontend may render:

* Publisher
* Document title
* Section
* Page
* Source URL
* Citation identifier

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-12 — RAG Evidence Sufficiency Gate

### Decision

> **RAG evidence sufficiency is enforced deterministically by application code.**

The LLM must not generate a medical answer when the application determines that sufficient evidence is unavailable.

Current validated provisional threshold:

> **Similarity threshold: 0.55**

This threshold is based on the M4.3 calibration experiment and remains subject to future evaluation.

### Current Gate

```text
User Query
    ↓
Embedding
    ↓
pgvector Retrieval
    ↓
Similarity Evaluation
    ↓
Score < 0.55
    ↓
Deterministic Refusal
```

If sufficient evidence is found:

```text
Score >= 0.55
    ↓
Retrieve approved sources
    ↓
LLM generation
    ↓
Safety / citation validation
```

The threshold may be changed only after documented evaluation.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-13 — AI Model Failure / Fallback Strategy

### Decision

The AI pipeline must never fail into fabricated medical information.

```text
Primary Model
     ↓
Transient Failure?
     ↓ YES
Retry
     ↓
Fallback Model
     ↓
Failure / Unsafe Output
     ↓
Deterministic Safe Response
```

Emergency and evidence-refusal paths bypass the LLM completely.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# 4. AI / ML Decisions

---

# PD-14 — AI Model Hosting, Runtime and Provider Strategy

### Important Distinction

> **Ollama is not the LLM model.**

Ollama is the local model runtime/inference layer used to run compatible models locally.

Architecture:

```text
MedGuide AI
     ↓
AI Gateway
     ↓
Local LLM Runtime
     ↓
Ollama
     ↓
Selected Local Model
```

The model itself remains configurable.

### Candidate Models

The project may evaluate:

* Qwen
* Gemma
* Sarvam/local language models
* Other suitable open-source models

The project must not declare a model as best before benchmarking.

### Current Local Baseline

> **Qwen3:4B via Ollama**

This remains the current local baseline because it has already been successfully executed locally and benchmarked.

### Why Keep the Gateway

The AI Gateway must allow:

```text
Qwen
Gemma
Sarvam / compatible local model
Other evaluated model
```

to be swapped without changing application business logic.

### Cloud / External Providers

Cloud providers may be used when they provide capabilities that cannot practically be reproduced locally, but they must remain isolated behind provider interfaces.

### Status

```text
Status: APPROVED
Baseline: Ollama + Qwen3:4B
Model selection: Evaluation-driven
Approved: 2026-08-22
```

---

# PD-15 — Hardware Constraints

### Primary Development Architecture

Laptop A is the primary AI/backend development environment.

It contains the core:

* PostgreSQL
* pgvector
* Backend
* RAG
* Ollama
* Local AI models
* AI evaluation
* Speech/OCR experimentation

Laptop B is primarily for:

* Frontend
* UI/UX
* Responsive testing
* PWA
* Frontend API integration

### Hardware Requirements

Actual hardware specifications must be recorded in the development environment documentation rather than guessed.

Model selection must consider:

* CPU
* RAM
* GPU
* VRAM
* Disk
* Operating system
* Quantization
* Inference latency

### Status

```text
Status: APPROVED
Baseline: Local CPU-capable inference + optional Colab/cloud evaluation
Approved: 2026-08-22
```

---

# PD-16 — LLM Hallucination Definition

A hallucination/safety failure includes:

1. Unsupported medical claim
2. Contradiction of retrieved evidence
3. Fabricated citation
4. Unsafe recommendation
5. Incorrect medication information
6. False certainty
7. Invented clinical rule

Additional multilingual failures include:

8. Meaning-changing translation
9. Language leakage
10. Incorrect code-switch interpretation
11. Unsafe mistranslation of emergency guidance

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# 5. Multilingual AI Processing Decisions

Speech and multilingual capabilities require separate evaluation from the LLM.

---

# PD-17 — Speech-to-Text Strategy

### Objective

Provide real-time voice interaction for English, Hindi, and Telugu users.

### Candidate Technologies

The project may evaluate:

* Whisper/open-source STT
* Indic/open-source speech models
* Sarvam Speech-to-Text
* Other suitable providers/models

### Important Rule

Sarvam is a candidate provider, not an unconditional dependency.

STT must be evaluated for:

* Telugu
* Hindi
* English
* Code-mixed speech
* Rural accents
* Medical vocabulary
* Noise
* Latency
* Cost
* Offline feasibility

### Status

```text
Status: APPROVED
Provider/model: Evaluation-driven
Approved: 2026-08-22
```

---

# PD-18 — Text-to-Speech Strategy

### Objective

Allow health guidance to be heard rather than only read.

This is particularly important for:

* Low-literacy users
* Elderly users
* Users with reading difficulty
* Voice-first rural workflows

### Candidate Technologies

Evaluate:

* Sarvam TTS
* Local/open-source TTS
* Other suitable multilingual TTS systems

Evaluation criteria:

* Hindi quality
* Telugu quality
* English quality
* Naturalness
* Pronunciation
* Medical terminology
* Latency
* Offline capability
* Resource requirements

### Status

```text
Status: APPROVED
Provider/model: Evaluation-driven
Approved: 2026-08-22
```

---

# PD-19 — Prescription OCR Strategy

### Candidate Technologies

Evaluate:

* Tesseract
* PaddleOCR
* Sarvam OCR / document processing capability
* Other suitable OCR systems

Evaluation must consider:

* Printed prescriptions
* Handwritten text where feasible
* Medicine names
* Dosage
* Frequency
* Duration
* Indian medical terminology
* Image quality
* OCR latency
* Confidence

OCR output must always pass the verification workflow defined in PD-07.

### Status

```text
Status: APPROVED
Provider/model: Evaluation-driven
Approved: 2026-08-22
```

---

# PD-20 — Multilingual Code-Mixed Input

### Context

Real users may not speak or type formal textbook language.

Examples may contain:

```text
Mujhe fever hai
```

```text
Naaku two days nundi fever undi
```

```text
Mera chest mein pain ho raha hai
```

### Decision

The system should evaluate and support practical code-mixed input where technically feasible.

The system must not assume that users will always produce grammatically correct English, Hindi, or Telugu.

### Evaluation

Test:

* Native script
* Romanized language
* English medical terminology
* Hindi-English mixing
* Telugu-English mixing
* Hindi-Telugu-English mixing where relevant

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# 6. Security Decisions

---

# PD-21 — File Upload Security

Prescription images must be treated as untrusted input.

Required controls:

* File-type validation
* File-size limits
* MIME validation
* Image decoding validation
* Randomized filenames
* Restricted storage
* RBAC
* No executable uploads
* Safe image preprocessing
* Malware scanning where practical

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-22 — AI Prompt Security

The system must defend against:

* Direct prompt injection
* Indirect prompt injection
* RAG poisoning
* User attempts to override safety rules
* Citation manipulation
* Medical instruction manipulation

### Critical Rule

Retrieved medical content is evidence, not executable instructions.

User input must never override deterministic safety logic.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-23 — Auditability

Sensitive operations must be auditable.

Examples:

* Healthcare worker views patient
* Healthcare worker views summary
* Alert reviewed
* Follow-up created
* Knowledge source modified
* Admin operation
* Consent changed

Logs must avoid unnecessary PII.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-24 — Threat Model

The security architecture must address:

* Unauthorized patient access
* Privilege escalation
* Credential compromise
* API abuse
* Prompt injection
* RAG poisoning
* Malicious files
* Sensitive logs
* OCR manipulation
* Model misuse
* Offline synchronization attacks

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# 7. Infrastructure and Offline Decisions

---

# PD-25 — Offline-First Strategy

### Core Principle

Offline capability is a **product requirement**, but not every AI capability is required to work offline.

### Offline-capable features

Where technically feasible:

* User profile
* Cached health information
* Previously viewed guidance
* Symptom entry
* Preliminary symptom rules
* Medication schedules
* Medication reminders
* Health timeline viewing
* Pending data queue
* Basic emergency information

### Potentially Online-Dependent Features

Depending on evaluated hardware:

* Large LLM inference
* Cloud RAG
* Cloud STT
* Cloud TTS
* Cloud OCR
* Healthcare-worker synchronization

### Important Architecture

```text
                    MedGuide AI
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
         LOCAL LAYER            ONLINE LAYER
              │                     │
       Offline storage        Cloud APIs
       Local rules            External AI
       Cached knowledge       Synchronization
       Local models           Worker updates
       Reminders              Advanced processing
```

### Rule

The application must clearly indicate when a requested capability requires connectivity.

The system must not falsely claim that a cloud capability is offline.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-26 — Offline Conflict Resolution

### Decision

Prefer immutable timestamped events for health-related records.

Example:

```text
Medication Taken
2026-08-22 08:00
```

is an event rather than a mutable state that can silently overwrite another event.

Use:

* Event IDs
* Timestamps
* Idempotency keys
* Synchronization queues
* Duplicate detection

For editable profile data, conflict resolution may use last-write-wins or explicit user resolution.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-27 — Low-Bandwidth Strategy

The system must be designed for constrained connectivity.

### Requirements

* Small API payloads
* Compressed images
* Lazy loading
* Caching
* Minimal unnecessary JavaScript
* Retry with backoff
* Delta synchronization
* Offline queue
* Progressive loading
* Avoid unnecessary background requests

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# 8. Performance and Operations Decisions

---

# PD-28 — Performance Targets

Performance targets must be measured rather than invented.

The project will benchmark:

| Operation     | Measurement              |
| ------------- | ------------------------ |
| API request   | Latency                  |
| RAG retrieval | Retrieval latency        |
| LLM           | Generation latency       |
| STT           | Transcription latency    |
| TTS           | Synthesis latency        |
| OCR           | Processing latency       |
| Offline sync  | Synchronization latency  |
| Frontend      | Load/performance metrics |

Current Qwen3:4B local benchmark:

```text
Average generation latency: ~14.63 seconds
```

This is a measured development benchmark and not a production SLA.

Future model comparisons must use the same evaluation conditions where practical.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-29 — Observability

Track:

* Application health
* API latency
* Error rate
* LLM latency
* Model used
* RAG retrieval scores
* OCR failures
* STT failures
* TTS failures
* Synchronization failures
* Emergency detections
* Refusal events

Sensitive user content must not be unnecessarily written into logs.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-30 — Backup and Recovery

Required:

* PostgreSQL backups
* Knowledge-base source backup
* Documented restore procedure
* At least one tested restore before final deployment
* Ability to rebuild the RAG index from approved source documents

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-31 — CI/CD and Versioning

### CI/CD

```text
GitHub
   ↓
Pull Request
   ↓
Backend tests
   ↓
Frontend lint/build
   ↓
Integration tests
   ↓
Build verification
```

### Versioning

| Component   | Strategy                      |
| ----------- | ----------------------------- |
| API         | `/api/v1/...`                 |
| Application | Semantic versioning           |
| Database    | Alembic migrations            |
| LLM         | Name + version + quantization |
| Embedding   | Model + version               |
| RAG corpus  | Knowledge-base version        |
| Evaluation  | Experiment ID                 |

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# 9. Research and Evaluation Decisions

---

# PD-32 — Model / Experiment Reproducibility

Every AI experiment must record:

```text
Model
Model version
Runtime
Quantization
Prompt version
Embedding model
Knowledge-base version
Dataset version
Parameters
Hardware
Latency
Results
Evaluation date
```

For local LLM experiments, record:

```text
Runtime = Ollama
Model = Qwen3:4B / evaluated candidate
```

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-33 — Dataset Provenance

Every dataset must have:

```text
Dataset name
Source
URL
License
Version
Language(s)
Size
Collection method
Preprocessing
Split
Known limitations
Intended use
```

Particular attention is required for:

* Medical RAG corpus
* Symptom/triage evaluation
* OCR evaluation
* Speech/STT evaluation
* Multilingual evaluation

No dataset may be treated as an official project resource merely because it was downloaded.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# PD-34 — Evaluation Baselines and Human Evaluation

The project will compare:

1. LLM without RAG
2. RAG + LLM
3. Rule-only triage
4. LLM-based triage where appropriate as a research comparison
5. OCR without preprocessing
6. OCR with preprocessing
7. Monolingual vs multilingual
8. Candidate local LLMs
9. Candidate STT systems
10. Candidate TTS systems
11. Candidate OCR systems

### Human Evaluation

Where feasible, evaluation should include healthcare/domain-knowledgeable reviewers.

The project must not claim clinical validation without appropriate clinical study design and qualified evaluation.

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# 10. Clinical Scope and Research Positioning

---

# PD-35 — Clinical Scope, Research Positioning and System Layer Separation

## Clinical Scope

The MVP focuses on:

* Common primary-care symptoms
* Basic health information
* Preventive guidance
* Medication understanding
* Prescription understanding
* Preliminary symptom assessment
* Red-flag detection
* Emergency escalation

The system does not perform autonomous diagnosis or autonomous treatment decisions.

---

## Primary Patient Workflow

The post-login experience must be designed around simplicity rather than exposing the user immediately to a complex AI chatbot.

### Primary Flow

```text
SIGN IN
   ↓
CONSENT / ONBOARDING
   ↓
PRELIMINARY SYMPTOM CHECKER
   ↓
DETERMINISTIC TRIAGE
   │
   ├── EMERGENCY
   │      ↓
   │   108 / 112
   │
   ├── URGENT
   │      ↓
   │   Prompt professional care
   │
   └── ROUTINE
          ↓
      RAG-grounded guidance
          ↓
      ASK MEDGUIDE
          ↓
      Sources / Next Steps
```

The symptom checker is therefore a primary entry point for rural users who may not know how to formulate a medical question.

---

## Data / Processing Layer Separation

The system must preserve the distinction between:

```text
PATIENT FACT
"I have fever for 3 days."
        ↓
STRUCTURED DATA
symptom = fever
duration = 3 days
        ↓
RETRIEVED KNOWLEDGE
Approved medical source
        ↓
AI GENERATION
Natural-language explanation
        ↓
SYSTEM DECISION
Deterministic triage / escalation
```

These layers must remain distinguishable in:

* Backend processing
* Database design
* API responses
* Logging
* Evaluation
* Frontend presentation

---

## Research Positioning

The project should be framed as:

> **An investigation into an offline-capable, multilingual, RAG-grounded healthcare-support architecture designed for low-resource rural settings in India.**

Do not claim:

* Autonomous diagnosis
* Clinical validation without appropriate evidence
* Guaranteed medical accuracy
* Universal language support
* Full offline AI unless experimentally demonstrated
* That a specific model is universally superior

### Status

```text
Status: APPROVED
Approved: 2026-08-22
```

---

# 11. Final Architecture Baseline

The resulting system is conceptually:

```text
                    MEDGUIDE AI
                         │
                         ▼
                 PATIENT / HCW UI
                         │
                         ▼
                    FASTAPI API
                         │
          ┌──────────────┼───────────────┐
          │              │               │
          ▼              ▼               ▼
       AUTH/RBAC      SYMPTOM          CONSENT
                         │
                         ▼
                DETERMINISTIC TRIAGE
                         │
             ┌───────────┴───────────┐
             │                       │
          EMERGENCY                ROUTINE
             │                       │
          108/112                    ▼
                              RAG RETRIEVAL
                                     │
                                     ▼
                              EVIDENCE GATE
                                     │
                            ┌────────┴────────┐
                            │                 │
                       INSUFFICIENT        SUFFICIENT
                            │                 │
                        REFUSAL              ▼
                                      AI GATEWAY
                                           │
                              ┌────────────┼────────────┐
                              ▼            ▼            ▼
                           Ollama       Cloud        Other
                              │
                     Evaluated Local LLM
                     ├── Qwen
                     ├── Gemma
                     └── Other candidates

VOICE
  │
  ├── STT → Local / Sarvam / Evaluated Provider
  │
  └── TTS → Local / Sarvam / Evaluated Provider

PRESCRIPTION
  │
  └── OCR → Tesseract / PaddleOCR / Sarvam / Evaluated Provider

                         │
                         ▼
                  POSTGRESQL + PGVECTOR
                         │
                         ▼
                  OFFLINE SYNC LAYER
                         │
                         ▼
                HEALTHCARE WORKER
```

---

# 12. Development Environment Separation

The project uses two coordinated development environments.

## Laptop A — Core AI / Backend

Responsible for:

* FastAPI
* PostgreSQL
* pgvector
* Authentication
* Consent
* Patient data
* Triage
* RAG
* Ollama
* Local LLM evaluation
* STT evaluation
* TTS evaluation
* OCR evaluation
* Offline backend/sync logic
* Integration testing
* AI evaluation

## Laptop B — Frontend

Responsible for:

* Next.js
* TypeScript
* UI/UX
* PWA
* Responsive design
* Accessibility
* Frontend states
* API integration
* Multilingual UI
* Voice interaction UI

Both environments must use the same API contracts and Git repository.

---

# 13. Milestone Alignment

These decisions map to the planned M1–M18 implementation sequence:

```text
M1  Backend Foundation                 ✅
M2  Database + Migrations              ✅
M3  Authentication + RBAC              ✅
M4  Consent Management                 ✅

M5  Patient Profile                    → NEXT
M6  Symptom Records
M7  Deterministic Triage
M8  AI Gateway
M9  RAG
M10 AI Health Companion
M11 Prescription OCR
M12 Medication Management
M13 Healthcare Worker Dashboard
M14 Speech + Multilingual
M15 Offline/PWA + Sync
M16 Full Integration Testing
M17 AI Safety + Performance Evaluation
M18 Deployment + Operations
```

Important:

> M4.3 RAG validation/remediation work is considered part of the current AI/RAG validation track and does not replace the official milestone sequence.

---

# 14. Decision Change Policy

An approved decision may be changed only when:

1. A technical limitation is discovered.
2. Evaluation provides evidence for a better approach.
3. A safety requirement changes.
4. A project scope change is formally approved.

When changing a decision:

```text
Existing Decision
       ↓
Reason for Change
       ↓
Evidence / Evaluation
       ↓
New Decision
       ↓
Date + Version
       ↓
Affected Documents Updated
```

Affected documentation may include:

* `PROJECT_SPECIFICATION.md`
* `SRS.md`
* `USE_CASES.md`
* `TRACEABILITY_MATRIX.md`
* Architecture documents
* API specifications
* AI/RAG documentation
* Development environment documentation
* Evaluation documentation

---

# 15. Final Decision Summary

| ID    | Decision                      | Status   | Current Baseline                                 |
| ----- | ----------------------------- | -------- | ------------------------------------------------ |
| PD-01 | Target geography              | APPROVED | Rural India                                      |
| PD-02 | Phase-1 languages             | APPROVED | English + Hindi + Telugu                         |
| PD-03 | Healthcare worker             | APPROVED | Authorized healthcare personnel                  |
| PD-04 | Emergency behavior            | APPROVED | Deterministic guidance + optional worker alert   |
| PD-05 | Resource locator              | APPROVED | Phase 2                                          |
| PD-06 | Notifications                 | APPROVED | PWA + local scheduling                           |
| PD-07 | Prescription verification     | APPROVED | Mandatory human verification                     |
| PD-08 | Knowledge governance          | APPROVED | Approved-source workflow                         |
| PD-09 | Data retention                | APPROVED | Purpose-based retention                          |
| PD-10 | AI conversation storage       | APPROVED | Health-relevant structured extracts              |
| PD-11 | Citations                     | APPROVED | Application-controlled source metadata           |
| PD-12 | RAG evidence gate             | APPROVED | Provisional threshold 0.55                       |
| PD-13 | AI fallback                   | APPROVED | Safe non-AI fallback                             |
| PD-14 | LLM runtime/model strategy    | APPROVED | Ollama + evaluation-driven models                |
| PD-15 | Hardware                      | APPROVED | Local CPU-capable baseline + optional compute    |
| PD-16 | Hallucination definition      | APPROVED | 11 failure categories                            |
| PD-17 | STT                           | APPROVED | Evaluate local + Sarvam + alternatives           |
| PD-18 | TTS                           | APPROVED | Evaluate local + Sarvam + alternatives           |
| PD-19 | OCR                           | APPROVED | Evaluate Tesseract/PaddleOCR/Sarvam/alternatives |
| PD-20 | Code-mixed input              | APPROVED | Explicitly evaluate                              |
| PD-21 | File security                 | APPROVED | Validated restricted uploads                     |
| PD-22 | Prompt security               | APPROVED | Deterministic safety boundaries                  |
| PD-23 | Auditability                  | APPROVED | Sensitive-event logging                          |
| PD-24 | Threat model                  | APPROVED | Required threat coverage                         |
| PD-25 | Offline strategy              | APPROVED | Offline-first selected workflows                 |
| PD-26 | Offline conflicts             | APPROVED | Timestamped immutable events                     |
| PD-27 | Low bandwidth                 | APPROVED | Cache + compression + delta sync                 |
| PD-28 | Performance                   | APPROVED | Measure; do not invent                           |
| PD-29 | Observability                 | APPROVED | Health + latency + AI/OCR/STT/RAG metrics        |
| PD-30 | Backup/recovery               | APPROVED | PostgreSQL + KB rebuild                          |
| PD-31 | CI/CD/versioning              | APPROVED | GitHub Actions + versioned components            |
| PD-32 | Reproducibility               | APPROVED | Full experiment metadata                         |
| PD-33 | Dataset provenance            | APPROVED | Source/license/version tracking                  |
| PD-34 | Evaluation                    | APPROVED | Technical + human evaluation                     |
| PD-35 | Clinical scope / architecture | APPROVED | Primary-care support + 5-layer separation        |

---

# 16. Final Development Principle

MedGuide AI is not being built as:

```text
User
 ↓
LLM
 ↓
Medical Answer
```

It is being built as:

```text
                    USER
                     │
             Text / Voice / Image
                     │
                     ▼
              INPUT PROCESSING
                     │
                     ▼
          DETERMINISTIC SAFETY
                     │
        ┌────────────┴────────────┐
        │                         │
    EMERGENCY                  CONTINUE
        │                         │
     108/112                      ▼
                         STRUCTURED SYMPTOMS
                                  │
                                  ▼
                            RAG RETRIEVAL
                                  │
                                  ▼
                           EVIDENCE GATE
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                 REFUSAL                   EVIDENCE
                     │                         │
                     │                         ▼
                     │                    AI GATEWAY
                     │                         │
                     │              ┌──────────┴──────────┐
                     │              │                     │
                     │          Local LLM             Cloud /
                     │           Ollama               Providers
                     │
                     ▼
              SAFE USER RESPONSE
                     │
                     ▼
             SOURCES + NEXT STEPS
```

The central engineering principle is:

> **The LLM generates language. The application controls safety, evidence, authorization, and clinical escalation.**

This architecture allows MedGuide AI to evaluate better models later without redesigning the healthcare application.

---

# 17. Development Status

```text
Requirements Baseline       ✅
Product Scope               ✅
Use Cases                   ✅
Pre-Development Decisions   ✅
Frontend Architecture       ✅
M1–M4 Backend               ✅
M4.3 RAG Validation         🔄 Remediation / final closure
Frontend UI                 🔄 Active refinement
Laptop A Core Backend       → Next development phase
M5–M18                      → Planned sequential execution
```

The next major implementation environment is **Laptop A**, where the core backend, database, RAG, local AI runtime, speech/OCR evaluation, and subsequent M5–M18 milestones will be completed.
