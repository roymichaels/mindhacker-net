/**
 * Per-world gesture → verb resolvers.
 *
 * The resolver receives the gesture kind and the world's canonical verb
 * list (from `useWorldAion`). It returns the verb id to fire — or null
 * to let the gesture only affect the field (no graph mutation).
 *
 * Defaults map gestures to verbs by *intent shape*, not name:
 *   dwell      → first verb (typically the contemplative one)
 *   swipe-up   → second verb (lift / amplify)
 *   swipe-down → third verb (release / soften)
 *   swipe-h    → fourth verb (cross / connect)
 *   pulse      → last verb (name / create)
 *
 * Worlds whose verb set has different rhythms override the default.
 */
import type { CognitiveWorldId } from '../types';
import type { GestureKind, GestureVerbResolver, WorldGestureBindings, VerbDescriptor } from './types';

const pick = (verbs: VerbDescriptor[], idx: number): string | null => {
  if (!verbs.length) return null;
  return verbs[Math.min(idx, verbs.length - 1)].id;
};

const findId = (verbs: VerbDescriptor[], ids: string[]): string | null => {
  for (const id of ids) {
    const hit = verbs.find((v) => v.id === id);
    if (hit) return hit.id;
  }
  return null;
};

const defaultResolver: GestureVerbResolver = (kind, verbs) => {
  if (!verbs.length) return null;
  switch (kind) {
    case 'dwell':
      return findId(verbs, ['breathe', 'observe', 'reflect', 'orbit']) ?? pick(verbs, 0);
    case 'swipe-up':
      return findId(verbs, ['amplify', 'reinforce', 'follow', 'realign']) ?? pick(verbs, 1);
    case 'swipe-down':
      return findId(verbs, ['release', 'soften', 'interrupt', 'reset']) ?? pick(verbs, 2);
    case 'swipe-h':
      return findId(verbs, ['connect', 'trace', 'compose', 'meet', 'integrate']) ?? pick(verbs, 3);
    case 'pulse':
      return findId(verbs, ['name', 'unearth', 'inhabit', 'question']) ?? pick(verbs, verbs.length - 1);
    case 'tap':
    default:
      return null;
  }
};

const BINDINGS: WorldGestureBindings = {
  // Emotions: weather. Dwell soothes; swipes redirect; pulse names.
  emotions: (kind, verbs) => {
    if (kind === 'dwell') return findId(verbs, ['breathe', 'soften']) ?? pick(verbs, 0);
    if (kind === 'pulse') return findId(verbs, ['name', 'release']) ?? pick(verbs, verbs.length - 1);
    return defaultResolver(kind, verbs);
  },
  // Habits: orbital. Dwell reinforces; swipe-down interrupts.
  habits: (kind, verbs) => {
    if (kind === 'dwell') return findId(verbs, ['reinforce', 'follow']) ?? pick(verbs, 0);
    if (kind === 'swipe-down') return findId(verbs, ['interrupt', 'reset']) ?? pick(verbs, 1);
    return defaultResolver(kind, verbs);
  },
  // Memory: dwell traces; swipe-h connects; pulse unearths.
  memory: (kind, verbs) => {
    if (kind === 'dwell') return findId(verbs, ['revisit', 'trace']) ?? pick(verbs, 0);
    if (kind === 'pulse') return findId(verbs, ['unearth']) ?? pick(verbs, verbs.length - 1);
    return defaultResolver(kind, verbs);
  },
  // Higher-self: dwell only. Swipes do nothing. Stillness is the verb.
  higher: (kind, verbs) => {
    if (kind === 'dwell') return findId(verbs, ['breathe', 'inhabit']) ?? pick(verbs, 0);
    if (kind === 'pulse') return findId(verbs, ['integrate']) ?? null;
    return null;
  },
};

export function resolveVerbForGesture(
  worldId: CognitiveWorldId,
  kind: GestureKind,
  verbs: VerbDescriptor[],
): string | null {
  const resolver = BINDINGS[worldId] ?? defaultResolver;
  return resolver(kind, verbs);
}
