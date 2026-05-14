import { cn } from "@/lib/utils";
import CanonicalAionModel from "@/components/orb/CanonicalAionModel";

type Size = "xs" | "sm" | "md" | "lg";

const SIZE: Record<Size, { box: string; px: number }> = {
  xs: { box: "h-6 w-6",   px: 24 },
  sm: { box: "h-8 w-8",   px: 32 },
  md: { box: "h-12 w-12", px: 48 },
  lg: { box: "h-20 w-20", px: 80 },
};

interface AionOrbProps {
  size?: Size;
  breathing?: boolean;
  /**
   * Halo style behind the orb.
   *  - 'aura' (default): soft radial violet/cyan light, no ring.
   *  - 'ring': legacy box-shadow ring (chips, sheet handles).
   *  - false: no halo at all.
   */
  glow?: boolean | "aura" | "ring";
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

/**
 * AionOrb — small static orb glyph for headers, chips, sheet handles.
 * For the live WebGL orb, keep using SharedOrbStage / OrbView.
 */
export function AionOrb({
  size = "sm",
  breathing = true,
  glow = "aura",
  className,
  onClick,
  ariaLabel,
}: AionOrbProps) {
  const { box, px } = SIZE[size];
  // Back-compat: `glow={true}` → 'aura' (new default), `glow={false}` → none.
  const halo: "aura" | "ring" | false =
    glow === true ? "aura" : glow === false ? false : glow;
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center",
        box,
        breathing && "animate-aion-breath",
        onClick && "transition active:scale-95",
        className,
      )}
    >
      {halo === "aura" && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-2 -z-0"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--aion-violet) / 0.28) 0%, hsl(var(--aion-cyan) / 0.10) 45%, transparent 75%)",
            filter: "blur(2px)",
          }}
        />
      )}
      {halo === "ring" && (
        <span aria-hidden className="absolute inset-0 -z-0 rounded-full dark:aion-glow-soft" />
      )}
      <CanonicalAionModel
        size={px}
        ariaLabel={ariaLabel}
        onClick={onClick}
        className="relative block"
      />
    </span>
  );
}

export default AionOrb;