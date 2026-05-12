/**
 * presenceSignals — passive evaluator that proposes a state transition
 * based on user signals (energy, focus, time of day, last activity).
 *
 * Phase 3.2 scaffold. Today this only consults time-of-day as a stand-in;
 * later phases will read live energy + focus + emotion and the AION brain
 * itself will drive most transitions.
 *
 * Returns null when no transition is appropriate. Never forces — the
 * shell shows a single AION whisper line and the user can ignore it.
 */
import type { RoomId } from '@/hallway/types';

export interface SignalSuggestion {
  roomId: RoomId;
  reason: string;
}

export function evaluateSignals(now: Date = new Date()): SignalSuggestion | null {
  const hour = now.getHours();
  // Late-night / pre-sleep window → time room (rest / closure).
  if (hour >= 23 || hour < 5) {
    return { roomId: 'time', reason: 'It is late. Let us close the day.' };
  }
  // Early morning → focus.
  if (hour >= 5 && hour < 9) {
    return { roomId: 'focus', reason: 'A new day. Where is your attention?' };
  }
  return null;
}