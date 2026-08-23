export const LANGUAGE_STORAGE_KEY = 'rihlati-language';

export const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', dir: 'ltr', label: 'English' },
  { code: 'ar', dir: 'rtl', label: 'العربية' },
];

export const isSupportedLanguage = (code) =>
  SUPPORTED_LANGUAGES.some((language) => language.code === code);

export const getDirection = (code) =>
  SUPPORTED_LANGUAGES.find((language) => language.code === code)?.dir ?? 'ltr';
