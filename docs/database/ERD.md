# MedGuide AI — Entity Relationship Diagram

**Project:** MedGuide AI
**Document:** Entity Relationship Diagram
**Version:** 1.0
**Status:** Baseline
**Related Document:** `docs/database/DATABASE_DESIGN.md`

---

# 1. Purpose

This document defines the relationships between the core MedGuide AI database entities.

It establishes:

* Primary keys
* Foreign keys
* Cardinality
* Entity ownership
* Required relationships
* Optional relationships
* Referential-integrity principles

This document is a design specification.

It is **not yet the implementation schema**.

---

# 2. Database Relationship Overview

The major relationship structure is:

```text
User
 ├── Role
 ├── PatientProfile
 │    ├── Consent
 │    ├── SymptomRecord
 │    ├── Conversation
 │    │     └── ConversationMessage
 │    ├── Prescription
 │    │     └── PrescriptionImage
 │    │           └── OCRResult
 │    ├── Medication
 │    │     └── MedicationSchedule
 │    │           └── MedicationAdherence
 │    ├── HealthTimelineEvent
 │    ├── Alert
 │    └── FollowUp
 │
 ├── HealthcareWorkerProfile
 │
 ├── AuditLog
 │
 └── SyncOperation

MedicalDocument
 └── KnowledgeChunk
       └── Vector Embedding
```

---

# 3. ER Diagram

The following diagram represents the baseline logical relationship model.

```mermaid
erDiagram

    ROLE ||--o{ USER : assigns

    USER ||--o| PATIENT_PROFILE : has
    USER ||--o| HEALTHCARE_WORKER_PROFILE : has

    PATIENT_PROFILE ||--o{ CONSENT : provides
    PATIENT_PROFILE ||--o{ SYMPTOM_RECORD : reports

    PATIENT_PROFILE ||--o{ CONVERSATION : owns
    CONVERSATION ||--o{ CONVERSATION_MESSAGE : contains

    PATIENT_PROFILE ||--o{ PRESCRIPTION : owns
    PRESCRIPTION ||--o{ PRESCRIPTION_IMAGE : contains
    PRESCRIPTION_IMAGE ||--o{ OCR_RESULT : produces

    PATIENT_PROFILE ||--o{ MEDICATION : has
    PRESCRIPTION ||--o{ MEDICATION : may_define

    MEDICATION ||--o{ MEDICATION_SCHEDULE : has
    MEDICATION_SCHEDULE ||--o{ MEDICATION_ADHERENCE : records

    PATIENT_PROFILE ||--o{ HEALTH_TIMELINE_EVENT : has

    PATIENT_PROFILE ||--o{ ALERT : receives

    PATIENT_PROFILE ||--o{ FOLLOW_UP : has
    HEALTHCARE_WORKER_PROFILE ||--o{ FOLLOW_UP : manages

    USER ||--o{ AUDIT_LOG : generates
    USER ||--o{ SYNC_OPERATION : creates

    MEDICAL_DOCUMENT ||--o{ KNOWLEDGE_CHUNK : contains


    ROLE {
        uuid id PK
        string name UK
    }

    USER {
        uuid id PK
        uuid role_id FK
        string login_identifier UK
        string password_hash
        string status
        datetime created_at
        datetime updated_at
        datetime last_login_at
    }

    PATIENT_PROFILE {
        uuid id PK
        uuid user_id FK UK
        string display_name
        date date_of_birth
        string preferred_language
        string contact_reference
        datetime created_at
        datetime updated_at
    }

    HEALTHCARE_WORKER_PROFILE {
        uuid id PK
        uuid user_id FK UK
        string name
        string worker_type
        string organization
        string status
        datetime created_at
        datetime updated_at
    }

    CONSENT {
        uuid id PK
        uuid patient_id FK
        string consent_type
        string status
        string version
        datetime granted_at
        datetime withdrawn_at
        datetime created_at
        datetime updated_at
    }

    SYMPTOM_RECORD {
        uuid id PK
        uuid patient_id FK
        string source
        text raw_input_reference
        json structured_data
        datetime reported_at
        datetime created_at
        datetime updated_at
    }

    CONVERSATION {
        uuid id PK
        uuid patient_id FK
        string language
        string status
        datetime started_at
        datetime ended_at
    }

    CONVERSATION_MESSAGE {
        uuid id PK
        uuid conversation_id FK
        string sender_type
        text content
        json metadata
        datetime created_at
    }

    PRESCRIPTION {
        uuid id PK
        uuid patient_id FK
        string source
        string status
        string verification_status
        date prescribed_date
        datetime created_at
        datetime updated_at
    }

    PRESCRIPTION_IMAGE {
        uuid id PK
        uuid prescription_id FK
        string storage_reference
        string file_type
        bigint file_size
        string checksum
        datetime uploaded_at
    }

    OCR_RESULT {
        uuid id PK
        uuid prescription_image_id FK
        string engine
        string model_version
        text raw_text
        float confidence
        string status
        datetime processed_at
    }

    MEDICATION {
        uuid id PK
        uuid patient_id FK
        uuid prescription_id FK
        string medicine_name
        string dosage
        string route
        text instructions
        string verification_status
        datetime created_at
        datetime updated_at
    }

    MEDICATION_SCHEDULE {
        uuid id PK
        uuid medication_id FK
        string frequency
        json schedule_data
        date start_date
        date end_date
        string timezone
        string status
        datetime created_at
        datetime updated_at
    }

    MEDICATION_ADHERENCE {
        uuid id PK
        uuid medication_schedule_id FK
        datetime scheduled_at
        datetime recorded_at
        string status
        string source
        datetime created_at
    }

    HEALTH_TIMELINE_EVENT {
        uuid id PK
        uuid patient_id FK
        string event_type
        uuid reference_id
        datetime event_time
        json metadata
        datetime created_at
    }

    ALERT {
        uuid id PK
        uuid patient_id FK
        string alert_type
        string severity
        string source
        string status
        datetime created_at
        datetime acknowledged_at
        datetime resolved_at
    }

    FOLLOW_UP {
        uuid id PK
        uuid patient_id FK
        uuid healthcare_worker_id FK
        string reason
        datetime scheduled_at
        string status
        text notes
        datetime created_at
        datetime updated_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid actor_user_id FK
        string action
        string resource_type
        uuid resource_id
        datetime timestamp
        json metadata
    }

    SYNC_OPERATION {
        uuid id PK
        uuid user_id FK
        string client_operation_id UK
        string operation_type
        string entity_type
        uuid entity_id
        json payload_reference
        datetime created_at
        datetime synced_at
        string status
        integer retry_count
        string error_code
    }

    MEDICAL_DOCUMENT {
        uuid id PK
        string title
        string publisher
        string source_reference
        date publication_date
        string version
        string language
        string topic
        string license
        string review_status
        datetime last_reviewed_at
        datetime created_at
        datetime updated_at
    }

    KNOWLEDGE_CHUNK {
        uuid id PK
        uuid document_id FK
        integer chunk_index
        text content
        vector embedding
        json metadata
        datetime created_at
    }
```

---

# 4. Relationship Definitions

## 4.1 Role → User

**Relationship:** `1:N`

One role may belong to many users.

```text
ROLE 1 ─────── N USER
```

Example:

```text
PATIENT
 ├── User A
 ├── User B
 └── User C
```

---

# 5. User → Patient Profile

**Relationship:** `1:0..1`

A user may have zero or one patient profile.

A patient profile must belong to exactly one user.

```text
USER 1 ─────── 0..1 PATIENT_PROFILE
```

The `user_id` in `PATIENT_PROFILE` should therefore be unique.

---

# 6. User → Healthcare Worker Profile

**Relationship:** `1:0..1`

A user may have zero or one healthcare-worker profile.

```text
USER 1 ─────── 0..1 HEALTHCARE_WORKER_PROFILE
```

The `user_id` should be unique.

---

# 7. Patient → Consent

**Relationship:** `1:N`

A patient can have multiple consent records because:

* Different consent purposes may exist.
* Consent may change.
* Consent versions may change.

```text
PATIENT 1 ─────── N CONSENT
```

Historical consent records should not be silently overwritten when audit/history is required.

---

# 8. Patient → Symptom Record

**Relationship:** `1:N`

A patient may report many symptom records.

```text
PATIENT 1 ─────── N SYMPTOM_RECORD
```

Each symptom record belongs to one patient.

---

# 9. Patient → Conversation

**Relationship:** `1:N`

A patient may have multiple AI conversations.

```text
PATIENT 1 ─────── N CONVERSATION
```

---

# 10. Conversation → Message

**Relationship:** `1:N`

A conversation contains multiple messages.

```text
CONVERSATION 1 ─────── N CONVERSATION_MESSAGE
```

Messages should preserve their chronological order through timestamps and/or a sequence mechanism.

---

# 11. Patient → Prescription

**Relationship:** `1:N`

A patient may have multiple prescriptions.

```text
PATIENT 1 ─────── N PRESCRIPTION
```

---

# 12. Prescription → Prescription Image

**Relationship:** `1:N`

A prescription may have one or more images.

This allows:

* Multiple pages
* Re-uploaded images
* Alternative captures

```text
PRESCRIPTION 1 ─────── N PRESCRIPTION_IMAGE
```

---

# 13. Prescription Image → OCR Result

**Relationship:** `1:N`

An image may be processed multiple times.

For example:

```text
OCR Engine v1
      ↓
Result A

OCR Engine v2
      ↓
Result B
```

This supports model experimentation and reproducibility.

```text
PRESCRIPTION_IMAGE 1 ─────── N OCR_RESULT
```

---

# 14. Patient → Medication

**Relationship:** `1:N`

A patient may have multiple medication records.

```text
PATIENT 1 ─────── N MEDICATION
```

---

# 15. Prescription → Medication

**Relationship:** `1:N` optional

A prescription may define zero or more medications.

```text
PRESCRIPTION 1 ─────── 0..N MEDICATION
```

The prescription reference may be nullable because a medication can potentially be entered through another approved workflow.

---

# 16. Medication → Medication Schedule

**Relationship:** `1:N`

A medication may have one or more schedules.

```text
MEDICATION 1 ─────── N MEDICATION_SCHEDULE
```

This supports changes in scheduling over time without destroying historical records.

---

# 17. Medication Schedule → Adherence

**Relationship:** `1:N`

A schedule can generate many adherence events.

```text
SCHEDULE 1 ─────── N ADHERENCE
```

Each adherence event represents a specific scheduled occurrence.

---

# 18. Patient → Timeline Event

**Relationship:** `1:N`

A patient can have many timeline events.

```text
PATIENT 1 ─────── N TIMELINE_EVENT
```

The timeline should reference source entities rather than duplicating complete records.

---

# 19. Patient → Alert

**Relationship:** `1:N`

A patient can have multiple alerts.

```text
PATIENT 1 ─────── N ALERT
```

Alerts should maintain their own lifecycle.

---

# 20. Patient → Follow-Up

**Relationship:** `1:N`

A patient may have multiple follow-up records.

```text
PATIENT 1 ─────── N FOLLOW_UP
```

---

# 21. Healthcare Worker → Follow-Up

**Relationship:** `1:N`

One healthcare worker can manage multiple follow-ups.

```text
HEALTHCARE_WORKER 1 ─────── N FOLLOW_UP
```

Each follow-up belongs to one healthcare worker when assigned.

An unassigned follow-up may be supported later if required.

---

# 22. User → Audit Log

**Relationship:** `1:N`

A user may generate many audit events.

```text
USER 1 ─────── N AUDIT_LOG
```

The audit log records the actor responsible for a sensitive action.

---

# 23. User → Sync Operation

**Relationship:** `1:N`

A user may generate multiple offline synchronization operations.

```text
USER 1 ─────── N SYNC_OPERATION
```

Each operation must have a unique client operation identifier.

---

# 24. Medical Document → Knowledge Chunk

**Relationship:** `1:N`

One medical document is divided into multiple chunks.

```text
MEDICAL_DOCUMENT 1 ─────── N KNOWLEDGE_CHUNK
```

Every chunk must retain its source document reference.

---

# 25. Vector Relationship

The vector is stored as part of the knowledge chunk.

Conceptually:

```text
Medical Document
      ↓
Knowledge Chunk
      ↓
Embedding Vector
```

The vector is not treated as a separate business entity unless later requirements justify such a design.

---

# 26. Primary Key Strategy

The baseline recommendation is:

**UUID**

for application-level entity identifiers.

Reasons:

* Avoid predictable sequential IDs.
* Better for distributed/offline operations.
* Suitable for synchronization.
* Avoid exposing simple record counts.
* Works well across services.

The exact UUID generation strategy will be selected during implementation.

---

# 27. Foreign Key Strategy

Foreign keys should enforce valid relationships.

Examples:

```text
patient_profile.user_id
consent.patient_id
symptom_record.patient_id
conversation.patient_id
conversation_message.conversation_id
prescription.patient_id
prescription_image.prescription_id
ocr_result.prescription_image_id
medication.patient_id
medication.prescription_id
medication_schedule.medication_id
medication_adherence.medication_schedule_id
timeline_event.patient_id
alert.patient_id
follow_up.patient_id
follow_up.healthcare_worker_id
audit_log.actor_user_id
sync_operation.user_id
knowledge_chunk.document_id
```

---

# 28. Nullable Foreign Keys

Nullable relationships should be used only when the business process genuinely permits the relationship to be absent.

Examples:

### Medication → Prescription

Potentially nullable.

Reason:

A medication may be entered through a verified workflow other than prescription OCR.

### Follow-Up → Healthcare Worker

Potentially nullable if the system supports an unassigned follow-up queue.

This decision should be finalized before implementation.

---

# 29. Deletion Strategy

Healthcare-related records require careful deletion behavior.

Default principle:

> Do not use unrestricted cascading deletes on historical healthcare records.

For example:

```text
Deleting User
      ↓
MUST NOT automatically destroy
      ↓
Audit / required historical records
```

The exact deletion/retention policy must be finalized before production deployment.

---

# 30. Historical Data Principle

Important healthcare events should be preserved as historical events wherever appropriate.

Prefer:

```text
Old Record
    +
New Record
```

over:

```text
Old Record
    ↓
Overwrite
```

This is especially important for:

* Medication adherence
* Consent changes
* Alerts
* Follow-ups
* AI/model evaluation metadata

---

# 31. Timeline Reference Design

`HEALTH_TIMELINE_EVENT.reference_id` is a polymorphic reference.

Conceptually:

```text
event_type = SYMPTOM_REPORTED
reference_id = symptom_record.id
```

or:

```text
event_type = PRESCRIPTION_ADDED
reference_id = prescription.id
```

Because relational databases cannot enforce a normal foreign key across multiple possible tables, application-level validation is required.

An alternative normalized event-reference design may be considered if this becomes problematic.

---

# 32. Conversation Data Boundary

Conversation messages should not automatically become:

* Symptoms
* Medical records
* Knowledge-base documents
* Clinical decisions

Instead:

```text
Conversation
      ↓
Relevant structured extraction
      ↓
Validated record
```

Only validated/approved information should enter corresponding structured healthcare entities.

---

# 33. AI Output Boundary

AI-generated information should be distinguishable from verified information.

For example:

```text
PATIENT DATA
    ≠
AI INTERPRETATION
    ≠
MEDICAL SOURCE
    ≠
HEALTHCARE WORKER ACTION
```

The schema should preserve this distinction where AI output is stored.

---

# 34. RAG Source Traceability

Every retrieved knowledge chunk must be traceable to:

```text
Knowledge Chunk
      ↓
Medical Document
      ↓
Publisher
      ↓
Source Reference
      ↓
Version
```

This enables source attribution and research reproducibility.

---

# 35. AI Reproducibility

Where AI-generated records are retained for research or audit purposes, metadata should allow reconstruction of:

```text
Input
+
Model Version
+
Prompt Version
+
Knowledge Base Version
+
Embedding Model
```

The exact implementation should avoid unnecessarily storing sensitive patient information.

---

# 36. Offline Data Relationship

Offline operations do not become independent healthcare records simply because they exist locally.

The lifecycle is:

```text
Local Operation
      ↓
SyncOperation
      ↓
Validation
      ↓
Authorized Server Operation
      ↓
Permanent Entity
```

This prevents arbitrary offline payloads from bypassing server validation.

---

# 37. Sync Operation Idempotency

`client_operation_id` must be unique.

Example:

```text
client_operation_id:
device-A-2026-08-11-000001
```

The actual format will be generated programmatically.

The same operation submitted twice must not create duplicate healthcare records.

---

# 38. Recommended Indexes

Initial indexes should include:

```text
USER(login_identifier)

PATIENT_PROFILE(user_id)

SYMPTOM_RECORD(patient_id, reported_at)

CONVERSATION(patient_id, started_at)

PRESCRIPTION(patient_id, created_at)

MEDICATION(patient_id)

MEDICATION_SCHEDULE(medication_id, status)

MEDICATION_ADHERENCE(medication_schedule_id, scheduled_at)

HEALTH_TIMELINE_EVENT(patient_id, event_time)

ALERT(patient_id, status)

FOLLOW_UP(patient_id, status)

AUDIT_LOG(actor_user_id, timestamp)

SYNC_OPERATION(user_id, status)

MEDICAL_DOCUMENT(review_status)

KNOWLEDGE_CHUNK(document_id)
```

Additional indexes should be introduced only after actual query patterns are known.

---

# 39. Unique Constraints

Initial unique constraints should include:

```text
ROLE.name

USER.login_identifier

PATIENT_PROFILE.user_id

HEALTHCARE_WORKER_PROFILE.user_id

SYNC_OPERATION.client_operation_id
```

Other uniqueness constraints should be added only when supported by business rules.

---

# 40. Data Integrity Rules

The database/application combination must enforce:

### User

A user must have a valid role.

### Patient

A patient profile must reference a valid user.

### Medication

A medication must belong to a valid patient.

### Schedule

A schedule must belong to a valid medication.

### Adherence

An adherence record must belong to a valid schedule.

### Prescription

A prescription must belong to a valid patient.

### OCR

An OCR result must reference a valid prescription image.

### Follow-Up

A follow-up must reference a valid patient and, when assigned, a valid healthcare worker.

### Knowledge

A knowledge chunk must reference a valid medical document.

---

# 41. Database Constraints vs Application Rules

Database constraints should handle:

* Required fields
* Foreign keys
* Uniqueness
* Basic valid values
* Referential integrity

Application logic should handle:

* Clinical rules
* Consent authorization
* Red-flag evaluation
* Medication workflow
* AI safety
* Complex validation
* Healthcare-worker authorization

The LLM must not be responsible for database integrity.

---

# 42. Transaction Boundaries

Operations involving multiple related entities should use transactions.

Example:

```text
Verify Prescription
       ↓
Create Medication
       ↓
Create Schedule
```

If schedule creation fails:

```text
Medication creation
      ↓
Rollback where appropriate
```

This prevents partially completed workflows.

---

# 43. ERD Review Against Core Requirements

| Requirement              | Database Support                 |
| ------------------------ | -------------------------------- |
| Authentication           | User + Role                      |
| RBAC                     | Role + User                      |
| Consent                  | Consent                          |
| Patient Profile          | PatientProfile                   |
| Symptoms                 | SymptomRecord                    |
| AI Conversations         | Conversation + Message           |
| Prescription OCR         | Prescription + Image + OCRResult |
| Medication               | Medication                       |
| Reminders                | MedicationSchedule               |
| Adherence                | MedicationAdherence              |
| Health Timeline          | HealthTimelineEvent              |
| Alerts                   | Alert                            |
| Healthcare Worker        | HealthcareWorkerProfile          |
| Follow-Up                | FollowUp                         |
| Medical Knowledge        | MedicalDocument                  |
| RAG                      | KnowledgeChunk + Vector          |
| Auditability             | AuditLog                         |
| Offline Sync             | SyncOperation                    |
| Research Reproducibility | Model/knowledge metadata         |

---

# 44. Deliberately Excluded Entities

The following are **not part of the baseline schema** unless future requirements justify them:

* Hospital
* Doctor directory
* Insurance
* Billing
* Payments
* Pharmacy
* Drug inventory
* Wearable devices
* Lab results
* Full EHR
* Appointment booking
* Ambulance dispatch
* Disease outbreak database

These appeared as possible future capabilities but are outside the current Core MVP.

---

# 45. Important Scope Boundary

MedGuide AI is **not being designed as a complete hospital information system or EHR replacement**.

The database should therefore remain focused on:

```text
Patient Support
+
Healthcare Worker Support
+
AI Assistance
+
Medication Support
+
Continuity of Care
+
RAG Knowledge
```

Avoid unnecessary enterprise healthcare complexity.

---

# 46. Schema Implementation Rule

Before implementing the database:

1. Review this ERD.
2. Resolve all `TBD` relationship decisions.
3. Convert entities into a concrete schema.
4. Define exact field types.
5. Define nullable fields.
6. Define constraints.
7. Define indexes.
8. Define migrations.
9. Test migrations.
10. Only then connect the API layer.

---

# 47. Current Database Status

| Component                            | Status                               |
| ------------------------------------ | ------------------------------------ |
| Logical entities                     | ✅ Defined                            |
| Major relationships                  | ✅ Defined                            |
| Cardinality                          | ✅ Defined                            |
| PK strategy                          | ✅ Baseline                           |
| FK strategy                          | ✅ Baseline                           |
| Indexing strategy                    | ✅ Baseline                           |
| RAG relationship                     | ✅ Defined                            |
| Offline synchronization relationship | ✅ Defined                            |
| Audit relationship                   | ✅ Defined                            |
| Exact SQL schema                     | ⏳ Next database implementation phase |
| Exact ORM models                     | ⏳ Backend phase                      |
| Migrations                           | ⏳ Backend phase                      |

---

# 48. Database Golden Rule

The database must preserve the distinction between:

```text
Identity
   ↓
Patient Data
   ↓
Medical Records
   ↓
AI Interpretation
   ↓
Healthcare Worker Actions
   ↓
Audit History
```

No layer should silently become another.

---

# 49. Final ERD Principle

The database should be:

**Minimal enough for the MVP, structured enough for research, secure enough for sensitive healthcare information, and extensible enough for future development.**

Do not add tables merely because a technology makes them possible.

Every entity must have a clear responsibility and traceability to an approved requirement or architectural decision.
