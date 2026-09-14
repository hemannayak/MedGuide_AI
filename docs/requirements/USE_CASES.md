# MedGuide AI — Use Case Specification

**Document Version:** 2.0  
**Project:** MedGuide AI  
**Domain:** Rural Healthcare / AI / NLP / Speech / OCR / Digital Health  
**Primary Users:** Patients, Healthcare Workers  
**Supporting Role:** Administrator  
**Phase-1 Languages:** English, Hindi, Telugu  
**Status:** Development Specification  
**Last Updated:** August 2026

---

# 1. Purpose

This document defines the major user-system interactions of MedGuide AI.

The use cases are designed around the project's primary objective:

> Provide a simple, multilingual, low-resource healthcare-support layer that helps users understand symptoms, identify potential risk, access grounded health information, understand prescriptions, manage medications, and connect with appropriate healthcare support.

MedGuide AI follows:

> **Assist → Inform → Identify Risk → Escalate**

The system does not:

> **Diagnose → Prescribe → Replace Doctor**

---

# 2. Actors

## 2.1 Primary Actors

### Patient

A rural or underserved user seeking preliminary healthcare information and support.

The patient may have:

- Limited digital literacy
- Limited health literacy
- Limited access to healthcare professionals
- Limited or intermittent internet connectivity
- A preference for local languages
- Difficulty understanding medical terminology

---

### Healthcare Worker

An authorized healthcare worker such as:

- ASHA worker
- ANM
- Community healthcare worker
- Authorized rural healthcare professional

The healthcare worker can review authorized patient information and provide follow-up support.

---

## 2.2 Supporting Actors

### Administrator

Responsible for approved system-level operations, monitoring, and administration.

---

### AI Gateway

Application abstraction layer responsible for routing AI processing to appropriate providers.

Possible providers include:

- Local LLM through Ollama
- Local/open-source speech models
- Local/open-source OCR
- Sarvam AI online services
- Other evaluated providers

---

### Deterministic Triage Engine

Rule-based safety component responsible for safety-critical symptom classification.

---

### RAG Knowledge Base

Authoritative medical knowledge repository containing approved healthcare sources.

Potential sources include:

- WHO
- Government health resources
- Approved primary-care guidelines
- Other verified medical sources

---

### PostgreSQL + pgvector

Stores application data and vectorized medical knowledge.

---

### Notification System

Responsible for medication reminders and other approved notifications.

---

# 3. Primary Patient Journey

The patient experience is intentionally centered around the Preliminary Symptom Checker.

```text
Patient
  │
  ▼
Register / Login
  │
  ▼
Consent
  │
  ▼
Language + Profile
  │
  ▼
★ Preliminary Symptom Checker
  │
  ▼
Describe Symptoms
  │
  ▼
Structured Symptom Understanding
  │
  ▼
Deterministic Safety Triage
  │
  ├───────────────┬────────────────┐
  ▼               ▼                ▼
EMERGENCY        URGENT           ROUTINE
  │               │                │
  ▼               ▼                ▼
108 / 112      Professional      RAG-grounded
Escalation     Evaluation        Guidance
                                   │
                                   ▼
                              AI Companion
```

The system should make the next action obvious at every stage.

---

# 4. Patient Use Cases

---

## UC-P01 — Register Account

**Actor:** Patient

**Goal:** Create a MedGuide AI account.

### Preconditions

* Patient is not authenticated.

### Main Flow

1. Patient opens the registration page.
2. Patient provides required information.
3. Patient selects their preferred language.
4. Patient selects their role.
5. System validates the information.
6. System creates the account.
7. System authenticates the patient.
8. Patient proceeds to consent/onboarding.

### Alternative Flow

If validation fails:

1. System identifies invalid fields.
2. System displays understandable error messages.
3. Patient corrects the information.

### Postconditions

A valid patient account exists.

---

# 5. Authentication

## UC-P02 — Login

**Actor:** Patient / Healthcare Worker / Administrator

**Goal:** Securely access authorized functionality.

### Main Flow

1. User enters email/phone.
2. User enters password.
3. System validates credentials.
4. System creates an authenticated session.
5. System determines user role.
6. User is redirected to the appropriate interface.

### Patient

The patient is directed toward the primary healthcare workflow:

> **Preliminary Symptom Checker**

### Alternative Flow

Invalid credentials:

* Display safe authentication error.
* Do not reveal whether an account exists.

---

# 6. Consent

## UC-P03 — Provide Healthcare Data Consent

**Actor:** Patient

**Goal:** Provide explicit consent before protected healthcare workflows.

### Main Flow

1. Patient reads consent information.
2. System explains healthcare-support limitations.
3. Patient accepts required consent.
4. System records consent.
5. System creates an audit record.
6. Protected workflows become available.

### Alternative Flow

If consent is not provided:

* Protected healthcare workflows remain unavailable.
* Patient can review consent information again.

---

## UC-P04 — Manage Consent

**Actor:** Patient

**Goal:** View or withdraw consent.

### Main Flow

1. Patient opens consent settings.
2. System displays current consent status.
3. Patient requests withdrawal where supported.
4. System records the change.
5. System updates access to affected workflows.

---

# 7. Patient Profile

## UC-P05 — Create / Update Patient Profile

**Actor:** Patient

**Goal:** Provide information required for personalized healthcare-support workflows.

### Information May Include

* Age
* Gender
* Preferred language
* Allergies
* Relevant medical history
* Emergency contact
* Village/town

### Main Flow

1. Patient enters profile information.
2. System validates fields.
3. System stores the information.
4. Patient can update it later.

---

# 8. Primary Symptom Checker

## UC-P06 — Start Preliminary Symptom Check

**Actor:** Patient

**Goal:** Begin a simple preliminary health assessment.

### Main Flow

1. Patient signs in.
2. System presents the Preliminary Symptom Checker as a primary action.
3. Patient selects or describes what they are experiencing.
4. System guides the patient through simple questions.
5. System collects relevant symptom information.

### Design Principle

The user should not need to know medical terminology.

For example:

> "I have fever since two days."

should be accepted as a valid input.

---

# 9. Symptom Input

## UC-P07 — Describe Symptoms

**Actor:** Patient

**Goal:** Provide symptom information.

### Input Methods

The system may support:

* Text
* Structured symptom selection
* Voice

### Information Collected

Where available:

* Symptom
* Duration
* Severity
* Associated symptoms
* Relevant risk indicators

The original user description should be preserved.

---

# 10. Structured Symptom Understanding

## UC-P08 — Structure Symptom Information

**Actor:** System

**Goal:** Convert patient-described symptoms into structured information for downstream safety evaluation.

### Main Flow

1. System receives patient input.
2. System identifies symptoms.
3. System identifies duration.
4. System identifies severity.
5. System identifies associated symptoms.
6. System produces a structured representation.
7. Structured information is passed to the deterministic triage engine.

### Important Constraint

LLM-generated interpretation must not override deterministic safety rules.

---

# 11. Deterministic Triage

## UC-P09 — Evaluate Symptom Risk

**Actor:** Deterministic Triage Engine

**Goal:** Identify potential risk using predefined safety rules.

### Main Flow

1. System receives structured symptom information.
2. Triage engine evaluates red-flag criteria.
3. System determines one of:

```text
ROUTINE
URGENT
EMERGENCY
```

4. System records the result.
5. System selects the appropriate next action.

### Important Constraint

The LLM cannot downgrade or override an emergency classification.

---

# 12. Emergency Escalation

## UC-P10 — Emergency Escalation

**Actor:** Patient / Deterministic Triage Engine

**Trigger:** Emergency red flag detected.

### Main Flow

1. Triage engine detects an emergency indicator.
2. Normal AI guidance flow is stopped.
3. System displays a prominent emergency warning.
4. System recommends immediate professional/emergency care.
5. System provides **108 / 112** information.
6. System displays appropriate emergency instructions.
7. Patient is directed toward emergency medical care.

### Important Constraint

The LLM is bypassed for safety-critical emergency messaging wherever deterministic handling is available.

### Example

```text
EMERGENCY
Immediate medical attention may be required.

Call 108 or 112
or go to the nearest emergency facility.
```

---

# 13. Urgent Guidance

## UC-P11 — Urgent Healthcare Referral

**Actor:** Patient / Triage Engine

**Trigger:** URGENT risk classification.

### Main Flow

1. Triage engine identifies urgent risk.
2. System explains that prompt professional evaluation is recommended.
3. System recommends an appropriate healthcare facility or healthcare professional.
4. System may provide supporting information.

The system shall not present an urgent classification as a diagnosis.

---

# 14. Routine Guidance

## UC-P12 — Provide Preliminary Health Guidance

**Actor:** Patient / RAG System

**Trigger:** ROUTINE classification.

### Main Flow

1. Triage engine determines routine risk.
2. System prepares the patient query.
3. RAG system searches approved medical sources.
4. Evidence sufficiency is evaluated.
5. Relevant evidence is provided to the AI Gateway.
6. LLM generates a grounded explanation.
7. Output is validated.
8. Sources are attached.
9. Response is shown in the patient's selected language.

---

# 15. AI Companion

## UC-P13 — Ask MedGuide

**Actor:** Patient

**Goal:** Ask a health-related question using text or voice.

### Main Flow

1. Patient opens AI Companion.
2. Patient enters or speaks a question.
3. System determines language.
4. Safety triage is performed where applicable.
5. RAG retrieves relevant evidence.
6. Evidence sufficiency is evaluated.
7. AI Gateway selects the configured provider.
8. LLM generates a response.
9. Safety/output validation is performed.
10. Source information is attached.
11. Response is displayed.

### Response Structure May Include

* What it may mean
* What the user can do
* When to seek help
* Safety warning
* Sources

The exact response structure may vary according to the use case.

---

# 16. RAG Retrieval

## UC-P14 — Retrieve Medical Evidence

**Actor:** RAG System

**Goal:** Retrieve authoritative information relevant to a patient query.

### Main Flow

```text
User Query
    ↓
Query Embedding
    ↓
pgvector Search
    ↓
Relevant Chunks
    ↓
Evidence Sufficiency Check
```

### Evidence Gate

An initial operational similarity threshold of **0.55** may be used based on current calibration.

This value is configurable and must not be treated as a universal medical threshold.

### Alternative Flow

If evidence is insufficient:

* Do not fabricate an answer.
* Return a safe refusal/disclosure.

---

# 17. Safe Refusal

## UC-P15 — Refuse Unsupported Medical Question

**Actor:** AI Gateway / RAG System

**Trigger:** Insufficient evidence.

### Main Flow

1. Query is evaluated.
2. Relevant evidence is not sufficient.
3. System prevents unsupported medical generation.
4. System provides a localized safe response.
5. System may recommend consulting a qualified healthcare professional.

---

# 18. Source Provenance

## UC-P16 — Display Medical Sources

**Actor:** Patient

**Goal:** Understand where health information came from.

### Main Flow

1. RAG retrieves medical evidence.
2. System records source metadata.
3. AI response is generated.
4. System attaches source metadata.
5. Patient can inspect source information.

### Source Information May Include

* Publisher
* Document title
* Section
* Page
* Document ID
* Source URL

The LLM must not be trusted to invent source metadata.

---

# 19. Voice Input

## UC-P17 — Speak to MedGuide

**Actor:** Patient

**Goal:** Ask a health question using voice.

### Main Flow

1. Patient presses the voice button.
2. System records audio.
3. Speech-to-text provider processes the audio.
4. System displays the transcript.
5. Patient can confirm or edit the transcript.
6. Transcript enters the normal MedGuide pipeline.

### Provider Options

```text
Voice Input
     │
     ├── Local/Open-source STT
     │
     └── Sarvam AI STT
```

The final provider is selected through evaluation and availability.

---

# 20. Voice Output

## UC-P18 — Hear MedGuide Response

**Actor:** Patient

**Goal:** Listen to health guidance.

### Main Flow

1. System generates a validated response.
2. Text-to-speech provider converts the response to audio.
3. Audio is played to the patient.

### Provider Options

* Local/open-source TTS
* Sarvam AI TTS
* Other evaluated providers

### Failure Flow

If TTS fails:

* Display the text response.
* Allow the patient to retry audio playback.

---

# 21. Multilingual Interaction

## UC-P19 — Use MedGuide in Preferred Language

**Actor:** Patient

**Supported Phase-1 Languages**

* English
* Hindi
* Telugu

### Main Flow

1. Patient selects a preferred language.
2. System stores the preference.
3. User can interact using supported language input.
4. System processes the query.
5. Response is generated in the appropriate language.
6. Safety-critical localized templates are used where applicable.

### Additional Requirement

The system should tolerate reasonable code-mixed input where supported.

---

# 22. Prescription Upload

## UC-P20 — Upload Prescription

**Actor:** Patient

**Goal:** Digitize a prescription for easier understanding and medication organization.

### Main Flow

1. Patient selects prescription upload.
2. Patient captures/uploads an image.
3. System validates the image.
4. Image preprocessing is performed.
5. OCR extracts text.
6. Medication information is parsed.
7. Extracted information is shown for verification.

---

# 23. Prescription OCR

## UC-P21 — Extract Prescription Information

**Actor:** OCR Pipeline

**Goal:** Convert prescription image content into structured information.

### Information May Include

* Medicine name
* Strength
* Dosage
* Frequency
* Duration
* Instructions

### Provider Options

* Tesseract
* PaddleOCR
* Other evaluated OCR
* Sarvam AI OCR where appropriate

---

# 24. Medication Verification

## UC-P22 — Verify Extracted Medication

**Actor:** Patient / Healthcare Worker

**Goal:** Confirm OCR-derived medication information.

### Main Flow

1. System displays extracted information.
2. User compares it with the prescription.
3. User edits incorrect fields.
4. User confirms the information.
5. Confirmed information becomes a medication record.

### Critical Safety Rule

OCR output must never automatically become a confirmed medication schedule.

---

# 25. Medication Scheduling

## UC-P23 — Create Medication Schedule

**Actor:** Patient

**Goal:** Organize confirmed medication instructions.

### Main Flow

1. Patient selects a confirmed medication.
2. Patient enters/validates:

   * Dose
   * Frequency
   * Time
   * Duration
3. System validates the schedule.
4. System saves the schedule.
5. Reminder generation becomes available.

---

# 26. Medication Reminder

## UC-P24 — Receive Medication Reminder

**Actor:** Patient / Notification System

### Main Flow

1. Medication schedule reaches reminder time.
2. System generates a reminder.
3. Patient receives the reminder.
4. Patient can mark medication as taken or missed.

Where possible, basic reminders should continue working offline.

---

# 27. Medication Adherence

## UC-P25 — Record Medication Adherence

**Actor:** Patient

### Main Flow

1. Patient receives a medication reminder.
2. Patient selects:

   * Taken
   * Missed
   * Skipped
3. System records adherence.
4. Timeline is updated.

---

# 28. Health Timeline

## UC-P26 — View Health Timeline

**Actor:** Patient

### Main Flow

1. Patient opens Health Timeline.
2. System retrieves authorized records.
3. System displays events chronologically.

### Events May Include

* Symptom checks
* Triage results
* Confirmed medications
* Medication adherence
* Follow-ups
* Relevant alerts

---

# 29. Healthcare Worker Patient List

## UC-HW01 — View Authorized Patients

**Actor:** Healthcare Worker

### Main Flow

1. Healthcare worker logs in.
2. System verifies role.
3. System retrieves authorized patient list.
4. Patient list is displayed.

Healthcare workers must not automatically access every patient in the system.

---

# 30. Healthcare Worker Patient Summary

## UC-HW02 — Review Patient Summary

**Actor:** Healthcare Worker

### Main Flow

1. Healthcare worker selects an authorized patient.
2. System retrieves permitted patient information.
3. System displays:

   * Profile
   * Recent symptoms
   * Triage results
   * Medication information
   * Alerts
   * Follow-ups

---

# 31. Healthcare Worker Follow-Up

## UC-HW03 — Manage Patient Follow-Up

**Actor:** Healthcare Worker

### Main Flow

1. Healthcare worker reviews patient information.
2. Worker creates a follow-up action.
3. System records the follow-up.
4. Follow-up becomes part of the patient's authorized timeline.

---

# 32. Offline Mode

## UC-P27 — Use Core Features Offline

**Actor:** Patient

**Goal:** Continue using supported features during connectivity loss.

### Offline Features

Potential offline functionality includes:

* Cached profile
* Cached health information
* Health timeline
* Medication schedules
* Medication reminders
* Basic deterministic safety rules
* Local pending records
* Offline navigation

### Main Flow

1. Device loses network connectivity.
2. Application detects offline state.
3. Application displays offline indicator.
4. Supported cached functionality remains available.
5. New supported operations are stored locally.

---

# 33. Offline Synchronization

## UC-P28 — Synchronize Pending Operations

**Actor:** System

**Trigger:** Connectivity restored.

### Main Flow

1. Device detects connectivity.
2. System checks local synchronization queue.
3. Pending operations are sent to backend.
4. Backend validates operations.
5. Successful operations are marked synchronized.
6. Failed operations are retained for retry.
7. Conflicts are handled according to synchronization rules.

---

# 34. Local AI

## UC-AI01 — Execute Local AI Model

**Actor:** AI Gateway

**Goal:** Process supported AI tasks locally.

### Main Flow

1. Application sends AI request to AI Gateway.
2. Gateway determines whether local inference is available.
3. Gateway sends request to Ollama.
4. Ollama executes the configured local LLM.
5. Generated output is returned to the safety/output validation layer.
6. Validated output is returned to the application.

### Important Distinction

Ollama is the local inference runtime.

The underlying LLM is replaceable.

```text
AI Gateway
    ↓
Ollama
    ↓
Configured Local LLM
```

Candidate models may be evaluated based on:

* English
* Hindi
* Telugu
* Code-mixed input
* Medical grounding
* Safety
* Instruction following
* Latency
* Hardware requirements

---

# 35. Online AI Provider

## UC-AI02 — Use Online AI Service

**Actor:** AI Gateway

### Purpose

Use an online provider when it provides better capability for a supported task and connectivity is available.

### Example

```text
AI Gateway
     ↓
Sarvam AI
     ├── STT
     ├── TTS
     └── OCR
```

Sarvam AI is an optional provider and must not be hard-coded into the entire application architecture.

---

# 36. Provider Fallback

## UC-AI03 — Switch AI Provider

**Actor:** AI Gateway

### Main Flow

1. Application requests an AI capability.
2. Gateway checks configured provider.
3. Gateway checks availability.
4. If primary provider is unavailable, gateway may use an approved fallback.
5. Response passes through the same validation pipeline.

Provider selection shall be configurable.

---

# 37. AI Safety Validation

## UC-AI04 — Validate AI Output

**Actor:** AI Safety Layer

### Main Flow

1. LLM produces response.
2. System checks output against safety constraints.
3. System validates expected language where applicable.
4. System validates source metadata.
5. System checks for unsupported claims where possible.
6. System attaches authoritative source metadata.
7. Safe response is returned.

### Critical Rules

The AI cannot:

* Downgrade emergency risk
* Override deterministic triage
* Fabricate sources
* Independently prescribe medication
* Bypass evidence sufficiency controls

---

# 38. Prompt Injection Protection

## UC-AI05 — Reject Prompt Injection

**Actor:** AI Gateway / Safety Layer

### Main Flow

1. User submits potentially adversarial instructions.
2. System processes input.
3. Safety constraints remain higher priority.
4. Model is prevented from overriding system instructions.
5. Safe response is returned.

Prompt injection must not allow:

* Safety-rule bypass
* Unauthorized data access
* Medical prescription generation
* Citation fabrication
* Emergency downgrading

---

# 39. Administrator Monitoring

## UC-A01 — Monitor System Activity

**Actor:** Administrator

### Main Flow

1. Administrator authenticates.
2. System verifies ADMIN role.
3. Administrator opens system activity.
4. System displays approved operational events.

Events may include:

* API requests
* ASR processing
* RAG retrieval
* Triage evaluation
* LLM processing
* OCR processing
* Synchronization

Sensitive patient information must not be unnecessarily exposed in operational logs.

---

# 40. Knowledge Base Management

## UC-A02 — Ingest Medical Knowledge

**Actor:** Administrator / Knowledge Pipeline

### Main Flow

1. Approved medical document is selected.
2. Document is processed.
3. Text is cleaned.
4. Document is chunked.
5. Metadata is attached.
6. Embeddings are generated.
7. Chunks are stored in pgvector.
8. Document becomes available for retrieval after validation.

### Required Provenance

Each knowledge source should maintain:

* Publisher
* Document title
* Document ID
* Section
* Page where applicable
* Source URL
* Version/date where available

---

# 41. System Use-Case Relationships

## Patient

```text
UC-P01 Register
      ↓
UC-P02 Login
      ↓
UC-P03 Consent
      ↓
UC-P05 Profile
      ↓
UC-P06 Symptom Check
      ↓
UC-P07 Describe Symptoms
      ↓
UC-P08 Structure Symptoms
      ↓
UC-P09 Deterministic Triage
      │
      ├── UC-P10 Emergency
      │
      ├── UC-P11 Urgent Referral
      │
      └── UC-P12 Routine Guidance
                ↓
           UC-P13 AI Companion
                ↓
           UC-P14 RAG
                ↓
           UC-P16 Sources
```

---

# 42. Prescription Workflow

```text
Upload Prescription
        ↓
UC-P20
        ↓
OCR
        ↓
UC-P21
        ↓
Medication Extraction
        ↓
UC-P22
        ↓
USER / HCW VERIFICATION
        ↓
UC-P23
        ↓
Medication Schedule
        ↓
UC-P24
        ↓
Reminder
        ↓
UC-P25
        ↓
Adherence
        ↓
UC-P26
        ↓
Health Timeline
```

---

# 43. Voice Workflow

```text
Patient speaks
      ↓
UC-P17
      ↓
Speech-to-Text
      │
      ├── Local / Open Source
      │
      └── Sarvam AI
      ↓
Transcript
      ↓
Patient confirmation/edit
      ↓
Symptom / AI pipeline
      ↓
Response
      ↓
UC-P18
      ↓
Text-to-Speech
      │
      ├── Local / Open Source
      │
      └── Sarvam AI
```

---

# 44. Offline Workflow

```text
Internet Available
       │
       ▼
Normal Application
       │
       ▼
Network Lost
       │
       ▼
Offline Mode
       │
       ├── Cached Health Information
       ├── Medication Schedule
       ├── Reminders
       ├── Timeline
       ├── Basic Safety Rules
       └── Pending Operations
                │
                ▼
        Connectivity Restored
                │
                ▼
          Sync Queue
                │
                ▼
        Backend Validation
                │
                ▼
       Successful Synchronization
```

---

# 45. AI Provider Architecture

```text
                     APPLICATION
                          │
                          ▼
                      AI GATEWAY
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
           LOCAL        ONLINE      FALLBACK
              │           │           │
           Ollama      Sarvam AI    Evaluated
              │        STT/TTS/OCR  providers
              ▼
       Configured LLM
```

The application shall not directly depend on a particular model.

---

# 46. Safety-Critical Flow

```text
Patient Input
     ↓
Input Sanitization
     ↓
Symptom Understanding
     ↓
Deterministic Triage
     │
     ├── EMERGENCY
     │      ↓
     │   Bypass LLM
     │      ↓
     │   Emergency Response
     │      ↓
     │   108 / 112
     │
     ├── URGENT
     │      ↓
     │   Professional Evaluation
     │
     └── ROUTINE
            ↓
          RAG
            ↓
      Evidence Gate
            │
       ┌────┴─────┐
       ▼          ▼
  Insufficient  Sufficient
       │          │
       ▼          ▼
    Refusal      LLM
                    ↓
             Safety Validation
                    ↓
               Response
```

---

# 47. Error and Alternative Scenarios

The system shall handle:

### Invalid Input

Display understandable validation feedback.

### Network Failure

Switch to supported offline functionality.

### LLM Failure

Use an approved fallback or return a safe error.

### RAG Failure

Do not generate unsupported medical guidance.

### Insufficient Evidence

Return a safe refusal/disclosure.

### STT Failure

Allow retry or text input.

### TTS Failure

Display text response.

### OCR Failure

Allow image retry or manual entry.

### Authentication Expiry

Request re-authentication without losing unsaved local work where possible.

### Synchronization Failure

Retain pending operations for retry.

---

# 48. Security and Privacy Use-Case Constraints

All healthcare-related use cases shall respect:

* Authentication
* Authorization
* Consent
* Data minimization
* Secure storage
* Audit logging
* Role boundaries

A user must never gain access to another patient's health information through:

* API manipulation
* UI manipulation
* Prompt injection
* URL modification
* Client-side state modification

---

# 49. Out-of-Scope Use Cases

The following are outside the initial MVP:

* Autonomous medical diagnosis
* Autonomous prescription
* Medical-device integration
* Full EHR/FHIR interoperability
* Disease outbreak prediction
* Drug-stock prediction
* WhatsApp/IVR integration
* Large-scale public-health analytics
* Large-scale clinical deployment
* Autonomous healthcare decisions

---

# 50. Use-Case Safety Principles

Every healthcare-related use case must follow these principles:

1. **Safety before convenience.**
2. **Deterministic rules control emergency classification.**
3. **LLMs assist but do not make safety-critical decisions.**
4. **Medical guidance should be grounded in approved evidence.**
5. **Insufficient evidence must result in safe refusal/disclosure.**
6. **Prescription OCR requires human verification.**
7. **AI must not independently prescribe medication.**
8. **Patient consent must be respected.**
9. **Healthcare-worker access must be authorized.**
10. **Offline functionality must not silently compromise safety.**
11. **Online AI providers must remain replaceable.**
12. **Local AI must be evaluated rather than assumed to be clinically sufficient.**

---

# 51. Use-Case Completion Criteria

The use-case layer shall be considered implemented when:

* Patient registration and authentication work.
* Consent is enforced.
* Patient profile works.
* Preliminary Symptom Checker is available after login.
* Symptoms can be entered using simple language.
* Deterministic triage produces ROUTINE / URGENT / EMERGENCY results.
* Emergency cases bypass normal LLM guidance.
* 108 / 112 escalation information is available.
* Routine cases can access grounded RAG guidance.
* AI responses contain validated source information.
* English, Hindi and Telugu are supported.
* Voice input/output works through an evaluated provider.
* Prescription OCR works with human verification.
* Confirmed medications can be scheduled.
* Reminders and adherence work.
* Health timeline works.
* Healthcare workers can access authorized patient information.
* Offline core functionality works.
* Pending operations synchronize when connectivity returns.
* AI providers are replaceable through the AI Gateway.
* Safety and security constraints are tested.

---

# 52. Final Product Interaction Principle

MedGuide AI should make the user's next step obvious.

The system should help a patient move through:

> **What am I experiencing?**

↓

> **Could this need urgent attention?**

↓

> **What reliable information can help me understand it?**

↓

> **What should I do next?**

↓

> **When should I seek professional care?**

↓

> **How can I continue managing my health?**

The platform must remain a healthcare-support system rather than presenting itself as an autonomous AI doctor.
