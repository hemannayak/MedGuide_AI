# Mobile artwork, first-use guide and accessibility — 21 October 2026

Scope: mobile only. No frontend or backend source changed in this increment. Existing uncommitted Antigravity work retained.

## Changes
- Sign-in / welcome headings now sit below the bundled village artwork, without covering the image. Larger artwork and existing code-native healthcare SVG illustrations are reused. No new remote image hosts or text baked into images.
- Registration has village artwork and stacked password fields. Successful registration returns to sign-in (registration does not create an authenticated session).
- Four-step English/Hindi/Telugu first-use guide appears after first authenticated Home load, with Skip, Back, Next, spoken step, and replay from Home. A versioned account-scoped flag records completion only; unavailable storage shows the guide again. Account/API loading failure shows retry.
- Removed fake pre-granted switches. Installed-app permission buttons request real OS microphone/camera permission. Declining access allows continuing. Processing consent remains a separate authenticated flow. The design preview does not request OS access or mutate consent.
- Added SDK-compatible expo-speech (~57.0.3) for device UI guidance, replacing native simulated timer. Selects a matching installed voice, shows an unavailable-language message instead of using a wrong-language voice, cancels pending speech on stop/background, and handles errors. No voice quality or device-language guarantee inferred from unit checks.
- Recorded exact commands MedGuide help / med guide help / मेडगाइड मदद / మెడ్‌గైడ్ సహాయం trigger spoken Talk instructions instead of submitting a health question. Recording still requires explicit activation and speech-processing consent. No background listening, silent microphone grant or automatic health submission.
- Screen-reader announcement for guide steps and labelled buttons. Android TalkBack/Voice Access are the entry paths for users who cannot operate touch controls; this is not a complete independently validated hands-free application.
- Preview profile no longer loads a real patient profile. Synthetic registration preview is labelled, consent defaults off. Preview simulations do not establish backend functionality.

## Validation
- TypeScript passed after implementation.
- Tests: 46/46 passed before adding three onboarding/permission tests; those three also passed. Final complete suite result recorded below after final run.
- Corrected test harness imports for Antigravity-added Platform, illustration, language and audio modules. Existing auth/permission-denial/cleanup assertions retained. Old timed-intro tests replaced with current static welcome accessibility/account-entry tests; cinematic opening remains pending.
- Browser checked: sign-in artwork with heading below; register artwork with unchecked consent; Telugu guide; preview permission navigation. Browser does not prove native permission behavior or audible device TTS.
- User requested preview-only continuation; ADB lists no phone. No native rebuild/device accessibility validation performed for this increment. Existing APK predates expo-speech and needs rebuilding before native use.

## Remaining acceptance work
- Install freshly rebuilt APK and verify actual OS dialogs (first request, denial, permanent denial and settings return), no unexpected permission prompts.
- Real TalkBack focus order, large font, switch/Voice Access navigation and users with assistive needs.
- Actual English/Hindi/Telugu guidance playback, voice availability/download, audio interruption and recorder/player coexistence; no real-speaker speech-quality results claimed.
- Permission-screen UI still needs full Hindi/Telugu translation. Full application-wide accessibility/localization audit remains open.
- Always-listening wake phrase is not implemented. It requires a separate foreground listening design, explicit opt-in, supported offline keyword engine and evaluation; existing recorded help phrase is not advertised as always-on.
- Dependency install reports 28 audit findings (10 moderate, 18 high). No force upgrade applied; dependency remediation remains separate release work.

Primary implementation references: https://docs.expo.dev/versions/v57.0.0/sdk/speech/ ; https://docs.expo.dev/versions/v57.0.0/sdk/audio/ ; https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/ ; https://reactnative.dev/docs/0.86/accessibilityinfo .

Final checks: TypeScript exit 0; complete mobile suite 49/49 passed; lint 0 errors with 5 existing unused-variable warnings. Browser confirmed guide Skip returns Home and Home reopens guide. Screenshot: evaluation/mobile-guide-2026-10-21.png.
