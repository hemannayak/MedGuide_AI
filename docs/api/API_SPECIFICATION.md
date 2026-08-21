# MedGuide AI — API Specification

**Document:** API Specification
**Version:** 2.0
**Status:** Development Baseline — Synchronized with Project Architecture
**API Style:** REST
**Base Path:** `/api/v1`
**Backend:** FastAPI + Python 3.12
**Database:** PostgreSQL + pgvector
**Authentication:** JWT Bearer Token
**Primary Languages:** English + Hindi + Telugu
**Primary Deployment Model:** Local-first with controlled online AI services

---

# 1. Purpose

This document defines the backend API contract for MedGuide AI.

The API provides the controlled interface between:

```text
Patient / Healthcare Worker PWA
             │
             ▼
        FastAPI Backend
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
  Core Services   AI Gateway
       │           │
       │      ┌────┼───────────────┐
       │      │    │               │
       ▼      ▼    ▼               ▼
 PostgreSQL  LLM  RAG      Speech/OCR Services
 + pgvector
```

The frontend must **never directly access**:

* PostgreSQL
* pgvector
* Ollama
* Sarvam APIs
* embedding models
* OCR engines
* internal AI prompts
* deterministic triage rules

All such operations are controlled through the backend.

---

# 2. API Design Principles

The API follows these principles:

1. REST-oriented resource design.
2. Versioned API paths.
3. Authentication before protected operations.
4. Server-side authorization.
5. Input validation using Pydantic.
6. Consistent response envelopes.
7. Consistent error responses.
8. Minimum necessary health information exposure.
9. Deterministic safety rules remain outside the LLM.
10. AI requests pass through the AI Gateway.
11. The frontend never communicates directly with an LLM.
12. The frontend never communicates directly with Sarvam.
13. Offline operations use idempotent client operation IDs.
14. Patient data remains isolated from the global medical RAG corpus.
15. OCR output cannot automatically become verified medication data.
16. AI responses must distinguish evidence-grounded information from limitations.
17. Unsupported medical claims must not be generated as a fallback.
18. Online provider failure must degrade safely.
19. API logs must avoid unnecessary sensitive health information.
20. Every important operation must be traceable.

---

# 3. Base URL

### Development

```text
http://localhost:8000/api/v1
```

### Production

```text
https://<BACKEND-DOMAIN>/api/v1
```

The production URL must be configured through environment variables and must not be hard-coded into the frontend.

---

# 4. Authentication

Protected endpoints use:

```http
Authorization: Bearer <JWT>
```

Example:

```http
Authorization: Bearer eyJhbGciOi...
```

JWT claims should contain the minimum information required for authentication and authorization.

Sensitive health information must never be stored inside JWT claims.

---

# 5. Roles

The API supports:

| Role                | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `PATIENT`           | Access personal healthcare-support functionality     |
| `HEALTHCARE_WORKER` | Access authorized patient information and follow-ups |
| `ADMIN`             | Approved system administration and governance        |

Authorization is enforced **server-side**.

Frontend route protection alone is not considered sufficient security.

---

# 6. Standard Response Format

Successful responses should use:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully."
}
```

Where pagination is required:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100
  },
  "message": "Records retrieved successfully."
}
```

---

# 7. Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message.",
    "details": {}
  }
}
```

The API must never expose:

* stack traces
* database credentials
* JWT secrets
* internal filesystem paths
* internal prompts
* raw provider credentials
* unnecessary patient information

---

# 8. HTTP Status Codes

| Status | Meaning                                    |
| ------ | ------------------------------------------ |
| `200`  | Successful request                         |
| `201`  | Resource created                           |
| `202`  | Accepted for processing                    |
| `204`  | Successful operation without response body |
| `400`  | Invalid request                            |
| `401`  | Authentication required/failed             |
| `403`  | Insufficient permissions                   |
| `404`  | Resource not found                         |
| `409`  | Conflict                                   |
| `413`  | Payload/file too large                     |
| `422`  | Validation failure                         |
| `429`  | Rate limit exceeded                        |
| `500`  | Internal server error                      |
| `502`  | External/AI provider failure               |
| `503`  | Service temporarily unavailable            |

---

# 9. API Route Map

```text
/api/v1
│
├── /health
│
├── /auth
│   ├── /register
│   ├── /login
│   ├── /logout
│   └── /me
│
├── /consent
│
├── /patients
│   └── /me
│
├── /symptoms
│   ├── POST /
│   └── POST /analyze
│
├── /ai
│   ├── /chat
│   ├── /speech/transcribe
│   └── /speech/synthesize
│
├── /conversations
│
├── /prescriptions
│
├── /medications
│
├── /medication-schedules
│
├── /timeline
│
├── /alerts
│
├── /healthcare-workers
│
├── /follow-ups
│
├── /knowledge
│
├── /sync
│
└── /admin
    ├── /audit-logs
    └── /pipeline-logs
```

---

# 10. Health Check

## `GET /health`

Purpose:

* Verify backend availability.
* Verify critical infrastructure status.
* Support local development and deployment monitoring.

Example:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "healthy",
    "version": "0.1.0"
  }
}
```

The health endpoint must not expose secrets or detailed infrastructure information.

---

# 11. Authentication APIs

## 11.1 `POST /auth/register`

Creates a new account.

### Request

```json
{
  "full_name": "Rajesh Kumar",
  "email_or_phone": "rajesh@example.com",
  "password": "SecurePassword123!",
  "role": "PATIENT",
  "preferred_language": "hi"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "<JWT>",
    "token_type": "Bearer",
    "user": {
      "id": "uuid",
      "role": "PATIENT",
      "preferred_language": "hi"
    }
  }
}
```

Passwords must be securely hashed.

---

## 11.2 `POST /auth/login`

Authenticates a user.

### Request

```json
{
  "email_or_phone": "rajesh@example.com",
  "password": "SecurePassword123!"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "<JWT>",
    "token_type": "Bearer",
    "user": {
      "id": "uuid",
      "role": "PATIENT",
      "preferred_language": "hi"
    }
  }
}
```

---

## 11.3 `POST /auth/logout`

Invalidates or otherwise handles session termination according to the selected JWT/session strategy.

---

## 11.4 `GET /auth/me`

Returns the authenticated user's basic account information.

---

# 12. Consent APIs

## `GET /consent`

Returns the authenticated patient's consent status.

## `POST /consent`

Records explicit consent.

Example:

```json
{
  "consent_type": "HEALTHCARE_SUPPORT",
  "policy_version": "2.0",
  "granted": true
}
```

## `PATCH /consent/{consent_id}`

Updates or withdraws consent.

Consent changes must be auditable.

---

# 13. Patient Profile APIs

## `GET /patients/me`

Returns the authenticated patient's profile.

## `PATCH /patients/me`

Updates profile information.

Example:

```json
{
  "preferred_language": "te",
  "age": 42,
  "village_or_town": "Example Village"
}
```

The API must avoid collecting unnecessary personal information.

---

# 14. Preliminary Symptom Checker

The **Preliminary Symptom Checker is the primary patient-facing workflow after sign-in.**

The design goal is simplicity for rural and low-digital-literacy users.

The API therefore supports structured symptom information while allowing natural-language input.

---

## 14.1 `POST /symptoms`

Records a patient-reported symptom event.

### Request

```json
{
  "input_text": "I have fever and headache from two days",
  "language": "en",
  "source": "TEXT"
}
```

Voice-derived input may use:

```json
{
  "input_text": "నాకు రెండు రోజులుగా జ్వరం మరియు తలనొప్పి ఉంది",
  "language": "te",
  "source": "VOICE"
}
```

The input is considered **patient-reported information**, not clinical truth.

---

# 15. Symptom Analysis & Triage

## `POST /symptoms/analyze`

Runs the symptom-processing pipeline.

### Processing

```text
Patient Input
     ↓
Input Validation
     ↓
Symptom Extraction
     ↓
Structured Representation
     ↓
Deterministic Red-Flag Rules
     ↓
Risk Classification
     ↓
Guidance / Escalation
```

### Risk Levels

```text
ROUTINE
URGENT
EMERGENCY
```

The LLM must **not independently determine emergency status**.

---

## Emergency Example

```json
{
  "success": true,
  "data": {
    "risk_level": "EMERGENCY",
    "red_flags_detected": [
      "SEVERE_CHEST_PAIN"
    ],
    "recommended_action": "Seek immediate emergency medical care.",
    "emergency_numbers": [
      "108",
      "112"
    ],
    "escalation_required": true
  }
}
```

The system should present clear emergency guidance rather than attempting autonomous diagnosis.

---

# 16. AI Gateway

All AI operations must pass through the **AI Gateway**.

The frontend must never directly call:

```text
Ollama
Sarvam
OpenAI
Gemini
Claude
local OCR engines
local speech models
```

The API layer communicates with the AI Gateway, which selects the appropriate provider.

---

# 17. AI Provider Separation

The project intentionally separates AI responsibilities.

```text
                    AI GATEWAY
                        │
        ┌───────────────┼──────────────────┐
        │               │                  │
        ▼               ▼                  ▼
   LOCAL LLM       ONLINE SERVICES     LOCAL FALLBACKS
   Ollama          Sarvam AI           Evaluated models
        │               │
        │          ┌────┼─────┐
        │          ▼    ▼     ▼
        │         STT  TTS   OCR
        │
        ▼
 RAG-grounded generation
```

### Ollama

Ollama is the **local LLM runtime**.

It is used for tasks such as:

* healthcare-support response generation
* explanation
* summarization
* multilingual response generation
* RAG-grounded language generation

The exact LLM is **not permanently fixed** until benchmarking.

Candidate models may include Qwen, Gemma, and other evaluated local models.

### Sarvam AI

Sarvam is an **online specialized Indian-language AI provider**.

It may be used for:

* Speech-to-Text
* Text-to-Speech
* Prescription/document OCR where suitable
* Other evaluated Indian-language processing capabilities

Sarvam is **not the project's mandatory LLM reasoning engine**.

### Important Offline Boundary

If internet connectivity is unavailable:

```text
Sarvam online services
        ↓
      UNAVAILABLE
```

The system must use an evaluated local alternative where one exists.

Core offline functionality must not depend on Sarvam.

---

# 18. AI Health Companion

## `POST /ai/chat`

Processes a patient health question.

### Request

```json
{
  "message": "What should I do if I have a fever?",
  "language": "en",
  "conversation_id": "uuid"
}
```

---

# 19. AI Chat Processing Pipeline

```text
User Query
    ↓
Input Validation
    ↓
Safety / Red-Flag Precheck
    ↓
Query Understanding
    ↓
RAG Retrieval
    ↓
Evidence Sufficiency Gate
    │
    ├── Insufficient Evidence
    │       ↓
    │   Safe Limitation
    │
    └── Sufficient Evidence
            ↓
       Ollama / Selected LLM
            ↓
       Safety Validation
            ↓
       Citation Attachment
            ↓
       Response
```

---

# 20. RAG Evidence Rule

The LLM must not be presented with the assumption that every medical question has sufficient evidence.

The API must distinguish:

```text
GROUNDED
INSUFFICIENT_EVIDENCE
SAFE_REFUSAL
EMERGENCY_ESCALATION
```

If the evidence gate determines that the knowledge base does not contain sufficient information, the system must not fabricate an answer.

---

# 21. AI Chat Response

Example:

```json
{
  "success": true,
  "data": {
    "conversation_id": "uuid",
    "response_type": "HEALTH_GUIDANCE",
    "message": "Fever can have several causes. Monitor your temperature and drink enough fluids.",
    "language": "en",
    "red_flags": [],
    "evidence_status": "GROUNDED",
    "sources": [
      {
        "title": "Approved Medical Guideline",
        "publisher": "WHO",
        "publication_date": "2024"
      }
    ],
    "disclaimer": "This information is for health guidance and does not provide a medical diagnosis."
  }
}
```

---

# 22. AI Safety Requirements

The AI API must prevent:

* definitive diagnosis
* autonomous prescribing
* unsupported medication dosage
* fabricated medical citations
* fabricated clinical rules
* unsafe treatment changes
* false certainty

AI output must remain distinguishable from deterministic system decisions.

---

# 23. Conversation APIs

## `GET /conversations`

Lists authorized patient conversations.

## `GET /conversations/{id}`

Returns an individual conversation.

## `DELETE /conversations/{id}`

Deletes a conversation where permitted by the retention policy.

Raw conversations should not be retained indefinitely without a defined purpose.

Health-relevant structured information may be retained for continuity of care.

---

# 24. Speech-to-Text

## `POST /ai/speech/transcribe`

Accepts an audio file.

### Request

```text
multipart/form-data
audio=<file>
language=hi
```

### Provider routing

```text
Speech Input
     ↓
AI Gateway
     ↓
Online?
 ┌───┴────┐
 YES      NO
 │         │
Sarvam    Local
STT       STT
```

The selected provider must be recorded in processing metadata.

### Response

```json
{
  "success": true,
  "data": {
    "transcript": "मुझे दो दिन से बुखार है",
    "language": "hi",
    "provider": "sarvam",
    "confidence": 0.91
  }
}
```

Confidence values must only be returned when the underlying provider supports a meaningful confidence estimate.

---

# 25. Text-to-Speech

## `POST /ai/speech/synthesize`

Converts generated text to speech.

### Request

```json
{
  "text": "Please drink enough fluids.",
  "language": "en"
}
```

### Provider routing

```text
Text Response
     ↓
AI Gateway
     ↓
Online?
 ┌───┴────┐
 YES      NO
 │         │
Sarvam    Local TTS
TTS       fallback
```

Sarvam is preferred for evaluated Indian-language voice quality when online.

---

# 26. Multilingual Support

Phase 1 languages:

```text
English
Hindi
Telugu
```

Language support must be evaluated independently.

A language must not be advertised as fully supported merely because a model technically accepts the language.

Evaluation should cover:

* text understanding
* generation
* medical terminology
* code-mixing
* STT
* TTS
* OCR where applicable
* safety behavior

---

# 27. Prescription Upload

## `POST /prescriptions`

Accepts a prescription image.

### Requirements

* authenticated user
* authorized ownership
* allowed image formats
* file-size limit
* image validation
* safe storage
* randomized storage reference
* checksum generation

---

# 28. Prescription OCR

## `POST /prescriptions/{id}/ocr`

Runs OCR processing.

### Provider routing

```text
Prescription Image
       ↓
Preprocessing
       ↓
AI Gateway
       ↓
Online?
 ┌─────┴──────┐
 YES          NO
 │             │
Sarvam OCR   Local OCR
             fallback
```

Candidate local OCR engines must be evaluated before being designated as the offline fallback.

---

# 29. OCR Response

```json
{
  "success": true,
  "data": {
    "prescription_id": "uuid",
    "status": "REQUIRES_REVIEW",
    "provider": "sarvam",
    "raw_text": "...",
    "confidence": 0.87
  }
}
```

OCR output is **unverified information**.

---

# 30. Prescription Verification

## `POST /prescriptions/{id}/verify`

The user or authorized healthcare worker verifies extracted information.

Mandatory workflow:

```text
Image
 ↓
OCR
 ↓
Extraction
 ↓
Confidence
 ↓
Human Verification
 ↓
Verified Medication
 ↓
Schedule
```

The API must never silently convert OCR output into an active medication schedule.

---

# 31. Medication APIs

## `POST /medications`

Creates a medication only after the required verification workflow.

## `GET /medications`

Returns the patient's medications.

## `GET /medications/{id}`

Returns a medication.

## `PATCH /medications/{id}`

Updates authorized medication information.

---

# 32. Medication Schedule APIs

## `POST /medications/{id}/schedules`

Creates a medication schedule.

Example:

```json
{
  "frequency": "TWICE_DAILY",
  "start_date": "2026-08-25",
  "end_date": "2026-09-01",
  "timezone": "Asia/Kolkata"
}
```

## `GET /medications/{id}/schedules`

Lists schedules.

## `PATCH /medication-schedules/{id}`

Updates a schedule.

---

# 33. Medication Adherence

## `POST /medication-schedules/{id}/adherence`

Records an adherence event.

Possible values:

```text
TAKEN
MISSED
SKIPPED
UNKNOWN
```

Adherence records should be timestamped events.

---

# 34. Reminder Strategy

The MVP uses:

* PWA notifications where supported
* local scheduling where technically possible

SMS is **not a mandatory dependency**.

---

# 35. Health Timeline

## `GET /timeline`

Returns a patient's chronological health timeline.

Possible events:

```text
SYMPTOM_REPORTED
TRIAGE_COMPLETED
AI_INTERACTION
PRESCRIPTION_ADDED
MEDICATION_VERIFIED
MEDICATION_ADHERENCE
ALERT_CREATED
FOLLOWUP_CREATED
```

---

# 36. Alerts

## `GET /alerts`

Returns authorized patient alerts.

## `GET /alerts/{id}`

Returns a specific alert.

## `PATCH /alerts/{id}`

Updates an alert status where authorized.

Emergency-related alerts must originate from deterministic safety logic.

---

# 37. Healthcare Worker APIs

## `GET /healthcare-workers/patients`

Returns patients the authenticated healthcare worker is authorized to access.

## `GET /healthcare-workers/patients/{id}`

Returns the authorized patient's relevant information.

Access must be audited.

---

# 38. AI-Generated Patient Summary

## `GET /healthcare-workers/patients/{id}/summary`

Provides a structured summary of patient-reported information and relevant system events.

The summary must clearly distinguish:

```text
PATIENT-REPORTED FACT
        ≠
AI-GENERATED SUMMARY
        ≠
CLINICAL DECISION
```

The summary is not a diagnosis.

---

# 39. Follow-Up APIs

## `POST /follow-ups`

Creates a healthcare-worker follow-up.

## `GET /follow-ups`

Lists authorized follow-ups.

## `GET /follow-ups/{id}`

Retrieves a follow-up.

## `PATCH /follow-ups/{id}`

Updates a follow-up.

---

# 40. Medical Knowledge Management

## `POST /knowledge/documents`

Registers a candidate medical document.

## `GET /knowledge/documents`

Lists authorized knowledge documents.

## `GET /knowledge/documents/{id}`

Returns document metadata.

## `POST /knowledge/documents/{id}/approve`

Approves a document for RAG ingestion.

## `POST /knowledge/documents/{id}/ingest`

Processes:

```text
Document
 ↓
Cleaning
 ↓
Chunking
 ↓
Embedding
 ↓
pgvector
```

Only approved documents may enter the production RAG corpus.

---

# 41. Knowledge Source Metadata

Each medical source should maintain:

```text
Source name
Publisher
Title
Publication date
Version
Language
Topic
License / usage information
Review status
Last reviewed date
```

This metadata is required for traceability.

---

# 42. Nearby Healthcare Resources — Phase 2

## `GET /resources/nearby`

This endpoint is **not part of the core MVP**.

It may later provide:

* nearby healthcare facilities
* PHCs
* hospitals
* other approved resources

Implementation requires additional work around:

* location permissions
* geographic data
* rural POI accuracy
* privacy
* data freshness

---

# 43. Offline Synchronization

## `POST /sync`

Synchronizes locally queued operations.

Example:

```json
{
  "operations": [
    {
      "client_operation_id": "device-uuid-operation-001",
      "operation_type": "CREATE",
      "entity_type": "SYMPTOM_RECORD",
      "entity_id": "uuid",
      "payload": {}
    }
  ]
}
```

---

# 44. Sync Processing

```text
Offline Client
      ↓
IndexedDB Queue
      ↓
Connectivity Restored
      ↓
POST /sync
      ↓
Authenticate
      ↓
Validate
      ↓
Check client_operation_id
      ↓
Apply transaction
      ↓
Return status
```

Possible results:

```text
SYNCED
DUPLICATE
FAILED
CONFLICT
```

---

# 45. Offline Conflict Policy

Health events should preferably be immutable timestamped events.

Examples:

```text
Symptom recorded offline
        ↓
Append event

Medication taken offline
        ↓
Append adherence event
```

This avoids destructive conflict resolution.

Profile updates may require a different strategy such as last-write-wins or user resolution.

---

# 46. Audit API

## `GET /admin/audit-logs`

Restricted to authorized administrators.

Auditable operations include:

* patient record access
* patient summary access
* consent changes
* prescription access
* alert review
* follow-up creation
* knowledge-base changes
* administrative actions

Audit logs must avoid storing unnecessary patient content.

---

# 47. AI Pipeline Activity

## `GET /admin/pipeline-logs`

Restricted developer/admin endpoint for system observability.

Possible events:

```text
ASR_STARTED
ASR_COMPLETED
TRIAGE_STARTED
RED_FLAG_DETECTED
RAG_RETRIEVAL
EVIDENCE_GATE
LLM_GENERATION
SAFETY_VALIDATION
TTS_GENERATION
OCR_STARTED
OCR_COMPLETED
PROVIDER_FALLBACK
```

Sensitive patient content must not be exposed through the activity interface.

---

# 48. AI Provider Metadata

For reproducibility, AI processing records should identify:

```text
provider
model
model_version
local_or_online
quantization
prompt_version
embedding_model
knowledge_base_version
latency
status
```

Provider credentials must never be exposed.

---

# 49. Provider Failure Handling

If Sarvam is unavailable:

```text
Sarvam Failure
      ↓
AI Gateway
      ↓
Local evaluated fallback
      ↓
Success
```

If no suitable fallback exists:

```text
Provider Failure
      ↓
Safe unavailable response
```

For LLM generation:

```text
Primary local model
       ↓ failure
Retry
       ↓
Fallback evaluated model
       ↓ failure
Safe non-AI response
```

The system must never replace provider failure with fabricated medical content.

---

# 50. Rate Limiting

Rate limits should be applied to:

* authentication endpoints
* AI requests
* speech requests
* OCR requests
* file uploads
* synchronization
* administrative endpoints

Limits should be configurable through environment settings.

---

# 51. File Upload Security

All uploads require:

* authentication
* authorization
* MIME validation
* file extension validation
* size limits
* image validation
* randomized storage references
* checksum
* restricted access
* safe storage outside public webroot

Malware scanning should be added where practical.

---

# 52. AI Request Security

The API must protect against:

* direct prompt injection
* indirect prompt injection
* RAG poisoning
* malicious retrieved content
* output manipulation
* excessive token requests
* unsafe generation attempts

Retrieved medical content must never override system safety instructions.

---

# 53. Request Validation

Pydantic schemas must validate:

* required fields
* data types
* string lengths
* enum values
* dates
* language codes
* numeric ranges
* file types
* payload sizes

Invalid requests must return `422` where appropriate.

---

# 54. Pagination

Collection endpoints use:

```text
?page=1&page_size=20
```

The server must enforce a maximum page size.

---

# 55. Filtering

Where applicable:

```text
?status=OPEN
```

or:

```text
?from=2026-08-01&to=2026-08-31
```

Filtering must be authorized and scoped to the requesting user.

---

# 56. Sorting

APIs returning chronological data should use deterministic ordering.

Example:

```text
event_time DESC
```

---

# 57. Idempotency

Operations that may be retried must support idempotency.

This is especially important for:

* offline synchronization
* medication adherence
* symptom creation
* prescription operations
* other important writes

Client-generated IDs must be unique.

---

# 58. Low-Bandwidth Requirements

The API should support low-connectivity environments through:

* compact JSON payloads
* pagination
* caching
* image compression
* retry with backoff
* efficient synchronization
* avoiding unnecessary repeated downloads

Large responses should not be returned when a summary is sufficient.

---

# 59. Request Correlation

The API should support:

```http
X-Request-ID: <unique-request-id>
```

This allows a single request to be traced across:

```text
Frontend
 ↓
FastAPI
 ↓
AI Gateway
 ↓
RAG
 ↓
LLM / Sarvam / Local Provider
```

---

# 60. Logging Requirements

Logs may contain:

* request ID
* endpoint
* HTTP method
* status
* latency
* provider
* model identifier
* error category

Logs must not unnecessarily contain:

* patient symptoms
* prescription contents
* passwords
* tokens
* API keys
* raw medical conversations

---

# 61. AI Latency and Provider Observability

The AI Gateway should record:

```text
provider
operation
start_time
end_time
latency
success/failure
fallback_used
```

This is important for evaluating:

* Ollama local inference
* Sarvam online services
* local fallback services

---

# 62. API Security Boundary

The API must enforce:

```text
REQUEST
   ↓
AUTHENTICATE
   ↓
AUTHORIZE
   ↓
VALIDATE
   ↓
SAFETY RULES
   ↓
BUSINESS LOGIC
   ↓
AI GATEWAY / DATABASE
   ↓
RESULT VALIDATION
   ↓
MINIMUM NECESSARY RESPONSE
```

No client-side security check can replace this sequence.

---

# 63. RAG Security Boundary

The API must maintain:

```text
Patient Data
    │
    │ X
    │
    └──────► Global RAG Knowledge Base
```

Patient data must never be inserted into the global medical knowledge vector store.

The RAG corpus consists only of approved medical sources.

---

# 64. API → Requirement Traceability

| API Group               | Primary Requirements              |
| ----------------------- | --------------------------------- |
| `/health`               | System availability               |
| `/auth`                 | FR-01, FR-02, FR-03               |
| `/consent`              | FR-04                             |
| `/patients`             | FR-05                             |
| `/symptoms`             | FR-07, FR-08, FR-09, FR-10        |
| `/ai/chat`              | FR-06, FR-11                      |
| `/conversations`        | FR-06                             |
| `/ai/speech`            | FR-25 + multilingual requirements |
| `/prescriptions`        | FR-13, FR-14, FR-15               |
| `/medications`          | FR-16                             |
| `/medication-schedules` | FR-17, FR-18                      |
| `/timeline`             | FR-19                             |
| `/alerts`               | FR-23                             |
| `/healthcare-workers`   | FR-20, FR-21                      |
| `/follow-ups`           | FR-22                             |
| `/knowledge`            | FR-12                             |
| `/sync`                 | FR-26, FR-27                      |
| `/resources`            | FR-28 — Phase 2                   |
| `/admin/audit-logs`     | Security/audit requirements       |
| `/admin/pipeline-logs`  | AI observability requirements     |

Requirement IDs must remain synchronized with the current `TRACEABILITY_MATRIX.md`.

---

# 65. MVP API Scope

### Included

```text
Authentication
Consent
Patient Profile
Preliminary Symptom Checker
Deterministic Triage
AI Companion
RAG
Conversation
Speech
Prescription OCR
Prescription Verification
Medication
Medication Schedule
Medication Adherence
Health Timeline
Alerts
Healthcare Worker Dashboard APIs
Follow-ups
Knowledge Management
Offline Sync
Audit
AI Pipeline Observability
```

### Phase 2

```text
Nearby Healthcare Resource Locator
Additional languages
Additional integrations
```

---

# 66. Explicitly Excluded

The API must not implement autonomous:

* diagnosis
* prescribing
* medication changes
* ambulance dispatch
* pharmacy ordering
* insurance processing
* payment processing
* full EHR management
* medical-device integration
* outbreak prediction
* autonomous clinical decisions

---

# 67. Testing Requirements

Every endpoint should have tests covering, where applicable:

### Functional

* successful request
* invalid request
* missing required fields
* malformed values

### Authentication

* unauthenticated request → `401`
* invalid token → `401`

### Authorization

* unauthorized role → `403`
* unauthorized patient resource → `403/404`

### Resource

* resource exists → `200`
* resource does not exist → `404`

### Conflict

* duplicate operation → `409` or appropriate idempotent response

### AI

* provider success
* provider failure
* timeout
* fallback
* insufficient RAG evidence
* unsafe output

### Offline

* duplicate sync
* failed sync
* conflict
* retry

---

# 68. API Documentation

FastAPI's generated OpenAPI documentation should be available during development.

The generated schema must remain synchronized with this specification.

API implementation should not introduce undocumented production endpoints without updating this document.

---

# 69. Implementation Order

The backend API should be implemented progressively according to the M1–M18 roadmap:

```text
M1  → Health + Backend Foundation
M2  → Database Models
M3  → Authentication + RBAC
M4  → Consent
M5  → Patient Profile
M6  → Symptoms
M7  → Deterministic Triage
M8  → AI Gateway
M9  → RAG
M10 → AI Companion
M11 → OCR
M12 → Medication + Adherence
M13 → Healthcare Worker APIs
M14 → Speech + Multilingual
M15 → Offline Sync
M16 → Integration Testing
M17 → AI Evaluation
M18 → Deployment
```

---

# 70. API Golden Rule

Every protected operation follows:

```text
REQUEST
   ↓
AUTHENTICATE
   ↓
AUTHORIZE
   ↓
VALIDATE
   ↓
APPLY BUSINESS RULES
   ↓
APPLY SAFETY RULES
   ↓
EXECUTE
   ↓
VALIDATE RESULT
   ↓
AUDIT WHEN REQUIRED
   ↓
RETURN MINIMUM NECESSARY DATA
```

For AI operations:

```text
REQUEST
   ↓
AUTHENTICATE
   ↓
AUTHORIZE
   ↓
VALIDATE
   ↓
SAFETY / RED-FLAG CHECK
   ↓
AI GATEWAY
   ↓
RAG / MODEL / PROVIDER
   ↓
OUTPUT SAFETY VALIDATION
   ↓
CITATION / PROVENANCE
   ↓
RETURN
```

---

# 71. Final Architecture Contract

The API specification establishes the following permanent development boundaries:

### Ollama

**Purpose:** Local LLM execution.

```text
RAG Context
     ↓
AI Gateway
     ↓
Ollama
     ↓
Grounded response
```

### Sarvam

**Purpose:** Online specialized Indian-language services where evaluation demonstrates sufficient quality.

```text
Audio → Sarvam STT
Text  → Sarvam TTS
Image → Sarvam OCR
```

### Local Alternatives

Used when:

* offline operation is required
* Sarvam is unavailable
* benchmarking demonstrates an alternative is better

### Deterministic Triage

Always remains independent of the LLM:

```text
Symptoms
   ↓
Rules Engine
   ↓
ROUTINE / URGENT / EMERGENCY
```

### RAG

Always remains responsible for grounding medical knowledge:

```text
Approved Medical Sources
        ↓
      pgvector
        ↓
    Retrieval
        ↓
Evidence Gate
        ↓
     Ollama LLM
```

This separation is fundamental to MedGuide AI's safety, offline capability, provider flexibility, and research evaluation strategy.

---

**Status: API v2.0 — Development Baseline.**
