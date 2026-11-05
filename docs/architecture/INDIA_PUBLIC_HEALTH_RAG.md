# India public-health evidence: implementation and review status

## Decision and boundaries

Preserve the existing 384-dimensional multilingual index, relational document/chunk tables, authentication and patient safety pipeline. Add a separately approved population-surveillance scope. This is evidence retrieval, not outbreak prediction, individual disease-risk scoring or clinical decision automation.

The patient chat SQL selects `APPROVED`; the new public-health search selects only `APPROVED_SURVEILLANCE`. This prevents regional surveillance reports from silently becoming patient-treatment evidence. No schema replacement or destructive migration is needed. An explicit future integration into generated public-health answers requires citation/temporal evaluation first.

## Corpus state

`docs/data/india_public_health/selection.json` records 25 selected official publication URLs. Selection includes ICMR state-burden profiles, ICMR AMR and diabetes reports, NCDC AMR surveillance/consumption reports, WHO malaria/TB and epidemiological bulletins, and an IDSP weekly report. The initial selection is retained separately: overlapping historic state profiles were replaced by six seasonal bulletins. Discovery is not approval.

`acquisition.json` records per-file outcomes, source hashes, retrieval timestamps and extraction status. Original PDFs and extracted text live in ignored `backend/.model-cache/public-health-sources/`; do not redistribute them without their applicable reuse terms. Hash-addressed snapshots preserve downloaded versions. Subsequent acquisition attempts append `acquisition_history.jsonl`; the initial run predates that logging enhancement and remains represented by its manifest/cache.

Final acquisition check: **25/25 PDFs acquired**, all still pending publication review, zero indexed into the new scope. The IDSP host timed out; its week-30 report was acquired from the official NCDC 2025 archive mirror recorded in the selection. NCDC's 2024 AMR PDF required a recorded plain-text fallback on a page where layout extraction failed. Neither workaround is treated as successful content verification.

Subsequent review/publication: **one source now has three approved narrative passages active** (IND-PH-17, ICMR/PHFI/IHME 2017 report, PDF pages 21–22). The licence on PDF page 2 explicitly identifies CC BY 4.0 and attribution to all three organisations. Rendered-page review confirmed the selected passages; the rest of that report is not approved. The other 24 selected sources remain pending. See `reviewed_manifest.json` and `docs/testing/public-health-publication.json`.

Publication now independently re-extracts each claimed PDF page and requires exact passage containment after whitespace normalization. A review flag cannot authorize changed numbers or invented text. Evidence hashes include source metadata, so changes to geography, observation dates or reuse terms create new versions. Prior active versions at the same source URL become `SUPERSEDED_SURVEILLANCE` in the same transaction; their rows/chunks remain available for historical citations. Identical reruns add zero documents.

The first live pgvector smoke check returned three historical passages for an India/1990–2016 query, zero for the same question restricted to 2024, and zero for a Kerala-only query (the approved source is national scope). Cold first query was 1,796.61 ms; subsequent filter checks were under 9 ms. This verifies filtering on one source, not broad retrieval quality. Evidence: `docs/testing/public-health-live-retrieval.json`.

Some original PDFs contain rotated plots and tables. Raw extracted numbers may lose labels or denominators. These records remain **PENDING**, not automatically indexed. Historical state profiles must not be represented as contemporary prevalence. Hospital AMR surveillance must not be extrapolated to community prevalence. Seasonal comparisons require consistent reporting systems and observation periods; missing reports do not imply zero cases.

## Commands

From `backend/`:

```text
python -m app.db.acquire_india_public_health
python -m app.db.acquire_india_public_health --retry-failed
python -m app.db.publish_public_health path/to/reviewed-manifest.json
```

The default acquisition command checks publisher URLs again; `--retry-failed` reuses successful hash-verified snapshots. Run one acquisition job at a time. This is a manual refresh workflow, not a deployed background scheduler. Refresh never automatically promotes changed content into active evidence.

Publishing requires a source record and exact reviewed passages with page/section references. It validates source bytes, HTTPS publisher domain, observation dates, geography, population, limitations, license review, extraction review and table review. A PostgreSQL advisory lock and transaction protect batch publication. Content/selection identities make identical reviewed versions idempotent. Older versions are retained; new reviews supersede older active versions of the same URL within their evidence category; rollback administration remains unfinished.

## API

`POST /api/v1/public-health/search`, authenticated bearer token required:

```json
{"query":"reported dengue cases","geography":"India","period_start":"2024-01-01","period_end":"2024-12-31","limit":5}
```

Returns verbatim evidence, document/chunk IDs, publisher URL, metadata and similarity. Geography matches explicitly; reporting periods overlap the requested interval. Defaults to five results, maximum ten; provisional semantic threshold 0.4 needs representative evaluation. No matches is an honest empty list. No generation or external AI provider is called. Authentication failures return 401/403; invalid filters 422; unavailable embeddings 503. No personal health data is written by search.

## Licensing and model decisions

- ICMR policy permits accurate reproduction with prominent acknowledgment, excluding third-party material: https://www.icmr.gov.in/copyright-policy . Review joint/third-party credits per publication.
- NCDC policy requires acknowledgment and excludes third-party copyright: https://www.ncdc.mohfw.gov.in/includes/Footer/Copyright_Policy.php .
- WHO policy generally uses CC BY-NC-SA 3.0 IGO for its publications: https://www.who.int/about/policies/publishing/copyright . Verify each publication; commercial deployment needs compatible rights. No blanket commercial approval is recorded.
- NeuML PubMedBERT embeddings is an English biomedical retrieval candidate, Apache-2.0, 768 dimensions: https://huggingface.co/NeuML/pubmedbert-base-embeddings . Added to the isolated candidate encoder, not the live index. Adapter tests are not model-quality evaluation. No clinical improvement is claimed.
- MedGemma remains an evaluation candidate, not a replacement for the current generator. Its card requires adaptation/validation, cautions against direct clinical use and says multi-turn use has not been optimized/evaluated: https://huggingface.co/google/medgemma-4b-it . Access/license acceptance and actual workload evaluation precede integration.
- Fine-tuning is deferred until a licensed, representative, deduplicated training set and separate held-out test set exist. Twenty-five reference documents alone do not justify training a diagnostic model. Retrieval evaluation comes first; keep temporal/state splits and measure unsupported claims, numerical faithfulness and abstention.

## Validation and unfinished work

Full backend suite after API/database additions: **402 passed**, four existing deprecation warnings, 46.22 seconds. Includes real PostgreSQL/pgvector tests for scope, geography and date filtering using synthetic rows rolled back after the test. Unit/API fixtures do not enter production data.

After direct PDF passage verification and metadata-aware versioning: **405 passed**, four existing deprecation warnings, 45.35 seconds. New regression cases reject altered numbers, nonexistent pages and empty extraction, and verify that changed reporting metadata changes publication identity.

Still required: finish the other 24 document reviews and approved passage publication; evaluate numerical/citation faithfulness and multilingual retrieval; run candidate models on identical held-out cases; validate supersession under concurrent publication and add scheduled refresh monitoring; validate operational indexes, load, restore and deployment. The 25-document target is a selected review collection, **not yet 25 verified active RAG documents**. No production-readiness claim is made.


## Rural care-access extension (2026-11-03)

Decision: reuse the existing publisher, relational tables and embedding model with `APPROVED_SERVICE_NAVIGATION` status and `service_navigation` metadata. Alternative rejected: assigning programme documents fake observation dates or mixing them into clinical/epidemiological search. No migration or additional dependency is required. Existing surveillance request contracts remain unchanged.

`POST /api/v1/public-health/care-access/search` accepts query, geography, population_setting and limit. It rejects observation-period fields. Source review requires an explicit review date and publication-date status. It returns only approved care-access evidence, with a notice that programme descriptions do not establish current local availability. Old versions are retained as `SUPERSEDED_SERVICE_NAVIGATION`. Patient clinical retrieval remains restricted to its original approved pool.

One NHM document / two passages published; repeat publication added zero. The existing 33 clinical/education documents and one historical surveillance source remain separate. See `docs/data/rural_india/README.md` and `docs/testing/rural-care-access-live-retrieval.json`. This does not complete the 25-document verification target or patient-chat routing.

Validation after care-access extension: **410 passed**, four existing Starlette deprecation warnings, 45.40 seconds. Includes authenticated API failure paths, real PostgreSQL scope/population/geography isolation, and service review-date validation. Live publication/retrieval evidence is recorded separately; tests do not establish clinical validity.
