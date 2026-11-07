# Baseline feature inventory — controlled evaluation execution

Date: 2026-11-05. Starting commit: 2b923e6; original branch main; execution branch codex/healthcare-evaluation-release. Numerous existing tracked and untracked modifications were preserved. This is a working baseline, not an exhaustive security certification.

## Recovery baseline

Private .local-backups checkpoint contains verified working-tree archive (1,589 files), Git bundle, original status and HEAD, source PDF snapshots and uploaded media where present. Environment secrets, dependencies, generated builds and large runtime weights are not included. Existing environment files remain untouched; separate secure environment recovery is required. No private recovery artifacts are committed.

Source PostgreSQL database: medguide_ai_dev. Initial Alembic head c62e1021wellness. Custom-format dump was restored to a new isolated recovery database and row counts matched across 27 public tables. Recovery copy contains original records: it MUST NOT be used as synthetic evaluator data. A separate empty medguide_eval_* database was created and migrated. Source database schema/data were not changed during these checks.

## Inventory and evidence

| Component | Status | Evidence / remaining work |
|---|---|---|
| FastAPI / PostgreSQL / pgvector | Implemented, integration tested | 414 previous backend tests; backup/restore now exercised; operational load/roles/retention still pending |
| Patient password registration/login | Implemented, targeted tests | Registration atomicity fixed; suspended login rejected; complete browser/device journey pending |
| OTP | Partial; external delivery blocked | Hash, expiry, attempt/rate limits; real SMS dispatcher absent; missing migration fixed on isolated DBs |
| Logout/session lifecycle | Partial; HIGH release blocker | Logout endpoint does not revoke JWT; refresh/recovery lifecycle missing |
| HCW authorization/provisioning | Partial integration | Assignment model/service, patient access and audit exist; complete provisioning/dashboard journey pending |
| Consent | Implemented, not exhaustively tested | Account-scoped API enforcement and withdrawal checks exist; full cache/device/provider audit pending |
| AI Gateway/chat | Implemented, partially verified | Grounded pipeline and emergency gate; one live English voice pipeline; no clinical validation |
| Conversation evidence | Backend implemented, frontend recovery disconnected | Source snapshots saved; history API ownership tested; history UI pending |
| RAG | Implemented, incomplete evidence review | 33 clinical/education docs; 25 public-health PDFs acquired, 24 awaiting review; separate NHM navigation passages |
| Speech | Implemented, partially tested | Sarvam en/hi/te synthetic-audio probes; local Whisper executable unsuccessful; human WER/noise/device tests pending |
| OCR | Implemented, incomplete E2E evaluation | Upload/extraction/correction/verification exist; handwritten/regional quality not established |
| Medication | Implemented, incomplete journey verification | Scheduling/adherence/verification gates; edit/cancel/reminder delivery audit pending |
| Timeline/follow-up/alerts | Implemented, not fully tested end to end | Persistent APIs and HCW access; notification delivery linkage incomplete |
| Email | Adapter present; delivery unverified | Backend SMTP with TLS; password recovery/email-verification integration incomplete |
| SMS | Not implemented for real delivery | Development OTP does not prove phone ownership |
| Push | Not implemented as verified remote delivery | Native local reminders exist; device token/delivery receipt infrastructure not found |
| Native local reminders | Implemented with limits | Today/tomorrow, verified active schedules, device-timezone restrictions; device receipt unverified |
| Offline | Partial | Session-bound cached care/timeline reads; offline AI and reliable write-sync not established |
| Wellness | Implemented, device verification pending | Persistent water/manual tracking; no general full-day automatic step claim |
| Web patient/HCW apps | Partially integrated | 87 previous tests passed, one live test skipped; no complete screen-to-database certification |
| Android | Implemented, current release unverified | Prior 72 mobile tests; rebuild/install/native permission and background checks needed |
| Workflow Engine / Queue Engine | Not found as standalone modules | Do not claim integrated engines; application service functions are not equivalent |
| Notification Engine / Integration Registry | Not found as complete backend modules | Existing local notification helper and provider adapters preserved |
| FHIR / ABDM / interoperability | Not found in current application tree | Do not invent pre-existing functionality; no new interoperability implementation in this increment |
| Appointment services | Not established by current inventory | Needs route/service review; no functionality removed |
| Audit logger | Implemented | Login identifiers removed from new authentication audit metadata to reduce unnecessary PII |
| Deployment | Partial | Dedicated empty evaluation DB created; evaluation service, HTTPS, signing, monitoring and provider configuration pending |

## Acceptance policy

Only synthetic data in the evaluation database. Never expose the restored recovery database to evaluators. Provider acknowledgement is not delivery. Recorded unit/component tests are not clinical or device validation. New medical case expectations require authoritative sources and clinician review. No release is marked ready while critical/high findings remain open.
