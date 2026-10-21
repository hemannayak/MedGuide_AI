# Android recorded voice increment — 11 October 2026

Uses Expo Audio SDK 57 and the existing authenticated /speech/stt and /speech/tts
contracts. Backend/model architecture is unchanged. AudioModule permission is
requested only after an explicit record action and a current speech grant.
Recording is M4A/AAC under HIGH_QUALITY; multipart filename/type are .m4a/audio/mp4.
No explicit multipart Content-Type is set, preserving the transport boundary.

Flow: consent check -> device permission -> recording -> bounded local file ->
authenticated STT -> editable transcript -> explicit Send -> existing chat API ->
text reply -> segmented spoken reply. Manual Read reply aloud is also available.
Old turns retain their language for replay. Provider failures remain visible.

Recording is limited to 60 seconds as a product limit, not a medical threshold.
The file must be nonempty and within the backend 10 MB upload limit. Used audio
files are deleted after transcription success/failure. Cancellation invalidates
late transcript/TTS results. App backgrounding/unmount cancels audio. Temporary
reply files are removed after playback/cancellation. Native players are disposed.
Background recording and playback are disabled in the native configuration.

Validation: 11 automated tests passed, TypeScript passed, Expo lint passed,
Android bundle export passed. Tests use synthetic data and mocked native modules;
they do not establish actual device recording/playback or speech accuracy.
Java/adb were not on PATH and the conventional SDK directory was absent.
An APK/device run remains required; never call bundle export an installed app.

Next acceptance checks: install a development build; configure reachable backend
HTTPS; verify login and separate consent; record actual speech in en/hi/te; review
transcript; send and listen; cancel during recording/upload/TTS/playback; background
the app; deny microphone; revoke consent; interrupt network; inspect cache cleanup.
Measure speech accuracy and human comprehensibility separately. Continuous turn
detection, streaming, full UI localization and clinical validation remain pending.

References read before implementation:
- https://docs.expo.dev/versions/v57.0.0/sdk/audio/
- https://docs.expo.dev/versions/v57.0.0/sdk/filesystem/
