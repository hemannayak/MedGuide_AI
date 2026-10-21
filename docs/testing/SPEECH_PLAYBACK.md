# Spoken chat playback

Implemented 11 October 2026 in the existing web chat.

Long replies are split into ordered segments below the TTS request limit,
preserving word boundaries and surrogate pairs. Stopping playback invalidates
pending synthesis, pauses active audio and releases the waiting playback step.
Late responses cannot start audio after cancellation. Unmount also cancels.
Speech errors are visible in the chat and the text answer remains available.
The previous silent browser-speech fallback was removed: unsupported browser
voices must not conceal provider failure or imply reliable Hindi/Telugu speech.

Validation: TypeScript passed; frontend suite 64 passed, one opt-in live check
skipped. Tests exercise multilingual segmentation, pending-request cancellation,
ordered playback and stopping during playback. Real microphone/physical-device
listening quality and accent accuracy remain unmeasured. Continuous listening
and turn detection are not implemented by this change.

Affected implementation: src/lib/audio/speech-playback.ts and
src/app/app/chat/page.tsx under frontend. No speech API contract was changed.
