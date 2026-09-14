"use client";

import React, { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";

export const Preloader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Only run on initial load
    const timer = setTimeout(() => {
      setFading(true);
      const finishTimer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(finishTimer);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF9F5] transition-opacity duration-400 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={fading}
    >
      <div className="relative flex flex-col items-center space-y-4">
        {/* Soft pulse glowing ring around icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-amber-500/15 animate-ping" />
          <div className="w-16 h-16 rounded-2xl bg-[#1C1917] text-white flex items-center justify-center shadow-lg z-10">
            <HeartPulse className="w-8 h-8 text-amber-200 animate-pulse" />
          </div>
        </div>

        {/* Brand statement */}
        <div className="text-center space-y-1">
          <div className="font-serif text-2xl font-normal tracking-tight text-[#1C1917]">
            MedGuide <span className="text-[#8C6D46] italic">AI</span>
          </div>
          <p className="text-xs font-medium text-stone-500 tracking-wide uppercase">
            Healthcare guidance, in your language
          </p>
        </div>

        {/* Minimal loading indicator bar */}
        <div className="w-32 h-1 rounded-full bg-stone-200 overflow-hidden mt-2">
          <div className="w-full h-full bg-[#1C1917] rounded-full animate-[loading-bar_1.2s_infinite_ease-in-out]" />
        </div>
      </div>
    </div>
  );
};
