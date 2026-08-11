# MedGuide AI — Software Requirements Specification

**Project:** MedGuide AI
**Full Title:** MedGuide AI: An AI-Powered Rural Healthcare Intelligence and Digital Care Platform
**Version:** 1.0
**Document Status:** Baseline Specification
**Primary Domain:** Healthcare, Artificial Intelligence, NLP, Speech Processing, OCR, Digital Health
**Primary SDG:** SDG 3 — Good Health and Well-Being
**Primary Target:** SDG 3.8 — Universal health coverage

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional, non-functional, technical, safety, security, data, and usability requirements for **MedGuide AI**.

The document serves as the primary reference for development, testing, evaluation, and future modification of the system.

All implementation decisions should remain consistent with this specification unless the requirement is formally revised.

---

# 2. System Overview

MedGuide AI is an AI-powered digital healthcare platform designed to provide a first layer of preliminary healthcare support for rural and underserved communities.

The system addresses challenges including:

* Limited availability of healthcare professionals
* Geographical barriers
* Inadequate healthcare infrastructure
* Language barriers
* Low digital literacy
* Limited or unreliable internet connectivity
* Difficulty understanding prescriptions
* Medication adherence challenges
* Lack of continuity in health information

The platform combines AI-assisted health interaction with structured healthcare information and healthcare-worker involvement.

MedGuide AI is an **assistive healthcare system**, not an autonomous medical decision-making system.

---

# 3. Problem Statement

Rural and underserved communities often experience difficulty accessing timely and reliable primary healthcare because of limited healthcare professionals, geographical distance, infrastructure limitations, language barriers, low digital literacy, and poor connectivity.

Existing digital healthcare and telemedicine systems may provide access to healthcare professionals but can provide limited support for multilingual interaction, preliminary health guidance, prescription understanding, medication adherence, continuity of care, and low-connectivity environments.

MedGuide AI aims to provide an accessible digital first layer of healthcare support while maintaining appropriate escalation to qualified healthcare professionals.

---

# 4. Objectives

The system shall aim to:

1. Improve access to preliminary primary healthcare information.
2. Provide multilingual and accessible healthcare interaction.
3. Support text and voice-based health queries.
4. Provide grounded healthcare information using Retrieval-Augmented Generation.
5. Assist users in understanding reported symptoms.
6. Identify predefined red-flag conditions requiring escalation.
7. Assist users in understanding prescription information.
8. Support medication scheduling and adherence.
9. Maintain a structured health timeline.
10. Help authorized healthcare workers review patient information.
11. Support healthcare continuity through follow-ups.
12. Provide selected functionality under limited connectivity.
13. Protect sensitive healthcare information.
14. Demonstrate measurable AI and software-engineering performance.

---

# 5. Scope

## 5.1 In Scope

The MVP includes:

### Patient

* Registration
* Authentication
* Consent management
* Patient profile
* AI health companion
* Text-based interaction
* Symptom input
* Preliminary health guidance
* Red-flag detection
* Escalation guidance
* RAG-based healthcare information
* Prescription image upload
* Prescription OCR
* Medicine information extraction
* Medication scheduling
* Medication reminders
* Medication adherence tracking
* Health timeline

### Healthcare Worker

* Secure authentication
* Patient list
* Patient profile
* Patient-reported symptoms
* Patient health timeline
* Medication information
* AI-generated patient summaries
* Alerts
* Follow-up management

### Cross-cutting capabilities

* Multilingual interaction
* Voice interaction
* Offline-first functionality
* Role-based access control
* Security and privacy controls
* Audit logging

---

# 6. Out of Scope

The following are not part of the initial MVP:

* Autonomous diagnosis
* Autonomous treatment decisions
* Autonomous prescription generation
* Full EHR/FHIR interoperability
* Medical-device integration
* Disease outbreak prediction
* Drug-stock prediction
* WhatsApp integration
* IVR integration
* Large-scale public-health analytics
* Insurance management
* Hospital billing
* Payment processing
* Real-world clinical deployment

These may be considered as future extensions.

---

# 7. Stakeholders

## 7.1 Patients

Individuals in rural and underserved communities who require accessible preliminary healthcare information and support.

## 7.2 Healthcare Workers

Authorized healthcare personnel who review patient information, alerts, summaries, and follow-up requirements.

## 7.3 Local Clinics

Potential healthcare organizations that may use the healthcare-worker interface.

## 7.4 Project Team

Developers, AI/ML researchers, designers, testers, and project supervisors responsible for developing and evaluating the platform.

## 7.5 Future Stakeholders

* NGOs
* Public-health organizations
* Health administrators
* Healthcare institutions

---

# 8. User Roles

The initial system shall contain three primary roles.

## 8.1 Patient

A patient can:

* Create an account
* Manage their profile
* Provide consent
* Submit symptoms
* Interact with the AI health companion
* Upload prescriptions
* View extracted medication information
* Manage medication schedules
* Receive reminders
* View adherence information
* View their health timeline
* Receive escalation guidance

## 8.2 Healthcare Worker

An authorized healthcare worker can:

* Authenticate securely
* View authorized patients
* Review patient information
* Review reported symptoms
* Review health timelines
* Review medication information
* View AI-generated summaries
* Receive relevant alerts
* Record follow-ups

## 8.3 Administrator

An administrator may perform approved system-level administrative operations.

Administrative privileges must not provide unrestricted access to sensitive patient data unless explicitly required and authorized.

---

# 9. Functional Requirements

## FR-01 — User Registration

The system shall allow eligible users to create accounts.

The registration process shall validate required information and prevent invalid or duplicate accounts.

---

## FR-02 — Authentication

The system shall provide secure authentication for patients and healthcare workers.

Authentication mechanisms shall protect credentials and sessions.

---

## FR-03 — Role-Based Access Control

The system shall enforce permissions based on user roles.

A patient shall only access authorized personal information.

A healthcare worker shall only access patients and information for which they are authorized.

---

## FR-04 — Consent Management

The system shall allow patients to provide and manage consent for applicable healthcare-data processing and healthcare-worker access.

Consent records shall be stored with appropriate timestamps and status information.

---

## FR-05 — Patient Profile

The system shall maintain a structured patient profile containing only information required by the approved functionality.

---

## FR-06 — AI Health Companion

The system shall provide a conversational interface through which users can submit health-related questions.

The system shall provide preliminary, informational guidance using approved medical knowledge sources.

The system shall communicate appropriate limitations where required.

---

## FR-07 — Symptom Input

Users shall be able to report symptoms using supported input methods.

The system shall attempt to extract structured information such as:

* Symptom
* Duration
* Severity
* Associated symptoms
* Relevant contextual information

The system shall not assume information that the user has not provided.

---

## FR-08 — Symptom Guidance

The system shall process reported symptoms and provide preliminary guidance based on approved medical knowledge and defined system logic.

The system shall not present preliminary guidance as a definitive diagnosis.

---

## FR-09 — Red-Flag Detection

The system shall identify predefined red-flag indicators based on documented and validated healthcare guidance.

When an applicable red flag is identified, the system shall provide an appropriate escalation recommendation.

---

## FR-10 — Healthcare Escalation

The system shall provide escalation guidance when the reported information indicates that professional or emergency attention may be required.

The system shall prioritize safety over conversational convenience.

---

## FR-11 — Retrieval-Augmented Generation

The AI health companion shall use a curated medical knowledge base and retrieval mechanism for applicable healthcare queries.

The system shall retrieve relevant information before generating grounded responses.

Knowledge sources shall maintain appropriate metadata.

---

## FR-12 — Medical Knowledge Management

The system shall maintain structured medical knowledge documents and associated metadata.

Metadata should include, where available:

* Source
* Publisher
* Title
* Date
* Version
* Topic
* Language
* Usage/license information

---

## FR-13 — Prescription Upload

Patients shall be able to upload prescription images through the supported interface.

The system shall validate supported file types and reasonable image constraints.

---

## FR-14 — Prescription OCR

The system shall process prescription images using OCR technology.

The system shall extract text where possible.

OCR results shall not automatically be considered clinically correct.

---

## FR-15 — Medicine Information Extraction

The system shall attempt to identify relevant information from OCR output, including where available:

* Medicine name
* Dosage
* Frequency
* Duration
* Instructions

Uncertain information shall be flagged for verification rather than silently modified.

---

## FR-16 — Medication Management

Patients shall be able to maintain medication schedules derived from verified prescription information or manually entered information.

---

## FR-17 — Medication Reminders

The system shall provide medication reminders according to configured schedules.

---

## FR-18 — Medication Adherence

The system shall allow users to record whether scheduled medication was taken.

The system may use this information to present adherence summaries.

---

## FR-19 — Health Timeline

The system shall maintain a chronological view of relevant patient-recorded healthcare information.

Possible timeline events include:

* Symptoms
* AI interactions
* Prescriptions
* Medications
* Adherence records
* Follow-ups
* Alerts

---

## FR-20 — Healthcare Worker Dashboard

The system shall provide an interface for authorized healthcare workers.

The dashboard shall support:

* Patient discovery within authorization boundaries
* Patient summaries
* Symptom review
* Medication review
* Alerts
* Follow-ups

---

## FR-21 — AI-Generated Patient Summary

The system may generate structured summaries of patient-reported information for healthcare workers.

Summaries must clearly distinguish patient-reported information from AI-generated interpretation.

---

## FR-22 — Follow-Up Management

Authorized healthcare workers shall be able to record follow-up requirements and relevant follow-up information.

---

## FR-23 — Alerts

The system shall generate appropriate alerts for defined events, including applicable red-flag situations and follow-up requirements.

---

## FR-24 — Multilingual Interaction

The system shall support multiple selected languages.

The initial language set shall be finalized based on:

* Target users
* Dataset availability
* Model capabilities
* Evaluation feasibility

The system shall not claim support for a language without adequate testing.

---

## FR-25 — Voice Interaction

The system shall support voice-based interaction through a suitable speech-to-text pipeline.

Speech recognition performance shall be evaluated for the selected languages.

---

## FR-26 — Offline Functionality

The system shall provide selected functionality when internet connectivity is unavailable.

Offline capabilities may include:

* Cached information
* Medication schedules
* Reminders
* Basic rules
* Health timeline access
* Queued operations

Advanced cloud-based AI functionality may require connectivity.

---

## FR-27 — Synchronization

The system shall synchronize queued offline operations when connectivity becomes available.

The synchronization process shall consider:

* Retry
* Duplicate prevention
* Conflicts
* Failed operations

---

## FR-28 — Healthcare Resource Discovery

If included in the MVP implementation, the system shall allow users to identify nearby healthcare resources using approved geographic data sources.

This feature shall not replace emergency services or professional advice.

---

# 10. Non-Functional Requirements

## NFR-01 — Security

The system shall protect authentication credentials, sessions, APIs, and sensitive healthcare information.

---

## NFR-02 — Privacy

The system shall minimize collection and storage of personally identifiable and healthcare information.

Development shall preferably use synthetic or appropriately licensed/de-identified data.

---

## NFR-03 — Reliability

The system shall handle expected failures gracefully and avoid silent data loss.

---

## NFR-04 — Usability

The interface shall be simple enough for users with limited digital literacy.

The system should use:

* Clear language
* Simple navigation
* Large interaction elements
* Icons where useful
* Minimal unnecessary complexity

---

## NFR-05 — Accessibility

The interface should consider:

* Readability
* Touch accessibility
* Appropriate contrast
* Keyboard accessibility where applicable
* Voice interaction
* Multilingual presentation

---

## NFR-06 — Performance

The system shall provide acceptable response times for normal application operations.

AI response latency shall be measured separately from standard API operations.

---

## NFR-07 — Scalability

The architecture should allow future expansion of:

* Users
* Languages
* Medical documents
* AI models
* Healthcare workers
* Healthcare facilities

without requiring complete architectural redesign.

---

## NFR-08 — Maintainability

The system shall use modular architecture with clearly separated:

* Frontend
* Backend
* AI services
* Data access
* Authentication
* Healthcare logic
* OCR
* Speech processing

---

## NFR-09 — Portability

The application should remain locally runnable using documented development instructions.

The architecture should minimize unnecessary vendor lock-in.

---

## NFR-10 — Cost

The project shall prioritize free and open-source resources.

Paid services shall not become mandatory without explicit approval.

---

# 11. AI and Healthcare Safety Requirements

## SAF-01

The system shall not claim to replace a qualified healthcare professional.

## SAF-02

The system shall not provide definitive diagnosis.

## SAF-03

The system shall not autonomously prescribe or modify medication.

## SAF-04

Safety-critical triage decisions shall use documented and testable logic.

## SAF-05

Medical AI responses should be grounded in approved knowledge sources wherever applicable.

## SAF-06

The system shall communicate uncertainty when appropriate.

## SAF-07

The system shall provide escalation guidance when predefined risk conditions are identified.

## SAF-08

The system shall not fabricate medical sources or clinical recommendations.

## SAF-09

AI-generated summaries must remain distinguishable from verified patient information.

## SAF-10

AI components shall undergo safety-oriented testing before being considered complete.

---

# 12. Data Requirements

## 12.1 Medical Knowledge Data

Potential sources include:

* WHO resources
* Government health resources
* Relevant health ministry resources
* Approved clinical guidelines
* Appropriately licensed medical FAQs

Every source must be evaluated for authority and permitted usage.

---

## 12.2 Symptom Data

The system may require:

* Symptom terminology
* Associated symptoms
* Severity
* Duration
* Risk factors
* Red flags
* Recommended action
* Source/reference

---

## 12.3 Prescription Data

For development and evaluation:

* Synthetic prescriptions
* Appropriately licensed public datasets
* Properly de-identified data where permitted

Real patient prescriptions shall not be collected casually.

---

## 12.4 Speech Data

Speech datasets shall contain, where applicable:

* Audio
* Transcript
* Language
* Speaker metadata where permitted

Selected languages will be finalized before implementation.

---

## 12.5 Application Data

Application data may include:

* User profiles
* Consent
* Symptoms
* Conversations
* Prescriptions
* Medications
* Medication schedules
* Adherence
* Timeline events
* Alerts
* Follow-ups

Only required information should be stored.

---

# 13. AI Model Requirements

## 13.1 Language Model

The LLM shall support:

* Instruction following
* Relevant languages
* Contextual conversation
* RAG-based generation
* Reasonable local/cloud deployment constraints

The exact model shall be selected through evaluation.

---

## 13.2 Embedding Model

The embedding model shall support semantic retrieval for the selected medical knowledge corpus.

Evaluation shall consider retrieval quality and language support.

---

## 13.3 Speech Model

The speech model shall support the selected target languages.

Evaluation shall include Word Error Rate and relevant medical vocabulary performance.

---

## 13.4 OCR Model

The OCR system shall be evaluated using representative prescription images.

Evaluation shall include:

* Text extraction accuracy
* Character Error Rate
* Word Error Rate
* Medicine extraction accuracy

---

# 14. RAG Requirements

The RAG system shall provide:

1. Document ingestion
2. Document cleaning
3. Chunking
4. Metadata management
5. Embedding generation
6. Vector storage
7. Query embedding
8. Similarity retrieval
9. Context construction
10. Grounded response generation
11. Retrieval evaluation

The system should support traceability between generated responses and the underlying knowledge sources where appropriate.

---

# 15. Security Requirements

The system shall implement:

* Secure authentication
* Password hashing
* Role-based authorization
* Secure API access
* Environment-based secrets
* HTTPS in deployed environments
* Input validation
* Output validation where appropriate
* Privacy-conscious logging
* Audit records for relevant sensitive operations

Secrets must never be committed to version control.

---

# 16. Offline Requirements

The offline-first architecture shall distinguish between:

### Local/Offline

* Cached patient information
* Health timeline
* Medication schedules
* Reminders
* Basic symptom rules
* Queued operations

### Network-dependent

* Large language model inference where local inference is unavailable
* Cloud RAG
* Advanced processing
* Cloud synchronization
* Healthcare-worker remote access

The system shall not falsely represent online-only functionality as offline functionality.

---

# 17. External API Requirements

External APIs shall be introduced only where they provide a clear requirement-level benefit.

Potential categories include:

* Maps/geolocation
* Geocoding
* Speech services
* Notification services

Before adopting any external API, verify:

* Availability
* Cost
* Free-tier limitations
* API limits
* License
* Privacy implications
* Local/open-source alternatives

---

# 18. System Constraints

The project has the following constraints:

1. Development should use free resources wherever possible.
2. The system is being developed as a student major project.
3. No assumption should be made that paid infrastructure is available.
4. Healthcare information must be handled cautiously.
5. Real patient data should not be required for the MVP.
6. The system should support low-resource environments.
7. Internet connectivity may be intermittent.
8. AI models may have hardware and latency limitations.
9. Medical claims must be grounded and traceable.
10. The project must remain feasible within the available academic timeline.

---

# 19. Assumptions

The following assumptions are provisional and must be validated during development:

* Target users have access to a smartphone or supported browser where applicable.
* Some users may have intermittent connectivity.
* Healthcare workers can access the system through a web interface.
* Appropriate medical knowledge sources can be identified.
* Suitable open-source AI models are available for the selected languages and tasks.
* Synthetic/public/de-identified datasets can support development and evaluation.
* The MVP does not require real-world clinical deployment.

---

# 20. Key Use Cases

## UC-01 — Patient asks a health question

```text
Patient
  ↓
Enter question
  ↓
System processes query
  ↓
Retrieve relevant medical information
  ↓
Generate grounded response
  ↓
Safety validation
  ↓
Response / escalation
```

---

## UC-02 — Patient reports symptoms

```text
Patient
  ↓
Reports symptoms
  ↓
System extracts structured symptoms
  ↓
Safety/red-flag evaluation
  ↓
Risk category
  ↓
Preliminary guidance
  ↓
Escalation where required
```

---

## UC-03 — Patient uploads prescription

```text
Patient
  ↓
Upload image
  ↓
Image validation
  ↓
OCR
  ↓
Text extraction
  ↓
Medicine information extraction
  ↓
Confidence/verification
  ↓
Structured prescription
```

---

## UC-04 — Patient manages medication

```text
Prescription / Manual Entry
  ↓
Medication schedule
  ↓
Reminder
  ↓
Patient records adherence
  ↓
Timeline updated
```

---

## UC-05 — Healthcare worker reviews patient

```text
Healthcare Worker
  ↓
Login
  ↓
Authorized patient list
  ↓
Select patient
  ↓
Review symptoms
  ↓
Review timeline
  ↓
Review medications
  ↓
Review AI summary
  ↓
Follow-up
```

---

## UC-06 — User interacts through voice

```text
User Speech
  ↓
Speech-to-Text
  ↓
Language / Intent Processing
  ↓
Healthcare AI Pipeline
  ↓
Response
```

---

## UC-07 — User operates during poor connectivity

```text
User Action
  ↓
Offline-capable feature
  ↓
Local storage / cache
  ↓
Operation queued
  ↓
Connectivity restored
  ↓
Synchronization
```

---

# 21. MVP Acceptance Criteria

The MVP shall not be considered complete until the following are demonstrated.

### Authentication

* Patient can register and authenticate.
* Healthcare worker can authenticate.
* Role-based access works correctly.

### AI Companion

* User can submit a health query.
* System processes the query.
* Relevant medical knowledge can be retrieved.
* Response is grounded where applicable.
* Safety limitations are respected.

### Symptom Module

* User can report symptoms.
* Symptoms can be structured.
* Defined red flags can be detected.
* Appropriate escalation can be generated.

### Prescription Module

* User can upload an appropriate image.
* OCR processes the image.
* Extracted information can be reviewed.
* Uncertain information is not silently treated as correct.

### Medication

* Medication schedules can be created.
* Reminders work.
* Adherence can be recorded.

### Health Timeline

* Relevant patient events are displayed chronologically.

### Healthcare Worker

* Authorized workers can access permitted patients.
* Patient information can be reviewed.
* Alerts and follow-ups are supported.

### Multilingual/Voice

* Selected target languages work within evaluated capabilities.
* Voice input can be converted to text with measurable performance.

### Offline

* Defined offline functionality works without active connectivity.
* Queued data can synchronize when connectivity returns.

### Security

* Unauthorized access is prevented.
* Secrets are not exposed.
* Sensitive information is handled appropriately.

---

# 22. Evaluation Requirements

The system shall be evaluated quantitatively and/or qualitatively.

Potential metrics include:

| Component           | Metrics                                 |
| ------------------- | --------------------------------------- |
| RAG                 | Recall@K, retrieval accuracy, grounding |
| LLM                 | Safety, factuality, response quality    |
| Symptom extraction  | Precision, Recall, F1                   |
| Triage              | Sensitivity, Specificity                |
| OCR                 | CER, WER                                |
| Medicine extraction | Precision, Recall                       |
| Speech              | WER                                     |
| Multilingual        | Language-wise performance               |
| Offline             | Task completion, sync reliability       |
| Software            | Latency, reliability                    |
| UX                  | Usability evaluation                    |

Results must be experimentally measured.

---

# 23. Project Success Criteria

The project will be considered successful when it demonstrates:

1. A functioning patient-facing healthcare-support platform.
2. A functioning healthcare-worker interface.
3. Grounded AI responses.
4. Defined and testable symptom-risk escalation.
5. Prescription OCR.
6. Medication scheduling and reminders.
7. Health timeline.
8. Multilingual interaction.
9. Voice interaction.
10. Demonstrable offline-first functionality.
11. Secure role-based access.
12. Measurable AI/software evaluation.
13. Reproducible development using free resources.
14. Complete technical documentation.
15. Clear identification of limitations and future work.

---

# 24. Limitations

The project must explicitly acknowledge that:

* AI-generated healthcare information may contain errors.
* OCR may incorrectly interpret prescriptions.
* Speech recognition may perform differently across languages and speakers.
* Offline AI capabilities may be limited by device hardware.
* The system is not a substitute for professional medical care.
* Real-world clinical effectiveness cannot be claimed without appropriate clinical validation.
* Dataset limitations may affect model performance.
* Free infrastructure may impose computational and deployment constraints.

---

# 25. Future Extensions

Potential future work includes:

* EHR/FHIR integration
* Medical-device integration
* WhatsApp/IVR interfaces
* Expanded language support
* Drug-stock monitoring
* Public-health analytics
* Outbreak analysis
* Advanced local/on-device models
* Clinic-level deployment
* Larger-scale user studies
* Clinical validation

Future extensions must not compromise the safety and scope of the core system.

---

# 26. Requirement Traceability

Every implemented feature should map to:

**Requirement → Design → Implementation → Test → Evaluation**

Example:

```text
FR-09
Red-Flag Detection
      ↓
Triage Architecture
      ↓
Triage Service
      ↓
Triage Tests
      ↓
Sensitivity / Specificity Evaluation
```

This traceability should be maintained throughout development.

---

# 27. Requirement Change Policy

Changes to this SRS must be deliberate.

A proposed change that affects:

* Scope
* MVP
* Safety
* Architecture
* Database
* AI models
* Data requirements
* Security
* Cost

must be reviewed before implementation.

The SRS should be updated when an approved requirement changes.

---

# 28. Final System Principle

MedGuide AI shall follow the principle:

> **Assist → Inform → Identify Risk → Escalate → Support Continuity of Care**

It shall not follow:

> **Diagnose → Prescribe → Replace Healthcare Professionals**

This principle governs the design, implementation, testing, and evaluation of the entire system.
