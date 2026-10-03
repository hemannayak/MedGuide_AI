# Navigation and marketing audit — 2026-10-03

The header now provides four direct discovery links (Product, How it works, Safety, About), visible Sign in, and a forest-green Try MedGuide CTA. Detailed technology, speech, source, accessibility, research, contact and legal destinations remain in the footer. Header and footer deliberately serve different depths; essential public destinations may overlap for usability.

Header spacing uses a constrained content width, consistent touch targets, cream background, forest-green text and restrained terracotta active/focus treatment. Mobile navigation starts at 900px, keeps Sign in visible, exposes account creation, supports Escape with focus restoration, and dismisses on outside pointer interaction. Motion respects reduced-motion preferences.

Browser audit: 16 routes including all main marketing pages, accessibility/contact/legal pages and login/register at measured CSS widths 1433, 769 and 358px. No horizontal document overflow, broken loaded images, missing Sign in or multiple h1 headings found. Desktop sign-in composition visually inspected; password visibility toggled both ways; empty sign-in submission focuses the required identifier. Mobile menu opening/closing verified. Signup form fields, language/role controls, acknowledgement and sign-in link inspected without creating an account or accepting terms.

Validation: production build, TypeScript and targeted navbar ESLint pass; 44 frontend tests pass, including public routes/fragments, focused header versus footer directory, mock authentication/session/error behavior and FAQ filtering. These are frontend checks, not live authentication, backend integration or measured Core Web Vitals. Authentication remains explicitly in preview/mock mode until Laptop A integration.
