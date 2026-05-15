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
import { uzStyle } from '@/universe/depth/zindex';

export interface PlanetHorizonLayerProps {
  /** Slight parallax offset multiplier in [-1, 1]. */
  parallax?: { x: number; y: number };
}

export default function PlanetHorizonLayer({ parallax }: PlanetHorizonLayerProps) {
  const px = parallax?.x ?? 0;
  const py = parallax?.y ?? 0;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ ...uzStyle('structure') }}
    >
      {/* The planet itself — massive disc anchored top-right, mostly out of frame. */}
      <div
        className="absolute rounded-full"
        style={{
          width: '180vh',
          height: '180vh',
          top: '-100vh',
          right: '-65vh',
          transform: `translate(${px * -10}px, ${py * -8}px)`,
          background:
            'radial-gradient(closest-side, hsl(var(--aion-violet) / 0.10) 0%, hsl(var(--aion-violet) / 0.05) 35%, transparent 70%)',
          boxShadow:
            'inset 0 0 200px hsl(var(--aion-violet) / 0.20), inset -60px -40px 180px hsl(var(--aion-cyan) / 0.18)',
          transition: 'transform 1600ms cubic-bezier(0.22,0.61,0.36,1)',
        }}
      />
      {/* Atmospheric rim — thin glow along the planet's terminator. */}
      <div
        className="absolute rounded-full"
        style={{
          width: '180vh',
          height: '180vh',
          top: '-100vh',
          right: '-65vh',
          transform: `translate(${px * -10}px, ${py * -8}px)`,
          border: '2px solid hsl(var(--aion-cyan) / 0.18)',
          boxShadow: '0 0 80px hsl(var(--aion-cyan) / 0.20)',
          transition: 'transform 1600ms cubic-bezier(0.22,0.61,0.36,1)',
        }}
      />
      {/* Surface "city lights" — sparse warm specks on the lower terrain. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55vh]"
        style={{
          opacity: 0.30,
          backgroundImage:
            'radial-gradient(0.8px 0.8px at 12% 70%, hsl(35 90% 70% / 0.85), transparent 60%),' +
            'radial-gradient(0.8px 0.8px at 22% 86%, hsl(28 88% 65% / 0.75), transparent 60%),' +
            'radial-gradient(0.8px 0.8px at 36% 78%, hsl(40 85% 70% / 0.70), transparent 60%),' +
            'radial-gradient(0.8px 0.8px at 48% 92%, hsl(30 90% 65% / 0.85), transparent 60%),' +
            'radial-gradient(0.8px 0.8px at 60% 84%, hsl(38 88% 68% / 0.75), transparent 60%),' +
            'radial-gradient(0.8px 0.8px at 72% 90%, hsl(34 85% 65% / 0.70), transparent 60%),' +
            'radial-gradient(0.8px 0.8px at 84% 78%, hsl(40 92% 70% / 0.85), transparent 60%),' +
            'radial-gradient(0.8px 0.8px at 92% 88%, hsl(28 90% 65% / 0.70), transparent 60%)',
          backgroundSize: '100% 100%',
          maskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 100%)',
        }}
      />
      {/* Ground horizon glow — warm light bleed at the lower band. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[35vh]"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 100%, hsl(var(--aion-magenta) / 0.10) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}