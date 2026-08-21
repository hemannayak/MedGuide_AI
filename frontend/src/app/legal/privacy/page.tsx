import React from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import { ShieldCheck, Lock, Eye, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MedGuide AI",
  description:
    "Data minimization principles, explicit consent management, and encryption standards in MedGuide AI.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="Privacy Policy"
        subtitle="MedGuide AI treats personal health information with strict confidentiality. We enforce data minimization, explicit user consent, and role-based access control."
        primaryCtaText="Contact Us"
        primaryCtaHref="/contact"
        secondaryCtaText="Medical Disclaimer"
        secondaryCtaHref="/legal/disclaimer"
      />

      {/* ── Main Content ────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                num: "01",
                title: "Data Minimization",
                body: "MedGuide AI collects only information strictly necessary to provide preliminary health guidance and symptom triage (reported symptoms, language preference, demographics). We do not collect unnecessary tracking identifiers, precise location data, or commercial advertising profiles.",
              },
              {
                num: "02",
                title: "Explicit Consent Management",
                body: "Processing of health information requires explicit opt-in consent during onboarding. Patients retain the right to withdraw consent, request record deletion, or export their health timeline at any time.",
              },
              {
                num: "03",
                title: "Security & Encryption",
                body: "All health interactions, symptom records, and user credentials are encrypted in transit (TLS 1.3) and at rest (AES-256). Access is restricted using Role-Based Access Control (RBAC) so patients only access their own records.",
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
                Questions about data privacy?
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                Read our medical disclaimer or reach out directly to our privacy team.
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
