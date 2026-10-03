# Main workspace — first design phase

Implemented a shared authenticated workspace shell with desktop sidebar, mobile drawer, active navigation, language preference, sign-out, preview notice, and professional-care boundary. Public marketing header/footer are suppressed on app routes; the existing emergency access strip remains.

Dashboard uses the existing profile service with loading/error states and an explicit synthetic-data label in mock mode. Removed hardcoded clinical details, relatives, and fabricated activity. Existing chat, symptom, document and medication routes are retained inside the workspace. New Profile is read-only because editing has no frontend API contract; Preferences reuses the existing browser language context. History remains an honest unavailable state rather than invented records.

Validation: production build, TypeScript and targeted lint pass; 45 tests pass, including the initial session gate for dashboard/profile/preferences. Browser mock sign-in reached the dashboard; mobile drawer navigation reached Preferences and dismissed on selection. No real account creation, medical input or backend work performed. Main shell and overview are the completed first design phase; detailed chat/symptom/document/medication visual refinements remain subsequent work.

Banner refinement: emergency access now renders once inside the main workspace column, with 44px touch targets and wrapping actions. Browser bounds verified banner left edge equals sidebar right edge on desktop; on mobile it starts at zero with no document overflow. The full preview strip is replaced by compact, expandable Demo mode information. Production build, TypeScript (after removing duplicate generated type artifacts), targeted lint and 45 tests pass.

Desktop sidebar collapse: explicit Collapse/Expand control switches 240px sidebar to 80px icon rail. Accessible link names and native title tooltips retained; main content and emergency banner follow the rail width. Mobile keeps the full drawer. Browser verified both widths and no overflow; TypeScript and targeted lint pass.
