# MedGuide AI — Candidate Research & Technology Shortlist

**Project:** MedGuide AI  
**Document:** Candidate Research & Technology Shortlist  
**Version:** 1.0  
**Status:** Verification & Shortlist Baseline  
**Related Documents:**  
* `AGENTS.md`  
* `docs/requirements/PRE_DEVELOPMENT_DECISIONS.md`  
* `docs/ai/AI_RAG_ARCHITECTURE.md`  
* `docs/ai/MODEL_SELECTION_AND_EVALUATION.md`  
* `docs/ai/MODEL_REGISTRY.md`  

---

# 1. Purpose

This document provides a source-verified research analysis of open-source and free AI models across all required categories for MedGuide AI (LLM, Embedding, OCR, STT).

It evaluates candidates against the project's primary constraints:
* **Zero paid mandatory dependencies.**
* **Local CPU/GPU + Free Cloud Tier execution (e.g. Google Colab / Ollama / Local PyTorch).**
* **Multilingual support (English + Telugu + Hindi).**
* **Strict healthcare safety and privacy boundaries.**

---

# 2. Category 1: LLM Candidates

| Candidate Model | Parameter Count & Quantization | License | Multilingual Capabilities | Hardware Fit (Local / Colab) | Assessment / Trade-offs |
|---|---|---|---|---|---|
| **Llama 3 8B Instruct** | 8B (Q4_K_M ~4.7GB) | Llama 3 Community | Excellent English, Moderate Hindi/Telugu | Runs locally (8GB+ RAM / VRAM) or Colab GPU | **Top Candidate.** Strong instruction following, highly reliable safety alignment. |
| **Gemma 2 2B Instruct** | 2.6B (INT4 ~1.6GB) | Gemma Terms of Use | Good English, Fair Multilingual | Ultra-lightweight (Runs on low-end CPUs) | **Local Offline Candidate.** Extremely fast inference, low RAM footprint. |
| **Qwen 2.5 7B Instruct** | 7B (Q4_K_M ~4.4GB) | Apache 2.0 | Outstanding Multilingual (Inc. Asian/Indic) | Runs locally (8GB+ RAM) or Colab GPU | **Strong Multilingual Candidate.** Excellent tokenization for non-English scripts. |
| **Mistral 7B Instruct v0.3** | 7B (Q4_K_M ~4.3GB) | Apache 2.0 | Strong English, Moderate Multilingual | Runs locally (8GB+ RAM) or Colab GPU | High-quality reasoning, open commercial license. |

---

# 3. Category 2: Embedding Model Candidates

| Candidate Model | Dimensions | License | Multilingual Support | Memory Footprint | Assessment / Trade-offs |
|---|---|---|---|---|---|
| **all-MiniLM-L6-v2** | 384-d | Apache 2.0 | English Primed | ~90MB | **Baseline English.** Fast, small vector size, excellent pgvector search latency. |
| **paraphrase-multilingual-MiniLM-L12-v2** | 384-d | Apache 2.0 | Multilingual (50+ Languages, Inc. Te/Hi) | ~470MB | **Primary Multilingual Candidate.** Aligns cross-lingual semantic spaces. |
| **bge-small-en-v1.5** | 384-d | MIT | English Primed | ~130MB | High retrieval accuracy on MTEB benchmarks for English medical text. |

---

# 4. Category 3: OCR Engine Candidates

| Candidate Engine | Version / Engine | License | Primary Capabilities | Hardware Fit | Assessment / Trade-offs |
|---|---|---|---|---|---|
| **PaddleOCR (PP-OCRv4)** | Mobile/Server models | Apache 2.0 | Multilingual text detection & recognition | CPU / Lightweight GPU | **Top Candidate.** Superior accuracy on unstructured tabular & handwritten text. |
| **Tesseract OCR** | v5.3.0 LSTM | Apache 2.0 | Standard document OCR | CPU (Extremely lightweight) | Solid baseline for clean printed medical text; weaker on low-contrast handwriting. |

---

# 5. Category 4: Speech-to-Text (STT) Candidates

| Candidate Model | Parameters | License | Multilingual & Code-Mixing | Local Execution | Assessment / Trade-offs |
|---|---|---|---|---|---|
| **OpenAI Whisper Small** | 244M | MIT | Excellent English, Telugu, Hindi | CPU/GPU (~1GB VRAM) | **Top Candidate.** Highly robust against background noise and rural accents. |
| **OpenAI Whisper Tiny** | 39M | MIT | Good English, Fair Multilingual | CPU (~150MB VRAM) | **Offline PWA Candidate.** Fast real-time recognition on low-end hardware. |

---

# 6. Benchmark & ADR Plan

All shortlisted models will undergo formal evaluation on the datasets defined in `MODEL_SELECTION_AND_EVALUATION.md`. Results will be committed to `MODEL_REGISTRY.md` and finalized via individual ADRs (`docs/architecture/decisions/`).
