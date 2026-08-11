# MedGuide AI — Requirements Traceability Matrix

**Project:** MedGuide AI
**Full Title:** MedGuide AI: An AI-Powered Rural Healthcare Intelligence and Digital Care Platform
**Version:** 1.0
**Status:** Baseline
**Related Documents:**

* `AGENTS.md`
* `docs/PROJECT_SPECIFICATION.md`
* `docs/requirements/SRS.md`
* `docs/requirements/USE_CASES.md`
* `docs/requirements/PRE_DEVELOPMENT_DECISIONS.md`

---

# 1. Purpose

This Requirements Traceability Matrix (RTM) establishes a connection between the requirements of MedGuide AI and their corresponding:

* Use cases
* System modules
* APIs
* Database entities
* Implementation components
* Test cases
* Evaluation metrics

The matrix ensures that every approved requirement is accounted for throughout the software development lifecycle.

---

# 2. Traceability Chain

Every significant requirement should eventually follow:

```text
Requirement
    ↓
Use Case
    ↓
System Module
    ↓
API / Interface
    ↓
Database Entity
    ↓
Implementation
    ↓
Test Case
    ↓
Evaluation
```

Some requirements may not require an API or database entity. Such cases should be explicitly marked as:

`N/A`

Architectural details that have not yet been designed should be marked:

`TBD — Architecture Phase`

---

# 3. Requirement Status

| Status         | Meaning                                                         |
| -------------- | --------------------------------------------------------------- |
| PLANNED        | Requirement approved but not implemented                        |
| IN DESIGN      | Architecture/design currently being defined                     |
| IN DEVELOPMENT | Implementation underway                                         |
| IMPLEMENTED    | Implementation completed                                        |
| TESTED         | Implementation tested successfully                              |
| VERIFIED       | Requirement demonstrated through appropriate testing/evaluation |
| DEFERRED       | Approved but moved to later phase                               |
| REJECTED       | Requirement explicitly removed                                  |

At the current stage, most requirements are:

**PLANNED**

---

# 4. Functional Requirements Traceability

| ID    | Requirement                     | Use Case               | Module                  | API | Database | Test | Evaluation                    | Priority    |
| ----- | ------------------------------- | ---------------------- | ----------------------- | --- | -------- | ---- | ----------------------------- | ----------- |
| FR-01 | User Registration               | UC-P01                 | Authentication          | TBD | TBD      | TBD  | N/A                           | Core MVP    |
| FR-02 | Authentication                  | UC-P02, UC-P17         | Authentication          | TBD | TBD      | TBD  | N/A                           | Core MVP    |
| FR-03 | Role-Based Access Control       | UC-P02, UC-P18, UC-P23 | Authorization           | TBD | TBD      | TBD  | Security testing              | Core MVP    |
| FR-04 | Consent Management              | UC-P03                 | Consent                 | TBD | TBD      | TBD  | Consent/security verification | Core MVP    |
| FR-05 | Patient Profile                 | UC-P04                 | Patient Management      | TBD | TBD      | TBD  | Functional testing            | Core MVP    |
| FR-06 | AI Health Companion             | UC-P05                 | AI Health Companion     | TBD | TBD      | TBD  | Response quality/safety       | Core MVP    |
| FR-07 | Symptom Input                   | UC-P06                 | Symptom Processing      | TBD | TBD      | TBD  | Precision/Recall/F1           | Core MVP    |
| FR-08 | Symptom Guidance                | UC-P06                 | Symptom/Triage          | TBD | TBD      | TBD  | Safety/quality evaluation     | Core MVP    |
| FR-09 | Red-Flag Detection              | UC-P07                 | Triage Engine           | TBD | TBD      | TBD  | Sensitivity/Specificity       | Core MVP    |
| FR-10 | Healthcare Escalation           | UC-P07                 | Escalation              | TBD | TBD      | TBD  | Safety evaluation             | Core MVP    |
| FR-11 | Retrieval-Augmented Generation  | UC-P05, UC-P25         | RAG                     | TBD | TBD      | TBD  | Recall@K/Groundedness         | Core MVP    |
| FR-12 | Medical Knowledge Management    | UC-P24                 | Knowledge Management    | TBD | TBD      | TBD  | Source/knowledge validation   | Core System |
| FR-13 | Prescription Upload             | UC-P08                 | Prescription            | TBD | TBD      | TBD  | Functional testing            | Core MVP    |
| FR-14 | Prescription OCR                | UC-P09                 | OCR                     | TBD | TBD      | TBD  | CER/WER                       | Core MVP    |
| FR-15 | Medicine Information Extraction | UC-P09                 | Prescription/NLP        | TBD | TBD      | TBD  | Precision/Recall              | Core MVP    |
| FR-16 | Medication Management           | UC-P10                 | Medication              | TBD | TBD      | TBD  | Functional testing            | Core MVP    |
| FR-17 | Medication Reminders            | UC-P11                 | Notification/Medication | TBD | TBD      | TBD  | Reminder reliability          | Core MVP    |
| FR-18 | Medication Adherence            | UC-P12                 | Medication              | TBD | TBD      | TBD  | Functional testing            | Core MVP    |
| FR-19 | Health Timeline                 | UC-P13                 | Health Timeline         | TBD | TBD      | TBD  | Functional testing            | Core MVP    |
| FR-20 | Healthcare Worker Dashboard     | UC-P18                 | Healthcare Worker       | TBD | TBD      | TBD  | Usability/functional testing  | Core MVP    |
| FR-21 | AI-Generated Patient Summary    | UC-P19                 | AI Summary              | TBD | TBD      | TBD  | Summary quality/safety        | Core MVP    |
| FR-22 | Follow-Up Management            | UC-P21                 | Follow-Up               | TBD | TBD      | TBD  | Functional testing            | Core MVP    |
| FR-23 | Alerts                          | UC-P20                 | Alert Management        | TBD | TBD      | TBD  | Alert reliability             | Core MVP    |
| FR-24 | Multilingual Interaction        | UC-P15                 | Language Processing     | TBD | TBD      | TBD  | Language-wise evaluation      | Core MVP    |
| FR-25 | Voice Interaction               | UC-P14                 | Speech Processing       | TBD | TBD      | TBD  | WER/language evaluation       | Core MVP    |
| FR-26 | Offline Functionality           | UC-P16                 | Offline Layer           | TBD | TBD      | TBD  | Offline task completion       | Core MVP    |
| FR-27 | Synchronization                 | UC-P26                 | Sync Engine             | TBD | TBD      | TBD  | Sync reliability              | Core MVP    |
| FR-28 | Healthcare Resource Discovery   | UC-P22                 | Resource Locator        | TBD | TBD      | TBD  | Location/resource accuracy    | Phase 2     |

---

# 5. Non-Functional Requirements Traceability

| ID     | Requirement     | Related Area                                  | Verification                     |
| ------ | --------------- | --------------------------------------------- | -------------------------------- |
| NFR-01 | Security        | Authentication, Authorization, APIs, Database | Security testing                 |
| NFR-02 | Privacy         | Data Management                               | Privacy review                   |
| NFR-03 | Reliability     | Backend, Database, Sync                       | Reliability testing              |
| NFR-04 | Usability       | Frontend/UI                                   | Usability evaluation             |
| NFR-05 | Accessibility   | Frontend/UI                                   | Accessibility testing            |
| NFR-06 | Performance     | Frontend, Backend, AI                         | Performance benchmarking         |
| NFR-07 | Scalability     | Architecture, Database                        | Architecture review/load testing |
| NFR-08 | Maintainability | Codebase/Architecture                         | Code review                      |
| NFR-09 | Portability     | Development/Deployment                        | Local deployment verification    |
| NFR-10 | Cost            | Infrastructure/AI                             | Resource audit                   |

---

# 6. Healthcare Safety Requirements Traceability

| ID     | Safety Requirement                                                | Related Use Case       | Implementation Area  | Verification               |
| ------ | ----------------------------------------------------------------- | ---------------------- | -------------------- | -------------------------- |
| SAF-01 | Do not present system as replacement for healthcare professionals | UC-P05, UC-P06         | AI Response Layer/UI | Safety review              |
| SAF-02 | No definitive diagnosis                                           | UC-P05, UC-P06         | AI/Symptom Layer     | Safety evaluation          |
| SAF-03 | No autonomous prescribing/modification                            | UC-P09, UC-P10         | Medication Layer     | Safety testing             |
| SAF-04 | Safety-critical triage uses documented logic                      | UC-P07                 | Triage Engine        | Clinical-rule verification |
| SAF-05 | Ground applicable medical responses in approved knowledge         | UC-P05, UC-P25         | RAG                  | Grounding evaluation       |
| SAF-06 | Communicate uncertainty                                           | UC-P05, UC-P06, UC-P09 | AI/OCR Layer         | Safety testing             |
| SAF-07 | Provide escalation when defined risk conditions occur             | UC-P07                 | Escalation Engine    | Sensitivity testing        |
| SAF-08 | No fabricated medical sources/recommendations                     | UC-P05, UC-P25         | RAG/LLM Layer        | Hallucination evaluation   |
| SAF-09 | Distinguish patient facts from AI interpretation                  | UC-P19                 | Summary Layer        | UI/data review             |
| SAF-10 | AI components require safety evaluation                           | All AI use cases       | AI Evaluation        | Safety evaluation          |

---

# 7. Security and Privacy Traceability

| Requirement Area             | Related Requirement | System Area            | Verification             |
| ---------------------------- | ------------------- | ---------------------- | ------------------------ |
| Authentication               | FR-02               | Authentication Service | Authentication tests     |
| Authorization                | FR-03               | RBAC                   | Access-control tests     |
| Consent                      | FR-04               | Consent Service        | Consent tests            |
| Data minimization            | NFR-02              | Database               | Privacy review           |
| Secret management            | NFR-01              | Configuration          | Security review          |
| Secure API access            | NFR-01              | Backend                | API security tests       |
| Sensitive logging protection | NFR-02              | Logging                | Log review               |
| Auditability                 | NFR-01              | Audit subsystem        | Audit verification       |
| File upload security         | FR-13               | Prescription Service   | Security testing         |
| AI prompt security           | SAF-08              | AI Gateway             | Prompt-injection testing |
| RAG security                 | SAF-08              | Knowledge/RAG          | RAG security testing     |

---

# 8. Data Traceability

| Data Category       | Source/Origin                  | Used By                   | Storage      | Evaluation            |
| ------------------- | ------------------------------ | ------------------------- | ------------ | --------------------- |
| Patient Profile     | Patient                        | Patient/Healthcare Worker | TBD          | Functional testing    |
| Consent             | Patient                        | Consent/RBAC              | TBD          | Security testing      |
| Symptoms            | Patient                        | Symptom/Triage            | TBD          | Extraction evaluation |
| Conversations       | Patient                        | AI/Timeline               | TBD          | Privacy/safety review |
| Medical Documents   | Approved sources               | RAG                       | TBD          | Source validation     |
| Knowledge Chunks    | Processed documents            | RAG                       | pgvector/TBD | Retrieval evaluation  |
| Prescription Images | Synthetic/public/approved data | OCR                       | TBD          | OCR evaluation        |
| OCR Text            | OCR pipeline                   | Prescription extraction   | TBD          | CER/WER               |
| Medication Records  | Verified input                 | Medication                | TBD          | Functional testing    |
| Adherence Records   | Patient                        | Medication/Timeline       | TBD          | Functional testing    |
| Voice Audio         | User                           | Speech Processing         | TBD          | WER                   |
| Transcripts         | Speech model                   | AI pipeline               | TBD          | Language evaluation   |
| Alerts              | System/Rules                   | Patient/Worker            | TBD          | Alert testing         |
| Follow-Ups          | Healthcare Worker              | Timeline                  | TBD          | Functional testing    |
| Audit Records       | System                         | Security                  | TBD          | Audit verification    |

---

# 9. AI/RAG Traceability

| AI Requirement          | Component                 | Input                 | Output                   | Evaluation               |
| ----------------------- | ------------------------- | --------------------- | ------------------------ | ------------------------ |
| Health Q&A              | LLM + RAG                 | User query            | Grounded response        | Safety/grounding         |
| Query understanding     | NLP/LLM                   | User query            | Structured intent        | Accuracy                 |
| Symptom extraction      | NLP                       | Text/voice transcript | Structured symptoms      | Precision/Recall/F1      |
| Red-flag detection      | Rules/triage engine       | Structured symptoms   | Risk category            | Sensitivity/Specificity  |
| Medical retrieval       | Embedding + pgvector      | Query                 | Relevant chunks          | Recall@K                 |
| Response generation     | LLM                       | Query + context       | Response                 | Groundedness/safety      |
| Patient summary         | LLM/structured summarizer | Patient records       | Summary                  | Quality/safety           |
| Speech-to-text          | Speech model              | Audio                 | Transcript               | WER                      |
| Prescription OCR        | OCR model                 | Image                 | Text                     | CER/WER                  |
| Medicine extraction     | NLP                       | OCR text              | Structured medicine data | Precision/Recall         |
| Multilingual processing | Language/LLM pipeline     | Local-language input  | Local-language response  | Language-wise evaluation |

---

# 10. Offline Traceability

| Offline Requirement       | Functionality                     | Local Component | Online Component    | Verification        |
| ------------------------- | --------------------------------- | --------------- | ------------------- | ------------------- |
| Cached profile            | View profile                      | Local storage   | Backend sync        | Offline test        |
| Health timeline           | View history                      | Local cache     | Backend             | Offline test        |
| Medication schedule       | View schedule                     | Local storage   | Backend             | Offline test        |
| Medication reminders      | Reminder                          | Local scheduler | Optional sync       | Reminder test       |
| Basic symptom rules       | Limited triage                    | Local rules     | Advanced processing | Offline safety test |
| Cached health information | Read previously available content | Local cache     | RAG backend         | Offline test        |
| Queued operations         | Store pending changes             | Sync queue      | Backend             | Sync test           |
| Synchronization           | Upload pending operations         | Sync manager    | API                 | Reliability test    |

---

# 11. Research Traceability

| Research Question                                           | Related System Component | Comparison/Baseline                   | Metric                           |
| ----------------------------------------------------------- | ------------------------ | ------------------------------------- | -------------------------------- |
| RQ1: Does RAG improve grounding?                            | RAG + LLM                | LLM without RAG                       | Grounding/factuality             |
| RQ2: How accurately are symptoms extracted?                 | Symptom NLP              | Baseline extraction approach          | Precision/Recall/F1              |
| RQ3: How accurately is prescription information extracted?  | OCR + NLP                | OCR baseline                          | CER/WER/Precision/Recall         |
| RQ4: How effective is offline functionality?                | Offline Layer            | Online-only workflow where applicable | Task completion/sync reliability |
| RQ5: Does multilingual/voice interaction improve usability? | Language + Speech        | Text-only interaction                 | Usability evaluation             |

Research questions remain subject to final research-design approval.

---

# 12. Module-Level Traceability

The system is divided into the following major modules:

| Module ID | Module                         | Primary Requirements |
| --------- | ------------------------------ | -------------------- |
| MOD-01    | Authentication & Authorization | FR-01, FR-02, FR-03  |
| MOD-02    | Consent Management             | FR-04                |
| MOD-03    | Patient Management             | FR-05                |
| MOD-04    | AI Health Companion            | FR-06                |
| MOD-05    | Symptom Processing             | FR-07, FR-08         |
| MOD-06    | Triage & Escalation            | FR-09, FR-10         |
| MOD-07    | Knowledge Management           | FR-12                |
| MOD-08    | RAG Engine                     | FR-11                |
| MOD-09    | Prescription Processing        | FR-13, FR-14, FR-15  |
| MOD-10    | Medication Management          | FR-16, FR-17, FR-18  |
| MOD-11    | Health Timeline                | FR-19                |
| MOD-12    | Healthcare Worker Dashboard    | FR-20                |
| MOD-13    | AI Patient Summary             | FR-21                |
| MOD-14    | Follow-Up Management           | FR-22                |
| MOD-15    | Alerts                         | FR-23                |
| MOD-16    | Multilingual Processing        | FR-24                |
| MOD-17    | Speech Processing              | FR-25                |
| MOD-18    | Offline Layer                  | FR-26                |
| MOD-19    | Synchronization                | FR-27                |
| MOD-20    | Healthcare Resource Locator    | FR-28                |

---

# 13. Requirement-to-Use-Case Mapping

| Requirement | Primary Use Case | Secondary Use Case |
| ----------- | ---------------- | ------------------ |
| FR-01       | UC-P01           | —                  |
| FR-02       | UC-P02           | UC-P17             |
| FR-03       | UC-P02           | UC-P18, UC-P23     |
| FR-04       | UC-P03           | —                  |
| FR-05       | UC-P04           | UC-P18             |
| FR-06       | UC-P05           | UC-P14, UC-P15     |
| FR-07       | UC-P06           | UC-P14             |
| FR-08       | UC-P06           | UC-P07             |
| FR-09       | UC-P07           | —                  |
| FR-10       | UC-P07           | UC-P20             |
| FR-11       | UC-P25           | UC-P05             |
| FR-12       | UC-P24           | UC-P25             |
| FR-13       | UC-P08           | —                  |
| FR-14       | UC-P09           | —                  |
| FR-15       | UC-P09           | UC-P10             |
| FR-16       | UC-P10           | UC-P11             |
| FR-17       | UC-P11           | UC-P16             |
| FR-18       | UC-P12           | UC-P13             |
| FR-19       | UC-P13           | UC-P18             |
| FR-20       | UC-P18           | —                  |
| FR-21       | UC-P19           | UC-P18             |
| FR-22       | UC-P21           | UC-P13             |
| FR-23       | UC-P20           | UC-P07             |
| FR-24       | UC-P15           | UC-P05, UC-P06     |
| FR-25       | UC-P14           | UC-P06             |
| FR-26       | UC-P16           | UC-P11, UC-P13     |
| FR-27       | UC-P26           | UC-P16             |
| FR-28       | UC-P22           | —                  |

---

# 14. Requirements Without Direct API

Not every requirement needs an external or REST API.

Examples:

| Requirement             | Reason                       |
| ----------------------- | ---------------------------- |
| Accessibility           | UI/system property           |
| Security                | Cross-cutting property       |
| Medical source metadata | Knowledge-management process |
| Model evaluation        | Research process             |
| Code maintainability    | Engineering property         |
| Documentation           | Development process          |

These should still be verified even though they are not represented as conventional API endpoints.

---

# 15. Requirements Without Direct Database Entities

Some requirements may be implemented through existing entities or application logic.

For example:

* Accessibility
* Performance
* Authentication logic
* RAG retrieval logic
* Speech processing
* OCR processing

The final database mapping will be determined during database architecture.

---

# 16. API Traceability Policy

The final API endpoint names must **not be assumed at this stage**.

API mappings should be completed during:

**Architecture → API Design**

Until then, use:

`TBD — API Design`

Do not invent endpoint names merely to populate this document.

---

# 17. Database Traceability Policy

The final database tables and relationships must be determined during the database-design phase.

Until then, use:

`TBD — Database Design`

The traceability matrix must not force premature schema decisions.

---

# 18. Test Traceability Policy

Test IDs will be assigned during the testing-design phase.

Until then, use:

`TBD — Testing Phase`

Every Core MVP requirement must eventually have at least one corresponding test.

Safety-critical requirements should have dedicated safety tests.

---

# 19. Evaluation Traceability Policy

Not every software requirement requires a research metric.

The following generally require measurable evaluation:

* AI response quality
* RAG retrieval
* Symptom extraction
* Triage
* OCR
* Medicine extraction
* Speech recognition
* Multilingual processing
* Offline synchronization
* Performance
* Usability

Purely structural requirements may be verified through functional/security testing.

---

# 20. Coverage Requirements

Before declaring the MVP complete:

### Requirement Coverage

Every Core MVP functional requirement must have:

```text
Requirement
    ↓
Use Case
    ↓
Module
    ↓
Implementation
    ↓
Test
```

### Safety Coverage

Every safety requirement must have:

```text
Safety Requirement
    ↓
Implementation
    ↓
Safety Test
    ↓
Verification
```

### Research Coverage

Every approved research question must have:

```text
Research Question
    ↓
Experiment
    ↓
Dataset
    ↓
Metric
    ↓
Result
```

---

# 21. Traceability Status Rules

A requirement should not be marked `VERIFIED` simply because its code exists.

Verification requires evidence such as:

* Test result
* Evaluation result
* Security review
* Usability study
* Benchmark
* Documented inspection

---

# 22. Change Control

When a requirement changes:

1. Update the SRS.
2. Update the relevant use case.
3. Update this traceability matrix.
4. Review affected modules.
5. Review API impact.
6. Review database impact.
7. Review testing impact.
8. Review research/evaluation impact.
9. Update implementation only after the impact is understood.

---

# 23. Current Project Status

At the requirements-design stage:

| Area                      | Status      |
| ------------------------- | ----------- |
| Problem Definition        | COMPLETE    |
| Project Objectives        | COMPLETE    |
| Project Scope             | COMPLETE    |
| Target Users              | COMPLETE    |
| MVP Definition            | COMPLETE    |
| SRS                       | COMPLETE    |
| Use Cases                 | COMPLETE    |
| Pre-Development Decisions | COMPLETE    |
| Requirements Traceability | COMPLETE    |
| System Architecture       | IN DESIGN   |
| Database Design           | IN DESIGN   |
| API Design                | PENDING     |
| AI/RAG Architecture       | PENDING     |
| Security Architecture     | PENDING     |
| UI/UX Architecture        | PENDING     |
| Model Selection           | PENDING     |
| Dataset Finalization      | PENDING     |
| Testing Design            | PENDING     |
| Implementation            | NOT STARTED |

---

# 24. Traceability Completion Criterion

The requirements phase is considered complete when:

* Every Core MVP requirement is mapped to a use case.
* Every requirement is assigned to a system module.
* Safety requirements are explicitly traceable.
* Data requirements are traceable.
* AI requirements are traceable.
* Research questions are traceable.
* Unfinalized architecture details are marked `TBD`.
* No requirement exists without an owner/module.
* No implementation feature exists without a requirement or approved design decision.

---

# 25. Final Traceability Principle

The project must maintain the following relationship throughout development:

```text
WHY?
Problem / Objective
      ↓
WHAT?
Requirement
      ↓
WHO?
Use Case / Actor
      ↓
WHERE?
System Module
      ↓
HOW?
Architecture / API / Database
      ↓
BUILD
Implementation
      ↓
PROVE
Testing / Evaluation
```

No major feature should bypass this chain.

---

# 26. Final Rule

**If a feature cannot be traced back to an approved requirement, it should not be part of the MVP.**

**If a requirement cannot be traced forward to implementation and verification, the requirement is not yet complete.**

This matrix is a living engineering document and must be updated whenever approved requirements, architecture, implementation, testing, or evaluation decisions change.
