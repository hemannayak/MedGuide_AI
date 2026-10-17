# Laptop A mobile UI handoff

## What is included

An independent React Native / Expo SDK 57 application in `mobile/`, with its own package manifest, lockfile, assets, routing, tests and build configuration. The Next.js website remains in `frontend/`. An accompanying separate commit restores its original marketing-style account screens and web entry routes, as requested before the native app work began.

Mobile journey: Welcome → Sign in / Sign up → Basic profile setup → Ask MedGuide. Three primary destinations: Ask, My information, Profile. The voice review screen edits a sample transcript and transfers it into the question composer. Documents, medication information, symptom input and saved conversations have explicit preview or unavailable states.

## Run after pulling

Use Node.js 22.13 or newer.

```sh
cd mobile
npm ci
npm start
```

For a separate browser preview:

```sh
npm run web -- --port 8081
```

Keep the website on its existing port, normally 3000. Do not move mobile screens into `frontend/`.

## Laptop A integration work

- `src/services/api.ts` is the mobile service boundary. Current authentication and chat responses are simulated, not real requests.
- Copy `.env.example` to `.env.local` and supply `EXPO_PUBLIC_API_BASE_URL` for the backend. A physical phone needs the laptop's reachable LAN address, not `localhost`.
- Setting this variable alone does not connect the mock functions. Replace them with authenticated requests after checking the actual backend request/response contracts.
- Connect account registration/login, authorised profile persistence, conversations/history, document processing, medications and speech services incrementally.
- Google sign-in is unavailable until its actual backend/provider flow is integrated. Do not replace it with a fabricated login token.
- Profile and session state are in memory. No credentials, tokens or health records are persisted by this UI preview.
- Voice recording, speech recognition, OCR, triage and clinical retrieval are not implemented in this mobile app. Do not treat its sample output as a clinical assessment.
- Language selection stores a preference; full translated interfaces and speech services still need integration and language-specific evaluation.

## Validation and remaining work

TypeScript, ESLint and six service validation tests pass. Web and Android JavaScript bundles export successfully. Browser walkthroughs covered setup, transcript editing, sample submission, information/profile navigation and age validation; widths 320, 390 and 768 were reviewed. Screenshots and the approved visual reference are in `design/`.

An Android JavaScript bundle is not an installable APK. `eas.json` provides an internal preview APK configuration, but an APK has not been built or device-tested. Native keyboard, safe-area handling, Android back navigation, screen readers, and installation require physical-device/emulator verification. npm currently reports 28 dependency advisories; review them before production distribution without blindly applying breaking upgrades.

## Useful commands

```sh
npm run typecheck
npm run lint
npm test
npm run export:web
npx expo export --platform android
```

All medical reasoning, safety rules, RAG, OCR, database and authentication infrastructure stay on Laptop A. Keep patient data minimised, use synthetic development inputs, and verify sources and clinical rules before connecting real guidance.
