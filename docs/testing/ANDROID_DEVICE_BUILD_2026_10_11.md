# Local Android device build — 11 October 2026

## Scope and current evidence

This is a development APK test against the local shared backend, using synthetic
accounts and prescription documents. It is not a production release or clinical
validation. FR-13 remains PARTIAL until upload and review work on an actual device.

- Expo prebuild generated the Android native project successfully.
- Microsoft OpenJDK 17.0.20.1 Windows x64 ZIP was verified against its publisher's
  SHA-256 file, extracted under ignored `.android-tools/java`, and `java -version`
  succeeded.
- Google's command-line tools build 15859902 archive was verified against
  SHA-256 `90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a`.
- The user explicitly authorized accepting the Google SDK licence and installing
  the SDK. Required SDK packages installed; APK and device checks are pending.
- Generated native files and portable toolchain are ignored, not source assets.

Required packages from the installed React Native build configuration:
`platform-tools`, `platforms;android-36`, `build-tools;36.0.0`,
`ndk;27.1.12297006`, `cmake;3.22.1`.

### Build attempt evidence

- Mobile TypeScript and lint passed; `node --test tests/*.test.cjs` passed all
  28 tests (zero failures/skips). These do not substitute for native testing.
- Gradle wrapper download timed out. The official Gradle 9.3.1 ZIP was downloaded
  separately, checked against its publisher's SHA-256 and extracted locally.
- First native attempt compiled 28 Gradle plugin tasks, then failed downloading
  `build-tools;35.0.0` because the connection was aborted. The current SDK manager
  successfully installed that additional package; a second build was started.
- Metro is running at localhost:8081 with the loopback development API setting.
- Windows detected a Motorola phone as a WPD file-transfer device, but ADB found
  no connected debugging device. User reported no USB-debugging prompt.
- Motorola's official 64-bit MSI was downloaded from its support page and its
  Authenticode signature verified as Valid, publisher Motorola Mobility Inc.
  The user needs to review/install it on Windows, then reconnect the phone.

### Phone connection and Windows path recovery

- Phone debugging subsequently authorized: ADB state `device`, Android 15,
  ARM64 supported. Device serial is intentionally omitted.
- Forwarded ports 8000 (backend) and 8081 (Metro) using `adb reverse`.
- The second build reached 406 tasks but failed in Ninja because a generated C++
  object filename exceeded Windows' 260-character limit.
- Created a reversible `M:` drive alias to the existing project with `subst`.
  Archived the generated app `.cxx` cache under `.android-tools/previous-app-cxx`
  and restarted the same Gradle build from `M:\mobile\android`, four workers,
  `NODE_ENV=development`, ARM64. No source/native code or OS security policy was
  changed. Leave the alias in place while building; it can be removed afterwards
  with `subst M: /D` when no tool is using it.
- Metro `/status` responded `packager-status:running`.

### APK build and installation evidence

- Short-path build: **BUILD SUCCESSFUL in 5m 23s**, 422 actionable tasks
  (112 executed, 310 up-to-date), ARM64 debug variant.
- APK: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`, 84,183,314 bytes.
- SHA-256: `528ac882c5769aa9139441349e218fe218289fb4b167a499c96b5eacff541453`.
- `adb install -r` returned **Success** on the authorized physical phone.
- `adb shell am start -n org.medguide.ai/.MainActivity` accepted the launch.
- Runtime screen, login and prescription/voice journeys are still pending.
  Installation/launch commands do not prove that the app rendered successfully.

No completed device journey, WER or clinical quality result is claimed yet.

### Development bundle connection repair

The user supplied an actual device error screen: `Unable to load script`.
Metro was listening only on IPv6 `::1:8081`; its IPv4 status request failed.
Restarted the verified Expo process with process-scoped
`NODE_OPTIONS=--dns-result-order=ipv4first`, the same localhost port and API URL.
The IPv4 status request then returned `packager-status:running`. Reapplied both
USB reverse rules and force-stopped/relaunched MedGuide. Metro received the
device bundle request. Android bundling succeeded (1,440 modules); the user then
confirmed the login screen is visible on the physical phone. The app process was
running and the filtered AndroidRuntime/ReactNativeJS error check returned no
errors. Authentication and subsequent care journeys remain pending.

When starting Metro for this USB test on Windows, set the IPv4 DNS option in
the same PowerShell process before `npx expo start --localhost --port 8081`.
No system-wide network setting or production HTTP restriction was changed.

### Released audio-recorder repair

After a design update the physical device reported a render error from
`cancel()` reading `recorder.isRecording` after Expo had released the recorder.
The installed SDK's `useAudioRecorder` uses `useReleasingSharedObject`.
Cleanup now invalidates pending work and avoids recorder access after the hook
is inactive; asynchronous cancellation also avoids reading its URI after
unmount. Added a regression mock whose native property throws after release.
TypeScript/lint and all 29 mobile tests passed. Attempted a full phone restart,
but ADB returned `no devices/emulators found`; the phone needs reconnecting.
Physical confirmation and record/stop/background journeys remain pending.

## Connection and test procedure

1. Connect a phone with a USB data cable. Enable Developer options and USB
   debugging; accept this computer's authorization on the unlocked phone.
2. Check `adb devices`: exactly one intended phone must have state `device`.
   `unauthorized` requires accepting the prompt; no device may require a different
   cable or the manufacturer's official Windows USB driver.
3. Set `JAVA_HOME` and `ANDROID_HOME` only in the build process to the project-local
   toolchain. Build the debug variant with the generated Gradle wrapper.
4. Start Metro with `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1`.
   Forward device ports using `adb reverse tcp:8000 tcp:8000` and
   `adb reverse tcp:8081 tcp:8081`. Keep the backend bound to computer loopback.
5. Install the debug APK and launch `org.medguide.ai`. This development APK needs
   Metro; it must not be represented as a standalone release artifact. Production
   API HTTPS validation remains enabled.
6. Sign in with a labelled synthetic patient account. Verify consent and chat,
   English/Hindi/Telugu text and voice, permission denial, transcript correction,
   playback stop and interrupted networking. Record observed outcomes separately
   from automated checks.
7. Put a labelled synthetic PNG in the test gallery. Verify picker cancellation,
   explicit upload consent, image upload, OCR result and correction/review. Check
   that unverified medication cannot create an active schedule.
8. Test camera denial and camera selection, repeated taps, app backgrounding,
   expired login, failed upload recovery and an upload whose response times out.
   Check existing records before retrying an ambiguous completed upload.
9. Record APK path, SHA-256, device Android version, test outcomes and remaining
   failures. Do not retain device identifiers or private screenshots in reports.

## Release work still required

An independently runnable release APK requires a reachable HTTPS backend,
appropriate signing, release configuration and its own install/user-flow checks.
Do not weaken API security to reuse the loopback debug configuration in release.

Official references: [Microsoft OpenJDK](https://learn.microsoft.com/en-us/java/openjdk/download),
[Android SDK tools and licence](https://developer.android.com/studio),
[Expo local builds](https://docs.expo.dev/build-reference/local-builds/).
