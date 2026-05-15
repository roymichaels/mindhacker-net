/**
 * PlanetHorizonLayer — Phase 5D.1.
 *
 * Pure-CSS distant planet horizon: a single huge curved mass anchored
 * top-right with a soft rim light. No 3D, no asset, no parallax cost.
 * Tints itself from the active world atmosphere preset.
 *
 * Lives at depth `structure` so it sits below anchor pins but above
 * cosmos/haze.
 */
/**
 * PlanetHorizonLayer — Phase 5D.1B.
 *
 * Wide planetary **arc** spanning the upper viewport. Three independent
 * parallax-aware sublayers:
 *
 *   1. body   — dark mass, only the lower curve enters the frame
 *   2. rim    — bright terminator hairline + bloom (slower parallax)
 *   3. lights — warm city-light specks clipped to the planet body
 *
 * Above the rim sits a thin atmospheric scatter band; below the curve
 * sits a warm horizon bleed that hands off to the terrain valley.
 */
import { uzStyle } from '@/universe/depth/zindex';

export interface PlanetHorizonLayerProps {
  /** Body parallax (slowest plane). */
  parallaxBody?: { x: number; y: number };
  /** Rim parallax (slightly faster than body). */
  parallaxRim?: { x: number; y: number };
}

/**
 * Geometry: a 260vw circle whose CENTER sits ~210vw below the top edge,
 * so only the upper crown of the disc rises into the top ~40% of the
 * viewport. This produces the wide horizon arc seen in the reference.
 */
const ARC_SIZE = 260; // vw
const ARC_TOP = 12; // vh — top edge of disc bbox sits below the screen top
const ARC_LEFT = -80; // vw — center the disc horizontally

export default function PlanetHorizonLayer({
  parallaxBody,
  parallaxRim,
}: PlanetHorizonLayerProps) {
  const bx = parallaxBody?.x ?? 0;
  const by = parallaxBody?.y ?? 0;
  const rx = parallaxRim?.x ?? 0;
  const ry = parallaxRim?.y ?? 0;

  const arcStyle = {
    width: `${ARC_SIZE}vw`,
    height: `${ARC_SIZE}vw`,
    top: `${ARC_TOP}vh`,
    left: `${ARC_LEFT}vw`,
  } as const;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ ...uzStyle('structure') }}
    >
      {/* Atmospheric scatter band — sits ABOVE the rim, fades into space. */}
      <div
        className="absolute inset-x-0 top-0 h-[40vh]"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 100%, hsl(var(--aion-cyan) / 0.10) 0%, hsl(var(--aion-violet) / 0.05) 40%, transparent 75%)',
        }}
      />

      {/* Planet body — slowest plane. */}
      <div
        className="absolute rounded-full"
        style={{
          ...arcStyle,
          transform: `translate(${bx * -6}px, ${by * -4}px)`,
          background:
            'radial-gradient(closest-side, hsl(240 35% 6% / 0.95) 0%, hsl(258 40% 9% / 0.92) 55%, hsl(var(--aion-violet) / 0.08) 78%, transparent 92%)',
          boxShadow:
            'inset 0 -60px 220px hsl(var(--aion-violet) / 0.18), inset 60px 40px 220px hsl(var(--aion-cyan) / 0.10)',
          transition: 'transform 1800ms cubic-bezier(0.22,0.61,0.36,1)',
        }}
      />

      {/* Surface city-light field — clipped to body via radial mask. */}
      <div
        className="absolute rounded-full"
        style={{
          ...arcStyle,
          transform: `translate(${bx * -6}px, ${by * -4}px)`,
          opacity: 0.55,
          backgroundImage:
            'radial-gradient(0.6px 0.6px at 22% 12%, hsl(35 90% 70% / 0.90), transparent 60%),' +
            'radial-gradient(0.6px 0.6px at 28% 16%, hsl(28 88% 65% / 0.75), transparent 60%),' +
            'radial-gradient(0.6px 0.6px at 36% 10%, hsl(40 85% 70% / 0.85), transparent 60%),' +
            'radial-gradient(0.6px 0.6px at 44% 18%, hsl(30 90% 65% / 0.70), transparent 60%),' +
            'radial-gradient(0.6px 0.6px at 50% 11%, hsl(38 88% 68% / 0.80), transparent 60%),' +
            'radial-gradient(0.6px 0.6px at 56% 14%, hsl(34 85% 65% / 0.70), transparent 60%),' +
            'radial-gradient(0.6px 0.6px at 62% 9%,  hsl(40 92% 70% / 0.85), transparent 60%),' +
            'radial-gradient(0.6px 0.6px at 68% 17%, hsl(28 90% 65% / 0.70), transparent 60%),' +
            'radial-gradient(0.6px 0.6px at 74% 12%, hsl(35 90% 70% / 0.85), transparent 60%),' +
            'radial-gradient(0.6px 0.6px at 80% 16%, hsl(38 88% 68% / 0.75), transparent 60%)',
          // Mask to the upper crown of the disc (where it shows on screen).
          maskImage:
            'radial-gradient(closest-side, black 70%, transparent 90%)',
          WebkitMaskImage:
            'radial-gradient(closest-side, black 70%, transparent 90%)',
        }}
      />

      {/* Rim terminator — bright hairline + outer bloom. */}
      <div
        className="absolute rounded-full"
        style={{
          ...arcStyle,
          transform: `translate(${rx * -10}px, ${ry * -7}px)`,
          border: '1px solid hsl(var(--aion-cyan) / 0.55)',
          boxShadow:
            '0 0 24px hsl(var(--aion-cyan) / 0.35), 0 0 90px hsl(var(--aion-violet) / 0.22)',
          transition: 'transform 1800ms cubic-bezier(0.22,0.61,0.36,1)',
        }}
      />

      {/* Warm horizon bleed — hands off to the terrain valley. */}
      <div
        className="absolute inset-x-0"
        style={{
          top: '34vh',
          height: '18vh',
          background:
            'radial-gradient(120% 100% at 50% 0%, hsl(var(--aion-magenta) / 0.14) 0%, hsl(var(--aion-violet) / 0.06) 45%, transparent 80%)',
        }}
      />
    </div>
  );
}