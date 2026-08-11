# MedGuide AI — Model Registry

**Project:** MedGuide AI
**Document:** Model Registry
**Version:** 1.0
**Status:** Initial Registry
**Purpose:** Centralized tracking of all AI/ML models and AI engines used or evaluated by MedGuide AI

---

# 1. Purpose

This document is the single source of truth for AI models and AI engines used in MedGuide AI.

It records:

* Candidate models
* Approved models
* Experimental models
* Rejected models
* Model versions
* Model providers
* Model licenses
* Supported languages
* Hardware requirements
* Intended task
* Evaluation status
* Evaluation results
* Deployment mode
* Related architecture decisions

No AI model should be considered part of the production system unless it appears here with:

```text
Status = APPROVED
```

---

# 2. Registry Status

The registry uses the following statuses:

| Status         | Meaning                                       |
| -------------- | --------------------------------------------- |
| `CANDIDATE`    | Identified but not yet evaluated              |
| `EXPERIMENTAL` | Currently being tested                        |
| `EVALUATED`    | Evaluation completed but decision pending     |
| `APPROVED`     | Approved for production use                   |
| `REJECTED`     | Evaluated and rejected                        |
| `DEPRECATED`   | Previously approved but no longer recommended |

---

# 3. Model Categories

MedGuide AI currently has these AI/ML categories:

```text
LLM
EMBEDDING
OCR
SPEECH_TO_TEXT
SYMPTOM_EXTRACTION
TRIAGE
TRANSLATION
RERANKER
```

Not every category must necessarily use a machine-learning model.

For example:

```text
TRIAGE → validated rule engine
```

may be preferable to an ML model for the initial MVP.

---

# 4. Registry Rules

1. Every production AI model must have an entry.
2. The exact model/version must be recorded.
3. License information must be verified.
4. Model capability claims must be verified.
5. Evaluation results must be recorded.
6. Experimental models must not silently enter production.
7. Model replacements require reevaluation.
8. Model updates require version tracking.
9. No model performance number may be fabricated.
10. No model should be selected solely because it is popular.
11. Free availability must be verified before relying on it.
12. Local deployment requirements must be tested rather than assumed.
13. Multilingual capability must be evaluated rather than assumed.
14. Healthcare suitability must be evaluated separately from general benchmark performance.

---

# 5. LLM Registry

## 5.1 Primary LLM

| Field              | Value                     |
| ------------------ | ------------------------- |
| Component          | LLM                       |
| Model              | TBD                       |
| Version            | TBD                       |
| Provider           | TBD                       |
| License            | TBD                       |
| Parameters         | TBD                       |
| Context Length     | TBD                       |
| Quantization       | TBD                       |
| Local Inference    | TBD                       |
| Cloud Inference    | TBD                       |
| Target Languages   | TBD                       |
| Medical Evaluation | TBD                       |
| RAG Evaluation     | TBD                       |
| Safety Evaluation  | TBD                       |
| Latency            | TBD                       |
| RAM/VRAM           | TBD                       |
| Cost               | Free/Open/Hosted — Verify |
| Status             | `CANDIDATE`               |
| ADR                | TBD                       |

**Important:** No model is approved at this stage.

---

# 6. LLM Candidate Table

| Candidate   | Version | License | Local | Multilingual | Resource Fit | Safety | RAG | Status      |
| ----------- | ------- | ------- | ----- | ------------ | ------------ | ------ | --- | ----------- |
| Candidate A | TBD     | TBD     | TBD   | TBD          | TBD          | TBD    | TBD | `CANDIDATE` |
| Candidate B | TBD     | TBD     | TBD   | TBD          | TBD          | TBD    | TBD | `CANDIDATE` |
| Candidate C | TBD     | TBD     | TBD   | TBD          | TBD          | TBD    | TBD | `CANDIDATE` |

Actual candidates must be added only after verification.

---

# 7. Embedding Model

## 7.1 Primary Embedding Model

| Field                | Value       |
| -------------------- | ----------- |
| Component            | Embedding   |
| Model                | TBD         |
| Version              | TBD         |
| Provider             | TBD         |
| License              | TBD         |
| Dimensions           | TBD         |
| Languages            | TBD         |
| Medical Retrieval    | TBD         |
| Recall@K             | TBD         |
| MRR                  | TBD         |
| nDCG                 | TBD         |
| Local Inference      | TBD         |
| Resource Requirement | TBD         |
| Status               | `CANDIDATE` |
| ADR                  | TBD         |

---

# 8. Embedding Candidate Table

| Candidate   | Languages | Dimensions | Retrieval Score | Resource | License | Status      |
| ----------- | --------- | ---------: | --------------: | -------- | ------- | ----------- |
| Candidate A | TBD       |        TBD |             TBD | TBD      | TBD     | `CANDIDATE` |
| Candidate B | TBD       |        TBD |             TBD | TBD      | TBD     | `CANDIDATE` |
| Candidate C | TBD       |        TBD |             TBD | TBD      | TBD     | `CANDIDATE` |

---

# 9. OCR Engine

## 9.1 Primary OCR

| Field               | Value              |
| ------------------- | ------------------ |
| Component           | OCR                |
| Engine              | TBD                |
| Version             | TBD                |
| License             | TBD                |
| Input               | Prescription Image |
| Languages           | TBD                |
| CER                 | TBD                |
| WER                 | TBD                |
| Medicine Extraction | TBD                |
| Dosage Extraction   | TBD                |
| Processing Time     | TBD                |
| Local Execution     | TBD                |
| Status              | `CANDIDATE`        |
| ADR                 | TBD                |

---

# 10. OCR Candidate Table

| Candidate   | Languages | CER | WER | Medicine Accuracy | Resource | License | Status      |
| ----------- | --------- | --: | --: | ----------------: | -------- | ------- | ----------- |
| Tesseract   | TBD       | TBD | TBD |               TBD | Low      | Verify  | `CANDIDATE` |
| PaddleOCR   | TBD       | TBD | TBD |               TBD | TBD      | Verify  | `CANDIDATE` |
| Candidate C | TBD       | TBD | TBD |               TBD | TBD      | TBD     | `CANDIDATE` |

The table must not contain guessed benchmark values.

---

# 11. Speech-to-Text

## 11.1 Primary STT

| Field           | Value          |
| --------------- | -------------- |
| Component       | Speech-to-Text |
| Model           | TBD            |
| Version         | TBD            |
| License         | TBD            |
| Languages       | TBD            |
| Code-Mixing     | TBD            |
| WER             | TBD            |
| CER             | TBD            |
| CPU Requirement | TBD            |
| GPU Requirement | TBD            |
| Offline         | TBD            |
| Latency         | TBD            |
| Status          | `CANDIDATE`    |
| ADR             | TBD            |

---

# 12. Speech Candidate Table

| Candidate                | Languages | WER | Code-Mixed | Local | Resource | License | Status      |
| ------------------------ | --------- | --: | ---------- | ----- | -------- | ------- | ----------- |
| Whisper-family Candidate | TBD       | TBD | TBD        | TBD   | TBD      | Verify  | `CANDIDATE` |
| Candidate B              | TBD       | TBD | TBD        | TBD   | TBD      | TBD     | `CANDIDATE` |
| Candidate C              | TBD       | TBD | TBD        | TBD   | TBD      | TBD     | `CANDIDATE` |

---

# 13. Symptom Extraction

The symptom extraction component may be implemented using one of:

```text
LLM structured extraction
Rules + NLP
NER/classification model
Hybrid approach
```

Current decision:

```text
TBD — Evaluation
```

Registry entry:

| Field             | Value              |
| ----------------- | ------------------ |
| Component         | Symptom Extraction |
| Method            | TBD                |
| Model             | TBD                |
| Structured Output | Required           |
| Multilingual      | TBD                |
| Accuracy          | TBD                |
| Safety            | TBD                |
| Status            | `CANDIDATE`        |

---

# 14. Triage Engine

## Current Baseline

The initial architecture uses:

> **Validated rule-based triage**

rather than an unconstrained ML model.

| Field           | Value          |
| --------------- | -------------- |
| Component       | Triage         |
| Method          | Rule-based     |
| Model           | None           |
| Rule Source     | TBD            |
| Rule Version    | TBD            |
| Clinical Review | Required       |
| Sensitivity     | TBD            |
| Specificity     | TBD            |
| Status          | `EXPERIMENTAL` |

The rules must be based on authoritative healthcare guidance and reviewed appropriately before being treated as production safety logic.

---

# 15. Translation

Translation is not automatically required as a separate model.

The project will evaluate:

```text
Option A:
Direct multilingual LLM

Option B:
Translation → AI → Translation

Option C:
Multilingual specialized pipeline
```

Registry:

| Field               | Value       |
| ------------------- | ----------- |
| Component           | Translation |
| Method              | TBD         |
| Model               | TBD         |
| Languages           | TBD         |
| Quality             | TBD         |
| Medical Terminology | TBD         |
| Status              | `CANDIDATE` |

---

# 16. Reranker

A reranker is **not required for the initial RAG implementation**.

Current status:

```text
NOT REQUIRED INITIALLY
```

It may be evaluated only if retrieval experiments show that:

```text
Embedding Retrieval
```

does not provide sufficient performance.

If introduced:

| Field      | Value                 |
| ---------- | --------------------- |
| Component  | Reranker              |
| Model      | TBD                   |
| Reason     | Retrieval improvement |
| Evaluation | TBD                   |
| Status     | `NOT SELECTED`        |

---

# 17. Vector Database

The vector database is not a model, but it must be tracked as part of the AI infrastructure.

Current baseline:

| Field      | Value                  |
| ---------- | ---------------------- |
| Component  | Vector Store           |
| Technology | PostgreSQL + pgvector  |
| Deployment | Backend infrastructure |
| Purpose    | RAG retrieval          |
| Status     | `BASELINE`             |

A separate vector database should only be introduced if justified by evaluation or scaling requirements.

---

# 18. AI Provider Registry

AI providers must also be tracked separately from models.

| Provider   | Service | Purpose      | Free Availability | Privacy | Status    |
| ---------- | ------- | ------------ | ----------------- | ------- | --------- |
| Provider A | LLM     | Experimental | Verify            | Verify  | Candidate |
| Provider B | Speech  | Experimental | Verify            | Verify  | Candidate |
| Provider C | OCR     | Experimental | Verify            | Verify  | Candidate |

Provider information must be verified before integration.

---

# 19. Model Versioning

Every approved model must have an exact version.

Do not record only:

```text
"Llama"
"Whisper"
"Embedding Model"
```

Instead record the exact model identifier/version.

This is necessary for reproducibility.

---

# 20. Model Configuration

Where relevant, also record:

```text
Temperature
Max Tokens
Context Length
Quantization
Top-K
Top-P
Embedding Dimensions
Retrieval K
Reranking K
Sampling Configuration
```

Not every field applies to every model.

---

# 21. RAG Configuration Registry

The RAG system itself must be versioned.

| Component         | Version        |
| ----------------- | -------------- |
| Knowledge Corpus  | TBD            |
| Chunking Strategy | TBD            |
| Chunk Size        | TBD            |
| Chunk Overlap     | TBD            |
| Embedding Model   | TBD            |
| Vector Store      | pgvector       |
| Retrieval Method  | TBD            |
| Top-K             | TBD            |
| Reranker          | None initially |
| Prompt Version    | TBD            |

---

# 22. Knowledge Base Version

The production RAG system must identify its knowledge-base version.

Example:

```text
KB-2026-001
```

A knowledge-base update must be traceable.

Conceptually:

```text
KB-2026-001
      ↓
New Sources
      ↓
Review
      ↓
KB-2026-002
```

---

# 23. Prompt Registry

Prompts should be versioned separately.

| Prompt             | Version | Purpose                    | Status       |
| ------------------ | ------- | -------------------------- | ------------ |
| Health Chat        | TBD     | General health interaction | Experimental |
| Symptom Extraction | TBD     | Structured extraction      | Experimental |
| Patient Summary    | TBD     | Healthcare-worker summary  | Experimental |
| RAG Answer         | TBD     | Grounded response          | Experimental |

Prompt changes should be recorded because they can change model behavior.

---

# 24. Model Evaluation Status

The project currently starts with:

```text
LLM              → CANDIDATE
Embedding        → CANDIDATE
OCR              → CANDIDATE
Speech           → CANDIDATE
Symptom Model    → CANDIDATE
Triage           → EXPERIMENTAL
Translation      → CANDIDATE
Reranker         → NOT REQUIRED INITIALLY
Vector Store     → BASELINE
```

This is intentional.

---

# 25. Approval Requirements

An AI component may move from:

```text
CANDIDATE
```

to:

```text
EVALUATED
```

only after documented testing.

It may move from:

```text
EVALUATED
```

to:

```text
APPROVED
```

only after:

* Technical evaluation
* Safety evaluation
* Resource evaluation
* License verification
* Privacy review
* Integration testing
* Documentation
* ADR approval

---

# 26. Rejection Criteria

A candidate must be rejected if it:

* Fails critical safety tests.
* Has incompatible licensing.
* Cannot meet required language needs.
* Cannot run within available resources where local deployment is required.
* Violates privacy requirements.
* Produces unacceptable error rates.
* Cannot be reliably integrated.
* Has undocumented/unverifiable provenance where provenance is required.

---

# 27. Model Replacement

When replacing an approved model:

```text
Current Model
      ↓
New Candidate
      ↓
Evaluation
      ↓
Comparison
      ↓
Approval
      ↓
ADR
      ↓
Registry Update
```

Never silently replace the model.

---

# 28. Deprecated Models

A deprecated model must remain in the registry.

Example:

| Model   | Previous Status | New Status | Reason              |
| ------- | --------------- | ---------- | ------------------- |
| Model X | APPROVED        | DEPRECATED | Replaced by Model Y |

This maintains research reproducibility.

---

# 29. Experimental Models

Experimental models may be used for:

* Benchmarking
* Prototyping
* Research
* Comparison

They must not be presented to users as production-approved healthcare AI.

---

# 30. Model Evaluation Results

Once experiments are completed, results must be recorded.

Example:

| Model   | Task | Metric   | Result | Dataset | Status     |
| ------- | ---- | -------- | -----: | ------- | ---------- |
| Model A | RAG  | Recall@5 |    TBD | RAG-v1  | Evaluating |
| Model B | RAG  | Recall@5 |    TBD | RAG-v1  | Evaluating |
| Model A | LLM  | Safety   |    TBD | LLM-v1  | Evaluating |

Never insert estimated values.

---

# 31. Model-to-Requirement Traceability

Every approved model must map to a project requirement.

Example:

```text
FR-06
 ↓
Conversational AI
 ↓
LLM
```

```text
FR-12
 ↓
Medical Knowledge Base
 ↓
Embedding + RAG
```

```text
FR-13 / FR-14
 ↓
Prescription Processing
 ↓
OCR
```

```text
FR-25
 ↓
Voice Interaction
 ↓
Speech-to-Text
```

---

# 32. Model-to-Use-Case Traceability

| Component          | Use Cases              |
| ------------------ | ---------------------- |
| LLM                | UC-P05, UC-P06, UC-P20 |
| RAG                | UC-P05, UC-P06         |
| OCR                | UC-P08, UC-P09         |
| Speech             | UC-P14                 |
| Medication AI      | UC-P10, UC-P11         |
| Healthcare Summary | UC-P20                 |
| Triage             | UC-P07                 |

Exact mapping must remain consistent with the approved Use Case document.

---

# 33. AI Model Security

Model files and API credentials must not be committed to Git.

Never commit:

```text
API keys
Access tokens
Cloud credentials
Private model credentials
Patient data
Private datasets
```

Use environment variables or secure secret management.

---

# 34. AI Model Files

Large model weights should generally not be committed directly into the source repository.

Recommended approach:

```text
Source Code
    +
Model Identifier
    +
Download/Setup Instructions
```

The exact approach depends on the selected model and license.

---

# 35. Reproducibility Requirements

Anyone reproducing the experiment should be able to determine:

```text
Which model?
Which version?
Which dataset?
Which prompt?
Which RAG configuration?
Which embedding?
Which parameters?
Which hardware?
Which software versions?
```

---

# 36. Model Registry Maintenance

Update this document whenever:

* A candidate is added.
* A model is evaluated.
* A model is approved.
* A model is rejected.
* A model is deprecated.
* A version changes.
* A major AI configuration changes.

---

# 37. Current Registry Decision

At the beginning of development:

> **No production AI model has been approved yet.**

This is the correct state.

The next phase is evaluation, not assumption.

---

# 38. Final Registry

The completed registry will eventually look like:

```text
LLM
 └── Approved Model + Version

Embedding
 └── Approved Model + Version

OCR
 └── Approved Engine + Version

Speech
 └── Approved Model + Version

Symptom Extraction
 └── Approved Method

Triage
 └── Validated Rule Set + Version

Translation
 └── Approved Method, if required

Reranker
 └── Not required / Approved if justified

Vector Store
 └── PostgreSQL + pgvector

RAG
 └── Approved Configuration + Knowledge Base Version
```

---

# 39. Golden Rule

> **If a model is not listed as APPROVED in this registry, it must not be treated as a production component of MedGuide AI.**
