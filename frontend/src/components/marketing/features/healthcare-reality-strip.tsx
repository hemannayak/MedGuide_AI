"use client";

import React from "react";
import {
  Globe2,
  Mic,
  BookOpen,
  ShieldCheck,
  Stethoscope,
  PhoneCall,
} from "lucide-react";

const REALITY_NODES = [
  {
    icon: <Globe2 className="w-5 h-5 text-[#0F766E]" />,
    title: "All Indian Languages",
    sub: "Native spoken languages & dialects across states",
  },
  {
    icon: <Mic className="w-5 h-5 text-[#0F766E]" />,
    title: "Voice-First Interaction",
    sub: "Spoken audio input & playback for low literacy",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-[#0F766E]" />,
    title: "WHO & NHM Grounding",
    sub: "Verified RAG vector search clinical corpus",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#0F766E]" />,
    title: "Safety Triage Rules",
    sub: "Deterministic evaluation of emergency red-flags",
  },
  {
    icon: <Stethoscope className="w-5 h-5 text-[#0F766E]" />,
    title: "1st POC Care Layer",
    sub: "Preliminary assistance for patients & ASHA workers",
  },
  {
    icon: <PhoneCall className="w-5 h-5 text-red-600" />,
    title: "Emergency Escalation",
    sub: "Immediate direct dial pathways for 108 & 112",
  },
];

export const HealthcareRealityStrip: React.FC = () => {
  return (
    <section className="py-14 bg-slate-50/40 border-b border-slate-200/80 text-center relative overflow-hidden">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto mb-10 space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
            Designed for India&apos;s Multilingual Healthcare Reality
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            MedGuide AI acts as an accessible first layer of primary care support by bridging language, literacy, and medical safety across rural and underserved communities.
          </p>
        </div>

        {/* 6 Rich Capability Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {REALITY_NODES.map((node) => (
            <div
              key={node.title}
              className="p-4 rounded-3xl bg-white border border-[#161A24]/8 shadow-2xs hover:border-[#0F766E]/30 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#E8F5F2]/60 border border-[#0F766E]/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                {node.icon}
              </div>
              <h3 className="font-bold text-xs text-slate-900 pt-1">
                {node.title}
              </h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                {node.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
