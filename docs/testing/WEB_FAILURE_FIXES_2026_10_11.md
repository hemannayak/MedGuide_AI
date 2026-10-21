# Browser failure corrections — 11 October 2026

## Changes and impact

- Chat transport/consent failures are marked as service errors, labelled Request
  error, exposed as alerts and excluded from TTS/evidence presentation. Cached
  historical error IDs use the same presentation. Source-free responses no
  longer claim verified grounding; missing title/publisher are shown honestly.
- Emergency response retains existing deterministic rules and instructions.
  Raw regex indicators are replaced with a readable safety-check notice. No
  medical threshold or emergency rule was changed.
- Web medication review mirrors backend completeness checks. Missing names or
  strengths, Unknown Medicine and Unspecified values cannot be confirmed through
  this UI. Backend ownership/verification remains authoritative.
- OCR extraction excludes document metadata and synthetic explanatory prose
  before name extraction. Raw OCR remains available for human review. Existing
  saved candidates are not rewritten or deleted. Filtering is document-layout
  logic, not a drug dictionary, clinical validation or inferred correction.
- Explanation retrieval adds a lexical topic-coverage guard: when candidates
  cover all meaningful English query words, prefer those over incidental-word
  matches. Semantic fallback remains if none cover the query. Native-language
  quality and synonym recall need broader evaluation. This is a narrow RAG
  adjustment, with no embedding/model/database replacement or calibrated
  accuracy claim.
- Source drawers count retrieved excerpts, not independent clinical references.
  Multiple chunks from one document are legitimate distinct evidence excerpts;
  repeated document titles alone do not establish duplicate retrieval.

## Evidence

Backend suite: **269 passed**, four existing deprecation warnings.
Frontend: **67 passed**, one optional live test skipped; TypeScript passed.
New tests cover metadata false candidates, demographic-line exclusion, topic
alignment/fallback, incomplete medication UI gating, explicit review and honest
missing-evidence presentation.

Browser recheck on the updated running services:

- Existing consent failure rendered as Request error, without TTS/evidence.
- Existing emergency message no longer displayed regex strings.
- High-blood-pressure explanation returned hypertension-document excerpts and
  excluded the previously retrieved malaria/shock chunk. Generated answer still
  requires independent medical and citation-faithfulness review.
- Same synthetic PNG uploaded again: one candidate (Paracetamol 500 mg) versus
  four before filtering. Candidate remained PENDING. This is a single fixture,
  not measured general OCR accuracy or a real prescription recommendation.
- Historical incomplete candidates show professional-review guidance and no
  confirmation controls.

Screenshot: `evaluation/web-ocr-filtered-review.png`.

## Remaining

Cross-account client cache isolation, retry/draft preservation, per-message TTS
language, UI localization, realistic OCR/handwriting evaluation, licensed medical
corpus currency, broader retrieval evaluation, actual microphone and native
Android testing, offline synchronization and release deployment remain required.
The lexical guard and layout filters do not establish medical safety or clinical
validation. No new dependency, paid-provider requirement or schema migration.
