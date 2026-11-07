# Backend completion phase

Frontend and mobile changes are paused. Preserve existing uncommitted work and running processes.

## Audit and priorities

1. Preserve FastAPI, PostgreSQL/pgvector, JWT patient ownership, existing consent records, deterministic emergency routing, provider gateways and manual OCR verification.
2. Expand four-document evidence coverage with 25–30 authoritative patient-education resources. Existing WHO candidates have unresolved reuse terms; MedQuAD has 104 staged documents and must not be imported indiscriminately or used as both index and held-out evaluation data.
3. Improve section/context preservation, reproducible model metadata, content hashes, safe reruns and retrieval evaluation before claiming quality improvements. Existing index metadata lacks encoder identity; three sampled re-encodings matched the current multilingual MiniLM encoder. Do not mix candidate embedding spaces.
4. Reuse Sarvam REST STT/TTS, local Ollama, current conversational prompt and language support. Add bounded, authenticated conversational transport with cancellation and incremental validated audio delivery. Never stream unvalidated medical model tokens to speech.
5. Evaluate optional local speech backends and provider streaming against actual hardware and language samples. Do not claim human-like quality, WER or production latency without representative recordings and listening review.
6. Add end-to-end tests, operational limits, safe error reporting, deployment documentation and a release-readiness checklist. A passing synthetic test suite does not establish clinical validation.

## Architecture impact before implementation

Corpus expansion adds rows to existing medical_documents/knowledge_chunks tables and preserves the old corpus. Reviewed imports must be transactional, idempotent and independently reproducible. No schema replacement or candidate encoder migration is planned. Source jurisdiction, reuse basis, extraction version, hash and model identity belong in existing metadata.

Voice transport is an additive API. Existing upload STT, TTS and chat contracts remain. Conversation ownership, account status, language validation, processing consent and spoken-guidance preference must be checked before relevant operations. Disconnect/cancellation must prevent late audio delivery. Output is generated and safety-validated through existing chat orchestration before sentence audio is sent. This trades some latency for healthcare safety; it is not raw model-token streaming.

Paid Sarvam/Outpero features remain optional. No subscription or purchase is authorized. Local models are evaluated per task, not all deployed simultaneously. Any US/UK educational source must retain jurisdiction and must not become India-specific emergency, dosage or referral rules.

## Existing research disposition

The available user inventory is docs/research/USER_RESOURCE_INVENTORY.md and docs/data/research_resources.json. Current models and experiments include multilingual MiniLM-L12, multilingual E5-small, bge-m3 candidates, MuRIL, IndicSBERT, gated IndicTrans2, MedQuAD, SAHA and Indic datasets. Use these for their documented task only. Benchmark datasets are not automatically trusted clinical evidence. Research artifacts unavailable from these inventories require the user to supply exact identifiers before integration.

## Completion checklist

- [x] Initial repository, corpus, speech and research inventory audit
- [x] Record architecture impact and preserve working components
- [x] Acquire and verify 29 additional CDC educational resources; clinical/Indian applicability review remains open
- [x] Integrate section-preserving ingestion/retrieval and run 12 topic probes (11 hits at five; not clinical accuracy)
- [ ] Evaluate candidate models without embedding-space contamination
- [x] Research Outpero/Sarvam/local speech licensing and architecture
- [x] Implement and test integrated conversational voice transport; real English pipeline completed
- [ ] Measure representative multilingual complete-pipeline quality, concurrency and resource use (one synthetic cold-path latency measured)
- [x] Document deployment, cost, privacy and remaining release blockers

3 November update: 29 documents and 347 chunks added; corpus totals 33 documents and 7,107 chunks. Rerunning the import added zero duplicates. Full backend suite: 378 passed. Hosted speech probes succeeded in en/hi/te; local Whisper.cpp adapter is unit-tested but its Windows executable exits before initialization. See `docs/testing/BACKEND_PHASE_2026_11_03.md` for evidence and unfinished gates.

This is an execution ledger, not a production-readiness declaration.
