# Mobile design concept — 19 October 2026

Design exploration generated with the built-in imagegen tool. This is a raster reference, not an implemented Android screen or proof of working functionality.

Prompt brief: six Android screens in a consistent cream, deep-green, sage and terracotta visual system: sign-in with English/Hindi/Telugu, voice-first home, recording controls, editable transcript confirmation, unverified prescription review and medication empty state. Large labelled touch controls, simple navigation and no fabricated medical results. Full request included only synthetic/example document content, no clinical claims or treatment advice.

Artifact: medguide-mobile-concept-v1.png.

Review observations: consistent visual hierarchy and understandable primary controls. This concept uses English body copy while showing Hindi selection; implementation must localize the full screen for the chosen language. Username/password must have persistent labels, not only placeholders. Raster contrast is not a measured WCAG result; verify actual implementation tokens, focus order, screen-reader labels, font scaling and touch targets. Decorative mark is exploratory; reuse established project branding during implementation rather than treating this image as a final logo. Sample prescription fields remain explicitly unverified. Do not enable medication schedules from unreviewed OCR.

Current functionality checks: local frontend /login, backend /api/v1/health and Ollama /api/tags each returned HTTP 200 on this date. This is availability only, not full user-flow verification. Childhood dehydration retrieval gap documented in docs/testing/WEB_REVIEW_DEMO_2026_10_15.md remains open; do not present it as fixed by this design work.

Next implementation increment: apply shared mobile theme and navigation to existing Expo screens; preserve real API/auth/consent flows and audio lifecycle fixes, then run mobile type checks/tests and physical-device user journeys. Follow with reviewed-source ingestion and regression evaluation for unsupported suggested chat questions.
