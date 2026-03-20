/**
 * MilestoneJourneyModal — Full-screen immersive journey execution.
 * Visual roadmap path with glowing nodes, progress orb + particles on completion.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Play, ChevronDown, CheckCircle2, Sparkles, Clock, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useMilestoneJourney,
  useGenerateMilestoneJourney,
  useUpdateJourneyProgress,
  type JourneyStep,
  type MilestoneJourney,
} from '@/hooks/useMilestoneJourney';
import { useHaptics } from '@/hooks/useHaptics';
import confetti from 'canvas-confetti';

// Step type colors
const STEP_TYPE_COLORS: Record<string, string> = {
  prepare: 'from-blue-500 to-cyan-400',
  warm_up: 'from-amber-500 to-orange-400',
  core: 'from-red-500 to-rose-400',
  challenge: 'from-purple-500 to-violet-400',
  cool_down: 'from-teal-500 to-emerald-400',
  reflect: 'from-indigo-500 to-blue-400',
  celebrate: 'from-yellow-500 to-amber-400',
};

const STEP_TYPE_GLOW: Record<string, string> = {
  prepare: 'shadow-blue-500/30',
  warm_up: 'shadow-amber-500/30',
  core: 'shadow-red-500/30',
  challenge: 'shadow-purple-500/30',
  cool_down: 'shadow-teal-500/30',
  reflect: 'shadow-indigo-500/30',
  celebrate: 'shadow-yellow-500/30',
};

interface MilestoneJourneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId: string | null;
  milestoneTitle: string;
  milestoneDescription?: string;
  focusArea?: string;
  durationMinutes?: number;
  onComplete?: () => void;
}

export function MilestoneJourneyModal({
  open,
  onOpenChange,
  milestoneId,
  milestoneTitle,
  milestoneDescription,
  focusArea,
  durationMinutes,
  onComplete,
}: MilestoneJourneyModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { impact } = useHaptics();

  const { data: journey, isLoading: journeyLoading } = useMilestoneJourney(milestoneId);
  const generateMutation = useGenerateMilestoneJourney();
  const updateProgress = useUpdateJourneyProgress();

  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepTimer, setStepTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [guidanceIndex, setGuidanceIndex] = useState(0);
  const [showingRoadmap, setShowingRoadmap] = useState(true);
  const [journeyComplete, setJourneyComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);

  const steps: JourneyStep[] = journey?.steps?.steps || [];
  const journeyTheme = journey?.steps?.journey_theme || milestoneTitle;
  const journeyEmoji = journey?.steps?.journey_emoji || '🎯';

  // Reset state when modal opens
  useEffect(() => {
    if (open && journey) {
      setActiveStep(journey.current_step || 0);
      const done = new Set<number>();
      for (let i = 0; i < (journey.completed_steps || 0); i++) done.add(i);
      setCompletedSteps(done);
      setShowingRoadmap(true);
      setJourneyComplete(journey.status === 'completed');
      setStepTimer(0);
      setTimerRunning(false);
      setGuidanceIndex(0);
    }
  }, [open, journey]);

  // Generate journey if none exists
  useEffect(() => {
    if (open && !journey && !journeyLoading && milestoneId && !generateMutation.isPending) {
      generateMutation.mutate({
        milestone_id: milestoneId,
        milestone_title: milestoneTitle,
        milestone_description: milestoneDescription,
        focus_area: focusArea,
        duration_minutes: durationMinutes || 30,
        language,
      });
    }
  }, [open, journey, journeyLoading, milestoneId]);

  // Step timer
  useEffect(() => {
    if (timerRunning && !journeyComplete) {
      timerRef.current = setInterval(() => {
        setStepTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, journeyComplete]);

  // Cycle guidance lines
  useEffect(() => {
    if (!timerRunning || !steps[activeStep]?.guidance_lines?.length) return;
    const lines = steps[activeStep].guidance_lines;
    const interval = setInterval(() => {
      setGuidanceIndex(prev => (prev + 1) % lines.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [timerRunning, activeStep, steps]);

  const handleStartStep = useCallback((stepIndex: number) => {
    setActiveStep(stepIndex);
    setShowingRoadmap(false);
    setStepTimer(0);
    setTimerRunning(true);
    setGuidanceIndex(0);
    impact('medium');
  }, [impact]);

  const handleCompleteStep = useCallback(() => {
    setTimerRunning(false);
    const newCompleted = new Set(completedSteps);
    newCompleted.add(activeStep);
    setCompletedSteps(newCompleted);
    impact('heavy');

    // Persist progress
    if (journey) {
      updateProgress.mutate({
        journeyId: journey.id,
        currentStep: activeStep + 1,
        completedSteps: newCompleted.size,
        status: newCompleted.size >= steps.length ? 'completed' : 'active',
      });
    }

    if (newCompleted.size >= steps.length) {
      // Journey complete!
      setJourneyComplete(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } }), 300);
    } else {
      // Back to roadmap
      setTimeout(() => setShowingRoadmap(true), 500);
    }
  }, [activeStep, completedSteps, steps.length, journey, updateProgress, impact]);

  const handleBackToRoadmap = useCallback(() => {
    setTimerRunning(false);
    setShowingRoadmap(true);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const currentStep = steps[activeStep];
  const progressPct = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

  const isGenerating = generateMutation.isPending || journeyLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-full w-full h-[100dvh] max-h-[100dvh] p-0 m-0 border-0 rounded-none bg-background overflow-hidden [&>button]:hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <VisuallyHidden><DialogTitle>Journey</DialogTitle></VisuallyHidden>

        <div className="flex flex-col h-full">
          {/* ── HEADER ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/50 backdrop-blur-sm">
            <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-muted/30 transition">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1 text-center">
              <p className="text-xs font-bold text-foreground truncate">{journeyEmoji} {journeyTheme}</p>
              <p className="text-[10px] text-muted-foreground">{completedSteps.size}/{steps.length} {isHe ? 'תחנות' : 'stops'}</p>
            </div>
            <div className="w-8" />
          </div>

          {/* ── PROGRESS BAR ── */}
          <div className="px-4 pt-2">
            <Progress value={progressPct} className="h-1.5" />
          </div>

          {/* ── CONTENT ── */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4 p-8"
                >
                  {/* Generating Orb */}
                  <div className="relative">
                    <motion.div
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-7 h-7 text-primary-foreground" />
                      </motion.div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {isHe ? 'Aurora בונה את המסע שלך...' : 'Aurora is crafting your journey...'}
                  </p>
                  <p className="text-xs text-muted-foreground text-center max-w-xs">
                    {isHe ? 'מתכננת תחנות, אתגרים ורגעי שיא' : 'Planning stops, challenges, and peak moments'}
                  </p>
                </motion.div>
              ) : journeyComplete ? (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full gap-6 p-8"
                >
                  {/* Completion Orb with particles */}
                  <div className="relative">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-primary"
                        style={{ left: '50%', top: '50%' }}
                        animate={{
                          x: [0, Math.cos(i * 30 * Math.PI / 180) * 60],
                          y: [0, Math.sin(i * 30 * Math.PI / 180) * 60],
                          opacity: [1, 0],
                          scale: [1, 0.3],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                    <motion.div
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-4xl">🏆</span>
                    </motion.div>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    {isHe ? 'המסע הושלם!' : 'Journey Complete!'}
                  </h2>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {isHe ? `סיימת את כל ${steps.length} התחנות. כל הכבוד!` : `You completed all ${steps.length} stops. Amazing!`}
                  </p>
                  <Button
                    onClick={() => { onComplete?.(); onOpenChange(false); }}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold"
                  >
                    {isHe ? 'סיום' : 'Finish'}
                  </Button>
                </motion.div>
              ) : showingRoadmap ? (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 pb-24"
                  ref={roadmapRef}
                >
                  {/* ── VISUAL ROADMAP PATH ── */}
                  <div className="relative max-w-sm mx-auto">
                    {steps.map((step, idx) => {
                      const isCompleted = completedSteps.has(idx);
                      const isCurrent = idx === completedSteps.size && !isCompleted;
                      const isLocked = idx > completedSteps.size;
                      const colors = STEP_TYPE_COLORS[step.type] || 'from-gray-500 to-gray-400';
                      const glow = STEP_TYPE_GLOW[step.type] || 'shadow-gray-500/30';
                      const isLast = idx === steps.length - 1;

                      return (
                        <div key={idx} className="relative">
                          {/* Connector line */}
                          {!isLast && (
                            <div className={cn(
                              "absolute start-6 top-14 w-0.5 h-12",
                              isCompleted ? 'bg-gradient-to-b from-emerald-400 to-emerald-400/30' : 'bg-border/30'
                            )} />
                          )}

                          <motion.button
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            onClick={() => !isLocked && handleStartStep(idx)}
                            disabled={isLocked}
                            className={cn(
                              "flex items-start gap-4 w-full text-start p-3 rounded-2xl transition-all mb-3",
                              isCurrent && 'bg-card border border-primary/30 shadow-lg shadow-primary/10',
                              isCompleted && 'bg-card/50 border border-emerald-500/20',
                              isLocked && 'opacity-40 cursor-not-allowed',
                              !isLocked && !isCurrent && !isCompleted && 'hover:bg-card/30'
                            )}
                          >
                            {/* Node */}
                            <div className="relative flex-shrink-0">
                              {isCurrent && (
                                <motion.div
                                  className={cn("absolute -inset-1.5 rounded-full bg-gradient-to-br opacity-40", colors)}
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-xl relative z-10",
                                isCompleted
                                  ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                                  : isCurrent
                                    ? cn('bg-gradient-to-br shadow-lg', colors, glow)
                                    : 'bg-muted/30 border border-border/30'
                              )}>
                                {isCompleted ? (
                                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                ) : (
                                  <span>{step.icon}</span>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex items-center gap-2">
                                <h3 className={cn(
                                  "text-sm font-bold truncate",
                                  isCompleted ? 'text-emerald-400 line-through' : isCurrent ? 'text-foreground' : 'text-foreground/60'
                                )}>
                                  {step.title}
                                </h3>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                {step.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" />
                                  {Math.ceil(step.duration_seconds / 60)}{isHe ? ' דק׳' : 'm'}
                                </span>
                                <span className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded-full",
                                  isCompleted ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted/30 text-muted-foreground'
                                )}>
                                  {step.type}
                                </span>
                              </div>
                              {isCurrent && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-2 flex items-center gap-1.5 text-[11px] text-primary font-semibold"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  {isHe ? 'לחץ להתחיל' : 'Tap to start'}
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : currentStep ? (
                <motion.div
                  key={`step-${activeStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col h-full"
                >
                  {/* Step execution view */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
                    {/* Back to roadmap */}
                    <button
                      onClick={handleBackToRoadmap}
                      className="absolute top-16 start-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      {isHe ? 'מפת המסע' : 'Roadmap'}
                    </button>

                    {/* Progress Orb */}
                    <div className="relative">
                      <motion.div
                        className={cn(
                          "absolute -inset-4 rounded-full bg-gradient-to-br opacity-20 blur-xl",
                          STEP_TYPE_COLORS[currentStep.type] || 'from-primary to-accent'
                        )}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      {/* Orbiting particles */}
                      {timerRunning && [...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
                          style={{ left: '50%', top: '50%' }}
                          animate={{
                            x: [
                              Math.cos((i * 60 + 0) * Math.PI / 180) * 50,
                              Math.cos((i * 60 + 360) * Math.PI / 180) * 50,
                            ],
                            y: [
                              Math.sin((i * 60 + 0) * Math.PI / 180) * 50,
                              Math.sin((i * 60 + 360) * Math.PI / 180) * 50,
                            ],
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
                        />
                      ))}
                      <motion.div
                        className={cn(
                          "w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl relative z-10 bg-gradient-to-br",
                          STEP_TYPE_COLORS[currentStep.type] || 'from-primary to-accent',
                          STEP_TYPE_GLOW[currentStep.type] || 'shadow-primary/30'
                        )}
                        animate={timerRunning ? { scale: [1, 1.03, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-3xl mb-0.5">{currentStep.icon}</span>
                        <span className="text-white text-lg font-mono font-bold">{formatTime(stepTimer)}</span>
                      </motion.div>
                    </div>

                    {/* Step info */}
                    <div className="text-center max-w-xs">
                      <h2 className="text-lg font-bold text-foreground">{currentStep.title}</h2>
                      <p className="text-xs text-muted-foreground mt-1">{currentStep.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {isHe ? 'יעד:' : 'Target:'} {Math.ceil(currentStep.duration_seconds / 60)} {isHe ? 'דק׳' : 'min'}
                      </p>
                    </div>

                    {/* Guidance line */}
                    {currentStep.guidance_lines?.length > 0 && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={guidanceIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl px-5 py-3 max-w-xs"
                        >
                          <p className="text-xs text-foreground/80 text-center italic leading-relaxed">
                            "{currentStep.guidance_lines[guidanceIndex]}"
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {/* Completion criteria */}
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground/60">
                        ✓ {currentStep.completion_criteria}
                      </p>
                    </div>
                  </div>

                  {/* Bottom actions */}
                  <div className="p-4 border-t border-border/30 bg-card/50 backdrop-blur-sm">
                    <Button
                      onClick={handleCompleteStep}
                      className={cn(
                        "w-full py-5 rounded-2xl font-bold text-white bg-gradient-to-r",
                        stepTimer >= currentStep.duration_seconds
                          ? 'from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30'
                          : 'from-primary to-accent'
                      )}
                    >
                      <CheckCircle2 className="w-5 h-5 me-2" />
                      {stepTimer >= currentStep.duration_seconds
                        ? (isHe ? 'תחנה הושלמה! ✨' : 'Stop Complete! ✨')
                        : (isHe ? 'סיימתי את התחנה' : 'Complete Stop')}
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
