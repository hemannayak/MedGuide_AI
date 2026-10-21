# Android login and chat branding — 11 October 2026

User-provided physical-device screenshots showed default blue Android buttons,
unreadable/missing placeholders and an empty chat surface. The screenshots also
showed that navigation from login to the authenticated chat had succeeded.

Implemented a shared native brand/button component, MedGuide cream/deep-green
palette, visible credential labels, explicit text/placeholder colors, rounded
50dp-minimum buttons with accessibility role and disabled state, a welcoming
empty chat state and keyboard-aware login/chat containers. Login scrolls on
short displays. No added dependency, backend change or native rebuild required
for the running development client. Other care screens still need visual polish.

Files: `mobile/src/components/brand-ui.tsx`, `mobile/src/app/index.tsx`,
`mobile/src/app/chat.tsx`, `mobile/src/app/_layout.tsx`.

Validation: TypeScript passed, Expo lint passed, all 28 existing mobile tests
passed (zero failures/skips). Relaunched the installed app through ADB. Updated
layout appearance, large text, keyboard overlap and TalkBack behavior still need
physical-device confirmation. The lowercase-m mark is a native wordmark accent;
full parity with the website's graphic assets is not yet verified.

The existing APK remains a development artifact; JavaScript changes load through
Metro. Standalone release packaging and the wider Android acceptance journeys
remain incomplete.
