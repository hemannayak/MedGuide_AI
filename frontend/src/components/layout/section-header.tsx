"use client";

import React from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}) => {
  const isLeft = align === "left";

  return (
    <div
      className={`max-w-3xl ${
        isLeft ? "text-left" : "mx-auto text-center"
      } space-y-3 mb-12 sm:mb-16 ${className}`}
    >
      {/* Subtle Flourish Ornament */}
      <div className={`flex ${isLeft ? "justify-start" : "justify-center"} mb-2`}>
        <svg
          width="120"
          height="28"
          viewBox="0 0 140 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-slate-300/80"
        >
          <path
            d="M10 24C24 24 32 10 48 10C64 10 66 26 70 26C74 26 76 10 92 10C108 10 116 24 130 24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="70" cy="26" r="2" fill="currentColor" />
        </svg>
      </div>

      {eyebrow && (
        <div>
          <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E] bg-teal-50/80 px-3.5 py-1 rounded-full border border-teal-200/60">
            {eyebrow}
          </span>
        </div>
      )}

      <h2 className="font-serif text-2xl sm:text-4xl text-slate-900 tracking-tight leading-[1.15]">
        {title}
      </h2>

      {subtitle && (
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal pt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
