/**
 * Cycles through orb presets with smooth morphing via requestAnimationFrame.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { OrbProfile } from '@/components/orb/types';
import { interpolateOrbProfiles } from '@/lib/orbProfileGenerator';
import { ORB_PRESETS } from '@/lib/orbPresets';
import type { OrbPreset } from '@/lib/orbPresets';

interface UseOrbPresetMorphOptions {
  presets?: OrbPreset[];
  durationMs?: number;
  holdMs?: number;
  startIndex?: number;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function useOrbPresetMorph({
  presets = ORB_PRESETS,
  durationMs = 2500,
  holdMs = 600,
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
        // During hold, profile stays as the current preset (already set)
        return;
      }

      // Morph phase
      const rawT = Math.min(elapsed / durationMs, 1);
      const t = smoothstep(rawT);

      const from = presets[s.fromIndex].profile;
      const to = presets[s.toIndex].profile;
      const interpolated = interpolateOrbProfiles(from, to, t);

      // Snap geometry only at t=1
      if (t < 1) {
        interpolated.geometryFamily = from.geometryFamily;
      }

      setProfile(interpolated);

      if (rawT >= 1) {
        // Transition complete — advance
        s.fromIndex = s.toIndex;
        s.toIndex = (s.toIndex + 1) % count;
        s.phase = 'hold';
        s.phaseStart = now;
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
