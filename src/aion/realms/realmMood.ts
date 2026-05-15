/**
 * realmMood — Phase 5N.2.
 *
 * Single source of truth for the mood contract of each canonical realm.
 * Read-only constant table. Consumed by:
 *   - RealmTransitionLayer (veil hue)
 *   - useOrbPresenceBehaviour (default presence on arrival)
 *   - WorldAtmosphere (intensity bias)
 *   - AionNavDock (resonance floor)
 *
 * No backend, no provider, no runtime mutation.
 */
import type { CanonicalSurfaceId } from '@/navigation/canonicalSurfaces';
import type { OrbBehaviorState } from '@/aion/presence/orbBehavior';

export type TransitionTone = 'cool' | 'warm' | 'deep' | 'soft';
export type RealmInteraction = 'speak' | 'explore' | 'follow' | 'traverse' | 'resonate';

export interface RealmMood {
  id: CanonicalSurfaceId;
  /** HSL color tokens, ready for `hsl(var(--token))` or raw hsl strings. */
  hue: { primary: string; accent: string };
  /** Default orb behaviour after a transition into this realm settles. */
  presence: OrbBehaviorState;
  /** Atmospheric weight, 0..1. */
  atmosphereIntensity: number;
  /** Glyph energy floor for this realm's nav anchor, 0..1. */
  navResonance: number;
  transitionTone: TransitionTone;
  interaction: RealmInteraction;
}

/** Raw hsl strings (no var indirection) so the transition veil can compose them directly. */
export const REALM_MOOD: Record<CanonicalSurfaceId, RealmMood> = {
  chat: {
    id: 'chat',
    hue: { primary: '198 80% 56%', accent: '218 70% 30%' },
    presence: 'listening',
    atmosphereIntensity: 0.45,
    navResonance: 0.65,
    transitionTone: 'soft',
    interaction: 'speak',
  },
  brain: {
    id: 'brain',
    hue: { primary: '258 70% 60%', accent: '278 65% 45%' },
    presence: 'noticing',
    atmosphereIntensity: 0.6,
    navResonance: 0.6,
    transitionTone: 'deep',
    interaction: 'explore',
  },
  journey: {
    id: 'journey',
    hue: { primary: '188 78% 55%', accent: '42 90% 60%' },
    presence: 'guiding',
    atmosphereIntensity: 0.55,
    navResonance: 0.7,
    transitionTone: 'warm',
    interaction: 'follow',
  },
  'outer-world': {
    id: 'outer-world',
    hue: { primary: '178 70% 45%', accent: '38 80% 55%' },
    presence: 'resonating',
    atmosphereIntensity: 0.7,
    navResonance: 0.6,
    transitionTone: 'deep',
    interaction: 'traverse',
  },
  profile: {
    id: 'profile',
    hue: { primary: '292 75% 60%', accent: '320 70% 60%' },
    presence: 'evolving',
    atmosphereIntensity: 0.5,
    navResonance: 0.65,
    transitionTone: 'soft',
    interaction: 'resonate',
  },
};

/** Resolve mood by path (canonical surface path). */
export function moodForPath(pathname: string): RealmMood | null {
  const map: Record<string, CanonicalSurfaceId> = {
    '/': 'chat',
    '/brain': 'brain',
    '/journey': 'journey',
    '/outer-world': 'outer-world',
    '/profile': 'profile',
  };
  const id = map[pathname];
  return id ? REALM_MOOD[id] : null;
}
