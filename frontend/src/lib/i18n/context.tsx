"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import en from "./dictionaries/en.json";
import hi from "./dictionaries/hi.json";
import te from "./dictionaries/te.json";
import { translateInterface } from "./interface-copy";

export type Language = "en" | "hi" | "te";

type Dictionary = Record<string, unknown>;

const dictionaries: Record<Language, Dictionary> = {
  en: en as Dictionary,
  hi: hi as Dictionary,
  te: te as Dictionary,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
  tr: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
  tr: (text) => text,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language = useSyncExternalStore(
    (notify) => {
      window.addEventListener("medguide-language", notify);
      window.addEventListener("storage", notify);
      return () => { window.removeEventListener("medguide-language", notify); window.removeEventListener("storage", notify); };
    },
    () => {
      try { const saved = localStorage.getItem("medguide_lang"); return saved === "hi" || saved === "te" ? saved : "en"; }
      catch { return "en"; }
    },
    () => "en" as Language,
  );
  const setLanguage = (lang: Language) => {
    if (!["en", "hi", "te"].includes(lang)) return;
    try { localStorage.setItem("medguide_lang", lang); }
    catch { return; }
    window.dispatchEvent(new Event("medguide-language"));
  };
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const tr = (text: string): string => translateInterface(text, language);

  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    let current: unknown = dictionaries[language] || dictionaries["en"];
    for (const k of keys) {
      if (current && typeof current === "object" && k in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[k];
      } else {
        let fallback: unknown = dictionaries["en"];
        for (const fk of keys) {
          if (fallback && typeof fallback === "object" && fk in (fallback as Record<string, unknown>)) {
            fallback = (fallback as Record<string, unknown>)[fk];
          } else {
            return keyPath;
          }
        }
        return typeof fallback === "string" ? fallback : keyPath;
      }
    }
    return typeof current === "string" ? current : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tr }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
