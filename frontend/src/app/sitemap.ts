import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/product",
    "/how-it-works",
    "/safety",
    "/languages",
    "/faq",
    "/about",
    "/technology",
    "/research",
    "/contact",
    "/accessibility",
    "/privacy",
    "/terms",
    "/legal/disclaimer",
  ].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
