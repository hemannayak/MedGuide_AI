# Connected care workflows

Verified locally on 2026-10-03. This report supersedes the prescription/worker availability gaps in FRONTEND_REDESIGN_INTEGRATION.md. It does not claim production or clinical readiness.

## Implemented

- Prescription image upload, original OCR text review, medication candidate confirmation.
- Medication detail, explicit scheduling after verification, patient-reported intake history.
- Paginated account health timeline and patient follow-up list.
- Patient name and supported preferred-language editing with field-only audit metadata.
- Worker login role gate, assigned patient list, record review, medication confirmation, follow-up creation and completion/cancellation.
- Staff provisioning by a trusted local operator; administrator-only patient assignments. Workers may relinquish their own assignments; administrators may revoke a named worker assignment.
- Signed JWTs required in every environment; mock and invalid tokens no longer bypass authentication.
- Patient ownership for alerts and prescription links, scoped follow-up reads and writes, inactive-worker and revoked-assignment denial.
- Browser session hydration completes before login redirects, preserving tab-only sessions across refresh.

## Validation

- Backend: 235 tests passed against an isolated PostgreSQL test database; four existing HTTP 422 deprecation warnings.
- Frontend: production build passed, 44 generated pages plus dynamic detail routes. 58 tests passed with one opt-in live test skipped; the live API-contract suite separately passed all eight tests.
- Live local API: synthetic image -> real Tesseract -> pending candidates -> blocked scheduling -> explicit confirmation -> schedule -> recorded intake -> timeline.
- Live local API: synthetic administrator assignment -> assigned worker records -> future follow-up -> completed status -> patient visibility.
- Browser: signed-in patient profile save, prescription list/detail, and refresh session retention checked; worker assigned-patient list, record review, completed follow-up display, and refresh session retention also verified. Targeted lint passed for connected care pages and API utilities.
- Tests use explicitly synthetic accounts/documents. Local smoke accounts remain in the development database, with SYN identifiers. No real patient data was used.

## OCR limitations

Tesseract must be installed separately and TESSERACT_CMD configured where it is not on PATH. The local machine currently uses C:/Program Files/Tesseract-OCR/tesseract.exe. OCR_PROVIDER defaults to tesseract. Mock OCR is accepted only in APP_ENV=test; unavailable real OCR returns 503 without fabricated output or partial prescription records.

Accept JPEG/PNG/WebP images up to 10 MB. Image decoding verifies format and decompression safety. PDF is not supported by the current real gateway and returns 415. Uploaded files are kept in the backend private upload directory; storage paths are omitted from API responses. Persistence failure rolls back records and removes the newly written file.

OCR word confidence is measured by the engine, not a medication correctness probability. Entity scores are labelled heuristic_unvalidated. Handwritten prescriptions, medication extraction accuracy, and language-specific accuracy have not been experimentally evaluated. Regex extraction can include non-medication lines; incomplete candidates cannot be verified or scheduled. Original-document checking remains required.

## Staff setup

From backend/, with the local virtual environment:

```powershell
.venv/Scripts/python.exe provision_account.py ADMIN administrator-identifier
.venv/Scripts/python.exe provision_account.py HEALTHCARE_WORKER worker-identifier --name "Worker name"
```

Passwords are entered with getpass and never echoed. Existing accounts are not overwritten. There are no default production credentials and public registration stays patient-only.

Use the administrator's authenticated API session to assign a known worker user ID to a patient profile ID. Swagger at /docs exposes the request schema; do not grant access based on an unverified patient identity.

## Remaining work before production readiness

- Browser offline caches/queue, retry, duplicate prevention and conflict handling require end-to-end integration and tests; current connected workflows require online service access.
- Notification/reminder delivery is not implemented by these schedule/intake pages. Scheduling does not imply push, SMS or background notifications.
- Account recovery and email verification delivery remain unavailable and do not show fake success.
- Worker summaries are deterministic summaries of recorded data, not clinically validated AI summaries. Worker access to original prescription files and correcting uncertain OCR candidates require further work.
- OCR/RAG/speech/triage evaluation on documented datasets, false-negative review, and medical review remain necessary. No clinical accuracy is claimed.
- Deployment, HTTPS, operational backup/restore, upload retention/encryption, monitoring, authentication hardening and load/security testing remain required. No real-world clinical deployment is authorized by this work.
