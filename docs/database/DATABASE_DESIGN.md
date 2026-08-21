# MedGuide AI — Database Design Specification

**Document:** `docs/database/DATABASE_DESIGN.md`  
**Version:** 2.0  
**Status:** **Development Baseline — Approved**  
**Database:** PostgreSQL  
**Vector Extension:** `pgvector`  
**Primary Languages:** English, Hindi, Telugu  
**Related Architecture:** `SYSTEM_ARCHITECTURE.md`, `TECHNOLOGY_STACK.md`, `SRS.md`, `USE_CASES.md`, `TRACEABILITY_MATRIX.md`

---

# 1. Purpose

This document defines the logical database architecture for MedGuide AI.

The database must support:

* Secure patient accounts
* Consent management
* Patient profiles
* Symptom records
* Deterministic triage results
* AI conversations and structured health extracts
* Prescription OCR
* Medication management
* Medication adherence
* Health timeline
* Healthcare-worker workflows
* Alerts and follow-ups
* Medical knowledge and RAG retrieval
* Auditability
* Offline synchronization
* AI/model traceability

The design follows the project's five-layer data separation principle:

```text
PATIENT-REPORTED FACT
        ↓
STRUCTURED DATA
        ↓
RETRIEVED KNOWLEDGE
        ↓
AI-GENERATED OUTPUT
        ↓
SYSTEM DECISION
```

These layers must remain distinguishable throughout storage and processing.

---

# 2. Database Technology

| Component         | Technology            | Status        |
| ----------------- | --------------------- | ------------- |
| Primary database  | PostgreSQL            | **CONFIRMED** |
| Vector extension  | pgvector              | **CONFIRMED** |
| ORM               | SQLAlchemy            | **CONFIRMED** |
| Migration system  | Alembic               | **CONFIRMED** |
| Database testing  | Pytest                | **CONFIRMED** |
| Local development | PostgreSQL + pgvector | **CONFIRMED** |

All schema changes must be performed through **Alembic migrations**.

Manual uncontrolled schema modifications are not permitted.

---

# 3. Data Classification

MedGuide AI data is classified according to sensitivity.

| Classification         | Examples                                                                          |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Public**             | Approved medical-source metadata                                                  |
| **Internal**           | Application configuration, model metadata                                         |
| **Sensitive**          | Patient profile, consent status                                                   |
| **Highly Sensitive**   | Symptoms, prescriptions, OCR text, medications, adherence, AI health interactions |
| **Security Sensitive** | Password hashes, authentication records, audit logs, synchronization metadata     |

Patient data must never be exposed through public knowledge-base or vector-search interfaces.

---

# 4. Core Data Architecture

```text
                         PostgreSQL
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   APPLICATION DATA       AI / RAG DATA        SECURITY DATA
        │                     │                     │
        ├─ Users              ├─ Documents         ├─ Audit Logs
        ├─ Profiles           ├─ Chunks             └─ Auth Events
        ├─ Consent            └─ Embeddings
        ├─ Symptoms
        ├─ Prescriptions
        ├─ Medications
        ├─ Timeline
        ├─ Alerts
        └─ Follow-ups
                              │
                              ▼
                         pgvector
```

The RAG knowledge store is logically separated from patient health information.

---

# 5. Core Relational Entities

The current database baseline contains **21 primary logical entities**.

|  # | Entity                    | Purpose                                  |
| -: | ------------------------- | ---------------------------------------- |
|  1 | `User`                    | Authentication account                   |
|  2 | `Role`                    | Role and permission classification       |
|  3 | `Consent`                 | Patient consent records                  |
|  4 | `PatientProfile`          | Patient demographic/profile information  |
|  5 | `HealthcareWorkerProfile` | Authorized healthcare-worker information |
|  6 | `SymptomRecord`           | Patient-reported symptoms                |
|  7 | `Conversation`            | AI companion session                     |
|  8 | `ConversationMessage`     | Individual conversation messages         |
|  9 | `Prescription`            | Prescription lifecycle                   |
| 10 | `PrescriptionImage`       | Secure uploaded image reference          |
| 11 | `OCRResult`               | OCR extraction and confidence            |
| 12 | `Medication`              | Verified medication information          |
| 13 | `MedicationSchedule`      | Medication timing/schedule               |
| 14 | `MedicationAdherence`     | Medication adherence events              |
| 15 | `HealthTimelineEvent`     | Longitudinal health events               |
| 16 | `Alert`                   | Safety/triage alerts                     |
| 17 | `FollowUp`                | Healthcare-worker follow-up tasks        |
| 18 | `MedicalDocument`         | Approved RAG source metadata             |
| 19 | `KnowledgeChunk`          | RAG document chunks + embeddings         |
| 20 | `AuditLog`                | Security and sensitive-access records    |
| 21 | `SyncOperation`           | Offline synchronization operations       |

---

# 6. User and Role Model

## 6.1 `User`

Stores authentication-level information.

Conceptual fields:

```text
id
email
phone_number
password_hash
full_name
role_id
preferred_language
is_active
created_at
updated_at
deleted_at
```

### Rules

* Passwords must never be stored in plaintext.
* Password hashes must never be returned through normal API responses.
* Authentication must be handled by the backend.
* Role permissions must be enforced server-side.

---

## 6.2 `Role`

Supported roles:

```text
PATIENT
HEALTHCARE_WORKER
ADMIN
```

The role determines the authorization boundary but does not by itself grant access to arbitrary patient information.

---

# 7. Patient Profile

## `PatientProfile`

Stores patient-specific information.

Conceptual fields:

```text
id
user_id
age
gender
preferred_language
blood_group
known_allergies
chronic_conditions
village_or_town
state
emergency_contact
created_at
updated_at
deleted_at
```

### Phase 1 languages

```text
en
hi
te
```

Language support must not be interpreted as evidence that every AI capability performs equally across languages. Language-wise evaluation remains mandatory.

---

# 8. Consent

## `Consent`

Consent must be represented as an explicit data entity.

Conceptual fields:

```text
id
patient_id
consent_type
status
version
granted_at
withdrawn_at
expires_at
created_at
updated_at
```

Possible status:

```text
GRANTED
DENIED
WITHDRAWN
EXPIRED
```

Consent changes must be auditable.

---

# 9. Symptom Records

## `SymptomRecord`

Stores the patient's reported health information separately from system interpretation.

Conceptual fields:

```text
id
patient_id
raw_description
language
structured_symptoms
duration
severity
associated_symptoms
reported_at
created_at
updated_at
```

The original patient-reported information must remain distinguishable from:

* extracted symptoms
* retrieved medical evidence
* AI-generated explanations
* deterministic triage decisions

---

# 10. Deterministic Triage Data

The triage result should be represented separately from the raw symptom record where appropriate.

Conceptual information:

```text
symptom_record_id
risk_level
red_flags_detected
rule_set_version
recommended_action
escalation_required
evaluated_at
```

Risk levels:

```text
ROUTINE
URGENT
EMERGENCY
```

### Critical rule

> The LLM must not be the authoritative source for emergency classification.

The deterministic triage engine produces the safety-critical decision.

---

# 11. AI Conversation Model

## 11.1 `Conversation`

Stores conversation/session metadata.

Conceptual fields:

```text
id
patient_id
language
status
started_at
last_activity_at
created_at
```

---

## 11.2 `ConversationMessage`

Conceptual fields:

```text
id
conversation_id
sender_type
content
language
message_type
created_at
```

Possible sender types:

```text
PATIENT
AI
SYSTEM
```

### Privacy rule

Raw AI conversations must not automatically be retained indefinitely.

Where appropriate, health-relevant information should be converted into structured timeline/health records for continuity of care.

---

# 12. AI Output Traceability

Where an AI response affects healthcare workflows, the system should retain sufficient metadata for evaluation and debugging.

Potential metadata:

```text
model_provider
model_name
model_version
prompt_version
knowledge_base_version
retrieval_trace_id
response_type
safety_validation_status
created_at
```

The database should not store unnecessary sensitive prompt/output information solely for debugging.

---

# 13. Prescription Model

## `Prescription`

Represents the prescription lifecycle.

Conceptual fields:

```text
id
patient_id
uploaded_by
verification_status
created_at
updated_at
verified_at
```

Verification statuses:

```text
PENDING
VERIFIED
PARTIALLY_VERIFIED
REQUIRES_REVIEW
```

---

# 14. Prescription Images

## `PrescriptionImage`

Stores a secure reference to the uploaded prescription.

Conceptual fields:

```text
id
prescription_id
storage_reference
mime_type
file_size
checksum
uploaded_at
deleted_at
```

The database should store a **secure storage reference**, not necessarily the image binary itself.

### Security requirements

* Validate file type.
* Validate file size.
* Reject executable/non-image files.
* Generate non-predictable storage identifiers.
* Restrict access using authorization.
* Do not expose raw storage paths to unauthorized users.

---

# 15. OCR Results

## `OCRResult`

Stores OCR processing results.

Conceptual fields:

```text
id
prescription_id
provider
model_name
raw_text
confidence_score
status
created_at
```

Possible status:

```text
SUCCESS
LOW_CONFIDENCE
FAILED
REQUIRES_REVIEW
```

Provider metadata may identify:

```text
Sarvam
Local OCR
PaddleOCR
Tesseract
Other evaluated provider
```

---

# 16. OCR Verification Guardrail

The following workflow is mandatory:

```text
Prescription Image
       ↓
OCR
       ↓
Extracted Text
       ↓
Medicine Extraction
       ↓
Confidence Assessment
       ↓
Patient / Human Verification
       ↓
Verified Medication
       ↓
Medication Schedule
```

### Absolute rule

> **OCR output must never automatically become an active medication schedule without verification.**

The system must not silently substitute an uncertain medicine name or dosage.

---

# 17. Medication

## `Medication`

Stores verified medication information.

Conceptual fields:

```text
id
patient_id
prescription_id
medicine_name
dosage
route
frequency
duration
verification_status
created_at
updated_at
```

Medication information should only become active after the required verification workflow.

---

# 18. Medication Schedule

## `MedicationSchedule`

Conceptual fields:

```text
id
medication_id
frequency
dose_instruction
start_date
end_date
timezone
reminder_enabled
created_at
updated_at
```

Schedules must support local reminder functionality where technically feasible.

---

# 19. Medication Adherence

## `MedicationAdherence`

Represents an event rather than repeatedly overwriting historical state.

Conceptual fields:

```text
id
schedule_id
status
scheduled_at
recorded_at
source
created_at
```

Possible status:

```text
TAKEN
MISSED
SKIPPED
UNKNOWN
```

This event-based design supports offline synchronization more safely.

---

# 20. Health Timeline

## `HealthTimelineEvent`

Provides a longitudinal patient history.

Example event types:

```text
SYMPTOM_REPORTED
TRIAGE_COMPLETED
AI_INTERACTION
PRESCRIPTION_ADDED
MEDICATION_VERIFIED
MEDICATION_STARTED
ADHERENCE_RECORDED
ALERT_CREATED
FOLLOWUP_CREATED
```

Conceptual fields:

```text
id
patient_id
event_type
source_entity
source_id
event_data
occurred_at
created_at
```

The timeline should preserve chronological health events without unnecessarily duplicating sensitive data.

---

# 21. Alerts

## `Alert`

Used for safety and healthcare-worker workflows.

Conceptual fields:

```text
id
patient_id
symptom_record_id
alert_type
severity
status
created_at
acknowledged_at
resolved_at
assigned_worker_id
```

Possible statuses:

```text
OPEN
ACKNOWLEDGED
RESOLVED
DISMISSED
```

Emergency-related alerts must originate from deterministic safety logic or clearly documented system events.

---

# 22. Healthcare Worker Profile

## `HealthcareWorkerProfile`

Conceptual fields:

```text
id
user_id
worker_type
organization
region
verification_status
created_at
updated_at
```

Possible worker types may include authorized:

* Community health workers
* ANMs
* Nurses
* Doctors
* Other approved healthcare personnel

The project must not claim clinical authority beyond the actual authorization and evaluation of the system.

---

# 23. Follow-Ups

## `FollowUp`

Conceptual fields:

```text
id
patient_id
assigned_worker_id
created_by
reason
status
due_at
completed_at
notes
created_at
updated_at
```

Possible statuses:

```text
PENDING
COMPLETED
CANCELLED
```

Healthcare-worker access must be authorization-controlled and auditable.

---

# 24. Medical Knowledge Base

The medical knowledge base is logically separate from patient health data.

It consists of:

```text
MedicalDocument
      ↓
KnowledgeChunk
      ↓
Embedding
      ↓
pgvector
```

---

# 25. Medical Document

## `MedicalDocument`

Stores approved-source metadata.

Conceptual fields:

```text
id
document_id
title
publisher
publication_date
version
topic
language
source_url
license_information
status
last_reviewed_at
created_at
updated_at
```

Possible statuses:

```text
PENDING_REVIEW
APPROVED
OUTDATED
ARCHIVED
```

Only approved documents should enter the production retrieval corpus.

---

# 26. Knowledge Chunk

## `KnowledgeChunk`

Stores the searchable units of approved medical documents.

Conceptual fields:

```text
id
medical_document_id
chunk_id
content
section_title
page_number
language
embedding
created_at
```

The `embedding` field uses pgvector.

Example conceptual type:

```sql
embedding vector(N)
```

where `N` is determined by the selected embedding model.

The embedding dimension must **not** be hardcoded until the final embedding model is selected.

---

# 27. RAG Data Isolation

The following separation is mandatory:

```text
                 PostgreSQL
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
 PATIENT HEALTH DATA       MEDICAL KNOWLEDGE
        │                         │
 Symptoms                     Documents
 Prescriptions                Chunks
 Medications                  Embeddings
 Conversations
        │                         │
        └───────────X─────────────┘
              NEVER MIX
```

Patient information must never be inserted into the global medical knowledge vector corpus.

---

# 28. RAG Retrieval Metadata

For traceability, retrieval operations may record metadata such as:

```text
retrieval_id
query_language
embedding_model
knowledge_base_version
retrieved_chunk_ids
similarity_scores
evidence_threshold
created_at
```

This information supports research evaluation and debugging.

The user-facing response should expose appropriate source attribution without unnecessarily exposing internal system metadata.

---

# 29. Evidence Sufficiency

The RAG pipeline must distinguish:

```text
Sufficient Evidence
        ↓
Grounded LLM Response

Insufficient Evidence
        ↓
Safe Limitation / Escalation Response
```

The similarity threshold is **not permanently fixed in the database design**.

It must be calibrated during RAG evaluation.

---

# 30. Audit Logs

## `AuditLog`

Tracks sensitive operations.

Conceptual fields:

```text
id
actor_user_id
actor_role
event_type
target_entity
target_id
timestamp
request_id
metadata
```

Examples:

```text
LOGIN
PATIENT_ACCESSED
CONSENT_CHANGED
PRESCRIPTION_ACCESSED
ALERT_REVIEWED
FOLLOWUP_CREATED
KNOWLEDGE_UPDATED
ADMIN_OPERATION
```

Audit logs must avoid unnecessary raw PII.

---

# 31. Offline Synchronization

## `SyncOperation`

Tracks operations generated while offline.

Conceptual fields:

```text
id
client_operation_id
user_id
entity_type
entity_id
operation_type
payload_reference
client_timestamp
server_timestamp
status
retry_count
error_code
created_at
updated_at
```

Statuses:

```text
PENDING
SYNCING
SYNCED
FAILED
CONFLICT
```

---

# 32. Synchronization Rules

Every offline operation should have a unique client-generated identifier.

Example:

```text
client_operation_id = UUID
```

This provides idempotency when a device retries the same operation.

Example:

```text
Offline
  ↓
Create Symptom Record
  ↓
Queue Operation
  ↓
Internet Returns
  ↓
Send Operation
  ↓
Server Checks client_operation_id
  ↓
Already processed?
 ├── YES → Return existing result
 └── NO  → Process operation
```

---

# 33. Conflict Resolution

The preferred strategy is **event-oriented storage** rather than destructive overwriting.

For example:

```text
Medication Adherence
      ↓
TAKEN at 08:00
      ↓
Immutable event
```

rather than repeatedly modifying one mutable record.

For profile fields where conflicts can occur:

* Last-write-wins may be used where appropriate.
* User resolution may be required for important conflicting information.
* Conflict handling must be explicitly tested.

---

# 34. Soft Deletion and Historical Data

Where appropriate, records should support:

```text
deleted_at
```

rather than immediately destroying historical records.

However, soft deletion must not be used to bypass legitimate data-deletion requirements.

Account deletion and privacy requirements remain governed by the approved retention/deletion policy.

---

# 35. Foreign Key & Integrity Rules

Relationships must enforce referential integrity.

Examples:

```text
User
 ├── PatientProfile
 ├── HealthcareWorkerProfile
 ├── AuditLog
 └── SyncOperation

PatientProfile
 ├── Consent
 ├── SymptomRecord
 ├── Conversation
 ├── Prescription
 ├── Medication
 ├── Alert
 └── FollowUp
```

Foreign-key deletion behavior must be selected carefully for sensitive health records.

Blind cascading deletion should not be used where it would destroy required audit/history information.

---

# 36. Indexing Strategy

Indexes should be created for frequently queried fields.

Initial candidates:

```text
users.email
users.phone_number
patient_profiles.user_id

symptom_records.patient_id
symptom_records.created_at

conversations.patient_id
conversation_messages.conversation_id

prescriptions.patient_id
medications.patient_id
medication_schedules.medication_id

alerts.patient_id
alerts.status
alerts.assigned_worker_id

followups.patient_id
followups.assigned_worker_id
followups.status

medical_documents.status
knowledge_chunks.medical_document_id

audit_logs.actor_user_id
audit_logs.target_id
audit_logs.timestamp

sync_operations.user_id
sync_operations.client_operation_id
sync_operations.status
```

Vector indexing strategy will be determined after the embedding model and retrieval scale are finalized.

---

# 37. Database Security

The database layer must enforce:

* Restricted credentials
* Environment-based secrets
* No credentials in Git
* Least-privilege database access
* Parameterized queries / ORM protections
* Restricted production access
* Encrypted connections where applicable
* Backup protection
* Sensitive-data logging restrictions

The LLM must never receive unrestricted database credentials.

---

# 38. LLM Database Boundary

The LLM does **not** directly query PostgreSQL.

Correct flow:

```text
Patient Request
      ↓
FastAPI
      ↓
Application Services
      ↓
Retrieve minimum required data
      ↓
AI Gateway
      ↓
LLM
```

Incorrect:

```text
LLM
 ↓
Direct PostgreSQL access
```

This boundary is mandatory for security, privacy, and auditability.

---

# 39. AI Provider Data Boundary

The database architecture must also support the distinction between local and online AI services.

```text
Application
     ↓
AI Gateway
     │
     ├── Ollama
     │      └── Local LLM inference
     │
     ├── Sarvam
     │      ├── Online STT
     │      ├── Online TTS
     │      └── Online OCR
     │
     └── Local fallback services
```

Provider-specific API credentials must never be stored in patient records.

---

# 40. Model Metadata

Where AI operations are evaluated or need reproducibility, model metadata should be represented separately from patient health entities.

Potential metadata:

```text
provider
model_name
model_version
quantization
embedding_model
prompt_version
knowledge_base_version
parameters
hardware
evaluation_run_id
```

This supports reproducibility without coupling patient records to a particular model.

---

# 41. Backup and Recovery

The PostgreSQL database must support:

* Regular backups
* Documented restore procedure
* Restore testing before final evaluation
* Knowledge-base reconstruction from approved source documents

The medical knowledge base should be rebuildable from its source manifest rather than relying solely on a database backup.

---

# 42. Database Migration Strategy

All schema changes follow:

```text
Modify SQLAlchemy Models
        ↓
Generate / Review Alembic Migration
        ↓
Run Migration
        ↓
Run Tests
        ↓
Verify Database
        ↓
Commit
```

Production or evaluation environments must not receive undocumented schema modifications.

---

# 43. High-Level ERD

```text
                         ┌─────────────┐
                         │    Role     │
                         └──────┬──────┘
                                │
                                ▼
                         ┌─────────────┐
                         │    User     │
                         └──────┬──────┘
                    ┌───────────┼────────────┐
                    │           │            │
                    ▼           ▼            ▼
             PatientProfile   Worker     AuditLog
                    │         Profile
          ┌─────────┼───────────────┐
          │         │               │
          ▼         ▼               ▼
       Consent   Symptoms       Conversation
                    │               │
                    ▼               ▼
                 Triage          Messages
                    │
                    ▼
                  Alert

PatientProfile
      │
      ├──────────────► Prescription
      │                     │
      │                     ├──► PrescriptionImage
      │                     │          │
      │                     │          ▼
      │                     │       OCRResult
      │                     │
      │                     ▼
      │                  Medication
      │                     │
      │                     ▼
      │              MedicationSchedule
      │                     │
      │                     ▼
      │             MedicationAdherence
      │
      ├──────────────► HealthTimelineEvent
      │
      └──────────────► FollowUp ◄──── HealthcareWorker

MedicalDocument
      │
      ▼
KnowledgeChunk
      │
      ▼
   pgvector

User
  │
  ▼
SyncOperation
```

---

# 44. Database Design Guardrails

The following rules are mandatory:

### 1. No plaintext credentials

Passwords must always be securely hashed.

### 2. No direct LLM database access

LLMs only receive application-approved context.

### 3. No patient data in RAG corpus

Patient records and medical knowledge remain isolated.

### 4. No unverified OCR medication schedules

OCR output requires verification.

### 5. Deterministic triage remains separate

LLM output cannot overwrite the authoritative safety classification.

### 6. Offline operations must be idempotent

Every sync operation requires a unique client operation ID.

### 7. Health history should be event-oriented

Important historical events should not be destructively overwritten.

### 8. All schema changes use Alembic

No undocumented manual schema modifications.

### 9. Sensitive access must be auditable

Healthcare-worker access to patient information must generate appropriate audit events.

### 10. Provider independence

Database entities must not be tightly coupled to Sarvam or Ollama.

---

# 45. Database Development Order

Database implementation should follow the M1–M18 roadmap.

```text
M1
Database connection + migration framework
        ↓
M2
Core entities + relationships
        ↓
M3
User / Role / Authentication
        ↓
M4
Consent
        ↓
M5
Patient Profile
        ↓
M6
Symptom Records
        ↓
M7
Triage / Alerts
        ↓
M8
AI Gateway metadata
        ↓
M9
Medical Documents + Knowledge Chunks + pgvector
        ↓
M10
Conversation + AI health interaction
        ↓
M11
Prescription + OCR
        ↓
M12
Medication + adherence + timeline
        ↓
M13
Healthcare-worker workflows
        ↓
M14
Speech metadata
        ↓
M15
Sync operations
        ↓
M16–M18
Testing, evaluation, deployment
```

---

# 46. Definition of Database Completion

The database layer is considered ready for full integration when:

* All approved core entities are implemented.
* Foreign-key relationships are tested.
* Alembic migrations work from a clean database.
* pgvector retrieval schema is operational.
* Patient/RAG data isolation is verified.
* RBAC boundaries are tested.
* OCR verification constraints are implemented.
* Offline synchronization is idempotent.
* Audit events are recorded for sensitive operations.
* Backup and restore are tested.
* Database tests pass.
* No real patient data is used during development/testing without appropriate authorization.

---

# 47. Final Database Principle

MedGuide AI's database must preserve the distinction between **what the patient said, what the system extracted, what medical evidence was retrieved, what the AI generated, and what the safety engine decided**.

```text
┌───────────────────────────────┐
│ Patient-Reported Information  │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Structured Health Data        │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Approved Medical Knowledge    │
│ + pgvector Retrieval          │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ AI-Generated Explanation      │
│ via Ollama / selected LLM     │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Deterministic Safety Decision │
└───────────────────────────────┘
```

**This separation is the core database safety principle for MedGuide AI.**
