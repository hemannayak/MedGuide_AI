# MedGuide AI
### An AI-Powered Rural Healthcare Intelligence and Digital Care Platform

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-324%20passed-emerald.svg)](backend/)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-84%20passed-emerald.svg)](frontend/)
[![Mobile Tests](https://img.shields.io/badge/Mobile%20Tests-69%20passed-emerald.svg)](mobile/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%200%20errors-blue.svg)](frontend/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20PostgreSQL%20%7C%20pgvector-009688.svg)](backend/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019%20%7C%20Tailwind-black.svg)](frontend/)
[![Expo](https://img.shields.io/badge/Mobile-Expo%20SDK%2057%20%7C%20React%20Native-4630EB.svg)](mobile/)

---

> [!IMPORTANT]
> **Healthcare Safety Notice & Non-Diagnostic Disclaimer**  
> MedGuide AI is an assistive healthcare technology and digital care platform engineered to improve preliminary healthcare access in rural and underserved communities. **The system is never a substitute for qualified healthcare professionals, clinical diagnoses, or emergency medical care.** It does not independently prescribe medications, alter prescribed dosages, or claim definitive medical authority. Predefined red-flag symptoms trigger immediate healthcare worker escalation or emergency care recommendations.

---

## 1. Overview & Core Mission

Rural primary healthcare delivery faces significant systemic challenges: acute shortages of medical practitioners, low digital literacy, language barriers, and limited network connectivity. 

**MedGuide AI** provides an accessible, grounded, multilingual first layer of digital healthcare support designed specifically for rural citizens, community health workers (ASHA/ANM), and primary care centers:

1. **Multilingual Speech & Text Health Companion:** Seamless natural communication in regional languages (**English, Hindi, Telugu**), featuring speech-to-text (STT) and text-to-speech (TTS) synthesis designed for low-literacy users.
2. **Deterministic Red-Flag Triage:** Hardened safety rules prioritize patient safety before unconstrained LLM generation, instantly escalating emergencies.
3. **Evidence-Grounded RAG (Retrieval-Augmented Generation):** Medical explanations are strictly retrieved from documented, authoritative sources using pgvector embeddings—eliminating fabricated citations and clinical hallucinations.
4. **Prescription OCR & Verification Safeguard:** Converts handwritten or printed prescription images into structured medication schedules, enforcing a strict `PENDING` state until explicitly reviewed and verified by a human or authorized healthcare worker.
5. **Healthcare Worker (HCW) Collaboration Portal:** Role-based portal enabling community health workers to inspect patient-reported symptoms, review AI summaries, verify medications, and monitor follow-ups.
6. **Offline-Ready Resilience:** Engineered with localized caching and idempotent sync structures for intermittent rural network connectivity.

---

## 2. Multi-Tier Architecture

MedGuide AI operates as a unified platform sharing centralized PostgreSQL/pgvector storage and versioned REST endpoints across both web and mobile clients:

```text
                        ┌──────────────────────────────────────────────┐
                        │              Client Platforms                │
                        │  Web (Next.js 16)   │   Mobile (Expo SDK 57) │
                        └──────────────────────┬───────────────────────┘
                                               │ HTTPS / JSON / Multipart
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │          MedGuide AI Backend Gateway         │
                        │               (FastAPI / REST)               │
                        └───────┬───────────────────────────────┬──────┘
                                │                               │
                ┌───────────────┴───────────────┐               │
                ▼                               ▼               ▼
   ┌─────────────────────────┐    ┌─────────────────────────┐   │
   │ Deterministic Triage    │    │ Prescription OCR Engine │   │
   │ Red-Flag Detection Gate │    │ Tesseract + Validation  │   │
   └────────────┬────────────┘    └─────────────┬───────────┘   │
                │                               │               │
                ▼                               ▼               ▼
   ┌────────────────────────────────────────────────────────┐   │
   │ Retrieval-Augmented Generation (RAG) & Indic Speech    │   │
   │ • Semantic Search (pgvector + Embeddings)              │   │
   │ • Grounded LLM Gateway (Refusal & Citation Filters)    │   │
   │ • Sarvam AI Indic Speech (Hindi, Telugu, English)      │   │
   └────────────────────────────┬───────────────────────────┘   │
                                │                               │
                                ▼                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │             PostgreSQL 16 + pgvector Storage Layer             │
   │ Users • Profiles • Consents • Conversations • SymptomRecords   │
   │ Prescriptions • Medications • Schedules • Adherence • Audits   │
   └────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Domain | Technologies |
|---|---|
| **Backend REST API** | Python 3.12, FastAPI, SQLAlchemy ORM, Alembic, Pydantic v2 |
| **Database & Vector Index** | PostgreSQL 16, `pgvector`, B-Tree / HNSW indexing |
| **Web Application** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide |
| **Mobile Client** | React Native 0.86, Expo SDK 57, Expo Router, TypeScript |
| **Native Mobile Modules** | `expo-audio`, `expo-speech`, `expo-image-picker`, `expo-secure-store`, `expo-sensors` |
| **AI / RAG Pipeline** | Sentence Transformers, pgvector semantic search, grounded prompt governance |
| **Speech & Audio** | Sarvam AI Indic API (en, hi, te) with local fallback adapters |
| **Prescription OCR** | Tesseract OCR engine, OpenCV image pre-processing, regex entity extraction |
| **Testing & Quality** | `pytest` (Backend), Node.js native test runner (Web & Mobile), TypeScript (`tsc`), ESLint |

---

## 4. Repository Structure

```text
MedGuide_AI/
├── backend/                       # FastAPI REST backend
│   ├── alembic/                   # Database schema migrations
│   ├── app/
│   │   ├── api/v1/endpoints/      # REST API route controllers
│   │   ├── core/                  # Security, JWT, config, deterministic triage
│   │   ├── db/                    # Session management and engine
│   │   ├── models/                # SQLAlchemy relational ORM models
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   └── services/              # AI, RAG, speech, OCR, audit, and care services
│   ├── tests/                     # 324 automated backend pytest suites
│   ├── requirements.txt           # Production dependencies
│   └── verify_backend.py          # Synthetic integration verification script
├── frontend/                      # Next.js 16 web application
│   ├── src/
│   │   ├── app/                   # App router: (auth), /app (patient), /hcw (worker), public
│   │   ├── components/            # Reusable UI, workspaces, care review, speech playback
│   │   ├── lib/                   # API client, auth session, i18n dictionaries (en, hi, te)
│   │   └── types/                 # Shared TypeScript models and interfaces
│   └── tests/                     # 84 automated frontend integration tests
├── mobile/                        # Expo SDK 57 / React Native mobile app
│   ├── src/
│   │   ├── app/                   # Expo Router file-based screens (home, chat, care, prescriptions)
│   │   ├── components/            # Touch-friendly accessible rural UI components
│   │   ├── lib/                   # Client API, audio guide, offline wellness, native upload
│   │   └── services/              # Client services and storage adapters
│   ├── assets/                    # Optimized icons, bundled fonts, rural illustrations
│   └── tests/                     # 69 automated mobile unit tests
├── docs/                          # Comprehensive technical documentation
│   ├── architecture/              # System architecture and architectural decision records (ADRs)
│   ├── requirements/              # SRS, Master Traceability Matrix
│   ├── ai/                        # Model benchmarks, RAG design, VLM candidates
│   ├── security/                  # Privacy audit, RBAC, consent governance
│   └── testing/                   # Test reports, execution acceptance checklists
└── evaluation/                    # Medical source manifests, synthetic benchmarks, run results
```

---

## 5. Getting Started

### Prerequisites
* **Python**: 3.12+
* **Node.js**: 20+ (LTS recommended)
* **PostgreSQL**: 15+ or 16+ with the `pgvector` extension installed
* **Tesseract OCR**: Installed and on system PATH (for live OCR processing)

---

### Step 1: Backend Setup

1. **Navigate to backend and create a virtual environment:**
   ```bash
   cd backend
   python -m venv .venv
   ```
   *Windows (PowerShell):*
   ```powershell
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt -r requirements-dev.txt
   ```
   *Linux/macOS:*
   ```bash
   source .venv/bin/activate
   pip install -r requirements.txt -r requirements-dev.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL credentials (`DATABASE_URL=postgresql://user:pass@localhost:5432/medguide_ai`) and a secure `SECRET_KEY`.

3. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Launch the development server:**
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   * Interactive API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   * Service Health Endpoint: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

### Step 2: Web Application Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   Ensure `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1`.

3. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
   * Patient Portal: `/app/chat`, `/app/symptoms`, `/app/prescriptions`, `/app/medications`
   * Healthcare Worker Workspace: `/hcw`

---

### Step 3: Mobile Application Setup

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Set `EXPO_PUBLIC_API_BASE_URL` to your backend LAN IP or public endpoint (e.g., `http://192.168.1.X:8000/api/v1` for real devices).

3. **Start Expo development server:**
   ```bash
   npx expo start
   ```
   Press `a` for Android Emulator, `w` for Web preview, or scan the QR code with the **Expo Go** app on an Android device.

---

## 6. Verification & Automated Test Suites

The repository maintains a rigorous test baseline with **477 automated tests** across all tiers:

```bash
# 1. Run Backend Pytest Suite (324 tests)
cd backend
.\.venv\Scripts\pytest -q

# 2. Run Web Frontend Integration Tests (84 tests)
cd frontend
node --test tests/*.test.mjs

# 3. Run Mobile Unit & Service Tests (69 tests)
cd mobile
node --test tests/*.test.cjs

# 4. Run TypeScript Compilation Checks (0 errors)
cd frontend && npx tsc --noEmit
cd mobile && npx tsc --noEmit

# 5. Run Linter Validation (0 errors)
cd frontend && npm run lint
cd mobile && npm run lint
```

---

## 7. Security, Healthcare Safety & Privacy Rules

MedGuide AI is built with safety-critical engineering constraints:

* **Role-Based Access Control (RBAC):** Server-side authorization distinguishes `PATIENT` and `HEALTHCARE_WORKER` roles. Patients can only access their own records; healthcare workers can only access authorized, assigned patients.
* **Shared-Device Privacy:** To support shared community smartphones, client-side session logout immediately purges cached messages and tokens from local memory.
* **Consent Governance:** AI processing and speech recording require explicit, versioned, opt-in consent records stored in the database before processing commences.
* **Prescription Safety Lifecycle:** Medications extracted via OCR enter a mandatory `PENDING` state. Unverified medications **cannot** be scheduled for dosage reminders until explicitly validated by a human.
* **Audit Trail:** Transactional logging tracks authentication events, patient assignments, medication verifications, and safety alerts.

---

## 8. Research Traceability & Documentation

Comprehensive architectural and clinical decision records are maintained in `/docs`:

* [SRS & Master Traceability Matrix](docs/requirements/MASTER_TRACEABILITY_MATRIX.md)
* [System Architecture Decision Records (ADRs)](docs/architecture/)
* [Clinical Source Audit & Symptom Coverage Map](docs/data/MEDICAL_SOURCE_AUDIT.md)
* [RAG Retrieval Architecture & Multilingual Design](docs/ai/RURAL_RETRIEVAL_AND_INTERACTION.md)
* [Privacy & Legal Audit](docs/security/WEBSITE_PRIVACY_LEGAL_AUDIT_2026_10_11.md)

---

## 9. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
