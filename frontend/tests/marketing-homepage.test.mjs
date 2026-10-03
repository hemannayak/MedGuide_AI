import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Integration checks against actual production-rendered HTML. Run npm run build first.
const frontend = fileURLToPath(new URL("../", import.meta.url));
const html = readFileSync(`${frontend}.next/server/app/index.html`, "utf8");
// Next's hydration payload repeats page content; assertions target only the rendered document.
const rendered = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");

test("homepage sections follow the refined introduction-to-action narrative", () => {
  const sections = [
    "hero-title",
    "problem-title",
    "solution-title",
    "journey-heading",
    "safety-title",
    "explore-title",
    "available-title",
    "research-title",
  ];
  let previous = -1;
  for (const id of sections) {
    const position = rendered.indexOf(`id="${id}"`);
    assert.ok(
      position > previous,
      `${id} must exist after the previous section`,
    );
    previous = position;
  }
  assert.equal((rendered.match(/<h1\b/g) || []).length, 1);
});

test("all primary entry CTAs lead to the existing login route", () => {
  const links = Array.from(
    rendered.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g),
  );
  const entryLinks = links.filter(([, , body]) =>
    /Try MedGuide|Try Web App/.test(body),
  );
  assert.ok(entryLinks.length >= 2);
  for (const [, href] of entryLinks) assert.equal(href, "/login");
});

test("every homepage link resolves to a section or an existing prerendered page", () => {
  const links = Array.from(rendered.matchAll(/<a\b[^>]*href="([^"]*)"/g));
  for (const [, href] of links) {
    if (href.startsWith("#")) {
      assert.ok(
        rendered.includes(`id="${href.slice(1)}"`),
        `Missing target ${href}`,
      );
    } else if (href.startsWith("/")) {
      const [pathname, fragment] = href.split("#");
      const route = pathname === "/" ? "index" : pathname.slice(1);
      const pagePath = `${frontend}.next/server/app/${route}.html`;
      assert.ok(existsSync(pagePath), `Missing route ${href}`);
      if (fragment)
        assert.ok(
          readFileSync(pagePath, "utf8").includes(`id="${fragment}"`),
          `Missing anchor ${href}`,
        );
    }
  }
});

test("homepage keeps safety boundaries without duplicating technical diagrams", () => {
  assert.match(rendered, /English, Hindi, Telugu are the first-phase scope/);
  assert.match(rendered, /It does not replace their care/);
  assert.doesNotMatch(rendered, /PostgreSQL|pgvector|Illustrative source cards/);
  assert.match(
    rendered,
    /href="\/legal\/disclaimer"/,
  );
});

test("the planned mobile download cannot trigger a fake download", () => {
  assert.match(
    rendered,
    /<button[^>]*aria-label="Mobile app availability"/,
  );
  assert.match(rendered, /The web experience is available in your browser/);
});

test("navigation, language controls, and regional-language samples are labeled", () => {
  assert.match(rendered, /aria-label="Main navigation"/);
  assert.doesNotMatch(rendered, /aria-label="Homepage language"/);
  assert.match(rendered, /href="\/login"[^>]*>Sign in/);
  assert.match(
    rendered,
    /aria-expanded="false" aria-controls="marketing-navigation"/,
  );
  assert.ok(rendered.includes(`lang="hi"`));
  assert.doesNotMatch(rendered, /id="language-story-title"/);
  assert.match(rendered, /Skip to product information/);
});

test("the provided logo, rural background, reference details, and local font assets exist", () => {
  for (const asset of [
    "medguide-mark.svg",
    "marketing/backgrounds/signin-desktop.webp",
    "marketing/backgrounds/signin-mobile.webp",
    "marketing/backgrounds/signup-desktop.webp",
    "marketing/backgrounds/signup-mobile.webp",
    "marketing/backgrounds/footer-desktop.webp",
    "marketing/backgrounds/footer-mobile.webp",
    "marketing/backgrounds/hero-desktop.webp",
    "marketing/backgrounds/hero-mobile.webp",
    "marketing/rural-background.png",
    "marketing/reference.png",
    "marketing/fonts/dm-serif-display.ttf",
    "marketing/fonts/caveat.ttf",
    "marketing/fonts/DM-Serif-Display-LICENSE.txt",
    "marketing/fonts/Caveat-LICENSE.txt",
  ])
    assert.ok(
      existsSync(`${frontend}public/${asset}`),
      `Missing asset ${asset}`,
    );
});

test("header stays focused while the footer retains the complete directory", () => {
  const header = rendered.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  assert.ok(header);
  const nav = header.match(/<nav\b[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav);
  assert.equal((nav.match(/<a\b/g) || []).length, 4);
  for (const href of ["/product", "/how-it-works", "/safety", "/about"]) assert.ok(nav.includes(`href="${href}"`));
  assert.doesNotMatch(nav, /API service map|Privacy|Speech to text|Medical sources/);
  assert.match(header, /Sign in/);
  assert.match(rendered, /Footer Technology/);
});
