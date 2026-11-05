# Voice platform evaluation

Reviewed official sources during the October 23–November 3 backend phase. Prices and terms must be rechecked before deployment; no purchases were made.

## Outpero

[Outpero](https://outpero.com/) markets multilingual AI telephone agents, including code-switching, interruption support and business integrations. Its public site advertised seven Indian languages, 50 introductory credits and plans from ₹5/minute; these are vendor claims and commercial terms, not independently measured MedGuide results. Its [latency article](https://www.outpero.com/blog/lowest-latency-ai-voice-agents) reports 0.8–1.3 second latency. The materials reviewed do not disclose enough to identify its exact recognition, synthesis, model, buffering or endpointing implementations.

Engineering inference: a comparable conversational experience needs incremental recognition, turn detection, prompt cancellation, short responses, fast first audio, echo cancellation and explicit handling of network failures. Copying its interface or selecting a pleasant TTS voice alone would not provide this. Telephony/CRM features are outside the current MedGuide implementation; no calling platform is added.

## Sarvam

The existing provider already supports the project's English/Hindi/Telugu workflows. The implemented transport uses [realtime recognition](https://docs.sarvam.ai/api-reference/speech-to-text/transcribe/realtime/ws) with VAD and final/partial transcripts, and [HTTP audio streaming](https://docs.sarvam.ai/api-reference/text-to-speech/convert-stream). Partial recognition can trigger display/interruptions, but only a final transcript enters the health pipeline. Actual testing found valid empty partial events, now covered by regression tests.

[Published pricing](https://docs.sarvam.ai/api/getting-started/pricing) reviewed in this phase lists PAYG STT at ₹0.49/minute and Bulbul v3 at ₹3/1,000 characters, excluding GST. Verified-user introductory credits are finite, not an ongoing free tier. Illustrative direct speech cost for 10 minutes of input and 5,000 synthesized characters is ₹19.90 before taxes, model/translation fees and infrastructure; actual billing/rounding and current account plan apply.

[Commercial licensing](https://docs.sarvam.ai/api/getting-started/commercial-licensing) states credit-backed generated outputs, including qualifying free-credit usage, can carry production rights subject to its terms. This does not license the underlying models or remove healthcare/privacy obligations. Provider retention, regional hosting and deployment contract review remain outstanding. Do not route patient audio to a new provider merely because another provider fails.

## Local and open alternatives

| Component | Decision and limits |
| --- | --- |
| [Whisper.cpp](https://github.com/ggml-org/whisper.cpp) | MIT runtime; local, portable batch STT adapter added. No Python CTranslate2 wheel dependency. Actual Windows binary launch is currently blocked by an unexplained native exit. Regional accuracy is unmeasured. |
| [Indic Parler-TTS](https://huggingface.co/ai4bharat/indic-parler-tts) | Model card declares Apache-2.0 and English/Hindi/Telugu among its languages. Access requires accepting information-sharing conditions on Hugging Face; these were not accepted on the user's behalf. No checkpoint deployment or latency claim. |
| Existing Ollama/Groq gateways | Reused for grounded generation. Voice transport does not select a new medical model or bypass output validation. |
| Existing multilingual MiniLM | Retained and revision-pinned for the current 384-dimensional index. E5/bge-m3 candidates remain isolated; changing encoder requires a complete separate index and benchmark. |

## Existing research integration

The repository inventories user-provided research in `docs/research/USER_RESOURCE_INVENTORY.md` and `docs/data/research_resources.json`. Existing MedQuAD staging (104 documents/398 QA) is preserved; its age and clinical applicability prevent indiscriminate production ingestion. SAHA, IHQID, IndicRAGSuite, PubMedQA and MedHALT are task-specific research/evaluation materials, not automatically approved clinical guidance. Gated IndicTrans2 cannot be assumed available. MuRIL/IndicSBERT/E5/bge-m3 references do not constitute evaluated deployed models.

The live corpus was instead expanded with 29 individually archived CDC patient-education pages. Their source hashes, exact text, reuse basis and US jurisdiction are retained. They are general education, not India-specific prescribing, emergency or referral rules. Retrieval smoke testing achieved 11/12 topic hits at five; this tiny set does not support an accuracy or clinical-performance claim. A Telugu failure led to a safer no-evidence fallback when translation is unavailable.

## Selection

Use the existing Sarvam provider as an optional hosted test path, and the local Whisper adapter as a deployable alternative once its runtime and language quality are verified. Keep the provider abstraction and fail explicitly when unavailable. Do not declare either option best in voice quality until representative rural accents, code-switching, background noise, medicine pronunciation, negation and user comprehension have been evaluated.
