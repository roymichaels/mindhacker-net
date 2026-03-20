/**
 * Unified Journey Header Component
 * Replaces GamifiedJourneyHeader.tsx and BusinessJourneyHeader.tsx
 * Supports all journey themes with consistent behavior
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLiveOrbProfile } from '@/hooks/useLiveOrbProfile';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Check, ChevronLeft, ChevronRight, X, RotateCcw, Zap, Star, Sparkles } from 'lucide-react';
import type { JourneyHeaderProps, Phase } from './types';
import { JOURNEY_THEMES, PHASE_COLORS } from './themes';
import { getPhaseForStep, calculateProgressPercent } from '@/hooks/journey/utils';

export function JourneyHeader({
  theme,
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
  phases,
  steps,
  className,
  showOrb = true,
  xpEarned,
}: JourneyHeaderProps) {
  const { language, isRTL } = useTranslation();
  const { profile: orbProfile, threadCount, hasPersonalization } = useLiveOrbProfile();
  
  const themeConfig = JOURNEY_THEMES[theme];
  const ThemeIcon = themeConfig.icon;
  
  const currentStepMeta = steps.find(s => s.id === displayedStep);
  const currentPhase = getPhaseForStep(phases, displayedStep);
  const currentPhaseColors = PHASE_COLORS[(currentPhase?.id || 1) as 1 | 2 | 3 | 4] || PHASE_COLORS[1];

  const progressPercent = calculateProgressPercent(displayedStep, totalSteps);
  const calculatedXp = xpEarned ?? (displayedStep - 1) * 15;

  // Determine border class based on theme
  const borderClass = theme === 'business' 
    ? 'border-amber-500/20' 
    : 'border-border/50';

  return (
    <div className={cn("sticky top-0 z-10", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main header container with glass effect */}
      <div className={cn("bg-background/60 backdrop-blur-xl border-b", borderClass)}>
        <div className="w-full px-4">
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
                    "bg-gradient-to-r shadow-lg",
                    currentPhaseColors.bg,
                    currentPhaseColors.glow,
                    theme === 'business' ? 'text-purple-900' : 'text-white'
                  )}
                >
                  {theme === 'business' && <ThemeIcon className="w-3.5 h-3.5" />}
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

            {/* Right side: XP and Orb */}
            <div className="flex items-center gap-2">
              {/* XP indicator */}
              <div className="hidden sm:flex flex-col items-end text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-medium">
                  <Zap className="w-3 h-3" />
                  <span>+{calculatedXp} XP</span>
                </div>
                {showOrb && hasPersonalization && (
                  <div className="flex items-center gap-1 text-primary/70">
                    <Sparkles className="w-3 h-3" />
                    <span>{threadCount} {language === 'he' ? 'שכבות' : 'layers'}</span>
                  </div>
                )}
              </div>

              {/* Live Orb Avatar */}
              {showOrb && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <div className={cn(
                    "absolute inset-[-50%] rounded-full blur-xl pointer-events-none",
                    theme === 'business' 
                      ? "bg-gradient-radial from-amber-500/50 via-amber-500/20 to-transparent"
                      : "bg-gradient-radial from-primary/50 via-primary/20 to-transparent"
                  )} />
                  
                  <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center overflow-visible">
                    <div className="relative z-10">
                      <PersonalizedOrb size={48} className="md:hidden" />
                      <PersonalizedOrb size={64} className="hidden md:block" />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {hasPersonalization && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg z-20"
                      >
                        <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>

          {/* Phase indicator - compact version */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2">
              {phases.map((phase, index) => {
                const isActive = currentPhase?.id === phase.id;
                const isCompleted = (currentPhase?.id || 0) > phase.id;
                const colors = PHASE_COLORS[phase.id as 1 | 2 | 3 | 4] || PHASE_COLORS[1];

                return (
                  <div key={phase.id} className="flex items-center flex-1">
                    {/* Phase node */}
                    <motion.div
                      initial={false}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-full transition-all text-xs",
                        isActive && cn("bg-gradient-to-r shadow-md", colors.bg, colors.glow, theme === 'business' ? 'text-purple-900' : 'text-white'),
                        isCompleted && cn("bg-gradient-to-r opacity-80", colors.bg, theme === 'business' ? 'text-purple-900' : 'text-white'),
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
                    {index < phases.length - 1 && (
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
          <div className={cn(
            "h-1",
            theme === 'business' ? 'bg-amber-500/10' : 'bg-muted/30'
          )}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn("h-full bg-gradient-to-r", currentPhaseColors.bg)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default JourneyHeader;
