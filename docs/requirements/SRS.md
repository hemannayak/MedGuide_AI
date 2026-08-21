# MedGuide AI — Software Requirements Specification (SRS)

**Document Version:** 2.0  
**Project:** MedGuide AI  
**Project Title:** AI-Powered Rural Healthcare Intelligence and Digital Care Platform  
**Domain:** Healthcare / Artificial Intelligence / NLP / Speech Processing / OCR / Digital Health  
**Primary SDG:** SDG 3 — Good Health and Well-Being  
**Primary SDG Target:** Target 3.8 — Universal health coverage  
**Status:** Development Specification  
**Last Updated:** August 2026

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification defines the functional, non-functional, safety, AI, data, security, and integration requirements for MedGuide AI.

MedGuide AI is designed as a multilingual, low-resource healthcare-support platform for rural and underserved communities.

The system provides a first layer of digital healthcare assistance through:

- Preliminary symptom understanding
- Deterministic safety triage
- Grounded health information retrieval
- Conversational AI assistance
- Multilingual text interaction
- Voice interaction
- Prescription OCR
- Medication organization
- Medication reminders and adherence tracking
- Health timeline
- Healthcare-worker support
- Offline-first capabilities

The system is intended to assist users in understanding health information and identifying when professional care may be required.

It does not replace qualified healthcare professionals and must not independently diagnose diseases or prescribe treatment.

---

# 2. Product Vision

MedGuide AI aims to make reliable healthcare information easier to access and understand for users who may face:

- Limited access to healthcare professionals
- Long travel distances to healthcare facilities
- Language barriers
- Low digital literacy
- Limited health literacy
- Poor or intermittent internet connectivity
- Difficulty understanding medical terminology
- Difficulty understanding prescriptions and medication schedules

The platform follows the principle:

> **Assist → Inform → Identify Risk → Escalate**

It does not follow:

> **Diagnose → Prescribe → Replace Doctor**

---

# 3. Scope

## 3.1 In Scope

The MVP includes:

### Patient

- Registration and authentication
- Consent management
- Patient profile
- Language preference
- Preliminary Symptom Checker
- Structured symptom collection
- Deterministic triage
- Emergency escalation
- RAG-grounded health guidance
- AI health companion
- Text interaction
- Voice interaction
- Prescription upload
- Prescription OCR
- Medication information extraction
- Human verification of extracted medication information
- Medication schedules
- Medication reminders
- Medication adherence
- Health timeline
- Offline access to defined core functionality

### Healthcare Worker

- Secure authentication
- Patient list
- Authorized patient profile access
- Symptom history
- Medication information
- Safety alerts
- AI-generated patient summaries
- Follow-up management

### AI / Technical

- RAG
- Local LLM inference
- Replaceable model architecture
- Multilingual processing
- Speech processing
- OCR
- Deterministic safety engine
- AI safety validation
- Source/citation provenance
- Evaluation framework

---

# 4. Primary User Journey

The primary patient experience after authentication is intentionally designed around the Preliminary Symptom Checker rather than immediately presenting a generic chatbot.

```text
Login
  ↓
Consent
  ↓
Language / Profile
  ↓
Preliminary Symptom Checker
  ↓
Describe Symptoms
  ↓
Structured Symptom Understanding
  ↓
Deterministic Safety Triage
  │
  ├── EMERGENCY
  │      ↓
  │   Immediate escalation
  │   108 / 112
  │
  ├── URGENT
  │      ↓
  │   Prompt professional evaluation
  │
  └── ROUTINE
         ↓
      RAG-grounded guidance
         ↓
      AI Companion
         ↓
      Sources + safety guidance
```

The interface must remain simple enough for rural and low-digital-literacy users.

---

# 5. User Roles

## 5.1 Patient

The patient can:

* Register
* Log in
* Provide consent
* Manage their profile
* Select a preferred language
* Enter symptoms
* Use voice input
* Receive preliminary guidance
* View triage results
* Receive emergency escalation guidance
* Ask health-related questions
* Upload prescriptions
* Review extracted medication information
* Confirm medication information
* Create schedules
* Receive reminders
* Track adherence
* View their health timeline

---

## 5.2 Healthcare Worker

The healthcare worker can:

* Authenticate securely
* View authorized patients
* Review patient profiles
* View symptom records
* Review medication information
* View safety alerts
* Review AI-generated summaries
* Manage follow-ups

Healthcare workers must only access information for which they have appropriate authorization.

---

## 5.3 Administrator

Administrators can access approved system-level functions including:

* System monitoring
* Pipeline activity
* Approved configuration
* Audit information
* Operational diagnostics

Administrative access must not automatically provide unrestricted access to patient health information.

---

# 6. Functional Requirements

## FR-01 — User Registration

The system shall allow a new user to create an account.

The registration process shall collect, where applicable:

* Name
* Email or phone
* Password
* User role
* Preferred language

The system shall validate required fields and securely store credentials.

---

## FR-02 — Authentication

The system shall provide secure login using:

* Email or phone
* Password

Authentication shall use secure password hashing and token-based session management.

---

## FR-03 — Role-Based Access Control

The system shall enforce role-based access for:

* PATIENT
* HEALTHCARE_WORKER
* ADMIN

Users shall not access resources outside their authorization scope.

---

# 7. Consent Requirements

## FR-04 — Explicit Consent

The system shall obtain explicit patient consent before enabling protected healthcare workflows.

Consent shall include appropriate information regarding:

* Data usage
* Healthcare-support limitations
* Privacy
* AI-assisted processing

---

## FR-05 — Consent Management

The system shall support:

* Consent recording
* Consent status retrieval
* Consent withdrawal
* Consent audit history

Healthcare workflows requiring consent shall not proceed when valid consent is unavailable.

---

# 8. Patient Profile

## FR-06 — Profile Management

The system shall allow patients to manage relevant profile information including:

* Age
* Gender
* Preferred language
* Allergies
* Relevant medical history
* Emergency contact
* Village/town information

Only necessary information shall be collected.

---

# 9. Preliminary Symptom Checker

## FR-07 — Primary Symptom Workflow

The Preliminary Symptom Checker shall be the primary healthcare-support workflow presented to patients after sign-in/onboarding.

The system shall provide a simple guided interface rather than requiring users to understand medical terminology.

---

## FR-08 — Symptom Input

The system shall allow symptom information to be entered through:

* Simple text
* Structured symptom selections
* Voice input where supported

The system should support natural descriptions such as:

> "I have fever since two days."

rather than requiring medical terminology.

---

## FR-09 — Structured Symptom Understanding

The system shall extract or structure relevant information such as:

* Symptom
* Duration
* Severity
* Associated symptoms
* Relevant risk indicators

The system shall preserve the original user input.

---

# 10. Deterministic Safety and Triage

## FR-10 — Red-Flag Detection

The system shall evaluate reported symptoms using deterministic, testable safety rules.

Safety-critical triage shall not depend solely on an LLM.

---

## FR-11 — Risk Classification

The triage engine shall classify cases into:

* ROUTINE
* URGENT
* EMERGENCY

---

## FR-12 — Emergency Escalation

When emergency red flags are detected, the system shall:

1. Stop normal AI guidance flow.
2. Display an emergency warning.
3. Recommend immediate professional/emergency care.
4. Provide appropriate emergency contact information including **108 / 112**.
5. Prevent the LLM from downgrading the emergency classification.

---

## FR-13 — Urgent Cases

For urgent cases, the system shall recommend prompt evaluation by an appropriate healthcare professional or healthcare facility.

---

## FR-14 — Routine Cases

For routine cases, the system may proceed to grounded health information and preliminary guidance.

The system shall clearly communicate that the guidance is not a medical diagnosis.

---

# 11. AI Gateway

## FR-15 — Model Abstraction

The system shall provide an AI Gateway layer between application logic and AI providers.

The application shall not depend directly on one specific LLM implementation.

---

## FR-16 — Replaceable Local LLM

The system shall support local LLM inference through a runtime such as **Ollama**.

Ollama is treated as the local inference/runtime layer.

The underlying model shall remain replaceable and evaluable.

Potential models may include different open-source models depending on:

* Language performance
* Medical grounding
* Safety
* Instruction following
* Latency
* Memory requirements
* CPU/GPU requirements
* Offline feasibility

No model shall be considered permanently selected without evaluation.

---

## FR-17 — LLM Responsibilities

The LLM may be used for:

* Natural-language generation
* Explanation
* Summarization
* Conversational interaction
* Multilingual response generation

The LLM shall not independently determine emergency classification.

---

# 12. Retrieval-Augmented Generation

## FR-18 — Medical Knowledge Retrieval

The system shall retrieve relevant information from an approved medical knowledge base.

Potential sources include:

* WHO guidelines
* Government health resources
* Approved public-health resources
* Other verified medical documents

---

## FR-19 — RAG Pipeline

The RAG pipeline shall include:

```text
Medical Documents
      ↓
Cleaning
      ↓
Chunking
      ↓
Embedding
      ↓
Vector Storage
      ↓
Query Embedding
      ↓
Similarity Search
      ↓
Evidence Filtering
      ↓
LLM Context
      ↓
Grounded Response
```

---

## FR-20 — Evidence Sufficiency

The system shall evaluate retrieval confidence before allowing the LLM to generate grounded medical guidance.

The currently calibrated threshold of **0.55** shall be treated as an initial operational configuration, not a universal medical threshold.

The threshold may be changed following further evaluation.

---

## FR-21 — Refusal

If sufficient evidence is unavailable, the system shall provide a safe refusal/disclosure rather than inventing information.

---

## FR-22 — Source Provenance

Where applicable, responses shall expose source information including:

* Source title
* Publisher
* Section
* Page
* Document identifier
* Source URL

The system shall not allow the LLM to fabricate source metadata.

---

# 13. Multilingual Support

## FR-23 — Phase-1 Languages

The initial multilingual implementation shall support:

* English
* Hindi
* Telugu

---

## FR-24 — Native Script Support

The interface and generated responses shall support native scripts where applicable:

* English
* हिंदी
* తెలుగు

The system should also tolerate reasonable code-mixed language input where technically supported.

---

## FR-25 — Language Consistency

The system shall attempt to respond in the user's selected/requested language.

Safety-critical templates such as emergency and refusal messages shall be controlled through deterministic application logic where possible.

---

# 14. Voice Interaction

## FR-26 — Speech-to-Text

The system shall support speech-to-text for supported languages.

Potential providers/models include:

* Local/open-source speech models
* Whisper or evaluated alternatives
* Sarvam AI as an optional online provider

The provider shall be accessed through the AI Gateway rather than tightly coupling the application to one service.

---

## FR-27 — Text-to-Speech

The system shall support optional text-to-speech for supported languages.

Potential providers include:

* Local/open-source TTS
* Sarvam AI online TTS
* Other evaluated providers

---

## FR-28 — Voice Failure Handling

If speech recognition fails, the system shall allow the user to:

* Retry
* Edit the transcript
* Use text input instead

The user shall never be forced to use voice interaction.

---

# 15. Sarvam AI Integration

## FR-29 — Optional Online AI Services

Sarvam AI may be integrated as an optional online provider for:

* Indian-language STT
* Indian-language TTS
* OCR/document processing where appropriate

Sarvam AI shall not become an unavoidable architectural dependency.

---

## FR-30 — Provider Abstraction

The AI Gateway shall allow the system to switch between:

```text
Local Provider
     │
     ├── Open-source STT
     ├── Open-source TTS
     └── Local OCR

Online Provider
     │
     └── Sarvam AI
```

The final provider/model selection shall be based on empirical evaluation.

---

# 16. Prescription OCR

## FR-31 — Prescription Upload

The patient shall be able to upload a prescription image.

---

## FR-32 — OCR Processing

The system shall preprocess the image and extract text using an OCR engine.

Potential implementations include:

* Tesseract
* PaddleOCR
* Other evaluated OCR solutions
* Sarvam AI OCR where appropriate

---

## FR-33 — Medication Extraction

The system shall attempt to identify:

* Medicine name
* Strength
* Dosage
* Frequency
* Duration
* Relevant instructions

---

## FR-34 — Human Verification

OCR and medication extraction shall never automatically become a confirmed medication schedule.

The user or authorized healthcare worker must review and confirm extracted information before scheduling medication reminders.

---

# 17. Medication Management

## FR-35 — Medication Records

The system shall maintain confirmed medication records.

---

## FR-36 — Medication Scheduling

Users shall be able to create medication schedules containing:

* Medicine
* Dose
* Frequency
* Time
* Duration

---

## FR-37 — Reminders

The system shall provide medication reminders.

Where technically possible, basic reminders shall remain available offline.

---

## FR-38 — Adherence

The system shall allow users to record whether a scheduled medication was taken.

---

# 18. Health Timeline

## FR-39 — Timeline

The system shall provide a chronological health timeline containing relevant authorized events such as:

* Symptom records
* Triage results
* Confirmed medication records
* Medication adherence
* Follow-ups

---

# 19. Healthcare Worker Dashboard

## FR-40 — Patient List

Authorized healthcare workers shall be able to view their permitted patient list.

---

## FR-41 — Patient Summary

Healthcare workers shall be able to view authorized summaries containing relevant:

* Patient information
* Recent symptoms
* Triage results
* Medication information
* Safety alerts
* Follow-ups

---

## FR-42 — Follow-Up

Healthcare workers shall be able to record and manage follow-up actions.

---

# 20. Offline-First Requirements

## FR-43 — Offline Core Functionality

The application shall support defined core features during intermittent connectivity.

Offline-capable features may include:

* Cached profile information
* Previously loaded health information
* Health timeline
* Medication schedules
* Medication reminders
* Basic deterministic safety rules
* Locally stored pending operations

---

## FR-44 — Offline Queue

Operations performed while offline shall be placed into a local synchronization queue where applicable.

---

## FR-45 — Synchronization

When connectivity returns, queued operations shall be synchronized with the backend.

---

## FR-46 — Conflict Handling

The system shall detect and safely handle synchronization conflicts.

The system shall avoid silently overwriting newer patient information.

---

## FR-47 — Local AI Evaluation

Local AI capabilities such as:

* Local LLM
* Local STT
* Local OCR
* Local TTS

shall be considered offline candidates.

Their inclusion in the final offline workflow shall depend on:

* Hardware capability
* Model size
* Latency
* Accuracy
* Memory requirements
* Evaluation results

---

# 21. Security Requirements

## SEC-01 — Authentication

All protected healthcare resources shall require authentication.

---

## SEC-02 — Authorization

The system shall enforce role-based and resource-level authorization.

---

## SEC-03 — Password Security

Passwords shall be securely hashed.

Plain-text passwords must never be stored.

---

## SEC-04 — Token Security

Authentication tokens shall be handled securely.

---

## SEC-05 — Consent Enforcement

Healthcare data workflows requiring consent shall verify consent status.

---

## SEC-06 — Data Minimization

Only information required for the intended functionality shall be collected.

---

## SEC-07 — Audit Logging

Security-sensitive and healthcare-data access events shall be logged appropriately.

Logs must avoid unnecessary exposure of sensitive patient information.

---

## SEC-08 — Secrets

API keys, database credentials, JWT secrets, and other sensitive configuration shall be stored through environment-based secret management.

---

## SEC-09 — AI Prompt Injection

The system shall defend against attempts to override:

* System safety rules
* RAG grounding constraints
* Role boundaries
* Emergency handling
* Data-access restrictions

---

# 22. AI Safety Requirements

## AI-SAF-01

Emergency classification must be deterministic and independent of LLM output.

## AI-SAF-02

The LLM must not be allowed to downgrade an emergency classification.

## AI-SAF-03

The LLM must not invent medical sources.

## AI-SAF-04

Responses must be grounded in retrieved evidence when medical guidance is provided.

## AI-SAF-05

The system must refuse or safely disclose when sufficient evidence is unavailable.

## AI-SAF-06

The system must not independently prescribe medication.

## AI-SAF-07

Prescription OCR results must require human verification.

## AI-SAF-08

Safety-critical emergency and refusal messages should use deterministic localized templates where practical.

## AI-SAF-09

Prompt-injection attempts must not override system safety constraints.

---

# 23. Non-Functional Requirements

## NFR-01 — Usability

The interface shall be understandable to users with limited digital literacy.

The design shall prioritize:

* Simple navigation
* Clear language
* Large controls
* Obvious next actions
* Minimal unnecessary steps
* Voice as an accessibility option

---

## NFR-02 — Accessibility

Interactive controls should provide minimum touch targets of approximately 48 × 48 pixels.

The system should support:

* High contrast
* Keyboard navigation where applicable
* Screen-reader semantics
* Visible focus states
* Reduced-motion preferences
* Native-language text rendering

---

## NFR-03 — Responsiveness

The patient-facing interface shall support:

* Mobile
* Tablet
* Desktop

Mobile usability is the primary consideration.

---

## NFR-04 — Performance

The system shall measure:

* API latency
* RAG retrieval latency
* LLM generation latency
* STT latency
* TTS latency
* OCR latency
* End-to-end response latency

No performance claim shall be considered final without measurement.

---

## NFR-05 — Reliability

The system shall provide graceful handling for:

* Network failure
* AI provider failure
* OCR failure
* Speech recognition failure
* Database failure
* Invalid input
* Authentication expiry

---

## NFR-06 — Maintainability

AI providers and models shall be replaceable without requiring major changes to application-level business logic.

---

## NFR-07 — Reproducibility

The project shall document:

* Dependencies
* Models
* Versions
* Configuration
* Datasets
* Evaluation procedures
* Experimental results

---

# 24. Technology Requirements

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Python
* FastAPI

## Database

* PostgreSQL
* pgvector

## AI / ML

* PyTorch
* Hugging Face ecosystem
* Sentence Transformers
* Evaluated open-source LLM
* Ollama for local LLM runtime

## OCR

* Tesseract
* PaddleOCR
* Evaluated alternatives
* Optional Sarvam AI OCR

## Speech

* Whisper / evaluated open-source alternatives
* Optional Sarvam AI STT/TTS

## Testing

* Pytest
* API testing tools
* Frontend testing tools
* Automated evaluation scripts

## Development

* Git
* GitHub
* Docker
* VS Code / compatible IDE
* Google Colab where useful for experiments

---

# 25. Data Requirements

## 25.1 Medical Knowledge Corpus

The project shall maintain an authoritative medical knowledge corpus containing appropriate:

* WHO documents
* Government health guidelines
* Approved primary-care resources
* Other verified medical sources

Each knowledge document should maintain provenance metadata.

---

## 25.2 RAG Evaluation Data

The evaluation dataset shall include:

* Relevant healthcare queries
* Out-of-scope queries
* Multilingual queries
* Adversarial/prompt-injection queries
* Emergency queries
* Code-mixed queries where applicable

---

## 25.3 Speech Dataset

Speech evaluation data should contain:

* Audio
* Ground-truth transcript
* Language
* Relevant medical vocabulary where available

Evaluation shall include English, Hindi and Telugu.

---

## 25.4 OCR Dataset

OCR evaluation data should contain:

* Prescription images
* Ground-truth transcription
* Medicine names
* Dosage
* Frequency
* Duration

---

## 25.5 Application Data

Development shall primarily use:

* Synthetic patient data
* Controlled test records
* User-provided data only where appropriate and authorized

---

# 26. AI Evaluation Requirements

The system shall evaluate candidate models rather than assuming one model is optimal.

Potential LLM candidates may be compared using:

* Medical grounding
* Hindi performance
* Telugu performance
* English performance
* Code-mixed understanding
* Instruction following
* Refusal behavior
* Prompt-injection resistance
* Citation behavior
* Latency
* Memory consumption
* CPU/GPU requirements

The current Qwen3:4B model may remain a local baseline while alternatives are evaluated.

---

# 27. Evaluation Metrics

The project shall measure, where applicable:

### RAG

* Recall@K
* Retrieval precision
* Relevant retrieval rate
* Irrelevant retrieval rate
* False refusal rate
* Out-of-scope refusal accuracy
* Grounding accuracy

### LLM

* Response safety
* Instruction adherence
* Multilingual quality
* Hallucination rate
* Citation validity
* Prompt-injection resistance
* Latency

### Triage

* Sensitivity
* Specificity
* False-negative rate
* False-positive rate

### OCR

* Character Error Rate
* Word Error Rate
* Medicine extraction accuracy

### Speech

* Word Error Rate
* Language identification accuracy
* Medical-term recognition
* End-to-end latency

### Offline

* Offline task completion rate
* Sync success rate
* Conflict rate
* Recovery behavior

No evaluation result may be claimed before experimental measurement.

---

# 28. Offline and Online Architecture

MedGuide AI shall support a hybrid architecture.

```text
                    MEDGUIDE AI
                         │
                    AI GATEWAY
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       LOCAL          ONLINE         FALLBACK
       PATH           PROVIDERS        PATH
          │              │              │
       Ollama         Sarvam AI       Other
       Local LLM      STT/TTS/OCR     evaluated
       Local STT
       Local OCR
          │
          └──────────────┬──────────────┘
                         ↓
                MedGuide Safety Layer
                         ↓
                Application Response
```

The online provider must never be the only path for core application functionality where an offline alternative has been defined.

---

# 29. High-Level System Architecture

```text
                   Patient PWA
                       │
                       ▼
                 FastAPI Backend
                       │
        ┌──────────────┼──────────────┐
        │              │              │
       Auth          Health        AI Gateway
        │              │              │
        │              │       ┌──────┼────────┐
        │              │       │      │        │
        │              │      RAG   Local    Online
        │              │             LLM     Providers
        │              │            Ollama   Sarvam/etc.
        │              │
        │              ├── Triage
        │              ├── OCR
        │              ├── Medication
        │              ├── Timeline
        │              └── Alerts
        │
        ▼
 PostgreSQL + pgvector
        │
        ▼
 Healthcare Worker
```

---

# 30. RAG Safety Pipeline

```text
User Query
    ↓
Input Sanitization
    ↓
Language Handling
    ↓
Deterministic Emergency Check
    │
    ├── Emergency → Immediate Escalation
    │
    └── Continue
          ↓
     Query Embedding
          ↓
     pgvector Search
          ↓
     Evidence Sufficiency Gate
          │
          ├── Insufficient → Safe Refusal
          │
          └── Sufficient
                 ↓
            LLM Generation
                 ↓
          Output Validation
                 ↓
       Citation Attachment
                 ↓
       Localized Response
```

---

# 31. System States

The application shall support appropriate UI and backend handling for:

* Loading
* Success
* Error
* Empty state
* No search results
* Offline
* Sync pending
* Sync failure
* Session expired
* Unauthorized
* Emergency
* Urgent
* Routine
* Insufficient evidence
* AI provider unavailable
* Speech failure
* OCR failure

---

# 32. Development Milestones

The system shall follow the M1–M18 development roadmap:

```text
M1  — Backend Foundation
M2  — Database Models + Migrations
M3  — Authentication + RBAC
M4  — Consent Management
M5  — Patient Profile
M6  — Symptom Records
M7  — Deterministic Safety & Triage
M8  — AI Gateway
M9  — Retrieval-Augmented Generation
M10 — AI Health Companion
M11 — Prescription OCR
M12 — Medication Management & Adherence
M13 — Healthcare Worker Dashboard
M14 — Speech + Multilingual Processing
M15 — Offline/PWA + Synchronization
M16 — Full Integration Testing
M17 — AI Safety & Performance Evaluation
M18 — Deployment & Operations
```

---

# 33. Definition of Done

The MVP shall not be considered complete merely because the UI or individual APIs compile.

The system must demonstrate:

* Working authentication
* Working consent enforcement
* Working patient profile
* Working Preliminary Symptom Checker
* Deterministic emergency/urgent/routine classification
* Emergency escalation
* Grounded RAG responses
* Source provenance
* Safe refusal behavior
* Local LLM execution
* Evaluated model selection
* English/Hindi/Telugu support
* Voice interaction
* Prescription OCR
* Human verification of medication extraction
* Medication scheduling
* Medication reminders
* Medication adherence
* Health timeline
* Healthcare-worker workflow
* Offline-first functionality
* Synchronization
* Security controls
* Automated tests
* AI evaluation
* Performance measurements
* Reproducible documentation

---

# 34. Constraints and Limitations

MedGuide AI is a healthcare-support system and shall operate within strict limitations.

The system shall not:

* Claim to diagnose a patient
* Independently prescribe medication
* Replace a doctor or healthcare worker
* Override deterministic emergency classification
* Generate unsupported medical claims
* Fabricate citations
* Treat OCR extraction as confirmed medication information
* Present experimental model performance as established clinical accuracy

The system shall clearly communicate these limitations to users.

---

# 35. Research and Future Scope

Potential future extensions include:

* Additional Indian languages
* Expanded healthcare-resource discovery
* FHIR interoperability
* Public-health analytics
* Additional local AI models
* Improved offline speech processing
* Additional OCR capabilities
* Healthcare facility integration
* Larger-scale field evaluation

These features are not required for the initial MVP unless explicitly brought into scope.

---

# 36. Success Criteria

MedGuide AI will be considered technically successful when it demonstrates:

1. A functional patient-facing healthcare-support application.
2. A simple and usable Preliminary Symptom Checker.
3. Reliable deterministic safety escalation.
4. Grounded healthcare information retrieval.
5. Replaceable local LLM inference.
6. Measured multilingual performance in English, Hindi and Telugu.
7. Functional voice interaction.
8. Functional prescription OCR with human verification.
9. Medication scheduling and adherence tracking.
10. Healthcare-worker support.
11. Demonstrable offline-first operation.
12. Reliable synchronization after connectivity restoration.
13. Secure role-based access.
14. Measurable AI, OCR, speech and system performance.
15. Reproducible development and evaluation.
16. Clear documentation of datasets, models, architecture, limitations and results.

---

# 37. Final Product Principle

> **MedGuide AI is not an AI doctor.**
>
> It is a multilingual digital healthcare-support layer designed to help people:
>
> **Understand their symptoms → identify potential risk → access reliable information → take the appropriate next step → reach professional care when needed.**

The system should make healthcare information easier to understand without pretending that AI can replace the healthcare system.
