# Visual and rural illustration review — 2026-10-03

Refinements retain MedGuide's cream, forest-green and coral visual identity. Secondary marketing introductions now reuse the homepage's photographic botanical detail, hidden from assistive technology and pointer interactions. Footer UI uses the same MedGuide sans-serif as the main interface. Authentication headline coral matches the shared palette; error messages keep a darker treatment. Dedicated-page reading sizes have minimum readable values between tablet and desktop.

Mobile art direction verified: homepage selects hero-mobile.webp, independently composed from the desktop photograph. Footer selects footer-mobile.webp. Portrait footer positioning and bottom spacing keep the human scene below navigation; inspected screenshot shows the people, rural scenery and forest-green bottom band without obscuring links.

Seven original code-native SVG assets: coconut tree, banyan tree, village road and bus, paddy carrier, health question at home, prescription review and professional-care conversation. Files live in frontend/public/marketing/rural. They are conceptual illustrations, not patient records, clinical evidence or product screenshots. Healthcare situations appear on How It Works; RuralContext is reused on About. Trees/road/carrier are decorative, while healthcare illustrations have descriptive alt text. No medical advice or fabricated outcomes added.

Browser checks covered 16 public/auth routes at 373px and 1433px CSS widths: no document overflow, broken loaded images or multiple h1 headings. Serif heading family confirmed, including Terms after its route finished rendering. Illustrated How It Works checked at desktop/mobile; all seven SVG files loaded and parsed as XML. Existing content and factual boundaries preserved.

Production build, TypeScript, targeted ESLint and all 44 frontend tests pass. No backend changes; authentication, voice, OCR and AI integration limitations remain explicit. This review does not establish clinical validity or live backend readiness.
