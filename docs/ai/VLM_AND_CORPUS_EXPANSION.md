# VLM evaluation and medical corpus expansion

## Decision direction

Evaluate vision-language extraction without replacing the working OCR baseline.
Expand evidence coverage beyond the four existing documents, using a reviewed
topic-driven corpus rather than reaching a document count alone. The language
model remains the explanation component and does not replace traceable evidence.
No model has been selected or clinically validated through this proposal.

Existing: Tesseract plus conservative entity extraction; grounded chat using
pgvector retrieval and selectable generation providers. Current limitations:
handwriting/layout have not been evaluated, extraction is heuristic, and medical
topic coverage is narrow. Proposed: optional image extraction adapter and a
larger versioned knowledge corpus. Keep APIs, database and manual-verification
invariants. VLM tradeoffs are hallucinated fields, compute/latency, and cloud
privacy/cost. More documents can increase retrieval noise and conflicting advice.

## VLM comparison

- Baseline: current Tesseract plus extraction, tested on the same synthetic or
  appropriately licensed/de-identified images.
- Local candidate: official Qwen3-VL-2B-Instruct model card. Check actual license,
  quantization/runtime compatibility and 16 GB integrated-GPU hardware performance
  before download or selection. Candidate availability is not measured accuracy.
- Cloud candidate: Sarvam Document Intelligence; verify current endpoint,
  account access, billing and retention before real data. Keep optional.
- Record raw visible text separately from inferred structure. Require nullable
  fields, provenance and explicit human review. No guessed dosage, frequency,
  duration, substitution or invented missing information.
- Compare medicine-name/strength/frequency exact matches, omissions, false
  candidates and hallucinated fields; measure latency/memory separately. Do not
  treat model self-confidence as a calibrated probability.

Verified references:

- https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- https://docs.sarvam.ai/api/api-guides-tutorials/document-intelligence/overview

## Corpus expansion work

`docs/data/corpus_expansion_candidates.json` contains 24 publicly available WHO
fact-sheet pages verified by HTTP on this run. They support patient education,
not autonomous diagnosis or replacement of India-specific clinical guidance.
Each remains CANDIDATE, reuse terms unresolved, indexed false. Neither HTTP 200
nor WHO authorship is a substitute for scope, currency and content review.

Before live use:

1. Review reuse terms, canonical URLs, publication/update dates, applicable
   audience and jurisdiction. Exclude superseded/incompatible content.
2. Preserve source version, fetch date and hash; extract main article content
   without navigation/footer noise. Keep retrieval citations traceable.
3. Chunk by document sections; deduplicate and retain topic/section metadata.
4. Ingest into a staged index through the existing approved-document workflow.
5. Evaluate retrieval on held-out English/Hindi/Telugu questions and code-mixed
   rural phrasing. Inspect topic mismatch, missing evidence and conflicting
   sources. Do not train and evaluate on the same examples.
6. Review generated answers for claim support, native-language comprehensibility,
   unsafe medication suggestions, emergency behavior and correct abstention.
7. Promote only reviewed/evaluated sources. The active four-document corpus has
   not been expanded merely by creating this inventory.

## Language status

Browser examples returned answers in English, Hindi and Telugu; provider greeting
and speech transport checks also passed. No representative multilingual response
benchmark, accent WER, TTS pronunciation or clinical-quality score exists yet.
UI localization remains incomplete. Broader topic coverage and better multilingual
retrieval/model evaluation are necessary before claiming overall quality.
