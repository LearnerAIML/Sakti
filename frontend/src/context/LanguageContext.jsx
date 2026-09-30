import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations.js';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  isHindi: false,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('sakti_lang') || 'en';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('sakti_lang', newLang);
  };

  const t = (key) => {
    const dict = translations[lang] || translations.en;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return key;
  };

  const isHindi = lang === 'hi';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isHindi }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
