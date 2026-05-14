import { useEffect, useMemo } from 'react';
import {
  useManifestationContext,
  type ManifestationPhase,
} from './ManifestationProvider';
import { moodForKind, type AnyManifestationKind, type ManifestationMood } from './moods';

export interface UseAionManifestationResult {
  phase: ManifestationPhase;
  mood: ManifestationMood;
  reducedMotion: boolean;
  /** Trigger graceful dissolve. Caller is still responsible for any data unmount. */
  dissolve: () => void;
}

/**
 * Register an artifact with the manifestation lifecycle. Pass a stable
 * `artifactId` per card. Safe to call when no provider is mounted (returns
 * `stable` instantly).
 */
export function useAionManifestation(
  artifactId: string | undefined,
  kind?: AnyManifestationKind,
): UseAionManifestationResult {
  const ctx = useManifestationContext();

  useEffect(() => {
    if (!ctx || !artifactId) return;
    ctx.register(artifactId, kind ?? 'default');
    return () => {
      // Don't unregister on remount churn — let dissolve drive removal.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifactId]);

  const entry = ctx && artifactId ? ctx.entries.get(artifactId) : undefined;

  return useMemo<UseAionManifestationResult>(() => ({
    phase: entry?.phase ?? 'stable',
    mood: entry?.mood ?? moodForKind(kind),
    reducedMotion: ctx?.reducedMotion ?? false,
    dissolve: () => {
      if (artifactId) ctx?.dissolve(artifactId);
    },
  }), [entry?.phase, entry?.mood, ctx, artifactId, kind]);
}