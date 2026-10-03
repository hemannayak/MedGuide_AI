# MedGuide public website redesign

The public website retains Next.js, React, TypeScript and the existing client-service boundary. No backend, medical decision rules, model, database or authentication infrastructure was introduced.

## Experience

Shared cream, forest-green and coral styling now supports editorial content, product previews, interactive care/evidence/safety/research explainers and progressive disclosure. Public routes cover product, how it works, technology, research, about, safety, languages, FAQs, accessibility, contact and legal information. Existing app entry points remain linked.

The rural landscape is reserved for the homepage. Other pages use subject-specific interface illustrations, diagrams, documents or a community image. The About image is generated conceptual imagery, explicitly labeled as such; it does not represent real patients or deployment. WebP versions reduce the homepage image payload. Social controls use SVG brand marks; verified public account destinations are still needed. Contact submissions remain a clearly labeled local demonstration.

## Accessibility and SEO

Navigation has a mobile menu and Escape handling, visible focus, non-wrapping desktop labels and appropriate touch targets. Interactive flows support keyboard navigation. Detailed explanations use native disclosures. Reduced-motion preferences are respected. English, Hindi and Telugu examples are explicitly illustrative.

Public pages have route-specific metadata, canonical links, Open Graph and Twitter metadata. Website/Organization and FAQ structured data use established content. Sitemap and robots routes exclude application areas. Configure NEXT_PUBLIC_SITE_URL with the verified HTTPS deployment origin before public indexing; localhost remains non-indexable. Clinical validation, security certifications, measured model performance and Core Web Vitals scores are not claimed.

## Verification

Browser checks covered the homepage and public pages at 358 CSS pixels without horizontal overflow. The care-journey interaction was checked at 769 pixels and desktop compositions at 1269 pixels. Feature selection, keyboard flow navigation and mobile menu behavior were checked during implementation. Viewport overrides were reset afterward.

TypeScript and targeted lint checks pass. The final production build and all 28 HTML regression checks passed. Keyboard language switching, FAQ expansion and tablet care-journey selection were verified in the browser. Existing legacy marketing components have unrelated lint findings and were not rewritten.

## Reference links

Source publishers are references, not partnerships or approvals. Individual documents require provenance, version, license and relevance review before backend use.

- WHO PEN publication: https://www.who.int/publications/i/item/9789240009226
- ICMR treatment workflows: https://www.icmr.gov.in/standard-treatment-workflows-stws
- Next metadata: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
