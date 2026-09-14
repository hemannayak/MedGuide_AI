"use client";

import React, { useState } from "react";
import { Mic, Loader2, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface MedVoiceProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export type VoiceState = "idle" | "listening" | "transcribing" | "success";

const SAMPLE_TRANSCRIPTS: Record<string, string> = {
  en: "I have had a high fever for three days with a persistent cough.",
  hi: "मुझे तीन दिनों से तेज बुखार और लगातार खांसी है।",
  te: "నాకు మూడు రోజులుగా తీవ్రమైన జ్వరం మరియు దగ్గు ఉంది.",
};

export const MedVoice: React.FC<MedVoiceProps> = ({
  onTranscription,
  className = "",
}) => {
  const { language } = useLanguage();
  const [state, setState] = useState<VoiceState>("idle");

  const handleToggle = () => {
    if (state === "idle" || state === "success") {
      setState("listening");
      // Simulate organic speech recognition pipeline (M14 Whisper integration placeholder)
      setTimeout(() => {
        setState("transcribing");
        setTimeout(() => {
          const resultText = SAMPLE_TRANSCRIPTS[language] || SAMPLE_TRANSCRIPTS.en;
          setState("success");
          onTranscription(resultText);
        }, 1200);
      }, 2500);
    } else {
      setState("idle");
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Waveform / Status visual indicator */}
      {state === "listening" && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold shadow-md whitespace-nowrap animate-fade-in" aria-live="polite">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Listening...</span>
        </div>
      )}

      {state === "transcribing" && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-semibold shadow-md whitespace-nowrap animate-fade-in" aria-live="polite">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Understanding speech...</span>
        </div>
      )}

      {/* Main Mic Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          state === "listening"
            ? "Stop listening"
            : state === "transcribing"
            ? "Transcribing voice"
            : "Tap to speak using voice"
        }
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          state === "listening"
            ? "bg-red-600 text-white scale-110 ring-4 ring-red-200"
            : state === "transcribing"
            ? "bg-amber-600 text-white animate-pulse"
            : state === "success"
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-[#0F766E] text-white hover:bg-[#0D635C] hover:scale-105"
        }`}
      >
        {state === "transcribing" ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : state === "listening" ? (
          <div className="flex items-center gap-1">
            <span className="w-1 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-7 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : state === "success" ? (
          <Check className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {/* Micro-label */}
      <span className="text-[11px] text-slate-500 font-medium mt-1.5">
        {state === "idle"
          ? "Tap to speak"
          : state === "listening"
          ? "Speaking..."
          : state === "transcribing"
          ? "Processing..."
          : "Voice added"}
      </span>
    </div>
  );
};
