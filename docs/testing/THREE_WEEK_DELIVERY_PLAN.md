# MedGuide AI: three-week delivery plan

Planning baseline: 7 October 2026. Target review: 28 October 2026.
This is a delivery target, not a claim that clinical validation or every external
dependency can be completed in three weeks.

## Scope and architecture decision

The user explicitly requested functional web and mobile applications, evaluated
disease prediction, and complete integration. This expands the earlier MVP.
Preserve Next.js, FastAPI, PostgreSQL/pgvector and existing provider adapters.
Add a mobile client consuming the same versioned API and authorization rules.
On 11 October 2026 the user confirmed a full-featured web application and an
Android-first, full-featured mobile client. Both use the same backend APIs,
authentication, database, trained models, RAG and speech services. Android-first
does not replace the web platform. iOS is not part of the current release target.
React Native/Expo SDK 57 was selected and the initial client implemented on
11 October; see docs/architecture/ANDROID_CLIENT_DECISION.md. Do not rebuild
working components.

The original 28 October target is retained; platform confirmation does not
restart the three-week clock. Java, adb and Flutter were not found on PATH in
the initial tooling check; the conventional Android SDK directory was absent.
These checks do not prove that no installations exist elsewhere.

Disease prediction is an evaluated research capability: possible-condition
outputs must not become definitive diagnoses, prescribing, or autonomous
triage. Emergency decisions remain independent of model availability. Determine
eligible datasets, target diseases, population, labels and intended use before
training. Existing QA/intent/retrieval datasets are not disease prediction labels.

## Evidence baseline

Historical checks from the previous development session: 255 backend tests
passed, 61 frontend tests passed with one opt-in skip, eight live API-contract
checks passed, and a production web build passed. These must be rerun against
the current checkout; they are not current release certification.

Implemented foundations include password authentication, patient/worker access
checks, consent/profile structures, patient and worker care pages, prescription
upload/OCR review, medication schedules/adherence, timeline and follow-ups,
RAG-backed chat, and authenticated recorded STT/TTS adapters. Completion must
be checked against requirements rather than inferred from this list.

Update on 11 October: 255 backend tests passed; 64 frontend tests passed with
one opt-in skip; three mobile contract tests, mobile TypeScript/lint and Android
JavaScript bundle export passed. Long-reply web audio segmentation and playback
cancellation are implemented. Android has login, encrypted token storage and
multilingual text chat. It is not a phone-tested APK or a completed mobile app.

Known open gaps: live conversation, real-speaker speech evaluation, speech
consent enforcement/quotas, model evaluation, broader reviewed medical coverage,
citation faithfulness, offline synchronization, mobile audio/care workflows,
session hardening, release deployment and backup/restore.

## Research traceability

| Resource | Planned role | Required next evidence |
|---|---|---|
| SAHA paper | User-requested retrieval design comparison | Identity/abstract verified; read full methods and compare applicable baseline |
| IHQID | Intent/entity understanding | Resolve reuse permission; inspect labels and language coverage |
| MedQuAD | Consumer QA evaluation/development | Preserve provenance; exclude restricted answers; split without leakage |
| IndicMSMARCO | General multilingual retrieval comparison | Check upstream terms; keep separate from medical evidence |
| MuRIL | Intent/entity encoder candidate | Eligible task labels, trained head, held-out per-language evaluation |
| IndicSBERT, E5-small | Retrieval challengers | Separate indexes, preprocessing, relevance labels and resource measurements |
| IndicTrans2 | Local query translation candidate | Gated access, pinned artifacts, negation/numbers/medicine-name preservation |
| Current MiniLM/Groq/Sarvam | Runtime baselines | Freeze configuration; measure quality, errors and quota dependence |
| Whisper and OCR shortlist | Local speech/OCR alternatives | Verify artifacts/licenses; compare on representative permitted data |
| Four local medical PDFs | Existing knowledge corpus | Resolve rights, superseded editions, exact source sections and applicability |
| Disease prediction resources | Research classifier | Exact dataset/model mapping not established; do not manufacture labels |

Use research_resources.json and RESEARCH_RESOURCE_ADOPTION.md as the initial
inventory. Create a disposition for every supplied resource: use, evaluate,
defer, or exclude, with reason. No unverified shortlist claim counts as a result.

## Week 1: foundations and vertical slices (7–13 October)

1. Audit requirements, code, research inventory and current tests; record endpoint
   ownership, missing implementations and runtime configuration without secrets.
2. Freeze release scope, disease-prediction intended use and mobile platform.
3. Validate authentication, consent, patient isolation and worker assignments;
   address session expiry/revocation and abuse controls.
4. Fix chat follow-up retrieval, source relevance and service failure reporting;
   establish reviewed retrieval/answer test cases in all three languages.
5. Build the mobile foundation: real login, profile and text chat against the
   shared API. Demonstrate an installable build on a physical target device.
6. Deliver a voice vertical slice: capture -> transcript confirmation -> safe
   chat -> spoken answer on web and mobile, with cancellation and visible errors.
7. Acquire only eligible research artifacts, record revisions/hashes/licenses,
   and prepare grouped train/validation/test splits.

Gate: real authenticated web/mobile API use; no fabricated audio/transcripts;
ownership tests pass; research dependencies and missing paper are identified.

## Week 2: AI, speech and care completeness (14–20 October)

1. Evaluate baseline and shortlisted retrieval/translation approaches, including
   the applicable SAHA method once identified. Promote only measured changes.
2. Train/evaluate the approved disease classifier with leakage checks, class
   imbalance analysis, uncertainty and out-of-distribution handling. Record
   per-class precision/recall/F1, confusion matrix and applicability limits.
3. Implement safe prediction API/UI with model/version metadata and worker review;
   source-backed escalation remains independent of predicted condition.
4. Implement continuous conversation turn handling, interruption, playback queues,
   microphone lifecycle and recovery. Compare speech providers/local alternatives.
5. Evaluate real consenting speakers in English/Hindi/Telugu, accents, code-mixing,
   quiet/noisy settings and different speaking styles. Measure WER/CER, medicine
   and symptom transcription errors, latency and human comprehensibility.
6. Complete prescription review, medication schedules/reminders/adherence, timeline,
   alerts and worker follow-ups on both clients; test authorization at the API.
7. Implement permitted offline caches and operation queue with idempotency,
   conflicts, retries, logout cleanup and synchronization status.

Gate: reproducible AI reports; no placeholder predictions; physical-device voice
and care flows; documented offline/online boundaries; no unsupported accuracy claim.

## Week 3: release, reliability and demonstration (21–27 October)

1. Run complete web/mobile flows and accessibility checks in three languages.
2. Exercise missing providers, quota errors, reconnects, interrupted uploads,
   denied microphones, corrupt documents and session expiry.
3. Measure latency/resource use and identify bottlenecks; set release thresholds
   from actual measurements and intended device/connectivity requirements.
4. Complete secrets/session/privacy audit, dependency locking, reproducible builds,
   environment checks, least-privilege deployment and TLS.
5. Deploy staging, test migrations and backup restoration, establish health checks
   and privacy-conscious monitoring; rehearse rollback.
6. Produce installable mobile artifact, web deployment, architecture/API/database
   documentation, research comparison reports, limitations and synthetic demo data.
7. Reserve the final two days for regression fixes and demonstration rehearsal.

Gate: clean-machine setup, deployed web/backend, installable mobile build,
restorable database, passing release checks and honest evaluation report.

## Feature completion checklist

Each item requires implementation, validation, error handling, security, tests,
documentation and applicable safety/evaluation evidence.

- [ ] Requirements/research inventory reconciled with all user-provided materials
- [ ] Architecture and API/database contracts reconciled with implementation
- [ ] Patient/worker/admin authorization and consent verified
- [ ] Web patient and worker flows complete
- [ ] Installable mobile client and real API integration verified
- [ ] English/Hindi/Telugu text and voice flows verified
- [ ] Real-speaker STT and human-listened TTS evaluation recorded
- [ ] Continuous voice conversation, cancellation and recovery verified
- [ ] RAG relevance, source currency/rights and citation faithfulness reviewed
- [ ] Disease prediction trained/evaluated with documented limitations
- [ ] OCR extraction and human review evaluated on representative documents
- [ ] Medication scheduling/reminders/adherence and follow-ups verified
- [ ] Offline cache/queue/conflict/retry behavior verified
- [ ] Security, accessibility, performance and reliability checks complete
- [ ] Deployment, backup restore and rollback rehearsed
- [ ] Final project report, reproducibility instructions and demo complete

## Execution constraints

Do not count a PWA/mockup as a separate mobile application if the agreed target
is an installable native client. Do not count synthetic TTS->STT as accent
evaluation. Do not count a successful HTTP response as a correct medical answer.
Provider quotas, data rights, gated access, hardware and clinical review are
dependencies to track, not reasons to fabricate a completed result. If these
prevent a feature meeting its gate, report the exact limitation promptly.
