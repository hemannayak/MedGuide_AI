# Redesigned frontend integration

Verified 2026-10-03. Historical merge checkpoint; subsequent care integration and current results are recorded in [CARE_WORKFLOWS.md](CARE_WORKFLOWS.md).

## Repository update

Fetched origin/main through `4b9e923`. The local branch had seven unique commits,
so a fast-forward was impossible. Merge commit `a1d3e69` retains both histories.
Resolved overlaps in the API client, mock adapter, AI service, and knowledge service.

All pre-sync tracked and untracked work remains recoverable in the stash named
`MedGuide local work before redesigned frontend sync`. Compatible backend safety
and setup changes were restored. The older uncommitted UI, demo services, routes,
assets, and research files remain in that stash rather than replacing the redesign.
Ignored environment files and installed dependencies were retained.

## Integration changes

- The redesigned `/app` workspace and shared authentication experience remain the UI base.
- Speech upload now reads the shared session helper, including tab-only sign-ins.
- API mode defaults to REAL; explicit MOCK mode remains available for demonstrations.
- Retained production settings validation, restricted CORS, HTTP 503 database readiness,
  and the existing multilingual safety gate.
- Combined local ONNX inference with remote embedding failure safeguards and atomic
  corpus ingestion; preserved publication metadata precision.
- Technology-page inventory matches all twelve registered backend routers.
- Medication loading errors appear as errors rather than empty records. Missing
  instructions and schedule fields no longer cause string-method exceptions.

## Validation

- Backend: 217 passed, four existing HTTP 422 deprecation warnings.
- Frontend production build: passed, 39 generated pages.
- Final frontend suite with the live API test enabled: **51 passed**, zero skipped,
  including the speech-session regression check.
- The opt-in live API test creates an explicitly synthetic development
  patient and checks registration, profile retrieval, symptom recording/analysis,
  and the deterministic emergency chat gate. No real patient data was used.
- Both localhost services restarted with the merged code.

These checks do not establish clinical validation, live generative provider quality,
or live speech/OCR accuracy. Prescription pages in this redesigned UI still show
availability notices; healthcare-worker portal, account recovery, and other
unconnected features require subsequent work. The retained stash is not dropped.

This report supersedes UI-specific gaps in BACKEND_SETUP_STATUS.md where the new
design now uses the shared session and real API client.
