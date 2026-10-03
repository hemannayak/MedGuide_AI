import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";
import {
  Noto_Sans_Devanagari,
  Noto_Sans_Telugu,
} from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { EmergencyBanner } from "@/components/common/emergency-banner";
import { Navbar } from "@/components/common/navbar";
import { PageContent } from "@/components/common/page-content";
import { Footer } from "@/components/common/footer";

const notoDevanagari = Noto_Sans_Devanagari({
  weight: ["400", "500", "600", "700"],
  subsets: ["devanagari"],
  variable: "--font-hindi",
  display: "swap",
});

const notoTelugu = Noto_Sans_Telugu({
  weight: ["400", "500", "600", "700"],
  subsets: ["telugu"],
  variable: "--font-telugu",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: false, follow: false },
  title: "MedGuide AI | Rural Healthcare Intelligence & Digital Care Platform",
  description:
    "Accessible, multilingual AI health companion providing preliminary health guidance, symptom triage, and medical knowledge grounding for rural and underserved communities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`h-full antialiased ${notoDevanagari.variable} ${notoTelugu.variable}`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFCFA] text-[#161A24] font-sans">
        <LanguageProvider>
          <EmergencyBanner />
          <Navbar />
          <PageContent>{children}</PageContent>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
