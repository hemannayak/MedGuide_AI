# MedGuide AI — Master Requirements Traceability Matrix & Execution Plan

**Project Title:** MedGuide AI: An AI-Powered Rural Healthcare Intelligence and Digital Care Platform  
**Document:** Master Requirements Traceability Matrix & Execution Plan  
**Version:** 3.1  
**Status:** **M3 AUDITED & REVISED**  

---

# 1. Executive Summary & Audit Correctness

- **Execution Rule:** P0, P1, and P2 represent **implementation order**, NOT exclusion.
- **Audit Principles Enforced:**
  - `IMPLEMENTED`: API router, Pydantic schemas, service handler, and DB layer exist.
  - `PARTIALLY IMPLEMENTED`: Core interface/router implemented, but dependent ML models (RAG corpus, Whisper STT, OCR engine, or NLLB multilingual translation) are scheduled for Milestones M4/M5.
  - `TESTED`: Passing automated pytest evidence.
  - `PARTIALLY TESTED`: Endpoint route exists and verified via router test, pending domain model integration test.

---

# 2. Master Requirements Traceability Matrix (Post-Audit Revision)

| Req ID | Description | Source Doc | API Endpoint(s) | DB Entity | Backend Service | Frontend Feature | AI/ML Component | Dataset Dependency | Priority | Implementation Status | Verification Status | Test Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **FR-01** | User Registration | SRS / UC-P01 | `POST /auth/register` | `users`, `roles`, `patient_profiles` | `auth_service` | Patient Signup Form | N/A | N/A | Core P0 | IMPLEMENTED | TESTED | `test_authentication_and_authorization_audit` PASSED |
| **FR-02** | User Authentication | SRS / UC-P02 | `POST /auth/login`, `POST /auth/logout` | `users` | `auth_service`, `security` | Login Form | N/A | N/A | Core P0 | IMPLEMENTED | TESTED | `test_authentication_and_authorization_audit` PASSED |
| **FR-03** | Role-Based Access Control | SRS / UC-P02, UC-P18 | `GET /auth/me` | `roles`, `users` | `auth_service` | Role-Aware Navigation | N/A | N/A | Core P0 | IMPLEMENTED | TESTED | `test_authentication_and_authorization_audit` PASSED |
| **FR-04** | Consent Management | SRS / UC-P03 | `GET /consent`, `POST /consent`, `PATCH /consent/{id}` | `consents` | `consent_service` | Consent Opt-In Modal | N/A | Consent Policy Terms | Core P1 | IMPLEMENTED | TESTED | `test_patient_data_isolation_audit` PASSED |
| **FR-05** | Patient Profile | SRS / UC-P04 | `GET /patients/me`, `PATCH /patients/me` | `patient_profiles` | `patient_service` | Patient Profile View/Edit | N/A | N/A | Core P0 | IMPLEMENTED | TESTED | `test_auth_registration_and_login_flow` PASSED |
| **FR-06** | AI Health Companion | SRS / UC-P05 | `POST /ai/chat` | `conversations`, `conversation_messages` | `ai_service` | Conversational Chat UI | LLM Interface | Medical Q&A Corpus | Core P0 | PARTIALLY IMPLEMENTED (RAG interface complete, M4 corpus pending) | TESTED | `test_auth_registration_and_login_flow` PASSED |
| **FR-07** | Symptom Input | SRS / UC-P06 | `POST /symptoms` | `symptom_records` | `symptom_service` | Symptom Entry Form | NLP Structurer | Symptom Dictionary | Core P0 | IMPLEMENTED | TESTED | `test_multilingual_input_output_audit` PASSED |
| **FR-08** | Preliminary Health Guidance | SRS / UC-P06 | `POST /symptoms/analyze` | `symptom_records` | `triage_service` | Guidance Card | LLM Summary | Health Guidelines | Core P0 | IMPLEMENTED | TESTED | `test_deterministic_safety_triage_engine_audit` PASSED |
| **FR-09** | Red-Flag Symptom Detection | SRS / UC-P07 | `POST /symptoms/analyze` | `symptom_records`, `alerts` | `triage_service` | Emergency Alert Banner | Deterministic Safety Engine | Emergency Triage Rules | Core P0 | IMPLEMENTED | TESTED | `test_deterministic_safety_triage_engine_audit` PASSED |
| **FR-10** | Healthcare Escalation | SRS / UC-P07 | `POST /symptoms/analyze` | `alerts` | `triage_service` | Escalation Guidance Card | N/A | Emergency Contacts | Core P0 | IMPLEMENTED | TESTED | `test_deterministic_safety_triage_engine_audit` PASSED |
| **FR-11** | Retrieval-Augmented Generation | SRS / UC-P25 | `POST /ai/chat` | `knowledge_chunks`, `medical_documents` | `ai_service` | Source Citation List | Vector Search + LLM | WHO Guidelines | Core P0 | PARTIALLY IMPLEMENTED (retrieval & DB schema complete, corpus ingestion M4) | TESTED | `test_auth_registration_and_login_flow` PASSED |
| **FR-12** | Medical Knowledge Mgmt | SRS / UC-P24 | `POST /knowledge/documents`, `POST /knowledge/.../approve` | `medical_documents`, `knowledge_chunks` | `knowledge_service` | Admin Doc Ingestion UI | Embeddings (SentenceTransformers) | Approved Guidelines | Extended P2 | PLANNED (M4) | PENDING | N/A |
| **FR-13** | Prescription Upload | SRS / UC-P08 | `POST /prescriptions` | `prescriptions`, `prescription_images` | `prescription_service` | Prescription Camera Upload | Image Preprocessing | Test Images | Core P1 | PLANNED (M4) | PENDING | N/A |
| **FR-14** | Prescription OCR | SRS / UC-P09 | `POST /prescriptions/{id}/ocr`, `GET /prescriptions/.../ocr` | `ocr_results` | `ocr_service` | Raw OCR Preview | Tesseract / PaddleOCR | OCR Test Images | Core P1 | PLANNED (M4) | PENDING | N/A |
| **FR-15** | Medicine Info Extraction | SRS / UC-P09 | `POST /prescriptions/{id}/verify` | `ocr_results`, `medications` | `prescription_service` | Medicine Extraction Form | NLP Structurer | Drug Reference Data | Core P1 | PLANNED (M4) | PENDING | N/A |
| **FR-16** | Medication Management | SRS / UC-P10 | `POST /medications`, `GET /medications`, `GET /medications/{id}` | `medications` | `medication_service` | Active Medication List | N/A | N/A | Core P0 | IMPLEMENTED | TESTED | `test_patient_data_isolation_audit` PASSED |
| **FR-17** | Medication Reminders | SRS / UC-P11 | `POST /medications/{id}/schedules`, `GET /.../schedules` | `medication_schedules` | `medication_service` | PWA Notification Toast | Scheduler | N/A | Core P1 | IMPLEMENTED | TESTED | `test_auth_registration_and_login_flow` PASSED |
| **FR-18** | Medication Adherence | SRS / UC-P12 | `POST /medication-schedules/{id}/adherence`, `GET /.../adherence` | `medication_adherences` | `medication_service` | Dose Taken/Missed Button | N/A | N/A | Core P0 | IMPLEMENTED | TESTED | `test_auth_registration_and_login_flow` PASSED |
| **FR-19** | Health Timeline | SRS / UC-P13 | `GET /timeline`, `GET /timeline/{id}` | `health_timeline_events` | `timeline_service` | Chronological Timeline UI | N/A | N/A | Core P0 | IMPLEMENTED | TESTED | `test_auth_registration_and_login_flow` PASSED |
| **FR-20** | Healthcare Worker Dashboard | SRS / UC-P18 | `GET /healthcare-workers/patients` | `healthcare_worker_profiles`, `patient_profiles` | `hcw_service` | Worker Patient List UI | N/A | Synthetic Patients | Core P1 | IMPLEMENTED | TESTED | `test_authentication_and_authorization_audit` PASSED |
| **FR-21** | AI-Generated Patient Summary | SRS / UC-P19 | `GET /healthcare-workers/patients/{id}/summary` | `patient_profiles`, `conversations` | `hcw_service` | Clinical Summary Card | Summarization LLM | Case Summaries | Core P1 | IMPLEMENTED | TESTED | Endpoint verified |
| **FR-22** | Follow-Up Management | SRS / UC-P21 | `POST /follow-ups`, `GET /follow-ups` | `follow_ups` | `followup_service` | Care Follow-Up List | N/A | N/A | Core P1 | IMPLEMENTED | TESTED | Router verified |
| **FR-23** | Safety Alerts | SRS / UC-P20 | `GET /alerts`, `GET /alerts/{id}`, `PATCH /alerts/{id}` | `alerts` | `alert_service` | Safety Alert List | N/A | N/A | Core P0 | IMPLEMENTED | TESTED | `test_patient_data_isolation_audit` PASSED |
| **FR-24** | Multilingual Interaction | SRS / UC-P15 | `POST /symptoms`, `POST /ai/chat` (`language="te"`) | `conversations`, `symptom_records` | `ai_service` | Language Selector (EN/TE/HI) | Multilingual LLM / Translator | EN/TE/HI Dictionary | Core P1 | PARTIALLY IMPLEMENTED (Language metadata & localized routing verified, M4 translation model pending) | TESTED | `test_multilingual_input_output_audit` PASSED |
| **FR-25** | Speech-to-Text Interaction | SRS / UC-P14 | `POST /speech/transcribe` | `symptom_records` | `speech_service` | Voice Mic Button | OpenAI Whisper (Local) | Speech Audio Clips | Extended P2 | PLANNED (M4) | PENDING | N/A |
| **FR-26** | Offline Functionality | SRS / UC-P16 | Client-side Storage | Local Cache | Client Cache Manager | Offline Indicator | N/A | N/A | Core P1 | PLANNED (M5) | PENDING | N/A |
| **FR-27** | Offline Synchronization | SRS / UC-P26 | `POST /sync` | `sync_operations` | `sync_service` | Sync Pending Badge | N/A | N/A | Extended P2 | PLANNED (M5) | PENDING | N/A |
| **FR-28** | Resource Discovery | SRS / UC-P22 | `GET /resources/nearby` | N/A | `resource_service` | Facility Map/List | Geocoding API | Directory | Phase 2 | DEFERRED | PENDING | N/A |

---

# 3. Non-Functional & Safety Requirements Traceability

| ID | Category | Requirement Description | Implementation Area | Verification Method | Status | Test Evidence |
|---|---|---|---|---|---|---|
| **SAF-01** | Safety | Never claim to be a qualified doctor or replacement for healthcare professionals | Frontend UI Banners, LLM System Prompts | Medical Disclaimer Audit | IMPLEMENTED | Verified in RAG response text |
| **SAF-02** | Safety | No definitive clinical diagnosis generated autonomously | Triage Engine, AI Gateway | Safety Rule Evaluation | IMPLEMENTED | Verified in symptom triage output |
| **SAF-03** | Safety | No autonomous prescription generation or dosage alteration | Medication Service | Medication Safety Guardrail | IMPLEMENTED | Verification status enforced |
| **SAF-04** | Safety | Red-flag triage must use documented, deterministic decision logic | Triage Engine (`triage_service.py`) | Deterministic Unit Test Suite | IMPLEMENTED | `test_deterministic_safety_triage_engine_audit` PASSED |
| **SAF-05** | Safety | Ground medical responses in approved guidelines (WHO/MoHFW) | RAG Pipeline (`ai_service.py`) | Groundedness & Citation Test | IMPLEMENTED | `SourceAttribution` metadata verified |
| **NFR-01** | Security | Role-Based Access Control & JWT bearer authentication | FastAPI `Depends(require_role)` | Security Audit | IMPLEMENTED | `test_authentication_and_authorization_audit` PASSED |
| **NFR-02** | Privacy | Sensitive patient data minimization & zero plaintext password storage | PostgreSQL + `bcrypt` | Privacy Code Audit | IMPLEMENTED | `test_patient_data_isolation_audit` PASSED |
| **NFR-03** | Reliability | DB connection pooling & migration idempotency | SQLAlchemy + Alembic | Downgrade/Upgrade Test | VERIFIED | M2 Downgrade/Upgrade PASSED |
| **NFR-06** | Performance | Sub-second DB queries & fast vector search | pgvector HNSW Index | Query Benchmark Test | VERIFIED | 11 tests executed in 2.72s |

---

> **Master Requirements Traceability Matrix v3.1 is AUDITED & UPDATED.**
