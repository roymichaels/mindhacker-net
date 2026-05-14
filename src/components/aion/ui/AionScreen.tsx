import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface AionScreenProps {
  children: ReactNode;
  className?: string;
  /** Reserve space at top for the fixed AionHeader (56px + safe-area). Default true. */
  withHeader?: boolean;
  /** Reserve space at bottom for AionComposerDock + AionNavDock. Default true. */
  withDock?: boolean;
  /**
   * Phase 4A — chamber mode collapses default padding so the surface reads as
   * one continuous breathing space rather than a routed page. Opt-in for now;
   * routes that want the legacy padded look leave this off.
   */
  chamber?: boolean;
}

/**
 * AionScreen — single canonical page wrapper.
 * Handles safe-area, vertical rhythm, max width, RTL direction.
 * Use INSTEAD of bespoke `<div className="min-h-screen ...">` page roots.
 */
export function AionScreen({
  children,
  className,
  withHeader = true,
  withDock = true,
  chamber = false,
}: AionScreenProps) {
  const { isRTL } = useTranslation();
  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "relative mx-auto flex w-full max-w-screen-md flex-col px-4 sm:px-6",
        chamber ? "gap-4" : "gap-6",
        withHeader && (chamber
          ? "pt-[calc(env(safe-area-inset-top)+56px)]"
          : "pt-[calc(env(safe-area-inset-top)+72px)]"),
        withDock && (chamber
          ? "pb-[calc(env(safe-area-inset-bottom)+128px)]"
          : "pb-[calc(env(safe-area-inset-bottom)+160px)]"),
        className,
      )}
    >
      {children}
    </div>
  );
}

export default AionScreen;