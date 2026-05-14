import { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface AionBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * AionBottomSheet — cinematic bottom sheet primitive.
 * Wraps shadcn Sheet with atmo-surface styling, drag-handle, RTL, safe-area.
 */
export function AionBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: AionBottomSheetProps) {
  const { isRTL } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          "atmo-surface rounded-t-3xl border-0 pb-[max(env(safe-area-inset-bottom),1rem)]",
          "data-[state=open]:animate-aion-emerge",
          className,
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        {(title || description) && (
          <SheetHeader className={isRTL ? "text-right" : "text-left"}>
            {title && <SheetTitle className="text-lg">{title}</SheetTitle>}
            {description && (
              <SheetDescription className="aion-text-soft">{description}</SheetDescription>
            )}
          </SheetHeader>
        )}
        <div className="mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export default AionBottomSheet;