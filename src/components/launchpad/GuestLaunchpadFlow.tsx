import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useGuestLaunchpadProgress } from '@/hooks/useGuestLaunchpadProgress';
import { useGuestLaunchpadAutoSave } from '@/hooks/useGuestLaunchpadAutoSave';
import { STEPS, getPhaseForStep, isLastStepInPhase } from '@/hooks/useLaunchpadProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeStep } from './steps/WelcomeStep';
import { PersonalProfileStep } from './steps/PersonalProfileStep';
import { GrowthDeepDiveStep } from './steps/GrowthDeepDiveStep';
import { FirstChatStep } from './steps/FirstChatStep';
import { IntrospectionStep } from './steps/IntrospectionStep';
import { LifePlanStep } from './steps/LifePlanStep';
import { FocusAreasStep } from './steps/FocusAreasStep';
import { FirstWeekStep } from './steps/FirstWeekStep';
import { GuestDashboardActivation } from './steps/GuestDashboardActivation';
import { PhaseIndicator } from './PhaseIndicator';
import { PhaseTransition } from './PhaseTransition';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GuestLaunchpadFlowProps {
  className?: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export function GuestLaunchpadFlow({ className, onComplete, onClose }: GuestLaunchpadFlowProps) {
  const { language, isRTL } = useTranslation();
  const { 
    currentStep, 
    isLaunchpadComplete, 
    completeStep, 
    isCompleting,
    getStepRewards,
    totalSteps,
    progress,
  } = useGuestLaunchpadProgress();
  
  // Auto-save hooks for each step
  const step1Save = useGuestLaunchpadAutoSave({ stepKey: 'step_1' });
  const step2Save = useGuestLaunchpadAutoSave({ stepKey: 'step_2' });
  const step3Save = useGuestLaunchpadAutoSave({ stepKey: 'step_3' });
  
  const [viewingStep, setViewingStep] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [showingPhaseTransition, setShowingPhaseTransition] = useState(false);
  const [completedPhaseId, setCompletedPhaseId] = useState<number | null>(null);
  
  const displayedStep = viewingStep ?? currentStep;
  const currentStepMeta = STEPS.find(s => s.id === displayedStep);
  const currentPhase = getPhaseForStep(displayedStep);

  const handleStepComplete = (data?: Record<string, unknown>) => {
    if (viewingStep !== null) {
      setViewingStep(null);
      return;
    }
    
    if (currentStep === 2 && data) {
      setProfileData(data);
    }
    
    if (isLastStepInPhase(currentStep) && currentStep < 9) {
      const phase = getPhaseForStep(currentStep);
      if (phase) {
        setCompletedPhaseId(phase.id);
        setShowingPhaseTransition(true);
      }
    }
    
    // Map step to appropriate data key
    let stepData: Record<string, unknown> | undefined;
    switch (currentStep) {
      case 1:
        stepData = data ? { intention: JSON.stringify(data) } : undefined;
        break;
      case 2:
        stepData = data ? { profile_data: data } : undefined;
        break;
      case 4:
        stepData = data ? { summary: JSON.stringify(data) } : undefined;
        break;
      case 5:
      case 6:
        stepData = data ? { form_data: data } : undefined;
        break;
      case 7:
        stepData = data?.focusAreas ? { focus_areas: data.focusAreas as string[] } : undefined;
        break;
      case 8:
        stepData = data ? { actions: data } : undefined;
        break;
      default:
        stepData = data;
    }
    
    completeStep({ step: currentStep, data: stepData });
    
    if (currentStep === 9 && onComplete) {
      onComplete();
    }
  };

  const handlePhaseTransitionContinue = () => {
    setShowingPhaseTransition(false);
    setCompletedPhaseId(null);
  };

  const handleNavigatePrev = () => {
    if (displayedStep > 1) {
      setViewingStep(displayedStep - 1);
    }
  };

  const handleNavigateNext = () => {
    if (displayedStep < currentStep) {
      if (displayedStep + 1 === currentStep) {
        setViewingStep(null);
      } else {
        setViewingStep(displayedStep + 1);
      }
    }
  };

  const canGoPrev = displayedStep > 1;
  const canGoNext = isLaunchpadComplete 
    ? displayedStep < 9 
    : (viewingStep !== null && displayedStep < currentStep);

  const handleAutoSave = useCallback((step: number, data: Record<string, unknown>) => {
    switch (step) {
      case 1:
        step1Save.saveData(data);
        break;
      case 2:
        step2Save.saveData(data);
        break;
      case 3:
        step3Save.saveData(data);
        break;
    }
  }, [step1Save, step2Save, step3Save]);

  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      isCompleting: viewingStep === null ? isCompleting : false,
      rewards: getStepRewards(displayedStep),
    };

    switch (displayedStep) {
      case 1:
        return (
          <WelcomeStep 
            {...stepProps}
            onAutoSave={(data) => handleAutoSave(1, data)}
            savedData={step1Save.loadData() || undefined}
            key={`guest-step-1-${displayedStep}`}
          />
        );
      case 2:
        return (
          <PersonalProfileStep 
            {...stepProps}
            onAutoSave={(data) => handleAutoSave(2, data)}
            savedData={step2Save.loadData() || undefined}
            key={`guest-step-2-${displayedStep}`}
          />
        );
      case 3:
        return (
          <GrowthDeepDiveStep 
            {...stepProps}
            previousAnswers={profileData || progress?.step_2_profile_data || undefined}
            onAutoSave={(data) => handleAutoSave(3, data)}
            savedData={step3Save.loadData() || undefined}
            key={`guest-step-3-${displayedStep}`}
          />
        );
      case 4:
        return (
          <FirstChatStep 
            {...stepProps}
            key={`guest-step-4-${displayedStep}`}
          />
        );
      case 5:
        return (
          <IntrospectionStep 
            {...stepProps}
            key={`guest-step-5-${displayedStep}`}
          />
        );
      case 6:
        return (
          <LifePlanStep 
            {...stepProps}
            key={`guest-step-6-${displayedStep}`}
          />
        );
      case 7:
        return (
          <FocusAreasStep 
            {...stepProps}
            key={`guest-step-7-${displayedStep}`}
          />
        );
      case 8:
        return (
          <FirstWeekStep 
            {...stepProps}
            key={`guest-step-8-${displayedStep}`}
          />
        );
      case 9:
        return (
          <GuestDashboardActivation 
            {...stepProps}
            key={`guest-step-9-${displayedStep}`}
          />
        );
      default:
        return null;
    }
  };

  // Show phase transition screen
  if (showingPhaseTransition && completedPhaseId !== null) {
    const completedPhase = currentPhase;
    const nextPhaseId = completedPhaseId + 1;
    const nextPhase = nextPhaseId <= 3 ? getPhaseForStep(currentStep + 1) : null;
    
    return (
      <PhaseTransition
        completedPhase={completedPhase!}
        nextPhase={nextPhase || undefined}
        onContinue={handlePhaseTransitionContinue}
      />
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigatePrev}
              disabled={!canGoPrev}
              className={cn("h-9 w-9", !canGoPrev && "opacity-30")}
            >
              {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
            
            <span className="text-sm font-medium">
              {displayedStep}/{totalSteps}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigateNext}
              disabled={!canGoNext}
              className={cn("h-9 w-9", !canGoNext && "opacity-30")}
            >
              {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </div>

          {/* Phase indicator */}
          {currentPhase && (
            <PhaseIndicator currentStep={displayedStep} />
          )}

          {/* Close button */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(displayedStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`guest-step-${displayedStep}`}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
