"use client";

import React, { useState } from "react";
import {
  Mic,
  Send,
  Paperclip,
  BookOpen,
  AlertTriangle,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
} from "lucide-react";
import { useLanguage, Language } from "@/lib/i18n/context";

interface ChatMessage {
  id: string;
  sender: "user" | "medguide";
  text: string;
  meaning?: string;
  action?: string;
  seekHelp?: string;
  sources?: string[];
  audioUrl?: string;
}

const SUGGESTED_PROMPTS = [
  { text: "Why do I have a fever?", lang: "en" },
  { text: "मुझे बुखार क्यों है?", lang: "hi" },
  { text: "నాకు జ్వరం ఎందుకు వస్తోంది?", lang: "te" },
  { text: "How should I take this medicine?", lang: "en" },
];

let chatMsgCounter = 1;
const getNextMsgId = (prefix: string) => `${prefix}-${chatMsgCounter++}`;

export const MedGuideChat: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [inputQuery, setInputQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "medguide",
      text: "Namaste! I am MedGuide AI, your healthcare companion. You can ask me health questions or describe your symptoms in English, Hindi, or Telugu using text or speech.",
      meaning: "I am ready to help you understand health symptoms and guide your next steps.",
      action: "Type a question below or tap the microphone icon to speak.",
      sources: ["MedGuide AI Primary Care Protocol 2024", "WHO Essential Care Reference"],
    },
  ]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: getNextMsgId("user"),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");

    // Simulate AI Response with structured Answer -> Meaning -> Action -> Seek Help -> Sources
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: getNextMsgId("ai"),
        sender: "medguide",
        text: `Based on verified health reference guidelines for "${query}": Maintain adequate hydration, monitor body temperature, and rest in a well-ventilated room.`,
        meaning: "This symptom is frequently associated with mild viral infections or transient fluid deficits.",
        action: "Sip Oral Rehydration Salts (ORS) or clean water frequently. Avoid unprescribed antibiotics.",
        seekHelp: "Seek immediate medical care if fever exceeds 102°F, persists over 3 days, or is accompanied by severe headache or stiff neck.",
        sources: [
          "WHO Guidelines for Integrated Management of Childhood Illness (Section 3)",
          "National Rural Health Mission (NRHM) Fever Protocol 2024",
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        handleSendMessage("मुझे दो दिन से हल्का बुखार और सिरदर्द है।");
      }, 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-[#161A24]/10 rounded-3xl shadow-xl flex flex-col h-[750px] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif text-lg font-normal text-[#161A24]">
              Ask MedGuide <span className="text-[#0F766E] text-xs font-sans font-bold">AI Companion</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Source-grounded primary health guidance
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            aria-label="Select language"
            className="bg-white border border-slate-200 text-xs font-semibold text-[#161A24] rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F766E] cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </div>
      </div>

      {/* Suggested Prompts Banner */}
      <div className="p-3 bg-amber-50/60 border-b border-amber-100 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
        <Sparkles className="w-4 h-4 text-[#8C6D46] shrink-0 ml-2" />
        <span className="font-bold text-[#8C6D46] shrink-0">Try asking:</span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt.text)}
            className="px-3 py-1 rounded-full bg-white border border-amber-200/80 text-[#161A24] hover:bg-amber-100/60 whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium"
          >
            {prompt.text}
          </button>
        ))}
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-[#FAF9F5]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "medguide" && (
              <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center shrink-0 mr-3 mt-1">
                <HeartPulse className="w-4 h-4 text-amber-200" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-5 space-y-3 shadow-2xs ${
                msg.sender === "user"
                  ? "bg-[#1C1917] text-white rounded-tr-xs"
                  : "bg-white border border-stone-200 text-stone-900 rounded-tl-xs"
              }`}
            >
              {/* Main Text / Answer */}
              <div className="text-sm sm:text-base leading-relaxed font-medium">
                {msg.text}
              </div>

              {/* Structured Elements for MedGuide Answers */}
              {msg.sender === "medguide" && (
                <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
                  {/* Meaning */}
                  {msg.meaning && (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                      <div className="font-bold text-[#1C1917] uppercase tracking-wider text-[10px]">
                        What this may mean:
                      </div>
                      <div className="text-stone-700 leading-relaxed">{msg.meaning}</div>
                    </div>
                  )}

                  {/* Recommended Action */}
                  {msg.action && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                      <div className="font-bold text-[#8C6D46] uppercase tracking-wider text-[10px]">
                        What you can do:
                      </div>
                      <div className="text-stone-800 leading-relaxed">{msg.action}</div>
                    </div>
                  )}

                  {/* When to Seek Help */}
                  {msg.seekHelp && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                      <div className="font-bold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        When to seek medical help:
                      </div>
                      <div className="text-amber-900 leading-relaxed">{msg.seekHelp}</div>
                    </div>
                  )}

                  {/* Sources Progressive Disclosure Accordion */}
                  {msg.sources && (
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          setExpandedSourceId(
                            expandedSourceId === msg.id ? null : msg.id
                          )
                        }
                        className="flex items-center justify-between w-full p-2 rounded-lg bg-stone-50 text-stone-600 font-bold hover:bg-stone-100 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 text-[11px] text-[#8C6D46]">
                          <BookOpen className="w-3.5 h-3.5" /> Sources & References ({msg.sources.length})
                        </span>
                        {expandedSourceId === msg.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedSourceId === msg.id && (
                        <div className="p-3 mt-1.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1 animate-in fade-in">
                          {msg.sources.map((src, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-[#8C6D46] font-bold">&bull;</span>
                              <span>{src}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 ml-3 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Composer (AI Chat 8 adapted) */}
      <div className="p-4 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            className="p-3 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
            title="Attach image or prescription"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Voice Record Mic Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-full transition-colors cursor-pointer ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-amber-50 text-[#8C6D46] border border-amber-200/80 hover:bg-amber-100"
            }`}
            title="Speak your query"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isRecording
                ? "Listening... Speak now..."
                : "Ask health question in English, Hindi, or Telugu..."
            }
            className="flex-1 px-4 py-3 rounded-full border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-3 rounded-full bg-[#1C1917] text-white disabled:opacity-50 hover:bg-[#292524] transition-colors cursor-pointer"
          >
            <Send className="w-5 h-5 text-amber-100" />
          </button>
        </form>
      </div>
    </div>
  );
};
