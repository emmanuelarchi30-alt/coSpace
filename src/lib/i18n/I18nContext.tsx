'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    // Leer idioma guardado en el navegador o preferencia del sistema operativo
    const stored = localStorage.getItem('cospace_lang') as Language | null;
    if (stored === 'es' || stored === 'en') {
      setLanguageState(stored);
    } else {
      const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
      setLanguageState(browserLang);
    }
  }, []);

  const setLanguage = (lang: Language): void => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cospace_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.es;
    return langDict[key] ?? fallback ?? key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
