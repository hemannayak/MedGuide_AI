"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Pause, ArrowRight, Volume2, ShieldCheck } from "lucide-react";
import { VoiceWaveform } from "./voice-waveform";

interface VoicePersona {
  id: string;
  name: string;
  gender: "Female" | "Male";
  tag: string;
  avatarBg: string;
  langCode: string;
}

const CLINICAL_VOICES: VoicePersona[] = [
  {
    id: "ananya",
    name: "Ananya",
    gender: "Female",
    tag: "Pediatric & Maternal Care",
    avatarBg: "bg-[#0F766E]",
    langCode: "hi-IN",
  },
  {
    id: "arjun",
    name: "Arjun",
    gender: "Male",
    tag: "Symptom Triage",
    avatarBg: "bg-slate-900",
    langCode: "hi-IN",
  },
  {
    id: "kavya",
    name: "Kavya",
    gender: "Female",
    tag: "ASHA Worker Mode",
    avatarBg: "bg-teal-800",
    langCode: "te-IN",
  },
];

const PRESET_QUERIES = {
  hi: {
    label: "हिंदी (Hindi)",
    text: "मेरे बच्चे को कल रात से तेज़ बुखार है और वह पानी नहीं पी रहा है। मुझे क्या प्राथमिक कदम उठाने चाहिए?",
    code: "hi-IN",
  },
  te: {
    label: "తెలుగు (Telugu)",
    text: "మా చిన్నారికి నిన్నటి నుండి జ్వరం ఉంది మరియు ఆహారం తీసుకోవడం లేదు. మేము ఏ ప్రాథమిక జాగ్రత్తలు తీసుకోవాలి?",
    code: "te-IN",
  },
  en: {
    label: "English",
    text: "My child has a fever since last night and is refusing fluids. What immediate first-aid steps should I follow?",
    code: "en-IN",
  },
};

export const VoiceGuidanceDemo: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<"hi" | "te" | "en">("hi");
  const [selectedVoice, setSelectedVoice] = useState("ananya");
  const [isPlaying, setIsPlaying] = useState(false);

  const currentQuery = PRESET_QUERIES[selectedLang];

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = (voiceId?: string) => {
    const targetVoiceId = voiceId || selectedVoice;
    if (voiceId && voiceId !== selectedVoice) {
      setSelectedVoice(voiceId);
    }

    if (isPlaying) {
      stopSpeech();
      return;
    }

    setIsPlaying(true);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuery.text);
      const persona = CLINICAL_VOICES.find((v) => v.id === targetVoiceId);
      utterance.lang = persona?.langCode || currentQuery.code;
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(false), 4500);
    }
  };

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const activePersona = CLINICAL_VOICES.find((v) => v.id === selectedVoice) || CLINICAL_VOICES[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
      {/* LEFT PANEL: Sleek Voice Preview Card (7 cols) */}
      <div className="lg:col-span-7 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between space-y-6">
        <div className="space-y-5">
          {/* Header & Language Switcher */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0F766E]">
              Voice Guidance Preview
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full">
              {(["hi", "te", "en"] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setSelectedLang(code);
                    if (isPlaying) stopSpeech();
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                    selectedLang === code
                      ? "bg-white text-[#0F766E] shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {PRESET_QUERIES[code].label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Prompt Quotation Box */}
          <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Patient Query ({currentQuery.label})
            </span>
            <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed italic">
              &ldquo;{currentQuery.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Audio Player Bar */}
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTogglePlay()}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isPlaying ? "bg-[#0F766E] text-white" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                aria-label={isPlaying ? "Pause voice output" : "Play voice guidance"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <div className="space-y-0.5">
                <span className="text-xs font-bold block">{activePersona.name} ({activePersona.gender})</span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {isPlaying ? "Playing voice synthesis..." : "Tap to listen in Indic audio"}
                </span>
              </div>
            </div>

            <VoiceWaveform isActive={isPlaying} color="#2DD4BF" barCount={14} />
          </div>

          {/* Grounding Source Badge */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span>Grounded in WHO Child Health Guidelines & NHM Primary Care Protocols</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Voice Selection & CTA (5 cols) */}
      <div className="lg:col-span-5 p-6 sm:p-10 bg-[#FAFAF8] flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-xl font-bold text-slate-900 tracking-tight">Clinical Voice Personas</h3>
            <span className="text-[10px] font-bold text-[#0F766E] bg-[#E8F5F2] px-2.5 py-1 rounded-full uppercase">
              Audio Synthesis
            </span>
          </div>

          {/* Voice Selector Pills */}
          <div className="space-y-2.5">
            {CLINICAL_VOICES.map((vp) => {
              const isSelected = selectedVoice === vp.id;
              const isCardPlaying = isPlaying && isSelected;

              return (
                <div
                  key={vp.id}
                  onClick={() => {
                    setSelectedVoice(vp.id);
                    if (isPlaying) stopSpeech();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-white border-[#0F766E] shadow-2xs"
                      : "bg-white/60 border-slate-200/80 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg ${vp.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                    >
                      {vp.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{vp.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{vp.tag}</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay(vp.id);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      isCardPlaying
                        ? "bg-[#0F766E] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {isCardPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sleek Launch CTA */}
        <div className="pt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">Test live companion voice</span>
          <Link
            href="/app/chat"
            className="px-4 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-2 shrink-0"
          >
            Launch Companion <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
          </Link>
        </div>
      </div>
    </div>
  );
};
