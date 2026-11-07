# Backend voice transport and release status

## Decision

Keep FastAPI, PostgreSQL/pgvector, existing account/consent tables and existing chat orchestration. Add `/api/v1/voice/session` as an opt-in WebSocket endpoint. No frontend or mobile changes belong to this phase.

```mermaid
flowchart LR
  A[Authenticated audio session] --> B[Streaming STT and voice activity events]
  B --> C[Final transcript]
  C --> D[Existing deterministic safety gate]
  D --> E[Retrieval and evidence gate]
  E --> F[Existing model gateway]
  F --> G[Output safety and citation validation]
  G --> H[Written reply]
  H --> I[Spoken-consent check]
  I --> J[Incremental MP3 audio]
```

The full answer is validated before speech begins. This introduces generation latency but prevents unvalidated model tokens from being spoken. VAD speech-start and explicit interruption invalidate old audio. Synchronous model/database work drains before releasing a session; it cannot safely be killed mid-transaction. The most recent queued utterance is processed next. Written conversation history is not proof that the user heard every spoken word.

## API contract

Connect over WSS to `/api/v1/voice/session`. Enable `VOICE_STREAMING_ENABLED=true` only in a controlled test deployment. Default is false.

Within five seconds, send:

```json
{"type":"start","token":"<account access token>","language":"en","input":"audio","auto_respond":true}
```

Optional `conversation_id` must belong to the account. Languages: `en`, `hi`, `te`. `input:"text"` avoids opening upstream recognition. Tokens in query strings are rejected. Browser Origin must match `CORS_ORIGINS`; native clients still require a valid token. Account status and consent are rechecked during the session.

Audio input is binary **16 kHz mono signed PCM16 little-endian**, at most 3,200 bytes per frame (100 ms). Compressed recordings must use the existing upload STT route instead. Client capture needs echo cancellation; do not feed loudspeaker playback back into the microphone.

Client controls:

| Event | Purpose |
| --- | --- |
| `{"type":"text","text":"..."}` | Submit a typed or reviewed transcript, 1–2,000 characters |
| `{"type":"interrupt"}` | Stop current spoken output and invalidate its generation |
| `{"type":"input.flush"}` | Signal the end of a recording to upstream recognition; continuous capture normally uses VAD |
| `{"type":"ping"}` | Keep an otherwise idle client connection alive |
| `{"type":"close"}` | End the session |

Server events include `session.ready`, `transcript.partial`, `transcript.final`, `turn.thinking`, `turn.queued`, `turn.reply`, `audio.start`, `audio.chunk`, `audio.end`, `audio.stop`, and safe error codes. `turn.reply.reply` follows the existing AIChatResponse schema, including sources and deterministic response type. Audio chunks contain base64 MP3 fragments, sequence numbers and generation IDs. They are pieces of one MP3 stream, **not independent MP3 files**. Stop and discard stale generations on `audio.stop`.

When `auto_respond=false`, final recognition is displayed but not submitted until the client sends a reviewed `text` event. Partial transcripts never enter the medical reasoning pipeline. Empty partials are normal provider progress; empty final recognition produces `no_speech_recognized`.

## Consent and security

- `SPEECH_PROCESSING` is required before cloud recognition and throughout the session.
- `AI_PROCESSING` is required for non-emergency model processing. Existing deterministic emergency handling remains independent of that cloud consent.
- `SPOKEN_GUIDANCE` is required before TTS; declining preserves the written reply. The legacy `/speech/tts` endpoint now enforces the same requirement.
- Spoken consent withdrawal is checked during playback, at a two-second polling interval. Already transmitted audio must also be stopped by the client.
- Provider keys stay on the server. Provider response bodies and private transcripts are excluded from new transport logs.
- Maximum session duration: 300 seconds; idle input timeout: 45 seconds; 40 submitted turns; 10 MiB input; 100 frames/second. Process capacity defaults to four sessions and one per patient.
- Process-local quotas are insufficient for multi-worker/global enforcement. A shared admission/quota layer is a deployment prerequisite for scaling beyond the controlled single-worker configuration.
- New connections cannot interrupt another account's conversation. Disconnect cleanup waits for in-flight synchronous work to finish. Provider timeouts bound that work; Python threads are not forcibly terminated.

## Local alternative

`STT_PROVIDER=whisper_cpp` selects the batch local adapter for `/speech/stt`. Set `WHISPER_CPP_EXECUTABLE` and `WHISPER_CPP_MODEL` to administrator-controlled absolute paths. It requires a multilingual model for Hindi/Telugu and WAV PCM16 mono 16 kHz input up to 60 seconds. No cloud fallback is performed. One native process runs at a time, with a 90-second timeout and temporary-file cleanup. Temporary audio requires an encrypted, private temporary volume in deployment; cleanup is not a forensic secure-erase guarantee.

The downloaded official Whisper.cpp v1.9.2 Windows archive was SHA-256 verified (`49dcc16de826f20bd53d44f947a1ae49dfa81f86cad67a64d80820cb192d674a`). The multilingual base model was verified (`60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe`). Both live only in ignored `.model-cache/`. On this host, the executable exits before printing help with code `0xc0e90002`; its exact cause is not established. No Windows protection was disabled. Local transcription therefore remains **implemented and unit-tested, not runtime-verified**.

## Deployment and reproducible validation

Use the existing PostgreSQL/pgvector database migrations and environment template. Keep all secrets server-side. Configure explicit origins, strong JWT secret, production environment and debug=false. Existing production configuration rejects mock providers.

From `backend/`:

```text
python -m pip install -r requirements.txt
python -m pytest -q
python -m app.db.expand_patient_education --index-reviewed-education
python -m app.db.evaluate_patient_education
uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1 --ws-max-size 16384 --ws-max-queue 8
```

Do not restart an existing server merely to run a probe. Use a separate controlled process or TestClient. Production ingress must terminate TLS, support WebSocket upgrades, enforce connection/rate limits, disable sensitive body logging, and avoid buffering streamed audio. Back up the database before corpus imports. The index import is transactional and rerunning the same version adds no duplicate documents.

Hosted probes are explicit and consume credits:

```text
python -m app.db.probe_speech_runtime --allow-provider-usage
python -m app.db.probe_voice_pipeline --allow-provider-usage
```

These use synthetic input and must never be placed in ordinary CI. No subscription or top-up is performed.

## Verified on 3 November 2026

The complete backend suite passed: **378 tests**, four existing Starlette deprecation warnings, 44.33 seconds. The real authenticated English audio probe completed STT, retrieval, configured model generation, citation-bearing reply and streamed TTS. First reply audio arrived 8,290.67 ms after input began; this is a successful cold-path integration probe, not a low-latency production claim. See `docs/testing/voice-pipeline-smoke-20261103.json`.

Separate real provider probes completed TTS and batch STT for English, Hindi and Telugu. These use synthesized questions, not representative human speech or a listening-quality evaluation. Explicit VAD timing (500 ms silence, 250 ms minimum speech, 300 ms prefix padding), trailing silence and input flushing were tested after short recordings initially stalled. Empty partial transcripts are valid provider progress and are now ignored safely. The earlier failed realtime report is retained as failure evidence; the later complete-pipeline report records the successful run.

## Release gates still open

Realistic multilingual recordings and listening review; word/character error rates including medicine names and negation; representative RAG relevance/faithfulness evaluation; clinician review and Indian applicability review; end-to-end concurrency/load tests; distributed quotas; deployment backup/restore and monitoring checks; local native runtime troubleshooting; hosted-provider retention/contract review. A successful synthetic conversation does not establish production or clinical readiness.
