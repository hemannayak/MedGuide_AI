"use client";

import React, { useState } from "react";
import { Mic, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface VoiceMicButtonProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export type VoiceState = "idle" | "listening" | "processing" | "transcription" | "error" | "denied";

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  onTranscription,
  className = "",
}) => {
  const { t } = useLanguage();
  const [state, setState] = useState<VoiceState>("idle");

  const handleVoiceToggle = () => {
    if (state === "idle") {
      setState("listening");
      // Simulate listening & Whisper STT processing (M14 integration placeholder)
      setTimeout(() => {
        setState("processing");
        setTimeout(() => {
          setState("idle");
          onTranscription("I have been having fever and severe headache for the past 2 days.");
        }, 1500);
      }, 3000);
    } else {
      setState("idle");
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleVoiceToggle}
        title={t("ai.micTooltip")}
        aria-label={t("ai.micTooltip")}
        className={`min-h-[48px] min-w-[48px] rounded-full p-3 flex items-center justify-center transition-all ${
          state === "listening"
            ? "bg-red-600 text-white animate-pulse"
            : state === "processing"
            ? "bg-amber-600 text-white"
            : "bg-amber-100 dark:bg-stone-800 text-[#8C6D46] dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-stone-700"
        } ${className}`}
      >
        {state === "processing" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : state === "listening" ? (
          <Mic className="w-5 h-5 animate-bounce" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      {state === "listening" && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md">
          {t("ai.listening")}
        </span>
      )}
    </div>
  );
};
