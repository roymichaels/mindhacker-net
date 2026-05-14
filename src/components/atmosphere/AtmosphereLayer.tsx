import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useAionPresence, type AionPresenceState } from "@/aion/presenceState";

const PRESENCE_TONE: Record<AionPresenceState, { cyan: number; violet: number; magenta: number }> = {
  listening:   { cyan: 1.00, violet: 0.85, magenta: 0.6 },
  noticing:    { cyan: 1.10, violet: 0.90, magenta: 0.7 },
  forming:     { cyan: 1.05, violet: 1.20, magenta: 0.8 },
  manifesting: { cyan: 1.30, violet: 1.30, magenta: 1.0 },
  resting:     { cyan: 0.70, violet: 0.60, magenta: 0.5 },
  evolving:    { cyan: 0.85, violet: 1.40, magenta: 1.30 },
};

/**
 * Cinematic environmental ground.
 * Two slow-drifting nebula blobs over the global aion-bg.
 * Dark mode only — light mode keeps the existing flat background.
 */
export default function AtmosphereLayer() {
  const { theme } = useThemeSettings();
  const presence = useAionPresence();
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const tone = reduce ? PRESENCE_TONE.listening : PRESENCE_TONE[presence];

  // Only render the cinematic atmosphere when no other background effect is active.
  if (theme.background_effect === "matrix_rain" || theme.background_effect === "consciousness_field") return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden hidden dark:block"
    >
      {/* Soft cyan halo top-center */}
      <div
        className="aion-nebula animate-aion-drift-a"
        style={{
          top: "-20%",
          left: "10%",
          width: "70vmax",
          height: "70vmax",
          opacity: tone.cyan,
          transition: 'opacity 800ms ease',
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--aion-cyan) / 0.18), transparent 60%)",
        }}
      />
      {/* Violet bloom bottom-right */}
      <div
        className="aion-nebula animate-aion-drift-b"
        style={{
          bottom: "-30%",
          right: "-10%",
          width: "80vmax",
          height: "80vmax",
          opacity: tone.violet,
          transition: 'opacity 800ms ease',
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--aion-violet) / 0.16), transparent 60%)",
        }}
      />
      {/* Faint magenta accent left */}
      <div
        className="aion-nebula"
        style={{
          top: "30%",
          left: "-15%",
          width: "50vmax",
          height: "50vmax",
          opacity: 0.25 * tone.magenta,
          transition: 'opacity 800ms ease',
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--aion-magenta) / 0.12), transparent 65%)",
        }}
      />
      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 50%, transparent 55%, hsl(230 60% 2% / 0.55) 100%)",
        }}
      />
    </div>
  );
}