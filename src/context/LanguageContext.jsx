import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('rihlati-language') || 'en');
  const isArabic = language === 'ar';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    localStorage.setItem('rihlati-language', language);
  }, [language, isArabic]);

  const value = useMemo(() => ({
    language,
    isArabic,
    toggleLanguage: () => setLanguage((current) => (current === 'en' ? 'ar' : 'en')),
  }), [language, isArabic]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
