# Ollama and Sarvam integration verification

## Decision and impact

Keep the provider-agnostic RAG pipeline and its consent, evidence and safety gates.
Add optional Sarvam chat alongside existing local Ollama. No database migration,
client contract change or automatic cross-provider fallback is introduced.
Switching providers changes where the grounded prompt is processed; cloud access
requires configured credentials, connectivity and applicable provider billing.
Sarvam is not a mandatory dependency for local chat. Cloud retention, cost and
release suitability still require review. No medical accuracy claim follows from
model availability or a successful request.

## Configuration

Local chat: `AI_PROVIDER=ollama`, `AI_MODEL=qwen3:4b`,
`OLLAMA_BASE_URL=http://localhost:11434`. Start `ollama serve` if absent.

Optional Sarvam chat: `AI_PROVIDER=sarvam`,
`AI_MODEL=sarvam-105b-conversations`, `SARVAM_API_KEY` through the ignored environment.
Use `sarvam-105b` as an explicit comparison candidate, not an automatic upgrade.
Speech and translation providers remain configured independently. Existing live
chat remains Groq until a candidate passes the grounded-response comparison.

Sarvam adapter uses V1 JSON output, explicit output budget, nonstreaming transport
and disabled reasoning. It rejects empty and truncated outputs and reports HTTP
status without exposing provider bodies. Ollama JSON generation now requires a
nonempty `answer` field through a JSON schema; truncated output is rejected.
This does not guarantee citation faithfulness or safe medical reasoning.

## Measured checks

The backend suite passed 264 tests after Sarvam adapter addition (four existing
deprecation warnings). Focused provider tests passed 15 after Ollama schema change.
`backend/live_llm_smoke.py --run` uses greetings only, storing metadata in
`evaluation/llm_connection_results.json`. Sarvam returned a valid answer object in
English, Hindi and Telugu. Initial Ollama greetings produced wrong field names;
after schema enforcement, two local server HTTP 500 failures and one Telugu
success occurred. Full medical/RAG quality has not been evaluated for these
candidate providers. Timings in interrupted/stalled runs are not usable latency
benchmarks.

After stopping the stalled competing download, the final smoke run passed all six
checks: Ollama en/hi/te took 4.51/3.35/3.75 seconds and Sarvam took
0.27/0.19/0.22 seconds. These are single synthetic greeting requests, not a
representative latency or medical-quality benchmark. Earlier failures remain
relevant to the local reliability review.

Final full regression after the schema correction: 265 passed, four existing
deprecation warnings.

## Newer local candidate

This machine has about 16 GB RAM and integrated Intel graphics. The existing
Ollama installation has `qwen3:4b` (about 2.5 GB). A `gemma4:e2b` download was
attempted but stalled/retried and was stopped; it is not verified installed or
selected. Its download size is not its complete runtime memory requirement.
Evaluate memory, latency, native-language answers, structured output, refusals,
citations and medication-safety cases before selecting it. A newer model is not
automatically a better healthcare model.

## References verified during implementation

- [Sarvam chat V1 contract](https://docs.sarvam.ai/api-reference/chat/chat-completions-v1)
- [Ollama structured output](https://docs.ollama.com/capabilities/structured-outputs)
- [Gemma 4 Ollama model variants](https://ollama.com/library/gemma4)

Remaining: local server reliability, completed candidate download/evaluation,
grounded multilingual medical review, realistic audio WER and pronunciation,
physical Android recording/playback, provider privacy and cost review.
