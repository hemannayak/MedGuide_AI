import React from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import { AlertTriangle, ShieldAlert, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Medical Disclaimer | MedGuide AI",
  description:
    "Critical medical disclaimer and scope protection notice: MedGuide AI is an educational guidance tool, not a doctor or diagnostic system.",
};

export default function MedicalDisclaimerPage() {
  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="Medical Disclaimer"
        subtitle="Healthcare safety & AI scope protection notice. MedGuide AI is an educational guidance tool, not a doctor or diagnostic system."
        primaryCtaText="Explore Safety Framework"
        primaryCtaHref="/safety"
        secondaryCtaText="Privacy Policy"
        secondaryCtaHref="/legal/privacy"
      />

      {/* ── Main Content ────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Emergency Notice Card */}
            <div className="bg-rose-50 border border-rose-200/80 rounded-[32px] p-8 shadow-2xs flex items-start gap-5">
              <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="montserrat-bold text-lg font-bold text-rose-900">
                  Critical Medical Disclaimer
                </h3>
                <p className="text-sm text-rose-800 leading-relaxed">
                  MedGuide AI is <strong>NOT</strong> a doctor, medical practitioner, or clinical diagnostic system. It does <strong>NOT</strong> provide medical diagnosis, prescribe drugs, or replace professional clinical judgment.
                </p>
              </div>
            </div>

            {[
              {
                num: "01",
                title: "Preliminary Information Only",
                body: "All health responses, symptom evaluations, and information provided by MedGuide AI are strictly preliminary and educational in nature, derived from public WHO guidelines and official clinical literature.",
              },
              {
                num: "02",
                title: "Emergency Medical Care (Call 108 / 112)",
                body: "In the event of a medical emergency (e.g. acute chest pain, severe shortness of breath, sudden loss of consciousness, severe trauma), do not rely on this application. Contact national emergency medical services immediately (Call 108 or 112 in India) or visit your nearest hospital.",
              },
              {
                num: "03",
                title: "Prescription & Medication Safety",
                body: "MedGuide AI will never advise changing prescribed medication dosages or stopping prescribed treatments. Always consult your prescribing physician or healthcare provider before altering any medical regimen.",
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
                Learn about our safety rules
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                Read how our deterministic triage pre-filter protects patient safety.
              </p>
            </div>

            <Link
              href="/safety"
              className="btn-pill bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-full shrink-0 inline-flex items-center gap-2"
            >
              <span>Safety Framework</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
