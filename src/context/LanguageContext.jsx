import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES, getTranslation } from '../utils/i18n';

const LanguageContext = createContext(null);
const LANG_STORAGE_KEY = 'rideflow_selected_language';

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved && TRANSLATIONS[saved] ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const changeLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setCurrentLang(langCode);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, langCode);
      } catch {}
    }
  };

  const t = (key) => {
    return getTranslation(currentLang, key);
  };

  const currentLanguageMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageMeta,
        changeLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
