import type { Metadata } from "next";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const isPublicDeployment = /^https:\/\//.test(siteUrl);
export function marketingMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title: `${title} | MedGuide AI`,
    description,
    alternates: { canonical: new URL(path, siteUrl).toString() },
    openGraph: {
      title: `${title} | MedGuide AI`,
      description,
      url: new URL(path, siteUrl).toString(),
      siteName: "MedGuide AI",
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "MedGuide AI — Healthcare guidance, closer to home",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MedGuide AI`,
      description,
      images: ["/opengraph-image"],
    },
    robots: { index: isPublicDeployment, follow: isPublicDeployment },
  };
}
