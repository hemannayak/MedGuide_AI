import React from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import { CheckCircle2, Mic, Eye, MousePointerClick, Volume2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Accessibility Statement | MedGuide AI",
  description:
    "Universal accessibility principles, WCAG 2.1 AA standards, and voice-first interfaces designed for low-literacy and rural users.",
};

const accessFeatures = [
  {
    title: "48px Minimum Touch Targets",
    description:
      "All buttons, navigation tabs, and voice input triggers maintain a minimum touch target size of 48px × 48px to support low-literacy users and simple tap navigation on mobile screens.",
    icon: MousePointerClick,
    badgeText: "WCAG 2.1 AA",
  },
  {
    title: "High-Contrast Typography",
    description:
      "Text elements adhere to strict contrast ratio guidelines (≥4.5:1 for body copy and headings) on off-white canvas backgrounds to ensure scannability under sunlight in rural clinics.",
    icon: Eye,
    badgeText: "High Contrast",
  },
  {
    title: "Voice-First Entry Points",
    description:
      "Large, prominent microphone triggers enable direct spoken questions in English, Hindi, and Telugu without requiring text entry or complex navigation.",
    icon: Mic,
    badgeText: "Multilingual Voice",
  },
  {
    title: "Audio Guidance Playback",
    description:
      "Responses can be played back using open-source text-to-speech (TTS), enabling audio-based comprehension for low-literacy patients.",
    icon: Volume2,
    badgeText: "Native Speech",
  },
];

export default function AccessibilityPage() {
  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="Accessibility Statement"
        subtitle="Ensuring universal usability for low digital-literacy users, resource-constrained devices, and diverse Indian language speakers."
        primaryCtaText="Ask MedGuide"
        primaryCtaHref="/app/chat"
        secondaryCtaText="Read Safety Framework"
        secondaryCtaHref="/safety"
      />

      {/* ── Main Accessibility Content ──────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            title="WCAG 2.1 AA Accessibility Standards"
            subtitle="Built from the ground up for low-literacy and low-resource healthcare contexts."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-12">
            {accessFeatures.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-[32px] border border-slate-200/90 p-8 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ItemIcon className="w-6 h-6 text-[#0F766E]" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-teal-50/90 text-[#0F766E] text-[11px] font-semibold border border-teal-200/70">
                        {item.badgeText}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h3 className="montserrat-bold text-xl font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-[32px] p-8 sm:p-12 max-w-4xl mx-auto shadow-md flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Report an accessibility issue
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                We are committed to continuous accessibility improvements. Contact us if you experience any barriers.
              </p>
            </div>

            <Link
              href="/contact"
              className="btn-pill bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-full shrink-0 inline-flex items-center gap-2"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
