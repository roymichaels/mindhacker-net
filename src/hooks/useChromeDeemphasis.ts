/**
 * useChromeDeemphasis — Phase 5D.1.
 *
 * Returns an opacity multiplier for ambient chrome (nav dock, top bar)
 * based on the active ViewIdentity. Surfaces marked as "world-first"
 * dim chrome; surfaces that need explicit guidance keep it at 1.
 *
 * Pure derivation; no state, no listeners. Components decide how to
 * apply it (CSS opacity, transitions, hit area).
 */
import { useActiveViewIdentity } from '@/viewIdentity';

/** Per-view chrome weight. 1 = full chrome, 0 = invisible. */
const CHROME_WEIGHT: Record<string, number> = {
  chat: 1.0,
  brain: 0.9,
  journey: 0.85,
  world: 0.55,
  profile: 0.95,
  interactive: 0.0,
};

export function useChromeDeemphasis(): { weight: number; muted: boolean } {
  const view = useActiveViewIdentity();
  const weight = CHROME_WEIGHT[view.id] ?? 1.0;
  return { weight, muted: weight < 0.7 };
}