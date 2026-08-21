import type { Metadata } from "next";
import { Italiana, Instrument_Serif, Montserrat, Noto_Sans_Devanagari, Noto_Sans_Telugu } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { EmergencyBanner } from "@/components/common/emergency-banner";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Preloader } from "@/components/ui/preloader-tw";

const italiana = Italiana({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-italiana",
  display: "swap",
});

const serifFont = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

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
      className={`h-full antialiased ${italiana.variable} ${serifFont.variable} ${montserrat.variable} ${notoDevanagari.variable} ${notoTelugu.variable}`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFCFA] text-[#161A24] font-sans">
        <LanguageProvider>
          <Preloader />
          <EmergencyBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
