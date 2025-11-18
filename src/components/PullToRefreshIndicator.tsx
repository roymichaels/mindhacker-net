import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  pullProgress: number;
  isRefreshing: boolean;
  showIndicator: boolean;
}

export const PullToRefreshIndicator = ({
  pullDistance,
  pullProgress,
  isRefreshing,
  showIndicator,
}: PullToRefreshIndicatorProps) => {
  if (!showIndicator) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200"
      style={{
        height: `${Math.min(pullDistance, 80)}px`,
        opacity: pullProgress,
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "transition-transform duration-200",
            isRefreshing ? "animate-spin" : ""
          )}
          style={{
            transform: isRefreshing ? "" : `rotate(${pullProgress * 360}deg)`,
          }}
        >
          <Loader2 className="h-6 w-6 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">
          {isRefreshing ? "מרענן..." : pullProgress >= 1 ? "שחרר לרענון" : "משוך לרענון"}
        </span>
      </div>
    </div>
  );
};
