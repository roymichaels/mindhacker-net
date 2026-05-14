import { useEffect, useRef, useState } from 'react';
import { useManifestationContext } from './ManifestationProvider';
import { MOOD_HSL_VAR, type ManifestationMood } from './moods';

/**
 * Full-screen ambient layer driven by the active artifact mood. Renders:
 *   - ManifestationAura  — soft tinted radial gradient (cross-fades).
 *   - ManifestationPulse — one-shot ring on each new manifestation.
 * Both `pointer-events-none`. Reduced-motion: skip pulse, slow aura fade.
 */
export function ManifestationLayer() {
  const ctx = useManifestationContext();
  const [pulseKey, setPulseKey] = useState(0);
  const [pulseMood, setPulseMood] = useState<ManifestationMood | null>(null);
  const lastPrimary = useRef<string | null>(null);

  // Trigger pulse when primary id changes.
  useEffect(() => {
    if (!ctx) return;
    if (ctx.primaryId && ctx.primaryId !== lastPrimary.current) {
      lastPrimary.current = ctx.primaryId;
      setPulseMood(ctx.primaryMood);
      setPulseKey((k) => k + 1);
    }
    if (!ctx.primaryId) lastPrimary.current = null;
  }, [ctx?.primaryId, ctx?.primaryMood, ctx]);

  if (!ctx) return null;
  const auraVar = ctx.primaryMood
    ? MOOD_HSL_VAR[ctx.primaryMood]
    : null;
  const auraOpacity = ctx.primaryMood ? 1 : 0;

  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 25 }}>
      {/* Aura — radial tint anchored top-center, very subtle. */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
        style={{
          opacity: auraOpacity,
          background: auraVar
            ? `radial-gradient(80% 55% at 50% 18%, hsl(var(${auraVar}) / 0.10) 0%, hsl(var(${auraVar}) / 0.04) 35%, transparent 70%)`
            : 'transparent',
        }}
      />
      {/* Pulse — one-shot ring near the orb (top center). */}
      {pulseMood && !ctx.reducedMotion && (
        <div
          key={pulseKey}
          aria-hidden
          className="absolute left-1/2 top-[68px] -translate-x-1/2"
        >
          <span
            className="block aion-manifest-pulse rounded-full"
            style={{
              width: 24,
              height: 24,
              background: `radial-gradient(closest-side, hsl(var(${MOOD_HSL_VAR[pulseMood]}) / 0.55), transparent 70%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ManifestationLayer;