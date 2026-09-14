# AI/RAG Runtime Investigation

**Date:** 2026-09-14  
**Scope:** Controlled Diagnostic & Fix — Semantic Embedding Runtime & Qwen3:4B Thinking Mode Overhead  
**Project:** MedGuide AI (Rural Healthcare Intelligence Platform)

---

## 1. Root Cause — PyTorch DLL Failure

In the Windows 11 host environment (`Windows-11-10.0.26200-SP0 AMD64`), Python 3.14.6 in `backend/.venv` encountered an `OSError [WinError 4551]` when attempting to load `torch_global_deps.dll`. 

Windows Application Control (Smart App Control / WDAC policy) prevented dynamic loading of unsigned or restricted PyTorch binary dependencies within the local virtual environment. Because `transformers` and `sentence-transformers` unconditionally import `torch` at top-level initialization, importing `SentenceTransformer` threw an exception.

In `backend/app/services/knowledge_service.py`, `get_embedding_model()` caught this exception in a generic `try...except Exception` block, silently setting `_embedding_model = None` and falling back to a periodic SHA-256 hash vector generator.

---

## 2. Exact Error

```text
OSError: [WinError 4551] An Application Control policy has blocked this file. Error loading "C:\Hemanth\Projects\MedGuide_AI\backend\.venv\Lib\site-packages\torch\lib\torch_global_deps.dll" or one of its dependencies.
```

**Full Traceback:**
```text
Traceback (most recent call last):
  File "C:\Hemanth\Projects\MedGuide_AI\backend\.venv\Lib\site-packages\sentence_transformers\__init__.py", line 10, in <module>
    from sentence_transformers.backend import load_onnx_model, load_openvino_model
  File "C:\Hemanth\Projects\MedGuide_AI\backend\.venv\Lib\site-packages\transformers\utils\generic.py", line 51, in <module>
    import torch
  File "C:\Hemanth\Projects\MedGuide_AI\backend\.venv\Lib\site-packages\torch\__init__.py", line 288, in <module>
    _load_dll_libraries()
  File "C:\Hemanth\Projects\MedGuide_AI\backend\.venv\Lib\site-packages\torch\__init__.py", line 271, in _load_dll_libraries
    raise err
OSError: [WinError 4551] An Application Control policy has blocked this file. Error loading "C:\Hemanth\Projects\MedGuide_AI\backend\.venv\Lib\site-packages\torch\lib\torch_global_deps.dll" or one of its dependencies.
```

---

## 3. Current Embedding Stack

| Component | Specification / Version | Status |
| :--- | :--- | :--- |
| **Python** | `3.14.6` (AMD64, 64-bit) | Verified |
| **Operating System** | `Windows 11 (10.0.26200)` | Active |
| **Configured Model** | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | Verified |
| **Primary Execution Backend** | `onnxruntime` (`1.30.0`) + `tokenizers` (`0.22.2`) | **Operational (100% working)** |
| **Secondary Execution Backend** | `sentence-transformers` (`5.7.0`) / PyTorch (`2.13.0`) | Blocked by WinError 4551 |
| **NumPy** | `2.5.2` | Verified |
| **Hugging Face Hub** | `0.36.2` | Verified (Official ONNX export cached) |
| **Database Vector Layer** | PostgreSQL 18.4 + `pgvector` 0.8.5 | Verified |

---

## 4. 384-Dimension Verification

| Metric | Property Value | Evaluation |
| :--- | :--- | :--- |
| **MODEL** | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | Verified |
| **MODEL VERSION** | MiniLM-L12-v2 (Official first-party ONNX graph from Hugging Face Hub) | Verified |
| **OUTPUT DIMENSION** | `384` float dimensions | Exact Match |
| **DATABASE DIMENSION** | `vector(384)` (`knowledge_chunks.embedding`) | Exact Match |
| **STATUS** | **100% COMPATIBLE & VALIDATED** | No DB schema change required |

---

## 5. Existing 6,760 Vector Provenance

A full inspection of all 6,760 rows in PostgreSQL `knowledge_chunks` was executed to determine whether the stored vectors were genuine semantic embeddings or hash vectors:

* **TOTAL CHUNKS INSPECTED:** `6,760`
* **HASH VECTORS FOUND:** `0`
* **REAL SEMANTIC VECTORS FOUND:** `6,760`
* **Category:** **A. Genuine semantic embeddings**
* **L2 Norm Distribution:** Mean norm `3.1350` (min: `2.6163`, max: `4.4308`), non-periodic, matching standard MiniLM-L12-v2 dense vector space.

**Consequence:** The existing database vectors are authentic and completely uncorrupted. **No re-ingestion, deletion, or re-embedding of the 6,760 chunks is necessary.**

---

## 6. Hash Fallback Analysis

### How It Was Implemented
In `backend/app/services/knowledge_service.py`, when model loading failed:
```python
import hashlib
h = hashlib.sha256(text.encode("utf-8")).digest()  # 32 bytes
v = [(b / 255.0) * 2 - 1 for b in h]
v384 = (v * 12)[:384]  # Periodically repeated 12 times
```

### Safety & Quality Risk
1. **False Cosine Distance:** When a query was hashed with this function and compared against authentic MiniLM vectors in pgvector, the cosine similarity dropped to `~0.14 – 0.15` (cosine distance `~0.85`), causing semantic search to fail.
2. **Silent Failure Mode:** The system pretended to perform semantic retrieval when it was actually matching hash noise against genuine embeddings.

### Policy & Safest Behavior
* **Fail Closed:** If no semantic embedding engine (ONNX or PyTorch) is operational, `generate_embedding()` must log a critical alert and raise a `RuntimeError` rather than silently injecting synthetic hash noise into RAG.

---

## 7. Embedding Runtime Fix

To fix the embedding runtime cleanly on Windows without modifying dependencies or violating security policies:
1. Utilized **`onnxruntime`** (`1.30.0`) and Hugging Face **`tokenizers`** (`0.22.2`), which are natively installed in `.venv`.
2. Loaded the official first-party ONNX model graph (`onnx/model.onnx`) and `tokenizer.json` for `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`.
3. Implemented standard mean-pooling over attention masks in `_load_onnx_embedding_engine()` within [`knowledge_service.py`](file:///c:/Hemanth/Projects/MedGuide_AI/backend/app/services/knowledge_service.py).
4. Replaced the silent hash fallback with fail-closed error handling.

---

## 8. Qwen3:4B Thinking Mode Investigation

### Inspection Findings
- **Ollama Model:** `qwen3:4b` (Architecture: `qwen3`, 4.0B parameters).
- **Ollama Modelfile Template:** Contains an unconditional `<think>` opening tag:
  ```text
  {{- if and (ne .Role "assistant") $last }}<|im_start|>assistant
  <think>
  {{ end }}
  ```
- **Ollama API Parsing:** Ollama separates tokens between `<think>` and `</think>` into `message.thinking`, and user-facing tokens into `message.content`.
- **Root Cause of High Latency / Blank Content:**
  When `num_predict` (e.g., 250–300 tokens) was set in `ai_gateway.py`, the CPU inference spent all 250 tokens inside `message.thinking` generating internal reasoning. Because `eval_count` reached `num_predict` before reaching `</think>`, `message.content` was returned as empty (`""`), and latency reached **35s–85s** for zero user output.

---

## 9. Latency Comparison

Controlled execution on host CPU:

| Configuration | Tokens Generated | Thinking Characters | Output Characters | Total Latency | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Test A: Default (250 tokens)** | 250 | 1,020 chars | 0 chars (`""`) | **38.85s** | Cut off mid-thought |
| **Test B: Instruct Prompt (250 tokens)** | 250 | 980 chars | 0 chars (`""`) | **53.81s** | Cut off mid-thought |
| **Test C: Full Generation (500 tokens)** | 500 | 1,921 chars | 366 chars | **70.54s** | Completed thought + produced content |

**Observation:**
The high latency on CPU is directly caused by the model generating 250–400 internal reasoning tokens before emitting its first user-visible word (~7.1 tokens/second on CPU $\times$ 400 tokens = ~56 seconds of reasoning overhead).

---

## 10. Remaining RAG Risks

1. **Thinking Model CPU Latency:** On CPU-only environments without GPU acceleration, any thinking/reasoning model (`qwen3:4b-thinking`) will incur 30s–60s latency per request.
2. **JSON Formatting Fragility:** When Qwen is forced into a rigid JSON schema while reasoning in Telugu/Hindi, invalid escape sequences or missing closing brackets can trigger validation fallbacks.

---

## 11. Required Next Step

1. **Semantic Embeddings:** Fully operational and validated. No further action needed for embeddings.
2. **Database:** Fully intact (6,760 chunks). No re-ingestion needed.
3. **Model Selection for Fast Offline CPU Inference:**
   - For sub-5-second local CPU inference without thinking token overhead, the project should evaluate an explicit non-thinking instruct model (e.g. `qwen2.5:3b-instruct` or `llama3.2:3b-instruct`).

---

## 12. Changes Made

### 1. Environment-Only Changes
- Cached official ONNX weights and tokenizer for `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` in local Hugging Face hub cache.

### 2. Application Code Changes
- [`backend/app/services/knowledge_service.py`](file:///c:/Hemanth/Projects/MedGuide_AI/backend/app/services/knowledge_service.py):
  - Added `_load_onnx_embedding_engine()` to execute MiniLM-L12-v2 via `onnxruntime` + `tokenizers`.
  - Removed silent SHA-256 hash fallback; replaced with fail-closed `RuntimeError`.

### 3. Database Changes
- **ZERO changes.** Database schema, indexes, and all 6,760 chunk embeddings remain untouched.

### 4. Test Suite Verification
- **107 of 107 tests passing** in `backend/tests/` (execution time reduced from 72.5s to 33.4s).
