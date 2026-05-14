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

export default function AtmosphereLayer() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ ...zStyle('background'), zIndex: 12 }}
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
      {/* Edge vignette — pulls focus toward center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 50%, transparent 50%, hsl(var(--background) / 0.55) 100%)',
        }}
      />
      {/* Distant glow field A — cyan, slow drift */}
      <div
        className="absolute -top-[12%] -left-[18%] h-[55vh] w-[55vh] rounded-full blur-3xl opacity-[0.18] animate-aion-drift-a"
        style={{
          background:
            'radial-gradient(closest-side, hsl(var(--aion-cyan) / 0.55), transparent 70%)',
        }}
      />
      {/* Distant glow field B — violet, opposite drift */}
      <div
        className="absolute top-[20%] -right-[20%] h-[60vh] w-[60vh] rounded-full blur-3xl opacity-[0.15] animate-aion-drift-b"
        style={{
          background:
            'radial-gradient(closest-side, hsl(var(--aion-violet) / 0.55), transparent 70%)',
        }}
      />
      {/* Faint particle haze */}
      <div
        className="absolute inset-0 opacity-[0.20] mix-blend-screen"
        style={{
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