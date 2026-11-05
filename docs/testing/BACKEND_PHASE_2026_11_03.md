# Backend phase implementation evidence — 3 November 2026

## Scope and implementation

Backend only. Existing FastAPI, PostgreSQL/pgvector, authentication, consent records, deterministic triage and chat orchestration were retained. Existing unrelated dirty files and running services were preserved. No frontend/mobile changes were made in this phase.

- Added 29 attributed CDC educational resources, 347 chunks, source snapshots, hashes, jurisdiction and reuse metadata. Transactional import is idempotent: the November rerun added zero documents/chunks. Total corpus: 33 documents / 7,107 chunks. These sources are not Indian clinical policy.
- Pinned the existing multilingual MiniLM encoder revision, validated vector dimensions/finite values, guarded chunk parameters, and suppressed weak multilingual fallback evidence when translation is unavailable.
- Added authenticated `/api/v1/voice/session`, streaming recognition, validated-chat-to-streamed-audio integration, interruption generations, bounded input/session limits, queued turns, ownership and consent enforcement. Legacy TTS now also requires spoken-guidance consent.
- Added optional local Whisper.cpp batch recognition without automatic cloud fallback. Its runtime remains blocked by an unexplained native exit on this host.
- Recorded Outpero, Sarvam and local-model research, deployment requirements and costs. Hosted services remain optional; no purchase or subscription was made.

## Validation

| Check | Observed result | Limit |
| --- | --- | --- |
| Full backend pytest | 378 passed, 4 existing deprecation warnings; 44.33 s | Automated tests do not establish clinical validation |
| Corpus rerun | Zero duplicate additions | Source supersession policy still needed for future revisions |
| Retrieval topic probes | 11/12 hit at five | Small synthetic set; Telugu dengue probe failed; no accuracy claim |
| Real provider TTS → batch STT | English, Hindi, Telugu completed | Synthesized speech, not human accent/WER or listening tests |
| Authenticated audio → STT → RAG/model → TTS | English completed, informational reply with real source IDs | One synthetic question, cold path |
| Complete-pipeline timing | Final transcript 2,758.94 ms; generation 5,198 ms; first reply audio 8,290.67 ms from input start | Not satisfactory evidence of low-latency production performance |
| Interruption/failure handling | Automated tests cover stale audio, duplicate finals, empty partials and flush forwarding | Real noisy duplex audio remains untested |
| Local Whisper.cpp | Adapter tests passed; executable exits `0xc0e90002` even for help | No successful local transcription; cause unknown |

The live question was synthetic handwashing guidance. Its response cited the archived CDC handwashing source, whose text supports the stated steps and sanitizer threshold. This spot check is not a systematic faithfulness evaluation. The synthetic account and conversation were deleted after the probe. No real patient conversation was used.

Evidence: `patient-education-retrieval-20261023.json`, `speech-provider-smoke-20261103.json`, `voice-pipeline-smoke-20261103.json`. The older `realtime-stt-smoke-20261103.json` records an initial failure, not the final pipeline status. Initial short recordings stalled; explicit VAD parameters and sufficient trailing silence resolved the tested case. Empty provider partials required a parser fix.

## Main affected modules

`app/services/publisher_articles.py`, `knowledge_service.py`, `ai_service.py`, `translation_service.py`; `app/db/expand_patient_education.py`, `evaluate_patient_education.py`; `app/services/realtime_speech.py`, `voice_account.py`, `local_speech.py`, `speech_service.py`; `app/api/v1/endpoints/voice.py`, `speech.py`, `app/api/deps.py`; configuration, environment example, requirements, probe scripts and regression tests. Paths are relative to `backend/`.

Architecture/API/deployment: `docs/architecture/VOICE_BACKEND_2026_11_03.md`. Technology/licensing/cost decision: `docs/research/VOICE_PLATFORM_EVALUATION_2026_11.md`. Research candidates were inventoried rather than indiscriminately deployed or mixed into the production vector space.

## Not complete / release gates

Representative multilingual human recordings, medicine-name/negation error analysis, listening review, stronger held-out retrieval and grounded-response evaluation, clinician/Indian applicability review, production concurrency/load tests, distributed admission quotas, retention/contract review, backup/restore drills and operational monitoring remain open. Local speech must run successfully before claiming a fully local voice option. Gated models require legitimate access and evaluation. Streaming stays disabled by default pending controlled deployment; no running server was restarted to enable it.

This phase demonstrates working integration and regression coverage. The entire system is **not declared production-ready or clinically validated**.
