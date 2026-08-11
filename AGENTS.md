# MedGuide AI — AI Coding Agent Rules & Development Guidelines

## 1. Project Identity

**Project Name:** MedGuide AI
**Project Title:** MedGuide AI: An AI-Powered Rural Healthcare Intelligence and Digital Care Platform

MedGuide AI is a student-led healthcare technology project designed to provide an accessible first layer of AI-assisted primary healthcare support for rural and underserved communities.

The system is intended to support patients and authorized healthcare workers through multilingual communication, preliminary health guidance, symptom triage, prescription understanding, medication support, health records, and continuity of care.

**The system must never be positioned as a replacement for qualified healthcare professionals.**

---

# 2. Primary Development Objective

Every implementation decision must contribute to at least one of the following objectives:

1. Improve access to preliminary healthcare information.
2. Support rural and underserved communities.
3. Handle language and digital-literacy barriers.
4. Operate effectively under limited connectivity.
5. Provide grounded and safer AI-assisted healthcare information.
6. Support healthcare workers in reviewing patient information.
7. Maintain continuity of care through structured health information.
8. Demonstrate practical integration of AI, NLP, speech processing, OCR, RAG, full-stack development, and secure health-data management.

If a proposed feature does not meaningfully support the project's objectives, **do not implement it without explicit approval.**

---

# 3. Scope Protection

The agent MUST NOT expand the project scope independently.

Do not introduce unrelated features such as:

* E-commerce
* Payments
* Insurance management
* Hospital billing
* Social networking
* Generic chatbot features
* Unrelated predictive analytics
* Unnecessary AI agents
* Cryptocurrency/blockchain
* Unrelated IoT functionality
* Unrelated recommendation systems

If a new feature appears useful but is outside the approved scope:

> **Stop and ask for approval before implementation.**

---

# 4. MVP Boundary

The approved MVP focuses on:

### Patient

* Registration and authentication
* Consent management
* Patient profile
* AI health companion
* Symptom input
* Preliminary health guidance
* Red-flag detection
* Healthcare escalation
* RAG-based medical information
* Prescription upload
* Prescription OCR
* Medication extraction
* Medication scheduling
* Medication reminders
* Medication adherence
* Health timeline

### Healthcare Worker

* Secure login
* Patient list
* Patient profiles
* Patient-reported symptoms
* AI-generated patient summaries
* Medication information
* Alerts
* Follow-up management

### Core differentiators

* Multilingual interaction
* Voice interaction
* Offline-first functionality
* RAG-grounded healthcare information
* Healthcare-worker involvement

---

# 5. Future Scope

The following must NOT be implemented unless explicitly approved:

* Full EHR/FHIR interoperability
* Medical-device integration
* Disease outbreak prediction
* Drug-stock prediction
* WhatsApp integration
* IVR
* Large-scale public-health analytics
* Extensive multi-language expansion
* Advanced disease prediction
* Real-world clinical deployment
* Autonomous medical decision-making

These may be documented as future enhancements.

---

# 6. No Feature Without a Requirement

Every feature implemented must map to:

* A functional requirement
* A non-functional requirement
* An approved use case
* Or an explicitly approved development task

Before implementing a new feature, the agent should be able to answer:

> **Why does this feature exist in MedGuide AI?**

If there is no clear answer, do not implement it.

---

# 7. Healthcare Safety Rules

This is a healthcare-oriented system.

The agent MUST treat healthcare safety as a high-priority requirement.

## MedGuide AI MAY:

* Explain general health information.
* Provide preliminary health guidance.
* Help users structure reported symptoms.
* Explain information found in trusted medical sources.
* Explain prescription information.
* Provide medication reminders.
* Identify predefined red-flag symptoms.
* Recommend contacting a healthcare professional.
* Recommend emergency care when predefined emergency criteria are met.
* Summarize patient-reported information for authorized healthcare workers.

## MedGuide AI MUST NOT:

* Claim to be a doctor.
* Claim to provide definitive diagnosis.
* Independently prescribe medication.
* Recommend changing prescribed dosage.
* Tell a patient to stop prescribed medication.
* Override a healthcare professional.
* Generate unsupported medical claims.
* Present uncertain information as medical fact.
* Create fabricated medical references.
* Invent clinical guidelines.
* Invent emergency thresholds.
* Make unsupported treatment recommendations.

---

# 8. Medical Knowledge Rule

Medical information must not be invented by the coding agent.

Whenever medical rules, symptoms, contraindications, emergency indicators, medication information, or clinical recommendations are required:

1. Use an authoritative and documented source.
2. Record the source.
3. Preserve source metadata.
4. Avoid unsupported assumptions.
5. Clearly distinguish project logic from established medical guidance.

The agent must never create a medical rule simply because it "sounds reasonable."

---

# 9. AI Safety Architecture

The system must NOT rely exclusively on unconstrained LLM generation for healthcare decisions.

The preferred architecture is:

```text
User Input
    ↓
Input Processing
    ↓
Intent / Symptom Extraction
    ↓
Safety / Red-Flag Detection
    ↓
Knowledge Retrieval
    ↓
RAG Context
    ↓
LLM Response
    ↓
Safety Validation
    ↓
Response / Escalation
```

For safety-critical decisions, deterministic and testable logic should be preferred over unconstrained generation.

---

# 10. RAG Rules

The AI health companion should use Retrieval-Augmented Generation where applicable.

Preferred flow:

```text
User Query
    ↓
Query Processing
    ↓
Embedding
    ↓
Vector Search
    ↓
Relevant Medical Documents
    ↓
Context
    ↓
LLM
    ↓
Grounded Response
```

The agent must:

* Avoid unnecessary hallucination-prone generation.
* Use the approved medical knowledge base.
* Preserve document metadata.
* Avoid retrieving irrelevant documents.
* Never fabricate citations.
* Never claim that a source says something when it does not.
* Keep retrieved evidence separate from generated text.
* Make the source of medical knowledge traceable.

---

# 11. Symptom Triage Rules

The LLM must not be the sole authority for safety-critical triage.

Preferred approach:

```text
Natural Language
      ↓
Structured Symptoms
      ↓
Validated Rules / Decision Logic
      ↓
Risk Level
      ↓
Recommended Action
```

The system should clearly distinguish:

* General guidance
* Non-urgent consultation
* Urgent medical attention
* Emergency escalation

Risk rules must be based on documented medical guidance and must be testable.

---

# 12. Prescription OCR Rules

Prescription processing must follow:

```text
Prescription Image
       ↓
Image Validation
       ↓
Preprocessing
       ↓
OCR
       ↓
Text Extraction
       ↓
Medicine / Dosage / Frequency Extraction
       ↓
Confidence / Validation
       ↓
Human Review Where Necessary
```

The system must NOT assume that OCR output is always correct.

If confidence is low or the prescription is unclear:

> The system should request verification rather than silently inventing or correcting medication information.

---

# 13. Model Selection Rules

Do not select models merely because they are popular.

Every model must be evaluated based on:

* Task suitability
* Accuracy
* Safety
* Language support
* Hardware requirements
* Latency
* Memory requirements
* License
* Availability
* Free/local usage
* Reproducibility

Do not commit to a specific LLM until it has been evaluated against project requirements.

---

# 14. Free-Resource Constraint

The project is intended to be developed using **free and open-source resources wherever practically possible**.

The agent must prioritize:

* Open-source models
* Local inference
* Free libraries
* Free datasets with appropriate licenses
* Local databases
* Free development tools
* Free deployment tiers where suitable

Do not introduce a paid API as a mandatory dependency without explicit approval.

If a paid service is suggested, clearly state:

1. Why it is needed.
2. Whether a free/open-source alternative exists.
3. Whether local execution is possible.
4. What limitations the free alternative has.

---

# 15. Avoid Vendor Lock-In

The architecture should not depend unnecessarily on a single commercial provider.

Prefer portable components such as:

* PostgreSQL
* pgvector
* FastAPI
* Next.js
* Hugging Face
* PyTorch
* Open-source OCR
* Open-source speech models

The system should remain runnable locally whenever practical.

---

# 16. Approved Technology Direction

Unless explicitly changed, the preferred stack is:

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
* Open-source LLMs

### RAG

* Embeddings
* pgvector
* Retrieval pipeline
* LLM

### OCR

* Tesseract or PaddleOCR
* OpenCV where required

### Speech

* Whisper or suitable open-source alternatives

### Development

* Git
* GitHub
* VS Code
* Docker
* Postman/Thunder Client
* Pytest
* Google Colab where useful

The exact model and external service must still be selected through evaluation.

---

# 17. Architecture Stability

Do not change the core architecture unnecessarily.

Before replacing:

* Frontend framework
* Backend framework
* Database
* Authentication system
* RAG architecture
* Model
* Deployment strategy

the agent must explain:

1. Existing approach.
2. Problem with existing approach.
3. Proposed alternative.
4. Advantages.
5. Disadvantages.
6. Migration impact.
7. Whether the change is actually necessary.

Do not rewrite working components merely because another technology is newer.

---

# 18. Database Rules

Use structured relational data for application information.

Important entities include:

```text
User
Patient
HealthcareWorker
Consent
Conversation
Message
SymptomRecord
Prescription
Medication
MedicationSchedule
MedicationAdherence
HealthTimeline
Alert
FollowUp
KnowledgeDocument
KnowledgeChunk
AuditLog
```

Do not store everything as unstructured JSON when a relational structure is appropriate.

Do not duplicate data unnecessarily.

Do not store sensitive information unless required.

---

# 19. Data Minimization

Only collect information required for the project's functionality.

Do not collect:

* Unnecessary personal information
* Unnecessary location information
* Unnecessary medical history
* Unnecessary identifiers

Development and testing should use:

* Synthetic data
* Public datasets
* Appropriately licensed data
* Properly de-identified data where permitted

Real patient data should NOT be used casually for development.

---

# 20. Privacy Rules

Health information must be treated as sensitive.

The agent must:

* Never expose patient information in logs unnecessarily.
* Never hard-code credentials.
* Never commit `.env` files.
* Never expose API keys.
* Avoid storing unnecessary PII.
* Apply authentication and authorization.
* Restrict patients to their own data.
* Restrict healthcare workers to authorized patient information.
* Maintain appropriate auditability.

---

# 21. Authentication & Authorization

Use role-based access control.

Minimum roles:

```text
PATIENT
HEALTHCARE_WORKER
ADMIN
```

A patient must only access their authorized information.

A healthcare worker must only access patients they are authorized to view.

The agent must never bypass authorization for convenience during production implementation.

---

# 22. Offline-First Rules

Do not claim that the entire application is offline-capable unless it actually is.

Clearly distinguish:

### Offline-capable

* Cached patient information
* Health timeline
* Medication schedules
* Reminders
* Basic rules
* Previously available information
* Queued operations

### Online-dependent

* Large LLM inference
* Cloud RAG
* Server-side processing
* Healthcare-worker synchronization
* Services requiring network access

Offline synchronization must handle:

* Pending operations
* Retry
* Duplicate prevention
* Conflict handling
* Failed synchronization

---

# 23. API Development Rules

Every API must define:

* Endpoint
* HTTP method
* Authentication
* Authorization
* Request schema
* Response schema
* Validation
* Error responses
* Status codes

Do not create random endpoints during development.

Prefer consistent REST conventions.

---

# 24. Frontend Rules

The interface must prioritize:

* Simplicity
* Accessibility
* Mobile responsiveness
* Low digital literacy
* Local-language usability
* Clear error messages
* Large touch targets
* Minimal unnecessary navigation
* Low-bandwidth performance

Do not prioritize visual complexity over usability.

---

# 25. Code Quality Rules

Every implementation should be:

* Readable
* Modular
* Maintainable
* Testable
* Properly named
* Documented where necessary

Avoid:

* Duplicate code
* Giant components
* Giant functions
* Hard-coded values
* Magic numbers
* Unused dependencies
* Unused files
* Temporary hacks left in production code

---

# 26. Dependency Rules

Before adding a dependency, ask:

1. Is it actually necessary?
2. Is there already an existing dependency that solves the problem?
3. Is it maintained?
4. Is its license appropriate?
5. Does it introduce security risks?
6. Is there a lightweight alternative?
7. Can the functionality be implemented simply without another dependency?

Do not install packages merely because they are popular.

---

# 27. Environment & Secrets

All secrets must be stored through environment variables.

Example:

```text
DATABASE_URL=
JWT_SECRET=
LLM_API_KEY=
MAP_API_KEY=
```

Use:

```text
.env
.env.local
```

Never commit them.

Provide:

```text
.env.example
```

with placeholder values only.

---

# 28. Error Handling

Never silently fail.

Every important failure should provide:

* Appropriate backend error
* Safe frontend message
* Developer-readable logs
* No sensitive information leakage

For healthcare operations, uncertainty should never be silently converted into a confident answer.

---

# 29. Logging Rules

Logs must be useful but privacy-conscious.

Do not log:

* Passwords
* Tokens
* API keys
* Full patient medical histories
* Sensitive personal information unnecessarily
* Complete private conversations unnecessarily

Prefer structured technical logs.

---

# 30. Testing Rules

No major feature is considered complete until it has appropriate tests.

### Backend

* Unit tests
* API tests
* Integration tests

### Frontend

* Component tests where useful
* User-flow testing

### AI

* Retrieval testing
* Response evaluation
* Hallucination testing
* Safety testing

### OCR

* OCR accuracy
* Medicine extraction accuracy

### Speech

* WER
* Language-specific evaluation

### Triage

* Sensitivity
* Specificity
* False-negative analysis

---

# 31. No Fake Evaluation

The agent MUST NOT invent:

* Accuracy
* Precision
* Recall
* F1 score
* Response quality
* User satisfaction
* Clinical performance
* Dataset results
* Research findings

If something has not been experimentally measured:

> State that it has not yet been evaluated.

---

# 32. No Fake Data Presented as Real

Synthetic data must always be identified as synthetic.

Example:

```text
Patient ID: SYN-P001
```

Do not present generated patients, prescriptions, symptoms, or medical cases as real-world clinical data.

---

# 33. Research Integrity

The agent must never:

* Fabricate research papers.
* Fabricate citations.
* Fabricate datasets.
* Fabricate clinical guidelines.
* Fabricate experimental results.
* Claim clinical validation without clinical validation.
* Claim novelty without literature verification.

When a claim requires external verification, mark it for verification.

---

# 34. Documentation Rules

Every major architectural decision should be documented.

Maintain:

```text
/docs
├── requirements/
├── architecture/
├── database/
├── api/
├── ai/
├── data/
├── security/
├── testing/
└── research/
```

Important decisions should be recorded as:

```text
Decision
Reason
Alternatives considered
Advantages
Disadvantages
Final choice
```

---

# 35. Change Management

If a requested change affects:

* Architecture
* Database schema
* AI model
* RAG design
* Security
* Medical safety
* MVP scope
* API contracts

the agent must first explain the impact before making the change.

Do not silently make large architectural changes.

---

# 36. Context Preservation Rule

The agent must always consider the existing project context before generating code.

Before implementing a feature:

1. Inspect the existing project structure.
2. Inspect relevant files.
3. Understand existing architecture.
4. Reuse existing utilities/components where appropriate.
5. Follow established naming conventions.
6. Avoid duplicate implementations.
7. Check existing APIs/models/database structures.
8. Make the smallest appropriate change.

**Never assume the repository is empty.**

---

# 37. No Unnecessary Rewrites

If a feature already works:

> **Modify it instead of rebuilding it.**

Do not rewrite entire files or modules to make a small change.

Prefer:

```text
Small change
→ Test
→ Verify
→ Continue
```

over:

```text
Large rewrite
→ New bugs
→ Broken dependencies
→ Rebuild everything
```

---

# 38. Development Sequence

Follow this order unless explicitly changed:

```text
Requirements
      ↓
Architecture
      ↓
Database
      ↓
API Contracts
      ↓
Authentication
      ↓
Core Backend
      ↓
Frontend Foundation
      ↓
AI Layer
      ↓
RAG
      ↓
Symptom/Triage
      ↓
OCR
      ↓
Medication
      ↓
Healthcare Worker Dashboard
      ↓
Multilingual
      ↓
Voice
      ↓
Offline
      ↓
Testing
      ↓
Evaluation
      ↓
Deployment
```

Do not jump directly into advanced AI features before the foundation is stable.

---

# 39. Git Rules

Use meaningful commits.

Examples:

```text
feat: add patient authentication
feat: implement symptom analysis API
feat: add prescription OCR pipeline
fix: resolve medication schedule validation
test: add symptom triage tests
docs: update RAG architecture
refactor: simplify patient service
```

Do not use meaningless commits such as:

```text
update
changes
final
final2
working
new
```

---

# 40. Agent Response Rules During Development

When asked to implement something, the agent should follow this process:

```text
1. Understand the request
2. Check project context
3. Identify affected components
4. Check whether it fits the approved scope
5. Identify dependencies
6. Implement the smallest correct change
7. Test the change
8. Report what changed
9. Report files affected
10. Report any remaining issues
```

If the request conflicts with the project's requirements or safety rules:

> **Do not blindly implement it. Explain the conflict and ask for approval.**

---

# 41. No Hallucination Rule

If the agent does not know something:

> **Do not guess.**

This applies especially to:

* Medical information
* APIs
* Library behavior
* Model capabilities
* Dataset availability
* Licenses
* Free-tier limits
* Security behavior
* Clinical guidelines

Use verified documentation or clearly state uncertainty.

---

# 42. External Information Rule

For information that can change over time, verify it before implementation.

Examples:

* API availability
* Free-tier limits
* Model availability
* Model licenses
* Library versions
* Deployment limits
* Dataset licenses
* Healthcare guidelines

Never assume that a service is currently free simply because it was free previously.

---

# 43. Definition of Done

A feature is NOT complete simply because the UI works.

A feature is complete when:

```text
Requirement satisfied
       +
Implementation complete
       +
Validation implemented
       +
Error handling
       +
Security considered
       +
Tests written
       +
Documentation updated
       +
No scope violation
```

For AI/healthcare features, additionally:

```text
Safety reviewed
       +
Medical source identified
       +
Evaluation method defined
```

---

# 44. Priority Hierarchy

When making engineering decisions, follow this priority:

### 1. Safety

### 2. Correctness

### 3. Privacy & Security

### 4. Requirements

### 5. Reliability

### 6. Maintainability

### 7. Performance

### 8. User Experience

### 9. Cost

### 10. Convenience

Never sacrifice healthcare safety merely to make implementation easier.

---

# 45. Golden Rule

> **Do not build what was not requested.**
>
> **Do not assume what is unknown.**
>
> **Do not invent medical information.**
>
> **Do not introduce paid dependencies without approval.**
>
> **Do not change architecture without justification.**
>
> **Do not fabricate results.**
>
> **Do not sacrifice safety for functionality.**
>
> **Do not lose the rural, low-resource healthcare focus of MedGuide AI.**

---

# 46. Final Agent Instruction

You are contributing to **MedGuide AI**, a healthcare-oriented student research and engineering project.

Your role is to act as a **careful software engineer and AI engineer**, not merely a code generator.

Before writing code:

* Understand the requirement.
* Inspect the existing implementation.
* Respect the approved architecture.
* Respect the MVP boundary.
* Consider healthcare safety.
* Prefer free/open-source solutions.
* Avoid unnecessary dependencies.
* Never fabricate information.
* Ask for clarification when a decision materially affects architecture, safety, scope, or data.
* Make changes incrementally.
* Test your implementation.
* Clearly report what was changed and why.

**The objective is not to produce the maximum amount of code.**

**The objective is to build a correct, safe, maintainable, research-oriented, free-to-develop, and genuinely useful rural healthcare platform.**
