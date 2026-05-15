/**
 * AtmosphereLayer — environmental depth between the background paint and
 * everything else. Pure CSS, pointer-events-none, no JS animation cost.
 *
 * Builds the "consciousness chamber" feel:
 *   - deep top vignette (sky → void)
 *   - bottom void gradient under the composer
 *   - distant glow fields (one cyan, one violet) that drift slowly
 *   - faint particle haze (single radial repeating mask)
 *   - inner edge vignette (sides darken slightly)
 *
 * 90% darkness, 10% divine light.
 */
import { zStyle } from '../zindex';
import { useAionPresence, type AionPresenceState } from '@/aion/presenceState';
import { useActiveViewIdentity } from '@/viewIdentity';

const PRESENCE_TONE: Record<AionPresenceState, { cyan: number; violet: number; magenta: number }> = {
  listening:   { cyan: 1.00, violet: 0.85, magenta: 0.6 },
  noticing:    { cyan: 1.10, violet: 0.90, magenta: 0.7 },
  forming:     { cyan: 1.05, violet: 1.20, magenta: 0.8 },
  manifesting: { cyan: 1.30, violet: 1.30, magenta: 1.0 },
  resting:     { cyan: 0.70, violet: 0.60, magenta: 0.5 },
  evolving:    { cyan: 0.85, violet: 1.40, magenta: 1.30 },
};

export default function AtmosphereLayer() {
  const presence = useAionPresence();
  const view = useActiveViewIdentity();
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const baseTone = reduce ? PRESENCE_TONE.listening : PRESENCE_TONE[presence];
  // Phase 5C.8 — the active view modulates the chamber. Presence is the
  // pulse, view identity is the room.
  const tone = {
    cyan: baseTone.cyan * view.atmosphere.cyan,
    violet: baseTone.violet * view.atmosphere.violet,
    magenta: baseTone.magenta * view.atmosphere.magenta,
  };
  const driftMul = reduce ? 1 : view.motion.drift;
  const ambient = view.atmosphere.ambient;
  const vignette = view.spatial.vignette;
  const particles = view.atmosphere.particles;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        ...zStyle('background'),
        zIndex: 12,
        ['--presence-cyan' as any]: tone.cyan,
        ['--presence-violet' as any]: tone.violet,
        ['--presence-magenta' as any]: tone.magenta,
        ['--view-drift' as any]: driftMul,
        ['--view-ambient' as any]: ambient,
        ['--view-orb-x' as any]: `${view.spatial.orbX * 100}%`,
        ['--view-orb-y' as any]: `${view.spatial.orbY * 100}%`,
        ['--view-orb-scale' as any]: view.spatial.orbScale,
        opacity: ambient,
        transition: 'opacity 1200ms ease',
      }}
    >
      {/* Deep top vignette — sacred sky fade */}
      <div
        className="absolute inset-x-0 top-0 h-[55vh]"
        style={{
          background:
            'radial-gradient(120% 70% at 50% -10%, hsl(var(--aion-violet) / 0.10) 0%, transparent 55%)',
        }}
      />
      {/* Bottom void — composer floats on near-black */}
      <div
        className="absolute inset-x-0 bottom-0 h-[40vh]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.85) 60%, hsl(var(--background)) 100%)',
        }}
      />
      {/* Edge vignette — pulls focus toward center; intensity = per-view */}
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(120% 80% at 50% 50%, transparent ${50 - vignette * 20}%, hsl(var(--background) / ${0.30 + vignette * 0.45}) 100%)`,
          transition: 'background 1200ms ease',
        }}
      />
      {/* Distant glow field A — cyan, drift varies per view */}
      <div
        className="absolute -top-[12%] -left-[18%] h-[55vh] w-[55vh] rounded-full blur-3xl animate-aion-drift-a"
        style={{
          opacity: 0.18 * tone.cyan,
          background:
            'radial-gradient(closest-side, hsl(var(--aion-cyan) / 0.55), transparent 70%)',
          transition: 'opacity 1200ms ease, animation-duration 1200ms ease',
          animationDuration: `${28 / driftMul}s`,
        }}
      />
      {/* Distant glow field B — violet, opposite drift */}
      <div
        className="absolute top-[20%] -right-[20%] h-[60vh] w-[60vh] rounded-full blur-3xl animate-aion-drift-b"
        style={{
          opacity: 0.15 * tone.violet,
          background:
            'radial-gradient(closest-side, hsl(var(--aion-violet) / 0.55), transparent 70%)',
          transition: 'opacity 1200ms ease',
          animationDuration: `${34 / driftMul}s`,
        }}
      />
      {/* Faint particle haze — density per view */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          opacity: 0.10 + particles * 0.25,
          transition: 'opacity 1200ms ease',
          backgroundImage:
            'radial-gradient(1px 1px at 12% 18%, hsl(var(--foreground) / 0.55), transparent 60%),' +
            'radial-gradient(1px 1px at 78% 32%, hsl(var(--foreground) / 0.45), transparent 60%),' +
            'radial-gradient(1px 1px at 38% 62%, hsl(var(--foreground) / 0.50), transparent 60%),' +
            'radial-gradient(1px 1px at 88% 78%, hsl(var(--foreground) / 0.40), transparent 60%),' +
            'radial-gradient(1px 1px at 22% 86%, hsl(var(--foreground) / 0.45), transparent 60%),' +
            'radial-gradient(1px 1px at 62% 8%,  hsl(var(--foreground) / 0.40), transparent 60%)',
          backgroundSize: '100% 100%',
        }}
      />
    </div>
  );
}