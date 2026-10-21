# Corpus, speech presentation and connected setup — 15 October 2026

## Implementation

- Publisher HTML staging adapter extracts the article container only, preserves
  section titles/provenance/hashes, deduplicates content and requires a reuse
  basis. It cannot alter the live database and marks output STAGED_NOT_APPROVED.
- WHO candidate inventory expanded to 26 accessible URLs. No WHO content
  promotion: substantial reproduction/translation terms still require review.
- MedQuAD acquired in ignored research cache at revision
  `577bd37b96c02d1833b2c9eed2de9f96964e96cb`, CC BY 4.0, attributed to Ben Abacha
  and Demner-Fushman (2019). Staged 104 distinct documents/398 QA pairs from NIDDK,
  NHLBI and CDC collections. Restricted MedlinePlus collections, empty answers,
  treatment question types and published test archive excluded. Focus groups
  share a deterministic research split. Synonym-related leakage still needs
  review; this split is not a demonstrated leakage-free clinical benchmark.
- Manifest: `evaluation/medquad_staging_manifest.json`. Actual extracted records
  remain in `.model-cache/research/medquad-staged`. Currency and Indian
  applicability are NOT_VERIFIED/PENDING. Indexed count remains zero; no training.
- Shared TTS endpoint formats visual headings/emphasis and paragraph pauses,
  preserving content/negation/numbers/units/source markers. This is not a new
  generated medical answer or measured human-like voice performance.
- Live onboarding now PATCHes display name and language through the existing
  patient API. Removed collection of unsupported health/context fields. Preview
  remains explicitly synthetic and session-scoped; no live local profile cache.

## Checks

- Frontend production build and TypeScript passed; 83 tests passed, one optional
  live test skipped, zero failures. Four profile setup tests passed.
- 22 staging/speech-format/assertion tests passed after using workspace-local
  pytest temporary storage (sandbox temp creation failed initially).
- 21 speech/consent tests passed; one framework deprecation warning. Speech
  endpoint contract tests mock the post-consent dependency only within their
  fixture. Separate tests verify real unauthenticated rejection and consent
  withdrawal; no production authorization was relaxed.
- An earlier sandboxed speech test process stalled; no completion claim for
  that run. Services and processes were not stopped at the user's request.

## Remaining acceptance

Active corpus is still the legacy four documents. Staged sources require
currency/applicability/source-content review, reviewed retrieval labels,
isolated encoder comparisons and explicit promotion evidence. Fine-tuning and
disease prediction are not implemented. Live onboarding browser/device checks,
real-speaker TTS clarity/WER and full release journeys remain pending.
