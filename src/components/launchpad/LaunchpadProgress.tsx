import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadProgress, STEPS, PHASES, getPhaseForStep } from '@/hooks/useLaunchpadProgress';
import { Check, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface LaunchpadProgressProps {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

export function LaunchpadProgress({ className, compact = false, onClick }: LaunchpadProgressProps) {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { 
    completionPercentage, 
    currentStep, 
    completedSteps,
    isStepCompleted, 
    isStepAccessible,
    isLaunchpadComplete 
  } = useLaunchpadProgress();

  if (isLaunchpadComplete) return null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/launchpad');
    }
  };

  const currentPhase = getPhaseForStep(currentStep);
  const currentStepMeta = STEPS.find(s => s.id === currentStep);

  // Compact widget for dashboard
  if (compact) {
    return (
      <button 
        onClick={handleClick}
        className={cn(
          "w-full p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border text-start transition-all hover:shadow-md hover:border-primary/30 group",
          className
        )}
      >
        {/* Phase badges */}
        <div className="flex items-center gap-1 mb-3">
          {PHASES.map((phase) => {
            const isActive = currentPhase?.id === phase.id;
            const isCompleted = currentPhase && phase.id < currentPhase.id;
            
            return (
              <div
                key={phase.id}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all",
                  isCompleted && phase.id === 1 && "bg-blue-500",
                  isCompleted && phase.id === 2 && "bg-amber-500",
                  isCompleted && phase.id === 3 && "bg-emerald-500",
                  isActive && phase.id === 1 && "bg-blue-500/50",
                  isActive && phase.id === 2 && "bg-amber-500/50",
                  isActive && phase.id === 3 && "bg-emerald-500/50",
                  !isCompleted && !isActive && "bg-muted"
                )}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {language === 'he' ? 'Launchpad' : 'Launchpad'}
            </span>
            {currentPhase && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                currentPhase.id === 1 && "bg-blue-500/20 text-blue-600",
                currentPhase.id === 2 && "bg-amber-500/20 text-amber-600",
                currentPhase.id === 3 && "bg-emerald-500/20 text-emerald-600"
              )}>
                {language === 'he' ? currentPhase.title : currentPhase.titleEn}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {completedSteps}/{STEPS.length}
            </span>
            {isRTL ? (
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
        </div>
        
        <Progress value={completionPercentage} className="h-2" />
        
        {currentStepMeta && (
          <p className="text-xs text-muted-foreground mt-2">
            {language === 'he' 
              ? `הבא: ${currentStepMeta.title} - ${currentStepMeta.subtitle}`
              : `Next: ${currentStepMeta.titleEn} - ${currentStepMeta.subtitleEn}`
            }
          </p>
        )}
      </button>
    );
  }

  // Full progress view (grouped by phases)
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
      
      {/* Steps grouped by phase */}
      <div className="space-y-6">
        {PHASES.map((phase) => {
          const phaseSteps = STEPS.filter(s => s.phase === phase.id);
          const isPhaseActive = currentPhase?.id === phase.id;
          const isPhaseCompleted = currentPhase && phase.id < currentPhase.id;
          
          return (
            <div key={phase.id} className="space-y-2">
              {/* Phase header */}
              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg",
                isPhaseActive && phase.id === 1 && "bg-blue-500/10",
                isPhaseActive && phase.id === 2 && "bg-amber-500/10",
                isPhaseActive && phase.id === 3 && "bg-emerald-500/10",
                isPhaseCompleted && "opacity-60"
              )}>
                <span className="text-xl">{phase.icon}</span>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    phase.id === 1 && "text-blue-600",
                    phase.id === 2 && "text-amber-600",
                    phase.id === 3 && "text-emerald-600"
                  )}>
                    {language === 'he' ? phase.title : phase.titleEn}
                  </p>
                </div>
                {isPhaseCompleted && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
              
              {/* Phase steps */}
              <div className="space-y-1 ms-4">
                {phaseSteps.map((step) => {
                  const completed = isStepCompleted(step.id);
                  const accessible = isStepAccessible(step.id);
                  const isCurrent = step.id === currentStep;
                  
                  return (
                    <div 
                      key={step.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-all",
                        completed && "bg-primary/5",
                        isCurrent && !completed && "bg-accent/10 border border-accent/30",
                        !accessible && "opacity-40"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-sm",
                        completed && "bg-primary text-primary-foreground",
                        isCurrent && !completed && "bg-accent/20 border border-accent",
                        !accessible && !completed && "bg-muted"
                      )}>
                        {completed ? (
                          <Check className="w-3 h-3" />
                        ) : !accessible ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <span className="text-xs">{step.icon}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm",
                          completed && "text-primary",
                          isCurrent && "font-medium",
                          !accessible && "text-muted-foreground"
                        )}>
                          {language === 'he' ? step.title : step.titleEn}
                        </p>
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
        })}
      </div>
    </div>
  );
}

export default LaunchpadProgress;
