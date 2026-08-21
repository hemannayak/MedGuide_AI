"use client";

import React from "react";
import { Mic, Stethoscope, FileSearch, CheckCircle2 } from "lucide-react";

export const CapabilityMap: React.FC = () => {
  return (
    <section className="section-gap bg-transparent relative overflow-hidden">
      <div className="section-container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ============================================================ */}
        {/* 1. SECTION HEADING & PURPOSE */}
        {/* ============================================================ */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.12]">
            Healthcare guidance, made easier to access.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto pt-1">
            MedGuide combines voice, multilingual understanding, symptom guidance, and trusted medical information to help you understand your health and decide what to do next.
          </p>
        </div>

        {/* ============================================================ */}
        {/* 2. THREE USER-CENTERED CAPABILITY CARDS */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-0">

          {/* CARD 01: Speak naturally */}
          <div className="flex flex-col rounded-[24px] bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out group">
            {/* Soft Voice Waveform & Language Visual */}
            <div className="relative h-48 sm:h-52 rounded-2xl bg-gradient-to-br from-teal-500/10 via-indigo-50/50 to-purple-50/40 border border-teal-100/70 overflow-hidden flex flex-col items-center justify-center p-6 mb-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.6),transparent_70%)]" />

              {/* Voice Waveform Graphic */}
              <div className="flex items-center gap-1.5 h-12 mb-4 relative z-10">
                <span className="w-1.5 h-6 bg-teal-600 rounded-full animate-pulse" />
                <span className="w-1.5 h-10 bg-teal-500 rounded-full animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-7 bg-indigo-500 rounded-full animate-pulse [animation-delay:300ms]" />
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-teal-200/80 flex items-center justify-center mx-1 group-hover:scale-105 transition-transform duration-200">
                  <Mic className="w-6 h-6 text-[#0F766E]" />
                </div>
                <span className="w-1.5 h-8 bg-indigo-500 rounded-full animate-pulse [animation-delay:200ms]" />
                <span className="w-1.5 h-10 bg-teal-500 rounded-full animate-pulse [animation-delay:350ms]" />
                <span className="w-1.5 h-5 bg-teal-600 rounded-full animate-pulse [animation-delay:100ms]" />
              </div>

              {/* Supported Language Chips */}
              <div className="flex items-center gap-2 relative z-10">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-slate-700 border border-slate-200/80 shadow-2xs">
                  EN
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-slate-800 border border-slate-200/80 shadow-2xs font-serif">
                  हिंदी
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-slate-800 border border-slate-200/80 shadow-2xs">
                  తెలుగు
                </span>
              </div>
            </div>

            {/* Card Copy */}
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="italiana-regular font-bold text-2xl text-slate-900 leading-tight">
                  Speak naturally
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Ask your health questions using your own voice. MedGuide is designed for natural conversations in supported Indian languages, making health information easier to access when typing is difficult.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 02: Understand what your symptoms may mean */}
          <div className="flex flex-col rounded-[24px] bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out group">
            {/* Abstract Symptom Pathway Graphic */}
            <div className="relative h-48 sm:h-52 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-50/30 border border-amber-200/60 overflow-hidden flex items-center justify-center p-4 mb-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.6),transparent_70%)]" />

              <div className="flex flex-col items-center gap-2 relative z-10 w-full max-w-[220px]">
                {/* Node 1 */}
                <div className="w-full py-1.5 px-3 rounded-lg bg-white shadow-2xs border border-amber-200/80 text-center flex items-center justify-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">SYMPTOM</span>
                </div>

                {/* Pathway Signal Line 1 */}
                <div className="w-0.5 h-3 bg-amber-400/80 rounded-full" />

                {/* Node 2 */}
                <div className="w-full py-1.5 px-3 rounded-lg bg-amber-100/80 border border-amber-300/80 text-center flex items-center justify-center gap-2">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">UNDERSTAND</span>
                </div>

                {/* Pathway Signal Line 2 */}
                <div className="w-0.5 h-3 bg-amber-400/80 rounded-full" />

                {/* Node 3 */}
                <div className="w-full py-1.5 px-3 rounded-lg bg-teal-50 border border-teal-200 text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">NEXT STEP</span>
                </div>
              </div>
            </div>

            {/* Card Copy */}
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="italiana-regular font-bold text-2xl text-slate-900 leading-tight">
                  Understand what your symptoms may mean
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Describe what you are experiencing and receive clear, structured guidance about possible next steps — without replacing a qualified healthcare professional.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 03: Guidance you can understand and trust */}
          <div className="flex flex-col rounded-[24px] bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out group">
            {/* Elegant Evidence / Source Graph Graphic */}
            <div className="relative h-48 sm:h-52 rounded-2xl bg-gradient-to-br from-blue-500/10 via-slate-50/50 to-teal-50/30 border border-blue-100/80 overflow-hidden flex items-center justify-center p-4 mb-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.6),transparent_70%)]" />

              <div className="flex flex-col items-center gap-1.5 relative z-10 w-full max-w-[230px] text-[10px]">
                <div className="w-full px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-center font-medium shadow-2xs">
                  QUESTION
                </div>
                <span className="text-slate-400 font-mono text-[9px]">&darr;</span>
                <div className="w-full px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-center font-medium">
                  MEDICAL INFORMATION
                </div>
                <span className="text-slate-400 font-mono text-[9px]">&darr;</span>
                <div className="w-full px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-center font-medium flex items-center justify-center gap-1">
                  <FileSearch className="w-3 h-3 text-blue-700" />
                  <span>EVIDENCE</span>
                </div>
                <span className="text-slate-400 font-mono text-[9px]">&darr;</span>
                <div className="w-full px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-[#0F766E] text-center font-semibold">
                  GUIDANCE
                </div>
              </div>
            </div>

            {/* Card Copy */}
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="italiana-regular font-bold text-2xl text-slate-900 leading-tight">
                  Guidance you can understand and trust
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  MedGuide connects responses to trusted medical information and shows supporting sources where available, helping you understand where guidance comes from.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
