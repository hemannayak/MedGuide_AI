# Responsive mobile workspace — 2026-10-09

Keep the existing Next.js application for phone, tablet and desktop support. No separate native application or new runtime dependency introduced.

Phones use persistent five-destination bottom navigation: Overview, Ask MedGuide, Documents, Profile and More. More opens the existing drawer for all other tools. Active state, accessible names, generous controls and safe-area bottom padding are provided. Dashboard tools become compact icon/text rows; the question panel gets a full-width touch CTA. Larger screens preserve desktop sidebar and collapse behavior; tablets have a narrower sidebar. Motion respects reduced-motion preferences.

Browser checks: mock login, mobile dashboard visual inspection at 373 CSS px, bottom navigation to Profile, More drawer, Escape dismissal, no horizontal overflow on the inspected mobile/profile screen and at 769/1433 CSS px. Production build, TypeScript, targeted lint and 50 existing frontend tests pass. Screenshot: screenshots/mobile-workspace.png.

This is the responsive workspace and dashboard design pass. Existing individual tool pages retain their functionality; it does not establish native installation, offline support, backend connectivity or clinical readiness.

## Rural navigation refinement — 2026-10-09

Replaced the five mobile destinations and seven primary sidebar links with Home, Ask MedGuide, and My information. The new `/app/information` hub links to existing document, medication, symptom, profile, and preference screens. Home retains quick tool access with shorter instructions. New interface copy includes Hindi and Telugu entries; existing mock service boundaries remain visible.

Validation: production build, TypeScript, targeted ESLint and all 50 existing tests passed. The information route was added to the session-gate regression check. Browser walkthrough verified mock sign-in, Home → My information, mobile drawer and Escape dismissal. No horizontal overflow at CSS widths 373, 769 and 1433. This pass changes navigation and orientation; it does not validate connected clinical, speech or OCR services.
