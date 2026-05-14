import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AionSurfaceTone = "default" | "cyan" | "violet" | "gold" | "magenta";

const TONE: Record<AionSurfaceTone, string> = {
  default: "aion-glow-soft",
  cyan:    "aion-glow-cyan",
  violet:  "aion-glow-violet",
  gold:    "aion-glow-gold",
  magenta: "aion-glow-magenta",
};

interface AionSurfaceProps {
  children: ReactNode;
  className?: string;
  tone?: AionSurfaceTone;
  /** Use the stronger surface variant for hero/portal cards. */
  strong?: boolean;
  /** Slow breath halo — for important / sticky surfaces. */
  breathing?: boolean;
  /** Emerge entrance anim. Default true. */
  emerge?: boolean;
  onClick?: () => void;
}

/**
 * AionSurface — borderless cinematic card.
 * Replaces shadcn `<Card>` chrome on AION-native screens.
 */
export function AionSurface({
  children,
  className,
  tone = "default",
  strong = false,
  breathing = false,
  emerge = true,
  onClick,
}: AionSurfaceProps) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        strong ? "aion-surface-strong" : "atmo-surface",
        TONE[tone],
        emerge && "animate-aion-emerge",
        breathing && "animate-aion-breath",
        "p-5 sm:p-6 text-start",
        onClick && "transition active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export default AionSurface;