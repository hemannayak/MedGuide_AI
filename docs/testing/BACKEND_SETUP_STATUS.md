# Backend setup and integration status

Verified on 2026-10-03 on the local Windows development environment.

Update: the redesigned frontend was subsequently merged. See
`FRONTEND_REDESIGN_INTEGRATION.md` for current UI integration and validation;
the older mock auth/profile service discussed below remains in the recovery stash.

## Changes

- Reused the existing FastAPI/PostgreSQL/pgvector architecture and migrations.
- Restricted credentialed CORS to explicitly configured frontend origins.
- Database health returns HTTP 503 on connection failure without exposing internal exception details.
- Production configuration rejects debug mode, placeholder/short signing secrets, wildcard origins, and mock providers.
- Escaped database credentials correctly when constructing SQLAlchemy URLs.
- Added a separate synthetic test database runner and documented local setup.
- Connected the newer password login and patient registration forms to real API endpoints in REAL mode; errors stay on the form. HCW self-registration cannot elevate a patient's role.
- Removed fabricated bearer-token fallbacks from the API client.
- Fixed explicit empty speech credentials incorrectly inheriting a configured key.
- Preserved caller-supplied publication metadata on knowledge chunks. A publication year is preserved as a year, not converted into an invented exact date; unsupplied versions remain unknown.

## Measured verification

- Live API health: HTTP 200, database connected.
- Existing application migration: `25cb6f5a0d28`, latest head.
- Application database: pgvector 0.8.5, 4 knowledge documents, 6,760 knowledge chunks. Configured providers are Groq and Sarvam; their live operation was not tested in this setup.
- Separate `medguide_ai_test` database migrated successfully with pgvector.
- Full backend suite: **209 passed**, 4 deprecation warnings, 20.29 seconds on the final run. The initial corpus population required a longer run; the final run reused its embeddings.
- Frontend TypeScript: `tsc --noEmit` passed.
- Frontend production build: passed, generated 80 pages. The initial sandboxed attempt could not download Google Fonts; an approved network retry succeeded.
- Installed backend dependencies: `pip check` passed.

Backend AI/translation tests use mock generation providers; these results do not establish real model response quality, clinical accuracy, live cloud speech availability, or end-to-end browser flow correctness. Corpus ingestion and semantic retrieval were exercised with the locally available embedding runtime.

## Production gaps

- Several newer patient and HCW dashboard services still contain synthetic/mock implementations, independent of REAL API mode. They need explicit endpoint mapping, authorization checks, and browser flow validation.
- Google OAuth, phone OTP, password reset, and email verification are not connected to production services. Password login and patient registration are connected.
- The auth service's existing synchronous profile fallback still contains synthetic demo profiles; it must be removed when converting the remaining dashboard flows to real data.
- Token storage currently uses browser localStorage. Session hardening, revocation, rate limiting, and expiry handling need a dedicated security pass.
- Provider health, live model evaluation, medical-source currency review, OCR/speech accuracy evaluation, and offline synchronization need verification. Database health alone does not cover these services.
- Dependency versions are broadly specified rather than fully locked. A clean-machine installation and reproducible release lock remain necessary.
- TLS, least-privilege runtime/migration database accounts, backups/restore testing, deployment monitoring, and healthcare safety review remain deployment prerequisites.

No clinical performance or production readiness claim is made by this setup.

## Decision

Keep the existing architecture. Correct integration/configuration defects incrementally rather than replacing working components. Use a separate synthetic database for tests so application records are not modified. Retain exact source metadata precision instead of manufacturing medical provenance.

CORS reference: https://fastapi.tiangolo.com/tutorial/cors/
