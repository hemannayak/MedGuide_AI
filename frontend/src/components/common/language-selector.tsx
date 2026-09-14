"use client";

import React from "react";
import { useLanguage, Language } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; nativeLabel: string }[] = [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
    { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
      <Globe className="w-4 h-4 text-slate-500 ml-1.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">Select language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer py-1 pr-2 min-h-[44px]"
        aria-label="Language selector"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
            {lang.nativeLabel} ({lang.label})
          </option>
        ))}
      </select>
    </div>
  );
};
