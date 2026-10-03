# Marketing homepage — Laptop B

## Requirement and decision

Recreate the user-provided Image 1 in its prescribed section order. This is a frontend-only change. The existing Next.js / React / TypeScript application is retained rather than migrated to Vite. No backend, database, AI, medical rules, authentication service, or API contracts were added or modified by this implementation.

The homepage is composed in `frontend/src/components/marketing/homepage/`. Its design tokens and responsive styles are isolated in `homepage.module.css` so other routes retain their established styling. The shared footer is suppressed on `/`, which has its own compact disclaimer footer; other routes retain the existing footer.

## Assets and visual treatment

- `public/marketing/reference.png`: exact user-provided Image 1. CSS selects photographic card images, botanical details, stone, and ground from this image. It is not used as a full-page screenshot overlay. Text, navigation, cards, diagrams, and device interfaces are HTML/React.
- `public/marketing/rural-background.png`: an imagegen edit of the existing reference hero with baked-in UI/text removed. It retains the rural valley, house, palms, and seated woman. Generation changes some photographic details, so this is not a pixel-identical background.
- The existing `public/medguide_logo.png` supplies the logo mark through a forest-green CSS mask. This existing asset differs from the botanical symbol pictured in Image 1. No separately attached logo asset was available.
- DM Serif Display and Caveat are served locally. Their SIL Open Font License files are included beside the font assets.

The reference is a composite rather than a layered asset package; small botanical crop boundaries and photographic differences may remain. The illustration device screens are static previews, not the actual chat application. No use of Image 2.

## Navigation and integration

The three primary entry CTAs lead to the existing `/login` page. Navbar product/technology/research links target homepage sections. Informational links use existing `/about`, `/how-it-works`, `/safety`, and `/languages` pages. The mobile-download control is disabled and labeled as coming later.

The homepage language control displays English only until translated marketing copy is approved. Regional-language bubbles illustrate the intended experience. The existing centralized `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_API_MODE` configuration remains the integration boundary for Laptop A; this page does not call an AI or authentication endpoint.

## Research and safety integrity

The image's `5+` languages and `50K+` documents are retained as reference design targets and explicitly marked as not evaluated. Example WHO/ICMR/reference cards are labeled illustrative, not citations. The warning card is an illustrative safety notice and executes no medical decision logic. The footer states that the product does not replace a qualified healthcare professional.

## Verification

Run from `frontend/`:

```sh
npm run build
node --test tests/marketing-homepage.test.mjs
npx eslint src/components/marketing/homepage src/app/page.tsx
npx tsc --noEmit
```

The integration tests inspect the actual production-rendered homepage for section order, CTA destinations, valid routes/anchor targets, accessibility labels, research disclaimers, disabled downloads, and required assets.

Visual comparisons were performed at the reference's 1024px desktop width and a 390px mobile width. Iterations adjusted heading font and weight, wrapping, photographic crops, card sizing, botanical placement, phone overlaps, and responsive device composition. Browser interaction and tablet checks are tracked separately from build/static integration checks; static tests do not verify interactive menu behavior or establish a numerical pixel-match score.

Responsive layouts: desktop composition above 900px; adjusted tablet typography/layout from 761–900px; stacked layout at 760px and below. Reduced-motion preferences disable button transforms. Mobile navigation has an expanded state, controls association, and Escape-to-close handling.

### Final check results (3 October 2026)

- Production build: passed; all 25 existing pages prerendered successfully.
- TypeScript (`npx tsc --noEmit`): passed.
- ESLint for the new homepage components, root page, and integration test: passed.
- Production-HTML integration tests: 7 passed, 0 failed.
- Changed tracked homepage/footer files: whitespace diff check passed. Existing whitespace issues in previously modified API files were left untouched.
- Earlier 1024px desktop and 390px mobile browser comparisons completed. After a chat interruption, the browser tool rejected reconnecting to the current tab. Final tablet adjustments, Escape handling, and CTA click-through were therefore not interactively verified; route targets and accessibility markup were verified in production HTML.

No numerical visual-similarity, clinical, model, retrieval, or language-coverage score was measured or claimed.

## Interactive marketing pages and footer — 3 October 2026

Implemented shared reference-style footer on the homepage, Product, How it works,
Technology, Research, and About. Reused the existing Next.js architecture and
language context. Six accessible feature tabs update explanatory text and both
device previews. Arrow keys, Home, and End support keyboard selection. Preview
transitions, section entry movement, waveform motion, hover and focus feedback
respect reduced-motion preferences. Content remains visible before JavaScript.

The footer uses the supplied footer reference for decorative landscape crops;
links, typography, form, preferences, and sitemap are real HTML components.
Newsletter input uses native required/email validation. Submitting only shows a
demo notice, without sending or storing the email. Social controls explain that
official profile URLs are pending. Language controls set the existing app
preference; marketing copy remains English. Statistics remain qualified design
targets, not measured results. No backend or medical reasoning was introduced.

Validation: production build, TypeScript, targeted ESLint, and 19 rendered-page
integration tests passed. Browser checks verified all six feature choices,
keyboard selection, newsletter validation/demo feedback, social feedback,
sitemap expansion, and all five main navigation destinations. The observed
1100px layout had no horizontal overflow. Responsive CSS covers tablet/mobile,
but the browser viewport override did not change the actual observed width;
390px visual validation remains outstanding. Screenshot: screenshots/marketing-footer.png.
