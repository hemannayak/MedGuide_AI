# MedGuide AI — API Specification

**Project:** MedGuide AI
**Document:** API Specification
**Version:** 1.0
**Status:** Baseline API Contract
**API Style:** REST
**Base Path:** `/api/v1`
**Related Documents:**

* `AGENTS.md`
* `docs/PROJECT_SPECIFICATION.md`
* `docs/requirements/SRS.md`
* `docs/requirements/USE_CASES.md`
* `docs/requirements/PRE_DEVELOPMENT_DECISIONS.md`
* `docs/requirements/TRACEABILITY_MATRIX.md`
* `docs/architecture/SYSTEM_ARCHITECTURE.md`
* `docs/database/DATABASE_DESIGN.md`
* `docs/database/ERD.md`

---

# 1. Purpose

This document defines the API contract for MedGuide AI.

It specifies:

* API structure
* Endpoint responsibilities
* HTTP methods
* Authentication requirements
* Authorization requirements
* Request/response principles
* Error handling
* Validation
* Pagination
* Synchronization
* AI/RAG interaction
* Prescription processing
* Medication management
* Healthcare-worker operations

This document defines **what the API must provide**, not how individual endpoints are internally implemented.

---

# 2. API Design Principles

The API must follow these principles:

1. REST-oriented design.
2. Versioned endpoints.
3. Authentication for protected resources.
4. Server-side authorization.
5. Input validation.
6. Consistent response structures.
7. Consistent error structures.
8. Minimal exposure of sensitive patient data.
9. No direct frontend-to-database access.
10. No direct unrestricted frontend-to-LLM access.
11. Healthcare safety rules enforced server-side.
12. AI responses must pass through the AI Gateway.
13. Offline synchronization must be idempotent.
14. APIs must not expose internal implementation details unnecessarily.

---

# 3. Base URL

Development:

```text
http://localhost:<PORT>/api/v1
```

Production:

```text
https://<BACKEND-DOMAIN>/api/v1
```

The final production domain is:

`TBD — Deployment Phase`

---

# 4. API Versioning

The initial API version is:

```text
/api/v1
```

Breaking changes should result in a new API version rather than silently changing existing contracts.

Example:

```text
/api/v1/...
/api/v2/...
```

---

# 5. Authentication

Protected endpoints require an authenticated user.

Conceptually:

```text
Authorization: Bearer <access_token>
```

The exact authentication mechanism will be finalized during backend/security implementation.

Authentication must not be implemented by the frontend alone.

---

# 6. Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> What is the user allowed to access?

Every protected endpoint must evaluate both where applicable.

Conceptual roles:

```text
PATIENT
HEALTHCARE_WORKER
ADMIN
```

---

# 7. Patient Data Access Rule

A patient may access only their own authorized records.

A healthcare worker may access only patient information they are authorized to access.

An administrator must not automatically receive unrestricted healthcare-data access simply because they have an administrative role.

Access must follow the applicable authorization and consent policies.

---

# 8. Standard Response Structure

Successful responses should follow a consistent structure.

Example:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

For collection responses:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100
  }
}
```

The exact response envelope may be simplified during implementation if a framework convention provides an equivalent consistent structure.

---

# 9. Standard Error Structure

Errors should follow a consistent structure.

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": []
  }
}
```

The API must not expose:

* Stack traces
* Database credentials
* Internal secrets
* Raw exception messages
* Sensitive implementation details

---

# 10. HTTP Status Codes

The API should use appropriate HTTP status codes.

| Code    | Meaning                                    |
| ------- | ------------------------------------------ |
| 200     | Successful request                         |
| 201     | Resource created                           |
| 202     | Accepted for asynchronous processing       |
| 204     | Successful operation with no response body |
| 400     | Invalid request                            |
| 401     | Authentication required/failed             |
| 403     | Insufficient authorization                 |
| 404     | Resource not found                         |
| 409     | Resource/state conflict                    |
| 413     | Payload too large                          |
| 422     | Validation failure                         |
| 429     | Rate limit exceeded                        |
| 500     | Internal server error                      |
| 502/503 | External/AI service unavailable            |

---

# 11. Authentication APIs

## 11.1 Register Patient

```text
POST /auth/register
```

**Actor:** Patient

**Use Case:** UC-P01

### Request

```json
{
  "login_identifier": "user@example.com",
  "password": "<password>",
  "display_name": "Example User",
  "preferred_language": "en"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user_id": "<uuid>",
    "role": "PATIENT"
  }
}
```

The API must never return the password or password hash.

---

# 12. Login

```text
POST /auth/login
```

**Use Cases:** UC-P02, UC-P17

### Request

```json
{
  "login_identifier": "user@example.com",
  "password": "<password>"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "<token>",
    "token_type": "bearer",
    "user": {
      "id": "<uuid>",
      "role": "PATIENT"
    }
  }
}
```

The final token/session implementation is:

`TBD — Security Design`

---

# 13. Logout

```text
POST /auth/logout
```

**Authentication:** Required

The exact implementation depends on the final session/token strategy.

---

# 14. Current User

```text
GET /auth/me
```

**Authentication:** Required

Returns the authenticated user's basic account information and role.

---

# 15. Consent APIs

## 15.1 Get Consent Status

```text
GET /consent
```

**Actor:** Patient

**Use Case:** UC-P03

Returns applicable consent records/status.

---

## 15.2 Grant Consent

```text
POST /consent
```

### Request

```json
{
  "consent_type": "<type>",
  "version": "1.0",
  "status": "GRANTED"
}
```

The system must record the consent event rather than treating consent as a simple frontend flag.

---

## 15.3 Withdraw Consent

```text
PATCH /consent/{consent_id}
```

### Request

```json
{
  "status": "WITHDRAWN"
}
```

The server must apply the consequences defined by the consent policy.

---

# 16. Patient Profile APIs

## 16.1 Get Profile

```text
GET /patients/me
```

**Authentication:** Required

**Actor:** Patient

**Use Case:** UC-P04

---

## 16.2 Update Profile

```text
PATCH /patients/me
```

### Request

Only permitted fields may be updated.

Example:

```json
{
  "display_name": "Updated Name",
  "preferred_language": "te"
}
```

---

# 17. Symptom APIs

## 17.1 Submit Symptoms

```text
POST /symptoms
```

**Actor:** Patient

**Use Case:** UC-P06

### Request

```json
{
  "input_type": "text",
  "text": "I have fever and cough for three days",
  "language": "en"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "symptom_record_id": "<uuid>",
    "status": "RECORDED"
  }
}
```

This endpoint records patient input.

It should not independently claim a diagnosis.

---

# 18. Analyze Symptoms

```text
POST /symptoms/analyze
```

**Use Cases:** UC-P06, UC-P07

This endpoint invokes the symptom-processing and safety pipeline.

### Request

```json
{
  "symptom_record_id": "<uuid>"
}
```

### Conceptual Response

```json
{
  "success": true,
  "data": {
    "risk_level": "ROUTINE",
    "red_flags": [],
    "guidance": "...",
    "escalation_required": false
  }
}
```

The exact clinical categories and fields will be finalized after the safety-rule design.

---

# 19. Red-Flag Rule

The API must not allow an LLM alone to determine emergency behavior.

Conceptually:

```text
Input
 ↓
Structured Symptoms
 ↓
Triage Rules
 ↓
Risk Classification
 ↓
Escalation
```

The LLM may assist with extraction or explanation, but defined safety rules must remain independently testable.

---

# 20. AI Health Query API

```text
POST /ai/chat
```

**Actor:** Patient

**Use Case:** UC-P05

### Request

```json
{
  "message": "What should I know about fever?",
  "language": "en",
  "conversation_id": "<uuid>"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "conversation_id": "<uuid>",
    "message": "...",
    "sources": []
  }
}
```

---

# 21. AI Response Requirements

Applicable healthcare responses should:

* Use approved knowledge where appropriate.
* Avoid unsupported medical claims.
* Communicate uncertainty.
* Avoid definitive diagnosis.
* Avoid autonomous prescribing.
* Provide escalation guidance where required.

---

# 22. RAG Source Attribution

Where a response is grounded using RAG, the response may include source information.

Conceptually:

```json
{
  "sources": [
    {
      "document_id": "<uuid>",
      "title": "Approved Medical Guideline",
      "publisher": "..."
    }
  ]
}
```

Only approved source metadata should be exposed.

Internal vector/database details must not be exposed.

---

# 23. RAG Query API

The frontend should normally use:

```text
POST /ai/chat
```

rather than directly calling a vector database.

Internally:

```text
/api/v1/ai/chat
        ↓
AI Gateway
        ↓
Query Processing
        ↓
Vector Retrieval
        ↓
LLM
```

---

# 24. Conversation APIs

## Get Conversations

```text
GET /conversations
```

Returns only conversations belonging to the authenticated patient.

---

## Get Conversation

```text
GET /conversations/{conversation_id}
```

Authorization must verify ownership/access.

---

## Delete Conversation

```text
DELETE /conversations/{conversation_id}
```

Actual deletion behavior must follow the final retention policy.

---

# 25. Voice API

## Speech-to-Text

```text
POST /speech/transcribe
```

**Use Case:** UC-P14

Input:

* Audio file
* Language where applicable

Output:

```json
{
  "success": true,
  "data": {
    "transcript": "...",
    "language": "te",
    "confidence": 0.0
  }
}
```

The exact confidence representation depends on the selected speech model.

---

# 26. Voice Safety Rule

Speech recognition output must be treated as potentially incorrect.

For safety-sensitive workflows:

```text
Audio
 ↓
Transcript
 ↓
Verification where appropriate
 ↓
Healthcare Processing
```

The system must not assume the transcript is perfectly accurate.

---

# 27. Multilingual API Behavior

Language may be supplied explicitly:

```json
{
  "language": "te"
}
```

or inferred where supported.

The supported-language list must come from the approved model/evaluation configuration.

The system must not advertise unsupported languages.

---

# 28. Prescription APIs

## 28.1 Upload Prescription

```text
POST /prescriptions
```

**Use Case:** UC-P08

Content type:

```text
multipart/form-data
```

Input:

```text
prescription image
```

The server must validate:

* File type
* File size
* Image validity
* Authorization

---

# 29. Process Prescription OCR

```text
POST /prescriptions/{prescription_id}/ocr
```

**Use Case:** UC-P09

Conceptual response:

```json
{
  "success": true,
  "data": {
    "ocr_result_id": "<uuid>",
    "status": "REQUIRES_REVIEW"
  }
}
```

OCR output is not automatically verified medication data.

---

# 30. Get OCR Result

```text
GET /prescriptions/{prescription_id}/ocr
```

Returns the latest authorized OCR result.

---

# 31. Verify Prescription Information

```text
POST /prescriptions/{prescription_id}/verify
```

**Actor:** Patient / authorized healthcare worker depending on workflow.

### Conceptual Request

```json
{
  "verification_status": "VERIFIED"
}
```

Verification rules must be defined before allowing medication scheduling.

---

# 32. Prescription Safety Boundary

The system must not silently transform:

```text
OCR output
```

into:

```text
verified medication
```

The intended workflow is:

```text
Prescription
 ↓
OCR
 ↓
Extraction
 ↓
Confidence
 ↓
Verification
 ↓
Medication
```

---

# 33. Medication APIs

## Create Medication

```text
POST /medications
```

A medication may be created only through an approved and sufficiently verified workflow.

---

## Get Medications

```text
GET /medications
```

Returns medications belonging to the authenticated patient.

---

## Get Medication

```text
GET /medications/{medication_id}
```

---

## Update Medication

```text
PATCH /medications/{medication_id}
```

Updates only permitted information.

Medication modification must not become autonomous AI prescribing.

---

# 34. Medication Schedule APIs

## Create Schedule

```text
POST /medications/{medication_id}/schedules
```

### Conceptual Request

```json
{
  "frequency": "...",
  "schedule_data": {},
  "start_date": "2026-08-11",
  "end_date": "2026-08-20",
  "timezone": "Asia/Kolkata"
}
```

---

## Get Schedules

```text
GET /medications/{medication_id}/schedules
```

---

## Update Schedule

```text
PATCH /medication-schedules/{schedule_id}
```

---

# 35. Medication Adherence APIs

## Record Adherence

```text
POST /medication-schedules/{schedule_id}/adherence
```

### Request

```json
{
  "scheduled_at": "2026-08-11T08:00:00+05:30",
  "status": "TAKEN"
}
```

---

## Get Adherence

```text
GET /medication-schedules/{schedule_id}/adherence
```

---

# 36. Reminder API

Medication reminders should preferably be generated from medication schedules rather than manually creating unrelated reminder records.

The exact notification architecture remains:

`TBD — Notification Design`

Possible internal flow:

```text
Medication Schedule
       ↓
Reminder Scheduler
       ↓
Notification
```

---

# 37. Health Timeline APIs

## Get Timeline

```text
GET /timeline
```

Supports:

* Pagination
* Chronological ordering
* Optional date filtering

Example:

```text
GET /timeline?page=1&page_size=20
```

---

## Get Timeline Event

```text
GET /timeline/{event_id}
```

Only authorized events may be returned.

---

# 38. Alert APIs

## Get Patient Alerts

```text
GET /alerts
```

---

## Get Alert

```text
GET /alerts/{alert_id}
```

---

## Acknowledge Alert

```text
PATCH /alerts/{alert_id}
```

Example:

```json
{
  "status": "ACKNOWLEDGED"
}
```

Only authorized actors may acknowledge or resolve an alert.

---

# 39. Healthcare Worker APIs

## Get Authorized Patients

```text
GET /healthcare-workers/patients
```

**Actor:** Healthcare Worker

**Use Case:** UC-P18

The endpoint must enforce patient-access authorization.

---

# 40. Get Patient Record

```text
GET /healthcare-workers/patients/{patient_id}
```

Returns only information the healthcare worker is authorized to access.

---

# 41. Get Patient Summary

```text
GET /healthcare-workers/patients/{patient_id}/summary
```

or, if generation is computationally expensive:

```text
POST /healthcare-workers/patients/{patient_id}/summary
```

The final method depends on whether summary generation is synchronous or asynchronous.

---

# 42. AI Summary Safety

The healthcare-worker dashboard must distinguish:

```text
Patient-reported data
```

from:

```text
AI-generated summary
```

The AI summary must not be represented as a clinical diagnosis.

The original patient information must remain available for verification.

---

# 43. Follow-Up APIs

## Create Follow-Up

```text
POST /follow-ups
```

**Actor:** Healthcare Worker

---

## Get Follow-Ups

```text
GET /follow-ups
```

---

## Get Follow-Up

```text
GET /follow-ups/{follow_up_id}
```

---

## Update Follow-Up

```text
PATCH /follow-ups/{follow_up_id}
```

---

# 44. Knowledge Management APIs

Knowledge-management APIs are restricted to authorized personnel.

## Create Medical Document

```text
POST /knowledge/documents
```

---

## Get Medical Documents

```text
GET /knowledge/documents
```

---

## Get Medical Document

```text
GET /knowledge/documents/{document_id}
```

---

## Approve Medical Document

```text
POST /knowledge/documents/{document_id}/approve
```

Only approved documents may become part of the production RAG corpus.

---

# 45. Knowledge Ingestion

```text
POST /knowledge/documents/{document_id}/ingest
```

Conceptual pipeline:

```text
Document
 ↓
Validation
 ↓
Cleaning
 ↓
Chunking
 ↓
Embedding
 ↓
Vector Storage
```

The endpoint must not allow arbitrary public users to inject knowledge into the production RAG system.

---

# 46. Knowledge Versioning

The knowledge system must retain:

* Source
* Publisher
* Version
* Language
* Publication date
* Review status
* Last review
* Embedding/model metadata where required

---

# 47. Nearby Healthcare Resources

This is currently **Phase 2**.

If implemented:

```text
GET /resources/nearby
```

Potential query parameters:

```text
latitude
longitude
radius
resource_type
```

The endpoint must require appropriate location permission and must not falsely imply emergency-service capability.

---

# 48. Offline Synchronization APIs

## Sync Pending Operations

```text
POST /sync
```

The request contains one or more client operations.

Example:

```json
{
  "operations": [
    {
      "client_operation_id": "<unique-id>",
      "operation_type": "CREATE",
      "entity_type": "MEDICATION_ADHERENCE",
      "payload": {}
    }
  ]
}
```

---

# 49. Sync Response

Example:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "client_operation_id": "<unique-id>",
        "status": "SYNCED"
      }
    ]
  }
}
```

Possible results:

```text
SYNCED
DUPLICATE
FAILED
CONFLICT
```

---

# 50. Synchronization Safety

The server must:

1. Authenticate the user.
2. Validate the operation.
3. Verify authorization.
4. Verify the entity.
5. Check the client operation ID.
6. Prevent duplicate processing.
7. Apply transaction where required.
8. Return a synchronization result.

Offline mode must not bypass server-side security.

---

# 51. Audit API

Audit records should generally **not be exposed as a normal patient API**.

Authorized administrators/security personnel may have restricted access through an administrative interface if required.

Example:

```text
GET /admin/audit-logs
```

This remains restricted and optional for the MVP.

---

# 52. Pagination

Collection endpoints should support pagination.

Preferred parameters:

```text
?page=1&page_size=20
```

The backend must enforce a maximum page size.

Example:

```text
page_size <= MAX_PAGE_SIZE
```

The exact maximum is:

`TBD — Performance Design`

---

# 53. Filtering

Filtering should only be added where it has a clear use case.

Examples:

```text
GET /timeline?from=...&to=...
GET /alerts?status=OPEN
GET /follow-ups?status=PENDING
```

Avoid creating arbitrary filter combinations.

---

# 54. Sorting

Sensitive patient records should use deterministic ordering.

For timeline events:

```text
event_time DESC
```

Where timestamps can be identical, a secondary stable identifier/order should be used.

---

# 55. Idempotency

Operations that may be retried must support idempotency where appropriate.

Especially:

* Offline synchronization
* File processing
* Notification creation
* Important write operations

Client-generated idempotency keys may be used where required.

---

# 56. File Upload Limits

Prescription upload APIs must enforce:

* Maximum file size
* Allowed MIME types
* Allowed image formats
* Request timeout
* Authentication
* Authorization

Exact limits:

`TBD — Security/Performance Design`

---

# 57. AI Request Limits

AI endpoints must have appropriate protections against abuse.

Potential controls:

* Rate limiting
* Request size limits
* Token/input limits
* Authentication
* Timeout
* Retry policy

Exact limits:

`TBD — Performance/Security Design`

---

# 58. AI Failure Response

If the AI service is unavailable:

```text
POST /ai/chat
        ↓
AI Service Failure
        ↓
Safe API Response
```

The API must not fabricate a response.

Example:

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "Healthcare assistance is temporarily unavailable. Please try again or consult a qualified healthcare professional."
  }
}
```

The exact user-facing wording will be finalized during UX design.

---

# 59. RAG Retrieval Failure

If the system cannot retrieve sufficiently relevant approved medical knowledge:

```text
AI Request
 ↓
Retrieval
 ↓
Insufficient Evidence
```

The API must return a safe response rather than falsely claiming that the answer is grounded.

---

# 60. Validation Rules

All API inputs must be validated before processing.

Validation includes:

* Data types
* Required fields
* String lengths
* Enum values
* Date/time formats
* File types
* Payload sizes
* Authorization context

Healthcare-specific validation must be handled by the appropriate domain service.

---

# 61. API Security Rules

The API must:

* Require authentication where applicable.
* Enforce authorization server-side.
* Validate every request.
* Prevent unauthorized patient access.
* Protect sensitive responses.
* Rate-limit abuse-prone endpoints.
* Never expose secrets.
* Never expose database credentials.
* Never expose internal stack traces.
* Validate uploaded files.
* Apply appropriate CORS policy.

---

# 62. CORS

The backend must allow requests only from approved frontend origins.

Development origins may include:

```text
localhost
```

Production origins will be explicitly configured.

Wildcard CORS should not be used for sensitive authenticated APIs unless there is a justified architecture decision.

---

# 63. API Logging

API logs may record:

* Request method
* Endpoint
* Status code
* Request duration
* Correlation/request ID
* Error code

Logs should not unnecessarily contain:

* Full patient symptoms
* Prescription contents
* Passwords
* Access tokens
* Sensitive health information

---

# 64. Request Correlation

The API should support a request/correlation identifier.

Conceptually:

```text
X-Request-ID: <uuid>
```

This helps trace:

```text
Frontend
 ↓
API
 ↓
AI
 ↓
Database
```

without exposing sensitive content.

---

# 65. API Documentation

The FastAPI implementation should expose automatically generated API documentation during development.

The documentation must reflect the actual implemented contract.

The API documentation should not be treated as a replacement for this specification.

---

# 66. API Testing Requirements

Every Core MVP endpoint should eventually have tests for:

### Success

Valid request → expected response.

### Validation

Invalid request → expected validation error.

### Authentication

Unauthenticated request → `401`.

### Authorization

Unauthorized resource access → `403`.

### Not Found

Missing resource → `404`.

### Conflict

Invalid state/duplicate operation → `409`.

### Server/External Failure

Dependency failure → safe error.

---

# 67. API Traceability

| API Group               | Main Requirements          |
| ----------------------- | -------------------------- |
| `/auth`                 | FR-01, FR-02, FR-03        |
| `/consent`              | FR-04                      |
| `/patients`             | FR-05                      |
| `/symptoms`             | FR-07, FR-08, FR-09, FR-10 |
| `/ai`                   | FR-06, FR-11               |
| `/conversations`        | FR-06                      |
| `/speech`               | FR-25                      |
| `/prescriptions`        | FR-13, FR-14, FR-15        |
| `/medications`          | FR-16                      |
| `/medication-schedules` | FR-17, FR-18               |
| `/timeline`             | FR-19                      |
| `/alerts`               | FR-23                      |
| `/healthcare-workers`   | FR-20, FR-21               |
| `/follow-ups`           | FR-22                      |
| `/knowledge`            | FR-12                      |
| `/sync`                 | FR-26, FR-27               |
| `/resources`            | FR-28, Phase 2             |

---

# 68. APIs Explicitly Out of MVP

The following APIs should **not** be implemented unless scope is formally changed:

```text
Payments
Insurance
Pharmacy ordering
Drug inventory
Hospital management
Ambulance dispatch
Appointment booking
Wearable device ingestion
Full EHR integration
Outbreak prediction
```

These remain outside the approved Core MVP.

---

# 69. API Development Rule

The coding agent must not:

* Invent undocumented endpoints.
* Add unrelated API modules.
* Allow frontend direct database access.
* Allow frontend direct unrestricted LLM access.
* Bypass authorization.
* Bypass consent rules.
* Convert OCR directly into verified medication.
* Allow arbitrary knowledge-base uploads.
* Allow AI to directly modify patient records without validation.

If a new endpoint is required, it must first be traced to:

```text
Requirement
 ↓
Use Case
 ↓
API Design
```

---

# 70. API Completion Criteria

The API design phase is complete when:

* Core MVP endpoints are defined.
* Actors are defined.
* Authentication requirements are defined.
* Authorization requirements are defined.
* Request/response principles are defined.
* Error handling is defined.
* Pagination principles are defined.
* File-upload rules are defined.
* AI boundaries are defined.
* RAG boundaries are defined.
* Offline synchronization is defined.
* Security requirements are defined.
* API-to-requirement traceability exists.
* No Core MVP requirement lacks an appropriate API/interface where one is required.

---

# 71. Final API Architecture

The intended communication flow is:

```text
┌──────────────────────┐
│   Patient Client     │
└──────────┬───────────┘
           │
           │ HTTPS / REST
           ↓
┌──────────────────────────────┐
│        FastAPI Backend       │
│                              │
│ Auth / RBAC / Consent        │
│ Application Services         │
│ Safety / Domain Logic        │
│ AI Gateway                   │
│ File Processing              │
│ Sync Engine                  │
└───────┬───────────┬──────────┘
        │           │
        ↓           ↓
   PostgreSQL     AI Services
        │           │
        ↓           ├── RAG
   pgvector        ├── LLM
                    ├── Speech
                    └── OCR
```

The Healthcare Worker Dashboard uses the same controlled backend boundary.

---

# 72. API Golden Rule

Every request must follow:

```text
REQUEST
   ↓
Authenticate
   ↓
Authorize
   ↓
Validate
   ↓
Apply Business/Safety Rules
   ↓
Perform Operation
   ↓
Validate Result
   ↓
Return Minimum Necessary Data
```

AI services must remain behind controlled application boundaries.

---

# 73. Final Principle

**The API is a contract, not an implementation shortcut.**

The backend must implement the approved contract, while the frontend and AI services consume it through defined interfaces.

Any change to a Core MVP API must be reflected in:

```text
SRS
↓
Use Case
↓
Traceability Matrix
↓
API Specification
↓
Implementation
↓
Tests
```
