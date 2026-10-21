# Execution acceptance checklist

Updated 2026-10-11. Existing requirements remain in SRS and MASTER_TRACEABILITY_MATRIX.
This execution overlay corrects historical implementation/test labels; an API
test does not establish a complete user journey or clinical validity.

Statuses: NOT STARTED, PARTIAL, IMPLEMENTED, VERIFIED, BLOCKED. VERIFIED applies
only to the explicitly named check. Each journey requires authorized requests,
validation, visible loading/empty/error states and recovery; device verification
is still outstanding for every Android journey.

| Requirement / acceptance | Web | Android | Backend/database | Evidence and remaining work | Overall |
|---|---|---|---|---|---|
| FR-01 register patient without elevated role | Registration exists | Registration pending | Auth/user/profile creation and role restriction | Web registration contract checks; Android registration flow pending | PARTIAL |
| FR-02/03 login/logout and deny cross-user access | Session gates and logout | Secure token login/logout | JWT and roles/ownership | Session/authorization tests; revocation/recovery/rate limits pending | PARTIAL |
| FR-04 grant/withdraw consent before processing | Consent UI | Consent UI | Versioned AI/speech gates and consent records | Live speech grant/withdraw checks; data sharing/retention review pending | PARTIAL |
| FR-05 edit own profile/language | Profile UI | Profile UI | Patient GET/PATCH | Contract checks; language synchronization/full localization pending | PARTIAL |
| FR-06 health companion explains with supported evidence | Text chat and speech | Text chat and speech | Conversation/message storage and provider gateway | Synthetic/browser checks; faithfulness benchmark and request recovery pending | PARTIAL |
| FR-07/08 symptom report without invented values | Structured symptom form | Dedicated symptom flow pending | Symptom records and analysis | API safety checks; guided clarification and Android flow pending | PARTIAL |
| FR-09/10 sourced safety escalation | Emergency display/actions | Chat emergency response | Deterministic rules and alerts | Synthetic emergency checks; negation/false-negative/source review pending | PARTIAL |
| FR-11/12 traceable knowledge retrieval | Evidence display | Source display | Approved document/chunk retrieval | Four live sources; 24 candidates not promoted; broader benchmark pending | PARTIAL |
| FR-13 upload valid private prescription | Image upload | Camera/gallery, preview, explicit upload and review navigation implemented | Private image storage, validation, OCR | 28 mobile tests; native device/URI/upload verification and original-image access pending | PARTIAL |
| FR-14/15 review extraction before use | OCR/review safeguards | OCR/review safeguards | OCR results and pending medication gate | OCR fixture tests; corrections, handwriting/Indic evaluation and PDFs pending | PARTIAL |
| FR-16 manage verified medication | Medication screens | Viewing/review | Medication ownership and verification | API checks; complete mobile management pending | PARTIAL |
| FR-17 deliver reminders, not just save schedule | Schedule UI | Delivery pending | Schedule records | Schedule tests do not prove notification delivery; background notifications pending | PARTIAL |
| FR-18 record adherence once with retries | Adherence UI | Pending | Adherence records/APIs | API checks; mobile flow and retry/idempotency verification pending | PARTIAL |
| FR-19 timeline of own records | Timeline UI | Pending | Timeline entities/APIs | Prior synthetic care checks; Android and empty/error journey QA pending | PARTIAL |
| FR-20/21 assigned worker reviews and summarizes patient | Worker screens | Scope reconciliation pending | Assignment authorization and summary service | Ownership tests; summary clinical faithfulness and original records pending | PARTIAL |
| FR-22/23 follow-ups and alerts | Screens/APIs connected | Follow-up viewing | Follow-up/alert ownership | Prior API checks; complete edits/mobile alerts/recovery QA pending | PARTIAL |
| FR-24/25 understandable multilingual voice | en/hi/te recorded speech | en/hi/te recorded speech | STT/TTS and consent | Synthetic connectivity only; real-speaker WER/TTS review and continuous conversation pending | PARTIAL |
| FR-26/27 explicitly limited offline/sync | No complete private offline queue | No complete offline queue | Sync contracts need review | Retry/conflicts/idempotency/private cache pending | NOT STARTED |
| Research: compare embedding candidates | Existing live model unchanged | Shared server retrieval | Isolated E5/BGE adapter | Five tests pass; E5 real inference blocked by Windows DLL policy | BLOCKED |
| Research: evaluated disease prediction | No validated feature | No validated feature | No selected/trained eligible model | Dataset/license/labels/held-out evaluation required; never substitute dummy scores | NOT STARTED |
| NFR privacy: shared-device chat isolation | Legacy persistent chat removed; in-memory reset | No persistent chat cache identified in shared API | Existing ownership rules unchanged | Four privacy tests and browser refresh/logout/relogin pass; broader storage audit pending | VERIFIED |
| Release web/backend/Android | Development build/runtime | Hermes export, no APK | Local services | Deployment/TLS/restore/rollback/load/dependency remediation and device tests pending | PARTIAL |

## Current increment: shared-device chat privacy

Decision: remove the globally keyed browser chat cache. It had no user ownership
and could expose a previous patient's conversation on a shared device.
Alternatives: user-scoped storage or authenticated server history retrieval.
Persistent storage still needs retention/offline-consent design; authenticated
history retrieval is the next continuity option. No schema/API changes.

Visible behavior: refresh/navigation clears the local visible conversation;
backend conversation records remain governed by existing authorization and
retention behavior. This change does not delete server-side health records.
Logout and account changes clear legacy chat keys in both browser storage areas.
Session changes reset visible messages/drafts/audio and invalidate pending replies.

Evidence: chat-cache-privacy.test.mjs verifies account-change cleanup, legacy
key removal, restricted-storage tolerance and suppression of a previous-account
pending reply. TypeScript and complete web regression results are recorded in
the accompanying progress report. No physical-device or clinical claim.

Actual checks: 71 web tests passed, one optional live test skipped; TypeScript
passed. Browser synthetic account: refresh removed old cached conversation,
synthetic greeting submitted, logout redirected to login, and relogin opened an
empty chat. Screenshot: evaluation/web-chat-privacy-2026-10-11.png. Pending reply
after account change was tested with a controlled asynchronous response in unit
tests, not a timed live browser race. Cross-account browser test and audio race
remain follow-up checks. Local web HTTP returned 200; successful UI sign-in and
chat request confirmed backend connectivity. `/health` is not a verified health
endpoint, and its failed probe must not be interpreted as server downtime.

## Next executable priorities

1. Verify browser account-switch/logout and pending response/audio behavior.
2. Complete authorized history retrieval and recoverable chat requests.
3. Device-verify implemented Android upload; complete authorized original-image viewing.
4. Review corpus reuse/currency, stage clean extraction and labelled retrieval tests.
5. Complete reminders/offline with device evidence, then release gates.

External dependencies: compatible candidate inference runtime, Android SDK/device,
consented human speech evaluation and permitted deployment environment. Keep
independent development progressing when any one dependency is blocked.
