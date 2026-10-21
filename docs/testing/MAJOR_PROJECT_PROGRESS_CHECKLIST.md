# Major project progress checklist

Audit date: 11 October 2026. Target review: 28 October 2026.
Status: I = implemented with some recorded checks; P = partial; N = not built;
V = verification required. I does not imply clinical validation or release readiness.
The detailed chat report accompanies this file.

| Area | Status | Evidence and remaining work |
|---|---|---|
| Requirements/architecture | P | SRS, APIs, ERD, traceability and three-week plan exist; reconcile Android/prediction additions |
| Backend/database | I/V | FastAPI/PostgreSQL/pgvector, models/migrations, validation and health checks; production configuration and operations need release verification |
| Authentication | P | Real registration/password login/JWT/role gates; recovery, revocation, rate limits and session hardening pending |
| Consent | P | Versioned web/Android grant/withdraw flows and AI/speech API gates implemented; full data-sharing/retention review pending |
| Patient web | P | Profile, symptoms/chat, prescriptions, medication schedules/adherence, timeline/follow-ups; complete localization, edge cases and workflow QA pending |
| Worker web | P | Assigned patient records, medication verification, follow-ups and access checks; original-document access, corrections and AI summary evaluation pending |
| Chat/RAG | P | Real retrieval/generation, citations, conversation context and multilingual bridge; evidence coverage/faithfulness still insufficient |
| Triage | P | Deterministic multilingual emergency/urgent detection; exact source applicability, negation and false-negative review pending |
| Web voice | P | Recorded STT and TTS, cancellation/segmented playback; real-speaker testing, consent and continuous conversation pending |
| Android | P | Login/secure token, multilingual text chat, recorded STT/TTS, consent, profile, care records and prescription review implemented; 18 tests and Hermes bundle export; APK/device testing and remaining care/offline workflows pending |
| OCR | P | Real Tesseract image pipeline, human verification gates; handwriting/Indic accuracy, correction UI, PDF and evaluation pending |
| Medication reminders | N | Scheduling/adherence implemented; notifications/background delivery not implemented |
| Offline | N | No complete private cache, operation queue, conflicts or end-to-end sync |
| Research | P | Inventory/shortlist/source audit exist; candidate downloads/training/comparisons not completed |
| Disease prediction | N | User-approved research scope; no eligible disease-labelled dataset/model selected or trained |
| Security/reliability | P | Ownership/role tests and safe failures; release dependency, session, retention, load and operational audit pending |
| Deployment | N/V | Local development/build evidence; deployable release, TLS, monitoring, restore and rollback not verified |
| Final academic artifacts | P | Architecture/research docs exist; final measured report, demo, mobile artifact and reproducible release pending |

## Recorded checks

- Latest backend full run: 271 passed, three OCR fixture failures. Tests now explicitly select synthetic OCR; targeted OCR/candidate rerun: 14 passed. Full suite not rerun after test-only fix.
- Web: 74 passed, one optional live test skipped; TypeScript passed.
- Android: 28 tests, TypeScript and lint passed; Android JavaScript
  bundle exported. No installable APK/device evaluation claim.

Android prescription camera/gallery selection, preview, explicit upload and
navigation to review now implemented. Native device upload is not yet verified.
See ANDROID_PRESCRIPTION_UPLOAD.md.
- Prior synthetic live care flows and eight API contract checks passed.
- Prior Sarvam synthetic TTS->STT checks passed for three languages. This is
  connectivity evidence, not WER, accent quality or human pronunciation evaluation.
- Latest saved 15-question village-style text run includes refusals/provider
  unavailability; it does not show universally correct healthcare answers.
- Mobile dependency installation reported 28 advisories: ten moderate, eighteen
  high. Exploitability is not assessed; audit/remediation is a release task.

## Retrieval and corpus increment

- Existing live corpus: four documents; no new candidates promoted.
- Expansion inventory: 24 WHO fact sheets, HTTP availability checked; content,
  currency and reuse review, extraction, staged indexing and evaluation pending.
- E5/BGE candidate encoder adapter and read-only multilingual smoke script built.
  Five encoder tests pass; real E5 inference blocked by Windows Application
  Control rejecting a PyTorch DLL. No candidate quality result or live model switch.
- VLM OCR candidates identified; no VLM extraction runtime integrated.
- Latest web fixes prevent OCR metadata becoming medicine candidates, require
  complete medication fields before verification, separate request errors from
  retrieved evidence, and improve blood-pressure explanation evidence filtering.
  Broader medical faithfulness and real-speaker evaluation remain incomplete.

## Release gates

Latest privacy increment removes global persistent browser chat history and
cleans legacy keys at chat entry and authentication changes. Session changes
invalidate pending replies and reset visible chat/audio. Four privacy tests and
browser refresh/logout/relogin pass; refresh no longer restores visible history.
See EXECUTION_ACCEPTANCE_CHECKLIST.md for the requirement-level execution overlay.

1. Requirements traced to web/mobile implementation and tests.
2. Consent and ownership enforced at API boundaries.
3. Actual speech/device evaluation and failure recovery.
4. Reviewed medical evidence and traceable citations.
5. Research comparisons with held-out labels and reproducible artifacts.
6. Prediction only with eligible labels, measured limitations and no diagnosis claim.
7. Notification/offline workflows verified on devices.
8. Release dependencies/security/backup/restore/rollback validated.
9. Deployed web/backend and installable Android artifact demonstrated.
10. Final report distinguishes measured results, limitations and future scope.
