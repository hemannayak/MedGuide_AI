# Connected verification and Android care increment — 11 October 2026

Current backend restarted on loopback port 8000 with configured provider access.
The opt-in backend/live_connected_check.py --run creates an explicitly synthetic
development account; it does not print tokens, identifiers, transcript text or
provider audio. The account remains in the development database.

Measured HTTP checks: absent speech consent returned 403; granted consent allowed
real TTS/STT in en/hi/te with nonempty audio/transcripts; withdrawal returned speech
access to 403. English explanatory chat returned HTTP 200, INFORMATIONAL and four
source records. This does not assess citation faithfulness or clinical accuracy.
Structured evidence: evaluation/connected_check_results.json.

Backend suite: 258 passed, four deprecation warnings. Web: 64 passed, one optional
live check skipped, TypeScript passed. Android audio: 11 tests, TypeScript and
lint passed before the care increment. No SDK/JDK/adb installation was found in
the checked common locations; no physical-device/APK verification was performed.

Android care addition uses existing authenticated patient API routes: medication
and follow-up viewing, prescription-record count, and profile name/language
editing. Errors remain visible; a failed request does not become a fake empty
success. Unverified medication status remains explicit. Profile inputs validate
length before PATCH. No new backend contract or database migration is needed.

Android prescription upload, medication scheduling/adherence,
notification delivery, timeline and worker screens remain subsequent increments.
Phone tests and release dependency remediation remain required.

Post-care Android validation: 14 tests passed; TypeScript and lint passed.

Subsequent prescription review: individual records, OCR text and explicit
original-document confirmation added. Mobile tests now pass 18; TypeScript,
lint and Android Hermes export pass. See ANDROID_PRESCRIPTION_REVIEW.md.
