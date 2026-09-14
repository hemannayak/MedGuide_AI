"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquareHeart, BookOpen, ArrowRight } from "lucide-react";

interface ConversationDemo {
  code: "hi" | "te" | "en";
  langName: string;
  userQuery: string;
  aiResponse: string;
  citation: string;
}

const CONVERSATIONS: ConversationDemo[] = [
  {
    code: "hi",
    langName: "हिंदी (Hindi)",
    userQuery: "बच्चे को दस्त और उल्टी होने पर घर पर क्या प्राथमिक उपचार देना चाहिए?",
    aiResponse:
      "बच्चे को निर्जलीकरण (Dehydration) से बचाने के लिए ओआरएस (ORS) का घोल थोड़े-थोड़े समय में दें। स्तनपान या सामान्य तरल आहार जारी रखें। यदि उल्टी बार-बार हो रही हो तो नजदीकी स्वास्थ्य केंद्र जाएं।",
    citation: "WHO Infant & Child Health Care Manual (Sec 4.2)",
  },
  {
    code: "te",
    langName: "తెలుగు (Telugu)",
    userQuery: "చిన్నపిల్లలకు జ్వరం వచ్చినప్పుడు ఇంట్లో చేయవలసిన ప్రాథమిక జాగ్రత్తలు ఏమిటి?",
    aiResponse:
      "పాపకు తేలికపాటి పత్తి దుస్తులు తొడిగి, ధారాళంగా ORS మరియు ద్రవపదార్థాలు ఇవ్వండి. జ్వరం 102°F కంటే ఎక్కువగా ఉన్నా లేదా 3 రోజుల కంటే ఎక్కువ కాలం ఉన్నా ప్రాథమిక ఆరోగ్య కేంద్రాన్ని సంప్రదించండి.",
    citation: "NHM Primary Health Care Protocol 2024 (Sec 2.1)",
  },
  {
    code: "en",
    langName: "English",
    userQuery: "What are early warning signs of dehydration in toddlers?",
    aiResponse:
      "Early warning signs include dry mouth or tongue, absence of tears when crying, sunken eyes, unusual lethargy, and fewer than 3 wet diapers in 24 hours.",
    citation: "WHO & UNICEF Diarrheal Disease Clinical Guidelines",
  },
];

export const MultilingualDemo: React.FC = () => {
  const [activeLang, setActiveLang] = useState<"hi" | "te" | "en">("hi");
  const currentConv = CONVERSATIONS.find((c) => c.code === activeLang) || CONVERSATIONS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
      {/* LEFT PANEL: Clean Dialogue Preview (7 cols) */}
      <div className="lg:col-span-7 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between space-y-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0F766E]">
              Multilingual Dialogue
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full">
              {CONVERSATIONS.map((conv) => (
                <button
                  key={conv.code}
                  onClick={() => setActiveLang(conv.code)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    activeLang === conv.code
                      ? "bg-white text-[#0F766E] shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {conv.langName}
                </button>
              ))}
            </div>
          </div>

          {/* User Message Bubble */}
          <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Patient Question
            </span>
            <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
              &ldquo;{currentConv.userQuery}&rdquo;
            </p>
          </div>

          {/* MedGuide AI Guidance Bubble */}
          <div className="p-6 rounded-2xl bg-[#E8F5F2]/70 border border-[#0F766E]/20 text-slate-900 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#0F766E]">
              <span className="flex items-center gap-1.5">
                <MessageSquareHeart className="w-4 h-4" /> MedGuide AI Answer
              </span>
              <span className="text-[11px] font-medium text-[#0F766E]">WHO Grounded</span>
            </div>

            <p className="text-base leading-relaxed font-medium text-slate-800">
              {currentConv.aiResponse}
            </p>

            <div className="pt-2 border-t border-[#0F766E]/15 flex items-center gap-2 text-xs font-medium text-[#0F766E]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{currentConv.citation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Language Overview & CTA (5 cols) */}
      <div className="lg:col-span-5 p-6 sm:p-10 bg-[#FAFAF8] flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-slate-900">Supported Indic Locales</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            MedGuide AI natively understands and generates spoken and written responses across Indian languages with full medical accuracy.
          </p>

          <div className="space-y-2 pt-2">
            {[
              { name: "English", desc: "Global clinical standard" },
              { name: "हिंदी (Hindi)", desc: "Devanagari script & voice" },
              { name: "తెలుగు (Telugu)", desc: "Telugu script & voice" },
            ].map((lang, i) => (
              <div key={i} className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{lang.name}</span>
                <span className="text-slate-500">{lang.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">Ask in your language</span>
          <Link
            href="/app/chat"
            className="px-4 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-2 shrink-0"
          >
            Start Multilingual Chat <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
          </Link>
        </div>
      </div>
    </div>
  );
};
