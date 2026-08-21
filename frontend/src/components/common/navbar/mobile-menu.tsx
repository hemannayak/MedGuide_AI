"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { NAV_ITEMS, NavItemData } from "./nav-data";
import { useLanguage, Language } from "@/lib/i18n/context";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [expandedId, setExpandedId] = useState<string | null>("platform");
  const { language, setLanguage } = useLanguage();

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const languagesList: { code: Language; name: string; script: string }[] = [
    { code: "en", name: "English", script: "English" },
    { code: "hi", name: "Hindi", script: "हिंदी" },
    { code: "te", name: "Telugu", script: "తెలుగు" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-x-4 top-24 z-50 ${pathname === "/" ? "bg-[#FFF5EA]/95 border-amber-900/10" : "bg-white/98 border-slate-200/90"} backdrop-blur-xl border rounded-3xl p-6 shadow-2xl space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto`}
        >
          {/* Accordions */}
          <div className="space-y-3 divide-y divide-slate-100">
            {NAV_ITEMS.map((navItem: NavItemData) => {
              const isExpanded = expandedId === navItem.id;

              return (
                <div key={navItem.id} className="pt-3 first:pt-0">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(navItem.id)}
                    className="w-full min-h-[48px] flex items-center justify-between py-2 text-sm font-bold text-slate-900 text-left cursor-pointer"
                  >
                    <span>{navItem.label}</span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </motion.div>
                  </button>

                  {/* Expanded Accordion Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden space-y-4 pt-2 pb-3 pl-2"
                      >
                        {navItem.sections.map((section, sIdx) => (
                          <div key={sIdx} className="space-y-2">
                            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                              {section.title}
                            </div>
                            <div className="space-y-1.5">
                              {section.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 py-2 px-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-800"
                                  >
                                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0">
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span>{item.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Language Selector */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
              Select Language:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`py-2 text-xs rounded-xl border text-center font-bold min-h-[44px] cursor-pointer ${
                    language === lang.code
                      ? "bg-[#161A24] text-white border-[#161A24]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {lang.script}
                </button>
              ))}
            </div>
          </div>

          {/* Sign In & Primary CTA */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <Link
              href="/login"
              onClick={onClose}
              className="w-full py-3 rounded-full text-center text-xs font-bold text-slate-700 hover:bg-slate-100 block min-h-[48px] flex items-center justify-center"
            >
              Sign in
            </Link>
            <Link
              href="/app/chat"
              onClick={onClose}
              className="w-full py-3.5 rounded-full bg-[#161A24] hover:bg-slate-900 text-white font-serif text-base sm:text-lg font-normal tracking-tight flex items-center justify-center gap-2 min-h-[48px] shadow-md"
            >
              <span>Try MedGuide</span>
              <ArrowRight className="w-4 h-4 text-teal-300" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
