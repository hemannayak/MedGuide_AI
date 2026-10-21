# Consent enforcement and transcript review — 11 October 2026

Implements FR-04/FR-05 and SEC-05 incrementally. Ordinary AI chat requires a
current AI_PROCESSING grant. Speech STT/TTS requires a separate SPEECH_PROCESSING
grant. Both fail with 403 before invoking providers. Existing deterministic chat
emergency detection remains available without cloud consent; it does not call
generation. This does not complete consent enforcement for every care workflow.

Version 1.0 and known scope/status values are validated. Grant/withdraw actions
are audited without medical narrative. Withdrawal removes all active grants in
the selected scope so duplicate historical grants cannot revive access. Another
patient cannot withdraw the owner's consent. Re-grant remains possible.

Connected web /app/consent and Android /consent screens permit explicit grant
and withdrawal. Nothing is preselected. Speech is optional independently of
text. Notices disclose external processing and do not promise unknown provider
retention. Final provider terms and translated consent notices need review.

Web recognized speech now fills an editable draft and displays a review notice;
it is not automatically sent to chat. User presses Send after reviewing, then
receives the existing spoken-reply flow. This addresses meaning-critical STT
errors but is not proof that transcription is accurate.

Backend validation: 258 passed with four existing deprecation warnings. Includes
provider-not-called, duplicate-withdrawal, patient isolation, schema validation
and emergency bypass. Web and mobile type/lint/contract checks recorded in the
development turn. Physical-device and clinical review remain pending.

Existing live smoke scripts/accounts must explicitly grant required scopes
before ordinary chat or speech tests. This is an intentional API behavior change;
do not disable enforcement to make old smoke tests pass.
