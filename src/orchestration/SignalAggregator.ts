import type { SignalSnapshot } from './types';

function computeDayPhase(hour: number): SignalSnapshot['dayPhase'] {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'work';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'night';
}

/**
 * Build a fresh signal snapshot from local context.
 * Currently temporal-only; richer signals (energy, open loops, sentiment)
 * are wired in later phases via dedicated hooks.
 */
export function buildSignalSnapshot(partial: Partial<SignalSnapshot> = {}): SignalSnapshot {
  const now = new Date();
  const localHour = now.getHours();
  return {
    localHour,
    dayPhase: computeDayPhase(localHour),
    openLoops: 0,
    ...partial,
  };
}