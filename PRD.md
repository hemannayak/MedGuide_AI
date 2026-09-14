# MedGuide AI — Backend PRD & Atomic Task Breakdown

## [Phase 1] Security, Authorization & Medication Verification (Active)
- [x] Task 1.1: Create `PatientWorkerAccess` ORM model (`backend/app/models/access.py`)
- [x] Task 1.2: Register model in `backend/app/models/__init__.py` and add profile back-references
- [x] Task 1.3: Apply Alembic migration for `patient_worker_accesses` table
- [x] Task 1.4: Implement transactional audit logging in `backend/app/services/audit_service.py`
- [x] Task 1.5: Implement access authorization service in `backend/app/services/access_service.py`
- [x] Task 1.6: Rewrite `backend/app/services/hcw_service.py` and HCW endpoints with authorization guards
- [x] Task 1.7: Enforce `PENDING` default, schedule guard, and audit writes in `backend/app/services/medication_service.py`
- [x] Task 1.8: Add `POST /medications/{id}/verify` endpoint in `backend/app/api/v1/endpoints/medications.py`
- [x] Task 1.9: Add access schemas in `backend/app/schemas/access.py` and verification schema in `backend/app/schemas/medication.py`
- [x] Task 1.10: Add login/auth event audit logging hook in `backend/app/services/auth_service.py`
- [x] Task 1.11: Create `backend/tests/test_phase1_security.py` verifying security test cases (107/107 tests green)

## [Phase 2] Missing Core API Endpoints
- [ ] Task 2.1: Implement Prescription upload & validation router (`/api/v1/prescriptions`)
- [ ] Task 2.2: Implement Medical Knowledge exploration router (`/api/v1/knowledge`)
- [ ] Task 2.3: Implement Speech/Audio processing endpoints (`/api/v1/speech`)
- [ ] Task 2.4: Implement Offline Synchronization gateway (`/api/v1/sync`)

## [Phase 3] Speech & Multilingual Infrastructure
- [ ] Task 3.1: Implement Sarvam AI provider adapter with fallback to local Whisper/Ollama
- [ ] Task 3.2: Implement Indic language translation and TTS streaming endpoints
