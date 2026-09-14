# MedGuide AI — AI & RAG Pipeline Specification

**Project:** MedGuide AI
**Document:** AI & RAG Pipeline Specification
**Version:** 2.0
**Status:** Approved & Implemented (Option C: Dual Retrieval with Fallback / Rerank)
**Related Documents:**
* `AGENTS.md`
* `docs/PROJECT_SPECIFICATION.md`
* `docs/requirements/SRS.md`
* `docs/architecture/SYSTEM_ARCHITECTURE.md`
* `docs/database/DATABASE_DESIGN.md`
* `evaluation/MULTILINGUAL_RAG_ARCHITECTURE_DECISION.md`

---

# 1. RAG Architecture Overview (Option C Implemented)

The MedGuide AI Retrieval-Augmented Generation (RAG) system grounds all AI-generated health information in approved medical guidelines (WHO, ICMR, MOHFW).

```text
USER INPUT (English / Hindi / Telugu)
       │
       ▼
Language Identification & Resolution
       │
       ▼
DETERMINISTIC RED-FLAG SAFETY TRIAGE (Local, <30 µs)
       │
       ├─► [EMERGENCY DETECTED] ──► Immediate 108/112 Guidance (NO RAG, NO LLM, NO Translation)
       │
       └─► [ROUTINE / NON-EMERGENCY]
                  │
                  ▼
       Direct Semantic Retrieval (384-d ONNX paraphrase-multilingual-MiniLM-L12-v2)
                  │
                  ├─► [Strong Match: Sim ≥ 0.65] ──► Direct Evidence Selection
                  │   (e.g., English, Hindi, Code-Mixed Telugu)
                  │
                  └─► [Weak Match: Sim < 0.65] ──► Option C Translation Bridge
                                                          │
                                             (Online: Sarvam Translation Gateway)
                                             (Offline: Graceful Mode A Fallback)
                                                          │
                                                          ▼
                                             English Medical Corpus Search
                                                          │
                                                          ▼
                                             Dual Merge (0.4 Direct + 0.6 English)
                                             Deduplication & Reranking
                                                          │
                                                          ▼
                                             Evidence Sufficiency Gate (Sim ≥ 0.40)
                                                    ├─ [Fail] ──► Localized Refusal
                                                    └─ [Pass] ──► Grounded Prompt Builder
                                                                        │
                                                                        ▼
                                                          Ollama Qwen3:4B (think: false)
                                                                        │
                                                                        ▼
                                                          Safety & Citation Validator
                                                                        │
                                                                        ▼
                                                          Localized Grounded Answer + Citations
```

---

# 2. Knowledge Corpus & Vector Representation

1. **Ingested Verified Guidelines (6,760 chunks stored):**
   * *WHO Guideline for the Pharmacological Treatment of Hypertension in Adults*
   * *WHO Guidelines for Malaria*
   * *ICMR Standard Treatment Workflows of India: Paediatric Tuberculosis*
   * *WHO Package of Essential Noncommunicable (PEN) Disease Interventions*
2. **Chunking & Storage:**
   * Chunk size: 500 characters (~80 words) with 50-character overlap.
   * Stored in PostgreSQL `knowledge_chunks` with `vector(384)` indexed via `pgvector` cosine similarity.
3. **Query Embedding Runtime:**
   * Primary Engine: **ONNX Runtime (CPUExecutionProvider)** + HuggingFace `tokenizers` library (PyTorch-independent runtime).
   * Generates genuine 384-d semantic vectors from `paraphrase-multilingual-MiniLM-L12-v2`.
   * Silent hash fallback is strictly removed; runtime fails closed if embedding model is unavailable.

---

# 3. Multilingual Retrieval Strategy (Option C)

* **Direct English / Hindi Queries:**
  * Direct retrieval natively achieves **100.0% Recall@1** (MRR: 1.000, Mean Similarity: 0.74 – 0.79).
  * Hindi queries score above the 0.65 trigger threshold and bypass translation automatically.
* **Telugu Non-Emergency Queries:**
  * Direct retrieval scores ~47.6% due to multilingual subword tokenization fragmentation on pure Telugu medical terms.
  * Option C translation bridge translates query to English via `TranslationGateway`, searches English corpus, merges candidate lists (0.4 direct + 0.6 English weights), and achieves **100.0% Recall@1** (MRR: 1.000, Mean Similarity: 0.7259).
* **Offline / Unavailable Provider Resilience:**
  * If translation is unavailable (offline mode, network timeout), `DisabledTranslationGateway` or `SarvamTranslationGateway` fails closed safely, falling back gracefully to direct local Telugu retrieval (Mode A).
  * Sarvam is never claimed to be an offline dependency.

---

# 4. Threshold & Parameter Definitions

* `RAG_SIMILARITY_THRESHOLD = 0.40`: Minimum cosine similarity required for a chunk to be considered relevant evidence.
* `RAG_TRANSLATION_TRIGGER_THRESHOLD = 0.65`: Heuristic trigger threshold derived from empirical benchmark (mean strong match ≥ 0.70; weak direct matches < 0.60). Triggers the Option C translation bridge for non-English queries.
* `RAG_TOP_K_CANDIDATES = 10`: Number of initial vector candidates retrieved from pgvector.
* `RAG_TOP_K_CONTEXT = 4`: Number of top reranked chunks injected into LLM prompt.

---

# 5. Local LLM Generation & Latency Controls

* Model: `qwen3:4b` (Q4_K_M, 2.5 GB) served locally via Ollama (`http://localhost:11434`).
* Gateway Optimization: `think: false` enforced via `build_ollama_chat_payload` to eliminate expensive chain-of-thought tokens on CPU, maintaining generation latency at **15s – 24s** (vs 75s+ when unconstrained thinking is enabled).
