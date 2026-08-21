# MedGuide AI — Requirements Traceability Matrix

---

## 1. Document Identity

**Project:** MedGuide AI

**Full Title:** MedGuide AI: An AI-Powered Rural Healthcare Intelligence and Digital Care Platform

**Version:** 3.0

**Status:** Approved Requirements Baseline

**Primary Geography:** Rural and underserved communities in India

**Primary Languages — Phase 1:**
- English
- Hindi
- Telugu

**Primary SDG:** SDG 3 — Good Health and Well-Being

**Related Documents:**

- `AGENTS.md`
- `docs/PROJECT_SPECIFICATION.md`
- `docs/requirements/SRS.md`
- `docs/requirements/USE_CASES.md`
- `docs/requirements/PRE_DEVELOPMENT_DECISIONS.md`
- `docs/development/DEVELOPMENT_ENVIRONMENT.md`

---

# 2. Purpose

This Requirements Traceability Matrix (RTM) establishes traceability between the approved MedGuide AI requirements and their corresponding:

- Use cases
- System modules
- APIs
- Database entities
- AI/ML components
- Frontend components
- Implementation milestones
- Test cases
- Evaluation metrics
- Safety requirements
- Research questions

The purpose of the RTM is to ensure that every significant project requirement can be traced from:

```text
Requirement
    ↓
Use Case
    ↓
System Module
    ↓
API / Interface
    ↓
Data / Database
    ↓
Implementation
    ↓
Test
    ↓
Evaluation
```

This matrix also explicitly distinguishes:

* Deterministic safety logic
* LLM reasoning/generation
* RAG retrieval
* Online language services
* Offline-capable processing

No component should silently assume another component's responsibility.

---

# 3. Traceability Status Definitions

| Status             | Meaning                                                         |
| ------------------ | --------------------------------------------------------------- |
| PLANNED            | Requirement approved but implementation has not started         |
| IN DESIGN          | Architecture or detailed design is being defined                |
| IN DEVELOPMENT     | Implementation is underway                                      |
| IMPLEMENTED        | Implementation completed                                        |
| TESTED             | Implementation tested successfully                              |
| VERIFIED           | Requirement demonstrated through appropriate testing/evaluation |
| DEFERRED           | Approved but moved to a later phase                             |
| TBD — Architecture | Final implementation depends on architecture evaluation         |

Where a requirement is not applicable to a particular traceability layer:

`N/A`

Where implementation has not yet been selected:

`TBD — Evaluation`

---

# 4. Functional Requirements Traceability

## FR-01 to FR-50

| ID    | Requirement                        | Use Case               | Module                       | API / Interface                             | Data                              | Test                   | Evaluation                   | Priority           |
| ----- | ---------------------------------- | ---------------------- | ---------------------------- | ------------------------------------------- | --------------------------------- | ---------------------- | ---------------------------- | ------------------ |
| FR-01 | User Registration                  | UC-P01                 | Authentication               | `/auth/register`                            | User                              | Registration tests     | Functional                   | Core MVP           |
| FR-02 | User Authentication                | UC-P02                 | Authentication               | `/auth/login`                               | User                              | Authentication tests   | Functional/Security          | Core MVP           |
| FR-03 | Role-Based Access Control          | UC-P02, UC-H01, UC-A01 | Authorization                | Auth middleware                             | User                              | RBAC tests             | Security evaluation          | Core MVP           |
| FR-04 | Consent Management                 | UC-P03                 | Consent                      | `/consent`                                  | Consent, AuditLog                 | Consent tests          | Privacy verification         | Core MVP           |
| FR-05 | Patient Profile                    | UC-P04                 | Patient Management           | `/patients/me`                              | PatientProfile                    | Profile tests          | Functional                   | Core MVP           |
| FR-06 | Preliminary Symptom Checker        | UC-P05                 | Symptom Processing           | `/symptoms`                                 | SymptomRecord                     | Symptom workflow tests | Usability + extraction       | Core MVP           |
| FR-07 | Symptom Structuring                | UC-P05                 | Symptom Processing           | `/symptoms/analyze`                         | SymptomRecord                     | Extraction tests       | Precision/Recall/F1          | Core MVP           |
| FR-08 | Deterministic Triage               | UC-P06                 | Triage Engine                | `/symptoms/analyze`                         | SymptomRecord, Alert              | Rule-engine tests      | Sensitivity/Specificity      | Core MVP           |
| FR-09 | Red-Flag Detection                 | UC-P06                 | Triage Engine                | `/symptoms/analyze`                         | Alert                             | Red-flag tests         | Sensitivity/FNR              | Core MVP           |
| FR-10 | Emergency Escalation               | UC-P07                 | Escalation                   | `/symptoms/emergency`                       | Alert                             | Emergency tests        | Safety evaluation            | Core MVP           |
| FR-11 | Urgent Care Guidance               | UC-P06                 | Triage Engine + RAG          | `/symptoms/analyze`                         | SymptomRecord                     | Safety tests           | Safety evaluation            | Core MVP           |
| FR-12 | Routine Health Guidance            | UC-P08                 | AI Companion                 | `/ai/chat`                                  | Conversation                      | Chat tests             | Grounding/Safety             | Core MVP           |
| FR-13 | AI Health Companion                | UC-P08                 | AI Companion                 | `/ai/chat`                                  | Conversation, Message             | Chat tests             | Response quality             | Core MVP           |
| FR-14 | Retrieval-Augmented Generation     | UC-P08, UC-A02         | RAG Engine                   | `/ai/chat`                                  | KnowledgeDocument, KnowledgeChunk | Retrieval tests        | Recall@K/Groundedness        | Core MVP           |
| FR-15 | Medical Knowledge Governance       | UC-A02                 | Knowledge Management         | Admin interface                             | KnowledgeDocument                 | Ingestion tests        | Source validity              | Core System        |
| FR-16 | Evidence Sufficiency Gate          | UC-P08                 | RAG Safety                   | Internal                                    | Retrieval metadata                | Evidence tests         | Unsupported-claim rate       | Core MVP           |
| FR-17 | Source Provenance                  | UC-P08                 | RAG                          | `/ai/chat`                                  | KnowledgeChunk                    | Citation tests         | Citation correctness         | Core MVP           |
| FR-18 | Prescription Upload                | UC-P09                 | Prescription Processing      | `/prescriptions`                            | Prescription                      | Upload tests           | Functional/Security          | Core MVP           |
| FR-19 | Prescription OCR                   | UC-P10                 | OCR Gateway                  | `/prescriptions/{id}/ocr`                   | Prescription                      | OCR tests              | CER/WER                      | Core MVP           |
| FR-20 | Medicine Information Extraction    | UC-P10                 | Prescription NLP             | `/prescriptions/{id}/extract`               | Prescription, Medication          | Extraction tests       | Precision/Recall             | Core MVP           |
| FR-21 | Medication Verification            | UC-P10                 | Medication                   | `/prescriptions/{id}/verify`                | Prescription, Medication          | Verification tests     | Human verification accuracy  | Core MVP           |
| FR-22 | Medication Management              | UC-P11                 | Medication                   | `/medications`                              | Medication                        | Medication tests       | Functional                   | Core MVP           |
| FR-23 | Medication Scheduling              | UC-P11                 | Medication                   | `/medications/{id}/schedules`               | MedicationSchedule                | Schedule tests         | Functional                   | Core MVP           |
| FR-24 | Medication Reminders               | UC-P12                 | Notification                 | `/medication-schedules/{id}/reminders`      | MedicationSchedule                | Reminder tests         | Reliability                  | Core MVP           |
| FR-25 | Medication Adherence               | UC-P13                 | Medication                   | `/medication-schedules/{id}/adherence`      | MedicationAdherence               | Adherence tests        | Functional                   | Core MVP           |
| FR-26 | Health Timeline                    | UC-P14                 | Timeline                     | `/timeline`                                 | HealthTimeline                    | Timeline tests         | Functional                   | Core MVP           |
| FR-27 | Healthcare Worker Dashboard        | UC-H01                 | Healthcare Worker            | `/healthcare-workers/patients`              | User, Patient                     | Dashboard tests        | Usability/Functional         | Core MVP           |
| FR-28 | Authorized Patient Review          | UC-H02                 | Healthcare Worker            | `/healthcare-workers/patients/{id}`         | Patient, SymptomRecord            | Authorization tests    | Security                     | Core MVP           |
| FR-29 | AI Patient Summary                 | UC-H03                 | AI Summary                   | `/healthcare-workers/patients/{id}/summary` | Patient, Timeline                 | Summary tests          | Quality/Safety               | Core MVP           |
| FR-30 | Follow-Up Management               | UC-H04                 | Follow-Up                    | `/follow-ups`                               | FollowUp                          | Follow-up tests        | Functional                   | Core MVP           |
| FR-31 | Alerts                             | UC-H05                 | Alert Management             | `/alerts`                                   | Alert                             | Alert tests            | Reliability                  | Core MVP           |
| FR-32 | Multilingual Interaction           | UC-P15                 | Language Processing          | `/ai/*`                                     | Conversation                      | Language tests         | EN/HI/TE                     | Core MVP           |
| FR-33 | Speech-to-Text                     | UC-P16                 | Speech Gateway               | `/ai/speech-to-text`                        | Transcript metadata               | STT tests              | WER/Language accuracy        | Core MVP           |
| FR-34 | Text-to-Speech                     | UC-P17                 | Speech Gateway               | `/ai/text-to-speech`                        | N/A                               | TTS tests              | Naturalness/Language quality | Core MVP           |
| FR-35 | Voice-Based Symptom Input          | UC-P05, UC-P16         | Speech + Symptom             | `/ai/speech-to-text` → `/symptoms`          | SymptomRecord                     | End-to-end voice tests | WER + Extraction F1          | Core MVP           |
| FR-36 | AI Provider Abstraction            | UC-P08, UC-P16, UC-P17 | AI Gateway                   | Internal provider interface                 | Provider metadata                 | Adapter tests          | Portability/Reliability      | Core System        |
| FR-37 | Local LLM Inference                | UC-P08                 | Local LLM Gateway            | Ollama                                      | Model metadata                    | Local inference tests  | Latency/Memory/Quality       | Core System        |
| FR-38 | Sarvam Online Language Services    | UC-P16, UC-P17, UC-P10 | External AI Provider Gateway | Sarvam adapter                              | Provider metadata                 | Integration tests      | Accuracy/Latency             | Core System        |
| FR-39 | LLM Model Evaluation               | UC-P08                 | AI Evaluation                | Internal                                    | Experiment metadata               | Benchmark tests        | Quality/Safety/Latency       | Core System        |
| FR-40 | Offline Functionality              | UC-P18                 | Offline Layer                | `/sync` where applicable                    | Local + Server                    | Offline tests          | Task completion              | Core MVP           |
| FR-41 | Offline Medication Reminders       | UC-P12, UC-P18         | Offline Notification         | Local scheduler                             | Local schedule                    | Offline reminder tests | Reliability                  | Core MVP           |
| FR-42 | Offline Cached Health Information  | UC-P18                 | Offline Cache                | Local interface                             | IndexedDB                         | Cache tests            | Availability                 | Core MVP           |
| FR-43 | Offline Basic Safety Rules         | UC-P18                 | Local Safety Layer           | Local rule engine                           | Local rules                       | Offline safety tests   | Safety                       | Core MVP           |
| FR-44 | Synchronization                    | UC-P19                 | Sync Engine                  | `/sync`                                     | Sync metadata                     | Sync tests             | Conflict rate/Reliability    | Core MVP           |
| FR-45 | Healthcare Resource Guidance       | UC-P20                 | Resource Locator             | `/resources`                                | Resource                          | Resource tests         | Location accuracy            | Phase 2            |
| FR-46 | Administrative Pipeline Monitoring | UC-A03                 | Admin Monitoring             | `/admin/pipeline-logs`                      | AuditLog                          | Monitoring tests       | Reliability/Security         | Core System        |
| FR-47 | Sarvam Online OCR                  | UC-P10                 | OCR Provider Adapter         | Internal Sarvam adapter                     | OCR metadata                      | OCR provider tests     | CER/WER/Medicine accuracy    | Core MVP / Online  |
| FR-48 | Local OCR Fallback                 | UC-P10, UC-P18         | Local OCR                    | PaddleOCR/Tesseract/evaluated model         | Prescription                      | Offline OCR tests      | CER/WER                      | Core MVP / Offline |
| FR-49 | Local Speech Fallback              | UC-P16, UC-P18         | Local Speech                 | Evaluated local STT model                   | Audio/Transcript                  | Offline STT tests      | WER/Latency                  | Core MVP / Offline |
| FR-50 | Safe Provider Failure Handling     | UC-P08, UC-P16, UC-P17 | AI Gateway                   | Provider fallback interface                 | Audit metadata                    | Failure tests          | Reliability/Safety           | Core MVP           |

---

# 5. Important AI Provider Separation

MedGuide AI must not treat all AI components as one model.

The architecture explicitly separates:

```text
                    MEDGUIDE AI
                         │
                    AI GATEWAY
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
      LLM              SPEECH             OCR
        │                │                │
        ▼                ▼                ▼
     Ollama          Sarvam / Local     Sarvam / Local
        │                │                │
        ▼                ▼                ▼
 Evaluated local    Online / Offline   Online / Offline
 models             alternatives       alternatives
```

## 5.1 Ollama / Local LLM

Ollama is responsible for **running the selected local LLM**.

It is used for:

* RAG-grounded response generation
* Explanation
* Summarization
* Conversational reasoning
* Multilingual response generation
* Offline-capable LLM inference where hardware permits

Possible evaluated models include:

* Qwen family
* Gemma family
* Other suitable multilingual open-source models

The final model must be selected through evaluation.

Ollama itself is a runtime layer and is therefore replaceable.

---

## 5.2 Sarvam

Sarvam is **not the replacement for Ollama's LLM role**.

Sarvam is evaluated primarily for Indian-language and document-processing services such as:

* Online Speech-to-Text
* Online Text-to-Speech
* Online OCR/document processing where appropriate
* Indian-language processing capabilities

Sarvam should be accessed through provider adapters.

```text
MedGuide Application
        ↓
AI Gateway
        ↓
Sarvam Adapter
        ↓
Sarvam Online Service
```

This allows the project to replace Sarvam later without rewriting the application.

---

## 5.3 Offline Fallback Principle

Online Sarvam services cannot be treated as the definition of offline capability.

When network connectivity is available:

```text
Internet Available
       │
       ├──► Sarvam STT
       ├──► Sarvam TTS
       └──► Sarvam OCR
```

When network connectivity is unavailable:

```text
No Internet
       │
       ├──► Local STT
       ├──► Local TTS
       ├──► Local OCR
       └──► Local LLM via Ollama
```

The exact local models will be selected through benchmarking.

---

# 6. AI Processing Responsibility Matrix

| Capability         | Primary Online Option                  | Offline Option                          | Required Evaluation          |
| ------------------ | -------------------------------------- | --------------------------------------- | ---------------------------- |
| LLM generation     | Local Ollama / optional cloud provider | Ollama + evaluated local LLM            | Quality, safety, latency     |
| RAG retrieval      | Local PostgreSQL + pgvector            | Local PostgreSQL/cache                  | Recall@K, grounding          |
| STT                | Sarvam / evaluated provider            | Evaluated local STT                     | WER, language accuracy       |
| TTS                | Sarvam / evaluated provider            | Evaluated local TTS                     | Naturalness, intelligibility |
| OCR                | Sarvam / evaluated provider            | PaddleOCR/Tesseract/evaluated local OCR | CER/WER, medicine extraction |
| Symptom extraction | Local NLP/LLM                          | Local NLP/LLM                           | Precision/Recall/F1          |
| Triage             | Deterministic rules                    | Same local rules                        | Sensitivity/Specificity      |
| Safety gate        | Backend rules                          | Local rules                             | False-negative rate          |
| Citation           | RAG metadata                           | Local knowledge base                    | Citation correctness         |

---

# 7. Primary Patient Workflow Traceability

The primary patient journey is:

```text
Sign In
   ↓
Consent
   ↓
Profile
   ↓
Preliminary Symptom Checker
   ↓
Symptom Structuring
   ↓
Deterministic Red-Flag Detection
   ↓
┌──────────────┬──────────────┬───────────────┐
│ ROUTINE      │ URGENT       │ EMERGENCY     │
│              │              │               │
▼              ▼              ▼
Guidance       Care advice    Emergency       │
               + escalation   guidance        │
                              + optional      │
                              worker alert    │
```

The **Preliminary Symptom Checker is the primary post-login patient entry point** because the target users may have limited digital literacy.

The interface must therefore prioritize:

* Simple language
* Large touch targets
* Voice input
* Clear symptom categories
* Minimal typing
* Visual risk states
* One-action progression
* Language selection
* Emergency visibility

---

# 8. AI Health Companion Workflow

```text
User Text / Voice
       ↓
Language Detection / Selection
       ↓
STT if Voice
       ↓
Input Sanitization
       ↓
Deterministic Safety / Red-Flag Check
       ↓
RAG Retrieval
       ↓
Evidence Sufficiency Gate
       │
       ├── Insufficient Evidence
       │        ↓
       │   Safe Limitation
       │
       └── Sufficient Evidence
                ↓
        Local LLM via Ollama
                ↓
        Safety Validation
                ↓
        Citation Attachment
                ↓
        Text Response
                ↓
        Optional TTS
```

---

# 9. Safety-Critical Traceability

Safety-critical decisions must not depend exclusively on LLM output.

## Safety layers

```text
Layer 1 — Input
    ↓
Layer 2 — Deterministic Red-Flag Rules
    ↓
Layer 3 — Evidence Retrieval
    ↓
Layer 4 — Evidence Sufficiency Gate
    ↓
Layer 5 — LLM Generation
    ↓
Layer 6 — Output Safety Validation
```

The deterministic triage engine remains authoritative for predefined emergency/red-flag conditions.

The LLM may explain or structure information but must not independently override deterministic safety rules.

---

# 10. Non-Functional Requirements Traceability

| ID     | Requirement                            | Trace                          | Evaluation                |
| ------ | -------------------------------------- | ------------------------------ | ------------------------- |
| NFR-01 | Security                               | Auth/RBAC/API/Data             | Security testing          |
| NFR-02 | Privacy                                | Consent/Data minimization      | Privacy review            |
| NFR-03 | Reliability                            | API/AI/Sync                    | Failure testing           |
| NFR-04 | Usability                              | Patient UI                     | Usability evaluation      |
| NFR-05 | Accessibility                          | UI/Voice                       | WCAG-oriented testing     |
| NFR-06 | Performance                            | API/AI/OCR/STT/TTS             | Latency benchmarking      |
| NFR-07 | Maintainability                        | Modular backend/frontend       | Code review               |
| NFR-08 | Portability                            | AI provider gateway            | Provider replacement test |
| NFR-09 | Offline resilience                     | PWA/Local AI/Sync              | Offline task completion   |
| NFR-10 | Multilingual accessibility             | EN/HI/TE                       | Language evaluation       |
| NFR-11 | Explainability                         | RAG citations/safety states    | Human review              |
| NFR-12 | Cost efficiency                        | Open-source/local-first        | Resource analysis         |
| NFR-13 | Low-bandwidth operation                | Compression/cache/sync         | Network simulation        |
| NFR-14 | Data integrity                         | DB/Sync                        | Integrity testing         |
| NFR-15 | Auditability                           | AuditLog                       | Security audit            |
| NFR-16 | Provider replaceability                | AI Gateway                     | Adapter replacement test  |
| NFR-17 | Reproducibility                        | Model/dataset/version metadata | Experiment reproduction   |
| NFR-18 | Accessibility for low digital literacy | Simplified workflows/voice     | User evaluation           |

---

# 11. Healthcare Safety Requirements

| ID     | Safety Requirement                                                       | Implementation                         |
| ------ | ------------------------------------------------------------------------ | -------------------------------------- |
| SAF-01 | Do not claim autonomous diagnosis                                        | System prompts + UI disclaimer         |
| SAF-02 | Do not autonomously prescribe                                            | Medication verification + safety rules |
| SAF-03 | Deterministic red-flag detection                                         | Rule engine                            |
| SAF-04 | Emergency guidance                                                       | Escalation module                      |
| SAF-05 | Optional healthcare-worker alert                                         | Alert module                           |
| SAF-06 | Ground medical answers in approved sources                               | RAG                                    |
| SAF-07 | Reject unsupported medical claims                                        | Evidence gate                          |
| SAF-08 | Communicate uncertainty                                                  | Response policy                        |
| SAF-09 | Validate citations                                                       | Citation service                       |
| SAF-10 | Human verification of OCR                                                | Prescription verification              |
| SAF-11 | Protect LLM from prompt injection                                        | AI security layer                      |
| SAF-12 | Protect knowledge base from poisoning                                    | Knowledge governance                   |
| SAF-13 | Never use failed provider output as trusted content                      | AI Gateway                             |
| SAF-14 | Offline mode must preserve safety boundaries                             | Local rules                            |
| SAF-15 | Offline AI must not imply online clinical authority                      | Offline UI policy                      |
| SAF-16 | Provider failure must result in safe fallback                            | AI Gateway                             |
| SAF-17 | Raw patient data must not be unnecessarily exposed to external providers | Provider data policy                   |

---

# 12. Security and Privacy Traceability

The following security requirements apply across the platform:

```text
Authentication
      ↓
Authorization / RBAC
      ↓
Consent Verification
      ↓
Data Minimization
      ↓
Secure API Access
      ↓
Secure File Handling
      ↓
AI Prompt Security
      ↓
RAG Security
      ↓
Provider Data Protection
      ↓
Audit Logging
```

Key controls include:

* Password hashing
* JWT/session security
* RBAC
* Consent enforcement
* File validation
* Randomized file storage
* Restricted prescription access
* Prompt injection mitigation
* RAG poisoning protection
* Sensitive-data-safe logging
* Secure synchronization
* Provider request minimization
* Environment-based secrets

---

# 13. Data Traceability

| Data Category       | Source                 | Storage                   | Used By         |
| ------------------- | ---------------------- | ------------------------- | --------------- |
| User                | Registration           | PostgreSQL                | Auth            |
| Patient profile     | User                   | PostgreSQL                | Patient/Worker  |
| Consent             | Patient                | PostgreSQL                | Consent         |
| Symptoms            | Patient                | PostgreSQL                | Triage/AI       |
| Structured symptoms | NLP                    | PostgreSQL                | Triage          |
| Medical documents   | Approved sources       | PostgreSQL/Object storage | RAG             |
| Knowledge chunks    | Ingestion pipeline     | pgvector                  | Retrieval       |
| Embeddings          | Embedding model        | pgvector                  | RAG             |
| Conversations       | Patient interaction    | PostgreSQL                | AI Companion    |
| Prescriptions       | Patient upload         | Secure object storage     | OCR             |
| OCR output          | OCR provider/local OCR | PostgreSQL                | Medication      |
| Audio               | User voice input       | Temporary/local storage   | STT             |
| Transcript          | STT                    | PostgreSQL where required | Symptom/Chat    |
| Medication          | Verification           | PostgreSQL                | Scheduling      |
| Adherence           | Patient                | PostgreSQL                | Timeline        |
| Alerts              | Triage                 | PostgreSQL                | Worker          |
| Follow-ups          | Worker                 | PostgreSQL                | Worker          |
| Audit logs          | System                 | PostgreSQL                | Security        |
| Sync queue          | Offline client         | IndexedDB                 | Synchronization |

---

# 14. AI / RAG Traceability

```text
Approved Medical Sources
        ↓
Document Validation
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
Similarity Retrieval
        ↓
Evidence Sufficiency Gate
        ↓
Ollama Local LLM
        ↓
Safety Validation
        ↓
Citation Attachment
        ↓
User Response
```

Required RAG evaluation:

* Recall@K
* Precision@K where appropriate
* Citation correctness
* Groundedness
* Unsupported-claim rate
* Retrieval latency

---

# 15. AI Provider Gateway Traceability

The AI Gateway is a mandatory abstraction layer.

## Provider interfaces

```text
LLMProvider
STTProvider
TTSProvider
OCRProvider
EmbeddingProvider
```

The application must depend on these interfaces rather than directly depending on a specific provider.

### LLM

```text
LLMProvider
     ↓
Ollama
     ↓
Evaluated Local Model
```

Potential models:

* Qwen family
* Gemma family
* Other evaluated multilingual local models

The final model is selected using Phase 1 benchmarking.

### STT

```text
STTProvider
   ├── Sarvam Online
   └── Evaluated Local STT
```

### TTS

```text
TTSProvider
   ├── Sarvam Online
   └── Evaluated Local TTS
```

### OCR

```text
OCRProvider
   ├── Sarvam Online
   └── Evaluated Local OCR
```

This architecture ensures Sarvam is valuable for online Indian-language services without making Sarvam a mandatory dependency for the offline system.

---

# 16. Online / Offline Capability Matrix

| Feature                     | Online |                            Offline |
| --------------------------- | -----: | ---------------------------------: |
| Authentication              |      ✓ |          Cached session where safe |
| Profile                     |      ✓ |       Cached read / queued updates |
| Preliminary Symptom Checker |      ✓ |                                  ✓ |
| Deterministic Triage        |      ✓ |                                  ✓ |
| Basic Red-Flag Rules        |      ✓ |                                  ✓ |
| AI Chat                     |      ✓ | ✓ where local LLM hardware permits |
| RAG                         |      ✓ |  ✓ with local knowledge base/cache |
| Sarvam STT                  |      ✓ |                                  ✗ |
| Local STT                   |      ✓ |                                  ✓ |
| Sarvam TTS                  |      ✓ |                                  ✗ |
| Local TTS                   |      ✓ |                                  ✓ |
| Sarvam OCR                  |      ✓ |                                  ✗ |
| Local OCR                   |      ✓ |                                  ✓ |
| Medication Schedule         |      ✓ |                                  ✓ |
| Medication Reminders        |      ✓ |                                  ✓ |
| Health Timeline             |      ✓ |                           ✓ cached |
| Healthcare Worker Sync      |      ✓ |               ✗ until synchronized |
| Emergency guidance          |      ✓ |                                  ✓ |
| Cloud synchronization       |      ✓ |                                  ✗ |
| Pending operation queue     |      ✓ |                                  ✓ |

---

# 17. Offline Architecture Traceability

Offline capability is not defined as "the website loads without internet."

The minimum offline capability is:

```text
Device
  │
  ├── PWA Shell
  ├── IndexedDB
  ├── Cached Patient Data
  ├── Medication Scheduler
  ├── Basic Safety Rules
  ├── Local STT
  ├── Local TTS
  ├── Local OCR
  ├── Local LLM via Ollama where device permits
  └── Sync Queue
```

When connectivity returns:

```text
Local Queue
     ↓
Sync Engine
     ↓
Idempotency Check
     ↓
Conflict Resolution
     ↓
Server
```

Health events should preferably be represented as timestamped immutable events to minimize destructive synchronization conflicts.

---

# 18. Research Questions Traceability

| ID    | Research Question                                                                                 | Related Requirement | Metric                          |
| ----- | ------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------- |
| RQ-01 | Does RAG improve grounding compared with an LLM without RAG?                                      | FR-14               | Groundedness/Unsupported Claims |
| RQ-02 | How effective is the selected local LLM for EN/HI/TE healthcare guidance?                         | FR-37               | Language/Safety/Quality         |
| RQ-03 | Which evaluated local LLM provides the best quality-resource tradeoff?                            | FR-39               | Quality/Latency/RAM             |
| RQ-04 | How accurately can multilingual symptoms be structured?                                           | FR-07               | Precision/Recall/F1             |
| RQ-05 | How accurately can deterministic triage detect predefined red flags?                              | FR-08/09            | Sensitivity/Specificity/FNR     |
| RQ-06 | How accurately can prescription text be extracted?                                                | FR-19               | CER/WER                         |
| RQ-07 | How accurately can medicine information be extracted?                                             | FR-20               | Precision/Recall                |
| RQ-08 | How effective is multilingual speech input?                                                       | FR-33/35            | WER                             |
| RQ-09 | Does Sarvam provide useful online STT/TTS/OCR performance for Phase 1?                            | FR-38/47            | Accuracy/Latency/Quality        |
| RQ-10 | How effective are local speech/OCR alternatives during offline operation?                         | FR-48/49            | Accuracy/Latency                |
| RQ-11 | Can core patient workflows operate without connectivity?                                          | FR-40/41/42/43      | Offline task completion         |
| RQ-12 | How does the system perform on constrained rural-device hardware?                                 | FR-37/48/49         | Latency/RAM/CPU                 |
| RQ-13 | Does voice-first interaction improve usability for low-digital-literacy users?                    | FR-35               | Usability evaluation            |
| RQ-14 | Can provider abstraction reduce architectural coupling?                                           | FR-36               | Provider replacement test       |
| RQ-15 | Does deterministic safety logic provide more predictable emergency handling than LLM-only triage? | FR-08/09            | Sensitivity/FNR                 |

---

# 19. Module-Level Traceability

| Module ID | Module                  | Primary Requirements              |
| --------- | ----------------------- | --------------------------------- |
| MOD-01    | Authentication          | FR-01, FR-02                      |
| MOD-02    | Authorization           | FR-03                             |
| MOD-03    | Consent                 | FR-04                             |
| MOD-04    | Patient Management      | FR-05                             |
| MOD-05    | Symptom Processing      | FR-06, FR-07                      |
| MOD-06    | Deterministic Triage    | FR-08, FR-09, FR-11               |
| MOD-07    | Emergency Escalation    | FR-10                             |
| MOD-08    | AI Gateway              | FR-36, FR-50                      |
| MOD-09    | RAG Engine              | FR-14, FR-16, FR-17               |
| MOD-10    | Local LLM               | FR-37, FR-39                      |
| MOD-11    | Speech Gateway          | FR-33, FR-34, FR-35, FR-38, FR-49 |
| MOD-12    | OCR Gateway             | FR-19, FR-47, FR-48               |
| MOD-13    | Prescription Processing | FR-18, FR-20, FR-21               |
| MOD-14    | Medication Management   | FR-22, FR-23                      |
| MOD-15    | Notifications           | FR-24                             |
| MOD-16    | Adherence               | FR-25                             |
| MOD-17    | Health Timeline         | FR-26                             |
| MOD-18    | Healthcare Worker       | FR-27, FR-28                      |
| MOD-19    | AI Summaries            | FR-29                             |
| MOD-20    | Follow-Up               | FR-30                             |
| MOD-21    | Alerts                  | FR-31                             |
| MOD-22    | Offline & Sync          | FR-40–FR-44                       |
| MOD-23    | Admin Monitoring        | FR-46                             |

---

# 20. Development Milestone Traceability

| Milestone | Focus                              | Primary Requirements      |
| --------- | ---------------------------------- | ------------------------- |
| M1        | Backend Foundation                 | Infrastructure            |
| M2        | Database Models + Migrations       | Data requirements         |
| M3        | Authentication + RBAC              | FR-01–FR-03               |
| M4        | Consent Management                 | FR-04                     |
| M5        | Patient Profile                    | FR-05                     |
| M6        | Symptom Records                    | FR-06, FR-07              |
| M7        | Deterministic Triage               | FR-08–FR-11               |
| M8        | AI Gateway                         | FR-36, FR-50              |
| M9        | RAG                                | FR-14–FR-17               |
| M10       | AI Health Companion                | FR-12, FR-13              |
| M11       | Prescription OCR                   | FR-18–FR-21, FR-47, FR-48 |
| M12       | Medication + Adherence             | FR-22–FR-26               |
| M13       | Healthcare Worker Dashboard        | FR-27–FR-31               |
| M14       | Speech + Multilingual              | FR-32–FR-35, FR-38, FR-49 |
| M15       | Offline/PWA + Synchronization      | FR-39–FR-44               |
| M16       | End-to-End Integration Testing     | All Core MVP              |
| M17       | AI Safety + Performance Evaluation | RQ-01–RQ-15               |
| M18       | Deployment + Operations            | Production readiness      |

---

# 21. Dataset and Resource Traceability

Before implementation reaches a feature requiring external data or evaluation resources, the corresponding dataset/resource must be identified and tracked.

Required resource categories include:

| Resource                       | Required For          | Milestone  |
| ------------------------------ | --------------------- | ---------- |
| Medical RAG corpus             | RAG                   | M9         |
| Symptom/triage evaluation data | Symptom/Triage        | M6–M7, M17 |
| Prescription OCR dataset       | OCR                   | M11, M17   |
| Medicine extraction data       | Medication extraction | M11, M17   |
| Speech datasets                | STT                   | M14, M17   |
| Hindi evaluation data          | Multilingual          | M14, M17   |
| Telugu evaluation data         | Multilingual          | M14, M17   |
| English evaluation data        | Multilingual          | M14, M17   |
| TTS evaluation material        | TTS                   | M14, M17   |
| Offline workflow test cases    | Offline               | M15–M17    |
| Synthetic patient records      | End-to-end testing    | M16        |
| Knowledge-source manifest      | RAG governance        | M9, M17    |

Each dataset/resource should track:

```text
Name
Source
URL
License
Version
Language
Size
Purpose
Preprocessing
Split
Limitations
Date acquired
```

No dataset should be silently introduced into the project without provenance tracking.

---

# 22. Scope Traceability

## Core MVP

The following remain Core MVP:

* Authentication
* Consent
* Patient profile
* Preliminary symptom checker
* Symptom structuring
* Deterministic triage
* Red-flag detection
* Emergency guidance
* AI health companion
* RAG
* Prescription OCR
* Medication extraction
* Medication verification
* Medication management
* Medication reminders
* Medication adherence
* Health timeline
* Healthcare-worker dashboard
* Multilingual interaction
* Voice interaction
* Offline-first capability
* Synchronization

## Phase 2

* Healthcare resource locator
* Additional languages
* Advanced healthcare integrations
* Expanded public-health capabilities

## Explicitly Out of Scope

* Autonomous medical diagnosis
* Autonomous prescribing
* Autonomous emergency-service calling
* Full EHR/FHIR interoperability
* Medical-device integration
* Disease outbreak prediction
* Drug-stock prediction
* WhatsApp/IVR as a mandatory MVP dependency
* Large-scale public-health analytics

---

# 23. Verification Rules

The following rules apply to the entire project:

### Rule 1 — Requirement Traceability

Every Core MVP feature must map to at least one approved requirement.

### Rule 2 — Safety Traceability

Every safety-critical function must have:

```text
Requirement
↓
Implementation
↓
Test
↓
Evaluation
```

### Rule 3 — AI Traceability

Every evaluated AI model must record:

* Model name
* Version
* Quantization
* Prompt version
* Embedding model
* Dataset version
* Hardware
* Parameters
* Results

### Rule 4 — Dataset Traceability

Every evaluation dataset must have documented provenance.

### Rule 5 — Provider Traceability

Every external provider must be accessed through an abstraction layer.

### Rule 6 — Offline Traceability

Any feature advertised as offline-capable must have an explicit offline implementation and test case.

### Rule 7 — No Fabricated Results

No accuracy, latency, safety, WER, CER, Recall@K, or usability result may be recorded as achieved until experimentally measured.

### Rule 8 — No Silent Scope Expansion

A feature not represented in the approved requirements baseline must not become part of the Core MVP without updating the relevant requirements documentation.

---

# 24. Final Traceability Chain

The complete MedGuide AI engineering chain is:

```text
PROJECT SPECIFICATION
        ↓
SRS
        ↓
USE CASES
        ↓
PRE-DEVELOPMENT DECISIONS
        ↓
TRACEABILITY MATRIX
        ↓
ARCHITECTURE
        ↓
DATABASE DESIGN
        ↓
API CONTRACTS
        ↓
AI / RAG DESIGN
        ↓
FRONTEND IMPLEMENTATION
        ↓
BACKEND IMPLEMENTATION
        ↓
INTEGRATION
        ↓
TESTING
        ↓
AI / SAFETY EVALUATION
        ↓
DEPLOYMENT
```

---

# 25. Final Rule

> **If a feature cannot be traced back to an approved requirement, it should not be treated as a Core MVP feature.**

> **If an AI component cannot be evaluated independently, its contribution to the system should not be claimed as validated.**

> **If an online provider is used, the architecture must clearly define whether an offline alternative exists and what functionality is lost without connectivity.**

> **If a safety-critical decision can be made deterministically, it must not be delegated exclusively to an LLM.**

This RTM is the authoritative bridge between the MedGuide AI requirements baseline and subsequent architecture, implementation, testing, and evaluation phases.
