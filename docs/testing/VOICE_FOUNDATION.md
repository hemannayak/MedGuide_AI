# Voice foundation integration - 2026-10-03

This increment completes safer recorded voice input and automatic spoken replies after voice questions. It does not implement continuous listening, silence-based turn detection, streaming, or hands-free live conversation.

## Changes and impact

- STT/TTS now require signed authenticated sessions. Speech adapters execute in a threadpool rather than blocking the async endpoint.
- Audio reads are bounded to 10 MB plus one byte. Supported media types and the three supported languages are validated.
- Microphone denial, network failure, and empty transcription do not create sample symptoms. Errors remain visible and recording is retryable.
- Browser recording keeps its real MIME/codec; the API chooses the matching filename extension and the Sarvam gateway forwards a matching multipart media type.
- Microphone tracks stop immediately after recording, before transcription waits.
- Voice questions request spoken replies automatically. Beginning another recording stops current playback. Recording controls are disabled while a chat request is processing.
- Sarvam Bulbul v3 REST uses text, language_code, output_audio_codec=mp3 and 24000 Hz, with a compatible default speaker. Entire supported text is sent without the previous 500-character truncation.
- Missing real speech configuration fails closed. Mock speech is restricted to APP_ENV=test.
- Missing provider confidence remains null rather than a fabricated score.
- Upstream speech errors are sanitized in public responses.

## Validation

Backend suite: 238 passed after MIME/language validation. Frontend: 61 passed, one opt-in integration test skipped. Production build passed. Regression tests cover microphone denial, transcription failure, codec retention, authentication, mock rejection and complete TTS payload.

The opt-in live_speech_smoke.py --run command succeeded with the configured Sarvam account for English, Hindi and Telugu, generating synthetic greetings and transcribing the generated audio. No patient data was sent. Non-empty audio/transcripts establish provider connectivity only, not speech recognition accuracy, pronunciation quality, clinical quality, or real microphone end-to-end success.

Official contract: https://docs.sarvam.ai/api-reference/text-to-speech/convert

## Remaining

Continuous live conversation, streaming STT/TTS, turn detection, cancellation of in-flight generation, speech quotas/rate limits, cloud-processing consent enforcement, recording lifecycle/device evaluation and language-specific benchmark evaluation remain outstanding. TTS requests currently support up to 2000 characters; longer chat replies need chunked playback. Browser speech fallback remains device-dependent. Sarvam OCR is not added by this increment; local Tesseract remains the existing document provider.


## Running endpoint retest

The full backend suite passed 238 tests, frontend suite passed 61 (one opt-in test skipped), and the opt-in live API-contract suite passed all eight tests. Initial running speech requests returned 503 because the backend process had restricted outbound networking (WinError 10013). Restarted the loopback-only backend with approved outbound access and retested actual authenticated HTTP speech endpoints with synthetic greetings. This is an execution-permission issue, not provider accuracy evidence. Physical microphone capture and human listening quality are not verified by these synthetic automated checks.
