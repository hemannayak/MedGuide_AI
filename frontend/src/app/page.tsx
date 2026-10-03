import { marketingMetadata, siteUrl } from "@/lib/seo";
import { MarketingHomepage } from "@/components/marketing/homepage/marketing-homepage";

export const metadata = marketingMetadata(
  "Healthcare guidance, closer to home",
  "Understandable healthcare information, multilingual access, and safety-conscious support for rural and underserved communities in India.",
  "/",
);

export default function LandingPage() {
  return (
    <>
      <MarketingHomepage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "MedGuide AI",
                url: siteUrl,
                description:
                  "Student-led healthcare information research project",
              },
              {
                "@type": "WebSite",
                name: "MedGuide AI",
                url: siteUrl,
                inLanguage: ["en", "hi", "te"],
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
