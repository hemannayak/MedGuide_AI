import React from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  FileSearch,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Stethoscope,
  Database,
  Brain,
  AlertTriangle,
} from "lucide-react";

export const metadata = {
  title: "Safety & AI Ethics Framework | MedGuide AI",
  description:
    "Clinical safety architecture, deterministic red-flag triage, RAG medical grounding, and system boundaries in MedGuide AI.",
};

const safetyPillars = [
  {
    num: "01",
    title: "RAG Knowledge Grounding",
    sub: "WHO & NHM Verified Evidence",
    body: "Every guidance output is strictly grounded in vector search results from WHO primary care manuals and National Health Mission protocols. Citations explicitly show document title, section, and publisher provenance.",
    whyText: "Prevents unconstrained hallucination; every health claim is traceable.",
    icon: Database,
    badgeText: "WHO Grounded",
  },
  {
    num: "02",
    title: "Deterministic Red-Flag Triage",
    sub: "Rule-Engine Pre-Filter",
    body: "Critical emergency symptoms (chest pain, respiratory distress, acute trauma) are evaluated against hard-coded clinical decision logic before LLM inference. Safety-critical triage rules cannot be overridden by model generation.",
    whyText: "Deterministic, testable emergency escalation independent of model variance.",
    icon: ShieldAlert,
    badgeText: "Rule Engine",
  },
  {
    num: "03",
    title: "Evidence Sufficiency Gate",
    sub: "Low-Confidence Refusal",
    body: "If vector similarity search falls below minimum confidence thresholds when medical evidence is insufficient, the system safely declines to answer rather than fabricating ungrounded information.",
    whyText: "Uncertain clinical statements must never be presented as medical fact.",
    icon: FileSearch,
    badgeText: "Strict Gate",
  },
  {
    num: "04",
    title: "Healthcare Worker Alignment",
    sub: "Human-in-the-Loop Protocol",
    body: "MedGuide AI structures patient-reported symptoms into clear clinical summaries for accredited ASHAs and rural healthcare workers, reinforcing qualified human oversight at every step.",
    whyText: "AI acts as a supportive preliminary layer, never a diagnostic replacement.",
    icon: Stethoscope,
    badgeText: "ASHA Support",
  },
];

const hardBoundaries = [
  {
    title: "No Autonomous Diagnosis",
    description:
      "MedGuide AI provides preliminary health information and triage advice, never definitive medical or clinical diagnoses.",
    icon: XCircle,
  },
  {
    title: "No Prescribing or Dosage Changes",
    description:
      "The platform strictly prohibits recommending medication, altering prescribed dosages, or advising patients to stop medications.",
    icon: XCircle,
  },
  {
    title: "No Overriding Doctors",
    description:
      "Guidance is designed to support patient decision-making and healthcare worker coordination, never override qualified medical staff.",
    icon: XCircle,
  },
  {
    title: "No Fabricated References",
    description:
      "Retrieval provenance is enforced; the system never generates fake research papers, clinical citations, or fictitious guidelines.",
    icon: XCircle,
  },
];

const pipelineSteps = [
  { stepNum: "1", title: "Natural Language Input", sub: "Voice & Text in Indic scripts" },
  { stepNum: "2", title: "Symptom Concept Extraction", sub: "NLP clinical entity mapping" },
  { stepNum: "3", title: "Deterministic Red-Flag Filter", sub: "Pre-inference rule check" },
  { stepNum: "4", title: "Vector Search Retrieval", sub: "pgvector WHO/NHM corpus" },
  { stepNum: "5", title: "Constrained Generation", sub: "Evidence-bound local LLM" },
  { stepNum: "6", title: "Safety Validation & Triage", sub: "Routine / Urgent / Emergency" },
];

export default function SafetyPage() {
  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="Clinical Safety Architecture & Governance"
        subtitle="MedGuide AI is engineered specifically to prevent unconstrained language model generation in healthcare. All guidance is grounded in verified guidelines and governed by deterministic safety rules."
        primaryCtaText="How It Works"
        primaryCtaHref="/how-it-works"
        secondaryCtaText="Read Safety FAQs"
        secondaryCtaHref="/faq"
      />

      {/* ── Section 1: Core Safety Commitments ──────────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            title="Our Core Safety Commitments"
            subtitle="Four foundational pillars designed to eliminate hallucination and ensure grounded, safe preliminary health guidance."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-12">
            {safetyPillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <div
                  key={pillar.num}
                  className="bg-white rounded-[32px] border border-slate-200/90 p-8 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    {/* Header Pill & Icon */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <PillarIcon className="w-6 h-6 text-[#0F766E]" />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                          PILLAR {pillar.num}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-teal-50/90 text-[#0F766E] text-[11px] font-semibold border border-teal-200/70">
                        {pillar.badgeText}
                      </span>
                    </div>

                    {/* Title & Body */}
                    <div className="space-y-2 pt-2">
                      <h3 className="montserrat-bold text-xl font-bold text-slate-900 tracking-tight">
                        {pillar.title}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                        {pillar.sub}
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed font-normal pt-1">
                        {pillar.body}
                      </p>
                    </div>
                  </div>

                  {/* Why Box */}
                  <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">Why it matters: </span>
                    {pillar.whyText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 2: Clinical Safety Pipeline ──────────────── */}
      <section className="py-16 sm:py-24 bg-[#FCFCFA] border-t border-slate-200/60">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            title="The Clinical Safety Pipeline"
            subtitle="Every patient interaction passes through a multi-stage validation flow before any guidance is rendered."
          />

          {/* Pipeline Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {pipelineSteps.map((step) => (
              <div
                key={step.stepNum}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex items-start gap-4 hover:shadow-xs transition-shadow"
              >
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/70 text-[#0F766E] font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  {step.stepNum}
                </div>
                <div className="space-y-1">
                  <h4 className="montserrat-bold text-base font-bold text-slate-900">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-normal">
                    {step.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual RAG Document Chunk Provenance Container */}
          <div className="mt-16 bg-white rounded-[36px] border border-slate-200/90 p-8 sm:p-12 shadow-2xs">
            <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F766E] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/60">
                PROVENANCE INSPECTION
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-slate-900">
                Transparent Document Citation Slot
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                Visual demonstration of vector chunk retrieval showing title, publisher, page, and vector similarity match score.
              </p>
            </div>

            <div className="max-w-2xl mx-auto bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0F766E]" />
                  <span className="montserrat-bold text-xs font-bold text-slate-900">
                    Retrieved Document Chunk #WHO-PEN-2024-C4
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  Score: 0.942 (Pass)
                </span>
              </div>

              <div className="text-xs text-slate-700 space-y-2 font-mono bg-white p-4 rounded-xl border border-slate-200/80">
                <p className="text-slate-900 font-bold font-sans text-xs">Ingested Source Text:</p>
                <p className="text-slate-600 italic">
                  &quot;In children presenting with acute febrile illness under 5 years, oral rehydration therapy (ORT) combined with zinc supplementation must be initiated immediately upon detecting loose stools or vomiting...&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block font-medium text-[10px]">Publisher:</span>
                  <span className="font-semibold text-slate-800">World Health Organization</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium text-[10px]">Document:</span>
                  <span className="font-semibold text-slate-800">WHO PEN Package 2024</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium text-[10px]">Section:</span>
                  <span className="font-semibold text-slate-800">Sec 4.2 Primary Triage</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium text-[10px]">Provenance ID:</span>
                  <span className="font-semibold text-slate-800 font-mono text-[10px]">WHO-PEN-v4.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Hard System Boundaries ────────────────── */}
      <section className="py-16 sm:py-24 border-t border-slate-200/60">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            title="Hard System Boundaries"
            subtitle="Medical rules and safety limits that are hard-coded and cannot be bypassed."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
            {hardBoundaries.map((boundary) => (
              <div
                key={boundary.title}
                className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-2xs flex items-start gap-4"
              >
                <boundary.icon className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
                <div className="space-y-1.5">
                  <h3 className="montserrat-bold text-base font-bold text-slate-900">
                    {boundary.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {boundary.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-[32px] p-8 sm:p-12 max-w-4xl mx-auto shadow-md flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Have questions about AI safety?
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                Read our detailed answers to common clinical, technical, and data privacy questions.
              </p>
            </div>

            <Link
              href="/faq"
              className="btn-pill bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-full shrink-0 inline-flex items-center gap-2"
            >
              <span>Explore FAQs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
