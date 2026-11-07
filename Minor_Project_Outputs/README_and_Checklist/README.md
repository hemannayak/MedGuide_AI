# MedGuide AI minor project execution outputs

Prepared on 23 October 2026 using the existing project on this laptop. No application redesign, index replacement, patient-data export, or Docker deployment was performed for this report task.

This package contains 14 named PNG figures, six editable PlantUML sources, execution transcripts, the real vector-query output, the live database schema, and a 14-row master checklist. Read the checklist before using the requested captions: several describe features that the implementation does not currently provide.

## Evidence classification

- Figures 7.1–7.5 and 5.1 are genuine screenshots of the running Next.js frontend and FastAPI Swagger UI.
- Figures 5.2 and 8.2 are genuine browser screenshots of explicitly labelled transcripts from real Ollama and psql executions. They are **not native terminal screenshots**. Raw text, a prepared SQL file with its real generated embedding, and reproduction scripts are included. Native terminal recapture remains a manual step if the report requires that exact evidence format.
- Figures 1.1, 4.1, 6.1, 6.2, and 8.1 are generated diagrams based on inspected code and the live schema.
- Figure 4.2 is explicitly a **proposed Docker mapping**, not proof of an implemented or running Docker deployment. No Compose file or Dockerfiles were found in the project outside dependencies/build caches.
- All frontend test inputs were synthetic and run under an isolated `SYN` demonstration account. No real patient records, passwords, access tokens, or provider credentials are included.

## Important differences from the guide

| Guide expectation | Verified implementation or output |
|---|---|
| Default chat at `/` | `/` is the public landing page; authenticated chat is `/app/chat`. |
| “100% Local Inference • Fully Private” | That claim is absent from the current chat. Runtime configuration selects Groq, model `qwen/qwen3.8-27b`. Do not claim fully local application inference. |
| Llama 3.2:3B as app model | Requested model was downloaded and genuinely run with Ollama as a separate CLI capability proof. Existing application provider configuration was preserved. Qwen3:4B was already installed locally. |
| Duration/severity chips in chat | Chat has example-question cards. Duration and severity controls exist on the separate symptom-input page, not inside chat. |
| Exact emergency heading | Actual red badge reads “CRITICAL • EMERGENCY ESCALATION”; guidance and 108/112 links are visible. |
| Amber moderate-risk badge/timeframe | Exact fever input produced cautious consultation advice and four citations, without an amber tier badge or a specific consultation timeframe. |
| Green low-risk badge/home-care advice | Exact runny-nose input produced a cautious response explaining the evidence gap and recommending professional advice. No green badge, rest/hydration advice, or explicit home-care tier was fabricated. |
| Verified sources modal | Actual `MedEvidence` control expands inline. Screenshot shows actual WHO title/publisher/section/page fields. It is not a modal. Metadata called “section” may be an inferred PDF heading/page number, not a validated textbook chapter. |
| `/api/v1/triage` and `/api/v1/ingest` | Neither exists in the actual OpenAPI schema. Existing endpoints include `/api/v1/symptoms`, `/api/v1/symptoms/analyze`, `/api/v1/ai/chat`, and specific `/api/v1/auth/...` routes. Ingestion is an existing Python script/service, not an ingestion API. |
| 600-token chunks / 100-token overlap | Current ingestion slices strings into 500-character windows with 50-character overlap, preserving page boundaries. This is not a semantic/token chunker despite an existing docstring description. Live chunk lengths range from 31 to 500 characters. |
| all-MiniLM-L6-v2 | Actual encoder is `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, using ONNX mean pooling with a SentenceTransformer fallback; 384 dimensions. |
| `medical_knowledge_chunks` | Actual table is `knowledge_chunks`; title/publisher live in joined `medical_documents`. Section/page fields are JSONB metadata. |
| `messages` | Actual table is `conversation_messages`. |
| Five/six database tables | Live database has 27 tables. Figure 8.1 shows seven relevant actual tables, including `medical_documents`; an external `roles` FK is noted. Full live column/FK metadata is in `database_schema.json`. |
| Named Docker services/network | No implemented Compose configuration was found. Figure 4.2 uses guide names only as proposed labels. Observed services run as host processes. |
| Emergency response under 15 ms | Not claimed or measured. A fail-if-retrieval-called test verified zero retrieval calls for the exact emergency input. Code returns from that branch before LLM generation. |

The existing report document also uses different figure numbering (for example its 4.2 is an ingestion pipeline and 7.2 is citations). This package follows the newer execution prompt's 14-figure numbering. Reconcile the report's list of figures and in-text references before submission.

## Verified retrieval result

Database: `medguide_ai_dev`, PostgreSQL 18.4, pgvector 0.8.5. Actual column type: `vector(384)`. All 6,760 indexed chunks have embeddings.

Query: **What is the initial management of hypertension in adults?**

| Nearest result | Source | Inferred section | Page | Actual cosine similarity |
|---|---|---|---|---|
| 1 | WHO Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care | 263 | 273 | 0.8668233058360635 |
| 2 | Same WHO PEN document | 262 | 272 | 0.8650897732705611 |
| 3 | Same WHO PEN document | 257 | 267 | 0.8644826503728832 |

All three exceed the guide's 0.65 demonstration target for this query. No threshold filtering, score adjustment, or forced matching was used. These values demonstrate retrieval for this query, not clinical validity, overall retrieval accuracy, or general response quality.

The live rows lack `embedding_model` metadata. Three independently selected stored chunks were re-encoded using the current encoder; their cosine agreement with stored vectors was approximately 1.0. This is empirical compatibility evidence for those three samples, not proof of every historical ingestion run or a pinned model revision. See `vector_retrieval_results.json`.

The nearest source concerns primary care/noncommunicable disease guidance and is relevant to the hypertension query. Inferred “section” values are numeric extraction metadata; do not rename them as clinical chapter titles. Existing source-coverage limitations are visible in the fever and runny-nose chat outputs.

## Reproduce the existing services on this laptop

Use separate PowerShell terminals. Check whether a port is already occupied before launching another instance. Keep existing processes running. The commands below are the startup commands actually used in this capture workflow.

Backend, from `C:\Hemanth\Projects\MedGuide_AI\backend`:

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Frontend, from `C:\Hemanth\Projects\MedGuide_AI\frontend`:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Existing backend configuration securely supplies PostgreSQL and provider settings. Do not print `.env` files. The current frontend defaults to `http://localhost:8000/api/v1` in real mode. Swagger is `http://127.0.0.1:8000/docs`; actual OpenAPI is `/api/v1/openapi.json`; health is `/api/v1/health`.

PostgreSQL and Ollama were already running. No database initialization, volume deletion, migration, corpus re-ingestion, or credential replacement was needed. If reproducing on another setup, first review `backend/.env.example`, `backend/alembic/`, `backend/requirements.txt`, and the project's README. Do not blindly apply migrations or create a replacement database on this existing installation.

## Native terminal recapture instructions

Figure 5.2, in a visible PowerShell window:

```powershell
ollama list
ollama run llama3.2:3b "State your clinical role in one sentence." --nowordwrap
```

The requested model is now installed. For a different laptop where it is absent, run `ollama pull llama3.2:3b` first and wait for completion. `--nowordwrap` avoids terminal control sequences in redirected output. Capture the actual terminal with the command and returned text together. The model's statements are an execution demonstration, not medical advice or a clinically validated system role.

Figure 8.2, from the project root, in a visible PowerShell window:

```powershell
backend\.venv\Scripts\python.exe Minor_Project_Outputs\README_and_Checklist\capture_pgvector.py
```

The script executes the installed `psql.exe` against the configured database, supplies credentials privately through the child environment, and passes a genuine 384-dimensional embedding through `PREPARE` / `EXECUTE`. Capture the command, prepared-query description, and actual three returned rows. It is a read-only query. Do not paste an unbound `$1` directly into psql.

Use Windows screenshot controls to capture only the relevant terminal, then save over the two transcript-view PNGs if native screenshots are mandatory. The automation surface did not expose the newly requested native terminal windows; no native terminal screenshot is claimed.

## Frontend recapture

Open `http://127.0.0.1:3000/app/chat` and sign in through the normal form to a dedicated synthetic account. Choose English. For Figure 7.1 start a new conversation. For Figures 7.2–7.4 submit each exact input from `MASTER_CHECKLIST.md` in a new conversation. Wait until a response or a visible error appears. For Figure 7.5 click the real “Retrieved evidence … View sources” control on a response that actually has sources. Do not insert sources into an empty response or rename the current UI as a modal.

Capture the complete visible response and original input. A screenshot that lacks a requested badge or advice is evidence of the current limitation; it must not be relabelled as a successful tier-specific implementation. Ordinary screenshots were re-encoded from browser JPEG to PNG without content alteration. No screenshot text, controls, badges, or results were added or painted over.

## Deliverable validation

Every required PNG was decoded and visually reviewed at full size or in a review sheet, with important figures checked individually. The generated diagrams are high-resolution and have editable `.puml` sources. `FILE_MANIFEST.json` records dimensions, byte lengths, and SHA-256 checksums. The ZIP was opened and tested for archive integrity after packaging.

No application code was changed for this report capture task. Dependencies already installed in the project were reused; the specifically requested Ollama model was the only added model asset. The ZIP excludes the full extracted original report and all environment files. The report's expected amber/green chat outputs, Docker deployment proof, local-only app inference claim, exact modal UI, and two native-terminal captures remain unfulfilled as specified above.
