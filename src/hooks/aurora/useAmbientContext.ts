/**
 * useAmbientContext — derives the three ambient lines shown on the
 * collapsed `/aurora` home: { understanding, focus, nextStep }.
 *
 * Sources are intentionally simple and reuse what we already compute:
 *   - understanding ← AION decision reasoning / mode
 *   - focus         ← top smart-suggestion text (or current milestone)
 *   - nextStep      ← top send_message suggestion (or graceful fallback)
 *
 * Tapping a line in the UI sends `prompt` to AION (when present); lines
 * without a prompt are display-only.
 */
import { useMemo } from 'react';
import { useAionDecision } from '@/contexts/AionDecisionContext';
import { useSmartSuggestions } from './useSmartSuggestions';
import { useTranslation } from '@/hooks/useTranslation';
import { pickLang } from '@/lib/i18nPick';

export interface AmbientLine {
  text: string;
  /** If present, tapping this line sends `prompt` to AION. */
  prompt?: string;
}

export interface AmbientContext {
  understanding: AmbientLine | null;
  focus: AmbientLine | null;
  nextStep: AmbientLine | null;
  isLoading: boolean;
}

export function useAmbientContext(): AmbientContext {
  const { decision } = useAionDecision();
  const { suggestions, isLoading } = useSmartSuggestions();
  const { language } = useTranslation();

  return useMemo(() => {
    // Understanding: derive a soft summary from AION's current mode/reasoning.
    const reasoning = decision?.reasoning?.trim();
    const understanding: AmbientLine | null = reasoning
      ? { text: reasoning.length > 140 ? reasoning.slice(0, 138) + '…' : reasoning }
      : decision?.mode
        ? {
            text: pickLang(language, {
              he: `המצב הנוכחי שלך מרגיש ${MODE_HE[decision.mode] ?? decision.mode}.`,
              en: `Your current state feels ${decision.mode}.`,
              es: `Tu estado actual se siente ${MODE_ES[decision.mode] ?? decision.mode}.`,
            }),
          }
        : null;

    // Focus: first non-message suggestion (a thread / milestone / habit).
    const focusSugg = suggestions.find((s) => s.action.type !== 'send_message');
    const focus: AmbientLine | null = focusSugg
      ? { text: focusSugg.text }
      : null;

    // Next step: first send_message suggestion, falls back to a gentle prompt.
    const nextSugg = suggestions.find((s) => s.action.type === 'send_message');
    const nextStep: AmbientLine | null = nextSugg && nextSugg.action.type === 'send_message'
      ? { text: nextSugg.text, prompt: nextSugg.action.prompt }
      : !isLoading
        ? {
            text: pickLang(language, {
              he: 'מה ברצונך שנעשה עכשיו?',
              en: 'What shall we do right now?',
              es: '¿Qué hacemos ahora mismo?',
            }),
            prompt: pickLang(language, {
              he: 'מה הכי חשוב לי לעשות עכשיו?',
              en: 'What matters most for me to do right now?',
              es: '¿Qué es lo más importante que debo hacer ahora?',
            }),
          }
        : null;

    return { understanding, focus, nextStep, isLoading };
  }, [decision, suggestions, isLoading, language]);
}

const MODE_HE: Record<string, string> = {
  flow: 'בזרימה',
  focus: 'ממוקד',
  recovery: 'בהתאוששות',
  overwhelmed: 'עמוס',
  hypnosis: 'מופנם',
  calm: 'רגוע',
  neutral: 'מאוזן',
};

const MODE_ES: Record<string, string> = {
  flow: 'en flujo',
  focus: 'enfocado',
  recovery: 'en recuperación',
  overwhelmed: 'abrumado',
  hypnosis: 'introspectivo',
  calm: 'en calma',
  neutral: 'equilibrado',
};