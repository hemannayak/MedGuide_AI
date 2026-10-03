# Authentication and website interaction QA

The existing Next.js/React/TypeScript architecture and API-mode configuration are preserved. Sign In and Sign Up reuse the existing login/register contracts. No backend, OAuth provider, email delivery, verification system or mobile download was introduced.

## Experience and changes

Sign In and Sign Up have distinct intent, supporting copy, fields and actions within the shared MedGuide design. Onboarding focuses on language and medical/privacy boundaries rather than prefilled health details that were never persisted. Registration retains account type and optional phone.

Silent network-error sign-in and simulated Google tokens were removed. API failures remain failures. A shared utility manages session-only and remembered tokens; sign-out clears both. Requested app-entry redirects are preserved. Frontend token presence is not server authorization; authorization remains the responsibility of the connected backend.

Recovery/verification explicitly explain unavailable delivery. Footer groups, natural imagery, village line art and SVG social marks follow the new reference direction. Subscription input is disabled; the adjacent control explains availability without collecting email. Social controls explain missing verified destinations. The two requested repeated statements were removed; medical boundaries remain in Safety and Medical Disclaimer.

Mobile availability is distinct from web entry. Three missing prescription/history destinations now show protected availability pages. Decorative device previews no longer obstruct final CTAs.

## Browser verification

- Synthetic mock sign-in reached the requested `/app/chat` destination, survived refresh and signed out.
- Password visibility and mismatch validation worked.
- Synthetic registration opened onboarding; completion entered the workspace.
- Sign In ↔ Sign Up navigation worked.
- Auth layouts fit 358, 477, 769, 1022, 1269 and 1910 CSS pixels with one main landmark and no horizontal overflow.
- Public, recovery and onboarding routes fit the 358-pixel viewport.
- Mobile navigation opened, closed and responded to Escape.
- Mobile availability worked with pointer and keyboard input after fixing a decorative-device obstruction.
- Newsletter/social controls produced clear availability messages. Final inspected browser error logs were empty.
- Existing Motion is reused for restrained entrance/reveal/flow transitions. Reduced-motion behavior is retained; no measured Core Web Vitals or clinical performance is claimed.

## Automated verification

Production build, TypeScript and targeted lint checks pass. There are 37 regression checks covering public routes/links/metadata, auth structure, session persistence/clearing, rejected return destinations, recovery availability, protected repaired routes and authentication HTTP/network failures.

## Remaining service connections

Real credentials/account storage, server authorization, reset/verification delivery, newsletter delivery, verified social profiles, prescription processing and a downloadable mobile application require connected services. MOCK authentication is explicitly identified in the UI. No real patient data was used for verification.
