"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronUp, MessageSquareHeart, PhoneCall, HelpCircle } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What is MedGuide AI?",
    a: "MedGuide AI is an AI-powered healthcare intelligence platform designed to provide an accessible first layer of preliminary health guidance, symptom triage, and medical information for rural and underserved communities in India.",
    category: "General",
  },
  {
    q: "Can I speak instead of typing?",
    a: "Yes. MedGuide AI features voice-first interaction allowing users to tap the microphone, speak their health concerns in their native language, and listen to spoken guidance.",
    category: "Features",
  },
  {
    q: "Which languages are supported?",
    a: "MedGuide AI currently supports English, Hindi (हिंदी), and Telugu (తెలుగు) for both text and speech interactions.",
    category: "Languages",
  },
  {
    q: "Does MedGuide replace a doctor?",
    a: "No. MedGuide AI is strictly an informational primary-care assistance tool. It never provides definitive medical diagnoses or replaces qualified clinical professionals.",
    category: "Safety",
  },
  {
    q: "How does MedGuide use sources?",
    a: "MedGuide AI uses Retrieval-Augmented Generation (RAG) over verified medical reference documents, including WHO guidelines and National Health Mission protocols, providing traceable citations for every response.",
    category: "Technology",
  },
  {
    q: "What should I do in an emergency?",
    a: "In case of emergency indicators such as severe chest pain or breathlessness, MedGuide AI immediately escalates to prompt calling national emergency services (108 Ambulance / 112 Emergency) or seeking local Primary Health Centre (PHC) care.",
    category: "Safety",
  },
  {
    q: "Is my health information private?",
    a: "Yes. MedGuide AI adheres to data minimization and privacy rules. Patient-reported symptoms and query histories are stored securely and never shared with unauthorized third parties.",
    category: "Privacy",
  },
  {
    q: "Can I use MedGuide on a low internet connection?",
    a: "Yes. MedGuide is built with offline-first caching for previously retrieved health timelines, basic safety rules, and local emergency contacts.",
    category: "Access",
  },
  {
    q: "What happens if MedGuide is unsure?",
    a: "If confidence scores from medical source retrieval are low or information is unclear, MedGuide explicitly states uncertainty and recommends consulting a qualified healthcare worker rather than guessing.",
    category: "Safety",
  },
];

export const FAQSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAnswer = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="section-gap bg-white border-b border-[#161A24]/10">
      <div className="section-container">
        {/* Header & Search */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest text-[#8C6D46] uppercase bg-amber-50 border border-amber-200/80">
            <HelpCircle className="w-3.5 h-3.5 text-[#8C6D46]" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <h2 className="text-section-title">
            Answers to common questions about MedGuide
          </h2>

          <p className="text-base text-slate-600">
            Everything you need to know about multilingual voice guidance, medical grounding, and patient safety.
          </p>

          {/* Live Search Filter Input */}
          <div className="relative max-w-xl mx-auto pt-4">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-7" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. voice, languages, doctor, emergency)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-full border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1C1917] transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Content Layout (Main FAQs + Dark Sticky Contact Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* FAQ Accordion List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No matching questions found for &ldquo;{searchQuery}&rdquo;. Try a different search term.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all shadow-2xs hover:border-slate-300"
                >
                  <button
                    onClick={() => toggleAnswer(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 text-sm sm:text-base cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openIdx === idx ? (
                      <ChevronUp className="w-5 h-5 text-[#8C6D46] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {openIdx === idx && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Dark Sticky Contact Panel (FAQ 9 feature recolored) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-3xl bg-[#1C1917] text-white space-y-5 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 text-amber-200 flex items-center justify-center font-bold">
                <MessageSquareHeart className="w-6 h-6 text-amber-200" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-normal text-white">
                  Still have questions?
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Can&apos;t find what you&apos;re looking for? Talk directly with our team or test the voice companion.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/contact"
                  className="w-full btn-pill btn-pill-primary text-xs font-semibold justify-center min-h-[44px]"
                >
                  Contact Support
                </Link>

                <Link
                  href="/app/emergency"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-red-950/80 text-red-300 border border-red-800 text-xs font-bold hover:bg-red-900 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Emergency Help (108/112)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
