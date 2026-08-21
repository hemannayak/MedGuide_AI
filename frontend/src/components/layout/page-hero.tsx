"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  primaryCtaText,
  primaryCtaHref,
  secondaryCtaText,
  secondaryCtaHref,
  children,
}) => {
  return (
    <section className="pt-44 sm:pt-52 lg:pt-60 pb-16 sm:pb-24 relative overflow-hidden bg-[#FCFCFA]">
      {/* Subtle Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-teal-50/60 via-amber-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 text-center">
        {/* Subtle Flourish Ornament */}
        <div className="flex justify-center mb-4">
          <svg
            width="140"
            height="32"
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
            <path
              d="M30 16C38 16 44 8 52 8C60 8 64 18 70 18C76 18 80 8 88 8C96 8 102 16 110 16"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray="2 3"
            />
            <circle cx="70" cy="26" r="2.5" fill="currentColor" />
          </svg>
        </div>

        {/* Eyebrow Label */}
        {eyebrow && (
          <div className="mb-4 sm:mb-5">
            <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E] bg-teal-50/90 px-3.5 py-1 rounded-full border border-teal-200/70">
              {eyebrow}
            </span>
          </div>
        )}

        {/* Hero Title (Editorial Instrument Serif) */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
          {title}
        </h1>

        {/* Subtitle Description */}
        {subtitle && (
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        {/* Action Buttons Row */}
        {(primaryCtaText || secondaryCtaText) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {primaryCtaText && primaryCtaHref && (
              <Link
                href={primaryCtaHref}
                className="btn-pill btn-pill-primary inline-flex items-center gap-2 group italiana-regular font-bold text-lg"
              >
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {secondaryCtaText && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className="btn-pill btn-pill-secondary inline-flex items-center gap-2 italiana-regular font-bold text-lg"
              >
                <span>{secondaryCtaText}</span>
              </Link>
            )}
          </div>
        )}

        {/* Optional Visual Content / Extra Elements */}
        {children && <div className="mt-12 sm:mt-16">{children}</div>}
      </div>
    </section>
  );
};
