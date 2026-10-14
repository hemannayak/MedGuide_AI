# App entry and profile setup — 2026-10-11

The branding route `/start` offers sign-in, registration, and a path back to marketing. The primary navbar Try MedGuide action opens this entry. Existing credential services are reused. Google access has an explicit unavailable state; no OAuth tokens or fake Google identities are created.

The two-step `/onboarding` form requires only a name and language. Village, age, gender, known allergies, and existing conditions are optional. Sample profile persistence is centralized in `src/lib/profile/setup.ts`, session-scoped, tied to the current session token, unavailable in live mode, and cleared on sign-out. Saved sample details appear through the existing profile hook. Successful setup opens `/app/chat`.

Live OAuth and profile save/read contracts must be connected from Laptop A. This UI does not implement clinical processing or real account verification. Use synthetic details only.

## Separate website and app presentation
Account screens use a focused app header, compact legal/help footer and responsive form composition. Marketing pages retain their editorial layouts. `/app/guide` brings product, workflow, safety, language, privacy and project topics into expandable app sections, with explicitly labeled links to deeper website content. Existing service layers and routes remain shared; this is not a separate native application or backend.
