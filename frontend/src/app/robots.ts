import type { MetadataRoute } from "next";
import { siteUrl, isPublicDeployment } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: isPublicDeployment ? "/" : undefined,
      disallow: isPublicDeployment
        ? [
            "/app/",
            "/admin/",
            "/login",
            "/register",
            "/onboarding",
            "/verify-email",
          ]
        : "/",
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
