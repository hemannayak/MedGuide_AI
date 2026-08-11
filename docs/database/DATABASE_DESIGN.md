# MedGuide AI — Database Design

**Project:** MedGuide AI
**Document:** Database Design
**Version:** 1.0
**Status:** Baseline Database Architecture
**Database:** PostgreSQL
**Vector Extension:** pgvector
**Related Documents:**

* `AGENTS.md`
* `docs/PROJECT_SPECIFICATION.md`
* `docs/requirements/SRS.md`
* `docs/requirements/USE_CASES.md`
* `docs/requirements/PRE_DEVELOPMENT_DECISIONS.md`
* `docs/requirements/TRACEABILITY_MATRIX.md`
* `docs/architecture/SYSTEM_ARCHITECTURE.md`

---

# 1. Purpose

This document defines the logical database architecture for MedGuide AI.

It establishes:

* Core entities
* Relationships
* Data ownership
* Data classification
* Constraints
* Indexing principles
* Healthcare-data boundaries
* AI/RAG storage
* Auditability
* Offline synchronization support
* Data retention principles

The exact implementation schema may evolve during development, but changes must remain consistent with the approved requirements and architecture.

---

# 2. Database Objectives

The database must support:

1. Secure user management.
2. Role-based access.
3. Patient information.
4. Consent management.
5. Symptom records.
6. AI interactions where retention is required.
7. Prescription records.
8. OCR results.
9. Medication management.
10. Medication adherence.
11. Health timeline.
12. Alerts.
13. Healthcare-worker follow-ups.
14. Medical knowledge management.
15. RAG vector retrieval.
16. Audit logging.
17. Offline synchronization.
18. Future scalability.

---

# 3. Database Technology

## Primary Database

**PostgreSQL**

Reasons:

* Open source
* Mature relational database
* Strong constraints
* Transactions
* JSON support
* Indexing
* Good Python/FastAPI integration
* Suitable for structured healthcare data

## Vector Storage

**pgvector**

Used for:

* Medical knowledge embeddings
* Semantic retrieval
* RAG

The final vector configuration will depend on the selected embedding model.

---

# 4. Data Classification

The system should classify stored information.

| Classification     | Examples                                            |
| ------------------ | --------------------------------------------------- |
| Public             | Approved medical knowledge metadata                 |
| Internal           | System configuration                                |
| Sensitive          | Patient profile                                     |
| Highly Sensitive   | Symptoms, prescriptions, medications, conversations |
| Security-Sensitive | Password hashes, sessions, audit records            |

Sensitive information must have appropriate access controls.

---

# 5. Core Entity Overview

The initial logical entities are:

```text
User
Role
Consent
PatientProfile
HealthcareWorkerProfile
SymptomRecord
Conversation
ConversationMessage
Prescription
PrescriptionImage
OCRResult
Medication
MedicationSchedule
MedicationAdherence
HealthTimelineEvent
Alert
FollowUp
MedicalDocument
KnowledgeChunk
AuditLog
SyncOperation
```

Additional entities may be introduced only when justified by requirements or architecture.

---

# 6. Identity Model

## 6.1 User

Represents an authenticated system account.

Conceptual fields:

```text
email / username
password_hash
role_id
status
created_at
updated_at
last_login_at
```

Sensitive authentication information must never be stored in plaintext.

---

## 6.2 Role

Represents system permissions.

Initial roles:

```text
PATIENT
HEALTHCARE_WORKER
ADMIN
```

The role system should support future expansion without redesigning the identity model.

---

# 7. Patient Model

## 7.1 PatientProfile

Stores information specifically required for the patient experience.

Conceptual fields may include:

```text
id
user_id
display_name
date_of_birth / age where required
preferred_language
contact_information where required
created_at
updated_at
```

Only necessary information should be collected.

The final demographic fields must be finalized according to actual requirements and privacy considerations.

---

# 8. Healthcare Worker Model

## 8.1 HealthcareWorkerProfile

Represents additional information about an authorized healthcare worker.

Conceptual fields:

```text
id
user_id
name
worker_type
organization
status
created_at
updated_at
```

`worker_type` should support the approved categories of healthcare personnel.

The system must not assume that every healthcare worker is a physician.

---

# 9. Consent Model

## 9.1 Consent

Stores patient consent information.

Conceptual fields:

```text
id
patient_id
consent_type
status
version
granted_at
withdrawn_at
created_at
updated_at
```

Possible statuses:

```text
GRANTED
DENIED
WITHDRAWN
EXPIRED
```

The exact consent types will be finalized during security/privacy design.

---

# 10. Symptom Model

## 10.1 SymptomRecord

Represents a patient-reported symptom interaction.

Conceptual fields:

```text
id
patient_id
source
raw_input_reference
structured_data
reported_at
created_at
updated_at
```

Possible structured information:

```text
symptom
duration
severity
associated_symptoms
context
```

The system must distinguish:

**Patient-reported information**

from:

**AI-generated interpretation.**

---

# 11. Symptom Assessment

A separate assessment record may be used if required.

Potential information:

```text
symptom_record_id
risk_level
red_flags_detected
recommended_action
rule_version
evaluated_at
```

This separation allows triage logic to be versioned and evaluated independently.

Final implementation decision:

**TBD — Detailed Database Design**

---

# 12. Conversation Model

## 12.1 Conversation

Represents an AI interaction session where conversation retention is required.

Conceptual fields:

```text
id
patient_id
language
started_at
ended_at
status
```

---

## 12.2 ConversationMessage

Represents individual messages.

Conceptual fields:

```text
id
conversation_id
sender_type
content
created_at
metadata
```

Possible sender types:

```text
PATIENT
AI
SYSTEM
```

---

# 13. Conversation Privacy

The system should not retain conversations indefinitely by default.

Retention rules must be defined according to:

* Functional need
* Privacy requirements
* Research requirements
* Consent

Where possible, structured health information should be separated from raw conversational data.

---

# 14. Prescription Model

## 14.1 Prescription

Represents a prescription record.

Conceptual fields:

```text
id
patient_id
source
status
prescribed_date
verification_status
created_at
updated_at
```

Possible verification statuses:

```text
PENDING
VERIFIED
PARTIALLY_VERIFIED
REQUIRES_REVIEW
```

---

# 15. Prescription Image

## 15.1 PrescriptionImage

Stores metadata/reference for uploaded prescription images.

Conceptual fields:

```text
id
prescription_id
storage_reference
file_type
file_size
checksum
uploaded_at
```

The actual image should preferably be stored in secure file/object storage rather than directly in PostgreSQL.

---

# 16. OCR Model

## 16.1 OCRResult

Stores OCR processing results.

Conceptual fields:

```text
id
prescription_image_id
engine
model_version
raw_text
confidence
status
processed_at
```

Possible statuses:

```text
SUCCESS
LOW_CONFIDENCE
FAILED
REQUIRES_REVIEW
```

OCR output must remain distinguishable from verified prescription information.

---

# 17. Medication Model

## 17.1 Medication

Represents a medication associated with a patient.

Conceptual fields:

```text
id
patient_id
prescription_id
medicine_name
dosage
route
instructions
verification_status
created_at
updated_at
```

The database must not automatically assume OCR output is verified medication information.

---

# 18. Medication Schedule

## 18.1 MedicationSchedule

Represents when medication should be taken.

Conceptual fields:

```text
id
medication_id
frequency
schedule_data
start_date
end_date
timezone
status
created_at
updated_at
```

The schedule must be validated before reminders are generated.

---

# 19. Medication Adherence

## 19.1 MedicationAdherence

Stores patient-reported medication-taking events.

Conceptual fields:

```text
id
medication_schedule_id
scheduled_at
recorded_at
status
source
created_at
```

Possible statuses:

```text
TAKEN
MISSED
SKIPPED
UNKNOWN
```

The system should preserve event history rather than silently overwriting previous records.

---

# 20. Health Timeline

## 20.1 HealthTimelineEvent

Represents important patient health events.

Conceptual fields:

```text
id
patient_id
event_type
reference_id
event_time
metadata
created_at
```

Possible event types:

```text
SYMPTOM_REPORTED
AI_INTERACTION
PRESCRIPTION_ADDED
MEDICATION_CREATED
MEDICATION_TAKEN
ALERT_CREATED
FOLLOWUP_CREATED
FOLLOWUP_COMPLETED
```

The timeline should preferably reference source entities rather than duplicate their complete data.

---

# 21. Alert Model

## 21.1 Alert

Represents a system-generated or authorized healthcare alert.

Conceptual fields:

```text
id
patient_id
alert_type
severity
source
status
created_at
acknowledged_at
resolved_at
```

Possible statuses:

```text
OPEN
ACKNOWLEDGED
RESOLVED
DISMISSED
```

The exact alert severity classification will be determined from approved safety rules.

---

# 22. Follow-Up Model

## 22.1 FollowUp

Represents a healthcare-worker follow-up.

Conceptual fields:

```text
id
patient_id
healthcare_worker_id
reason
scheduled_at
status
notes
created_at
updated_at
```

Possible statuses:

```text
PENDING
COMPLETED
CANCELLED
MISSED
```

Sensitive notes require appropriate authorization.

---

# 23. Medical Knowledge Model

## 23.1 MedicalDocument

Represents an approved medical source.

Conceptual fields:

```text
id
title
publisher
source_reference
publication_date
version
language
topic
license
review_status
last_reviewed_at
created_at
updated_at
```

Possible review statuses:

```text
PENDING_REVIEW
APPROVED
OUTDATED
ARCHIVED
```

Only approved content should be used for production retrieval.

---

# 24. Knowledge Chunk

## 24.1 KnowledgeChunk

Represents a processed portion of a medical document.

Conceptual fields:

```text
id
document_id
chunk_index
content
embedding
metadata
created_at
```

The `embedding` field uses pgvector where supported.

---

# 25. Knowledge Versioning

The system should retain sufficient metadata to determine:

* Which source produced a chunk.
* Which source version was used.
* When the source was processed.
* Whether the source was active.
* Which embedding/model version generated the vector.

This is important for research reproducibility.

---

# 26. Audit Model

## 26.1 AuditLog

Represents security-relevant or sensitive operations.

Conceptual fields:

```text
id
actor_user_id
action
resource_type
resource_id
timestamp
ip_reference where appropriate
metadata
```

Audit logs should avoid storing unnecessary medical content.

Potential actions:

```text
LOGIN
PATIENT_ACCESSED
PATIENT_DATA_ACCESSED
CONSENT_CHANGED
PRESCRIPTION_ACCESSED
FOLLOWUP_CREATED
ALERT_ACCESSED
ADMIN_ACTION
```

---

# 27. Offline Synchronization Model

## 27.1 SyncOperation

Represents an operation generated while offline.

Conceptual fields:

```text
id
client_operation_id
user_id
operation_type
entity_type
entity_id
payload_reference
created_at
synced_at
status
retry_count
error_code
```

Possible statuses:

```text
PENDING
SYNCING
SYNCED
FAILED
CONFLICT
```

---

# 28. Idempotency

Offline operations must contain a unique client-generated operation identifier.

The server should use this identifier to prevent duplicate processing.

Conceptually:

```text
Client Operation ID
        ↓
Server receives operation
        ↓
Already processed?
   ┌────┴────┐
  YES        NO
   ↓          ↓
Ignore     Process
```

---

# 29. Conflict Handling

The system should avoid destructive synchronization where possible.

Health-related events should preferably be append-only.

For conflicting mutable data:

```text
Detect conflict
      ↓
Preserve existing server state
      ↓
Record conflict
      ↓
Apply predefined resolution
```

The exact conflict-resolution strategy will be finalized after database and offline implementation design.

---

# 30. Entity Relationships

High-level relationship model:

```text
User
 │
 ├── Role
 │
 ├── PatientProfile
 │       │
 │       ├── Consent
 │       ├── SymptomRecord
 │       ├── Conversation
 │       │      └── ConversationMessage
 │       ├── Prescription
 │       │      └── PrescriptionImage
 │       │              └── OCRResult
 │       ├── Medication
 │       │      └── MedicationSchedule
 │       │              └── MedicationAdherence
 │       ├── HealthTimelineEvent
 │       ├── Alert
 │       └── FollowUp
 │
 └── HealthcareWorkerProfile
          │
          └── FollowUp


MedicalDocument
      │
      └── KnowledgeChunk
             │
             └── Vector Embedding


User
 │
 └── AuditLog


User
 │
 └── SyncOperation
```

---

# 31. Simplified ER Diagram

```text
┌──────────────┐
│     USER     │
├──────────────┤
│ id           │
│ role_id      │
│ credentials  │
└──────┬───────┘
       │
   ┌───┴───────────────┐
   │                   │
   ↓                   ↓
┌──────────────┐  ┌────────────────────┐
│    PATIENT   │  │ HEALTHCARE_WORKER │
└──────┬───────┘  └─────────┬──────────┘
       │                    │
       ├──────────┐         │
       ↓          ↓         │
   ┌────────┐  ┌──────────┐ │
   │CONSENT │  │ SYMPTOM  │ │
   └────────┘  └──────────┘ │
       │                     │
       ↓                     │
┌──────────────┐             │
│ PRESCRIPTION │             │
└──────┬───────┘             │
       │                     │
       ↓                     │
┌──────────────┐             │
│ PRESCRIPTION │             │
│    IMAGE     │             │
└──────┬───────┘             │
       ↓                     │
┌──────────────┐             │
│  OCR RESULT  │             │
└──────┬───────┘             │
       ↓                     │
┌──────────────┐             │
│  MEDICATION  │◄────────────┘
└──────┬───────┘
       ↓
┌──────────────────┐
│ MEDICATION       │
│ SCHEDULE         │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ MEDICATION       │
│ ADHERENCE        │
└──────────────────┘


PATIENT
   │
   ├── CONVERSATION
   │      └── MESSAGE
   │
   ├── TIMELINE
   │
   ├── ALERT
   │
   └── FOLLOW_UP
           │
           └── HEALTHCARE_WORKER


MEDICAL_DOCUMENT
       │
       ↓
KNOWLEDGE_CHUNK
       │
       ↓
VECTOR EMBEDDING


USER
  │
  ├── AUDIT_LOG
  │
  └── SYNC_OPERATION
```

---

# 32. Foreign-Key Principles

Relationships should use foreign keys wherever appropriate.

Examples:

```text
patient.user_id → user.id
consent.patient_id → patient.id
symptom.patient_id → patient.id
prescription.patient_id → patient.id
medication.patient_id → patient.id
schedule.medication_id → medication.id
adherence.schedule_id → medication_schedule.id
followup.patient_id → patient.id
followup.healthcare_worker_id → healthcare_worker.id
knowledge_chunk.document_id → medical_document.id
```

Exact names will be finalized during implementation.

---

# 33. Referential Integrity

The database should enforce appropriate referential integrity.

Examples:

* A medication cannot reference a nonexistent patient.
* An adherence record cannot reference a nonexistent schedule.
* A knowledge chunk cannot reference a nonexistent document.
* A follow-up cannot reference a nonexistent healthcare worker.

Deletion behavior must be carefully selected for sensitive healthcare records.

Blind cascading deletion should not be used where it could destroy required audit/history information.

---

# 34. Soft Delete vs Hard Delete

Sensitive healthcare information requires deliberate deletion policies.

Where historical integrity is required, the system may use:

```text
deleted_at
```

instead of immediately physically deleting records.

However, soft deletion must not be used as an excuse to retain information indefinitely.

The final retention/deletion policy must comply with the approved privacy requirements.

---

# 35. Timestamp Requirements

Relevant entities should maintain timestamps.

Typical fields:

```text
created_at
updated_at
event_time
```

Healthcare events should use explicit event timestamps rather than relying only on database insertion time.

---

# 36. Timezone Handling

Medication schedules and reminders must account for timezone.

Recommended approach:

* Store timestamps in UTC where appropriate.
* Store user timezone separately.
* Convert timestamps for presentation and scheduling.

The final implementation must be tested around daylight/timezone edge cases where applicable.

---

# 37. Indexing Strategy

Indexes should be added based on actual query patterns.

Likely indexes include:

```text
User.email / username
PatientProfile.user_id
SymptomRecord.patient_id
SymptomRecord.reported_at
Conversation.patient_id
Prescription.patient_id
Medication.patient_id
MedicationSchedule.medication_id
MedicationAdherence.schedule_id
HealthTimelineEvent.patient_id + event_time
Alert.patient_id + status
FollowUp.patient_id + status
AuditLog.actor_user_id + timestamp
SyncOperation.user_id + status
MedicalDocument.review_status
KnowledgeChunk.document_id
```

Do not create excessive indexes without evidence of need.

---

# 38. Unique Constraints

Potential uniqueness requirements:

* User authentication identifier
* Client operation ID
* Appropriate role identifiers
* Approved document version combinations

Exact constraints will be finalized during implementation.

---

# 39. Data Validation

Database constraints should enforce basic data integrity.

Examples:

* Required fields
* Valid status values
* Valid timestamps
* Foreign-key relationships
* Appropriate uniqueness
* Reasonable data types

Application-level validation remains necessary for complex business rules.

---

# 40. JSON Usage

PostgreSQL JSON/JSONB may be used for flexible structures such as:

* Symptom metadata
* OCR metadata
* AI metadata
* Timeline metadata
* Model configuration
* Sync payload metadata

However, frequently queried fields should generally be represented as structured relational columns rather than hidden inside JSON.

---

# 41. Sensitive Data Boundary

The database should separate identity information from healthcare information where practical.

Conceptually:

```text
Identity Data
     │
     ↓
User
     │
     ↓
Patient Profile
     │
     ↓
Healthcare Data
```

Application services should control access between these domains.

---

# 42. AI Data Boundary

AI systems should not have unrestricted database access.

Instead:

```text
Database
   ↓
Authorized Service
   ↓
Minimum Required Data
   ↓
AI Gateway
   ↓
Model
```

This prevents unnecessary exposure of patient information.

---

# 43. RAG Data Boundary

Medical knowledge is separate from patient records.

```text
PATIENT DATA
     │
     │
     └─────── separate ────────┐
                               │
                               ↓
                    MEDICAL KNOWLEDGE
                               │
                         RAG / Vector
```

Patient data must not accidentally become part of the general medical knowledge base.

---

# 44. No Patient Data in Global RAG

Patient conversations, prescriptions, symptoms, or health records must not automatically enter the global medical knowledge base.

This prevents:

* Privacy leakage
* Knowledge contamination
* Cross-patient information exposure
* RAG poisoning

---

# 45. Research Dataset Separation

Research datasets should be separate from operational application data.

Conceptually:

```text
Application Data
      │
      ↓
De-identification / Approved Export
      │
      ↓
Research Dataset
      │
      ↓
Evaluation
```

No real patient information should be copied into research datasets without appropriate authorization and safeguards.

---

# 46. Model Metadata

AI-generated records that need reproducibility should be capable of referencing:

```text
model_name
model_version
embedding_model
prompt_version
knowledge_base_version
pipeline_version
```

This allows later reconstruction of AI experiments.

---

# 47. Medical Knowledge Versioning

RAG retrieval should be reproducible.

A response evaluation should be able to identify:

```text
Query
+
Knowledge Base Version
+
Embedding Model Version
+
LLM Version
+
Prompt Version
```

where technically feasible.

---

# 48. Database Backup

The database should have a documented backup strategy appropriate to the deployment environment.

The project documentation should identify:

* Backup method
* Backup frequency
* Storage location
* Restore procedure
* Verification method

Do not claim a production-grade backup strategy without testing restoration.

---

# 49. Migration Strategy

Database schema changes should be managed through version-controlled migrations.

The development workflow should follow:

```text
Schema Change
      ↓
Migration
      ↓
Test
      ↓
Review
      ↓
Apply
```

Manual undocumented production schema changes should be avoided.

---

# 50. ORM

A Python-compatible ORM or database toolkit may be used.

Potential options include:

* SQLAlchemy
* SQLModel
* Other suitable open-source solutions

The final choice will be made during backend implementation based on maintainability and project requirements.

---

# 51. Database Testing

Database testing should include:

* Constraint testing
* Foreign-key testing
* Authorization-related query testing
* Migration testing
* Transaction testing
* Duplicate prevention
* Offline synchronization testing
* Data integrity testing

---

# 52. Transaction Requirements

Operations that modify multiple related records should use appropriate database transactions.

Examples:

```text
Prescription verification
      ↓
Medication creation
      ↓
Schedule creation
```

If a required operation fails midway, the system should avoid leaving inconsistent records.

---

# 53. Concurrency

The system should account for concurrent updates where applicable.

Examples:

* Patient updates medication adherence.
* Healthcare worker records follow-up.
* Offline device synchronizes.
* Multiple devices update the same patient data.

The final strategy will be defined during backend implementation.

---

# 54. Database Security

Database access should use:

* Strong credentials
* Environment variables
* Least-privilege access
* Encrypted connections where supported
* Network restrictions where available
* No direct public exposure unless explicitly required
* Regular dependency/security review

---

# 55. Database Completion Criteria

The database design will be considered ready for implementation when:

* Core entities are identified.
* Relationships are defined.
* Sensitive data boundaries are defined.
* RAG storage is defined.
* Offline synchronization requirements are represented.
* Auditability is represented.
* Data ownership is clear.
* Referential integrity requirements are clear.
* Indexing strategy is documented.
* Retention/deletion strategy is documented.
* Migration strategy is defined.
* No major SRS requirement lacks database support where required.

---

# 56. Final Logical Model

The overall database architecture can be summarized as:

```text
                         ┌──────────────┐
                         │     USER     │
                         └──────┬───────┘
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
           ┌──────▼──────┐            ┌───────▼─────────┐
           │   PATIENT   │            │ HEALTHCARE      │
           │   PROFILE   │            │ WORKER PROFILE  │
           └──────┬──────┘            └────────┬────────┘
                  │                            │
       ┌──────────┼───────────┐                │
       │          │           │                │
       ▼          ▼           ▼                ▼
   CONSENT    SYMPTOMS   CONVERSATIONS      FOLLOW-UPS
                            │
                            ▼
                         MESSAGES

       PATIENT
          │
   ┌──────┼───────────┬────────────┐
   │      │           │            │
   ▼      ▼           ▼            ▼
PRESCRIPTION  MEDICATION      TIMELINE      ALERT
   │              │
   ▼              ▼
IMAGE         SCHEDULE
   │              │
   ▼              ▼
 OCR          ADHERENCE


MEDICAL DOCUMENT
       │
       ▼
KNOWLEDGE CHUNK
       │
       ▼
VECTOR EMBEDDING


USER
 │
 ├──── AUDIT LOG
 │
 └──── SYNC OPERATION
```

---

# 57. Database Golden Rules

1. **Never store plaintext passwords.**
2. **Never store secrets in the database unnecessarily.**
3. **Never allow unauthorized patient access.**
4. **Never treat OCR output as automatically verified medical data.**
5. **Never mix patient data into the global medical knowledge base.**
6. **Never allow the LLM unrestricted database access.**
7. **Never silently overwrite important healthcare history.**
8. **Never destroy audit/history information through careless cascading deletes.**
9. **Never store unnecessary patient information.**
10. **Never introduce a database entity without a justified requirement or architectural need.**
11. **Every sensitive data access must follow authorization rules.**
12. **Database changes must be version-controlled through migrations.**
13. **Research datasets must remain separated from operational patient data.**
14. **Database design must support reproducible AI evaluation where required.**

---

# 58. Final Principle

The database should preserve the distinction between:

```text
WHO?
Identity

WHAT DID THE PATIENT REPORT?
Patient Data

WHAT DOES THE MEDICAL SOURCE SAY?
Medical Knowledge

WHAT DID THE AI GENERATE?
AI Output

WHAT DID THE SYSTEM DETERMINE?
Safety / Workflow Decision

WHAT DID THE HEALTHCARE WORKER DO?
Follow-Up / Care Action

WHO ACCESSED WHAT?
Audit Record
```
