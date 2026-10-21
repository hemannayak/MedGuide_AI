# Research resource adoption

Date: 2026-10-03

Status: User-approved evaluation shortlist. No resource listed here has been
promoted to production, downloaded by this task, or evaluated on MedGuide tasks.

## Decision and impact

Use the literature-derived resources to improve verified-source retrieval and
symptom understanding for English, Hindi, and Telugu. Preserve the existing
FastAPI/PostgreSQL/pgvector architecture and current runtime models while
evaluating candidates in isolation. This document supplements the existing
model selection process; production model approval remains in
`docs/ai/MODEL_REGISTRY.md`.

The machine-readable inventory is `research_resources.json`. Approval to
evaluate a candidate does not establish permission to redistribute data,
medical validity, or superiority to the baseline.

## Dataset adoption

| Resource | Intended use | Access/license status | Boundary |
| --- | --- | --- | --- |
| IHQID-WebMD and IHQID-1mg | Healthcare intent/entity evaluation and eligible development data | Authors' repository has Dataset and annotation_guidelines folders; explicit reuse license not established in this review | Disease/drug/treatment/other labels do not constitute symptom severity or emergency labels. Obtain applicable permissions before training/import. |
| MedQuAD | Selected consumer QA development/evaluation examples | Repository specifies CC BY 4.0 and removes answers from three copyrighted subsets | Preserve source URLs, inspect currency and Indian applicability, exclude missing/copyright-restricted answers. Keep held-out answer data out of the application index. |
| IndicMSMARCO (IndicRAGSuite) | General-language retrieval benchmark, initially Hindi/Telugu | Dataset card lists MIT; upstream MS MARCO/source-content terms still need review | General benchmark, not an approved medical corpus. The card names its benchmark split train; that name does not authorize fitting on evaluation questions. |

Official sources:

- IHQID: https://github.com/indichealth/indic-health-demo
- IHQID paper: https://aclanthology.org/2023.findings-eacl.140/
- MedQuAD: https://github.com/abachaa/MedQuAD
- IndicRAGSuite: https://huggingface.co/collections/ai4bharat/indicragsuite
- IndicMSMARCO: https://huggingface.co/datasets/ai4bharat/IndicMSMARCO

## Model adoption

| Candidate | Role | Model-card license/access | Evaluation needed |
| --- | --- | --- | --- |
| google/muril-base-cased | Intent classification / entity extraction encoder | Apache 2.0 | Requires task heads and eligible labeled training data; measure per-language extraction and intent errors. Not a ready-made medical checker. |
| l3cube-pune/indic-sentence-bert-nli | Retrieval encoder challenger | CC BY 4.0 | English/Hindi/Telugu medical relevance, latency, memory, exact embedding dimensions and preprocessing. |
| intfloat/multilingual-e5-small | Retrieval encoder challenger | MIT | Same medical relevance set; documented query/passage prefixes, normalization, dimensions and truncation. |
| ai4bharat/indictrans2-indic-en-dist-200M | Local Hindi/Telugu-to-English query translation | MIT; gated model files requiring the user's acceptance of access conditions | Preservation of negation, duration, severity, numbers, and medicine names; resource use and translation failure behaviour. This checkpoint does not translate answers back into Indian languages. |

Official model cards are each available at `https://huggingface.co/<model-id>`.
Pin immutable revisions and record artifact hashes when acquiring files. Model
cards were inspected on the date above; recheck exact artifact terms at download.

Alternatives considered: immediately replacing the current encoder; adopting a
new generation model; ingesting every dataset into RAG. Those choices would
confound evaluation, potentially mix incompatible embedding spaces, and turn
benchmark material into unsupported medical evidence. Final choice: isolated
comparison first, then evidence-based selection.

Advantages: traceable resources, free local candidates, language-specific
measurement, and preservation of the working baseline. Disadvantages: model
downloads/compute, additional reviewed labels, and dataset access dependencies.

## Integration sequence

1. Resolve remaining dataset terms and user-owned gated access. Do not send
   messages to authors or accept account conditions on the user's behalf.
2. Acquire permitted artifacts in a separate research workspace; record version,
   license, hashes, languages, source origins, exclusions, and download date.
3. Freeze baseline corpus/configuration and establish a held-out medical
   retrieval set with reviewed relevance labels. Keep translations/paraphrases
   of a question in the same split.
4. Compare the current multilingual MiniLM encoder with IndicSBERT and E5 using
   a separately encoded corpus for each. Never mix query and document encoders.
   The current database uses 384-dimensional vectors: validate candidate shapes
   and use isolated experimental storage rather than altering runtime tables.
5. Compare direct retrieval with local query translation; preserve the original
   patient text for safety screening and audit translation meaning separately.
6. Evaluate MuRIL for intent/entities after eligible training data is available.
   Add source-derived symptom-specific annotations for absent fields rather
   than pretending IHQID supplies duration, severity, or triage labels.
7. Evaluate safety rules independently, then the complete answer/escalation flow.
8. Record measured results in the model registry and an architecture decision
   before any runtime replacement. Implement changes incrementally in the main
   development task with regression checks.

## Symptom checker and verified knowledge

Reviewed MoHFW/ICMR/WHO material remains the medical evidence source. Maintain a
rule register with exact document/version/page, population, applicability,
conditions, reviewed language variants, and escalation action. Research datasets
and model predictions cannot supply clinical authority by themselves.

Flow: original patient description -> symptom/context extraction -> clarification
when necessary -> independently sourced safety rules -> escalation or retrieval
of supported information -> response validation. Emergency handling must not
depend on successful translation, retrieval, or generation. No diagnosis,
prescribing, dosage changes, or advanced disease prediction is authorized here.

## Evaluation and completion evidence

- Extraction: macro-F1 for intents, span/entity precision/recall/F1, absent-field
  handling and medically meaningful extraction errors.
- Retrieval: reviewed relevance labels, Recall@k, MRR, unsupported-query handling;
  distinguish hit rate from recall when multiple passages are relevant.
- Translation: meaning-preservation review and per-language failure analysis.
- Safety: sensitivity, specificity, false-negative/false-positive rates and
  end-to-end escalation; test negation, historical/third-person symptoms,
  indirect phrasing, Roman scripts, code-mixing, and unavailable dependencies.
- Answers: evidence-supported claims, citation correctness, appropriate refusal,
  comprehension and possible harm; human review complements automated judges.
- Runtime: hardware, warm/cold median/p95 latency, peak memory and failures.

Report sample counts, denominators, uncertainty and each language separately.
No score or clinical validation is claimed. Open gaps: IHQID permission review,
upstream benchmark terms, gated translation access, suitable symptom/triage
labels, clinical source review, and all comparative experiments.
