# MedGuide AI — Pre-Development Decisions

**Project:** MedGuide AI
**Document:** Pre-Development Decision Register
**Version:** 1.0
**Status:** Open — Decisions Required Before Architecture
**Related Documents:**

* `AGENTS.md`
* `docs/PROJECT_SPECIFICATION.md`
* `docs/requirements/SRS.md`
* `docs/requirements/USE_CASES.md`

---

# 1. Purpose

This document captures the **remaining open decisions** that must be resolved before the requirements traceability matrix can be finalized and architectural design can begin.

Each decision is categorized, explained, and includes a recommendation. Once a decision is approved, it becomes binding for the development phase unless formally revised.

The decisions are grouped into:

* **Product scope decisions**
* **AI/ML decisions**
* **Data decisions**
* **Security decisions**
* **Infrastructure decisions**
* **Research/evaluation decisions**

---

# 2. Completeness Summary

### Already solid

| Area                                    | Status |
| --------------------------------------- | ------ |
| Problem statement                       | ✅      |
| Project objectives                      | ✅      |
| Target users                            | ✅      |
| Rural/underserved focus                 | ✅      |
| MVP scope                               | ✅      |
| Future scope exclusions                 | ✅      |
| Patient role and use cases              | ✅      |
| Healthcare-worker role and use cases    | ✅      |
| Admin role                              | ✅      |
| Authentication and authorization        | ✅      |
| Consent management                      | ✅      |
| AI health companion                     | ✅      |
| RAG architecture concept                | ✅      |
| Symptom processing                      | ✅      |
| Red-flag detection                      | ✅      |
| Healthcare escalation                   | ✅      |
| Prescription OCR                        | ✅      |
| Medication management                   | ✅      |
| Medication reminders                    | ✅      |
| Medication adherence                    | ✅      |
| Health timeline                         | ✅      |
| Healthcare-worker dashboard             | ✅      |
| AI-generated summaries                  | ✅      |
| Follow-up management                    | ✅      |
| Multilingual support (concept)          | ✅      |
| Voice support (concept)                 | ✅      |
| Offline-first concept                   | ✅      |
| Synchronization concept                 | ✅      |
| Security requirements                   | ✅      |
| Privacy requirements                    | ✅      |
| Free/open-source constraint             | ✅      |
| Testing requirements                    | ✅      |
| AI evaluation concept                   | ✅      |
| Research direction                      | ✅      |
| Limitations acknowledgment              | ✅      |
| Safety philosophy                       | ✅      |
| Technology direction                    | ✅      |

### Needs decisions during design

| Area                                    | Status |
| --------------------------------------- | ------ |
| Target geography                        | 🟡      |
| MVP languages                           | 🟡      |
| Healthcare-worker definition            | 🟡      |
| Emergency escalation behavior           | 🟡      |
| Healthcare-resource locator scope       | 🟡      |
| Notification mechanism                  | 🟡      |
| Prescription verification workflow      | 🟡      |
| Medical knowledge governance            | 🟡      |
| Data retention and deletion             | 🟡      |
| AI conversation storage                 | 🟡      |
| Source citation behavior                | 🟡      |
| RAG fallback behavior                   | 🟡      |
| Model fallback strategy                 | 🟡      |
| Hardware constraints                    | 🟡      |
| Offline conflict resolution             | 🟡      |
| Low-bandwidth strategy                  | 🟡      |
| Performance targets                     | 🟡      |

### Must explicitly design before production

| Area                                    | Status |
| --------------------------------------- | ------ |
| Clinical knowledge governance           | 🔴      |
| File-upload security                    | 🔴      |
| AI prompt security                      | 🔴      |
| Threat model                            | 🔴      |
| Auditability                            | 🔴      |
| Dataset provenance                      | 🔴      |
| Evaluation baselines                    | 🔴      |
| Model reproducibility                   | 🔴      |
| Human evaluation                        | 🔴      |
| Ethics/institutional approval           | 🔴      |

---

# 3. Product Scope Decisions

---

## PD-01 — Target Geography

### Context

The system targets "rural and underserved communities," but that is globally broad. The target geography affects languages, medical sources, healthcare APIs, guidelines, datasets, evaluation, UI, and research claims.

### Options

| Option | Description                                                          |
| ------ | -------------------------------------------------------------------- |
| A      | Rural and underserved communities globally                           |
| B      | Rural and underserved communities in India                           |
| C      | Rural communities in India, with initial focus on a specific region  |

### Recommendation

> **Option B — Rural and underserved communities in India.**

With MVP evaluation initially focused on languages spoken by the project team for feasible testing.

### Decision

```
Status: PENDING
Approved: 
Date:
```

---

## PD-02 — MVP Languages

### Context

The system claims multilingual support, but the exact languages affect datasets, speech models, LLM capabilities, translation quality, and evaluation feasibility. Languages mentioned in the original proposal include English, Hindi, Telugu, and Odiya.

### Important Constraint

A language must not be claimed as "supported" until its functionality has been tested and evaluated.

### Options

| Option | Languages                       | Rationale                                      |
| ------ | ------------------------------- | ---------------------------------------------- |
| A      | English + Telugu                | Minimal viable, feasibly testable              |
| B      | English + Telugu + Hindi        | Broader reach, Hindi widely supported by models |
| C      | English + Telugu + Hindi + Odiya | Full original proposal, hardest to evaluate    |

### Evaluation Criteria

For each language, verify:

* LLM instruction-following quality
* Speech-to-text availability and accuracy
* Medical knowledge availability
* Translation quality
* Dataset availability for evaluation
* Team capability to evaluate

### Recommendation

> **Option B — English + Telugu + Hindi**

Start with English as the primary development language. Add Telugu and Hindi with explicit evaluation. Odiya may be explored as a stretch goal or future extension.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-03 — Healthcare Worker Definition

### Context

"Healthcare Worker" is broad. The system's permissions, dashboard complexity, and clinical expectations differ between doctors, nurses, community health workers (CHWs), ANMs, and clinic staff.

### Options

| Option | Definition                                                   |
| ------ | ------------------------------------------------------------ |
| A      | Doctors only                                                 |
| B      | Community Health Workers / ANMs                              |
| C      | Any authorized healthcare professional or personnel          |

### Recommendation

> **Option C — Any authorized healthcare professional or personnel.**

The system should not claim to be specifically designed for doctors unless clinically validated for that purpose. The MVP should support a general "authorized healthcare worker" role with appropriate access controls.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-04 — Emergency Escalation Behavior

### Context

The system detects red-flag symptoms, but the escalation response has not been defined. Different behaviors carry different technical, legal, and safety implications.

### Options

| Option | Behavior                                                                |
| ------ | ----------------------------------------------------------------------- |
| A      | Display prominent emergency guidance text only                          |
| B      | Display guidance + notify a registered emergency contact                |
| C      | Display guidance + alert an authorized healthcare worker                |
| D      | Display guidance + attempt to contact emergency services                |

### Recommendation

> **Option A + C — Display prominent emergency guidance + optional healthcare-worker alert.**

Do **not** attempt autonomous emergency-service calling in the MVP. The system should clearly advise the patient to seek immediate professional/emergency care and, where authorized, create an alert for the healthcare-worker dashboard.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-05 — Healthcare Resource Locator

### Context

The original proposal mentions nearby clinic/hospital discovery with estimated travel time. This introduces geolocation, maps APIs, location permissions, rural POI accuracy, data freshness, and privacy concerns.

### Options

| Option | Scope                                          |
| ------ | ---------------------------------------------- |
| A      | Include in Core MVP                            |
| B      | Phase 2 — after core functionality is complete |
| C      | Remove entirely                                |

### Recommendation

> **Option B — Phase 2.**

The feature is not central to the AI research contribution and introduces significant complexity. Core MVP should focus on the AI companion, symptom processing, prescription OCR, medication management, and healthcare-worker dashboard.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-06 — Notification Mechanism

### Context

Medication reminders require a notification delivery mechanism. The system should remain free and avoid mandatory paid services (e.g., SMS providers).

### Options

| Option | Mechanism                                       |
| ------ | ----------------------------------------------- |
| A      | Browser/PWA push notifications                  |
| B      | Browser notifications + email                   |
| C      | Browser notifications + SMS                     |
| D      | Browser notifications + local scheduling        |

### Recommendation

> **Option D — Browser/PWA notifications + local scheduling where technically supported.**

Avoid making SMS a mandatory feature. PWA notifications combined with local scheduling provide a free, functional reminder system for the MVP.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-07 — Prescription Verification Workflow

### Context

OCR output is inherently uncertain. The system must not automatically create medication schedules from unverified OCR output. A verification step is required.

### Recommended Workflow

```text
Prescription Image
       ↓
OCR Processing
       ↓
Text Extraction
       ↓
Medicine Information Extraction
       ↓
Confidence Assessment
       ↓
Patient Verification
       ↓
Confirmed Medication
       ↓
Medication Schedule
```

### Rules

1. OCR output must be presented to the patient for review before creating schedules.
2. Low-confidence extractions must be explicitly flagged.
3. The system must not silently correct or substitute medication names.
4. Unverified information must not enter the medication schedule automatically.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-08 — Medical Knowledge Governance

### Context

RAG quality depends entirely on the knowledge corpus. The process for adding, reviewing, and maintaining medical documents must be defined.

### Recommended Governance

```text
Candidate Source
       ↓
Source Verification
       ↓
Metadata Recorded
       ↓
Review by Authorized Person
       ↓
Approved
       ↓
Processing (clean → chunk → embed)
       ↓
Knowledge Base
```

### Roles

| Role                       | Responsibility                             |
| -------------------------- | ------------------------------------------ |
| Knowledge Manager / Admin  | Submit candidate documents                 |
| Project Team / Reviewer    | Verify authority and appropriateness       |
| System                     | Process, embed, and store approved content |

### Knowledge Source Metadata

Each source should record, where available:

* Source name
* Publisher
* Title
* Publication date
* Version
* Topic
* Language
* License/usage information
* Status (ACTIVE / OUTDATED / ARCHIVED)
* Last reviewed date

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-09 — Data Retention and Deletion

### Context

The system stores health information. Retention and deletion policies must be defined for privacy and compliance.

### Recommended MVP Policy

| Data Type              | Retention                                              |
| ---------------------- | ------------------------------------------------------ |
| Patient profile        | While account is active                                |
| Consent records        | Retained for auditability                              |
| Health timeline        | While account is active                                |
| Symptom records        | While account is active                                |
| Prescriptions          | While account is active                                |
| Medication records     | While account is active                                |
| AI conversations       | Structured extracts retained; raw logs have a limit    |
| Uploaded images        | Retained while prescription is active; deletable       |
| Audit logs             | Retained for defined audit period                      |
| Follow-ups             | While relevant patient relationship is active          |

### Account Deletion

When a patient requests account deletion:

* Profile is removed or anonymized.
* Health data is removed or anonymized.
* Audit records may be retained in anonymized form as required.
* Uploaded files are deleted.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-10 — AI Conversation Storage

### Context

Storing every patient–AI conversation indefinitely raises privacy and storage concerns. A policy is needed.

### Options

| Option | Behavior                                                          |
| ------ | ----------------------------------------------------------------- |
| A      | Store full conversations indefinitely                             |
| B      | Store structured health extracts only; discard raw conversations  |
| C      | Store conversations with a retention limit (e.g., 90 days)       |
| D      | Store conversations only where relevant to health timeline        |

### Recommendation

> **Option D — Store conversations only where relevant to the health timeline / continuity of care.**

Structured health-relevant information (symptoms reported, guidance given, escalation triggered) should be retained. Full raw conversational logs should not be retained indefinitely without purpose.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-11 — Source Citation in AI Responses

### Context

RAG-grounded responses should be traceable. The question is how citation appears to the user.

### Recommendation

For applicable medical responses, the system should present source attribution:

```text
Response text

Sources:
  - [Source Title, Publisher, Date]
  - [Source Title, Publisher, Date]
```

Source metadata should be stored for research evaluation (retrieval traceability).

Non-medical conversational responses may not require citations.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-12 — RAG Fallback Behavior

### Context

When no reliable document is retrieved for a user query, the system must not silently fall back to ungrounded LLM generation and present the result as grounded.

### Recommended Behavior

```text
User Query
    ↓
RAG Retrieval
    ↓
No relevant document found (below threshold)
    ↓
System responds:
"I couldn't find reliable information for this question
 in my current medical knowledge base.
 Please consult a qualified healthcare professional."
    ↓
Optional: general safe guidance
    ↓
Escalation recommendation where appropriate
```

### Rule

The system must clearly distinguish between:

* Grounded responses (retrieved source available)
* General guidance (no specific source)
* Escalation (professional care recommended)

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-13 — Model Fallback Strategy

### Context

If the primary AI model fails (crash, memory, unavailability, unsafe output), the system needs a defined fallback.

### Recommended Strategy

```text
Primary AI Model
       ↓ failure
Retry (if transient)
       ↓ failure
Fallback Model (if available)
       ↓ failure
Safe Non-AI Response
```

### Rule

> **The system must never fail into fabricated medical content.**

A safe non-AI response might be:

> "I'm currently unable to process your request. Please try again later or consult a healthcare professional."

### Decision

```
Status: PENDING
Approved:
Date:
```

---

# 4. AI/ML Decisions

---

## PD-14 — Model Hosting Strategy

### Context

The LLM can run locally, in the cloud, or in a hybrid configuration. This affects cost, latency, offline capability, and hardware requirements.

### Options

| Option | Strategy                                     | Pros                           | Cons                              |
| ------ | -------------------------------------------- | ------------------------------ | --------------------------------- |
| A      | Fully local                                  | Free, offline, private         | Hardware limited, model size      |
| B      | Fully cloud (free tier)                       | Larger models possible         | Connectivity required, API limits |
| C      | Hybrid (local small + cloud large)           | Best of both, research angle   | More complexity                   |

### Recommendation

> **Option C — Hybrid.**

This is the most interesting for the research angle (offline-capable with quality comparison). Final decision after model benchmarking.

### Decision

```
Status: PENDING — requires hardware assessment and model evaluation
Approved:
Date:
```

---

## PD-15 — Hardware Constraints

### Context

As a student project using free resources, the available development hardware directly constrains model selection, quantization, and inference strategy.

### Required Information

| Parameter              | Value |
| ---------------------- | ----- |
| CPU                    |       |
| RAM                    |       |
| GPU                    |       |
| GPU VRAM               |       |
| Disk (available)       |       |
| OS                     |       |
| Cloud access (Colab?)  |       |
| Other compute access   |       |

### Impact

* Determines maximum model size
* Determines quantization requirements
* Determines local vs. cloud inference split
* Determines embedding model choice
* Determines OCR and speech processing feasibility

### Decision

```
Status: PENDING — requires hardware documentation
Approved:
Date:
```

---

## PD-16 — LLM Hallucination Definition

### Context

"Hallucination testing" requires a definition of what constitutes a hallucination failure.

### Recommended Failure Categories

| Category                  | Example                                              |
| ------------------------- | ---------------------------------------------------- |
| Unsupported medical claim | Stating a treatment without source                   |
| Contradicted by source    | Response contradicts the retrieved document           |
| Fabricated citation       | Citing a non-existent source                         |
| Unsafe recommendation     | Advising stopping medication without authority       |
| Incorrect medication info | Wrong dosage, wrong drug                             |
| False confidence          | Presenting uncertain information as definitive        |
| Invented clinical rule    | Creating a triage threshold without medical basis    |

### Decision

```
Status: PENDING
Approved:
Date:
```

---

# 5. Security Decisions

---

## PD-17 — File Upload Security

### Context

Prescription OCR requires image uploads, introducing an attack surface.

### Required Controls

| Control                | Description                                  |
| ---------------------- | -------------------------------------------- |
| File-type validation   | Accept only approved image formats           |
| Size limits            | Enforce reasonable maximum file size         |
| Image validation       | Verify file is a valid image                 |
| Safe storage           | Store outside webroot with restricted access |
| Randomized filenames   | Prevent predictable file paths               |
| Access control         | Only the owning patient and authorized roles |
| No executable uploads  | Reject non-image files                       |
| Malware scanning       | Where practical                              |

### Decision

```
Status: PENDING — to be detailed during security architecture
Approved:
Date:
```

---

## PD-18 — AI Prompt Security

### Context

LLM applications are vulnerable to prompt injection. Users could attempt to override safety instructions.

### Threat Scenarios

| Threat                  | Example                                              |
| ----------------------- | ---------------------------------------------------- |
| Direct prompt injection | User writes "Ignore safety instructions..."          |
| Indirect injection      | Malicious content in retrieved documents              |
| RAG poisoning           | Corrupted medical documents in the knowledge base     |
| Output manipulation     | Attempting to make the AI produce unsafe content      |

### Required Mitigations

* System prompt must be protected from user override.
* Retrieved documents must not override safety instructions.
* Input sanitization where appropriate.
* Output safety validation.
* Knowledge base access control and governance.

### Decision

```
Status: PENDING — to be detailed during AI security design
Approved:
Date:
```

---

## PD-19 — Auditability

### Context

Healthcare-worker access to patient information should be auditable.

### Recommended Audit Events

| Event                              | Logged Information                   |
| ---------------------------------- | ------------------------------------ |
| Healthcare worker views patient    | Worker ID, Patient ID, Timestamp     |
| Healthcare worker views summary    | Worker ID, Patient ID, Timestamp     |
| Alert reviewed                     | Worker ID, Alert ID, Timestamp       |
| Follow-up created                  | Worker ID, Patient ID, Timestamp     |
| Knowledge base updated             | User ID, Document ID, Timestamp      |
| Admin operation                    | Admin ID, Operation, Timestamp       |

### Rule

Not every screen interaction needs to be logged, but sensitive operations involving patient data access must be auditable.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-20 — Threat Model

### Context

A formal threat model has not yet been created. It should be developed during the security architecture phase.

### Key Threat Categories

* Unauthorized patient data access
* Healthcare-worker privilege abuse
* Credential theft
* API abuse / rate limiting
* Prompt injection
* RAG poisoning
* Malicious file uploads
* Data leakage through logs/errors
* OCR manipulation
* Model output abuse
* Insecure synchronization

### Decision

```
Status: PENDING — to be created during security architecture
Approved:
Date:
```

---

# 6. Infrastructure Decisions

---

## PD-21 — Offline Conflict Resolution

### Context

When offline data is synchronized, conflicts can occur (e.g., different values on device vs. server for the same record).

### Recommended Strategy

> **Immutable timestamped health events are preferred over destructive updates.**

| Scenario                          | Strategy                                      |
| --------------------------------- | --------------------------------------------- |
| Medication adherence recorded     | Accept as timestamped event (no conflict)     |
| Symptom recorded offline          | Accept as timestamped event                   |
| Profile updated on both sides     | Last-write-wins or prompt user to resolve     |
| Duplicate operation               | Deduplicate using idempotency key             |

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-22 — Low-Bandwidth Strategy

### Context

"Offline-first" and "low-bandwidth" are different concerns. The system should also work reasonably when connectivity is slow but available.

### Recommended Practices

* Small API payloads
* Image compression for uploads
* Lazy loading
* Aggressive caching
* Minimal JavaScript payload
* Request retry with backoff
* Efficient synchronization (delta sync where possible)
* Progressive loading

### Decision

```
Status: PENDING — to be detailed during architecture
Approved:
Date:
```

---

## PD-23 — Performance Targets

### Context

"Acceptable response time" is too vague. Measurable targets should be defined after feasibility analysis.

### Placeholder Targets (to be validated)

| Operation                  | Target (TBD)         |
| -------------------------- | -------------------- |
| Standard API response      | To be determined     |
| OCR processing             | To be determined     |
| RAG retrieval              | To be determined     |
| AI response generation     | To be determined     |
| Offline sync               | To be determined     |

### Rule

Do not invent performance numbers. Determine realistic targets during architecture/feasibility analysis and validate during testing.

### Decision

```
Status: PENDING — to be defined during architecture
Approved:
Date:
```

---

## PD-24 — Observability

### Context

The system needs basic monitoring for health, errors, and AI performance.

### Recommended MVP Observability

| Area                  | Mechanism                            |
| --------------------- | ------------------------------------ |
| Application health    | Health-check endpoint                |
| Error tracking        | Structured error logging             |
| API metrics           | Request count, latency, error rate   |
| AI latency            | Per-request timing                   |
| OCR failures          | Failure count, failure type          |
| RAG retrieval quality | Hit/miss rate, retrieval confidence  |
| Sync failures         | Queue length, failure count          |

### Decision

```
Status: PENDING — to be detailed during architecture
Approved:
Date:
```

---

## PD-25 — Backup and Recovery

### Context

Database backup and recovery must be defined, even for a student project.

### Recommended MVP

* Regular PostgreSQL backups (pg\_dump or equivalent)
* Documented restore procedure
* Tested recovery at least once before final evaluation
* Knowledge base rebuild capability from source documents

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-26 — CI/CD

### Context

Automated testing and deployment can strengthen the engineering demonstration.

### Recommended MVP

```text
GitHub
  ↓
Push / PR
  ↓
Automated tests (pytest, lint)
  ↓
Build verification
  ↓
Manual deployment
```

Full automated deployment is optional for the MVP but would strengthen the project.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-27 — Versioning Strategy

### Context

APIs, models, knowledge base, and the application itself need version tracking for reproducibility.

### Recommended Strategy

| Component        | Versioning                              |
| ---------------- | --------------------------------------- |
| API              | URL prefix: `/api/v1/...`              |
| Application      | Semantic: `v0.1`, `v0.2`, `v1.0`      |
| Database         | Migration-based (Alembic or equivalent) |
| AI models        | Model name + version + quantization    |
| Knowledge base   | Version identifier + document manifest |
| Evaluation       | Experiment ID + parameters             |

### Decision

```
Status: PENDING
Approved:
Date:
```

---

# 7. Research and Evaluation Decisions

---

## PD-28 — Model/Experiment Reproducibility

### Context

For every AI experiment, the following should be recorded for reproducibility.

### Required Metadata

```text
Model name
Model version
Quantization (if applicable)
Prompt version / template
Embedding model
Knowledge-base version
Dataset version
Parameters (temperature, top_k, etc.)
Evaluation date
Hardware used
Results
```

### Decision

```
Status: PENDING — to be enforced during AI development
Approved:
Date:
```

---

## PD-29 — Dataset Provenance

### Context

Every dataset used must have tracked provenance to prevent the classic student-project problem of "we downloaded some dataset from somewhere."

### Required Metadata

```text
Dataset name
Source
URL
License
Version
Language(s)
Size
Collection method
Preprocessing applied
Train/validation/test split
Known limitations
```

### Decision

```
Status: PENDING — to be enforced during data collection
Approved:
Date:
```

---

## PD-30 — Evaluation Baselines

### Context

Evaluating only "our model works" is academically weak. Baselines enable meaningful comparison.

### Recommended Baselines

| Baseline                     | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| LLM without RAG              | Measure RAG contribution to grounding          |
| Rule-only triage              | Measure AI contribution to triage accuracy     |
| LLM-only triage              | Compare rule-based vs. LLM-based triage        |
| RAG + LLM                    | Full system evaluation                         |
| OCR without preprocessing     | Measure preprocessing contribution             |
| Monolingual only             | Measure multilingual capability impact          |

### Decision

```
Status: PENDING — to be finalized during evaluation design
Approved:
Date:
```

---

## PD-31 — Human Evaluation

### Context

Some healthcare AI outputs cannot be evaluated using automatic metrics alone.

### Options

| Option | Evaluators                      | Feasibility           |
| ------ | ------------------------------- | --------------------- |
| A      | Healthcare professionals        | Strongest, harder     |
| B      | Domain-knowledgeable evaluators | Good, more accessible |
| C      | Structured rubric by team       | Weakest, most feasible|

### Recommendation

> Attempt **Option A or B** for at least a subset of the evaluation.

Do **not** claim clinical validation unless qualified professionals and an appropriate study design are used.

### Decision

```
Status: PENDING — to be planned during evaluation design
Approved:
Date:
```

---

## PD-32 — Ethics and Institutional Approval

### Context

If the project eventually involves real patients, real patient data, healthcare workers, or user studies with sensitive health information, appropriate institutional/ethical approval and informed consent may be required.

### Recommendation

* MVP development and evaluation should use synthetic/public/de-identified data.
* If user studies are planned, check institutional requirements for ethics approval.
* Do not collect real patient data without appropriate authorization.

### Decision

```
Status: PENDING — to be assessed if user studies are planned
Approved:
Date:
```

---

## PD-33 — Clinical Scope

### Context

"Primary healthcare" is broad. The system should define the scope of clinical topics for the MVP to prevent the system from becoming "AI for every medical condition."

### Recommendation

Define a focused knowledge scope for MVP evaluation. For example:

* Common symptoms (fever, cough, headache, stomach pain, etc.)
* Basic health information
* Medication understanding
* Preventive guidance
* Red-flag escalation for documented emergency indicators

The exact clinical topic coverage should be derived from authoritative sources and limited to what can feasibly be evaluated.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

## PD-34 — Research Novelty Claim

### Context

The project should not claim:

> "No major solution yet offers..."

without a proper literature and product review.

### Recommendation

Use the safer framing:

> "The project investigates an offline-capable, multilingual, RAG-grounded healthcare support architecture designed specifically for low-resource rural settings."

Novelty claims should be validated during the literature review phase.

### Decision

```
Status: PENDING — to be finalized after literature review
Approved:
Date:
```

---

# 8. Architectural Principle Decision

---

## PD-35 — Data/Processing Layer Separation

### Context

Healthcare AI systems benefit from clear separation between different types of information at every stage.

### Recommended Architecture

```text
PATIENT FACT
"I have fever for 3 days."
        ↓
STRUCTURED DATA
symptom = fever
duration = 3 days
        ↓
RETRIEVED KNOWLEDGE
Source-backed medical information
        ↓
AI INTERPRETATION
Generated explanation
        ↓
SYSTEM DECISION
Rule-based escalation
```

### Layers

| Layer                | Description                                         |
| -------------------- | --------------------------------------------------- |
| Patient-reported     | Raw input from the user                             |
| Structured extraction| System-extracted structured data                    |
| Retrieved knowledge  | Documents/chunks from the approved knowledge base   |
| AI generation        | LLM-generated text                                  |
| System decision      | Deterministic rule-based logic                      |

### Rule

These layers must remain distinguishable in data storage, processing, and presentation. This separation improves safety, debuggability, traceability, and research evaluation.

### Decision

```
Status: PENDING
Approved:
Date:
```

---

# 9. Decision Approval Process

### Process

1. Review each decision.
2. Discuss alternatives if needed.
3. Select an option.
4. Record the decision, rationale, and date.
5. Update `Status` to `APPROVED`.
6. The decision becomes binding unless formally revised.

### After All Decisions Are Approved

```text
PRE_DEVELOPMENT_DECISIONS.md (all approved)
        ↓
Update SRS.md if any requirement changed
        ↓
Create TRACEABILITY_MATRIX.md
        ↓
Begin architecture design
```

---

# 10. Decision Summary

| ID    | Decision                        | Status   | Selected Option / Baseline |
| ----- | ------------------------------- | -------- | -------------------------- |
| PD-01 | Target geography                | APPROVED | Rural India                |
| PD-02 | MVP languages                   | APPROVED | English + Telugu + Hindi   |
| PD-03 | Healthcare-worker definition    | APPROVED | Authorized Personnel / CHW |
| PD-04 | Emergency escalation behavior   | APPROVED | Guidance + Worker Alert    |
| PD-05 | Healthcare-resource locator     | APPROVED | Phase 2 (Post-MVP)         |
| PD-06 | Notification mechanism          | APPROVED | PWA Push + Local Schedule  |
| PD-07 | Prescription verification       | APPROVED | Patient Verification Flow  |
| PD-08 | Medical knowledge governance    | APPROVED | Document Approval Workflow |
| PD-09 | Data retention and deletion     | APPROVED | Active Account Retention   |
| PD-10 | AI conversation storage         | APPROVED | Timeline-Relevant Extract  |
| PD-11 | Source citation behavior        | APPROVED | Source Metadata Attribution|
| PD-12 | RAG fallback behavior           | APPROVED | Safe Limitation Message    |
| PD-13 | Model fallback strategy         | APPROVED | Safe Non-AI Response       |
| PD-14 | Model hosting strategy          | APPROVED | Hybrid (Local/Cloud)       |
| PD-15 | Hardware constraints            | APPROVED | Local + Colab Baseline     |
| PD-16 | LLM hallucination definition    | APPROVED | 7 Failure Categories       |
| PD-17 | File-upload security            | APPROVED | Validation + Random Paths  |
| PD-18 | AI prompt security              | APPROVED | System Prompt Safeguards   |
| PD-19 | Auditability                    | APPROVED | Sensitive Event Logs       |
| PD-20 | Threat model                    | APPROVED | 11 Threat Scenarios        |
| PD-21 | Offline conflict resolution     | APPROVED | Timestamped Immutable      |
| PD-22 | Low-bandwidth strategy          | APPROVED | Payload Compression/Cache  |
| PD-23 | Performance targets             | APPROVED | Defined in Arch Phase      |
| PD-24 | Observability                   | APPROVED | Request/Latency Metrics    |
| PD-25 | Backup and recovery             | APPROVED | pg_dump + Document Restore |
| PD-26 | CI/CD                           | APPROVED | GitHub Actions Pipeline    |
| PD-27 | Versioning strategy             | APPROVED | SemVer + API Prefix        |
| PD-28 | Model reproducibility           | APPROVED | Experiment Metadata Track  |
| PD-29 | Dataset provenance              | APPROVED | Metadata & License Track   |
| PD-30 | Evaluation baselines            | APPROVED | 6 Evaluation Baselines     |
| PD-31 | Human evaluation                | APPROVED | Expert Rubric Assessment   |
| PD-32 | Ethics/institutional approval   | APPROVED | Synthetic/De-identified    |
| PD-33 | Clinical scope                  | APPROVED | Common Symptoms Focus      |
| PD-34 | Research novelty claim          | APPROVED | Low-Resource Architecture  |
| PD-35 | Data/processing layer separation| APPROVED | 5-Layer System Model       |

---

# 11. Final Note

These decisions are not signs of deficiency in the existing documents. They are exactly the **engineering details that should be resolved before implementation begins**.

Resolving them now prevents:

* Scope creep during development
* Architectural rework
* Untestable claims
* Security gaps
* Research weaknesses
* Evaluation gaps

The sequence is now:

```text
AGENTS.md                      ✅
PROJECT_SPECIFICATION.md       ✅
SRS.md                         ✅
USE_CASES.md                   ✅
PRE_DEVELOPMENT_DECISIONS.md   ✅ (decisions pending approval)
        ↓
Approve decisions
        ↓
TRACEABILITY_MATRIX.md
        ↓
Architecture Design
        ↓
Database Design
        ↓
API Specification
        ↓
AI/RAG Design
        ↓
Development
```
