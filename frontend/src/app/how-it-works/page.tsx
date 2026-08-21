import React from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import {
  Mic,
  Brain,
  FileSearch,
  MessageSquareCheck,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export const metadata = {
  title: "How It Works | MedGuide AI",
  description:
    "From voice input to deterministic triage and RAG-grounded guidance: the patient journey and technical pipeline behind MedGuide AI.",
};

const userWorkflowSteps = [
  {
    stepNum: "01",
    label: "Ask",
    title: "Speak or type in your native language",
    description:
      "Describe what you are experiencing using text or voice in English, Hindi (हिंदी), or Telugu (తెలుగు). No medical terminology or complex phrasing required.",
    accentColor: "from-teal-500/10 via-indigo-50/50 to-purple-50/40",
    borderColor: "border-teal-200/80",
    icon: Mic,
    iconColor: "text-[#0F766E]",
    badgeText: "Voice & Text",
  },
  {
    stepNum: "02",
    label: "Understand",
    title: "Contextual symptom extraction",
    description:
      "MedGuide structures reported symptoms and maps natural language descriptions into standardized clinical concepts for evaluation.",
    accentColor: "from-amber-500/10 via-amber-50/50 to-orange-50/30",
    borderColor: "border-amber-200/80",
    icon: Brain,
    iconColor: "text-amber-700",
    badgeText: "NLP Concepts",
  },
  {
    stepNum: "03",
    label: "Ground",
    title: "Retrieval from WHO & NHM corpus",
    description:
      "Relevant medical guidelines and rural primary care protocols are retrieved via vector similarity search before any guidance is generated.",
    accentColor: "from-blue-500/10 via-slate-50/50 to-teal-50/30",
    borderColor: "border-blue-200/80",
    icon: FileSearch,
    iconColor: "text-blue-700",
    badgeText: "WHO Verified",
  },
  {
    stepNum: "04",
    label: "Explain",
    title: "Simple, plain-language guidance",
    description:
      "The response is presented in clear, accessible language with explicit source citations showing where information originated.",
    accentColor: "from-indigo-500/10 via-indigo-50/50 to-purple-50/30",
    borderColor: "border-indigo-200/80",
    icon: MessageSquareCheck,
    iconColor: "text-indigo-700",
    badgeText: "Source Cites",
  },
  {
    stepNum: "05",
    label: "Act",
    title: "Risk classification & emergency escalation",
    description:
      "Guidance includes a clear risk status (Routine, Urgent, or Emergency) with immediate 108 / 112 prompts when emergency criteria are met.",
    accentColor: "from-rose-500/10 via-rose-50/50 to-amber-50/30",
    borderColor: "border-rose-200/80",
    icon: ShieldAlert,
    iconColor: "text-rose-700",
    badgeText: "Triage Alert",
  },
];

const techPillars = [
  {
    title: "Indic Speech Processing",
    description:
      "Open-source ASR models process spoken Hindi and Telugu inputs, enabling low-literacy patients to interact naturally.",
    icon: Mic,
    techBadge: "Whisper / Indic ASR",
  },
  {
    title: "Deterministic Triage Filter",
    description:
      "Rule-based red-flag evaluation tests acute symptoms before LLM inference. Safety rules cannot be overridden by model outputs.",
    icon: ShieldCheck,
    techBadge: "Rule Engine",
  },
  {
    title: "RAG Vector Search",
    description:
      "Vector embeddings query WHO, NHM, and clinical guidelines using PostgreSQL and pgvector for grounded context.",
    icon: Database,
    techBadge: "pgvector RAG",
  },
  {
    title: "Constrained Local LLM",
    description:
      "Open-source local LLMs generate responses strictly constrained to retrieved evidence without ungrounded hallucination.",
    icon: Cpu,
    techBadge: "Local LLM",
  },
];

const scopeRestrictions = [
  {
    title: "No Autonomous Medical Diagnosis",
    description:
      "MedGuide AI provides preliminary health information and triage guidance, never definitive clinical diagnoses.",
  },
  {
    title: "No Medication Prescribing or Alterations",
    description:
      "The system cannot prescribe drugs, adjust dosages, or advise stopping prescribed medications.",
  },
  {
    title: "No Overriding Doctors",
    description:
      "Guidance is designed to support patient decision-making and healthcare worker coordination, not override qualified professionals.",
  },
  {
    title: "No Ungrounded Generation",
    description:
      "Every medical response requires retrieved evidence from verified guidelines; low-confidence queries trigger safe disclosures.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="From a health question to a clearer next step."
        subtitle="MedGuide AI travels through a safety-first pipeline to process natural language, ground responses in verified medical guidelines, and deliver simple actionable guidance."
        primaryCtaText="Ask MedGuide"
        primaryCtaHref="/app/chat"
        secondaryCtaText="Explore Safety Framework"
        secondaryCtaHref="/safety"
      />

      {/* ── Section 1: User Experience Journey ───────────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            title="A simple, 5-step process designed for everyone."
            subtitle="Whether speaking in a rural clinic or typing from home, queries follow a transparent, safety-checked pathway."
          />

          {/* 5-Step Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12">
            {userWorkflowSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.stepNum}
                  className="bg-white rounded-[32px] border border-slate-200/90 p-8 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    {/* Header Visual Box */}
                    <div
                      className={`h-40 rounded-2xl bg-gradient-to-br ${step.accentColor} border ${step.borderColor} p-6 flex flex-col justify-between relative overflow-hidden`}
                    >
                      <div className="flex items-center justify-between z-10">
                        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                          STEP {step.stepNum}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/90 text-slate-800 text-[11px] font-semibold shadow-2xs">
                          {step.badgeText}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 z-10">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                          <StepIcon className={`w-6 h-6 ${step.iconColor}`} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          {step.label}
                        </span>
                      </div>
                    </div>

                    {/* Step Title & Copy */}
                    <div className="space-y-2 pt-2">
                      <h3 className="montserrat-bold text-xl font-bold text-slate-900 tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Visual Phone Interface Simulation Container */}
          <div className="mt-20 bg-white rounded-[36px] border border-slate-200/90 p-8 sm:p-12 shadow-2xs">
            <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F766E] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/60">
                VISUAL SIMULATION
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-slate-900">
                Simulated Patient Interface Experience
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                Visual slot representing the MedGuide mobile web companion interface during real-time speech and triage processing.
              </p>
            </div>

            {/* Visual Screen Frame */}
            <div className="max-w-xl mx-auto bg-slate-900 rounded-[32px] p-6 text-white shadow-xl border border-slate-800 space-y-6">
              {/* Device Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-teal-300 font-bold">
                    MedGuide Companion Live
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  Model: Ollama / Qwen 3:4B
                </span>
              </div>

              {/* Chat Bubble Simulation */}
              <div className="space-y-4 text-xs font-sans">
                <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-teal-400 uppercase">
                      Patient Voice Input (Hindi)
                    </span>
                    <span>14:52 PM</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    &quot;बच्चे को दो दिन से तेज बुखार है और वह सुस्त लग रहा है।&quot;
                  </p>
                  <span className="text-[10px] text-slate-400 block italic">
                    Translation: &quot;Child has high fever for two days and looks lethargic.&quot;
                  </span>
                </div>

                <div className="bg-teal-950/70 rounded-2xl p-4 border border-teal-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-teal-300">
                    <span className="font-bold uppercase tracking-wider">
                      MedGuide Triage &amp; RAG Response
                    </span>
                    <span className="bg-teal-900 text-teal-200 px-2 py-0.5 rounded font-mono text-[9px]">
                      ROUTINE CARE
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    1. Keep the child hydrated with ORS and safe fluids.<br />
                    2. Monitor temperature every 4 hours.<br />
                    3. Seek immediate clinic care if breathing becomes rapid or child stops taking fluids.
                  </p>
                  <div className="pt-2 border-t border-teal-900/80 flex items-center justify-between text-[10px] text-teal-400">
                    <span>Source: WHO PEN Rural Fever Guideline Sec 3.2</span>
                    <span className="font-mono">Confidence: 94.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Technical Architecture Behind the Scenes ── */}
      <section className="py-16 sm:py-24 bg-[#FCFCFA] border-t border-slate-200/60 text-slate-900 relative overflow-hidden">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <SectionHeader
            eyebrow="TECHNICAL ARCHITECTURE"
            title="What happens behind the scenes."
            subtitle="Behind the simple interface sits a robust, open-source pipeline combining Indic speech processing, deterministic triage logic, and RAG vector search."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {techPillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-white border border-slate-200/90 shadow-2xs rounded-[32px] p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:shadow-md transition-all group"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <PillarIcon className="w-6 h-6 text-[#0F766E]" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="montserrat-bold text-lg font-bold text-slate-900 tracking-tight">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {pillar.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-teal-50/90 text-[#0F766E] text-[11px] font-mono border border-teal-200/70 font-medium">
                      {pillar.techBadge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: Scope Protection & Safeguards ─────────── */}
      <section className="py-16 sm:py-24 border-t border-slate-200/60">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            eyebrow="SAFETY BOUNDARIES"
            title="What MedGuide AI cannot do."
            subtitle="To protect patient safety and maintain trust, explicit safeguards are hard-coded into the pipeline."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
            {scopeRestrictions.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-2xs flex items-start gap-4"
              >
                <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
                <div className="space-y-1.5">
                  <h3 className="font-sans text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-[32px] p-8 sm:p-12 max-w-4xl mx-auto shadow-md flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Ready to try MedGuide AI?
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                Experience voice-first health guidance designed for India&apos;s rural healthcare context.
              </p>
            </div>

            <Link
              href="/app/chat"
              className="btn-pill bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-full shrink-0 inline-flex items-center gap-2"
            >
              <span>Ask a Health Question</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
