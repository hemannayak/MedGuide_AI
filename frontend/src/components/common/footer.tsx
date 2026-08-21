"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Award, ChevronDown, ChevronUp } from "lucide-react";

export const Footer: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleAccordion = (sec: string) => {
    setOpenSection(openSection === sec ? null : sec);
  };

  return (
    <footer className="bg-[#FAFAF8] text-slate-900 text-xs mt-20 pt-16 relative overflow-hidden">
      {/* Full Widescreen Container utilizing left & right space */}
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">
        {/* Main Footer Grid Layout (Brand Column + 5 Link Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 pb-16">
          {/* LEFT BRAND & COMPLIANCE COLUMN (3 cols) */}
          <div className="md:col-span-3 space-y-6">
            {/* Logo */}
            <Link href="/" className="inline-block">
              <Image
                src="/medguide_logo.png"
                alt="MedGuide Logo"
                width={360}
                height={96}
                className="h-14 sm:h-16 lg:h-20 w-auto object-contain"
              />
            </Link>

            {/* Tagline */}
            <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-sm">
              Healthcare for all from India
            </p>

            {/* Compliance & Security Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">

              <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0F766E]" />
                <div className="text-[10px] leading-tight">
                  <span className="font-bold text-slate-900 block">ABDM &amp; WHO</span>
                  <span className="text-slate-400 font-medium">Grounded</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-widest">
                Find us at
              </span>
              <div className="flex items-center gap-2.5 text-slate-600">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center hover:text-[#0F766E] hover:border-[#0F766E]/40 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
                {/* X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center hover:text-[#0F766E] hover:border-[#0F766E]/40 transition-colors font-bold text-xs"
                >
                  𝕏
                </a>
                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center hover:text-[#0F766E] hover:border-[#0F766E]/40 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09v2.68c0 .6-.03 1.29-.1 2.09-.06.8-.15 1.43-.28 1.9-.13.47-.36.88-.69 1.23-.33.35-.76.58-1.29.69-.47.13-1.1.22-1.9.28-.8.07-1.49.1-2.09.1H8.38c-.6 0-1.29-.03-2.09-.1-.8-.06-1.43-.15-1.9-.28-.47-.13-.88-.36-1.23-.69-.35-.33-.58-.76-.69-1.29-.13-.47-.22-1.1-.28-1.9C2.13 13.69 2.1 13 2.1 12.4v-2.68c0-.6.03-1.29.1-2.09.06-.8.15-1.43.28-1.9.13-.47.36-.88.69-1.23.33-.35.76-.58 1.29-.69.47-.13 1.1-.22 1.9-.28.8-.07 1.49-.1 2.09-.1h7.24c.6 0 1.29.03 2.09.1.8.06 1.43.15 1.9.28.47.13.88.36 1.23.69.33.35.56.76.69 1.29z" />
                  </svg>
                </a>
                {/* GitHub */}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center hover:text-[#0F766E] hover:border-[#0F766E]/40 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center hover:text-[#0F766E] hover:border-[#0F766E]/40 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT NAVIGATION COLUMNS (9 cols: 5 Link Columns Spaced Airy across full screen) */}
          <div className="hidden md:grid md:col-span-9 grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10 lg:gap-14">
            {/* COLUMN 1: PRODUCTS */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                PRODUCTS
              </h4>
              <ul className="space-y-2.5 text-slate-600 text-xs">
                <li>
                  <Link href="/app/chat" className="hover:text-slate-900 transition-colors">
                    Voice AI Companion
                  </Link>
                </li>
                <li>
                  <Link href="/app/symptoms" className="hover:text-slate-900 transition-colors">
                    Symptom Triage Engine
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
                    Indic Speech-to-Text
                  </Link>
                </li>
                <li>
                  <Link href="/app/chat" className="hover:text-slate-900 transition-colors">
                    Prescription OCR
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-slate-900 transition-colors">
                    Healthcare Worker Portal
                  </Link>
                </li>
                <li>
                  <Link href="/app/emergency" className="hover:text-slate-900 transition-colors font-medium text-red-600">
                    Emergency 108 Pathway
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 2: APIS & MODELS */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                APIS &amp; MODELS
              </h4>
              <ul className="space-y-2.5 text-slate-600 text-xs">
                <li>
                  <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
                    Text to Speech
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
                    Speech to Text
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
                    Doc Digitisation
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
                    Indic Translation
                  </Link>
                </li>
                <li>
                  <Link href="/admin/activity" className="hover:text-slate-900 transition-colors">
                    pgvector RAG Search
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: RESOURCES */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                RESOURCES
              </h4>
              <ul className="space-y-2.5 text-slate-600 text-xs">
                <li>
                  <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
                    WHO Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-slate-900 transition-colors">
                    Clinical Safety Rules
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-slate-900 transition-colors">
                    FAQ Directory
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="hover:text-slate-900 transition-colors">
                    Accessibility Standards
                  </Link>
                </li>
                <li>
                  <Link href="/admin/activity" className="hover:text-slate-900 transition-colors">
                    System Architecture
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 4: COMPANY */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                COMPANY
              </h4>
              <ul className="space-y-2.5 text-slate-600 text-xs">
                <li>
                  <Link href="/about" className="hover:text-slate-900 transition-colors">
                    About MedGuide AI
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-slate-900 transition-colors">
                    Research Mission
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-slate-900 transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/admin/activity" className="hover:text-slate-900 transition-colors">
                    Activity Monitor
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 5: LEGAL */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                LEGAL &amp; ETHICS
              </h4>
              <ul className="space-y-2.5 text-slate-600 text-xs">
                <li>
                  <Link href="/legal/disclaimer" className="hover:text-slate-900 transition-colors">
                    Medical Disclaimer
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-slate-900 transition-colors">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-slate-900 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-slate-900 transition-colors">
                    AI Safety Rules
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* MOBILE ACCORDIONS */}
        <div className="md:hidden space-y-3 py-6 border-b border-slate-200/80">
          {[
            {
              id: "products",
              title: "Products",
              links: [
                { label: "Voice AI Companion", href: "/app/chat" },
                { label: "Symptom Triage", href: "/app/symptoms" },
                { label: "Emergency 108", href: "/app/emergency" },
              ],
            },
            {
              id: "resources",
              title: "Resources",
              links: [
                { label: "How It Works", href: "/how-it-works" },
                { label: "Safety Framework", href: "/safety" },
                { label: "FAQs", href: "/faq" },
              ],
            },
            {
              id: "company",
              title: "Company & Legal",
              links: [
                { label: "About Us", href: "/about" },
                { label: "Medical Disclaimer", href: "/legal/disclaimer" },
                { label: "Privacy Policy", href: "/legal/privacy" },
              ],
            },
          ].map((sec) => (
            <div key={sec.id} className="border-b border-slate-200/80 pb-2">
              <button
                type="button"
                onClick={() => toggleAccordion(sec.id)}
                className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                <span>{sec.title}</span>
                {openSection === sec.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openSection === sec.id && (
                <ul className="pt-2 pb-1 space-y-2 text-xs pl-2">
                  {sec.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-slate-600 hover:text-slate-900">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* SINGLE CLEAN LINE COPYRIGHT & DISCLAIMER STRIP (No card box component) */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-b border-slate-200/60">
          <div>
            &copy; {new Date().getFullYear()} MedGuide AI. All rights reserved. Rural Healthcare Intelligence &amp; Digital Care Platform.
          </div>
          <div className="text-[11px] text-slate-400">
            India
          </div>
        </div>

        {/* BOTTOM GIANT EDITORIAL WORDMARK (Matching Sarvam AI Footer Signature) */}
        <div className="pt-8 pb-12 text-center overflow-hidden">
          <div className="font-serif text-[16vw] font-normal leading-none tracking-tighter text-slate-200/90 select-none pointer-events-none lowercase">
            medguide
          </div>
        </div>
      </div>
    </footer>
  );
};
