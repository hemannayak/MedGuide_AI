# Web review demo — 15 October 2026

Mobile development deferred at the user's request. Preserved mobile source and
existing local work. Restored the original branded login/register AuthFrame
presentation from `a1d3e69`, retaining connected API handlers, session isolation,
registration validation and unchecked account/terms consent controls. Setup and
recovery keep their separate layouts.

Running locally: web `http://127.0.0.1:3000`, backend
`http://127.0.0.1:8000`, PostgreSQL and Ollama `http://127.0.0.1:11434`.
Ollama lists `qwen3:4b`. Starting a second Ollama server found the existing
listener; the existing server was preserved. Running Ollama does not make it the
selected chat provider; existing Groq configuration remains selected.

Checks: homepage/login/docs/API health returned HTTP 200. Production build and
TypeScript passed; 83 frontend tests passed, one optional live check skipped.
`live_connected_check.py --run` passed synthetic English/Hindi/Telugu TTS-to-STT
round trips, chat HTTP 200 INFORMATIONAL with four cited sources, and speech
consent denial/withdrawal checks. These are connectivity checks, not real-speaker
WER, human TTS clarity or clinical evaluation.

Review account `SYN-review-20261015@example.invalid` created and backend sign-in
verified HTTP 200. Use only synthetic questions/documents. Credentials provided
in chat are demonstration-only. Browser sign-in/audio control verification is
verified through the browser: signed in and reached `/app/chat`, enabled separate
AI/speech choices on this synthetic account, submitted a general hypertension
information question and received a response with four retrieved excerpts.
Read Aloud reached `Stop Speaking` after the browser accepted playback; pressing
Stop Speaking returned it to `Read Aloud`. Screenshot:
`evaluation/web-review-chat-audio-2026-10-15.png`. Real microphone capture,
audibility/volume and accent quality still require a user hardware check.
No guarantee that every backlog
feature is complete or that generated clinical claims are clinically validated.

Preview screenshots: `evaluation/web-signin-restored-2026-10-15.png` and
`evaluation/web-signup-restored-2026-10-15.png`.

## Hindi and Telugu speech recheck

Repeated `live_connected_check.py --run`: real-provider TTS produced nonempty
audio and STT returned nonempty transcripts, HTTP 200, for Hindi and Telugu
(also English). Missing and withdrawn speech consent remained blocked. The
script's English chat request returned a refusal on this run: transport success
does not establish answer availability/accuracy. Browser Hindi question then
returned a Hindi answer with retrieved excerpts; Read Aloud transitioned through
Generating Voice to Stop Speaking and cancellation returned Read Aloud. Telugu
browser question/playback checks follow. Synthetic audio is not a real-speaker
WER or accent validation result.


## Refusal banner correction
The generic banner incorrectly labelled all refusals as unsafe queries and claimed re-grounding. Backend refusal paths also include insufficient evidence, model abstention, rejected output and service outages. Replaced the banner in English, Hindi and Telugu with an answer-unavailable notice explaining that retrieved excerpts may be insufficient or irrelevant. No safety gates or retrieval thresholds changed. Exact cause of the reported refusal remains unverified until the original question is supplied.
Telugu browser verification also completed: a Telugu answer with four retrieved excerpts, playback reached Stop Speaking and completed back to Read Aloud. Screenshot: evaluation/web-review-telugu-audio-2026-10-15.png.

## Childhood dehydration live reproduction
Question: What are early signs of dehydration in children?
Frontend .env.local API mode confirmed REAL with localhost:8000/api/v1. Actual authenticated HTTP POST /ai/chat returned 200 REFUSAL; full public-source response stored in evaluation/dehydration_live_reproduction.json. Inspected the four database chunk IDs returned by that response: childhood obesity (page 194), hyperglycaemia history (286), childhood asthma (371), and palliative-care dehydration/constipation (531), all from the legacy PEN record. These do not establish early signs of dehydration in children. The refusal is justified for this retrieved context; the retrieval/source-coverage problem remains unresolved. No mock answer substituted and no safety threshold relaxed. The suggested dehydration question is currently unsupported. Requires reviewed paediatric dehydration sources, accurate source metadata, ingestion and retrieval/answer evaluation before claiming support.
