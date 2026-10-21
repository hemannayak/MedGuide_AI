# Rural interaction and model evaluation direction

## Implemented increment

Main symptom-entry prompts, plain-language severity choices, submit/loading text
and transcript-review guidance now use English/Hindi/Telugu copies. Chat question
and send controls have local-language accessible names, including the mobile
icon-only button. Symptom microphone is disabled during submission. Existing
triage inputs and rules are unchanged; low-literacy usability has not been
measured with participants. Step indicators/results and other pages still need
complete localization. Duration/severity entry still requires assistance for
some users; this is not a fully conversational symptom intake yet.

## Model shortlist and migration impact

There is no single model that replaces the complete RAG system. Compare:

| Component | Candidate | Role and limit |
|---|---|---|
| Retrieval | intfloat/multilingual-e5-small | First multilingual embedding comparison; evaluate native and code-mixed queries rather than assuming coverage means accuracy |
| Retrieval | BAAI/bge-m3 | Dense/sparse multilingual comparison; 1024-d vectors differ from the current 384-d schema |
| Translation | AI4Bharat/IndicTrans2 | Local translation comparison alongside optional Sarvam; separate numbers/names/negation preservation tests |
| Intent/entities | IHQID paper and resources | Relevant Indic healthcare intent/entity research; data reuse/access still unresolved, not a disease classifier or triage authority |
| Response | Existing Ollama and Sarvam gateways | Grounded plain-language explanations, not independent diagnosis |

Preserve the current index as baseline. Any embedding change requires full
re-embedding with model/version provenance, separate staged index and threshold
calibration. Equal vector dimensions do not make different model spaces
compatible. BGE-M3 additionally requires a schema/index strategy. No runtime
embedding/model switch was made in this increment.

Primary references checked:

- https://huggingface.co/intfloat/multilingual-e5-small
- https://huggingface.co/BAAI/bge-m3
- https://github.com/AI4Bharat/IndicTrans2
- https://aclanthology.org/2023.findings-eacl.140/

## Intended user journey

Choose familiar language → large speak control → editable heard words → one
short clarifying question at a time → grounded short explanation plus spoken
reply → clear next action or healthcare-worker contact. Keep typing available.
Do not assume automatic language detection, perfect ASR or ability to read.
Testing must include assisted first use and unaided repeat use; observe tasks
completed, misunderstanding and abandonment without inventing satisfaction.

Symptom extraction should keep patient's words, distinguish denied symptoms,
time and uncertainty, and ask for confirmation. A model must not silently fill
missing symptoms, severity or duration. Existing sourced deterministic red flags
remain authoritative for escalation. Model-based symptom extraction needs a
separate contract/evaluation before adding it to the live triage pipeline.

Next evaluation: native/script/code-mixed query benchmark, retrieval Recall@k
and irrelevant evidence, grounded-response review, real ASR WER, TTS clarity,
negation preservation, privacy, low-bandwidth recovery and Android user flows.
The 24 source candidates still need content/reuse review and staged indexing.

## Candidate adapter implementation (2026-10-11)

`backend/app/services/retrieval_encoder.py` now provides isolated E5-small and
BGE-M3 candidate encoders, revision pinning, E5 query/passage prefixes,
normalization and dimension/nonfinite/zero-vector validation. Five unit tests
passed. It does not write vectors to the live index or change chat retrieval.

Run `backend/.venv/Scripts/python.exe live_retrieval_smoke.py --run` from the
backend directory for a read-only smoke check. This samples the first twelve
chunks per approved document and records native English/Hindi/Telugu query
matches with source metadata. Sampling is deliberately limited and has no
relevance labels; similarities are not confidence or clinical accuracy.

The first actual run failed before model inference: Windows Application Control
blocked PyTorch's `torch_global_deps.dll` (WinError 4551). Candidate inference
and retrieval quality therefore remain unverified. Do not bypass that policy.
An approved compatible runtime or evaluated ONNX candidate is needed before
benchmarking. The existing live ONNX retrieval engine remains in use.

Regression check: the full backend run passed 271 tests and exposed three OCR
fixture failures caused by dependence on the live OCR environment. Those tests
now explicitly inject the synthetic OCR gateway; all fourteen OCR/candidate
encoder tests passed on the targeted rerun. Production image validation was
unchanged. The entire suite was not rerun after that test-only repair.
