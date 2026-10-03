"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";

// Shared brand asset; adjacent text provides the accessible name.
const MedGuideEmblem: React.FC<{ className?: string }> = ({ className }) => (
  <Image src="/medguide-mark.svg" alt="" width={32} height={32} className={className} />
);

// ─── Nav items matching reference ────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Product", href: "/product" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Technology", href: "/technology" },
  { label: "Research", href: "/research" },
  { label: "About", href: "/about" },
];

export const LandingHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="absolute top-0 inset-x-0 z-50 w-full"
      role="banner"
    >
      {/* ── Desktop Nav ─────────────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-between px-[5.5rem] pt-7 pb-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="MedGuide AI – Home"
        >
          <MedGuideEmblem className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <span
            className="font-bold text-[#062D29] tracking-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.25rem" }}
          >
            MedGuide AI
          </span>
        </Link>

        {/* Central nav links */}
        <nav className="flex items-center gap-7" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[#283A37] font-medium hover:text-[#062D29] transition-colors"
              style={{ fontSize: "0.9375rem" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Try MedGuide CTA */}
          <Link href="/app/chat">
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#062D29] text-[#FAF7EF] font-semibold hover:bg-[#003D34] transition-all hover:-translate-y-0.5 shadow-sm"
              style={{ fontSize: "0.9375rem" }}
            >
              Try MedGuide
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </Link>
        </div>
      </div>

      {/* ── Mobile Nav ──────────────────────────────────────────────────────── */}
      <div className="flex md:hidden items-center justify-between px-5 pt-5 pb-3">
        <Link href="/" className="flex items-center gap-2" aria-label="MedGuide AI – Home">
          <MedGuideEmblem className="w-7 h-7" />
          <span
            className="font-bold text-[#062D29]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.1rem" }}
          >
            MedGuide AI
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-[#062D29]"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden mx-4 mb-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-[#D9DDD5]/60 overflow-hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-5 py-3 text-[#283A37] font-medium hover:bg-[#FAF7EF] hover:text-[#062D29] transition-colors"
                style={{ fontSize: "0.9375rem" }}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-5 py-3 border-t border-[#D9DDD5]/60 flex gap-3">
              <Link href="/app/chat" className="flex-1" onClick={() => setMobileOpen(false)}>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#062D29] text-[#FAF7EF] font-semibold text-sm"
                >
                  Try MedGuide
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
