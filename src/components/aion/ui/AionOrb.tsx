import { cn } from "@/lib/utils";
import aionOrb from "@/assets/aion-ring.png";

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
  glow?: boolean;
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
  glow = true,
  className,
  onClick,
  ariaLabel,
}: AionOrbProps) {
  const { box, px } = SIZE[size];
  const Comp: any = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        breathing && "animate-aion-breath",
        onClick && "transition active:scale-95",
        className,
      )}
    >
      {glow && (
        <span aria-hidden className="absolute inset-0 -z-0 rounded-full dark:aion-glow-soft" />
      )}
      <img
        src={aionOrb}
        alt=""
        width={px}
        height={px}
        draggable={false}
        className={cn("relative block object-contain", box)}
      />
    </Comp>
  );
}

export default AionOrb;