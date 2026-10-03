# Connected MedGuide information pages

Scope: How It Works, Safety, Languages, FAQs, and an opt-in enhanced shared navbar. Existing authentication, footer, backend services and other page layouts are retained.

How It Works uses a sticky, scroll-driven Ask → Understand → Guide → Act preview and existing interactive product mockups. Safety explains provenance, layered safeguards, boundaries, escalation and privacy. Languages uses native-script tabs, transcript review, intended speech-service behavior and accessibility principles. FAQs preserve the eight authored answers while adding functional local search, category filtering, empty results, animated accessible accordions and related destinations. FAQ schema is retained.

Enhanced navigation has active-route indication, a subtle scrolled border/shadow, visible Sign In, mobile Try MedGuide and Escape handling. It contains no language selector. No new dependencies, backend behavior, medical rules or clinical claims were introduced.

Validation: TypeScript and targeted ESLint pass. Three FAQ discovery unit tests pass. Browser walkthrough checked all four routes at 1910, 1022, 769 and 358 CSS pixels: no horizontal overflow, one H1, one main landmark and visible Sign In. Search, empty-result reset, categories, keyboard accordion activation, regional-language tabs, journey selection and mobile menu Escape were exercised. Production build was not rerun to avoid disturbing the main thread’s shared build outputs.
