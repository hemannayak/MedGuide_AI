"use client";

import React from "react";
import Link from "next/link";
import { MedButton } from "@/components/ui/med-button";

export const ResearchUpdates: React.FC = () => {
  const articles = [
    {
      category: "RESEARCH",
      title: "Evaluating Indic Speech ASR & Triage Accuracy in Rural Health Centers",
      date: "August 15, 2026",
      canvasGradient: "from-emerald-300 via-teal-200 to-cyan-300",
      textColor: "text-emerald-950",
      badgeTitle: "Indic Health ASR",
      badgeSubtitle: "Benchmark Evaluation",
      link: "/about",
    },
    {
      category: "CLINICAL STUDY",
      title: "RAG Knowledge Grounding & Zero-Hallucination Protocols using WHO Guidelines",
      date: "July 28, 2026",
      canvasGradient: "from-amber-300 via-rose-300 to-orange-400",
      textColor: "text-amber-950",
      badgeTitle: "MedGuide RAG",
      badgeSubtitle: "WHO Knowledge Grounding",
      link: "/safety",
    },
    {
      category: "SAFETY ARCHITECTURE",
      title: "Deterministic Safety Rules & Emergency 108 Escalation Pathways",
      date: "June 12, 2026",
      canvasGradient: "from-[#4169E1]/80 via-indigo-300 to-purple-400",
      textColor: "text-indigo-950",
      badgeTitle: "Red-Flag Triage",
      badgeSubtitle: "Deterministic Safety Rules",
      link: "/safety",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-[#FAFAF8] relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Section Title (Matching Sarvam AI Reference) */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.08]">
            Research &amp; Updates
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-normal">
            Scientific benchmarks, clinical safety evaluations, and technical advancements powering MedGuide AI.
          </p>
        </div>

        {/* 3 Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {articles.map((item, idx) => (
            <Link
              key={idx}
              href={item.link}
              className="p-6 rounded-[32px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-6"
            >
              {/* Header Meta & Title */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  {item.category}
                </span>
                <h3 className="font-serif text-xl text-slate-900 leading-snug group-hover:text-[#0F766E] transition-colors">
                  {item.title}
                </h3>
                <span className="text-xs text-slate-400 block pt-1">
                  {item.date}
                </span>
              </div>

              {/* Bottom Visual Mesh Canvas Graphic Box (Matching Sarvam AI Graphic Cards) */}
              <div
                className={`relative h-44 sm:h-48 rounded-[24px] bg-gradient-to-br ${item.canvasGradient} border border-slate-200/60 overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-2xs group-hover:scale-[1.02] transition-transform duration-300`}
              >
                {/* Subtle Inner Glow Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_70%)]" />

                <div className="relative z-10 space-y-1">
                  <div className={`font-sans text-2xl font-bold tracking-tight ${item.textColor}`}>
                    {item.badgeTitle}
                  </div>
                  <div className={`text-xs font-semibold uppercase tracking-wider opacity-80 ${item.textColor}`}>
                    {item.badgeSubtitle}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Center Action Button */}
        <div className="text-center mt-12 sm:mt-14">
          <Link href="/about">
            <MedButton variant="secondary" size="md">
              View All Research &amp; Updates
            </MedButton>
          </Link>
        </div>
      </div>
    </section>
  );
};
