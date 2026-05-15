/**
 * CosmosLayer — Phase 5D.1.
 *
 * Far-cosmos backdrop: deep radial nebula + ultra-faint star field.
 * Pure CSS, almost still. Drift rate honours `--view-drift` published
 * by `AtmosphereLayer` (per-view ViewIdentity).
 *
 * Lives behind the orb canvas; pointer-events are off; respects
 * reduced-motion.
 */
import { uzStyle } from './zindex';

export default function CosmosLayer() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ ...uzStyle('cosmos') }}
    >
      {/* Deep nebula — two enormous radial gradients, opposing corners. */}
      <div
        className="absolute -top-[20%] -left-[20%] h-[120vh] w-[120vh] rounded-full blur-3xl"
        style={{
          opacity: 0.45,
          background:
            'radial-gradient(closest-side, hsl(var(--aion-violet) / 0.22), hsl(var(--aion-violet) / 0.06) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-[25%] -right-[20%] h-[130vh] w-[130vh] rounded-full blur-3xl"
        style={{
          opacity: 0.40,
          background:
            'radial-gradient(closest-side, hsl(var(--aion-cyan) / 0.18), hsl(var(--aion-cyan) / 0.04) 45%, transparent 72%)',
        }}
      />
      {/* Far-star field — tiny radial dots, sparse, near-still. */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          opacity: 0.55,
          backgroundImage:
            'radial-gradient(0.5px 0.5px at 8% 12%, hsl(var(--foreground) / 0.65), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 24% 30%, hsl(var(--foreground) / 0.55), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 41% 8%,  hsl(var(--foreground) / 0.50), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 57% 22%, hsl(var(--foreground) / 0.60), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 72% 14%, hsl(var(--foreground) / 0.45), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 88% 28%, hsl(var(--foreground) / 0.55), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 14% 52%, hsl(var(--foreground) / 0.45), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 33% 68%, hsl(var(--foreground) / 0.50), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 49% 78%, hsl(var(--foreground) / 0.45), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 66% 60%, hsl(var(--foreground) / 0.55), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 81% 84%, hsl(var(--foreground) / 0.50), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 92% 70%, hsl(var(--foreground) / 0.45), transparent 60%)',
          backgroundSize: '100% 100%',
        }}
      />
      {/* Slow drift overlay — repeats the star field offset, animated very slowly. */}
      <div
        className="absolute inset-0 mix-blend-screen animate-aion-drift-a"
        style={{
          opacity: 0.20,
          animationDuration: 'calc(180s / var(--view-drift, 1))',
          backgroundImage:
            'radial-gradient(0.5px 0.5px at 18% 22%, hsl(var(--foreground) / 0.40), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 64% 38%, hsl(var(--foreground) / 0.40), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 38% 86%, hsl(var(--foreground) / 0.35), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 78% 64%, hsl(var(--foreground) / 0.35), transparent 60%)',
          backgroundSize: '100% 100%',
        }}
      />
    </div>
  );
}