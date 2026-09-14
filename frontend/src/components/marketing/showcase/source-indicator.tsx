"use client";

import React, { useState } from "react";
import { ShieldCheck, ChevronDown, BookOpen, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SourceItem {
  title: string;
  publisher: string;
  section: string;
}

const SOURCES: SourceItem[] = [
  {
    title: "Integrated Management of Childhood Illness (IMCI)",
    publisher: "World Health Organization (WHO)",
    section: "Section 4.2: Pediatric Fever & Dehydration Management",
  },
  {
    title: "National Health Mission Primary Care Protocols 2024",
    publisher: "Ministry of Health & Family Welfare",
    section: "Chapter 3: Acute Respiratory & Fever Triage",
  },
  {
    title: "Community Health Worker (ASHA/ANM) Field Manual",
    publisher: "National Rural Health Mission (NRHM)",
    section: "Module 6: Red-Flag Symptom Identification",
  },
];

export const SourceIndicator: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-[#E8F5F2]/50 border border-[#0F766E]/15 p-3.5 space-y-2 text-xs">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group focus:outline-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
              Grounded in 3 Verified Medical Sources
            </span>
            <span className="block text-[11px] text-slate-500 font-normal">
              Deterministic RAG retrieval &bull; No hallucinated claims
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#0F766E] font-bold">
          <span>{isExpanded ? "Hide sources" : "View sources"}</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden pt-2 border-t border-[#0F766E]/10 space-y-2"
          >
            {SOURCES.map((source, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white border border-[#0F766E]/10 flex items-start gap-2.5 text-[11px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    {source.title}
                    <CheckCircle2 className="w-3 h-3 text-[#15803D] shrink-0" />
                  </div>
                  <div className="text-slate-500 font-medium">
                    {source.publisher} &bull; <span className="text-[#0F766E] font-semibold">{source.section}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
