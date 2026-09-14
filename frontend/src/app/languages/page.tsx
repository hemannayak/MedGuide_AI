"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import {
  Globe2,
  Mic,
  Volume2,
  Play,
  Pause,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export default function LanguagesPage() {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const languages = [
    {
      code: "EN",
      name: "English",
      nativeName: "English",
      description: "Clear, accessible primary health guidance in English.",
      exampleText: "What are early signs of dehydration in children and how do I prepare ORS?",
      accentGradient: "from-blue-500/10 via-indigo-50/40 to-slate-50",
      borderColor: "border-blue-200/80",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      audioSample: "en_sample",
    },
    {
      code: "HI",
      name: "Hindi",
      nativeName: "हिंदी",
      description: "हिंदी में सहज और भरोसेमंद स्वास्थ्य जानकारी और मार्गदर्शन।",
      exampleText: "बच्चे को तेज बुखार होने पर प्राथमिक देखभाल के लिए क्या उपाय करें?",
      accentGradient: "from-amber-500/10 via-amber-50/40 to-orange-50/30",
      borderColor: "border-amber-200/80",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      audioSample: "hi_sample",
    },
    {
      code: "TE",
      name: "Telugu",
      nativeName: "తెలుగు",
      description: "తెలుగులో పూర్తి ఆరోగ్య సమాచారం మరియు మార్గదర్శకత్వం.",
      exampleText: "అధిక రక్తపోటును ఇంట్లో సురక్షితంగా ఎలా అదుపులో ఉంచుకోవాలి?",
      accentGradient: "from-purple-500/10 via-purple-50/40 to-pink-50/30",
      borderColor: "border-purple-200/80",
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
      audioSample: "te_sample",
    },
  ];

  const accessibilityPillars = [
    {
      title: "Voice-First Interaction",
      subtitle: "Natural Spoken Queries",
      description:
        "Speak naturally without needing to type or navigate complex form menus. Designed specifically for low-digital-literacy users in rural communities.",
      icon: Mic,
      badgeText: "Speech-to-Text",
    },
    {
      title: "Native TTS Playback",
      subtitle: "Regional Accent Synthesis",
      description:
        "Listen to spoken guidance synthesized in clear, natural regional accents. Patients can hear their advice spoken aloud in Hindi, Telugu, or English.",
      icon: Volume2,
      badgeText: "Text-to-Speech",
    },
  ];

  const toggleAudio = (id: string) => {
    setPlayingAudio(playingAudio === id ? null : id);
  };

  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="Multilingual Voice AI for India's Healthcare"
        subtitle="Breaking language and literacy barriers with high-accuracy speech processing, native Indic scripts, and clear audio playback in English, Hindi, and Telugu."
        primaryCtaText="Try Voice Companion"
        primaryCtaHref="/app/chat"
        secondaryCtaText="How It Works"
        secondaryCtaHref="/how-it-works"
      />

      {/* ── Section 1: Supported Languages Showcase ──────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            eyebrow="MULTILINGUAL SUPPORT"
            title="Supported Languages & Scripts"
            subtitle="Health guidance rendered in your native language with voice input and audio synthesis."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className="bg-white rounded-[32px] border border-slate-200/90 p-8 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-5">
                  {/* Language Card Header Slot */}
                  <div
                    className={`h-40 rounded-2xl bg-gradient-to-br ${lang.accentGradient} border ${lang.borderColor} p-6 flex flex-col justify-between relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="text-2xl font-serif font-bold text-slate-900">
                        {lang.nativeName}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${lang.badgeColor}`}
                      >
                        {lang.code}
                      </span>
                    </div>

                    {/* Audio Wave Visual Mockup */}
                    <div className="flex items-center justify-between z-10 pt-2">
                      <button
                        onClick={() => toggleAudio(lang.audioSample)}
                        className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-[#0F766E] hover:scale-105 transition-transform cursor-pointer"
                      >
                        {playingAudio === lang.audioSample ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        {[40, 70, 30, 90, 60, 80, 40, 65, 35].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all duration-300 ${
                              playingAudio === lang.audioSample
                                ? "bg-[#0F766E] animate-pulse"
                                : "bg-slate-300"
                            }`}
                            style={{ height: `${h}%`, maxHeight: "24px" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description & Example Query */}
                  <div className="space-y-3 pt-2">
                    <h3 className="montserrat-bold text-xl font-bold text-slate-900 tracking-tight">
                      {lang.name} ({lang.nativeName})
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {lang.description}
                    </p>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block">
                        Example Query:
                      </span>
                      <p className="italic text-slate-600 font-serif text-sm">
                        &quot;{lang.exampleText}&quot;
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/app/chat"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  <span>Try in {lang.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Speech & Voice Accessibility ──────────── */}
      <section className="py-16 sm:py-24 bg-[#FCFCFA] border-t border-slate-200/60">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            eyebrow="VOICE-FIRST ARCHITECTURE"
            title="Speech & Voice Accessibility"
            subtitle="Designed for low digital literacy so anyone can speak naturally and hear guidance in regional accents."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {accessibilityPillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-white rounded-[32px] border border-slate-200/90 p-8 shadow-2xs hover:shadow-md transition-all duration-200 space-y-6 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <PillarIcon className="w-6 h-6 text-[#0F766E]" />
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-teal-50/90 text-[#0F766E] text-[11px] font-semibold border border-teal-200/70">
                      {pillar.badgeText}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="montserrat-bold text-xl font-bold text-slate-900 tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                      {pillar.subtitle}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal pt-1">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Speech Pipeline Visual Illustration Container */}
          <div className="mt-16 bg-white rounded-[32px] border border-slate-200/90 p-8 sm:p-12 shadow-2xs">
            <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F766E] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/60">
                PIPELINE FLOW
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-slate-900">
                End-to-End Indic Voice Pipeline
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                From spoken audio stream to ASR transcription, vector retrieval, and TTS audio synthesis.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {[
                { step: "01", label: "Spoken Input", sub: "Hindi / Telugu / English audio stream" },
                { step: "02", label: "Indic ASR Engine", sub: "Speech-to-text transcript generation" },
                { step: "03", label: "RAG & Safety Check", sub: "WHO vector search + red-flag triage" },
                { step: "04", label: "TTS Speech Output", sub: "Synthesized regional voice response" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 space-y-2"
                >
                  <span className="text-xs font-mono font-bold text-[#0F766E]">
                    STEP {item.step}
                  </span>
                  <h4 className="montserrat-bold text-base font-bold text-slate-900">
                    {item.label}
                  </h4>
                  <p className="text-xs text-slate-500 font-normal">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-[32px] p-8 sm:p-12 max-w-4xl mx-auto shadow-md flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Experience voice AI in your language.
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                Try asking a health question using voice input in English, Hindi, or Telugu.
              </p>
            </div>

            <Link
              href="/app/chat"
              className="btn-pill bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-full shrink-0 inline-flex items-center gap-2 italiana-regular font-bold"
            >
              <span>Ask MedGuide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
