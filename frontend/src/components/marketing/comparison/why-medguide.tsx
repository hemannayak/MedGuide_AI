"use client";

import React from "react";
import Link from "next/link";
import { Check, ShieldCheck, ArrowRight } from "lucide-react";

interface ComparisonRow {
  capability: string;
  search: string;
  generalAi: string;
  medguide: string;
  isHeadline?: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    capability: "General knowledge & conversation",
    search: "✓",
    generalAi: "✓",
    medguide: "✓",
  },
  {
    capability: "Healthcare-focused experience",
    search: "General-purpose",
    generalAi: "General-purpose",
    medguide: "Purpose-built",
    isHeadline: true,
  },
  {
    capability: "Indian language-first UX",
    search: "Limited",
    generalAi: "Varies",
    medguide: "English · हिंदी · తెలుగు",
  },
  {
    capability: "Voice-first interaction",
    search: "Limited",
    generalAi: "Available / varies",
    medguide: "Core experience",
  },
  {
    capability: "Trusted medical RAG sources",
    search: "Depends on result",
    generalAi: "Depends on context",
    medguide: "Grounded medical corpus",
    isHeadline: true,
  },
  {
    capability: "Structured symptom guidance",
    search: "Search results",
    generalAi: "Conversational",
    medguide: "Guided workflow",
  },
  {
    capability: "Red-flag safety detection",
    search: "Not primary UX",
    generalAi: "Safety workflow",
    medguide: "Red-flag safety triage",
    isHeadline: true,
  },
  {
    capability: "Emergency escalation pathways",
    search: "General advice",
    generalAi: "General advice",
    medguide: "Explicit 108/112 pathway",
  },
  {
    capability: "Rural / low-literacy UX",
    search: "General-purpose",
    generalAi: "General-purpose",
    medguide: "Designed for accessibility",
  },
  {
    capability: "Simple next-step clarity",
    search: "Fragmented",
    generalAi: "Conversational",
    medguide: "Answer → Meaning → Action",
    isHeadline: true,
  },
];

export const WhyMedGuide: React.FC = () => {
  return (
    <section className="section-gap bg-slate-50/50 relative overflow-hidden">
      {/* Background Lighting */}
      <div className="ambient-bg-glow" />

      <div className="section-container relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Built for healthcare. Not just conversation.
          </h2>

          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            General-purpose AI assistants excel at open conversation. MedGuide AI is purpose-built for healthcare access by combining grounded medical retrieval, multilingual voice interaction, structured symptom guidance, and explicit safety escalation.
          </p>
        </div>

        {/* 3-Column Comparison Matrix Card */}
        <div className="max-w-5xl mx-auto bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 w-2/5">
                    Capability
                  </th>
                  <th className="py-5 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-1/5">
                    Traditional Search
                  </th>
                  <th className="py-5 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-1/5">
                    General-purpose AI
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5 uppercase tracking-normal">
                      (ChatGPT &bull; Gemini &bull; Claude)
                    </span>
                  </th>
                  <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 text-center w-1/5">
                    <span className="flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-300" /> MedGuide AI
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors hover:bg-[#E8F5F2]/30 ${
                      row.isHeadline ? "bg-slate-50/60 font-semibold" : ""
                    }`}
                  >
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {row.capability}
                    </td>

                    <td className="py-4 px-4 text-center text-slate-500 font-normal">
                      {row.search === "✓" ? (
                        <Check className="w-4.5 h-4.5 mx-auto text-slate-400" />
                      ) : (
                        row.search
                      )}
                    </td>

                    <td className="py-4 px-4 text-center text-slate-600 font-normal">
                      {row.generalAi === "✓" ? (
                        <Check className="w-4.5 h-4.5 mx-auto text-slate-600" />
                      ) : (
                        row.generalAi
                      )}
                    </td>

                    {/* Featured MedGuide Column */}
                    <td className="py-4 px-6 text-center font-semibold bg-[#E8F5F2]/40 text-[#161A24] border-x border-[#0F766E]/10">
                      {row.medguide === "✓" ? (
                        <Check className="w-4.5 h-4.5 mx-auto text-[#0F766E] stroke-[2.5]" />
                      ) : (
                        <span className="text-slate-900 font-bold">{row.medguide}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Callout */}
          <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-xs sm:text-sm border-t border-slate-800">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="font-bold text-teal-300 uppercase tracking-wider text-xs">
                Grounding & Safety Disclaimer
              </div>
              <p className="text-slate-300 max-w-2xl leading-relaxed text-xs">
                General-purpose models are powerful conversational engines. MedGuide AI adds a dedicated layer of clinical reference RAG, deterministic safety filters, and immediate rural emergency escalation.
              </p>
            </div>

            <Link
              href="/safety"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs shrink-0 hover:bg-slate-100 transition-colors shadow-sm"
            >
              Explore Safety Rules <ArrowRight className="w-3.5 h-3.5 text-[#0F766E]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
