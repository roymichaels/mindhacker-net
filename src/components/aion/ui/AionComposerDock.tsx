import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useChamberIdle } from "@/shellv2/hooks/useChamberIdle";

interface AionComposerDockProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * AionComposerDock — floating wrapper for the global composer.
 * Centers content, applies safe-area, no chrome of its own.
 */
export function AionComposerDock({ children, className, style }: AionComposerDockProps) {
  const { composerState } = useChamberIdle();
  const isIdle = composerState === 'idle';
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 px-3 flex justify-center",
        className,
      )}
      style={{ bottom: "max(env(safe-area-inset-bottom), 14px)", ...style }}
      data-composer-state={composerState}
    >
      <div className="relative pointer-events-auto w-full max-w-screen-md">
        {/* Soft environmental underglow — composer hovers like a holographic dock */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-6 -bottom-6 h-24 -z-10 transition-opacity duration-700",
            isIdle ? "opacity-40" : "opacity-100",
          )}
          style={{
            background:
              "radial-gradient(60% 100% at 50% 100%, hsl(var(--aion-violet) / 0.22) 0%, hsl(var(--aion-cyan) / 0.08) 40%, transparent 75%)",
            filter: "blur(14px)",
          }}
        />
        {children}
      </div>
    </div>
  );
}

export default AionComposerDock;