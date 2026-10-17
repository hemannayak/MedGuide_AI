# MedGuide AI mobile

Isolated Expo / React Native app. The Next.js website in `../frontend` is independent; this app neither imports its runtime code nor modifies its routes, styles, authentication or dependencies.

## Run

Use Node.js 22.13 or later (Expo SDK 57 requirement).

```sh
cd mobile
npm ci
npm start
# Separate browser preview on port 8081:
npm run web -- --port 8081
```

Open the project in a compatible Expo Go app or a native development build. Android APK packaging is configured in `eas.json`; an APK has not been built or device-tested in this change.

## Design and navigation

`design/mobile-reference.png` records the approved generated design concept. Bundled rural imagery and licensed DM Serif Display / DM Sans fonts keep the cream, forest-green and terracotta identity local and independent of the website.

Welcome → Sign in / Sign up → Basic profile → Ask. The bottom navigation contains only Ask, My information and Profile. Voice review supports editing a sample transcript and sending it to the question composer. Information tools show intentional unavailable / empty states where backend services are absent.

## Integration boundary

This is UI work on Laptop B. Authentication and responses are simulated. Google OAuth, recording, speech processing, clinical assessment, document upload/OCR and record persistence are not connected. No real account is created. Use synthetic details; profile and session data stay in memory and clear on restart/sign-out. Language selection saves a UI preference; full translation is not claimed.

`src/services/api.ts` contains the service boundary and `EXPO_PUBLIC_API_BASE_URL` configuration for future Laptop A integration. Never put secrets in Expo public environment variables.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run export:web
```

Native keyboard, TalkBack/VoiceOver, Android back navigation, safe areas and APK installation still require physical device or emulator verification. The current machine has no working iOS simulator configuration.

## UI verification — 17 October 2026

- TypeScript and ESLint pass; six service validation tests pass.
- Web and Android JavaScript bundle exports pass. This is not an APK build.
- Browser walkthrough verified sample sign-in, setup, transcript editing → composer → sample response, information/profile navigation, invalid age handling and saving a sample profile.
- Phone widths 320 and 390, plus tablet width 768, were reviewed; the measured document width matched the viewport with no horizontal overflow.
- Screenshots are in `design/qa/`. No browser console errors were observed during the walkthrough.
- The complete pre-existing `frontend/` diff was compared byte-for-byte before/after this task and was unchanged.
- npm reports 28 dependency advisories (10 moderate, 18 high); dependency security remediation and native-device verification remain required before production distribution. No forced dependency upgrades were applied.
