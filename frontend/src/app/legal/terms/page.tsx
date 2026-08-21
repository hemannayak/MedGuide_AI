import React from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import { ShieldCheck, FileText, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Terms of Service | MedGuide AI",
  description:
    "Terms of service, platform purpose, and usage guidelines for MedGuide AI.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="Terms of Service"
        subtitle="Terms and conditions governing the use of the MedGuide AI preliminary healthcare intelligence platform."
        primaryCtaText="Contact Us"
        primaryCtaHref="/contact"
        secondaryCtaText="Privacy Policy"
        secondaryCtaHref="/legal/privacy"
      />

      {/* ── Main Content ────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                num: "01",
                title: "Acceptance of Terms",
                body: "By accessing or using MedGuide AI, you agree to comply with these Terms of Service. If you do not agree with any part of these terms, you may not access or use the platform.",
              },
              {
                num: "02",
                title: "Platform Purpose & Limitations",
                body: "MedGuide AI is an educational healthcare intelligence platform developed for preliminary health information, symptom triage awareness, and community healthcare worker support. It is explicitly not a diagnostic tool or medical service provider.",
              },
              {
                num: "03",
                title: "Prohibited Use",
                body: "Users must not attempt to use the platform as a substitute for professional clinical medical care, emergency dispatching, or legal medical advice.",
              },
            ].map((section) => (
              <div
                key={section.num}
                className="bg-white rounded-[32px] border border-slate-200/90 p-8 sm:p-10 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#0F766E] uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
                    SECTION {section.num}
                  </span>
                  <h3 className="montserrat-bold text-xl font-bold text-slate-900">
                    {section.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal pt-1">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-[32px] p-8 sm:p-12 max-w-3xl mx-auto shadow-md flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Questions about our terms?
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                Reach out to our team for questions about deployment, terms, or open-source licensing.
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
