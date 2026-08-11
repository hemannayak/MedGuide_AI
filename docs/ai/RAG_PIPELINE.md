# MedGuide AI — AI & RAG Pipeline Specification

**Project:** MedGuide AI  
**Document:** AI & RAG Pipeline Specification  
**Version:** 1.0  
**Status:** Baseline Specification  
**Related Documents:**  
* `AGENTS.md`  
* `docs/PROJECT_SPECIFICATION.md`  
* `docs/requirements/SRS.md`  
* `docs/architecture/SYSTEM_ARCHITECTURE.md`  
* `docs/database/DATABASE_DESIGN.md`  

---

# 1. RAG Architecture Overview

The MedGuide AI Retrieval-Augmented Generation (RAG) system grounds all AI-generated medical answers in verified medical knowledge sources (WHO guidelines, government health portals, and approved primary care manuals).

```text
Approved Medical Source
       ↓
Preprocessing & Text Extraction
       ↓
Chunking (500 tokens, 50-token overlap)
       ↓
Embedding Generation (Sentence Transformers: all-MiniLM-L6-v2)
       ↓
Vector Storage (PostgreSQL pgvector)
       ↓
--------------------------------------------------
User Health Query
       ↓
Query Embedding Generation
       ↓
Cosine Similarity Search (HNSW Index, top_k = 3)
       ↓
Relevance Filtering (Similarity Threshold ≥ 0.70)
       ├─ [Below Threshold] ──> Fallback Safe Limitation Response
       └─ [Above Threshold] ──> Context Assembly
                                     ↓
                               Grounded System Prompt
                                     ↓
                               LLM Response Generation
                                     ↓
                               Safety Validation Layer
                                     ↓
                               User Guidance + Citation
```

---

# 2. Knowledge Ingestion & Chunking Strategy

1. **Approved Sources Only:** Unverified external articles or user inputs are strictly barred from entering the vector database.
2. **Chunking Parameters:**
   * **Chunk Size:** 500 tokens (~350-400 words).
   * **Chunk Overlap:** 50 tokens (~10% overlap to preserve semantic continuity across chunk boundaries).
   * **Metadata Preserved:** Document Title, Publisher, Source URL, Publication Date, Language, Clinical Topic.

---

# 3. Vector Indexing & Similarity Search

* **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors, lightweight and open-source).
* **Vector Index:** PostgreSQL `pgvector` HNSW index on `knowledge_chunks.embedding` using `vector_cosine_ops`.
* **Retrieval Threshold:**
  * If max similarity score $< 0.70$, RAG returns zero chunks and triggers the **Safe Limitation Response**:
    > *"I couldn't find reliable information for this query in my approved medical knowledge base. Please consult a qualified healthcare professional."*

---

# 4. Anti-Hallucination & System Prompt Guardrails

The system prompt strictly separates instructions, context, and user input:

```text
[SYSTEM INSTRUCTION]
You are MedGuide AI, an informational healthcare companion.
Provide grounded assistance ONLY using the medical context provided below.
Do NOT fabricate citations, medical guidelines, or diagnostic claims.
If the context does not contain sufficient information, state clearly that information is limited.
You are NOT a doctor and MUST NOT prescribe medication or issue definitive diagnoses.

[MEDICAL CONTEXT]
{retrieved_chunks_with_metadata}

[USER QUERY]
{user_query}
```

---

# 5. Model Evaluation & Reproducibility Metrics

To validate RAG performance, experiments track:
1. **Retrieval Recall@K (K=3):** Fraction of relevant document chunks successfully retrieved.
2. **Grounding Accuracy:** Human/expert rubric scoring of response consistency against context.
3. **Hallucination Failure Rate:** Target $0\%$ fabricated citations or unsupported claims.
