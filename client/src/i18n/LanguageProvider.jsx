import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { writeStorage } from '../shared/lib/storage';
import { LanguageContext } from './LanguageContext';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  getDirection,
  isSupportedLanguage,
} from './config';

/**
 * Keeps the document (`lang`, `dir`), persisted preference and i18next instance
 * in sync, and exposes the current language to the component tree.
 */
export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();

  const language = isSupportedLanguage(i18n.language)
    ? i18n.language
    : DEFAULT_LANGUAGE;
  const direction = getDirection(language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    writeStorage(LANGUAGE_STORAGE_KEY, language);
  }, [language, direction]);

  const changeLanguage = useCallback(
    (code) => {
      if (isSupportedLanguage(code)) i18n.changeLanguage(code);
    },
    [i18n],
  );

  const toggleLanguage = useCallback(() => {
    const index = SUPPORTED_LANGUAGES.findIndex(
      (item) => item.code === language,
    );
    const next = SUPPORTED_LANGUAGES[(index + 1) % SUPPORTED_LANGUAGES.length];
    changeLanguage(next.code);
  }, [changeLanguage, language]);

  const value = useMemo(
    () => ({
      language,
      direction,
      isArabic: direction === 'rtl',
      changeLanguage,
      toggleLanguage,
    }),
    [language, direction, changeLanguage, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
