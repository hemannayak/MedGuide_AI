"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { MedButton } from "@/components/ui/med-button";

export const HeroCtaCard: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-[#FAFAF8] relative overflow-hidden">
      <div className="section-container">
        {/* Main Sarvam AI Inspired Dark Gradient Card Box */}
        <div className="max-w-5xl mx-auto rounded-[36px] sm:rounded-[44px] bg-gradient-to-b from-[#25293B] via-[#1E2233] to-[#141724] border border-slate-700/50 shadow-2xl p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden group">
          {/* Ambient Mesh Background & Arc Wireframe Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Soft Ambient Radial Glow */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-indigo-500/20 via-purple-400/10 to-transparent blur-3xl rounded-full" />
            
            {/* Wireframe Arc Lines SVG (Matching Sarvam AI Starburst Arc Graphic) */}
            <svg
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[280px] text-indigo-300/20"
              viewBox="0 0 800 280"
              fill="none"
            >
              <ellipse cx="400" cy="280" rx="380" ry="240" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="400" cy="280" rx="300" ry="190" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="400" cy="280" rx="220" ry="140" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="400" cy="280" rx="140" ry="90" stroke="currentColor" strokeWidth="1" />
              <line x1="400" y1="0" x2="400" y2="280" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1]">
              Build the Future of Rural Healthcare AI with MedGuide
            </h2>

            {/* Central Starburst Sparkle Emblem (Matching Sarvam AI Center Icon) */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-indigo-200 fill-indigo-200/40" />
              </div>
            </div>

            {/* Action Glass Pill Button (Matching Sarvam AI Center Glass Pill Button) */}
            <div className="pt-2">
              <Link href="/app/chat">
                <MedButton
                  variant="secondary"
                  size="hero"
                  className="bg-white/90 text-slate-900 hover:bg-white border border-white/80 shadow-lg px-10"
                >
                  Start Healthcare Chat
                </MedButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
