import type { EnvironmentState, SignalSnapshot, EnvironmentMode } from '../types';
import { DEFAULT_ENVIRONMENT } from '../types';

/**
 * Fast-tier deterministic rules. Handles ~90% of state transitions
 * client-side without an AI round trip.
 */

const CALM_KEYWORDS = [
  'overwhelm', 'overwhelmed', 'anxious', 'anxiety', 'panic', 'stressed',
  'too much', 'מוצף', 'לחוץ', 'חרדה',
];
const EXECUTE_KEYWORDS = [
  'dominate', "let's go", 'lets go', 'crush', 'execute', 'attack',
  'בוא נדפוק', 'קדימה', 'תוקף',
];
const FOCUS_KEYWORDS = ['focus', 'deep work', 'concentrate', 'מיקוד'];
const REFLECT_KEYWORDS = ['reflect', 'review', 'how did i do', 'סיכום'];
const RECOVER_KEYWORDS = ['tired', 'exhausted', 'broken', 'גמור', 'עייף'];

function matches(text: string, list: string[]): boolean {
  const lower = text.toLowerCase();
  return list.some((k) => lower.includes(k));
}

function modeFromIntent(text?: string): EnvironmentMode | null {
  if (!text) return null;
  if (matches(text, CALM_KEYWORDS)) return 'calm';
  if (matches(text, FOCUS_KEYWORDS)) return 'focus';
  if (matches(text, EXECUTE_KEYWORDS)) return 'execute';
  if (matches(text, REFLECT_KEYWORDS)) return 'reflect';
  if (matches(text, RECOVER_KEYWORDS)) return 'recover';
  return null;
}

function modeFromTime(hour: number): EnvironmentMode {
  if (hour >= 23 || hour < 5) return 'sleep';
  if (hour >= 5 && hour < 9) return 'execute';
  if (hour >= 21) return 'reflect';
  return 'execute';
}

export function evaluateFastTier(signals: SignalSnapshot): EnvironmentState {
  if (signals.userOverrideMode) {
    return composeState(signals.userOverrideMode, signals, 'user override');
  }

  const intentMode = modeFromIntent(signals.lastIntentText);
  if (intentMode) return composeState(intentMode, signals, `intent: "${signals.lastIntentText}"`);

  const timeMode = modeFromTime(signals.localHour);
  return composeState(timeMode, signals, `time-of-day (${signals.localHour}h)`);
}

function composeState(mode: EnvironmentMode, signals: SignalSnapshot, reason: string): EnvironmentState {
  const base = { ...DEFAULT_ENVIRONMENT, source: 'fast-tier' as const, reason, updatedAt: Date.now() };

  switch (mode) {
    case 'calm':
      return {
        ...base,
        mode,
        intensity: 1,
        emotionalTone: 'low',
        cognitiveBudget: 'minimal',
        hidden: ['gamification', 'aurora-dock', 'notifications'],
        orb: { size: 1.4, motion: 'breath', hue: 200, glow: 2 },
      };
    case 'focus':
      return {
        ...base,
        mode,
        intensity: 0,
        cognitiveBudget: 'minimal',
        hidden: ['header', 'nav', 'gamification', 'aurora-dock', 'notifications'],
        orb: { size: 0.4, motion: 'still', hue: 292, glow: 0 },
      };
    case 'recover':
      return {
        ...base,
        mode,
        intensity: 1,
        emotionalTone: 'low',
        cognitiveBudget: 'minimal',
        hidden: ['gamification', 'aurora-dock'],
        orb: { size: 1.4, motion: 'breath', hue: 280, glow: 1 },
      };
    case 'reflect':
      return {
        ...base,
        mode,
        intensity: 2,
        cognitiveBudget: 'normal',
        hidden: ['gamification'],
        orb: { size: 1.0, motion: 'pulse', hue: 270, glow: 1 },
      };
    case 'sleep':
      return {
        ...base,
        mode,
        intensity: 0,
        cognitiveBudget: 'minimal',
        hidden: ['header', 'nav', 'gamification', 'aurora-dock', 'notifications'],
        orb: { size: 0.4, motion: 'breath', hue: 220, glow: 0 },
      };
    case 'social':
      return {
        ...base,
        mode,
        intensity: 3,
        cognitiveBudget: 'expanded',
        orb: { size: 0.7, motion: 'pulse', hue: 320, glow: 1 },
      };
    case 'explore':
      return {
        ...base,
        mode,
        intensity: 2,
        cognitiveBudget: 'normal',
        orb: { size: 0.7, motion: 'pulse', hue: 180, glow: 1 },
      };
    case 'execute':
    default:
      return {
        ...base,
        mode: 'execute',
        intensity: 3,
        cognitiveBudget: 'expanded',
        orb: { size: 1.0, motion: 'kinetic', hue: 30, glow: 1 },
      };
  }
}