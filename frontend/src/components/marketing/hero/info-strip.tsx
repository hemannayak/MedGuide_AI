"use client";

import React from "react";

// ─── Stat icons (outline SVGs matching the reference) ────────────────────────
const LanguageIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} aria-hidden="true">
    <rect x="4" y="6" width="24" height="18" rx="4" stroke="#062D29" strokeWidth="2" />
    <path d="M4 20L8 26H14" stroke="#062D29" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 13h10M12 17h7" stroke="#062D29" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="31" cy="29" r="7" stroke="#062D29" strokeWidth="1.8" />
    <path d="M28 29h6M31 26v6" stroke="#062D29" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BookIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} aria-hidden="true">
    <path d="M20 10V32" stroke="#062D29" strokeWidth="2" />
    <path d="M20 10C20 10 14 7 7 8V30C14 29 20 32 20 32" stroke="#062D29" strokeWidth="2" strokeLinejoin="round" />
    <path d="M20 10C20 10 26 7 33 8V30C26 29 20 32 20 32" stroke="#062D29" strokeWidth="2" strokeLinejoin="round" />
    <path d="M10 14h7M10 18h5M10 22h6" stroke="#062D29" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const GearIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} aria-hidden="true">
    <circle cx="20" cy="20" r="5" stroke="#062D29" strokeWidth="2" />
    <path
      d="M20 6v4M20 30v4M6 20h4M30 20h4M9.17 9.17l2.83 2.83M28 28l2.83 2.83M9.17 30.83l2.83-2.83M28 12l2.83-2.83"
      stroke="#062D29"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ShieldIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} aria-hidden="true">
    <path
      d="M20 5L7 11V21C7 28.7 12.7 35.9 20 38C27.3 35.9 33 28.7 33 21V11L20 5Z"
      stroke="#062D29"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M14 20.5L18 24.5L26 16" stroke="#062D29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Info strip data ──────────────────────────────────────────────────────────
// NOTE: Figures are reference-design claims for visual reproduction only.
// Requires verification by project owner before production publication.
const STATS = [
  { id: "languages",  label: "Multilingual Support", value: "5+",          caption: "Languages",         Icon: LanguageIcon },
  { id: "documents",  label: "Knowledge Sources",    value: "50K+",        caption: "Medical Documents", Icon: BookIcon     },
  { id: "tech",       label: "Built with",           value: "RAG + LLM",   caption: "Evidence-grounded", Icon: GearIcon     },
  { id: "safety",     label: "Design Focus",         value: "Safety First", caption: "Red-flag Detection", Icon: ShieldIcon  },
] as const;

export const InfoStrip: React.FC = () => (
  <div
    role="region"
    aria-label="Platform statistics"
    style={{
      // Ivory from left edge fades to transparent at 75%
      // so the valley / woman on the right remain fully visible
      background:
        "linear-gradient(to right, rgba(250,247,239,0.97) 0%, rgba(250,247,239,0.97) 50%, rgba(250,247,239,0.80) 62%, rgba(250,247,239,0.45) 72%, transparent 84%)",
      paddingTop:    "clamp(1rem,   2.2vw, 1.75rem)",
      paddingBottom: "clamp(1rem,   2.2vw, 1.75rem)",
      paddingLeft:   "clamp(1.25rem, 6.7vw, 8.5rem)", // aligns with the hero copy left edge
      paddingRight:  "clamp(1rem,   4vw,  4rem)",
    }}
  >
    {/* Single horizontal row – 4 equal columns, no wrap */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, max-content)",
        gap: "clamp(2rem, 5vw, 6rem)",
        alignItems: "start",
      }}
    >
      {STATS.map(({ id, label, value, caption, Icon }) => (
        <div
          key={id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(0.625rem, 0.9vw, 1rem)",
            flexShrink: 0,
          }}
        >
          {/* Icon */}
          <Icon
            style={{
              width:    "clamp(28px, 2.5vw, 38px)",
              height:   "clamp(28px, 2.5vw, 38px)",
              flexShrink: 0,
            }}
          />

          {/* Text group */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Label */}
            <span
              style={{
                fontSize:      "clamp(0.5625rem, 0.62vw, 0.6875rem)",
                fontWeight:    500,
                color:         "#74807A",
                letterSpacing: "0.01em",
                lineHeight:    1.3,
                marginBottom:  "2px",
              }}
            >
              {label}
            </span>

            {/* Value */}
            <span
              style={{
                fontSize:      "clamp(1rem, 1.5vw, 1.75rem)",
                fontWeight:    700,
                color:         "#062D29",
                letterSpacing: "-0.01em",
                lineHeight:    1.1,
              }}
            >
              {value}
            </span>

            {/* Caption */}
            <span
              style={{
                fontSize:   "clamp(0.5625rem, 0.62vw, 0.6875rem)",
                color:      "#74807A",
                lineHeight: 1.3,
                marginTop:  "2px",
              }}
            >
              {caption}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
