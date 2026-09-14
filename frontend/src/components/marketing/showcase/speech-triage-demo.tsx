"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mic, Activity, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

interface TriageCase {
  id: string;
  langLabel: string;
  transcript: string;
  extractedSymptoms: string[];
  severity: "ROUTINE" | "URGENT" | "EMERGENCY";
  recommendedAction: string;
}

const TRIAGE_CASES: TriageCase[] = [
  {
    id: "chest_pain",
    langLabel: "Hindi (हिन्दी)",
    transcript: "मुझे अचानक छाती में तेज़ दर्द हो रहा है और बाएँ कंधे में भारीपन लग रहा है। सांस लेने में भी तकलीफ हो रही है।",
    extractedSymptoms: ["Acute chest pain", "Radiation to shoulder", "Shortness of breath"],
    severity: "EMERGENCY",
    recommendedAction: "Immediate emergency escalation to 108 Ambulance. Do not attempt to drive.",
  },
  {
    id: "child_fever",
    langLabel: "Telugu (తెలుగు)",
    transcript: "నా మూడేళ్ళ బిడ్డకు రెండు రోజులుగా జ్వరం మరియు దగ్గు ఉన్నాయి, కానీ ఆహారం తీసుకుంటున్నాడు.",
    extractedSymptoms: ["Moderate fever (101°F)", "Mild cough", "Normal appetite"],
    severity: "ROUTINE",
    recommendedAction: "Offer ORS, monitor temperature, and visit nearest Primary Health Centre if fever persists.",
  },
  {
    id: "stiff_neck",
    langLabel: "English",
    transcript: "My 5-year-old child has a sudden high fever with a stiff neck and extreme severe headache.",
    extractedSymptoms: ["High fever with stiff neck", "Severe headache"],
    severity: "URGENT",
    recommendedAction: "Urgent PHC evaluation required for possible meningitis danger signs.",
  },
];

export const SpeechTriageDemo: React.FC = () => {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const activeCase = TRIAGE_CASES[activeCaseIdx];

  const getSeverityBadge = (level: "ROUTINE" | "URGENT" | "EMERGENCY") => {
    switch (level) {
      case "EMERGENCY":
        return "bg-red-50 text-red-700 border-red-200";
      case "URGENT":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "ROUTINE":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
  };

  const handleMicClick = () => {
    setIsListening(true);
    setTimeout(() => setIsListening(false), 3000);
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-[#FAFAF8]">
      {/* Centered Speech to Text Header (Matching Sarvam AI Image 2) */}
      <div className="max-w-xl mx-auto text-center space-y-4 pt-2">
        <h3 className="font-serif text-3xl sm:text-4xl text-slate-900 font-normal tracking-tight">
          Speak to see live health captions
        </h3>

        {/* Center Mic Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleMicClick}
            className={`px-6 py-3 rounded-full border transition-all cursor-pointer inline-flex items-center gap-2.5 shadow-2xs ${
              isListening
                ? "bg-red-600 text-white border-red-600 animate-pulse"
                : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Mic className={`w-4 h-4 ${isListening ? "text-white" : "text-indigo-600"}`} />
            <span className="text-sm font-semibold">
              {isListening ? "Listening to spoken audio..." : "Start speaking"}
            </span>
          </button>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {TRIAGE_CASES.map((tc, idx) => (
            <button
              key={tc.id}
              onClick={() => setActiveCaseIdx(idx)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeCaseIdx === idx
                  ? "bg-white text-indigo-900 border border-indigo-200 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tc.langLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Live Captions Output & Triage Result Box */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Live Transcript Box */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-indigo-600" /> Live Speech Transcription
              </span>
              <span className="text-emerald-700 font-mono text-[11px]">Confidence 98.4%</span>
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed italic pt-1">
              &ldquo;{activeCase.transcript}&rdquo;
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
            {activeCase.extractedSymptoms.map((sym, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <Activity className="w-3 h-3 text-indigo-600" />
                {sym}
              </span>
            ))}
          </div>
        </div>

        {/* Triage Decision Box */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Deterministic Triage
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityBadge(
                  activeCase.severity
                )}`}
              >
                {activeCase.severity}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                {activeCase.severity === "EMERGENCY" ? (
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Recommended Action:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {activeCase.recommendedAction}
              </p>
            </div>
          </div>

          <Link
            href="/app/symptoms"
            className="w-full py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
          >
            Start Full Triage Check <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
          </Link>
        </div>
      </div>
    </div>
  );
};
