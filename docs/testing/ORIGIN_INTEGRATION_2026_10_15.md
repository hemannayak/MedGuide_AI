# Origin integration — 15 October 2026

Fetched origin/main `adb3c28` and merged into local main (`c567b85`). Saved all
tracked/untracked local work in recovery stash `MedGuide recovery before origin
integration 2026-10-15`; applied it without dropping it. The older recovery stash
was preserved. No push performed.

Reconciled frontend overlaps, preserving connected care, consent, worker access,
chat isolation, retry recovery and speech behavior alongside incoming interface
translations and app-entry routes. Fixed integration imports/hook access and
updated test harnesses for the translation hook. Removed duplicate policy main
landmarks and restored canonical policy metadata; regression checks caught those
issues. There are no unresolved Git conflict entries. Local development edits
remain uncommitted.

Checks: frontend TypeScript and production build passed; 81 frontend tests
passed, one optional live test skipped, zero failures. Physical device/backend
user journeys were not rerun in this increment. Profile onboarding still has a
sample-only save path; live backend mapping and data minimization remain pending.

Research status remains unchanged: four active corpus documents, 24 reviewed
candidate URLs not promoted, MiniLM ONNX baseline, E5 candidate inference blocked
by the previously observed Windows DLL policy. No trained disease prediction.
Structured symptom triage contains substring keyword matching and requires
source/negation/uncertainty review before claims of safe triage performance.
