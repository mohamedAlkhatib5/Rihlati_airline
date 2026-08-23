import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { readStorage } from '../shared/lib/storage';
import ar from './locales/ar.json';
import en from './locales/en.json';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
} from './config';

const storedLanguage = readStorage(LANGUAGE_STORAGE_KEY);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: isSupportedLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    // React already escapes interpolated values.
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
