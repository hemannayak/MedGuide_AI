# Responsive background assets

Generated with the built-in imagegen tool; these are conceptual fictional scenes, not photographs of project users or a deployed healthcare service. No medical claims or baked-in UI. Optimized WebP files are 104–216 KB each. Sources remain in the generator output folder.

## Prompt set

Shared direction: one premium photorealistic rural Indian website background; warm terracotta tiled houses, palms, misty hills, natural foliage, golden morning light, cream/off-white and muted forest greens. No text, logos, UI, forms, buttons or watermarks. Large cream negative space for live HTML. Anatomically realistic fictional people, no hospital imagery.

- Sign-in desktop: elderly man and younger woman in muted green using a smartphone in lower-left quarter; village home at far left; upper area and right half clear for headline and form. 1536 × 1024.
- Sign-in mobile: same scenario composed for portrait, people in bottom third, open cream upper area. 1024 × 1536.
- Sign-up desktop: younger and elderly men sharing a smartphone in lower-left quarter, distant village valley; clear upper and right space. 1536 × 1024.
- Sign-up mobile: younger and elderly men in lower third, village courtyard and palms, cream upper two-thirds. 1024 × 1536.
- Footer desktop: elderly man and younger woman sharing a phone lower left; cream upper area for live columns; rural landscape blends into delicate olive village line art on lower right. 1536 × 1024.
- Footer mobile: portrait with stacked-link negative space above, fictional people and village/line-art blend at bottom. 1024 × 1536.
- Hero desktop: wide Indian village sunrise valley; seated woman using a smartphone at far right, tiled house, botanical foliage; clear left sky for headline and right-center for the live device preview. 1536 × 1024.
- Hero mobile: intentionally composed portrait; woman by village home in bottom-right third, valley and palms below clear cream upper sky. 1024 × 1536.

## Assets

- [signin-desktop.webp](../../frontend/public/marketing/backgrounds/signin-desktop.webp)
- [signin-mobile.webp](../../frontend/public/marketing/backgrounds/signin-mobile.webp)
- [signup-desktop.webp](../../frontend/public/marketing/backgrounds/signup-desktop.webp)
- [signup-mobile.webp](../../frontend/public/marketing/backgrounds/signup-mobile.webp)
- [footer-desktop.webp](../../frontend/public/marketing/backgrounds/footer-desktop.webp)
- [footer-mobile.webp](../../frontend/public/marketing/backgrounds/footer-mobile.webp)
- [hero-desktop.webp](../../frontend/public/marketing/backgrounds/hero-desktop.webp)
- [hero-mobile.webp](../../frontend/public/marketing/backgrounds/hero-mobile.webp)

## Integration and validation

The homepage switches hero files at 760px and preloads only the matching image. Authentication and footer switch files at 700px. Form inputs and navigation remain HTML/React components. The homepage language-story section is removed; the detailed Languages page retains its transcript, language, and speech limitations.

Production build, TypeScript, targeted lint, and all 40 automated tests passed. Responsive browser checks confirm portrait files on small phones and landscape files on larger screens, no horizontal overflow, and working password visibility, product tabs, menu Escape handling, and mobile availability disclosure. Authentication remains the existing mock service.
