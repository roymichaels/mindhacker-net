/**
 * pickLang — minimal language switch for inline copy.
 * Spanish falls back to English when no Spanish string is provided,
 * so adopting this helper is non-breaking for existing he/en pairs.
 */
import type { Language } from '@/i18n';

export function pickLang<T>(lang: Language, m: { he: T; en: T; es?: T }): T {
  if (lang === 'he') return m.he;
  if (lang === 'es') return m.es ?? m.en;
  return m.en;
}

export const LANGUAGE_LABEL: Record<Language, string> = {
  he: 'Hebrew',
  en: 'English',
  es: 'Spanish',
};

export const LANGUAGE_NATIVE_LABEL: Record<Language, string> = {
  he: 'עברית',
  en: 'English',
  es: 'Español',
};

export const LANGUAGE_FLAG: Record<Language, string> = {
  he: '🇮🇱',
  en: '🇺🇸',
  es: '🇪🇸',
};