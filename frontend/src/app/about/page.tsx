import React from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import { HealthcareRealityStrip } from "@/components/marketing/features/healthcare-reality-strip";
import {
  Globe,
  MapPin,
  BookOpen,
  ShieldCheck,
  Cpu,
  Users,
  HeartHandshake,
  ArrowRight,
  Target,
} from "lucide-react";

export const metadata = {
  title: "About MedGuide AI | Rural Healthcare Intelligence Platform",
  description:
    "MedGuide AI is a student-led research initiative building AI-powered preliminary healthcare support for rural and underserved communities in India.",
};

const barriers = [
  {
    title: "Language Barrier",
    description:
      "Support in English, Hindi (हिंदी), and Telugu (తెలుగు) with speech interaction designed for users with low digital literacy.",
    icon: Globe,
    badgeText: "Multilingual",
  },
  {
    title: "Geographic Barrier",
    description:
      "Guidance available anytime without requiring immediate travel to distant primary health centers for routine questions.",
    icon: MapPin,
    badgeText: "Rural Reach",
  },
  {
    title: "Knowledge Barrier",
    description:
      "Complex clinical guidelines converted into plain, understandable language grounded directly in WHO and NHM primary care manuals.",
    icon: BookOpen,
    badgeText: "WHO Grounded",
  },
];

const coreStrengths = [
  {
    title: "Multilingual First",
    body: "English, Hindi, and Telugu voice and text capabilities built into the core pipeline architecture from day one.",
    icon: Globe,
  },
  {
    title: "Safety Over Capability",
    body: "Every response passes through deterministic red-flag triage before LLM generation. Safety rules cannot be bypassed.",
    icon: ShieldCheck,
  },
  {
    title: "Grounded in Evidence",
    body: "Answers cite specific WHO guidelines and rural health protocols, preventing ungrounded model hallucinated claims.",
    icon: BookOpen,
  },
  {
    title: "Offline-Conscious",
    body: "Patient profiles, timelines, and medication schedules are designed to function reliably under limited connectivity.",
    icon: Cpu,
  },
  {
    title: "Built for Healthcare Workers",
    body: "ASHA workers and rural clinic staff receive structured patient summaries to streamline care coordination.",
    icon: Users,
  },
  {
    title: "Free and Open",
    body: "Built using open-source models, PostgreSQL, and pgvector for deployment without expensive commercial API lock-in.",
    icon: HeartHandshake,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="Healthcare access should not depend on location, language, or literacy."
        subtitle="MedGuide AI is a student-led research and engineering project building accessible, AI-assisted preliminary health support for rural and underserved communities across India."
        primaryCtaText="Explore How It Works"
        primaryCtaHref="/how-it-works"
        secondaryCtaText="Read Safety Framework"
        secondaryCtaHref="/safety"
      />

      {/* ── Section 1: Addressing Rural Barriers ────────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            title="Bridging Healthcare Barriers"
            subtitle="How MedGuide AI tackles systemic healthcare access challenges in rural India."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12">
            {barriers.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-[32px] border border-slate-200/90 p-8 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ItemIcon className="w-6 h-6 text-[#0F766E]" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-teal-50/90 text-[#0F766E] text-[11px] font-semibold border border-teal-200/70">
                        {item.badgeText}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h3 className="montserrat-bold text-xl font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 2: Why MedGuide AI ──────────────────────── */}
      <section className="py-16 sm:py-24 bg-[#FCFCFA] border-t border-slate-200/60">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <SectionHeader
            title="Why MedGuide AI"
            subtitle="Built around the practical constraints of rural primary care in resource-limited settings."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {coreStrengths.map((item) => {
              const StrengthsIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white border border-slate-200/90 shadow-2xs rounded-[32px] p-7 flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <StrengthsIcon className="w-5 h-5 text-[#0F766E]" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="montserrat-bold text-lg font-bold text-slate-900 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {item.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Healthcare Reality Strip ─────────────────────────────── */}
      <HealthcareRealityStrip />

      {/* ── Section 3: UN SDG Alignment ────────────────────────── */}
      <section className="py-16 sm:py-24 border-t border-slate-200/60">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          {/* Visual Rural Health Deployment Slot Container */}
          <div className="mb-16 max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-[#121927] text-white rounded-[36px] p-8 sm:p-12 shadow-xl border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-400 bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/60">
                  RESEARCH &amp; DEPLOYMENT
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white">
                  Student-Led Rural Healthcare Engineering
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Designed and prototyped by student AI engineers to bring open-source speech, RAG, and NLP models to Primary Health Centres (PHCs) and community health workers across India.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-2xl text-xs font-mono text-teal-300">
                    Target: 100% Free &amp; Open Source
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-2xl text-xs font-mono text-amber-300">
                    Deployment: Low-Bandwidth Edge
                  </div>
                </div>
              </div>

              {/* Visual Graphic Slot */}
              <div className="md:col-span-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="montserrat-bold text-sm font-bold text-white">
                  Rural PHC Pilot Slot
                </h4>
                <p className="text-[11px] text-slate-400">
                  Visual container slot representing rural health clinic deployment points in English, Hindi, and Telugu regions.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-[32px] border border-slate-200/90 p-8 sm:p-12 shadow-2xs flex flex-col md:flex-row items-start gap-8">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/70 text-[#0F766E] flex items-center justify-center shrink-0">
              <Target className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F766E] bg-teal-50/80 px-3.5 py-1 rounded-full border border-teal-200/60">
                SDG ALIGNMENT
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-slate-900">
                UN SDG 3: Good Health &amp; Well-Being
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Target 3.8: Achieve universal health coverage, including access to quality essential healthcare services and access to safe, effective, and affordable essential medicines.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed font-normal pt-1">
                MedGuide AI directly supports this goal by extending preliminary health assistance to underserved populations who lack affordable, linguistically appropriate, and geographically accessible primary healthcare.
              </p>
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-[32px] p-8 sm:p-12 max-w-4xl mx-auto shadow-md flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Learn more about our technology.
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                Explore the technical architecture, speech models, and RAG pipeline behind MedGuide AI.
              </p>
            </div>

            <Link
              href="/how-it-works"
              className="btn-pill bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-full shrink-0 inline-flex items-center gap-2"
            >
              <span>How It Works</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
