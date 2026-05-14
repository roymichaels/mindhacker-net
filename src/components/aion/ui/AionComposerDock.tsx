import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AionComposerDockProps {
  children: ReactNode;
  className?: string;
}

/**
 * AionComposerDock — floating wrapper for the global composer.
 * Centers content, applies safe-area, no chrome of its own.
 */
export function AionComposerDock({ children, className }: AionComposerDockProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 px-3 flex justify-center",
        className,
      )}
      style={{ bottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div className="pointer-events-auto w-full max-w-screen-md">{children}</div>
    </div>
  );
}

export default AionComposerDock;