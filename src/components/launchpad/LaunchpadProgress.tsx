import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadProgress, STEPS } from '@/hooks/useLaunchpadProgress';
import { Check, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LaunchpadProgressProps {
  className?: string;
  compact?: boolean;
}

export function LaunchpadProgress({ className, compact = false }: LaunchpadProgressProps) {
  const { t, isRTL, language } = useTranslation();
  const { 
    progress, 
    completionPercentage, 
    currentStep, 
    isStepCompleted, 
    isStepAccessible,
    isLaunchpadComplete 
  } = useLaunchpadProgress();

  if (isLaunchpadComplete) return null;

  if (compact) {
    return (
      <div className={cn("p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border", className)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {language === 'he' ? 'התקדמות Launchpad' : 'Launchpad Progress'}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentStep - 1}/{STEPS.length}
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {language === 'he' 
            ? `שלב הבא: ${STEPS[currentStep - 1]?.title || 'סיום'}`
            : `Next: ${STEPS[currentStep - 1]?.titleEn || 'Complete'}`
          }
        </p>
      </div>
    );
  }

  return (
    <div className={cn("p-6 rounded-xl bg-card border", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {language === 'he' ? 'Launchpad' : 'Launchpad'}
        </h3>
        <span className="text-sm text-muted-foreground">
          {completionPercentage}%
        </span>
      </div>
      
      <Progress value={completionPercentage} className="h-2 mb-6" />
      
      <div className="space-y-3">
        {STEPS.map((step) => {
          const completed = isStepCompleted(step.id);
          const accessible = isStepAccessible(step.id);
          const isCurrent = step.id === currentStep;
          
          return (
            <div 
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                completed && "bg-primary/10",
                isCurrent && !completed && "bg-accent/10 border border-accent/30",
                !accessible && "opacity-50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-lg",
                completed && "bg-primary text-primary-foreground",
                isCurrent && !completed && "bg-accent/20 border-2 border-accent",
                !accessible && !completed && "bg-muted"
              )}>
                {completed ? (
                  <Check className="w-4 h-4" />
                ) : !accessible ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  step.icon
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm",
                  completed && "text-primary",
                  !accessible && "text-muted-foreground"
                )}>
                  {language === 'he' ? step.title : step.titleEn}
                </p>
                {isCurrent && !completed && (
                  <p className="text-xs text-muted-foreground truncate">
                    {language === 'he' ? step.description : step.descriptionEn}
                  </p>
                )}
              </div>
              
              {isCurrent && !completed && (
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LaunchpadProgress;
