# Conversational responses and reliable web speech

Updated 2026-10-11. Requirements: FR-06, FR-24, FR-25 and reliability.

The shared grounded response prompt now requests warm, respectful everyday
language, a direct answer, two to four short sentences where suitable and one
clarifying question at a time. It explicitly forbids false reassurance,
impersonating a human/clinician, invented observations and altered medicine
names, numbers, units or negation. Existing evidence, refusal, medication and
emergency safeguards are unchanged. This changes generation instructions, not
the model, API, medical rules or database.

Web chat stores each reply's returned supported language in memory. Read-aloud
uses that language even after the workspace language changes. Missing or invalid
provider language falls back to the request language. Android already retains
the request language per turn; backend language-contract divergence is a future
check. This increment does not introduce a new TTS voice or claim human listening
validation. Natural pronunciation, prosody and comprehension remain unevaluated.

Service/network failures restore the submitted question when the composer is
empty, without overwriting newer edits. Cancelled/account-changed requests still
cannot restore private data into a new session.

Evidence: 22 chat-policy tests pass, including three language-specific prompt
safety checks. Three new web tests verify service/network recovery and a Hindi
reply spoken in Hindi after switching the UI to Telugu. Complete web suite:
74 passed, one optional live check skipped; TypeScript passes. Backend restarted
with the updated prompt. Prompt assertions establish instructions, not actual
response accuracy, empathy or clinical validation.

Live synthetic check after restart: chat HTTP 200 / INFORMATIONAL / four source
records; en/hi/te TTS produced nonempty audio and STT returned transcripts; absent
and withdrawn speech consent returned 403. Saved evidence is
evaluation/connected_check_results.json. These are connectivity and consent
checks, not accent/WER/faithfulness/voice-naturalness evaluations.

Remaining: measured native-speaker comprehension/TTS quality; provider refusal
wording; complete audio conversation/interruption; Android care workflows,
reminders, offline synchronization, corpus evaluation and deployment. See the
execution acceptance checklist for requirement-level status. No full-project
completion claim.
