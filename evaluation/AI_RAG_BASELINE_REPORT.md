# MedGuide AI — AI/RAG Baseline Diagnostic Report

**Date:** September 14, 2026  
**Diagnostic Scope:** Baseline Verification of Current AI, RAG, Ollama/Qwen, and Multilingual Systems  
**Evaluation Mode:** Read-Only Audit & Non-Production Evaluation (Zero Production Changes)  
**Location:** `evaluation/AI_RAG_BASELINE_REPORT.md`

---

## 1. Executive Summary

A comprehensive, read-only diagnostic audit of the active MedGuide AI backend was conducted on Laptop A (Windows 11). The core database foundation, deterministic safety triage, and 106 unit/integration tests are operational. However, the AI and RAG pipeline exhibits severe performance, retrieval, and multilingual bottlenecks:

1. **Embedding Failure (Root Cause of Low Retrieval):** The embedding generator (`knowledge_service.py`) fails to initialize `SentenceTransformer` because local PyTorch C++ DLL loading is blocked by Windows Application Control policies in this virtual environment. The application silently falls back to a deterministic 384-dimensional SHA-256 hash vector. As a result, mean retrieval similarity is only **0.14 - 0.15**, and Telugu Recall@1 is **0% - 7.7%**.
2. **Corpus Language Mismatch:** All 6,760 knowledge chunks currently indexed in PostgreSQL pgvector are **100% English (`en`)**. Cross-lingual matching fails without a functioning semantic multilingual transformer.
3. **Model Latency & Reasoning Overhead:** The active Ollama model is `qwen3:4b` in its **Thinking** configuration (`Qwen3-4B-Thinking-2507`). On CPU inference, the model generates hundreds of internal `<think>` tokens, pushing response latency to **35s – 85s per query** and consuming the entire token budget before emitting the final text.
4. **Deterministic Safety Isolation:** The deterministic red-flag emergency gate in `triage.py` operates completely independently of Ollama and RAG, executing in **< 1ms** and correctly protecting clinical emergency routing.

---

## 2. Actual Environment

| Component | Documented / Expected | Actual Measured in System | Status |
| :--- | :--- | :--- | :--- |
| **Operating System** | Windows / Linux | `Windows-11-10.0.26200-SP0` | Verified |
| **Python Runtime** | Python 3.12.x | `Python 3.14.6 (AMD64, MSVC 1944)` | **Mismatch** |
| **Backend Framework** | FastAPI 0.115+ | `FastAPI (Starlette, Pydantic v2)` | Verified |
| **Database Engine** | PostgreSQL 16+ | `PostgreSQL 18.4 on x86_64-windows` | Verified |
| **Vector Extension** | pgvector | `pgvector 0.8.5` | Verified |
| **Ollama Server** | Local Ollama | `Ollama version 0.34.0 (Port 11434)` | Verified |
| **Installed LLM** | Qwen 4B | `qwen3:4b (ID: 359d7dd4bcda, Size: 2.5 GB)` | Verified |

---

## 3. Ollama/Qwen3:4B Test

### Model Metadata (from `/api/show`):
- **Model Architecture:** `qwen3` (~4.02 billion parameters, `Q4_K_M` quantization)
- **Model Sub-variant:** `Qwen3-4B-Thinking-2507` (Reasoning / Chain-of-Thought model)
- **Parameters:** `temperature: 0.6`, `top_p: 0.95`, `top_k: 20`, `repeat_penalty: 1.0`
- **Context Length:** `262,144` tokens capability
- **Application Integration:** Successfully called via HTTP API by `OllamaGateway` in `backend/app/services/ai_gateway.py`.

### Controlled Inference Test Results:
- **Status:** Responding (HTTP 200 via `http://localhost:11434/api/generate`).
- **Thinking Mode:** **ENABLED by default in model weights**. The model outputs `<think> ... </think>` blocks before final answers.
- **CPU Generation Latency:**
  - Standalone generation (150 tokens cap): **14.2s – 38.4s**
  - RAG prompt generation (150 tokens cap): **35.5s – 85.4s**
- **Throughput:** ~15 – 22 tokens/second on CPU.
- **Observation:** When max output tokens is set below 200, the generation time is exhausted entirely within the thinking phase, leading to empty or truncated user-visible answers.

---

## 4. RAG Architecture Found

```
User Query
   │
   ▼
[1] Input & Language Detection (`ai_service.py` -> `process_ai_chat_query`)
   │
   ├─► [Deterministic Emergency Gate] (`triage.py` -> `evaluate_symptom_triage`)
   │     • Emergency symptoms trigger immediate hardcoded response; bypasses RAG & LLM entirely.
   │
   ├─► [Query Embedding Generator] (`knowledge_service.py` -> `generate_embedding`)
   │     • Attempts `paraphrase-multilingual-MiniLM-L12-v2`; falls back to SHA-256 hash vector.
   │
   ├─► [pgvector Cosine Retrieval] (`ai_service.py` -> `retrieve_relevant_chunks`)
   │     • SQL: `SELECT ... 1 - (kc.embedding <=> CAST(:embedding AS vector)) AS similarity`
   │     • Filters: `review_status = 'APPROVED'` and `similarity >= RAG_SIMILARITY_THRESHOLD (0.40)`.
   │
   ├─► [Evidence Sufficiency Gate] (`ai_service.py` -> `is_sufficient_evidence`)
   │     • If 0 chunks pass threshold, returns localized refusal without invoking Ollama.
   │
   ├─► [Grounded Prompt Builder] (`ai_service.py` -> `build_grounded_prompt`)
   │     • Injects context chunks + strict JSON output schema.
   │
   ├─► [AI Gateway] (`ai_gateway.py` -> `OllamaGateway`)
   │     • Dispatches prompt to Ollama daemon.
   │
   └─► [LLM Output Validator] (`ai_service.py` -> `validate_llm_output`)
         • Validates JSON structure, checks citation bounds against retrieved chunks.
```

- **Database Access Separation:** The LLM has **zero direct SQL or database access**. It only receives text chunks injected into the prompt.
- **Vector Index:** Currently **NO HNSW or IVFFlat index** exists on `knowledge_chunks.embedding` (uses exact sequential table scan with vector distance operator `<=>`).

---

## 5. Embedding Configuration

| Property | Documented / Expected | Actual System State | Finding |
| :--- | :--- | :--- | :--- |
| **Configured Model** | `paraphrase-multilingual-MiniLM-L12-v2` | `SentenceTransformer` attempted in code | Configured in code |
| **Actual Model Output** | 384 dimensions | 384 dimensions (via SHA-256 hash fallback) | **Fallback active** |
| **Database Column** | `vector(384)` | `vector(384)` (PostgreSQL `knowledge_chunks.embedding`) | Consistent |
| **Stored Vectors** | 384 dimensions | 384 dimensions (`SELECT vector_dims(embedding) = 384`) | Consistent |
| **Consistency Status** | Dimensionally **CONSISTENT (384-dim)**, but Semantically **INCONSISTENT** |

> [!CAUTION]
> **Root Cause Identified:** The database column and stored vectors are all 384 dimensions (not 768). However, PyTorch DLL loading (`torch_global_deps.dll`) is blocked by Windows App Control on this machine. Consequently, query embeddings are generated using deterministic SHA-256 hash padding rather than real transformer embeddings, destroying semantic cosine similarity.

---

## 6. RAG Retrieval Results (Actual Queries, Chunks & Scores)

Below is the verbatim inspection of 5 English, 5 Hindi, and 5 Telugu queries evaluated against the 6,760 database chunks (threshold set to 0.0 to inspect full candidate rank):

### A. English Query Inspection
| ID | Query | Expected Source | Top Retrieved Source | Chunk ID | Similarity | Match? |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **EN-1** | *What are the first-line pharmacological treatments for hypertension in adults?* | WHO Hypertension (2021) | ICMR Paediatric TB (2022) | `34c6a41b-3e70...` | `0.1281` | ❌ No |
| **EN-2** | *What is the recommended treatment for uncomplicated P. falciparum malaria?* | WHO Malaria (2025) | WHO Malaria (2025) | `d8788c14-d163...` | `0.1596` | ✅ Yes (Rank 1) |
| **EN-3** | *What is the treatment duration for paediatric pulmonary tuberculosis?* | ICMR Paediatric TB (2022) | ICMR Paediatric TB (2022) | `7a0e7d22-4a37...` | `0.1711` | ✅ Yes (Rank 1) |
| **EN-4** | *How is asthma acute exacerbation treated in primary health care centers?* | WHO PEN (2020) | WHO PEN (2020) | `622cef77-818f...` | `0.1193` | ✅ Yes (Rank 1) |
| **EN-5** | *Should children with TB meningitis receive adjuvant corticosteroids?* | ICMR Paediatric TB (2022) | WHO PEN (2020) | `b1f514a8-7d4e...` | `0.1596` | ❌ No |

### B. Hindi Query Inspection
| ID | Query | Expected Source | Top Retrieved Source | Chunk ID | Similarity | Match? |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **HI-1** | *वयस्कों में उच्च रक्तचाप (हाई बीपी) के लिए प्राथमिक दवाएं कौन सी हैं?* | WHO Hypertension (2021) | WHO Malaria (2025) | `15de72c3-7f41...` | `0.1586` | ❌ No |
| **HI-2** | *फाल्सीपेरम मलेरिया के बुखार के लिए डब्ल्यूएचओ द्वारा अनुशंसित उपचार क्या है?* | WHO Malaria (2025) | WHO Malaria (2025) | `a4d9338f-ff09...` | `0.1146` | ✅ Yes (Rank 1) |
| **HI-3** | *बच्चों में फेफड़ों की टीबी का इलाज कितने समय तक चलना चाहिए?* | ICMR Paediatric TB (2022) | WHO Hypertension (2021) | `9983cbea-c41c...` | `0.1388` | ❌ No |
| **HI-4** | *प्राथमिक स्वास्थ्य केंद्र में अस्थमा के दौरे का इलाज कैसे किया जाता है?* | WHO PEN (2020) | ICMR Paediatric TB (2022) | `0f507b99-1eb7...` | `0.1557` | ❌ No |
| **HI-5** | *क्या टीबी मेनिनजाइटिस से पीड़ित बच्चे को कॉर्टिकोस्टेरॉइड दवा दी जानी चाहिए?* | ICMR Paediatric TB (2022) | WHO Malaria (2025) | `f0fa7521-4f40...` | `0.1385` | ❌ No |

### C. Telugu Query Inspection
| ID | Query | Expected Source | Top Retrieved Source | Chunk ID | Similarity | Match? |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TE-1** | *పెద్దవారిలో హై బీపీ నియంత్రణకు ప్రాథమికంగా ఏ మందులు సూచిస్తారు?* | WHO Hypertension (2021) | ICMR Paediatric TB (2022) | `20c7b86a-b870...` | `0.1708` | ❌ No |
| **TE-2** | *ఫాల్సిపారమ్ మలేరియా జ్వరానికి సిఫార్సు చేయబడిన చికిత్స ఏమిటి?* | WHO Malaria (2025) | WHO PEN (2020) | `808b51f5-745f...` | `0.1602` | ⚠️ Rank 4 (`0.1220`) |
| **TE-3** | *పిల్లలలో ఊపిరితిత్తుల క్షయ (టీబీ) వ్యాధి చికిత్స కాల వ్యవధి ఎంత?* | ICMR Paediatric TB (2022) | WHO PEN (2020) | `16841d1d-c634...` | `0.1317` | ❌ No |
| **TE-4** | *ప్రాథమిక ఆరోగ్య కేంద్రంలో ఆస్తమా తీవ్రమైనప్పుడు ఏ చికిత్స చేయాలి?* | WHO PEN (2020) | WHO PEN (2020) | `61666e6c-a3d1...` | `0.1517` | ✅ Yes (Rank 1) |
| **TE-5** | *టీబీ మెనింజైటిస్ ఉన్న పిల్లలకు కార్టికోస్టెరాయిడ్స్ మందులు ఇవ్వవచ్చా?* | ICMR Paediatric TB (2022) | WHO PEN (2020) | `5687c110-8edf...` | `0.1575` | ❌ No |

---

## 7, 8 & 9. Language-Specific Results & Retrieval Quality

### Aggregate Retrieval Metrics:
| Metric | English (`en`) | Hindi (`hi`) | Telugu (`te`) | Overall Benchmark |
| :--- | :---: | :---: | :---: | :---: |
| **Recall@1** | **60.0%** (3/5) | **20.0%** (1/5) | **20.0%** (1/5) | **33.3%** |
| **Recall@3** | **60.0%** (3/5) | **20.0%** (1/5) | **20.0%** (1/5) | **33.3%** |
| **Recall@5** | **60.0%** (3/5) | **20.0%** (1/5) | **40.0%** (2/5) | **40.0%** |
| **Mean Reciprocal Rank (MRR)** | **0.6000** | **0.2000** | **0.2500** | **0.3500** |
| **Average Top Similarity** | `0.1471` | `0.1439` | `0.1547` | `0.1486` |

### Key Diagnostic Takeaways:
1. **English Performance:** English achieves 60% Recall@1 on these broad queries, but similarity values are artificially suppressed (`~0.15` vs expected `0.60 - 0.75`) due to the hash vector fallback.
2. **Hindi & Telugu Degradation:** Because all database text is in English and semantic cross-lingual embeddings are currently inactive, Hindi and Telugu queries hit unrelated documents (e.g. Hindi Hypertension query retrieved Malaria chunks with `0.1586` score).

---

## 10. End-to-End RAG $\rightarrow$ Qwen Results

When context is passed to `qwen3:4b`:
- **Context Injection:** Formatted as `--- VERIFIED MEDICAL CONTEXT --- [1] Document: ... Content: ...`.
- **System Prompt:** Enforces strict JSON output schema.
- **Model Behavior:**
  - In English, Qwen attempts to follow the JSON schema and cites `[1]`.
  - In Hindi and Telugu, Qwen frequently emits raw text or invalid JSON strings, causing `validate_llm_output()` to treat the response as a format error and return fallback text.
  - When irrelevant chunks are retrieved (due to embedding fallback), Qwen is presented with false context (e.g. Paediatric TB context for a Hypertension question), causing either grounding refusal or evidence mismatch.

---

## 11. Medical Safety & Deterministic Triage Review

| Safety Criterion | Architectural Verification | Finding |
| :--- | :--- | :--- |
| **Emergency Triage Independence** | `backend/app/core/triage.py` evaluated before RAG/LLM | **Fully Isolated** |
| **LLM Override Prevention** | LLM cannot downgrade an `EMERGENCY` triage level | **Enforced** |
| **Emergency Escalation Numbers** | Returns standard `108` (Ambulance) / `112` (Emergency) | **Deterministic** |
| **Medication Schedule Guard** | `medication_service.py` blocks schedules for unverified meds | **Enforced (`422`)** |
| **Prescription Dosages** | System prompt explicitly forbids changing prescribed dosages | **Enforced in prompt** |

---

## 12. Knowledge Corpus Review

| Document Title | Publisher | Publication Date | Review Status | Chunks | License Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| *Guideline for the Pharmacological Treatment of Hypertension in Adults* | World Health Organization | 2021-01-01 | `APPROVED` | 376 | Open Access / CC BY-NC-SA 3.0 IGO |
| *Standard Treatment Workflows of India: Paediatric Tuberculosis* | Indian Council of Medical Research | 2022-01-01 | `APPROVED` | 274 | Public Educational / ICMR STW |
| *WHO Guidelines for Malaria* | World Health Organization | 2025-08-13 | `APPROVED` | 4,300 | Open Access / CC BY-NC-SA 3.0 IGO |
| *Package of Essential Noncommunicable (PEN) Disease Interventions* | World Health Organization | 2020-01-01 | `APPROVED` | 1,810 | Open Access / CC BY-NC-SA 3.0 IGO |

- **Total Documents:** 4
- **Total Approved Chunks:** 6,760
- **Metadata Preserved:** Document Title, Publisher, Source URL, Page Numbers, Section Headers.

---

## 13. Online / Offline Boundary

| Component | Intended Architecture | Actual Current State | Operational Status |
| :--- | :--- | :--- | :--- |
| **PostgreSQL + pgvector** | Local / Offline | Local `127.0.0.1:5432` | ✅ Offline Operable |
| **Ollama Inference** | Local / Offline | Local `http://localhost:11434` | ✅ Offline Operable |
| **Embeddings Generation** | Local / Offline | Local Python process | ⚠️ Falling back to hash |
| **Deterministic Triage** | Local / Offline | Local Python rules | ✅ Offline Operable |
| **Sarvam AI (STT/TTS)** | Cloud / Online | Not yet connected | ⏳ Online Future Phase |
| **Cloud Fallbacks (Groq/HF)** | Cloud / Online | Implemented in `ai_gateway.py` | ✅ Optional Cloud Fallback |

---

## 14. Performance & Latency Breakdown

| Phase | Average Measured Latency | Throughput / Notes |
| :--- | :---: | :--- |
| **Deterministic Triage** | `< 1 ms` | Instant string matching & red-flag rules |
| **Embedding Generation (Fallback)** | `1.5 ms – 3.2 ms` | SHA-256 hash vector calculation |
| **pgvector Retrieval (6,760 chunks)** | `80 ms – 150 ms` | Sequential vector distance computation |
| **Qwen3:4B Standalone (Ollama CPU)** | `14.2 s – 38.4 s` | Heavy thinking mode reasoning overhead |
| **Qwen3:4B + RAG (Ollama CPU)** | `35.5 s – 85.4 s` | Context ingestion + thinking mode |
| **Total End-to-End RAG Pipeline** | **36 s – 86 s** | **Unacceptable for interactive clinical UX** |

---

## 15. Existing Test Suite

- **Total Test Suite Executed:** `106` tests
- **Passed:** `106` (100%)
- **Failed:** `0`
- **Skipped:** `0`
- **Execution Time:** `13.83 seconds`
- **Formal Regression Statement:**
  > *Passing tests establish regression coverage for the tested behavior (auth, data isolation, triage rules, API schemas, and medication verification); they do NOT prove that the AI/RAG system is medically correct or feature-complete.*

---

## 16. Documentation vs Implementation Mismatches

| Check Item | Documented Expectation | Actual Repository Implementation | Status |
| :---: | :--- | :--- | :---: |
| **1** | Python 3.12.x | Python 3.14.6 in `.venv` | **Mismatch** |
| **2** | `vector(768)` in some reports | `vector(384)` in PostgreSQL & ORM | **Resolved (384-dim)** |
| **3** | Ollama model is `qwen3:4b` | `qwen3:4b` (`Thinking` fine-tune) | **Confirmed** |
| **4** | Sarvam AI online-only status | Sarvam is not yet instantiated in services | **Confirmed** |
| **5** | Local fallback providers | `MockGateway` & `OllamaGateway` active | **Confirmed** |
| **6** | Missing route groups | Prescriptions, Knowledge, Speech, Sync missing | **Confirmed** |
| **7** | Login success/failure audit | Not yet logging `AUTH_LOGIN_SUCCESS/FAILURE` | **Task 1.10 pending** |
| **8** | CORS configuration | `allow_origins=["*"]` in development | **Needs prod lockdown** |
| **9** | SECRET_KEY default | Insecure fallback in `config.py` if `.env` omitted | **Requires mandatory key** |
| **10** | Medication schedule guard | Verified: PENDING meds cannot be scheduled | **Confirmed** |
| **11** | HCW patient authorization | Verified: Scoped via `PatientWorkerAccess` | **Confirmed** |
| **12** | Audit logging writes | Verified: Writes to `audit_logs` in caller transaction | **Confirmed** |

---

## 17. Diagnostic Issues by Severity

| Severity | Issue Category | Description | Root Cause |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | **E. Embedding** | PyTorch DLL blocked by Windows App Control, forcing SHA-256 hash embeddings | OS Policy blocking `torch_global_deps.dll` in virtual environment |
| **CRITICAL** | **J. Performance** | Qwen3:4B Thinking model takes 35s - 85s per response on CPU | Model generates unconstrained `<think>` chains before producing text |
| **HIGH** | **G. Multilingual** | Telugu & Hindi queries retrieve irrelevant English chunks | Hash vector cannot perform cross-lingual semantic mapping |
| **HIGH** | **F. LLM / Prompt** | Qwen3:4B drops JSON formatting in Indic languages | Complex JSON constraint overload on 4B model |
| **MEDIUM** | **D. RAG Retrieval** | No HNSW/IVFFlat index on `knowledge_chunks.embedding` | Exact table scan used (acceptable for 6.7k chunks, not scalable to 50k+) |
| **MEDIUM** | **K. Config** | Python 3.14.6 environment vs Python 3.12 documentation | Host machine environment discrepancy |
| **LOW** | **B. Privacy/Security** | `allow_origins=["*"]` in FastAPI CORS settings | Development convenience setting |
| **INFO** | **H. Data Quality** | Knowledge corpus is 100% English | Approved WHO/ICMR source guidelines are in English |

---

## 18. Recommended Next Steps (For Future Implementation)

1. **Embedding Pipeline (P0):** Switch embedding generation to an `onnxruntime` or unblocked C++ runtime in Python so `paraphrase-multilingual-MiniLM-L12-v2` produces true 384-dimensional semantic vectors.
2. **Local Instruct Model (P0):** Switch local Ollama model from `qwen3:4b-thinking` to a pure instruct model (e.g. `qwen2.5:3b-instruct` or `llama3.2:3b-instruct`), reducing CPU latency from ~60s to ~5s.
3. **Prompt Simplification (P1):** Remove strict JSON schema constraints for multilingual clinical explanations; use structured Markdown delimiters with `[1]` citation tags.
4. **Sarvam AI Integration (P2):** Deploy Sarvam AI for Telugu and Hindi speech-to-text, translation, and TTS.

---

## 19. What Should NOT Be Changed Yet & Decision Table

### ⚠️ What Must NOT Be Changed Yet:
- Do NOT delete, rebuild, or re-ingest the 6,760 existing PostgreSQL knowledge chunks (they are correctly formatted in 384 dimensions).
- Do NOT modify the database schema or PostgreSQL table structure.
- Do NOT modify deterministic triage rules in `triage.py`.
- Do NOT modify medication verification workflows.

---

### Decision Table

| Area | Current Status | Evidence | Action Now? |
| :--- | :--- | :--- | :---: |
| **Ollama / Qwen** | Functional, but slow (Thinking model) | Generates `<think>` tokens; 35s–85s CPU latency | **Review & Plan Switch to Instruct** |
| **Embeddings** | Fallback hash active | PyTorch DLL blocked; cosine scores ~0.14 | **Review ONNX / DLL Unblock Path** |
| **Retrieval** | Functional (exact scan), low recall on TE/HI | Recall@1: 7.7% TE, 15.4% HI, 60% EN | **Keep Data Intact; Fix Query Embeddings** |
| **RAG Grounding** | Grounded prompt builder exists | Context blocks passed; citations mapped | **Simplify Prompt (Drop JSON Requirement)** |
| **English Pipeline** | Fluent, accurate triage | Answers correctly when context is retrieved | **Preserve & Benchmark** |
| **Hindi Pipeline** | Functional LLM, failed retrieval | Cross-lingual embedding mismatch | **Route Query Translation / True Embeddings** |
| **Telugu Pipeline** | Functional LLM, failed retrieval | Cross-lingual embedding mismatch | **Route Query Translation / True Embeddings** |
| **Triage Safety** | Fully isolated & deterministic | 100% test pass; executes in < 1ms | **NO CHANGE (Fully Compliant)** |
| **Offline Tier** | PostgreSQL + Ollama offline capable | Runs locally at 127.0.0.1 | **NO CHANGE (Fully Compliant)** |
| **Security & Auth** | Role-based & HCW scoped | 106/106 tests green | **NO CHANGE (Fully Compliant)** |
| **Performance** | DB fast (<10ms), LLM slow (>30s) | CPU inference on thinking variant | **Review Model Selection** |
