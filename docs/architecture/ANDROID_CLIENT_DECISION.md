# Android client decision — 11 October 2026

Requirement: user-approved full-featured Android client and web application,
sharing FastAPI, PostgreSQL/pgvector, authentication and model services.

Existing approach: Next.js web application with no separate mobile client.
Add React Native with Expo SDK 57 and TypeScript; keep the web/backend intact.
Use Expo Router and encrypted SecureStore token storage. Local Android builds
remain possible; no paid remote build service is mandatory.

Alternatives: Kotlin native offers direct platform control but adds a separate
language/toolchain; Flutter adds Dart and a separate UI ecosystem; a PWA reuses
web UI but does not satisfy the requested separate Android client.

Advantages: existing React/TypeScript knowledge and shared API contracts.
Disadvantages: separate mobile UI maintenance, native build tooling, dependency
review and physical-device testing. Migration impact: none on existing database
or model inference; a new mobile directory and public backend URL configuration.

First implemented slice: existing account login, secure session, multilingual
text chat, conversation continuity, evidence display, sign-out and visible errors.
Android bundle export, TypeScript, lint and three contract tests pass. Physical
device/APK, mobile audio/care/offline and release dependency review are pending.

Official references:
- https://docs.expo.dev/versions/v57.0.0/
- https://docs.expo.dev/router/installation/
- https://docs.expo.dev/versions/v57.0.0/sdk/securestore/
- https://docs.expo.dev/guides/local-app-overview/
