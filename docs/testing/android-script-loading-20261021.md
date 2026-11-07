# Android script loading repair

The installed debug app tried to load `index.android.bundle` from APK assets.
The Expo host's default `useDevSupport` refers to React Native's library build
configuration. The app launcher now explicitly passes `BuildConfig.DEBUG` from
MedGuide, enabling Metro for debug builds while leaving release support disabled.

Metro also excludes generated Android compiler directories from its file map.
App source and Expo's existing exclusions remain available.

## Local Windows build

Use the existing JDK and Android SDK environment variables and a short Gradle
user home, such as the repository's ignored `.g` directory. From `mobile/android`,
run the existing Gradle executable with:

```text
--init-script ../scripts/windows-native-paths.gradle :app:assembleDebug -PreactNativeArchitectures=arm64-v8a -PreactNativeDevServerPort=8084 --max-workers=1 --console=plain
```

The optional init script uses CMake object-path hashing and a shorter native
staging directory. It changes build output locations, not Windows policies.
No dependency or framework replacement is required.

## Verification recorded

- Android debug build succeeded and APK signature verification passed.
- APK installed with `adb install -r`, retaining existing app data.
- Installed artifact: `mobile/dist/apk/MedGuide-review-arm64-debug-20261021.apk`.
- SHA256: `105BD324E4451E7552D93BE00CA4F05F1813ACEE37AFFFD7B1F2C0EB8FB1FF07`.
- Android Metro bundle, both mobile preview pages and mobile API health returned HTTP 200.
- Metro configuration lint and generated-directory exclusion checks passed.
- Phone screen confirmation is still pending; installation alone does not verify the UI.

This development APK requires the laptop's Metro server. USB forwarding maps
phone ports 8081 and 8084 to laptop port 8084, and phone port 8001 to API port 8001.
Release packaging and full end-to-end feature testing are separate checks.
