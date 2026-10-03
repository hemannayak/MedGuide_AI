"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, X } from "lucide-react";
import { PhoneMockup } from "./phone-mockup";
import { InfoStrip } from "./info-strip";
import { LandingHeader } from "./landing-header";

// ─── Coral handwritten curve (reference: far right, angled) ───────────────────
const CoralCurve: React.FC = () => (
  <svg
    className="absolute pointer-events-none select-none"
    style={{
      right: "1.8%",
      top: "12%",
      width: "clamp(100px, 9vw, 170px)",
      height: "auto",
      zIndex: 8,
      opacity: 0.75,
    }}
    viewBox="0 0 170 310"
    fill="none"
    aria-hidden="true"
  >
    {/* Handwritten-style looping curve matching reference */}
    <path
      d="M145 10 C130 55, 95 90, 115 155 C135 215 75 255 62 308"
      stroke="#E05A38"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M152 18 C142 62, 112 98, 125 158 C138 218 88 258 72 308"
      stroke="#E05A38"
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />
  </svg>
);

// ─── Demo / video modal ────────────────────────────────────────────────────────
const DemoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-label="MedGuide AI demo"
  >
    <div
      className="absolute inset-0 bg-[#062D29]/60 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    />
    <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#FAF7EF] text-[#74807A] transition-colors"
        aria-label="Close demo modal"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
      <div className="w-16 h-16 rounded-full bg-[#FAF7EF] border-2 border-[#D9DDD5] flex items-center justify-center mx-auto mb-4">
        <Play className="w-7 h-7 text-[#062D29] ml-1" aria-hidden="true" />
      </div>
      <h2
        className="text-xl font-bold text-[#062D29] mb-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        How MedGuide AI Works
      </h2>
      <p className="text-[#74807A] text-sm leading-relaxed mb-6">
        A demonstration video is not yet available. To see MedGuide AI in
        action, try the live app below.
      </p>
      <Link
        href="/app/chat"
        onClick={onClose}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#003D34] text-white font-semibold text-sm hover:bg-[#062D29] transition-colors"
      >
        Try MedGuide AI
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  </div>
);

// ─── Hero Landing ──────────────────────────────────────────────────────────────
//
// LAYOUT STRATEGY
// ───────────────
// The reference image is 2048 × 958 px (ratio 46.77%).
// We set section height = 46.77vw so that background-size:cover never zooms
// the image — the container is always the exact natural aspect ratio of the photo.
//
// Three overlay layers:
//  1. Left ivory gradient  – covers baked-in background text (0-45% width)
//  2. Top thin band        – covers baked-in nav items leaking through
//  3. Bottom fade          – softly merges into info strip
//
// The phone is absolutely positioned to sit exactly in the 62-83% width zone,
// matching the reference composition precisely.
//
export const HeroLanding: React.FC = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          // Natural image aspect ratio: 958/2048 = 46.77%
          // This makes background-size:cover produce ZERO zoom at all viewports.
          height: "max(600px, 46.77vw)",
        }}
        aria-label="MedGuide AI hero section"
      >

        {/* ── 0. Background image (full, no zoom) ──────────────────────────
         *  background-size:cover with a container that matches the image
         *  aspect ratio = no upscaling, no pixelation.
         */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/hero-rural-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          }}
        />

        {/* ── 1. Primary left-to-right cover overlay ────────────────────────
         *  Solid ivory 0→42%, feathers to transparent at 90%.
         *  This completely erases all baked-in text from the reference BG.
         *  Only the far-right ~10% (woman + wall) shows the real photograph.
         */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, #FAF7EF 0%, #FAF7EF 32%, rgba(250,247,239,0.99) 42%, rgba(250,247,239,0.95) 55%, rgba(250,247,239,0.78) 68%, rgba(250,247,239,0.40) 80%, rgba(250,247,239,0.12) 88%, transparent 94%)",
            zIndex: 2,
          }}
        />

        {/* ── 2. Top-edge full-width softener ────────────────────────────
         *  Covers the top 13% of the photo at full width to eliminate the
         *  baked-in EN and Try MedGuide buttons from the reference screenshot.
         *  Fades naturally to expose the treeline / sky on the right.
         */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "13%",
            background: "rgba(250,247,239,0.88)",
            zIndex: 3,
          }}
        />

        {/* ── 3. Bottom fade into info strip ───────────────────────────────*/}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "26%",
            background:
              "linear-gradient(to top, rgba(250,247,239,0.95) 0%, rgba(250,247,239,0.70) 35%, transparent 100%)",
            zIndex: 3,
          }}
        />

        {/* ── 4. Coral decorative curve (far right) ────────────────────── */}
        <CoralCurve />

        {/* ── 5. Landing navigation ────────────────────────────────────── */}
        <div style={{ position: "absolute", inset: 0, top: 0, zIndex: 50, pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto" }}>
            <LandingHeader />
          </div>
        </div>

        {/* ── 6. Hero copy (left column) ───────────────────────────────── */}
        {/*
         * Reference: left edge at 6.7% of width, content ~52% wide.
         * Vertical: eyebrow at 18% top, CTAs end at 63% top.
         */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "6.7%",
            width: "clamp(280px, 50%, 640px)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Eyebrow */}
          <p
            className="font-semibold text-[#283A37] uppercase mb-3"
            style={{
              fontSize: "clamp(9px, 0.64vw, 13px)",
              letterSpacing: "0.30em",
            }}
          >
            MEDGUIDE AI
          </p>

          {/* Main headline – 2 lines */}
          <h1
            className="text-[#062D29] font-bold mb-4"
            style={{
              fontFamily: "Georgia, 'Times New Roman', 'Palatino Linotype', serif",
              fontSize: "clamp(1.75rem, 3.8vw, 5rem)",
              letterSpacing: "-0.025em",
              lineHeight: "1.06",
            }}
          >
            Healthcare guidance,
            <br />
            <span style={{ color: "#E8613C" }}>closer to home.</span>
          </h1>

          {/* Supporting text */}
          <p
            className="text-[#283A37] mb-6"
            style={{
              fontSize: "clamp(0.8125rem, 1.1vw, 1.125rem)",
              lineHeight: "1.55",
              maxWidth: "44ch",
            }}
          >
            Ask your questions in your language. Get evidence-based medical
            information, explained simply, with built-in safety guidance.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-5">
            {/* Primary: Try MedGuide */}
            <Link href="/app/chat">
              <button
                id="cta-try-medguide"
                type="button"
                className="inline-flex items-center gap-2 font-semibold text-white bg-[#003D34] hover:bg-[#062D29] transition-all hover:-translate-y-0.5"
                style={{
                  borderRadius: "clamp(18px, 1.8vw, 26px)",
                  padding: "clamp(0.65rem, 0.95vw, 1rem) clamp(1.25rem, 1.9vw, 2.1rem)",
                  fontSize: "clamp(0.8125rem, 0.98vw, 1.0625rem)",
                  boxShadow: "0 4px 22px -4px rgba(0,61,52,0.45)",
                }}
              >
                Try MedGuide
                <ArrowRight
                  className="transition-transform group-hover:translate-x-0.5 shrink-0"
                  style={{ width: "clamp(13px, 1.1vw, 17px)", height: "clamp(13px, 1.1vw, 17px)" }}
                  aria-hidden="true"
                />
              </button>
            </Link>

            {/* Secondary: See how it works */}
            <button
              id="cta-see-how"
              type="button"
              onClick={() => setDemoOpen(true)}
              className="inline-flex items-center gap-2 font-medium text-[#062D29] bg-transparent hover:bg-white/20 border transition-all hover:-translate-y-0.5"
              style={{
                borderColor: "rgba(106,120,112,0.65)",
                borderRadius: "999px",
                padding: "clamp(0.6rem, 0.85vw, 0.9rem) clamp(1.1rem, 1.65vw, 1.8rem)",
                fontSize: "clamp(0.8125rem, 0.95vw, 1rem)",
              }}
              aria-label="See how MedGuide AI works"
            >
              <span
                className="inline-flex items-center justify-center rounded-full border shrink-0"
                style={{
                  borderColor: "rgba(106,120,112,0.65)",
                  width: "clamp(18px, 1.5vw, 24px)",
                  height: "clamp(18px, 1.5vw, 24px)",
                }}
                aria-hidden="true"
              >
                <Play
                  style={{
                    width: "clamp(7px, 0.55vw, 9px)",
                    height: "clamp(7px, 0.55vw, 9px)",
                    marginLeft: "1.5px",
                    fill: "#062D29",
                    color: "#062D29",
                  }}
                />
              </span>
              See how it works
            </button>
          </div>
        </div>

        {/* ── 7. Phone mockup ──────────────────────────────────────────
         *  Sits at 52% from left, which at 1440px = ~749px from left edge.
         *  Width 24vw at 1440px = 346px. Ends at ~749+346 = ~1095px (76% width).
         *  The info strip 4th column sits at ~48% width → no overlap.
         */}
        <div
          className="hidden lg:block"
          style={{
            position: "absolute",
            top: "9%",
            left: "52%",
            width: "clamp(240px, 24vw, 390px)",
            height: "auto",
            zIndex: 20,
            filter: "drop-shadow(0 24px 48px rgba(6,45,41,0.30))",
          }}
        >
          <PhoneMockup />
        </div>

        {/* ── 8. Info strip (bottom bar) ───────────────────────────────────
         *  Reference: bottom 23% of the section, spans full width.
         */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 15,
          }}
        >
          <InfoStrip />
        </div>
      </section>

      {/* Mobile: phone below hero copy, above info strip */}
      <div className="flex lg:hidden justify-center py-6 bg-[#FAF7EF]">
        <PhoneMockup />
      </div>

      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
    </>
  );
};
