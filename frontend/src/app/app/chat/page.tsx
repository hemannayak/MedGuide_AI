"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  AlertTriangle,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  MessageSquareHeart,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { api } from "@/lib/api/client";
import { AIChatResponse, ResponseType, SourceCitation } from "@/types/ai";
import { MedVoice } from "@/components/voice/med-voice";
import { MedEvidence } from "@/components/chat/med-evidence";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  responseType?: ResponseType;
  sources?: SourceCitation[];
  redFlags?: string[];
  refusalTriggered?: boolean;
  disclaimer?: string;
  timestamp: string;
}

const STORAGE_KEY_MESSAGES = "medguide_chat_history";
const STORAGE_KEY_CONV_ID = "medguide_conv_id";

const EXAMPLE_PROMPTS = [
  { label: "Dehydration in children", text: "What are early signs of dehydration in children?" },
  { label: "बुखार का प्राथमिक उपचार", text: "बच्चे को तेज बुखार में क्या प्राथमिक देखभाल दें?" },
  { label: "అధిక రక్తపోటు నిర్వహణ", text: "అధిక రక్తపోటును ఇంటి వద్ద ఎలా అదుపులో ఉంచుకోవాలి?" },
  { label: "ORS preparation", text: "How do I prepare and administer ORS solution correctly?" },
];

let msgIdCounter = 1;
const generateMsgId = (prefix: string) => `${prefix}_${Date.now()}_${msgIdCounter++}`;

export default function AIChatPage() {
 const { tr } = useLanguage();

  const { t, language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Audio TTS playback state
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [loadingTTSMsgId, setLoadingTTSMsgId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Restore session from localStorage on initial client mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
      const savedConvId = localStorage.getItem(STORAGE_KEY_CONV_ID);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
      if (savedConvId) {
        setConversationId(savedConvId);
      }
    } catch (e) {
      console.warn("Failed to load cached chat history:", e);
    }
  }, []);

  // Save session to localStorage whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
        if (conversationId) {
          localStorage.setItem(STORAGE_KEY_CONV_ID, conversationId);
        }
      } catch (e) {
        console.warn("Failed to persist chat session:", e);
      }
    }
  }, [messages, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Clean up any active audio playback on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayingMsgId(null);
    setLoadingTTSMsgId(null);
  }, []);

  const handleReadAloud = async (msgId: string, text: string) => {
    if (playingMsgId === msgId) {
      stopAudio();
      return;
    }

    stopAudio();
    setLoadingTTSMsgId(msgId);

    try {
      const res = await api.speechTTS({
        text,
        language,
        speaker: "kavitha",
        format: "mp3",
      });

      if (res.success && res.data && res.data.audio_base64) {
        const audioSrc = `data:audio/mp3;base64,${res.data.audio_base64}`;
        const audio = new Audio(audioSrc);
        activeAudioRef.current = audio;

        audio.onplay = () => {
          setLoadingTTSMsgId(null);
          setPlayingMsgId(msgId);
        };

        audio.onended = () => {
          setPlayingMsgId(null);
          activeAudioRef.current = null;
        };

        audio.onerror = () => {
          console.warn("Audio playback error, falling back to Web Speech API");
          fallbackWebSpeech(msgId, text);
        };

        await audio.play();
      } else {
        // Fallback to browser SpeechSynthesis
        fallbackWebSpeech(msgId, text);
      }
    } catch (err) {
      console.warn("TTS API call failed, falling back to Web Speech:", err);
      fallbackWebSpeech(msgId, text);
    }
  };

  const fallbackWebSpeech = (msgId: string, text: string) => {
    setLoadingTTSMsgId(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US";
      
      utterance.onstart = () => {
        setPlayingMsgId(msgId);
      };
      utterance.onend = () => {
        setPlayingMsgId(null);
      };
      utterance.onerror = () => {
        setPlayingMsgId(null);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingMsgId(null);
    }
  };

  const handleClearHistory = () => {
    stopAudio();
    setMessages([]);
    setConversationId(undefined);
    try {
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_CONV_ID);
    } catch (e) {
      console.warn("Failed to clear local storage:", e);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: generateMsgId("usr"),
      sender: "user",
      text: textToSend,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await api.postAIChat({
        message: textToSend,
        language: language,
        conversation_id: conversationId,
      });

      if (res.success && res.data) {
        const aiData: AIChatResponse = res.data;
        if (aiData.conversation_id) setConversationId(aiData.conversation_id);

        const aiMsg: ChatMessage = {
          id: generateMsgId("ai"),
          sender: "ai",
          text: aiData.message,
          responseType: aiData.response_type,
          sources: aiData.sources,
          redFlags: aiData.red_flags,
          refusalTriggered: aiData.refusal_triggered,
          disclaimer: aiData.disclaimer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: generateMsgId("err"),
            sender: "ai",
            text: tr("I was unable to process your request right now. Please try again."),
            responseType: ResponseType.REFUSAL,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateMsgId("err"),
          sender: "ai",
          text: tr("Network connection error. Please check your signal and try again."),
          responseType: ResponseType.REFUSAL,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isEmptyState = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-4xl mx-auto px-4 py-4">
      {/* ── Healthcare Companion Header ─────────────────────────── */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-[#161A24] leading-tight">
              {tr("AI Health Companion")}</h1>
            <p className="text-xs text-slate-500">
              {tr("Source-backed guidance &bull; English &bull; हिंदी &bull; తెలుగు")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-200/70">
            <ShieldCheck className="w-3.5 h-3.5" />
            {tr("Safety-First Safeguards")}</span>
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Start New Conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages Container ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {isEmptyState && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full flex flex-col items-center justify-center text-center px-4 py-8 space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-teal-50 text-[#0F766E] border border-teal-100 flex items-center justify-center shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#161A24]">
                {tr("How can I help you today?")}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tr("Ask any health question in English, Hindi, or Telugu. Every response is source-backed by clinical guidance.")}</p>
            </div>

            {/* Native script quick prompt pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full pt-2">
              {EXAMPLE_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSend(item.text)}
                  className="text-left p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-[#0F766E]/40 hover:bg-teal-50/40 hover:shadow-xs transition-all group cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#0F766E] mb-1 group-hover:text-[#0D635C]">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2">
                    {tr("&ldquo;")}{item.text}{tr("&rdquo;")}</div>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 max-w-xs pt-4">
              {tr("Preliminary health guidance only &bull; Not a replacement for a doctor.")}</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              {/* Header */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                <span className="font-semibold text-slate-600">
                  {msg.sender === "user" ? tr("You") : "MedGuide AI"}
                </span>
                <span>{tr("&bull;")}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl w-full space-y-3 rounded-2xl p-4 sm:p-5 shadow-xs ${
                  msg.sender === "user"
                    ? "bg-[#0F766E] text-white rounded-tr-xs"
                    : msg.responseType === ResponseType.EMERGENCY
                    ? "bg-red-50 border-2 border-red-500 text-slate-900 rounded-tl-xs"
                    : "bg-white border border-slate-200/80 text-slate-900 rounded-tl-xs"
                }`}
              >
                {/* Emergency banner inside chat */}
                {msg.responseType === ResponseType.EMERGENCY && (
                  <div className="p-3 rounded-xl bg-red-600 text-white flex items-center justify-between gap-3 text-xs font-bold shadow-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 animate-bounce shrink-0" />
                      <span>CRITICAL &bull; EMERGENCY ESCALATION</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="tel:108"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-red-700 font-extrabold text-xs shadow-sm hover:bg-red-50"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> 108 (Ambulance)
                      </a>
                      <a
                        href="tel:112"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-800 text-white font-extrabold text-xs shadow-sm hover:bg-red-900"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> 112 (Emergency)
                      </a>
                    </div>
                  </div>
                )}

                {/* Safety refusal alert */}
                {msg.refusalTriggered && (
                  <div className="text-xs px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <strong>{tr("Safety Safeguard:")}</strong> {t("ai.refusalNotice")}
                  </div>
                )}

                {/* Response Text & Read-Aloud Action */}
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed whitespace-pre-line font-normal">
                    {msg.text}
                  </p>

                  {/* Read Aloud Button for AI messages */}
                  {msg.sender === "ai" && (
                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleReadAloud(msg.id, msg.text)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          playingMsgId === msg.id
                            ? "bg-teal-600 text-white shadow-xs"
                            : loadingTTSMsgId === msg.id
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Read aloud in current language"
                      >
                        {loadingTTSMsgId === msg.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Generating Voice...</span>
                          </>
                        ) : playingMsgId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                            <span>Stop Speaking</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#0F766E]" />
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Red Flags */}
                {msg.redFlags && msg.redFlags.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-red-700">
                      <AlertTriangle className="w-4 h-4" /> {tr("Red-Flag Indicators Detected:")}</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {msg.redFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Grounded Evidence Sources */}
                {msg.sender === "ai" && <MedEvidence sources={msg.sources} />}

                {/* Disclaimer */}
                {msg.disclaimer && msg.sender === "ai" && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
                    {msg.disclaimer}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-start space-y-1">
            <span className="text-[11px] text-slate-400 px-1">MedGuide AI</span>
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="loading-dots">
                  <span />
                  <span />
                  <span />
                </span>
                <span>{tr("Retrieving source-backed health guidance...")}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar with Speech Trigger ───────────────────────── */}
      <div className="mt-3 bg-white border border-slate-200/90 rounded-2xl p-2 shadow-md flex items-center gap-3 shrink-0">
        <MedVoice onTranscription={(text) => handleSend(text)} />

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={t("ai.inputPlaceholder")}
          className="flex-1 bg-transparent px-2 py-2 text-sm text-[#161A24] placeholder:text-slate-400 focus:outline-none min-h-[44px]"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={loading || !inputQuery.trim()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white bg-[#0F766E] hover:bg-[#0D635C] disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px] shadow-sm shrink-0 text-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{tr("Send")}</span>
        </button>
      </div>
    </div>
  );
}
