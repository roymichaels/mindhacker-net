import { Progress } from "@/components/ui/progress";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface FormProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const FormProgressBar = ({ currentStep, totalSteps, className }: FormProgressBarProps) => {
  const { t, isRTL } = useTranslation();
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  
  // Define milestones at 25%, 50%, 75%, 100%
  const milestones = [
    { percent: 25, label: isRTL ? 'התחלה טובה!' : 'Great start!' },
    { percent: 50, label: isRTL ? 'באמצע הדרך! 🌟' : 'Halfway there! 🌟' },
    { percent: 75, label: isRTL ? 'כמעט שם!' : 'Almost there!' },
    { percent: 100, label: isRTL ? 'סיימת! 🎉' : 'Complete! 🎉' },
  ];

  // Get current milestone message
  const getCurrentMilestone = () => {
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (progress >= milestones[i].percent) {
        return milestones[i];
      }
    }
    return null;
  };

  const currentMilestone = getCurrentMilestone();
  const justReachedMilestone = milestones.some(
    m => Math.abs(progress - m.percent) < 5 && progress >= m.percent
  );

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar with milestones */}
      <div className="relative">
        <Progress value={progress} className="h-2 rounded-full" />
        
        {/* Milestone markers */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-0">
          {milestones.map((milestone, index) => {
            const isReached = progress >= milestone.percent;
            const isCurrent = progress >= milestone.percent && 
              (index === milestones.length - 1 || progress < milestones[index + 1].percent);
            
            return (
              <div
                key={milestone.percent}
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500",
                  isReached 
                    ? "bg-primary text-primary-foreground scale-100" 
                    : "bg-muted border-2 border-border scale-90",
                  isCurrent && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background animate-pulse"
                )}
                style={{
                  position: 'absolute',
                  left: `${milestone.percent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {isReached && (
                  <Check className="w-2.5 h-2.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone celebration message */}
      <div className="mt-4 min-h-[24px] flex items-center justify-center">
        {currentMilestone && (
          <div 
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-all duration-500",
              justReachedMilestone ? "animate-bounce text-primary" : "text-muted-foreground"
            )}
          >
            {justReachedMilestone && <Sparkles className="w-4 h-4 text-amber-500" />}
            <span>{currentMilestone.label}</span>
            {justReachedMilestone && <Sparkles className="w-4 h-4 text-amber-500" />}
          </div>
        )}
      </div>

      {/* Question counter */}
      <div className="mt-1 text-center text-xs text-muted-foreground">
        {isRTL ? (
          <span>שאלה {currentStep + 1} מתוך {totalSteps}</span>
        ) : (
          <span>Question {currentStep + 1} of {totalSteps}</span>
        )}
      </div>
    </div>
  );
};

export default FormProgressBar;
