/**
 * Cycles through orb presets with smooth morphing via requestAnimationFrame.
 * Uses smooth HSL color lerping and eased transitions.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { OrbProfile } from '@/components/orb/types';
import { interpolateOrbProfiles } from '@/lib/orbProfileGenerator';
import { ORB_PRESETS } from '@/lib/orbPresets';
import type { OrbPreset } from '@/lib/orbPresets';

interface UseOrbPresetMorphOptions {
  presets?: OrbPreset[];
  /** Duration of each morph transition in ms */
  durationMs?: number;
  /** How long to hold a preset before morphing to next */
  holdMs?: number;
  /** Starting preset index offset (so multiple orbs desync) */
  startIndex?: number;
}

/** Attempt smoother easing than basic smoothstep */
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useOrbPresetMorph({
  presets = ORB_PRESETS,
  durationMs = 3500,
  holdMs = 1200,
  startIndex = 0,
}: UseOrbPresetMorphOptions = {}): OrbProfile {
  const count = presets.length;
  const [profile, setProfile] = useState<OrbProfile>(
    () => presets[startIndex % count].profile
  );

  const stateRef = useRef({
    fromIndex: startIndex % count,
    toIndex: (startIndex + 1) % count,
    phase: 'hold' as 'morph' | 'hold',
    phaseStart: 0,
  });

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.phaseStart === 0) {
        s.phaseStart = now;
      }

      const elapsed = now - s.phaseStart;

      if (s.phase === 'hold') {
        if (elapsed >= holdMs) {
          s.phase = 'morph';
          s.phaseStart = now;
        }
        return;
      }

      // Morph phase
      const rawT = Math.min(elapsed / durationMs, 1);
      const t = easeInOutCubic(rawT);

      const from = presets[s.fromIndex].profile;
      const to = presets[s.toIndex].profile;
      const interpolated = interpolateOrbProfiles(from, to, t);

      setProfile(interpolated);

      if (rawT >= 1) {
        // Transition complete — advance indices
        s.fromIndex = s.toIndex;
        s.toIndex = (s.toIndex + 1) % count;
        s.phase = 'hold';
        s.phaseStart = now;
        // Set final profile exactly to avoid drift
        setProfile({ ...presets[s.fromIndex].profile });
      }
    },
    [presets, count, durationMs, holdMs]
  );

  useEffect(() => {
    let raf: number;
    const loop = (now: number) => {
      tick(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick]);

  return profile;
}
