import { he } from './translations/he';
import { en } from './translations/en';
import { es } from './translations/es';
import type { TranslationKeys } from './translations/he';

export type Language = 'he' | 'en' | 'es';

const translations: Record<Language, TranslationKeys> = {
  he,
  en,
  es,
};

export const getTranslation = (language: Language, key: string): string => {
  const keys = key.split('.');

  const resolve = (root: unknown): string | null => {
    let result: unknown = root;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return null;
      }
    }
    return typeof result === 'string' ? result : null;
  };

  const primary = resolve(translations[language]);
  if (primary !== null) return primary;

  // Fallback chain: requested language → English → Hebrew → key
  if (language !== 'en') {
    const enFallback = resolve(translations.en);
    if (enFallback !== null) return enFallback;
  }
  if (language !== 'he') {
    const heFallback = resolve(translations.he);
    if (heFallback !== null) return heFallback;
  }
  console.warn(`Translation key not found: ${key}`);
  return key;
};

export { he, en, es };
export type { TranslationKeys };
