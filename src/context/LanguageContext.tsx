"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../../locales/en/common.json";
import ta from "../../locales/ta/common.json";

export type Language = "en" | "ta";

interface LanguageContextType {
  t: (key: string) => string;
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Perform client-side retrieval of language preference
    const saved = localStorage.getItem("preferred-language");
    if (saved === "en" || saved === "ta") {
      setLanguage(saved);
    }
    setMounted(true);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("preferred-language", lang);
  };

  const t = (key: string): string => {
    const translations = language === "ta" ? ta : en;
    const keys = key.split(".");
    let current: any = translations;

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return key; // Fallback to raw key if not found
      }
    }

    return typeof current === "string" ? current : key;
  };

  // Avoid hydration layout flickers by rendering children normally
  return (
    <LanguageContext.Provider value={{ t, language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
