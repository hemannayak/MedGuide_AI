"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import { ChevronDown, ArrowRight, HelpCircle, ShieldCheck, Languages, Lock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: "safety" | "voice" | "privacy" | "general" | "workers";
}

const faqData: FAQItem[] = [
  {
    category: "general",
    question: "What is MedGuide AI and who is it designed for?",
    answer:
      "MedGuide AI is an open-source, AI-assisted primary healthcare guidance platform designed specifically for rural and underserved communities in India. It enables patients to ask health questions in natural spoken or written languages (English, Hindi, Telugu) and receive clear, WHO-grounded preliminary advice.",
  },
  {
    category: "general",
    question: "Is MedGuide AI a replacement for a doctor?",
    answer:
      "No. MedGuide AI strictly does NOT diagnose medical conditions, prescribe drugs, or replace qualified medical professionals. It serves as an accessible first layer of preliminary information, symptom triage, and escalation support.",
  },
  {
    category: "safety",
    question: "How does MedGuide AI prevent ungrounded AI hallucinations?",
    answer:
      "MedGuide AI uses Retrieval-Augmented Generation (RAG). Before answering any query, the system retrieves evidence chunks from verified WHO primary care manuals and National Health Mission protocols stored in a vector database. Every clinical claim includes explicit source citations.",
  },
  {
    category: "safety",
    question: "What happens if a patient reports an emergency symptom?",
    answer:
      "Reported symptoms pass through a deterministic red-flag triage filter before LLM processing. Acute symptoms like severe chest pain, breathlessness, or heavy bleeding trigger an immediate emergency escalation modal prompting 108 / 112 calls and hospital direction.",
  },
  {
    category: "voice",
    question: "Which languages are supported for voice and text?",
    answer:
      "MedGuide AI currently supports English, Hindi (हिंदी), and Telugu (తెలుగు) with native Indic speech-to-text (ASR) and text-to-speech (TTS) playback tailored for low-digital-literacy users.",
  },
  {
    category: "voice",
    question: "How does Prescription OCR work?",
    answer:
      "Patients can upload a photo of a doctor's prescription. MedGuide AI uses open-source OCR and vision parsing to extract medicine names, dosages, and schedules, converting them into structured reminders. Unclear prescriptions are flagged for verification rather than guessed.",
  },
  {
    category: "privacy",
    question: "Is patient health data kept private and secure?",
    answer:
      "Yes. MedGuide AI follows data minimization principles. Personal identifiers are never sold or shared. Role-based access control ensures patients only see their own timeline, while accredited healthcare workers only view authorized patient summaries.",
  },
  {
    category: "workers",
    question: "How does MedGuide AI support Accredited Healthcare Workers (ASHAs)?",
    answer:
      "Authorized healthcare workers have a dedicated dashboard displaying patient-reported symptoms, AI-summarized case notes, adherence tracking, and follow-up alerts, streamlining rural clinic visits.",
  },
];

const categories = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "general", label: "General & Scope", icon: HelpCircle },
  { id: "safety", label: "Clinical Safety & RAG", icon: ShieldCheck },
  { id: "voice", label: "Voice & Languages", icon: Languages },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
  { id: "workers", label: "Healthcare Workers", icon: Users },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs =
    activeCategory === "all"
      ? faqData
      : faqData.filter((item) => item.category === activeCategory);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Clear answers about MedGuide AI's clinical safety architecture, voice interaction, WHO grounding, and healthcare worker integration."
        primaryCtaText="Ask MedGuide"
        primaryCtaHref="/app/chat"
        secondaryCtaText="Contact Team"
        secondaryCtaHref="/contact"
      />

      {/* ── Main FAQ Container ──────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          {/* Visual Topic Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0F766E]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="montserrat-bold text-base font-bold text-slate-900">
                WHO Grounded Answers
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Learn how vector search checks WHO &amp; NHM manuals before responding.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700">
                <Languages className="w-5 h-5" />
              </div>
              <h4 className="montserrat-bold text-base font-bold text-slate-900">
                Indic Voice Interaction
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discover native speech synthesis for Hindi, Telugu, and English.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="montserrat-bold text-base font-bold text-slate-900">
                Healthcare Worker Integration
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Understand how structured summaries empower ASHAs and clinic staff.
              </p>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setOpenIndex(0);
                  }}
                  className={`btn-pill text-xs font-semibold px-4 py-2.5 rounded-full inline-flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50"
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.question}
                  className="bg-white rounded-[28px] border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <h3 className="montserrat-bold text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {item.question}
                    </h3>
                    <div
                      className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-teal-50 text-[#0F766E]" : "text-slate-500"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-6 sm:px-7 sm:pb-7 text-sm sm:text-base text-slate-600 leading-relaxed font-normal border-t border-slate-100 pt-4">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-20 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-[32px] p-8 sm:p-12 max-w-4xl mx-auto shadow-md flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Still have unanswered questions?
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                Our team is happy to answer technical, clinical, or research inquiries.
              </p>
            </div>

            <Link
              href="/contact"
              className="btn-pill bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-full shrink-0 inline-flex items-center gap-2"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
