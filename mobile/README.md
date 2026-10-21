# MedGuide Android client

React Native/Expo SDK 57 client sharing the existing FastAPI backend.
Implemented foundation: existing-account login, encrypted token storage,
three-language text chat, conversation continuity, sources, consent choices,
recorded speech with editable transcript, segmented spoken replies and sign-out.
No duplicate model, database or mock patient service is introduced.

Copy .env.example to .env and configure EXPO_PUBLIC_API_BASE_URL. This is a public
service URL, never an API key. A physical phone cannot reach the computer through
localhost; use a reachable development endpoint. Release builds require HTTPS.

Commands: npm install; npx expo start; npx tsc --noEmit;
npx expo lint; node --test tests/*.test.cjs.
Android builds require a configured Android SDK/JDK or an explicitly chosen
remote build setup. Do not treat an exported JavaScript bundle as an APK.

Pending: registration/profile/care screens, continuous voice, offline sync, physical-device
verification, installable APK and release security/dependency review.
Initial template installation reported dependency advisories; resolve and audit
them before release. This is a connected client foundation, not a finished app.
