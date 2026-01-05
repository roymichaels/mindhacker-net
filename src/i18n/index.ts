import { he } from './translations/he';
import { en } from './translations/en';
import type { TranslationKeys } from './translations/he';

export type Language = 'he' | 'en';

const translations: Record<Language, TranslationKeys> = {
  he,
  en,
};

export const getTranslation = (language: Language, key: string): string => {
  const keys = key.split('.');
  let result: unknown = translations[language];

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof result === 'string' ? result : key;
};

export { he, en };
export type { TranslationKeys };
