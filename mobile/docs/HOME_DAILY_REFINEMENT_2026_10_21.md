# Compact Home and daily progress — 21 October 2026

## Scope and layout
- Mobile client only for this refinement; website source and existing processes were not stopped or changed.
- Removed Home's duplicated “How can we help today?” / voice hero / type-question block. Existing /chat remains the dedicated text/voice/language journey via the Talk navigation item.
- Home prioritizes greeting, resumable setup when incomplete, compact water/step rings, prescription and care shortcuts. Logging and settings controls expand only on request.
- Moved detailed health overview into Profile's measurements section. Existing records, timeline, prescription upload and conversation routes remain available.

## Tracking behavior
- Integer ml remain the API/storage unit. Water display and target editing use litres, including fractional servings. No universal target is assigned.
- Quick servings: 0.15, 0.25 and 0.5 L. Custom ml entry remains supported. Saving a target uses the existing patient-owned wellness settings endpoint and explicit optional-storage choice.
- Saved daily totals use local calendar-date keys. New-day reads do not delete prior entries. Synthetic integration test verifies yesterday's data remains while today's total begins at zero.
- Expo Pedometer.watchStepCount supplies native sensor events after an explicit enabled/consented session and OS permission. Real callback counts update the UI and synchronize snapshots every five seconds while events arrive. The backend retains the maximum snapshot per session operation ID, preventing repeated deltas from inflating totals.
- Live totals include only the unsynchronized part of the session; committed values are not counted twice. Old-day sessions do not inflate a new day's display.
- Sensor subscription and scheduled synchronization are stopped on background/unmount. Unsent snapshots retain an owned retry reference. Browser/unsupported/denied states never create sensor readings. Foreground session tracking is not background/full-day Health Connect tracking.
- Manual logging is disabled during an active sensor session to protect the existing single-entry retry store. Stop/save the session before manual entry.
- Notification/reminder delivery is not added or represented as available by this change.

## SVG fix
Ring now uses the SVG transform attribute `transform="rotate(-90 40 40)"`. It does not forward `origin`, `rotation` or `transform-origin` through react-native-svg to React DOM. The circle geometry and circumference-based progress are retained, with a smaller viewport for compact cards. No warning suppression.

## Evidence
- TypeScript: exit 0.
- Mobile full suite: 60/60 passed.
- Lint: exit 0, 5 existing unused-variable warnings; no errors.
- Backend targeted wellness suite: 7/7 passed, including day rollover/history, patient ownership, duplicate retries and monotonic sensor snapshots. Full backend suite passed 323 tests in the preceding integration increment; not rerun wholesale for this client-only refinement.
- Connected mobile app http://127.0.0.1:8084/home uses backend http://127.0.0.1:8001/api/v1 . Both existing review services responded successfully; no process restart.
- Real browser user-flow check on SYN-review-20261015@example.invalid: saved synthetic target 2.5 L, logged 0.25 L, reloaded and observed 0.25 L / 2.5 L. This is test data, not a recommended personal target.
- Talk navigation opens the real chat route with language controls, Record and editable text. Header Back returns Home with saved data intact.
- Browser rendered the progress rings without the reported SVG error overlay. Screenshot evaluation/mobile-home-compact-2026-10-21.png is a crop of the mobile panel; full screenshot retained alongside it.
- Android physical sensor, native permission revocation and device battery/background behavior remain unverified. User chose preview-only continuation. Unit sensor fixtures are not real walking measurements.

## Files
mobile/src/components/home-view.tsx; mobile/src/components/daily-dashboard.tsx; mobile/src/components/health-overview.tsx; mobile/src/app/home.tsx; mobile/src/app/profile.tsx; mobile/src/lib/daily-progress.ts; mobile/tests/daily-dashboard.test.cjs; backend/tests/test_wellness.py.

Reference: https://docs.expo.dev/versions/v57.0.0/sdk/pedometer/ (foreground delivery limitation and native permission/watch APIs).

## Follow-up: restore fuller Home and Profile-only goals
The user clarified that only the carousel should be removed. Restored village artwork, health overview, conversation hero, Type a question, richer prescription/care cards and timeline link; no carousel restored. Added native SVG water-drop and footprint artwork inside progress rings. Removed water/step goal editing from Home (including optional onboarding goal inputs); both now live under Profile → Daily goals, with litres converted to integer ml for storage. Home retains intake logging and sensor controls. Home reloads patient preferences on focus so Profile changes are reflected after returning. Browser verified restored sections, icon rendering, absence of Home goal fields and Profile's Daily goals section showing the saved 2.5 L synthetic target. No goal was changed in this follow-up. Final checks: TypeScript passed, 61 mobile tests passed, lint passed with 5 existing warnings. Evidence: evaluation/mobile-home-restored-2026-10-21.png. This follow-up supersedes the earlier compact Home layout decision.

## Contextual walkthrough and Home ordering
Removed the Home health overview; measurements remain in Profile. Daily tracking now follows Type a question and precedes prescription/care shortcuts. Added an inline four-step walkthrough attached to actual controls, with previous/next/skip, optional device spoken guidance, replay from Home, and automatic entry at the final persisted onboarding step. Finish/skip persists existing onboarding completion; errors remain visible. Uses no new permissions or dependencies. Native OS dialogs remain contextual to actual feature use; browser preview cannot demonstrate Android health-data dialogs. Validation: TypeScript passed; 62 mobile tests passed; lint has existing warnings only. Browser confirmed reordered content; walkthrough browser interaction verification was interrupted by a browser timeout.

Final follow-up validation: lint exit 0 (five existing warnings); TypeScript rechecked after lint fix. Browser reload and fresh-tab navigation timed out and displayed a blank preview; no render error was exposed. Runtime walkthrough verification remains pending. No process was stopped or restarted. Current new contextual tip text and spoken tips are English; existing setup language choices remain available.
