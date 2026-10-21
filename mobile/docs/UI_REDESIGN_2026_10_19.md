# Mobile UI redesign — 19 October 2026

## Scope and requirement
Implement the approved Android design direction without altering the Next.js website or shared API contracts. Requirement: rural usability, large labelled controls, clear voice/transcript review, consistent care-record presentation. Existing Expo/React Native architecture retained, no dependency added.

## Implementation
- Shared cream/forest/sage/terracotta tokens and primary, secondary, quiet and stop-action buttons. Buttons retain accessibility labels, disabled states and minimum 50-unit height.
- Welcome/sign-in hierarchy and secondary account action; registration language buttons wrap rather than overflowing narrow screens.
- Home: prominent microphone action, text entry shortcut, prescription upload and care records tiles. Opening Talk does not automatically start a microphone recording.
- Home/Talk/Records/Settings navigation points only at existing screens. Chat navigation is disabled while requests/audio are active.
- Chat: scrollable controls, distinct patient/assistant text, prominent recording states, cancel audio and editable transcript review notice. Original real API, profile preference, consent and audio-hook logic retained.
- Care records, settings, profile, processing consent, prescription upload and review use shared controls and cream surfaces. Empty medication state is explicit; no fabricated medicines, schedules or delivered reminders.
- Safe-area treatment protects bottom navigation and headerless login/intro. No clinical rules, permission grant semantics, endpoints, authentication or data models changed.

## Files
src/components/brand-ui.tsx; src/components/mobile-nav.tsx; src/components/welcome-flow.tsx; src/app/_layout.tsx; index.tsx; register.tsx; home.tsx; chat.tsx; care.tsx; settings.tsx; profile.tsx; consent.tsx; prescriptions/upload.tsx; prescriptions/[id].tsx.
Test adapters updated for the shared button module and navigation component. New mobile navigation tests cover route destinations, selected state and disabling navigation during audio.

## Verification
- TypeScript --noEmit: passed after correcting an out-of-scope pressed state in the shared button implementation.
- npm run lint: passed.
- node --test tests/*.test.cjs: 43 passed, 0 failed. These use mocked transport/native modules and do not establish device or live clinical functionality.
- Next.js frontend/src aggregate SHA256 before and after: A22A21493EE755B6DCE57D0BFF2D19EFB3254650204400B4F8C1DECE708DE179. Website source preserved.
- Initial Android export failed writing its sandbox temporary Hermes file. Normal-permission retry passed: 1288 modules, 2.9 MB Hermes bundle exported to mobile/dist/ui-review. This is an Android JavaScript bundle, not a newly built installable APK.
- ADB: no connected device at latest check. Physical-device layout, keyboard, font scaling, TalkBack, recording/playback and navigation checks remain pending.

## Limits and next checks
This is an implementation increment, not Android release completion. The raster concept is a visual reference, not a screenshot of implemented screens. Full Hindi/Telugu interface localization remains incomplete; language choices and speech behaviour are preserved. No measured WCAG compliance, real-speaker speech accuracy or clinical validation claimed. Source/retrieval coverage issues are separate and not fixed by these UI changes.

Docs checked: Expo SDK 57 https://docs.expo.dev/versions/v57.0.0/ ; Expo Router https://docs.expo.dev/router/introduction/ ; React Native Pressable https://reactnative.dev/docs/pressable .


Mobile dev server: started separately at http://localhost:8081; status endpoint returned packager-status:running (IPv6 loopback ::1). No existing server was stopped. Website /login returned HTTP 200 after these changes. Phone remains absent from adb devices at final check; USB reverse/device connection and screenshot review remain pending. Connect the phone and authorize debugging before claiming device verification.
