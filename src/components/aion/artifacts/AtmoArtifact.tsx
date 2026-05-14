import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAionManifestation } from "@/components/aion/manifestation";

export type AtmoArtifactKind = "default" | "read" | "plan" | "confirm" | "warn";

const GLOW: Record<AtmoArtifactKind, string> = {
  default: "aion-glow-soft",
  read:    "aion-glow-cyan",
  plan:    "aion-glow-violet",
  confirm: "aion-glow-magenta",
  warn:    "shadow-[0_0_28px_hsl(var(--accent)/0.35),0_0_80px_hsl(var(--accent)/0.18)]",
};

interface AtmoArtifactProps {
  kind?: AtmoArtifactKind;
  className?: string;
  children: ReactNode;
  /** Slow breathing halo — use for sticky/important artifacts (confirmations). */
  breathing?: boolean;
  /** Optional title rendered above content. */
  title?: ReactNode;
  /** Optional micro source row anchored at the bottom. */
  source?: ReactNode;
  /** Opt-in manifestation lifecycle. Provide a stable id per card. */
  artifactId?: string;
}

/**
 * Cinematic artifact shell. Borderless, kind-tinted glow, emerge entrance.
 * Intended as the universal wrapper for any AION-summoned artifact card.
 */
export function AtmoArtifact({
  kind = "default",
  className,
  children,
  breathing = false,
  title,
  source,
  artifactId,
}: AtmoArtifactProps) {
  const { phase, reducedMotion } = useAionManifestation(artifactId, kind);
  const lifecycleClass = artifactId
    ? phase === "manifesting"
      ? reducedMotion ? "aion-manifest-reduced-in" : "aion-manifest-in"
      : phase === "dissolving"
      ? reducedMotion ? "aion-manifest-reduced-out" : "aion-manifest-out"
      : ""
    : "animate-aion-emerge";
  return (
    <div
      className={cn(
        "atmo-surface relative",
        lifecycleClass,
        GLOW[kind],
        breathing && "animate-aion-breath",
        "p-5 sm:p-6",
        className,
      )}
    >
      {title && (
        <div className="mb-4 text-sm font-semibold tracking-wide text-foreground/90">
          {title}
        </div>
      )}
      <div className="relative">{children}</div>
      {source && (
        <div className="mt-5 pt-4">
          <div className="atmo-divider mb-3" />
          <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/40">
            {source}
          </div>
        </div>
      )}
    </div>
  );
}

export default AtmoArtifact;