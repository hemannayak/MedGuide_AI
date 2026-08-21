"use client";

import React from "react";
import { Mic, ShieldCheck, FileText, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { MedButton } from "@/components/ui/med-button";

export const HealthcareShowcase: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#FAFAF8] relative overflow-hidden">
      {/* Background Subtle Radial Lighting (Light Palette) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 15%, rgba(15, 118, 110, 0.06), transparent 50%)",
        }}
      />

      <div className="section-container relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0F766E] block">
            CORE AI CAPABILITIES &bull; GROUNDED &bull; MULTILINGUAL
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 font-normal tracking-tight leading-[1.05]">
            The AI Health Platform{" "}
            <span className="italic bg-gradient-to-r from-slate-900 via-[#0F766E] to-teal-700 bg-clip-text text-transparent font-serif">
              Rural India Relies On
            </span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Voice-first health guidance, Indic speech triage, and prescription OCR grounded in verified medical evidence.
          </p>
        </div>

        {/* 3 Clean Light Informational Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1: Multilingual Voice AI */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F5F2] border border-teal-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mic className="w-7 h-7 text-[#0F766E]" />
              </div>

              <div className="space-y-2">
                <h3 className="italiana-regular text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Multilingual Voice AI
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Spoken primary healthcare support in India&apos;s native languages. Designed specifically for low digital-literacy patients and ASHA healthcare workers.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <span>10+ Spoken Indic Locales (Hindi, Telugu, Kannada)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <span>Voice-first conversational health guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <span>Text-to-speech audio playback synthesis</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200/80 text-[11px] font-semibold">
                &lt; 100ms Latency
              </span>
            </div>
          </div>

          {/* Card 2: Grounded Clinical Safety */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7 text-amber-700" />
              </div>

              <div className="space-y-2">
                <h3 className="italiana-regular text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Grounded Safety &amp; Triage
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Deterministic triage evaluation and WHO guideline vector search. Clinical safety rules built into the architecture before language generation.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>WHO &amp; NHM Primary Care Corpus grounding</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Deterministic red-flag symptom detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Emergency 108 / 112 escalation pathways</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-semibold">
                100% Citation Trace
              </span>
            </div>
          </div>

          {/* Card 3: Prescription OCR */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-7 h-7 text-indigo-700" />
              </div>

              <div className="space-y-2">
                <h3 className="italiana-regular text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Prescription OCR &amp; Vision
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  High-accuracy extraction of handwritten prescriptions and clinic notes into structured medicine schedules and patient reminders.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0" />
                  <span>Indic handwriting &amp; printed slip recognition</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0" />
                  <span>Structured dosage &amp; duration extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0" />
                  <span>Human verification trigger for low confidence</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 text-[11px] font-semibold">
                98.4% OCR Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="mt-14 flex justify-center">
          <MedButton size="hero" variant="primary">
            Explore Healthcare Features
          </MedButton>
        </div>
      </div>
    </section>
  );
};
