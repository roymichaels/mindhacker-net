import { useThemeSettings } from "@/hooks/useThemeSettings";

/**
 * Cinematic environmental ground.
 * Two slow-drifting nebula blobs over the global aion-bg.
 * Dark mode only — light mode keeps the existing flat background.
 */
export default function AtmosphereLayer() {
  const { theme } = useThemeSettings();

  // Respect the user's theme background_effect choice — only render
  // the cinematic atmosphere when the project default is active.
  if (theme.background_effect && theme.background_effect !== "default") return null;

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
          opacity: 0.25,
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