"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Lock,
  FileCheck,
  Users,
  ScrollText,
  Database,
} from "lucide-react";
import { MedButton } from "@/components/ui/med-button";

export const SafetyPipeline: React.FC = () => {
  return (
    <section className="section-gap bg-[#FAFAF8] text-slate-900 relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Section Header (Matching Sarvam AI Reference) */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.08]">
            Clinical-grade. Out of the box.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-normal">
            Medical safety, deterministic triage, and knowledge grounding. Not bolted on. Built in from day one.
          </p>
        </div>

        {/* Top 2 Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-6xl mx-auto">
          {/* Card 1: Clinical Safety Architecture */}
          <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-slate-200/90 shadow-2xs space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <h3 className="italiana-regular text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Clinical safety architecture
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                MedGuide AI structures symptoms, evaluates red flags deterministically, and grounds responses in WHO guidelines before any language model generation.
              </p>
            </div>

            {/* Bullet List */}
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium pt-2">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                <span>Deterministic red-flag filter before model retrieval</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                <span>WHO &amp; NHM corpus RAG vector search grounding</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                <span>Audit-logged clinical decision trails for healthcare workers</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                <span>Immediate emergency escalation pathways for 108 &amp; 112</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Deployment Flexibility */}
          <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-slate-200/90 shadow-2xs space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <h3 className="italiana-regular text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Deployment flexibility
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                MedGuide AI operates across diverse rural health environments. Deploy on private cloud, local hospital servers, hybrid, or edge devices.
              </p>
            </div>

            {/* Bullet List */}
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium pt-2">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                <span>Private cloud, local hospital server, or hybrid deployment</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                <span>Open-source local LLM inference (Qwen 3:4B / Llama 3)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                <span>PostgreSQL and pgvector vector search database</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                <span>Offline-capable local caching for patient records &amp; reminders</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Full-Width Card: Security & Governance */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-slate-200/90 shadow-2xs max-w-6xl mx-auto hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="italiana-regular text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Security, governance, and compliance
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Every patient interaction is logged and traceable. Role-based access, audit trails, and data residency controls built into the core, not retrofitted. Designed for India&apos;s rural healthcare infrastructure.
              </p>
            </div>

            {/* Right Compliance Badges Matrix */}
            <div className="lg:col-span-6 flex flex-wrap lg:justify-end gap-3">
              {/* Badge 1: SOC 2 */}
              <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold flex items-center gap-2 shadow-2xs">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>SOC 2 Type II</span>
              </div>

              {/* Badge 2: ISO 27001 */}
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ISO 27001</span>
              </div>

              {/* Badge 3: DPDP & ABDM */}
              <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
                <FileCheck className="w-4 h-4 text-amber-700" />
                <span>DPDP &amp; ABDM Compliant</span>
              </div>

              {/* Badge 4: Role-based access */}
              <div className="px-4 py-2.5 rounded-xl bg-fuchsia-50 border border-fuchsia-200/80 text-fuchsia-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
                <Users className="w-4 h-4 text-fuchsia-600" />
                <span>Role-based access</span>
              </div>

              {/* Badge 5: Full audit trail */}
              <div className="px-4 py-2.5 rounded-xl bg-yellow-50 border border-yellow-200/80 text-yellow-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
                <ScrollText className="w-4 h-4 text-yellow-700" />
                <span>Full audit trail</span>
              </div>

              {/* Badge 6: Data residency controls */}
              <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
                <Database className="w-4 h-4 text-rose-600" />
                <span>Data residency controls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="text-center mt-12 sm:mt-16">
          <Link href="/safety">
            <MedButton
              variant="primary"
              size="hero"
              icon={<ChevronRight className="w-4 h-4 text-slate-300" />}
            >
              Read Complete Safety Framework
            </MedButton>
          </Link>
        </div>
      </div>
    </section>
  );
};
