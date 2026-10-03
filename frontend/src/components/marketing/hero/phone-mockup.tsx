"use client";

import React, { useState } from "react";
import {
  Home,
  History,
  Bookmark,
  Settings,
  Mic,
  FileText,
  AlignLeft,
  ArrowUpRight,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";

// ─── MedGuide Emblem (small, for phone screen) ──────────────────────────────
const PhoneEmblem: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M12 3C12 3 6 6.5 6 12C6 15.75 8.5 19 12 21C15.5 19 18 15.75 18 12C18 6.5 12 3 12 3Z" fill="#062D29" opacity="0.9" />
    <path d="M12 6C12 6 8.5 8.5 8.5 12C8.5 14.5 10 16.5 12 17.5C14 16.5 15.5 14.5 15.5 12C15.5 8.5 12 6 12 6Z" fill="#FAF7EF" />
    <path d="M12 9C10.7 10 10 11 10 12C10 13.5 10.8 14.7 12 15.3C13.2 14.7 14 13.5 14 12C14 11 13.3 10 12 9Z" fill="#062D29" />
    <path d="M7.5 10C6.2 9.5 5 10.2 5 11.5C5 13 7 13.5 8.5 12.7C8.2 11.9 7.7 10.9 7.5 10Z" fill="#062D29" opacity="0.65" />
    <path d="M16.5 10C17.8 9.5 19 10.2 19 11.5C19 13 17 13.5 15.5 12.7C15.8 11.9 16.3 10.9 16.5 10Z" fill="#062D29" opacity="0.65" />
  </svg>
);

// ─── Suggestion pills data ───────────────────────────────────────────────────
const SUGGESTIONS = [
  { id: "fever", text: "I have fever and body pain", lang: "en" },
  { id: "dengue", text: "What are signs of dengue?", lang: "en" },
  { id: "hindi", text: "मुझे सिर दर्द हो रहा है, क्या करूँ?", lang: "hi" },
];

// ─── Phone bottom nav items ───────────────────────────────────────────────────
const PHONE_NAV = [
  { id: "home", label: "Home", Icon: Home, active: true },
  { id: "history", label: "History", Icon: History, active: false },
  { id: "saved", label: "Saved", Icon: Bookmark, active: false },
  { id: "settings", label: "Settings", Icon: Settings, active: false },
];

// ─── Input mode tabs ─────────────────────────────────────────────────────────
const INPUT_MODES = [
  { id: "text", label: "Text", Icon: AlignLeft },
  { id: "voice", label: "Voice", Icon: Mic },
  { id: "document", label: "Document", Icon: FileText },
];

export const PhoneMockup: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"text" | "voice" | "document">("text");
  const [inputValue, setInputValue] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);

  const handleSuggestion = (text: string) => {
    setInputValue(text);
  };

  return (
    /*
     * OUTER PHONE FRAME
     * Dimensions approximate 405 × 775px at 2048px viewport → scaled via clamp
     */
    <div
      className="relative select-none"
      style={{
        width: "clamp(260px, 21vw, 410px)",
        aspectRatio: "405 / 775",
      }}
      aria-label="MedGuide AI app preview"
      role="img"
    >
      {/* ── Drop shadow ─────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 rounded-[13%] pointer-events-none"
        style={{
          boxShadow:
            "0 40px 100px -20px rgba(6,45,41,0.45), 0 20px 50px -15px rgba(0,0,0,0.35), 0 4px 16px -4px rgba(0,0,0,0.25)",
          zIndex: -1,
        }}
      />

      {/* ── Outer phone chassis ──────────────────────────────────────────────── */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 40%, #111 70%, #1e1e1e 100%)",
          borderRadius: "12.5%",
          border: "1.5px solid rgba(255,255,255,0.10)",
          boxSizing: "border-box",
        }}
      >
        {/* Metallic edge highlight */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[12%]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, transparent 40%, transparent 70%, rgba(255,255,255,0.06) 100%)",
            zIndex: 10,
          }}
        />

        {/* Side buttons – left */}
        <div
          className="absolute left-0 pointer-events-none"
          style={{ top: "17%", width: "2px", height: "7%", background: "#333", borderRadius: "0 2px 2px 0", transform: "translateX(-1px)" }}
        />
        <div
          className="absolute left-0 pointer-events-none"
          style={{ top: "26%", width: "2px", height: "10%", background: "#333", borderRadius: "0 2px 2px 0", transform: "translateX(-1px)" }}
        />
        <div
          className="absolute left-0 pointer-events-none"
          style={{ top: "38%", width: "2px", height: "10%", background: "#333", borderRadius: "0 2px 2px 0", transform: "translateX(-1px)" }}
        />
        {/* Side button – right */}
        <div
          className="absolute right-0 pointer-events-none"
          style={{ top: "24%", width: "2px", height: "14%", background: "#333", borderRadius: "2px 0 0 2px", transform: "translateX(1px)" }}
        />

        {/* ── Screen bezel inset ───────────────────────────────────────────── */}
        <div
          className="absolute inset-[3%] overflow-hidden flex flex-col"
          style={{
            background: "#FAF7EF",
            borderRadius: "9.5%",
          }}
        >
          {/* ── Status bar ────────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{ height: "5%", paddingTop: "1%" }}
          >
            <span
              className="font-semibold text-[#062D29]"
              style={{ fontSize: "clamp(8px, 1.1vw, 11px)" }}
            >
              9:01
            </span>
            <div className="flex items-center gap-0.5">
              <Signal
                className="text-[#062D29]"
                style={{ width: "clamp(8px, 1vw, 10px)", height: "clamp(8px, 1vw, 10px)" }}
                aria-label="Signal"
              />
              <Wifi
                className="text-[#062D29]"
                style={{ width: "clamp(8px, 1vw, 10px)", height: "clamp(8px, 1vw, 10px)" }}
                aria-label="Wi-Fi"
              />
              <Battery
                className="text-[#062D29]"
                style={{ width: "clamp(10px, 1.2vw, 13px)", height: "clamp(10px, 1.2vw, 13px)" }}
                aria-label="Battery"
              />
            </div>
          </div>

          {/* ── App top bar ────────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 py-1.5 border-b shrink-0"
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center gap-1.5">
              <PhoneEmblem style={{ width: "clamp(14px, 1.5vw, 18px)", height: "clamp(14px, 1.5vw, 18px)" }} />
              <span
                className="font-semibold text-[#062D29]"
                style={{ fontSize: "clamp(9px, 1.1vw, 12px)", whiteSpace: "nowrap" }}
              >
                MedGuide AI
              </span>
            </div>
            {/* Avatar placeholder */}
            <div
              className="rounded-full overflow-hidden bg-[#D9DDD5] flex items-center justify-center shrink-0"
              style={{
                width: "clamp(18px, 1.9vw, 24px)",
                height: "clamp(18px, 1.9vw, 24px)",
              }}
              aria-label="User avatar"
            >
              {/* Neutral avatar shape */}
              <svg viewBox="0 0 24 24" fill="#74807A" style={{ width: "70%", height: "70%" }} aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          </div>

          {/* ── Main content area ─────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden px-3 pt-2 pb-1">
            {/* Heading */}
            <div className="text-center mb-2 mt-1">
              <h2
                className="font-bold text-[#062D29] leading-tight"
                style={{ fontSize: "clamp(12px, 1.5vw, 18px)" }}
              >
                How can I help
                <br />
                you today?
              </h2>
            </div>

            {/* Mode tabs */}
            <div
              className="flex items-center justify-center gap-1.5 mb-2"
            >
              {INPUT_MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveMode(id as "text" | "voice" | "document")}
                  className={`flex items-center gap-1 rounded-full border transition-all ${
                    activeMode === id
                      ? "bg-[#FAF7EF] border-[#062D29]/25 text-[#062D29] font-semibold"
                      : "border-[#D9DDD5] text-[#74807A] hover:border-[#062D29]/20"
                  }`}
                  style={{ fontSize: "clamp(7px, 0.8vw, 9px)", padding: "2px 6px" }}
                  aria-pressed={activeMode === id}
                  aria-label={`${label} input mode`}
                >
                  <Icon style={{ width: "clamp(8px, 0.9vw, 10px)", height: "clamp(8px, 0.9vw, 10px)" }} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            {/* Input field */}
            <div
              className="flex items-center rounded-xl border bg-white mb-2 shrink-0"
              style={{
                borderColor: "#D9DDD5",
                padding: "clamp(4px, 0.5vw, 7px) clamp(8px, 0.8vw, 12px)",
                gap: "clamp(4px, 0.5vw, 8px)",
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your health question..."
                className="flex-1 bg-transparent text-[#283A37] placeholder-[#74807A] outline-none min-w-0"
                style={{ fontSize: "clamp(7px, 0.8vw, 9.5px)" }}
                aria-label="Type your health question"
              />
              <button
                type="button"
                className="shrink-0 rounded-full bg-[#003D34] text-white flex items-center justify-center hover:bg-[#062D29] transition-colors"
                style={{
                  width: "clamp(16px, 1.8vw, 22px)",
                  height: "clamp(16px, 1.8vw, 22px)",
                }}
                aria-label="Submit health question"
              >
                <ArrowUpRight
                  style={{ width: "clamp(8px, 0.9vw, 11px)", height: "clamp(8px, 0.9vw, 11px)" }}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Try asking label */}
            <p
              className="text-[#74807A] font-medium mb-1.5"
              style={{ fontSize: "clamp(7px, 0.75vw, 9px)" }}
            >
              Try asking
            </p>

            {/* Suggestion pills */}
            <div className="flex flex-col gap-1 flex-1 min-h-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSuggestion(s.text)}
                  className="text-left rounded-lg border border-[#D9DDD5] bg-white text-[#283A37] hover:border-[#062D29]/30 hover:bg-[#FAF7EF] transition-all shrink-0"
                  style={{
                    fontSize: "clamp(6.5px, 0.75vw, 9px)",
                    padding: "clamp(4px, 0.45vw, 6px) clamp(7px, 0.75vw, 10px)",
                    fontFamily: s.lang === "hi" ? "var(--font-hindi), 'Noto Sans Devanagari', sans-serif" : "inherit",
                    lineHeight: s.lang === "hi" ? "1.7" : "1.4",
                  }}
                  lang={s.lang}
                  aria-label={`Suggested question: ${s.text}`}
                >
                  {s.text}
                </button>
              ))}
            </div>
          </div>

          {/* ── Bottom navigation ─────────────────────────────────────────── */}
          <div
            className="shrink-0 border-t flex items-center"
            style={{
              borderColor: "rgba(0,0,0,0.07)",
              height: "13%",
              paddingBottom: "1%",
            }}
          >
            {PHONE_NAV.map(({ id, label, Icon, active }) => (
              <button
                key={id}
                type="button"
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
                  active ? "text-[#003D34]" : "text-[#74807A] hover:text-[#283A37]"
                }`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  style={{ width: "clamp(10px, 1.1vw, 14px)", height: "clamp(10px, 1.1vw, 14px)" }}
                  strokeWidth={active ? 2.5 : 1.8}
                  aria-hidden="true"
                />
                <span
                  className={`font-medium ${active ? "font-semibold" : ""}`}
                  style={{ fontSize: "clamp(5.5px, 0.6vw, 7.5px)" }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
