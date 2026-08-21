"use client";

import React, { createContext, useContext, useState } from "react";
import en from "./dictionaries/en.json";
import hi from "./dictionaries/hi.json";
import te from "./dictionaries/te.json";

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
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("medguide_lang") as Language;
      if (saved === "en" || saved === "hi" || saved === "te") {
        return saved;
      }
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("medguide_lang", lang);
    }
  };

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
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
