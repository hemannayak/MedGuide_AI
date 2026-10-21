# Android prescription review increment

## Requirement and contract

Patients can open their prescription records, inspect OCR text and extracted
medications, and deliberately confirm matching details against their original
prescription. This supports prescription understanding and human verification.
No new clinical rule, provider, dependency, database schema or backend route is
introduced.

Reads use authenticated `GET /prescriptions` and `GET /prescriptions/{uuid}`.
Explicit confirmation uses existing `POST /medications/{uuid}/verify`. Backend
patient ownership and incomplete-detail checks remain authoritative. Android
also rejects invalid references, missing original-document confirmation,
incomplete extraction and already-verified records before submission.

## Interface and uncertainty

Care records show individual prescription status and extracted-medication count.
Detail screens show prescription date, processing status, raw OCR text and
recorded medicine name, dosage and instructions. Missing text or medication
records request human review. Extraction is not automatically confirmed.
Each eligible record requires an initially-off review switch before submission.
Confirmation records the patient's comparison; it is not clinical validation.
No automatic correction, medication scheduling or dosage change occurs here.

Loading and API failures remain visible. Reload clears old data and review
selections. Navigating to a different record resets review state; late responses
cannot update a departed screen. A synchronous request lock prevents repeated
confirmation submissions from rapid taps.

## Verification and remaining work

Mobile tests: 18 passed, including invalid references, explicit-review gating,
incomplete-record rejection and the existing verification API contract.
TypeScript, lint and Android Hermes bundle export passed. Bundle export is not
an APK build or physical-device check. These tests validate client/service behavior; they
do not measure OCR accuracy or establish clinical correctness.

Android upload/camera/gallery selection, original-image delivery, correction
workflow, scheduling/adherence and notifications remain subsequent increments.
Physical Android user-flow testing remains required. The review screen uses
English labels; localized labels and low-literacy usability need evaluation.
