# Android prescription upload increment

Requirement: FR-13, connected to FR-14/15 review. Date: 2026-10-11.

Care records now link to a dedicated Expo Router upload screen. Patient chooses
an image or requests camera permission on the explicit camera action, previews
it, confirms upload/storage/OCR permission and sends it through the existing
authenticated `/prescriptions/upload` multipart API. Success opens the existing
prescription review screen; medication confirmation remains a separate step.

No backend/schema changes. Expo SDK 57 image picker is a necessary native module
for this approved workflow and was installed with `expo install`. SDK docs:
https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/

Controls: image-only selection; local file/content URI; allowed JPEG/PNG/WebP;
known positive size no larger than 10 MB; no automatic upload; original filename
not transmitted; no base64 or EXIF metadata requested from the picker. These
options do not guarantee stripping embedded EXIF from image bytes. Existing
backend decoding/MIME validation remains authoritative. Unknown size or MIME
fails with a visible request to choose another image; HEIC/PDF not converted.

Permission denial, picker cancellation, repeated taps and unmount are handled.
Failed upload retains the selected image for review/retry. A timed-out request
may already have succeeded: UI tells patient to check care records before retry;
server upload idempotency remains unfinished. The confirmation is a UI gate,
not a new persisted consent record. Development copy requests synthetic data.

Recorded: 28 mobile tests passed; TypeScript and lint passed, including the final
effect lifecycle adjustment. Android Hermes export succeeded (2.8 MB bundle).
Tests cover upload validation/confirmation, multipart payload, invalid server
response, provider errors, camera denial, gallery cancellation, explicit review,
duplicate picker launch and unmounted late picker result.

Remaining release checks: installable native build and real phone/emulator;
camera/gallery behavior, URI/MIME/size metadata across devices, original-image
readability, large uploads, network interruption, session expiry and cache-file
retention/cleanup. Do not delete a user's original gallery photo for cleanup.
Adding policy text/checkboxes does not establish production privacy readiness.
Existing 28 dependency advisories remain unresolved (10 moderate, 18 high).
