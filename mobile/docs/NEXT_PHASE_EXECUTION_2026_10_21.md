# Mobile refinement and continuity increment — 21 October 2026

## Audit and boundaries

Continued the existing Expo 57 / React Native 0.86 / Expo Router application, FastAPI API, PostgreSQL and patient authorization. Preserved existing working website and background services. Existing recent commit: `2b923e6` authentication carousel and OTP foundation. There are extensive pre-existing uncommitted changes; no reset or broad rewrite was performed.

The four carousel images, password login, development OTP flow, registration → permissions → Home, multilingual recording/transcript review, consent, prescription upload and explicit medication confirmation already existed. Major gaps found: unconfigured SMS dispatch, no email adapter or credential, missing local notifications, no persistent offline care reads, no pending OCR correction API, a walkthrough hiding before save confirmation, and an OTP test reusing a fixed database identifier.

## Implementation checklist

- [x] Remove only the numbered image badge; retain all four distinct images, headings, descriptions and pagination.
- [x] Bundle optimized WebP versions of the first three slides, preserving originals. Measured byte sizes: 991862→154638, 864518→109322, 965082→144082.
- [x] Allow header wrapping, larger language/dot targets and wrapping carousel text. Respect all root safe-area edges. Pause autoplay on app background and reduced-motion changes.
- [x] Keep Home tracking after Type a question and before prescription/care cards; remove the Health overview section. Targets remain in Profile.
- [x] Contextual walkthrough with previous/next/skip/replay and optional speech; await completion persistence, lock duplicate saves and show retryable failures.
- [x] Remove the exclusive help-codeword implementation. Keep shared speech synthesis, ordinary voice chat and read-reply controls.
- [x] Native notification permission explanation, decline handling and phone-settings route. Existing microphone/camera APIs remain; image selection uses the system picker rather than blanket library access.
- [x] Install SDK-compatible `expo-notifications`; no paid push service required for local reminders.
- [x] Local generic medication reminders use existing VERIFIED, ACTIVE schedules only. Explicitly limited to today/tomorrow and matching device timezone; missing/invalid timing or timezone mismatch creates no invented reminder. Device settings may delay delivery. No exact-alarm or full background-delivery guarantee.
- [x] Opt-in care/timeline snapshots using native encrypted SecureStore chunks (400 characters, max 96 chunks) or browser session storage. Snapshots are bound to a hash of the current authenticated session, show per-resource save times, clear on logout, and fall back only on network/abort failures. Server authorization/rejection errors never select stale fallback. No offline writes or claim of offline AI/OCR.
- [x] Pending OCR correction API/UI with original-document acknowledgement, validation, patient ownership, row lock and safe audit metadata. Corrections remain PENDING; confirmation and scheduling are separate actions.
- [x] Prescription photo framing instructions and explicit upload/OCR consent retained. No automatic clinical correction.
- [x] Recording activity animation (not measured audio amplitude), reduced-motion cleanup and clear emergency-response indication using existing backend response type.
- [x] Settings language changes save through the existing patient-profile API.
- [x] Server-only Gmail SMTP adapter with STARTTLS, authenticated sender, credential omitted from repr and safe errors. No public send endpoint and no authentication bypass. Not yet wired to a new email-verification workflow.
- [x] Production phone OTP fails explicitly when no SMS provider exists; development UI identifies test codes rather than claiming real delivery.

## API change: pending OCR transcription correction

`PATCH /api/v1/medications/{medication_id}/ocr-correction`

- Authentication: existing bearer session; authorization: current patient's owned medication.
- Request: `medicine_name` (1–255), `dosage` (1–100), optional `instructions` (up to 2000), `checked_original: true`; extra fields rejected.
- Response: existing StandardResponse containing MedicationResponse; status remains PENDING.
- Errors: 401 authentication, 404 missing/not owned, 409 already verified or no prescription link, 422 invalid fields or missing acknowledgement.
- No schema migration. Existing verification, prescription and scheduling API contracts are preserved. No new medical rule is introduced.

## Email and phone delivery

Intended sender: `viala.health@gmail.com`. Configure `SMTP_PASSWORD` only in the untracked backend/deployment environment, alongside the documented host, port, username and sender. No credential was available during this increment and no email was sent. A phone number is not an email recipient; Gmail does not provide SMS OTP dispatch. Development OTP auto-fill does not prove phone ownership. Rotate any app password exposed in conversation and provision the replacement directly in the backend environment.

References: [Google app passwords](https://support.google.com/mail/answer/185833), [Expo 57 notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/). Expo package source was checked for notification date-trigger and crypto interfaces.

## Verification so far

- Mobile regression suite: 72 passed (including encrypted-storage adapter mocks, cross-session isolation, no auth fallback, pending correction behavior, notification denial/timing, multilingual voice boundaries, consent, picker cancellation and walkthrough retries).
- TypeScript passed. Lint is being rechecked after final edits; existing unused-state warnings are tracked separately.
- Backend targeted correction/wellness/email tests: 11 passed.
- Full backend initial run: 329 passed / 1 failed due fixed OTP test-data collision. Isolated synthetic OTP fixture fixed; targeted OTP rerun: 2 passed. Full rerun pending at this point.
- Expo production web export and development review export succeeded. This is build validation of the React Native Web target, not a signed Android production release.
- Browser live: actual password login against review backend succeeded; Home data loaded; all four contextual walkthrough steps and server-confirmed completion verified. Care/timeline and final asset verification ongoing.
- Phone `moto_g45_5G` detected and authorized. Android rebuild ongoing; initial dependency-cache misses and one download reset were retried using the populated project cache. Do not claim the new APK has been installed until install success is recorded.

Additional review services, to preserve the user's existing processes: backend on loopback 8002; exported mobile review on loopback 8085; separate native Metro on 8086. No existing server was stopped. Review exports are development-only; release HTTPS enforcement remains intact.

## Remaining acceptance work

- [ ] Live Gmail delivery with authorized recipient and securely configured credential; actual email-auth workflow still requires an explicit implementation.
- [ ] Real SMS dispatch provider and phone-ownership verification (no paid dependency selected).
- [ ] Installed updated APK, OS denial/permanent-denial dialogs, device notification receipt, foreground steps and microphone capture.
- [ ] Native offline-cache recovery and shared-device/logout validation; browser fallback and adapter tests are not device encryption validation.
- [ ] Real English/Hindi/Telugu speech quality and WER evaluation; tests do not establish clinical validation.
- [ ] Production signing, HTTPS endpoint configuration, security/dependency audit remediation, and full web/mobile feature parity.
- [ ] Walkthrough copy currently English; existing setup and speech language options remain available.
