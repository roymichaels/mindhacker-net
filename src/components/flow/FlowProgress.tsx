/**
 * FlowProgress — Visual progress indicator for macro + mini steps
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface FlowProgressProps {
  currentStep: number;
  totalSteps: number;
  currentMiniStep: number;
  totalMiniSteps: number;
  stepTitle?: string;
}

export function FlowProgress({
  currentStep,
  totalSteps,
  currentMiniStep,
  totalMiniSteps,
  stepTitle,
}: FlowProgressProps) {
  const { language } = useTranslation();
  const overallProgress = Math.round(((currentStep - 1) / totalSteps) * 100 + (currentMiniStep / totalMiniSteps) * (100 / totalSteps));

  return (
    <div className="space-y-2">
      {/* Step counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {language === 'he'
            ? `שלב ${currentStep} מתוך ${totalSteps}`
            : `Step ${currentStep} of ${totalSteps}`}
        </span>
        {stepTitle && (
          <span className="font-medium text-foreground/70 truncate max-w-[50%]">
            {stepTitle}
          </span>
        )}
      </div>

      {/* Main progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(overallProgress, 100)}%` }}
        />
      </div>

      {/* Mini-step dots */}
      {totalMiniSteps > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {Array.from({ length: totalMiniSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i < currentMiniStep
                  ? "bg-primary"
                  : i === currentMiniStep
                    ? "bg-primary/60 scale-125"
                    : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
