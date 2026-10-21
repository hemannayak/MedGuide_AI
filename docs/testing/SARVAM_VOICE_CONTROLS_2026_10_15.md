# Sarvam voice controls — 15 October 2026

Scoped side-conversation increment: existing speech adapter only; no provider
switch, service restart, model download, paid call or migration.

- Bulbul pace is configurable using `SARVAM_TTS_PACE` (default 1.0). Constructor
  override supports isolated tests. Values must be finite and within 0.5–2.0.
- Empty/non-string STT transcripts fail with a recovery message instead of
  becoming successful empty input. Nullable detected language uses the requested
  language. Native-script transcription and medical text remain unchanged.
- Added synthetic provider-contract cases covering bad configuration, pace/text
  preservation, malformed transcripts and native-script negation preservation.

Changing pace does not establish naturalness or intelligibility. Real-speaker
STT evaluation, human-reviewed TTS clarity, continuous conversation, Android
device checks and Sarvam document/VLM integration remain pending.

Validation: 19 focused unit tests passed, six API/authentication cases deselected.
The initial combined run stalled during API-dependent tests and was interrupted;
no end-to-end API pass is claimed. No live Sarvam request was made.

References checked 15 October 2026:
https://docs.sarvam.ai/api-reference/text-to-speech/convert
https://docs.sarvam.ai/api/api-guides-tutorials/text-to-speech/bulbul-v3-best-practices
https://docs.sarvam.ai/api-reference/speech-to-text/transcribe
