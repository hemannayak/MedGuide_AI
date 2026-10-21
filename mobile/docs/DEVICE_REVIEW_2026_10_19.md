# Android review build — 19 October 2026

## Verified
- Built existing ARM64 debug variant with the installed JDK 17, Android SDK and Gradle 9.3.1, using the existing project short-path alias M:.
- `:app:assembleDebug -PreactNativeArchitectures=arm64-v8a --max-workers=2`: BUILD SUCCESSFUL in 6m 29s. 317 actionable tasks, 43 executed and 274 up-to-date.
- `apksigner verify`: exit 0.
- APK package org.medguide.ai; version 1.0.0; min SDK 24; target 36; ARM64 only.
- Review artifact: mobile/dist/apk/MedGuide-review-arm64-debug-20261019.apk.
- Bytes: 92,479,791. SHA256: FC19435ABDC3C7254DB9D8ADF667A1708EE999DBF13544E4FBECB287F35159EA.
- IPv4 Metro: http://127.0.0.1:8082/status returned packager-status:running. Earlier port 8081 instance remains IPv6-only. Existing website/backend/Ollama services were not stopped or changed.

## Device connection blocker
The user connected a moto g45 5G and reported authorization, but repeated actual `adb devices` outputs were empty. Windows sees it as a healthy WPD file-transfer device. Motorola Mobile Drivers Installation 6.4.0 is installed. Toggling USB debugging did not produce an authorization prompt according to the user. Restarting only ADB and rescanning did not discover a debugging device. No driver replacement or security-policy changes performed.

User reported Unable to load script on the phone. This is consistent with the existing development APK lacking access to Metro; it is not proof the newly built APK was installed. Cannot claim the error is resolved until an authorized debugging connection and runtime screen are observed. Wireless pairing was offered; no pairing address/code has been received and no wireless pairing performed.

## Next executable steps
1. Obtain user-authorized wireless pairing address/code on the same private Wi-Fi, or restore an authorized USB ADB connection. Pairing is separate from USB notifications. See https://developer.android.com/studio/run/device .
2. Once a device is listed as device, install the named APK with adb install -r.
3. Forward phone 8081 to host 8082, phone 8082 to host 8082, and phone 8000 to host 8000 with adb reverse. This preserves the phone's default Metro port while using the verified IPv4 host server.
4. Launch org.medguide.ai/.MainActivity and verify the actual branded screen and absence of runtime error. Capture only project-app synthetic screens with the user's cooperation.
5. Check sign-in, home shortcuts, navigation, keyboard and font scaling, then AI/speech permissions and editable transcript flow using synthetic data.
6. Test microphone denial, stop/cancel recording, playback stop, Hindi/Telugu language persistence, image selection/cancellation and explicit OCR review. Record actual outcomes individually; do not infer passing from mock-native unit tests.

This debug APK requires the laptop's Metro and backend connection. It is not a standalone production release. No HTTPS validation or release security was weakened. Production signing/HTTPS deployment and release-device testing remain pending. Mobile UI checks from the prior increment: TypeScript and lint passed; 43 tests passed. The website was not modified for this build.

## USB installation follow-up
The phone subsequently appeared as authorized. `adb install -r` returned Success for the named review APK. Applied phone 8081 → host 8082, phone 8082 → host 8082 and phone 8000 → host 8000. Launched org.medguide.ai/.MainActivity. A transient unauthorized state resolved on recheck without key changes. Foreground MedGuide activity and process were confirmed. Project-only screenshot mobile/dist/apk/device-screen-20261019.png shows Loading from localhost:8081, not the finished UI. Backend health and IPv4 Metro status both returned HTTP 200, but the development bundle request remained pending. No completed screen/login/audio journey claimed.

Attempt to restart only the confirmed port-8082 Expo server with two workers was rejected by automatic approval review because of the retained user instruction not to stop processes. That command did not run. Explicit permission for this narrow restart has been requested; no workaround attempted.

The user subsequently reported a building percentage. We did not interpret that response as restart permission and left Metro uninterrupted. A foreground device screenshot confirmed Bundling 98%. The earlier timed-out host request does not establish that the phone's longer-lived bundle request failed. Await actual render before marking the loading problem resolved.

## Render confirmed
Metro completed the Android development bundle (1,452 modules, 489250 ms). The same running server recovered without a restart; permission was not inferred from the user's percentage-progress message. A foreground physical-device screenshot confirmed the branded welcome screen with working-rendered account entry controls. The Unable to load script error is resolved for this observed launch. This verifies rendering only, not login/chat/OCR/audio journeys. Requested synthetic account sign-in as the next device check.

Observed white status-bar icons on the cream welcome surface. Added an explicit dark StatusBar in mobile/src/app/_layout.tsx using existing expo-status-bar, per https://docs.expo.dev/versions/v57.0.0/sdk/status-bar/ . Visual confirmation and fresh type/lint check follow. No website/backend source edits.
