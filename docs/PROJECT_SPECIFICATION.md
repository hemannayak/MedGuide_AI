# MedGuide AI — Project Specification

---

## 1. Project Identity

**Project Name:** MedGuide AI

**Project Title:**
MedGuide AI: An AI-Powered Rural Healthcare Intelligence and Digital Care Platform

**Domain:** Healthcare / Artificial Intelligence / NLP / Speech Processing / OCR / Digital Health

**Primary SDG:**
SDG 3 — Good Health and Well-Being

**Primary SDG Target:**
Target 3.8 — Universal health coverage with access to quality essential healthcare services and medicines.

---

## 2. Problem Statement

Rural and underserved communities face barriers to timely primary healthcare due to limited healthcare professionals, geographical distance, inadequate infrastructure, language barriers, low digital literacy, and unreliable internet connectivity.

Existing digital healthcare solutions often focus primarily on connecting patients with healthcare providers and may provide limited support for multilingual communication, preliminary health guidance, prescription understanding, medication adherence, and continuity of care in low-resource environments.

---

## 3. Proposed Solution

MedGuide AI is an intelligent, multilingual, low-resource digital healthcare platform that provides a first layer of AI-assisted primary healthcare support.

The platform combines:

* Conversational AI
* Symptom-based health guidance
* Retrieval-Augmented Generation
* Prescription OCR
* Multilingual text interaction
* Voice interaction
* Medication reminders
* Medication adherence tracking
* Healthcare-resource discovery
* Health timeline
* Healthcare-worker dashboard
* Patient summaries
* Follow-up support
* Offline-first functionality

The platform supports healthcare professionals in critical decisions and does not attempt to replace clinical diagnosis or professional medical care.

---

## 4. Target Users

### Primary

* Rural and underserved patients.

### Secondary

* Community healthcare workers
* Local healthcare providers
* Rural clinics

### Future

* NGOs
* Public-health organizations
* Health administrators

---

## 5. MVP

### Patient

* Authentication
* Consent
* Profile
* AI health companion
* Symptom input
* Preliminary guidance
* Red-flag detection
* Escalation
* RAG-based health information
* Prescription upload
* OCR
* Medication extraction
* Medication scheduling
* Medication reminders
* Adherence tracking
* Health timeline

### Healthcare Worker

* Authentication
* Patient list
* Patient profile
* Symptoms
* AI-generated summaries
* Medication information
* Alerts
* Follow-up management

### Technical Differentiators

* Multilingual interaction
* Voice interaction
* Offline-first functionality
* Grounded RAG-based AI
* Healthcare-worker involvement

---

## 6. Out of Scope for MVP

* Full EHR/FHIR interoperability
* Medical-device integration
* Disease outbreak prediction
* Drug-stock prediction
* WhatsApp/IVR
* Large-scale public-health analytics
* Extensive language expansion
* Autonomous medical diagnosis
* Autonomous treatment decisions
* Real-world clinical deployment

---

## 7. Core System Principle

MedGuide AI follows:

> **Assist → Inform → Identify Risk → Escalate**

It does not follow:

> ~~Diagnose → Prescribe → Replace Doctor~~

---

## 8. High-Level Architecture

```text
Patient PWA
     │
     ↓
FastAPI Backend
     │
 ┌───┼──────────────┐
 ↓   ↓              ↓
Auth Health       AI Gateway
     │              │
     │       ┌──────┼──────┐
     │       ↓      ↓      ↓
     │      RAG     LLM   Safety
     │       │
     │   PostgreSQL
     │   + pgvector
     │
     ├── OCR
     ├── Medication
     ├── Timeline
     └── Notifications
             │
             ↓
       Healthcare Worker
```

---

## 9. Preferred Technology Stack

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
* Evaluated open-source LLM

### OCR

* Tesseract or PaddleOCR

### Speech

* Whisper or evaluated open-source alternative

### Development

* Git
* GitHub
* Docker
* Pytest
* Postman/Thunder Client
* Google Colab

The exact models and external APIs will be finalized after evaluation.

---

## 10. Data Requirements

### Medical Knowledge

* Authoritative medical guidelines
* Government health resources
* Verified medical FAQs
* Relevant healthcare information

### Symptom/Triage

* Symptoms
* Associated symptoms
* Duration
* Severity
* Risk factors
* Red flags
* Recommended action
* Source

### OCR

* Prescription images
* Ground-truth transcription
* Medicine names
* Dosage
* Frequency
* Duration

### Speech

* Audio
* Transcripts
* Language labels
* Relevant medical vocabulary

### Application

* Synthetic patient data for development
* Patient-reported information
* Medication records
* Health timeline
* Consent
* Follow-ups

---

## 11. AI Components

### LLM

Used for:

* Conversational interaction
* Explanation
* Summarization
* Natural-language generation

### Embedding Model

Used for:

* Medical document embeddings
* Semantic retrieval
* RAG

### Speech Model

Used for:

* Speech-to-text

### OCR

Used for:

* Prescription text extraction

### Symptom Processing

Used for:

* Symptom extraction
* Structured representation

### Triage Engine

Uses validated and testable rules for safety-critical classification.

---

## 12. RAG Pipeline

```text
Medical Documents
       ↓
Cleaning
       ↓
Chunking
       ↓
Embedding
       ↓
pgvector
       ↓
User Query
       ↓
Query Embedding
       ↓
Similarity Search
       ↓
Relevant Context
       ↓
LLM
       ↓
Grounded Response
```

---

## 13. Offline Strategy

### Offline-capable

* Cached profile
* Health timeline
* Medication schedules
* Reminders
* Basic rules
* Cached health information
* Queued operations

### Online-dependent

* Large LLM
* Cloud RAG
* Advanced processing
* Cloud synchronization
* Healthcare-worker synchronization

The final offline architecture will be determined after evaluating device and model constraints.

---

## 14. Security

The system requires:

* Authentication
* Role-based access control
* Consent management
* Password hashing
* Secure sessions/tokens
* HTTPS
* Environment-based secrets
* Data minimization
* Audit logging
* Secure database access
* Privacy-conscious logging

---

## 15. Core Roles

### PATIENT

Can access authorized personal health information and patient features.

### HEALTHCARE_WORKER

Can access authorized patient information and follow-up functionality.

### ADMIN

Can manage approved system-level functionality.

---

## 16. Research Direction

The project aims to investigate the practical use of AI for low-resource rural healthcare environments.

Potential research questions include:

* Does RAG improve the grounding of healthcare responses compared with unconstrained LLM generation?
* How accurately can symptoms be extracted from multilingual text and voice?
* How accurately can medication information be extracted from prescription images?
* How effective is the offline-first approach under intermittent connectivity?
* Does multilingual and voice interaction improve usability for intended users?

These questions will be finalized during the research-design phase.

---

## 17. Evaluation

Potential evaluation metrics include:

* Retrieval Recall@K
* Grounding accuracy
* Response safety
* Symptom extraction Precision/Recall/F1
* Triage sensitivity/specificity
* OCR Character Error Rate
* OCR Word Error Rate
* Medicine extraction accuracy
* Speech Word Error Rate
* Language-wise performance
* API latency
* Offline task completion
* Usability evaluation

No evaluation result may be claimed before it is experimentally measured.

---

## 18. Development Constraint

The project should be developed using free and open-source resources wherever practically possible.

A paid external service must not become a mandatory dependency without explicit approval.

The system should remain locally runnable wherever practical.

---

## 19. Definition of Success

MedGuide AI will be considered successful when it demonstrates:

* A functional patient-facing healthcare-support application.
* A functional healthcare-worker interface.
* Grounded AI responses using an approved medical knowledge base.
* Safe symptom-risk escalation logic.
* Working prescription OCR.
* Medication scheduling and reminders.
* Health timeline functionality.
* Multilingual interaction.
* Voice interaction.
* Demonstrable offline-first capabilities.
* Secure role-based access.
* Measurable technical evaluation.
* Reproducible development using free resources.
* Clear documentation of architecture, data, models, experiments, limitations, and results.
