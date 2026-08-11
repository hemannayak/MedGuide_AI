# MedGuide AI — Use Case Specification

**Project:** MedGuide AI
**Document:** Use Case Specification
**Version:** 1.0
**Status:** Baseline
**Related Documents:**

* `AGENTS.md`
* `docs/PROJECT_SPECIFICATION.md`
* `docs/requirements/SRS.md`

---

# 1. Purpose

This document defines the major interactions between MedGuide AI and its users or system components.

Each use case identifies:

* Actor
* Objective
* Preconditions
* Main flow
* Alternative flows
* Exceptions
* Postconditions
* MVP status

The use cases serve as a bridge between the SRS and the system architecture.

---

# 2. System Actors

## 2.1 Patient

The primary end user who uses MedGuide AI for preliminary healthcare support.

## 2.2 Healthcare Worker

An authorized healthcare professional/personnel who reviews permitted patient information and manages follow-ups.

## 2.3 Administrator

An authorized system administrator responsible for approved system-level management.

## 2.4 AI/RAG System

The internal AI subsystem responsible for language processing, retrieval, response generation, and selected AI-assisted tasks.

It is a **system component, not a human actor**.

## 2.5 Notification Service

A system component responsible for reminders and approved notifications.

## 2.6 External Knowledge Sources

Approved medical information sources used to construct and maintain the RAG knowledge base.

---

# 3. Actor-Use Case Overview

| Actor                | Primary Use Cases                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Patient              | Registration, login, consent, profile, health query, symptom assessment, prescription upload, medication management, timeline, voice interaction |
| Healthcare Worker    | Login, patient review, alerts, summaries, follow-up                                                                                              |
| Administrator        | Approved system management                                                                                                                       |
| AI/RAG System        | Query processing, retrieval, response generation, summarization                                                                                  |
| Notification Service | Medication reminders, approved alerts                                                                                                            |
| Knowledge Sources    | Medical knowledge ingestion and updates                                                                                                          |

---

# 4. Patient Use Cases

---

## UC-P01 — Patient Registration

**Actor:** Patient

**Objective:** Create an account to access MedGuide AI.

### Preconditions

* Patient is not authenticated.
* Registration service is available.

### Main Flow

1. Patient opens the registration page.
2. Patient enters required information.
3. System validates the information.
4. System checks for duplicate account information.
5. System creates the account.
6. System confirms successful registration.
7. Patient proceeds to authentication.

### Alternative Flows

* Invalid information → system displays validation errors.
* Account already exists → system informs the patient.
* Server/database unavailable → registration fails safely.

### Postconditions

A valid patient account exists.

**Priority:** MVP

---

# 5. UC-P02 — Patient Authentication

**Actor:** Patient

**Objective:** Securely access the patient interface.

### Preconditions

* Patient account exists.

### Main Flow

1. Patient enters credentials.
2. System validates credentials.
3. System authenticates the patient.
4. System establishes a secure session.
5. Patient dashboard is displayed.

### Alternative Flows

* Invalid credentials → authentication failure.
* Account unavailable/disabled → access denied.
* Authentication service unavailable → safe error message.

### Postconditions

Patient is securely authenticated.

**Priority:** MVP

---

# 6. UC-P03 — Manage Consent

**Actor:** Patient

**Objective:** Provide and manage consent for applicable processing and authorized healthcare-worker access.

### Preconditions

* Patient is authenticated.

### Main Flow

1. System presents applicable consent information.
2. Patient reviews the information.
3. Patient provides or declines consent.
4. System records consent status and timestamp.
5. System applies the consent status to relevant operations.

### Alternative Flows

* Patient declines optional consent → associated functionality remains unavailable.
* Consent is withdrawn → applicable future access/processing is restricted according to system policy.

### Postconditions

Current consent status is recorded.

**Priority:** MVP

---

# 7. UC-P04 — Manage Patient Profile

**Actor:** Patient

**Objective:** View and update permitted personal information.

### Main Flow

1. Patient opens profile.
2. System retrieves authorized profile information.
3. Patient updates permitted fields.
4. System validates changes.
5. System stores the updated information.

### Postconditions

Patient profile reflects valid updates.

**Priority:** MVP

---

# 8. UC-P05 — Ask Health Question

**Actor:** Patient
**Supporting Actor:** AI/RAG System

**Objective:** Obtain preliminary healthcare information.

### Preconditions

* Patient is authenticated.
* Required AI functionality is available.

### Main Flow

1. Patient enters a health-related question.
2. System validates the input.
3. System detects language where required.
4. System determines the query intent.
5. System retrieves relevant information from the approved medical knowledge base.
6. Retrieved context is provided to the AI generation component.
7. AI generates a grounded response.
8. Safety validation is performed.
9. System presents the response.
10. Relevant sources or source metadata may be presented where appropriate.

### Alternative Flows

**No relevant knowledge found:**

1. System identifies insufficient knowledge.
2. System avoids unsupported generation.
3. System provides a safe response indicating the limitation.
4. System may recommend professional consultation.

**Potentially high-risk query:**

1. System identifies relevant risk indicators.
2. System activates the appropriate escalation pathway.
3. Patient receives appropriate guidance.

### Postconditions

The patient receives preliminary, safety-aware healthcare information.

**Priority:** MVP

---

# 9. UC-P06 — Report Symptoms

**Actor:** Patient
**Supporting Actor:** AI/RAG System

**Objective:** Submit symptoms for preliminary assessment.

### Main Flow

1. Patient describes symptoms.
2. System processes the input.
3. System extracts structured symptom information where possible.
4. System identifies missing information where necessary.
5. System evaluates predefined safety indicators.
6. System retrieves relevant medical information if required.
7. System generates preliminary guidance.
8. System displays the result and appropriate next steps.

### Important Constraint

The system must not represent the output as a definitive diagnosis.

### Alternative Flows

**Insufficient information:**

System asks for relevant additional information rather than making unsupported assumptions.

**Red flag detected:**

System activates the appropriate escalation pathway.

**Uncertain extraction:**

System clearly identifies uncertainty and avoids treating uncertain information as fact.

### Postconditions

The symptom interaction is recorded appropriately in the patient's health timeline, subject to consent and system policy.

**Priority:** MVP

---

# 10. UC-P07 — Red-Flag Detection and Escalation

**Actor:** Patient
**Supporting Components:** Triage Engine, AI/RAG System

**Objective:** Identify predefined indicators requiring urgent or emergency attention.

### Main Flow

1. Patient submits symptoms.
2. System converts relevant information into structured data.
3. Safety rules evaluate applicable red flags.
4. System determines the applicable risk category.
5. System presents appropriate escalation guidance.
6. If configured and authorized, the system creates an alert for the healthcare-worker interface.

### Risk Categories

The exact categories and clinical rules must be derived from approved medical sources.

The conceptual categories are:

* General guidance
* Routine consultation
* Urgent professional attention
* Emergency attention

### Safety Rule

The system must not invent clinical thresholds.

### Postconditions

The patient receives appropriate escalation guidance.

**Priority:** MVP

---

# 11. UC-P08 — Upload Prescription

**Actor:** Patient

**Objective:** Upload a prescription image for information extraction.

### Main Flow

1. Patient opens prescription functionality.
2. Patient selects or captures an image.
3. System validates the file.
4. System checks image quality where possible.
5. System passes the image to OCR processing.

### Alternative Flows

* Unsupported format → reject with clear explanation.
* Poor image quality → request a clearer image.
* Processing failure → display safe error.
* Prescription cannot be reliably interpreted → request verification.

### Postconditions

A prescription image is available for OCR processing.

**Priority:** MVP

---

# 12. UC-P09 — Process Prescription

**Actor:** Patient
**Supporting Component:** OCR System

**Objective:** Extract medication information from a prescription.

### Main Flow

1. System preprocesses the prescription image.
2. OCR extracts text.
3. NLP processing identifies possible medicine information.
4. System attempts to identify:

   * Medicine name
   * Dosage
   * Frequency
   * Duration
   * Instructions
5. System associates confidence/verification information where applicable.
6. Patient reviews extracted information.
7. Verified information can be used for medication management.

### Alternative Flows

**Unreadable prescription:**

System asks the patient to upload a clearer image.

**Low-confidence extraction:**

System marks information for verification.

**Ambiguous medicine name:**

System must not silently substitute another medicine.

### Critical Rule

OCR output is **not automatically considered clinically verified**.

### Postconditions

A structured prescription record is created only from information that is sufficiently verified according to system rules.

**Priority:** MVP

---

# 13. UC-P10 — Manage Medication

**Actor:** Patient

**Objective:** Create and manage medication schedules.

### Main Flow

1. Patient opens medication management.
2. System displays verified medication information.
3. Patient confirms or enters permitted schedule information.
4. System validates the schedule.
5. System stores the medication schedule.
6. Reminder configuration is created.

### Alternative Flows

* Missing dosage/frequency → request verification.
* Invalid schedule → display validation error.
* Unverified prescription information → prevent unsafe automatic scheduling where required.

### Postconditions

A medication schedule exists.

**Priority:** MVP

---

# 14. UC-P11 — Receive Medication Reminder

**Actor:** Patient
**Supporting Component:** Notification Service

**Objective:** Remind the patient about scheduled medication.

### Main Flow

1. System checks medication schedules.
2. Reminder time is reached.
3. Notification is generated.
4. Patient receives the reminder.
5. Patient may record medication adherence.

### Offline Requirement

Where technically supported, locally scheduled reminders should continue functioning without active internet connectivity.

**Priority:** MVP

---

# 15. UC-P12 — Record Medication Adherence

**Actor:** Patient

**Objective:** Record whether scheduled medication was taken.

### Main Flow

1. Patient receives reminder.
2. Patient selects the appropriate adherence action.
3. System records the event.
4. Health timeline is updated.
5. Adherence statistics may be calculated.

### Postconditions

Adherence event is recorded.

**Priority:** MVP

---

# 16. UC-P13 — View Health Timeline

**Actor:** Patient

**Objective:** Review a chronological history of relevant health information.

### Possible Timeline Events

* Symptom reports
* AI interactions
* Prescriptions
* Medications
* Medication adherence
* Alerts
* Follow-ups

### Main Flow

1. Patient opens health timeline.
2. System retrieves authorized timeline events.
3. Events are displayed chronologically.
4. Patient can view relevant details.

**Priority:** MVP

---

# 17. UC-P14 — Use Voice Interaction

**Actor:** Patient
**Supporting Component:** Speech Processing System

**Objective:** Submit healthcare queries or symptoms using voice.

### Main Flow

1. Patient selects voice input.
2. Patient speaks.
3. Speech-to-text system processes audio.
4. Transcript is returned.
5. Patient can verify/edit the transcript where appropriate.
6. Healthcare AI pipeline processes the text.
7. Response is returned.

### Alternative Flows

* Speech cannot be understood → request repetition.
* Unsupported language → clearly inform the user.
* Low confidence → allow manual correction.

### Evaluation

Speech performance must be evaluated for the selected languages.

**Priority:** MVP

---

# 18. UC-P15 — Use Multilingual Interaction

**Actor:** Patient

**Objective:** Interact with the platform in supported languages.

### Main Flow

1. Patient selects or system detects a supported language.
2. Input is processed in the selected language.
3. AI/translation pipeline processes the query.
4. Response is generated.
5. Response is returned in the selected language.

### Constraint

A language must not be presented as officially supported until its functionality has been tested.

**Priority:** MVP

---

# 19. UC-P16 — Use Offline Functionality

**Actor:** Patient

**Objective:** Continue using supported features when connectivity is unavailable.

### Offline Features

Potentially:

* Cached profile
* Health timeline
* Medication schedule
* Medication reminders
* Basic symptom rules
* Cached health information
* Queued operations

### Main Flow

1. Connectivity becomes unavailable.
2. Application detects offline state.
3. User accesses supported offline functionality.
4. Local data is used.
5. Operations requiring synchronization are queued.
6. Connectivity is restored.
7. System synchronizes queued operations.

### Alternative Flows

* Synchronization failure → operation remains queued and retry is scheduled.
* Conflict detected → apply predefined conflict-resolution logic.
* Duplicate operation → prevent duplicate record creation.

**Priority:** MVP

---

# 20. UC-P17 — Healthcare Worker Authentication

**Actor:** Healthcare Worker

**Objective:** Securely access the healthcare-worker dashboard.

### Main Flow

1. Healthcare worker enters credentials.
2. System validates credentials.
3. System establishes authenticated session.
4. Dashboard is displayed.

**Priority:** MVP

---

# 21. UC-P18 — Review Patient

**Actor:** Healthcare Worker

**Objective:** Review authorized patient information.

### Main Flow

1. Healthcare worker opens patient list.
2. System displays authorized patients.
3. Healthcare worker selects a patient.
4. System retrieves permitted information.
5. Worker reviews:

   * Profile
   * Symptoms
   * Health timeline
   * Medications
   * Adherence
   * Alerts
   * AI-generated summary

### Authorization Rule

The healthcare worker must only access patients they are authorized to view.

**Priority:** MVP

---

# 22. UC-P19 — Review AI-Generated Patient Summary

**Actor:** Healthcare Worker
**Supporting Component:** AI/RAG System

**Objective:** Quickly understand patient-reported information.

### Main Flow

1. Healthcare worker opens a patient record.
2. System retrieves relevant structured information.
3. AI generates a summary.
4. Summary is displayed.
5. Source patient information remains accessible for verification.

### Safety Rule

The AI summary must not be treated as a verified clinical diagnosis.

The interface should distinguish:

**Patient-reported/recorded information**

from

**AI-generated interpretation or summary.**

**Priority:** MVP

---

# 23. UC-P20 — Review Patient Alert

**Actor:** Healthcare Worker

**Objective:** Review potentially urgent patient events.

### Main Flow

1. A defined event triggers an alert.
2. System records the alert.
3. Authorized healthcare worker sees the alert.
4. Worker opens the associated patient information.
5. Worker reviews relevant information.
6. Worker determines the appropriate follow-up action.

### Postconditions

Alert is reviewed and its status is updated.

**Priority:** MVP

---

# 24. UC-P21 — Record Follow-Up

**Actor:** Healthcare Worker

**Objective:** Maintain continuity of care.

### Main Flow

1. Healthcare worker opens a patient record.
2. Worker creates a follow-up record.
3. Worker enters relevant information.
4. System validates and stores the record.
5. Follow-up appears in the patient's timeline.

**Priority:** MVP

---

# 25. UC-P22 — Discover Nearby Healthcare Resources

**Actor:** Patient

**Objective:** Identify nearby healthcare facilities or resources.

### Main Flow

1. Patient requests nearby healthcare resources.
2. System obtains location according to user permission and available capability.
3. System retrieves healthcare-resource information from an approved geographic source.
4. System displays relevant nearby resources.
5. Where supported, estimated distance/travel information is shown.

### Safety Constraint

The resource locator must not be represented as an emergency-response service.

**Priority:** MVP/Phase 2

---

# 26. UC-P23 — System Administration

**Actor:** Administrator

**Objective:** Perform approved administrative operations.

Potential operations may include:

* User management
* Healthcare-worker management
* System configuration
* Knowledge-base management
* Audit review

Administrative functionality shall be implemented only where explicitly required.

**Priority:** Limited MVP

---

# 27. UC-P24 — Update Medical Knowledge Base

**Actor:** Administrator / Authorized Knowledge Manager
**Supporting Component:** Knowledge Repository

**Objective:** Maintain the approved medical knowledge base.

### Main Flow

1. Authorized user selects an approved medical document.
2. System validates document metadata.
3. Document is processed.
4. Document is cleaned and chunked.
5. Embeddings are generated.
6. Chunks and metadata are stored.
7. Vector index is updated.
8. Knowledge source becomes available for retrieval.

### Required Metadata

Where available:

* Source
* Publisher
* Title
* Publication/update date
* Version
* Topic
* Language
* Usage/license information

### Safety Rule

Unverified medical documents must not be added to the production knowledge base.

**Priority:** MVP

---

# 28. UC-P25 — Generate RAG Response

**Actor:** AI/RAG System

**Objective:** Generate an answer grounded in approved healthcare knowledge.

### Main Flow

1. Receive user query.
2. Process query.
3. Generate query embedding.
4. Search vector database.
5. Retrieve relevant knowledge chunks.
6. Construct context.
7. Generate response using selected LLM.
8. Perform safety validation.
9. Return response.

### Alternative Flow

If relevant knowledge cannot be retrieved:

* Do not fabricate supporting evidence.
* Communicate the limitation.
* Provide safe general guidance where appropriate.
* Escalate to professional care when appropriate.

**Priority:** MVP

---

# 29. UC-P26 — Synchronize Offline Data

**Actor:** Patient
**Supporting Component:** Synchronization Service

**Objective:** Synchronize locally queued information after connectivity returns.

### Main Flow

1. Application detects connectivity.
2. Synchronization queue is inspected.
3. Pending operations are submitted.
4. Server validates operations.
5. Valid operations are committed.
6. Local queue is updated.
7. Synchronization status is recorded.

### Alternative Flows

* Network failure → retry.
* Validation failure → retain error information.
* Duplicate → prevent duplicate insertion.
* Conflict → apply predefined conflict strategy.

**Priority:** MVP

---

# 30. Cross-Cutting Error Scenarios

The system should safely handle:

### Invalid user input

Return clear validation feedback.

### Network failure

Use appropriate retry/offline behavior.

### AI service failure

Do not fabricate a response.

### RAG retrieval failure

Do not claim unsupported knowledge was retrieved.

### OCR failure

Ask for a clearer image or manual verification.

### Speech recognition failure

Allow retry or text input.

### Database failure

Return a safe error and avoid silent data loss.

### Unauthorized access

Reject the operation.

### Insufficient information

Ask for relevant information rather than guessing.

---

# 31. Safety-Critical Interaction Principle

For any healthcare interaction:

```text
User Input
    ↓
Understand
    ↓
Check Safety
    ↓
Retrieve Evidence
    ↓
Generate Assistance
    ↓
Validate
    ↓
Escalate if Required
```

The system must not prioritize conversational fluency over safety.

---

# 32. Use Case Priority

| ID     | Use Case                         | Priority      |
| ------ | -------------------------------- | ------------- |
| UC-P01 | Registration                     | Core MVP      |
| UC-P02 | Authentication                   | Core MVP      |
| UC-P03 | Consent                          | Core MVP      |
| UC-P04 | Profile                          | Core MVP      |
| UC-P05 | Health Query                     | Core MVP      |
| UC-P06 | Symptom Reporting                | Core MVP      |
| UC-P07 | Red-Flag/Escalation              | Core MVP      |
| UC-P08 | Prescription Upload              | Core MVP      |
| UC-P09 | Prescription Processing          | Core MVP      |
| UC-P10 | Medication Management            | Core MVP      |
| UC-P11 | Medication Reminder              | Core MVP      |
| UC-P12 | Adherence                        | Core MVP      |
| UC-P13 | Health Timeline                  | Core MVP      |
| UC-P14 | Voice                            | Core MVP      |
| UC-P15 | Multilingual                     | Core MVP      |
| UC-P16 | Offline Functionality            | Core MVP      |
| UC-P17 | Healthcare Worker Authentication | Core MVP      |
| UC-P18 | Patient Review                   | Core MVP      |
| UC-P19 | AI Patient Summary               | Core MVP      |
| UC-P20 | Alerts                           | Core MVP      |
| UC-P21 | Follow-Up                        | Core MVP      |
| UC-P22 | Resource Discovery               | MVP / Phase 2 |
| UC-P23 | Administration                   | Limited MVP   |
| UC-P24 | Knowledge Management             | Core System   |
| UC-P25 | RAG Generation                   | Core System   |
| UC-P26 | Offline Synchronization          | Core MVP      |

---

# 33. Use Case Relationships

The major system relationships are:

```text
                    MEDGUIDE AI
                         │
              ┌──────────┴──────────┐
              │                     │
           PATIENT            HEALTHCARE WORKER
              │                     │
      ┌───────┼────────┐            │
      ↓       ↓        ↓            ↓
     AI     Symptoms   Rx        Patient Review
      │       │        │            │
      │       ↓        ↓            ├── Summary
      │    Triage     OCR            ├── Alerts
      │       │        │             └── Follow-up
      │       ↓        ↓
      │   Escalation  Medication
      │                  │
      └──────────┐       ↓
                 ↓    Timeline
                RAG
                 │
                 ↓
          Medical Knowledge Base
```

---

# 34. MVP Boundary Rule

A use case marked **Core MVP** should be implemented before optional features.

A use case marked **Phase 2** should not delay the completion of the Core MVP.

Future features must not be implemented simply because they are technically interesting.

---

# 35. Traceability Principle

Every use case must eventually map to:

```text
Use Case
   ↓
Requirement
   ↓
System Module
   ↓
API
   ↓
Database Entity
   ↓
Implementation
   ↓
Test
   ↓
Evaluation Metric
```

Example:

```text
UC-P07
Red-Flag Detection
      ↓
FR-09
Red-Flag Detection
      ↓
Triage Service
      ↓
POST /symptoms/analyze
      ↓
SymptomRecord + Alert
      ↓
Triage Engine
      ↓
Triage Tests
      ↓
Sensitivity / Specificity
```

This traceability will be maintained throughout the project.

---

# 36. Final Use Case Principle

MedGuide AI should consistently follow:

> **Understand → Assist → Identify Risk → Escalate → Support Continuity of Care**

The system must never evolve into an autonomous diagnostic or treatment system without a completely separate and appropriately validated clinical framework.
