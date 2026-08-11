# MedGuide AI — System Architecture

**Project:** MedGuide AI
**Document:** System Architecture
**Version:** 1.0
**Status:** Baseline Architecture
**Related Documents:**

* `AGENTS.md`
* `docs/PROJECT_SPECIFICATION.md`
* `docs/requirements/SRS.md`
* `docs/requirements/USE_CASES.md`
* `docs/requirements/PRE_DEVELOPMENT_DECISIONS.md`
* `docs/requirements/TRACEABILITY_MATRIX.md`

---

# 1. Architecture Objective

The MedGuide AI architecture is designed to provide a secure, modular, multilingual, AI-assisted healthcare platform suitable for rural and underserved environments.

The architecture must prioritize:

1. Healthcare safety
2. Correctness
3. Privacy and security
4. Low-resource operation
5. Reliability
6. Maintainability
7. AI grounding
8. Offline capability
9. Research reproducibility
10. Scalability

The architecture must prevent the AI model from becoming an uncontrolled decision-making component.

---

# 2. Architectural Principles

## 2.1 AI-Assisted, Not AI-Autonomous

The system shall use AI to assist users and healthcare workers.

AI must not independently:

* Diagnose patients
* Prescribe medication
* Modify medication
* Override healthcare workers
* Make unsupported clinical decisions

---

## 2.2 Separation of Responsibilities

The system shall separate:

```text
Patient-Reported Information
        ↓
Structured Data
        ↓
Medical Knowledge
        ↓
AI Interpretation
        ↓
Safety / Decision Logic
        ↓
User Guidance / Escalation
```

These layers must not be treated as interchangeable.

---

## 2.3 Grounded AI

Healthcare responses should use approved medical knowledge through RAG where applicable.

The LLM should not be treated as the primary source of medical truth.

---

## 2.4 Deterministic Safety Logic

Safety-critical decisions should use explicit, testable rules wherever practical.

The LLM may assist with understanding natural language, but deterministic logic should control defined safety-critical pathways.

---

## 2.5 Offline-First

The architecture should allow selected functions to continue working without connectivity.

Offline capability must be explicitly defined rather than assumed.

---

## 2.6 Low-Bandwidth Aware

The architecture should also support environments where connectivity exists but is slow or unreliable.

The system should minimize:

* Payload size
* Repeated requests
* Image size
* Unnecessary synchronization
* Large client-side dependencies

---

## 2.7 Modular Architecture

Major system responsibilities should remain independently replaceable.

For example:

```text
LLM
OCR
Speech Model
Embedding Model
Database
Notification Provider
```

should be replaceable without rewriting the entire application.

---

# 3. High-Level System Context

```text
                         ┌───────────────────────┐
                         │   Medical Knowledge   │
                         │       Sources         │
                         └───────────┬───────────┘
                                     │
                                     ↓
                            ┌─────────────────┐
                            │ Knowledge/RAG   │
                            │     System      │
                            └────────┬────────┘
                                     │
                                     │
┌──────────────┐              ┌──────▼───────────┐
│              │              │                  │
│   Patient    │◄────────────►│  MedGuide AI     │
│              │              │    Platform      │
└──────────────┘              │                  │
                              └──────┬───────────┘
                                     │
                                     ↓
                              ┌───────────────┐
                              │  Healthcare   │
                              │    Worker     │
                              └───────────────┘
```

External systems such as maps, notification services, and optional cloud AI services shall only be introduced when required and approved.

---

# 4. System Containers

The platform is logically divided into the following major containers:

```text
MedGuide AI
│
├── Patient Client
├── Healthcare Worker Dashboard
├── Backend API
├── Authentication & Authorization
├── Patient Management
├── Healthcare Services
├── AI Gateway
├── RAG Engine
├── Triage Engine
├── OCR Service
├── Speech Service
├── Medication Service
├── Notification Service
├── Offline/Sync Engine
├── Knowledge Management
├── PostgreSQL Database
├── Vector Store
├── File/Object Storage
└── Observability & Audit
```

---

# 5. Client Architecture

## 5.1 Patient Client

The patient application is intended to provide a simple interface suitable for users with varying levels of digital literacy.

The preferred initial direction is:

**Next.js + TypeScript + Tailwind CSS**

The client should be designed as a responsive web application/PWA unless a later architecture decision changes this.

---

## 5.2 Patient Client Responsibilities

The client handles:

* Authentication UI
* Consent UI
* Profile
* Health queries
* Symptom input
* Voice input
* Prescription upload
* Medication schedule
* Reminders
* Health timeline
* Offline cache
* Synchronization queue
* Language selection
* Notifications where supported

The client must not contain sensitive business rules that should be enforced by the backend.

---

# 6. Healthcare Worker Dashboard

The healthcare-worker interface provides controlled access to authorized patient information.

Responsibilities:

* Authentication
* Patient list
* Patient search within authorization limits
* Patient profile
* Symptom review
* Medication review
* Health timeline
* AI-generated summary
* Alerts
* Follow-up management

The dashboard must clearly distinguish:

**Recorded patient information**

from

**AI-generated information.**

---

# 7. Backend Architecture

The backend will initially use:

**Python + FastAPI**

The backend acts as the central application layer between clients, AI services, databases, and external services.

Conceptually:

```text
Client
   ↓
API Gateway / FastAPI
   ↓
Authentication
   ↓
Authorization
   ↓
Application Services
   ↓
Data / AI Services
```

---

# 8. Backend Service Layers

## 8.1 API Layer

Responsible for:

* HTTP requests
* Authentication handling
* Request validation
* Response schemas
* HTTP status codes
* API versioning

---

## 8.2 Application Layer

Responsible for business workflows.

Examples:

* Patient management
* Medication management
* Prescription processing
* Health timeline
* Follow-ups
* Consent

---

## 8.3 Domain/Safety Layer

Responsible for rules that should not depend on the LLM.

Examples:

* Red-flag rules
* Permission checks
* Medication schedule validation
* Consent enforcement
* Data-access rules

---

## 8.4 AI Gateway

The AI Gateway acts as a controlled boundary between application services and AI models.

```text
Application
     ↓
AI Gateway
     ↓
┌────┼─────────┐
↓    ↓         ↓
LLM  Embedding Speech/OCR
```

The gateway should centralize:

* Model configuration
* Prompt management
* AI request validation
* Model selection
* Fallback behavior
* Logging/metrics
* Safety controls

---

# 9. AI Health Companion Architecture

The general AI pipeline is:

```text
User Input
    ↓
Input Validation
    ↓
Language Detection / Selection
    ↓
Intent & Information Extraction
    ↓
Safety Pre-check
    ↓
Knowledge Retrieval
    ↓
Context Construction
    ↓
LLM Generation
    ↓
Safety/Post-processing
    ↓
Response
    ↓
Escalation if Required
```

The exact model used at each stage remains:

**TBD — Model Evaluation Phase**

---

# 10. Symptom Processing Architecture

Symptom processing should separate language understanding from safety decision-making.

```text
Patient Input
     ↓
Text / Speech
     ↓
Speech-to-Text if required
     ↓
Symptom Extraction
     ↓
Structured Symptoms
     ↓
Validated Triage Rules
     ↓
Risk Category
     ↓
Guidance / Escalation
```

The system should not directly map:

```text
Free Text → LLM → Diagnosis
```

---

# 11. Triage Engine

The Triage Engine is responsible for evaluating predefined safety conditions.

Conceptually:

```text
Structured Symptoms
       ↓
Rule Evaluation
       ↓
┌──────┼───────────────┐
↓      ↓               ↓
Low   Urgent       Emergency
Risk   Risk           Risk
↓      ↓               ↓
Guidance  Professional  Emergency
          Attention     Guidance
```

The exact clinical rules must be based on approved medical sources.

The Triage Engine must be independently testable without requiring the LLM.

---

# 12. RAG Architecture

The RAG system consists of two major pipelines.

## 12.1 Knowledge Ingestion

```text
Approved Medical Source
        ↓
Document Validation
        ↓
Metadata Extraction
        ↓
Cleaning
        ↓
Chunking
        ↓
Embedding
        ↓
Vector Storage
```

---

## 12.2 Query Pipeline

```text
User Query
    ↓
Query Processing
    ↓
Embedding
    ↓
Vector Search
    ↓
Top-K Relevant Chunks
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

# 13. Knowledge Base Architecture

The knowledge base should contain only approved sources.

Each document should maintain metadata such as:

```text
source
publisher
title
publication_date
version
language
topic
license
review_status
last_reviewed
```

Possible statuses:

```text
PENDING_REVIEW
APPROVED
OUTDATED
ARCHIVED
```

Unverified sources must not enter the production retrieval corpus.

---

# 14. RAG Safety Boundary

Retrieved documents are treated as **knowledge**, not system instructions.

The system must not allow retrieved content to override:

* System safety rules
* Developer/application rules
* Authorization rules
* Triage safety logic

This protects against malicious or contaminated documents.

---

# 15. RAG Failure Handling

If no sufficiently relevant knowledge is retrieved:

```text
Query
 ↓
Retrieval
 ↓
Insufficient Evidence
 ↓
Safe Response
```

The system must not pretend that evidence was retrieved.

It should communicate the limitation and recommend appropriate professional assistance where relevant.

---

# 16. Prescription OCR Architecture

```text
Prescription Image
       ↓
Upload Validation
       ↓
Image Preprocessing
       ↓
OCR
       ↓
Raw Text
       ↓
Medicine Information Extraction
       ↓
Confidence / Validation
       ↓
Patient Verification
       ↓
Structured Prescription
```

The system must not automatically trust OCR output.

---

# 17. Prescription Security

Uploaded prescription files shall be treated as untrusted input.

The system should apply:

* File-type validation
* File-size limits
* Image validation
* Secure filenames
* Access control
* Secure storage
* Safe processing
* Appropriate deletion/retention policies

The exact malware-scanning strategy will depend on deployment architecture.

---

# 18. Speech Processing Architecture

```text
User Speech
     ↓
Audio Validation
     ↓
Speech-to-Text
     ↓
Transcript
     ↓
User Verification where appropriate
     ↓
Healthcare AI Pipeline
```

The speech system must support only languages that have been evaluated.

---

# 19. Multilingual Architecture

The system should maintain language-aware processing.

Conceptually:

```text
Input Language
      ↓
Language Processing
      ↓
Healthcare Intent/Symptom Understanding
      ↓
Knowledge Retrieval
      ↓
Response Generation
      ↓
Target Language
```

The system should avoid unnecessary translation chains where they materially reduce medical accuracy.

Final language/model architecture will be determined during model evaluation.

---

# 20. Medication Architecture

Medication workflow:

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
Adherence Record
       ↓
Health Timeline
```

Medication schedules must not be generated automatically from uncertain OCR.

---

# 21. Notification Architecture

The Notification Service is responsible for:

* Medication reminders
* Approved healthcare alerts
* Follow-up notifications where supported

Notification delivery should be separated from core medication records.

The system must distinguish:

```text
Reminder Scheduled
```

from:

```text
Reminder Delivered
```

when delivery confirmation is available.

The initial notification mechanism remains:

**TBD — Pre-Development Decision / Implementation Evaluation**

Free/local mechanisms should be prioritized.

---

# 22. Health Timeline Architecture

The timeline should be event-oriented.

Possible events:

```text
SYMPTOM_REPORTED
AI_INTERACTION
PRESCRIPTION_ADDED
MEDICATION_CREATED
MEDICATION_TAKEN
ALERT_CREATED
FOLLOW_UP_CREATED
FOLLOW_UP_COMPLETED
```

Where possible, important health events should be represented as timestamped records rather than repeatedly overwriting historical information.

---

# 23. Offline-First Architecture

The offline architecture consists of:

```text
                 ┌─────────────────┐
                 │ Local Storage   │
                 └────────┬────────┘
                          │
                    Offline Actions
                          │
                          ↓
                 ┌─────────────────┐
                 │ Sync Queue      │
                 └────────┬────────┘
                          │
                   Connectivity
                       Restored
                          │
                          ↓
                 ┌─────────────────┐
                 │ Backend API     │
                 └─────────────────┘
```

---

# 24. Offline Data Categories

Potentially cached locally:

* Basic profile information
* Health timeline
* Medication schedules
* Reminder schedules
* Selected health information
* Basic symptom rules
* Pending operations

Sensitive information stored locally must be protected appropriately.

---

# 25. Synchronization

Synchronization should support:

* Queueing
* Retry
* Idempotency
* Duplicate prevention
* Conflict detection
* Failure reporting

Health events should preferably use append-oriented records where appropriate.

The exact conflict-resolution strategy will be finalized during database design.

---

# 26. Low-Bandwidth Strategy

The system should optimize for slow networks through:

* Compressed images
* Small API responses
* Pagination
* Caching
* Lazy loading
* Reduced repeated requests
* Efficient synchronization
* Retry with backoff

The application should distinguish between:

**Offline**

and

**Online but low bandwidth.**

---

# 27. Database Architecture

The initial database direction is:

**PostgreSQL**

Potential vector-storage solution:

**pgvector**

The database will likely contain logical domains such as:

```text
Identity
Consent
Patient
Healthcare Worker
Symptoms
Prescriptions
Medications
Adherence
Timeline
Alerts
Follow-Ups
Knowledge Metadata
Audit
```

Exact tables and relationships are:

**TBD — Database Design Phase**

No database schema is locked by this document.

---

# 28. Vector Storage

Medical knowledge embeddings may be stored using PostgreSQL + pgvector if benchmarking confirms suitability.

Conceptually:

```text
Medical Document
      ↓
Chunk
      ↓
Embedding
      ↓
pgvector
```

Metadata should remain associated with each chunk.

---

# 29. File Storage

Prescription images and other permitted files should not be stored directly inside relational database fields unless there is a clear reason.

The preferred approach is:

```text
File
 ↓
Secure Object/File Storage
 ↓
Database stores metadata/reference
```

The exact storage mechanism will be finalized based on free-resource availability and deployment requirements.

---

# 30. Authentication Architecture

Conceptually:

```text
Client
  ↓
Authentication API
  ↓
Credential Verification
  ↓
Session / Token
  ↓
Authenticated Request
  ↓
Authorization
  ↓
Resource Access
```

Authentication and authorization must remain separate concepts.

---

# 31. Authorization Architecture

Every sensitive backend operation should evaluate:

```text
Who is the user?
        ↓
What role do they have?
        ↓
What resource are they requesting?
        ↓
Are they authorized?
        ↓
Allow / Deny
```

Frontend restrictions alone are insufficient.

Authorization must be enforced server-side.

---

# 32. Consent Boundary

Consent must influence applicable data access and processing.

Conceptually:

```text
Patient
   ↓
Consent
   ↓
Permitted Processing
   ↓
Permitted Healthcare-Worker Access
```

Consent must not be treated as merely a UI checkbox.

---

# 33. Audit Architecture

Important sensitive operations should generate audit events.

Potential examples:

```text
LOGIN
PATIENT_VIEWED
PATIENT_DATA_ACCESSED
CONSENT_CHANGED
PRESCRIPTION_ACCESSED
FOLLOWUP_CREATED
ALERT_VIEWED
ADMIN_ACTION
```

Audit logs must avoid unnecessary sensitive content.

---

# 34. Security Architecture

Major security boundaries:

```text
Internet
   ↓
Frontend
   ↓
Backend API
   ↓
Authentication / Authorization
   ↓
Application Services
   ↓
Database / AI / Storage
```

AI systems should not receive unrestricted direct access to the database.

The application should control what information is passed into AI components.

---

# 35. AI Data Access Boundary

The LLM should not directly query the production database.

Preferred flow:

```text
Database
   ↓
Authorized Application Service
   ↓
Relevant Structured Data
   ↓
AI Gateway
   ↓
LLM
```

This reduces unnecessary exposure of sensitive patient information.

---

# 36. Patient Data to AI

Only the minimum information required for the AI task should be provided.

For example, a medication explanation should not require the complete patient history.

The system should apply:

**Minimum Necessary Data Principle**

where technically practical.

---

# 37. Prompt Injection Protection

User input and retrieved documents must be treated as untrusted content.

The system should maintain:

```text
System Safety Rules
        ↓
Application Instructions
        ↓
Retrieved Medical Context
        ↓
User Input
```

User input or retrieved text must not be able to override safety controls.

---

# 38. RAG Poisoning Protection

Medical documents must pass through:

```text
Source Validation
      ↓
Metadata Validation
      ↓
Review
      ↓
Approval
      ↓
Ingestion
```

The system must not allow arbitrary user-provided documents to become trusted medical knowledge.

---

# 39. Model Architecture

The final model architecture remains open.

Potential components:

```text
LLM
Embedding Model
Speech Model
OCR Model
Optional Classifier
Optional Translation Model
```

Each model shall be selected through:

* Accuracy
* Safety
* Language support
* Hardware requirements
* Latency
* License
* Free/local availability
* Reproducibility

---

# 40. Model Abstraction

AI components should be accessed through interfaces rather than tightly coupling the application to one model.

Conceptually:

```text
AI Gateway
   │
   ├── LLM Provider
   ├── Embedding Provider
   ├── Speech Provider
   └── OCR Provider
```

This allows model replacement without major application changes.

---

# 41. AI Failure Handling

If an AI model fails:

```text
Primary AI
    ↓ failure
Approved fallback
    ↓ failure
Safe non-AI response
```

The system must never respond with fabricated medical content simply because the AI service failed.

The exact fallback hierarchy is:

**TBD — Model Evaluation Phase**

---

# 42. External Services

Potential external services include:

* Map/geolocation provider
* Notification provider
* Optional cloud AI inference
* Optional speech service

Each external service requires evaluation of:

* Cost
* Free tier
* Rate limits
* Privacy
* Reliability
* Vendor lock-in
* Open-source alternative

External dependencies must not become mandatory without approval.

---

# 43. API Architecture

The API will use REST principles initially.

Preferred versioning approach:

```text
/api/v1/
```

Potential logical API groups:

```text
/api/v1/auth
/api/v1/patients
/api/v1/consent
/api/v1/symptoms
/api/v1/ai
/api/v1/prescriptions
/api/v1/medications
/api/v1/timeline
/api/v1/alerts
/api/v1/followups
/api/v1/healthcare-workers
/api/v1/knowledge
```

These are logical groupings only.

Final endpoints will be defined in:

`docs/api/API_SPECIFICATION.md`

---

# 44. API Boundary Rule

The frontend must not directly access:

* Database
* LLM
* Vector database
* Internal services
* Private storage

unless an explicitly approved architecture requires it.

The backend acts as the controlled application boundary.

---

# 45. Error Architecture

Errors should be classified consistently.

Conceptually:

```text
Validation Error
Authentication Error
Authorization Error
Not Found
Conflict
Processing Error
External Service Error
AI Service Error
Internal Server Error
```

Healthcare-specific failures should provide safe user-facing responses.

---

# 46. Observability

The system should eventually monitor:

### Application

* API latency
* Error rate
* Request volume
* Database errors

### AI

* Model latency
* Token/resource usage where available
* Retrieval failures
* Safety failures
* AI fallback events

### OCR

* Processing failures
* Low-confidence results

### Speech

* Recognition failures

### Offline

* Queue size
* Synchronization failures
* Retry count

Logs must remain privacy-conscious.

---

# 47. Backup and Recovery

The deployed database should have a documented backup and restoration strategy appropriate to the project environment.

At minimum:

```text
Database
   ↓
Backup
   ↓
Recovery Procedure
   ↓
Verification
```

No backup strategy should be described as production-grade unless it has actually been implemented and tested.

---

# 48. Deployment Architecture

The preferred deployment model is:

```text
                 Internet
                    │
        ┌───────────┴───────────┐
        ↓                       ↓
   Frontend                  Backend
   Hosting                   Hosting
                                │
                     ┌──────────┼──────────┐
                     ↓          ↓          ↓
                  Database     AI        Storage
```

The exact free deployment providers will be selected after checking current availability, limits, and suitability.

---

# 49. Local Development Architecture

Developers should be able to run the core system locally where practical.

Conceptually:

```text
Browser
   ↓
Frontend
   ↓
FastAPI
   ↓
PostgreSQL
   ↓
AI Services
```

Docker may be used to simplify local environment setup.

---

# 50. Development Environment

Initial technology direction:

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI

### Database

* PostgreSQL
* pgvector

### AI/ML

* PyTorch
* Hugging Face
* Sentence Transformers
* Evaluated open-source models

### OCR

* Tesseract or PaddleOCR

### Speech

* Whisper or evaluated alternative

### Testing

* Pytest
* API testing tools
* Frontend testing tools to be selected during implementation

### Development

* Git
* GitHub
* VS Code
* Docker
* Google Colab where useful

These technologies remain subject to feasibility and model evaluation.

---

# 51. Deployment Constraint

The system must not depend on infrastructure that is unavailable under the project's free-resource constraint without explicit approval.

Before deployment, verify:

* Free-tier availability
* Resource limits
* Storage limits
* Runtime limitations
* Database limits
* API limits
* Model inference constraints

---

# 52. Architecture Decision Records

Major architecture decisions should be recorded separately under:

```text
docs/architecture/decisions/
```

Each decision should document:

```text
Decision
Context
Options
Evaluation
Chosen Approach
Reason
Trade-offs
Consequences
```

Example:

```text
ADR-001 — Select Database
ADR-002 — Select LLM
ADR-003 — Select Embedding Model
ADR-004 — Select OCR Engine
ADR-005 — Select Speech Model
```

---

# 53. Architecture Quality Attributes

The architecture shall be evaluated against:

| Attribute                | Goal                                       |
| ------------------------ | ------------------------------------------ |
| Safety                   | High                                       |
| Security                 | High                                       |
| Privacy                  | High                                       |
| Reliability              | High                                       |
| Maintainability          | High                                       |
| Usability                | High                                       |
| Accessibility            | High                                       |
| Performance              | Appropriate to student/free infrastructure |
| Scalability              | Modular/future-ready                       |
| Portability              | Strong                                     |
| Cost                     | Free-first                                 |
| Research Reproducibility | High                                       |

---

# 54. Architecture Boundaries

The architecture intentionally leaves the following decisions open:

* Exact LLM
* Exact embedding model
* Exact speech model
* Exact OCR engine
* Exact target languages
* Exact notification provider
* Exact map provider
* Exact deployment provider
* Exact database schema
* Exact API endpoints
* Exact offline model
* Exact performance targets

These must be resolved through documented design/evaluation rather than assumptions.

---

# 55. Architecture Completion Criteria

The architecture phase will be considered complete when:

* System context is defined.
* Major components are defined.
* Component responsibilities are clear.
* AI pipeline is defined.
* RAG pipeline is defined.
* OCR pipeline is defined.
* Speech pipeline is defined.
* Triage architecture is defined.
* Offline architecture is defined.
* Synchronization principles are defined.
* Security boundaries are defined.
* Data-access boundaries are defined.
* Deployment approach is defined.
* Major unresolved decisions are explicitly documented.
* No component has undefined responsibility.
* No safety-critical function relies solely on an unconstrained LLM.

---

# 56. Final Architecture

The conceptual architecture is:

```text
┌───────────────────────────────────────────────────────────────┐
│                         USERS                                 │
│                                                               │
│  ┌─────────────────┐                    ┌──────────────────┐  │
│  │ Patient Client  │                    │ Healthcare       │  │
│  │                 │                    │ Worker Dashboard │  │
│  └────────┬────────┘                    └─────────┬────────┘  │
│           │                                       │           │
└───────────┼───────────────────────────────────────┼───────────┘
            │                                       │
            └──────────────────┬────────────────────┘
                               ↓
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ↓                 ↓                  ↓
      ┌────────────┐    ┌─────────────┐    ┌─────────────┐
      │ Auth/RBAC  │    │ Application │    │ AI Gateway  │
      │ + Consent  │    │  Services   │    │             │
      └────────────┘    └──────┬──────┘    └──────┬──────┘
                                │                  │
                ┌───────────────┼──────────┐       │
                │               │          │       │
                ↓               ↓          ↓       ↓
          ┌──────────┐    ┌──────────┐ ┌────────┐ ┌─────────┐
          │Medication│    │ Timeline │ │Triage  │ │  LLM    │
          │  Service │    │ Service  │ │Engine  │ │  + RAG  │
          └──────────┘    └──────────┘ └────────┘ └────┬────┘
                                                       │
                              ┌────────────────────────┼──────┐
                              │                        │      │
                              ↓                        ↓      ↓
                         ┌─────────┐             ┌────────┐ ┌──────┐
                         │Postgres │             │Vector  │ │ OCR/ │
                         │         │             │ Store  │ │Speech│
                         └─────────┘             └────────┘ └──────┘
                              │
                              ↓
                         ┌──────────┐
                         │ Audit /  │
                         │ Logging  │
                         └──────────┘
```

---

# 57. Architectural Golden Rule

The MedGuide AI architecture must preserve this fundamental boundary:

```text
                AI
                 │
        ┌────────┴────────┐
        │                 │
   Understand          Assist
        │                 │
        └────────┬────────┘
                 ↓
          Safety Layer
                 ↓
       Deterministic Rules
                 ↓
      Escalation / Guidance
                 ↓
       Healthcare Professional
```

**The AI assists the healthcare process; it does not replace the healthcare professional.**
