# MedGuide typography and navigation refinement

Sarvam's live website was inspected on 2026-10-03. Computed typography used Season Mix for editorial headings and Matter for UI/body text. These commercial fonts were not copied. MedGuide uses locally hosted Newsreader and DM Sans, distributed under their included OFL licenses. Regional Noto font support is retained.

The original MedGuide mark is a single-stroke M with an inward return, expressing a continuous care conversation without a medical cross. The SVG is shared by branding, device previews, authentication and the favicon.

The public navigation exposes Products, Developers, Resources and Company with the existing service directory destinations. Log In, Sign Up and Contact Us remain distinct routes. Mobile retains Log In outside the menu, with grouped native disclosures inside it. Menus support Escape and outside-pointer dismissal, focus return, active destinations, reduced-motion preferences and short opacity/transform transitions.

No API, authentication, clinical rule, route or backend architecture was changed.

Validation: browser checks at CSS widths 358, 769, 1022 and 1910 found no document horizontal overflow in the sampled public pages and confirmed Log In visibility. At 358px eight main/auth routes retained a single H1 and the shared display font. Desktop Resources dropdown and mobile navigation open/close/Escape were exercised. TypeScript and targeted ESLint were checked. A production build/Core Web Vitals measurement is not claimed; the shared development environment was preserved.

Sources: https://www.sarvam.ai/ ; https://displaay.net/typeface/matter/ ; https://displaay.net/help/licenses/ ; https://github.com/google/fonts/tree/main/ofl/newsreader ; https://github.com/google/fonts/tree/main/ofl/dmsans
