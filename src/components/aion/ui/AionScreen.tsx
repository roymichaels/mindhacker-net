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
}: AionScreenProps) {
  const { isRTL } = useTranslation();
  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "relative mx-auto flex w-full max-w-screen-md flex-col gap-6 px-4 sm:px-6",
        withHeader && "pt-[calc(env(safe-area-inset-top)+72px)]",
        withDock && "pb-[calc(env(safe-area-inset-bottom)+160px)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default AionScreen;