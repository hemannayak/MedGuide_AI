# Product integrity checkpoint — 2026-11-05

## Completed in this change

- Assistant message metadata now persists citation snapshots, response type and refusal status. Snapshots retain document/chunk identity, publisher, URL and page. Existing relational knowledge documents remain the source of truth; no schema migration was required.
- Refusals are no longer marked RAG-grounded merely because retrieval returned sources. Retrieved references can remain attached as context, without claiming they support a generated answer.
- An explicitly supplied missing or foreign conversation ID returns 404 before writing messages instead of silently creating a different conversation. Malformed history IDs return 422.
- Removed the unused frontend MedGuideChat component containing simulated clinical replies and fabricated references. The active /app/chat page uses the backend API. Production configuration rejects MOCK mode; development fixtures remain available explicitly.
- Corrected frontend sender-type declarations to match PATIENT / AI_COMPANION / SYSTEM returned by the backend.

## Validation and limits

The new integration regression uses disposable SYN accounts and the real authenticated history API/PostgreSQL. It verifies citation persistence after session expiration, refusal metadata, other-account denial and invalid conversation requests producing no messages. It inserts synthetic citations deliberately and does not claim live model quality. Test accounts are removed in cleanup.

Frontend TypeScript check passed. Four executable configuration checks passed: production MOCK rejection, default production REAL, explicit production REAL, and development MOCK. No visual redesign was performed. Browser/device interaction and a production frontend build have not been rerun in this change.

Historical messages without saved source snapshots cannot be reliably backfilled. The web chat still does not provide a history-restoration interface, so the backend persistence fix alone does not complete that user journey.

## Research direction (sources reviewed November 3, 2026)

Ada describes symptom assessment using medical intelligence/probabilistic reasoning and excludes definitive diagnosis or replacement of professional advice: https://ada.com/help/what-degree-of-liability-does-ada-accept/ .

C-DAC describes eSanjeevani as telemedicine addressing rural access and continuity of care: https://cdac.gov.in/index.aspx?id=product_details&productId=eSanjeevaniNationalTelemedicineService .

Neither description establishes missing capabilities or comparative inferiority. MedGuide's proposed contribution is an evaluated combination of traceable Indian evidence, explicit rural/geographic/temporal applicability, multilingual clarification, human-reviewed OCR, and authorized worker continuity. This is an engineering direction, not proven novelty, clinical validation or better outcomes. Do not claim replacement of clinician teleconsultation.

## Remaining acceptance gates

1. Web/mobile conversation recovery with citation display, session isolation and stale-response tests.
2. Complete the other 24 public-health passage reviews; acquire and verify rural household and infrastructure evidence. Recorded source download failures remain unresolved.
3. Evaluate English/Hindi/Telugu retrieval and generated claims on held-out cases, including abstention and numerical faithfulness. Do not change models based on popularity or claim accuracy from unit tests.
4. Validate prescription upload, manual correction, verification, scheduling, adherence and worker follow-up as one connected user journey.
5. Test blank-database migration, backup/restore, concurrency, retry/idempotency, retention, deployment monitoring and resource limits.
6. Audit every record endpoint for ownership and worker assignment; test consent withdrawal across chat/speech and caches.

The project is not yet production-ready. These gates should be closed with reproducible evidence, not inferred from screen availability or isolated APIs.

## Recorded verification

Backend: 414 passed, four existing Starlette deprecation warnings, 110.68 seconds. Frontend: 87 passed, one opt-in live API test skipped. TypeScript: npx tsc --noEmit passed. Production configuration regression tests are retained in frontend/tests/production-config.test.mjs. Full browser/device and production build verification remain pending.
