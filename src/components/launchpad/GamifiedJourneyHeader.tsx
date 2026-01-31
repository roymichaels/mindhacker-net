/**
 * Gamified Header for Transformation Journey
 * Shows live orb that evolves with user choices
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLiveOrbProfile } from '@/hooks/useLiveOrbProfile';
import { PHASES, STEPS, getPhaseForStep } from '@/hooks/useLaunchpadProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { Check, ChevronLeft, ChevronRight, X, RotateCcw, Sparkles, Zap, Star } from 'lucide-react';

interface GamifiedJourneyHeaderProps {
  currentStep: number;
  totalSteps: number;
  displayedStep: number;
  isViewing: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onReset?: () => void;
  showReset?: boolean;
  className?: string;
}

export function GamifiedJourneyHeader({
  currentStep,
  totalSteps,
  displayedStep,
  isViewing,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onClose,
  onReset,
  showReset = false,
  className,
}: GamifiedJourneyHeaderProps) {
  const { language, isRTL } = useTranslation();
  const { profile: orbProfile, threadCount, hasPersonalization } = useLiveOrbProfile();
  
  const currentStepMeta = STEPS.find(s => s.id === displayedStep);
  const currentPhase = getPhaseForStep(displayedStep);

  // Phase colors
  const phaseColors = {
    1: { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-500', glow: 'shadow-blue-500/30' },
    2: { bg: 'from-amber-500 to-orange-500', text: 'text-amber-500', glow: 'shadow-amber-500/30' },
    3: { bg: 'from-emerald-500 to-green-500', text: 'text-emerald-500', glow: 'shadow-emerald-500/30' },
  };
  
  const currentColors = phaseColors[(currentPhase?.id || 1) as 1 | 2 | 3];

  // Calculate XP earned so far
  const xpEarned = (displayedStep - 1) * 15;
  const totalXP = totalSteps * 15;
  const progressPercent = Math.round((displayedStep / totalSteps) * 100);

  return (
    <div className={cn("sticky top-0 z-10", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main header container with glass effect */}
      <div className="bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto">
          {/* Top section: Navigation, Info, Orb */}
          <div className="flex items-center justify-between p-3 gap-3">
            {/* Left side: Close + Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrev}
                  disabled={!canGoPrev}
                  className="h-8 w-8"
                >
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="h-8 w-8"
                >
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>

              {showReset && onReset && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onReset}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title={language === 'he' ? 'התחל מחדש' : 'Start Over'}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Center: Step info with gamified styling */}
            <div className="flex-1 flex flex-col items-center">
              {/* Step counter with badge */}
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold",
                    "bg-gradient-to-r", currentColors.bg, "text-white shadow-lg",
                    currentColors.glow
                  )}
                >
                  <span>{displayedStep}/{totalSteps}</span>
                </motion.div>
                
                {isViewing && (
                  <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded-full font-medium">
                    {language === 'he' ? 'צפייה' : 'Viewing'}
                  </span>
                )}
              </div>
              
              {/* Current step subtitle */}
              {currentStepMeta && (
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate text-center">
                  {language === 'he' ? currentStepMeta.subtitle : currentStepMeta.subtitleEn}
                </p>
              )}
            </div>

            {/* Right side: Live Orb */}
            <div className="flex items-center gap-2">
              {/* XP indicator */}
              <div className="hidden sm:flex flex-col items-end text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-medium">
                  <Zap className="w-3 h-3" />
                  <span>+{xpEarned} XP</span>
                </div>
                {hasPersonalization && (
                  <div className="flex items-center gap-1 text-primary/70">
                    <Sparkles className="w-3 h-3" />
                    <span>{threadCount} {language === 'he' ? 'שכבות' : 'layers'}</span>
                  </div>
                )}
              </div>

              {/* Live Orb Avatar - Enhanced liquid mercury style */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                {/* Glow backdrop for orb visibility */}
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-primary/40 via-primary/20 to-transparent blur-xl scale-150" />
                
                <div className={cn(
                  "relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden",
                  "ring-2 ring-primary/50 shadow-xl",
                  "bg-gradient-to-br from-background/80 to-background/40",
                  hasPersonalization && "ring-primary shadow-primary/40 shadow-2xl"
                )}>
                  <MultiThreadOrb profile={orbProfile} size={64} />
                </div>
                
                {/* Evolution indicator when orb changes */}
                <AnimatePresence>
                  {hasPersonalization && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
                    >
                      <Star className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Phase indicator - compact version */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2">
              {PHASES.map((phase, index) => {
                const isActive = currentPhase?.id === phase.id;
                const isCompleted = (currentPhase?.id || 0) > phase.id;
                const colors = phaseColors[phase.id as 1 | 2 | 3];

                return (
                  <div key={phase.id} className="flex items-center flex-1">
                    {/* Phase node */}
                    <motion.div
                      initial={false}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-full transition-all text-xs",
                        isActive && cn("bg-gradient-to-r", colors.bg, "text-white shadow-md", colors.glow),
                        isCompleted && cn("bg-gradient-to-r", colors.bg, "text-white opacity-80"),
                        !isActive && !isCompleted && "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="text-sm">{phase.icon}</span>
                      )}
                      <span className="hidden sm:inline font-medium">
                        {language === 'he' ? phase.title : phase.titleEn}
                      </span>
                    </motion.div>

                    {/* Connector */}
                    {index < PHASES.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2">
                        <div className={cn(
                          "h-full rounded-full transition-all",
                          isCompleted ? cn("bg-gradient-to-r", colors.bg) : "bg-muted/30"
                        )} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn("h-full bg-gradient-to-r", currentColors.bg)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamifiedJourneyHeader;
