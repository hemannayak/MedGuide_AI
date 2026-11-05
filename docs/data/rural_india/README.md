# Rural source acquisition

This review collection is separate from the 25-document historical/public-health selection. It does not replace or claim approval of that corpus.

Run from `backend/`:

```text
python -m app.db.acquire_india_public_health --collection ../docs/data/rural_india --retry-failed
```

Current results: NHM ASHA induction module downloaded (152 pages; 146 with extracted text). Two visually reviewed, verbatim programme-navigation passages from PDF page 18 (printed page 16) are now published in the separate service-navigation scope. Only these passages are approved, not the whole document. Training instructions must not automatically become patient prescribing guidance. Blank/image pages require visual/OCR checks when relevant.

Health Dynamics of India 2022–23 could not be downloaded from either the bare or www official MoHFW host URL. The failure remains visible in the acquisition manifest/history. No statistics have been substituted from snippets or unofficial mirrors.

The acquisition command now accepts a collection directory and records HTTP status for future HTTP failures. Source PDFs are hash-addressed in the existing ignored review cache. Metadata remains PENDING until source, extraction, applicability and reuse reviews are complete.

NHM reuse policy reviewed: https://www.nhm.gov.in/index4.php?lang=1&level=0&lid=13&linkid=8 . Requires attribution, non-misleading use and separate rights for third-party material. The two selected text passages were reviewed against the rendered PDF; illustrations and third-party design are not reproduced.

## Published care-access evidence (2026-11-03)

`reviewed_manifest.json` preserves the source hash, attribution, page, rural applicability, review date and limitations. Publication date was not established; the review date is not a claim that the programme or local schedule is current. No observation period was fabricated.

Authenticated endpoint: `POST /api/v1/public-health/care-access/search`

```json
{"query":"Where can village families meet the ANM and Anganwadi worker?","geography":"India","population_setting":"rural","limit":5}
```

Uses the existing pinned multilingual encoder and PostgreSQL/pgvector index. It returns source text and citations, not generated clinical advice. Exact geography and explicit population-setting filters apply; national evidence does not silently become Kerala-specific evidence. Invalid filters return 422, unavailable embeddings 503, missing authentication 401/403. An empty result is valid. This API is not yet connected to patient-chat intent routing.

Publish from `backend/` with `python -m app.db.publish_public_health ../docs/data/rural_india/reviewed_manifest.json`. The local PDF path must point to the hash-verified acquired file on the publishing machine. Repeating publication added zero documents. Live English queries retrieved the selected source; urban and Kerala-only checks returned none. Evidence: `docs/testing/rural-care-access-live-retrieval.json`. These are small smoke probes, not multilingual or clinical validation.

Still pending: rural household statistics, NFHS source acquisition/review, infrastructure report acquisition, multilingual relevance evaluation, and reviewed connection to conversational retrieval.


## Acquisition reliability update

The NFHS-6 fact-sheet source was verified through the official PIB reference and added to the pending acquisition selection. The narrowly scoped `nfhsiips.in` publisher host is allowed; redirects still undergo publisher validation. The download attempt failed with ConnectError; the infrastructure PDF returned HTTP 404. Neither source is approved or indexed. See acquisition.json and the append-only attempt history. No survey statistics were copied from search snippets.

Acquisition checkpoints now use flushed temporary files and atomic replacement. They retain unvisited source records if a refresh stops partway through, mark changed URLs as not attempted instead of inheriting stale successful status, and reject duplicate source IDs. Run only one acquisition process per collection; cross-process scheduling/locking remains pending.

Validation: 24 acquisition/provenance tests passed. Regression cases cover interrupted-progress snapshots, changed source URLs, and failed atomic replacement preserving the original manifest. Initial sandbox execution failed to create pytest temporary directories; the same tests passed outside that restriction.
