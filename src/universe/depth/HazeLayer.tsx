/**
 * HazeLayer — Phase 5D.1.
 *
 * Atmospheric perspective band that sits between the cosmos and the
 * energy field. Tinted by the active world's primary/secondary HSL
 * (when on a `/worlds/:id` route) or by ViewIdentity tone otherwise.
 *
 * Pure CSS; drift inherits `--view-drift`.
 */
import { useActiveViewIdentity } from '@/viewIdentity';
import { uzStyle } from './zindex';

export default function HazeLayer() {
  const view = useActiveViewIdentity();
  // Map ViewIdentity atmosphere to soft hue weights — pulls more violet
  // for inward modes (profile/chat) and more cyan for outward modes
  // (world/brain). No new tokens, just remixing the existing AION palette.
  const violetW = Math.min(1, view.atmosphere.violet * 0.55);
  const cyanW = Math.min(1, view.atmosphere.cyan * 0.45);
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ ...uzStyle('haze'), opacity: 0.70 }}
    >
      {/* Mid-band fog — soft horizontal swell. */}
      <div
        className="absolute inset-x-[-10%] top-[30%] h-[55vh] blur-3xl"
        style={{
          opacity: violetW,
          background:
            'radial-gradient(60% 100% at 50% 50%, hsl(var(--aion-violet) / 0.18), transparent 70%)',
          transition: 'opacity 1600ms ease',
        }}
      />
      <div
        className="absolute inset-x-[-10%] top-[12%] h-[45vh] blur-3xl"
        style={{
          opacity: cyanW,
          background:
            'radial-gradient(60% 100% at 50% 50%, hsl(var(--aion-cyan) / 0.14), transparent 72%)',
          transition: 'opacity 1600ms ease',
        }}
      />
      {/* Bottom haze — pulls the composer area into the field. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[35vh]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.35) 60%, hsl(var(--background) / 0.55) 100%)',
        }}
      />
    </div>
  );
}