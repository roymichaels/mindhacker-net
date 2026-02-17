/**
 * ActivationProgress — Minimal 10-segment progress bar
 * Clean thin line, no labels, no dots
 */
import { cn } from '@/lib/utils';

interface ActivationProgressProps {
  current: number; // 1-based current screen
  total: number;   // total screens (10)
}

export function ActivationProgress({ current, total }: ActivationProgressProps) {
  return (
    <div className="flex items-center gap-1 w-full px-4 py-3">
      {Array.from({ length: total }, (_, i) => {
        const filled = i < current;
        const active = i === current - 1;
        return (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-500",
              filled
                ? "bg-primary"
                : active
                  ? "bg-primary/40"
                  : "bg-muted-foreground/15"
            )}
          />
        );
      })}
    </div>
  );
}
