import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PHASES, getPhaseForStep } from '@/hooks/useLaunchpadProgress';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PhaseIndicatorProps {
  currentStep: number;
  className?: string;
}

export function PhaseIndicator({ currentStep, className }: PhaseIndicatorProps) {
  const { language, isRTL } = useTranslation();
  const currentPhase = getPhaseForStep(currentStep);

  const getPhaseStatus = (phaseId: number) => {
    if (!currentPhase) return 'locked';
    if (phaseId < currentPhase.id) return 'completed';
    if (phaseId === currentPhase.id) return 'active';
    return 'locked';
  };

  const phaseColors = {
    1: {
      active: 'bg-blue-500',
      completed: 'bg-blue-500',
      locked: 'bg-muted',
      text: 'text-blue-500',
      border: 'border-blue-500/30',
      glow: 'shadow-blue-500/20',
    },
    2: {
      active: 'bg-amber-500',
      completed: 'bg-amber-500',
      locked: 'bg-muted',
      text: 'text-amber-500',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/20',
    },
    3: {
      active: 'bg-emerald-500',
      completed: 'bg-emerald-500',
      locked: 'bg-muted',
      text: 'text-emerald-500',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
    },
  };

  return (
    <div className={cn("w-full", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-2">
        {PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const colors = phaseColors[phase.id as 1 | 2 | 3];
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          const isLocked = status === 'locked';

          return (
            <div key={phase.id} className="flex-1 flex items-center">
              {/* Phase node */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300",
                    isActive && cn(colors.active, "text-white shadow-lg", colors.glow),
                    isCompleted && cn(colors.completed, "text-white"),
                    isLocked && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{phase.icon}</span>
                  )}
                  
                  {/* Active pulse ring */}
                  {isActive && (
                    <motion.div
                      className={cn("absolute inset-0 rounded-full", colors.active)}
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Phase title */}
                <div className="text-center">
                  <p className={cn(
                    "text-xs font-medium transition-colors",
                    isActive && colors.text,
                    isCompleted && "text-foreground",
                    isLocked && "text-muted-foreground"
                  )}>
                    {language === 'he' ? phase.title : phase.titleEn}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < PHASES.length - 1 && (
                <div className="flex-shrink-0 w-8 h-0.5 mx-1 relative top-[-12px]">
                  <div className={cn(
                    "h-full transition-all duration-300",
                    isCompleted ? colors.completed : "bg-muted"
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PhaseIndicator;
