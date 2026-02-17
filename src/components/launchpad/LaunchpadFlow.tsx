import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadProgress, STEPS, PHASES, getPhaseForStep, isLastStepInPhase } from '@/hooks/useLaunchpadProgress';
import { useLaunchpadAutoSave } from '@/hooks/useLaunchpadAutoSave';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WelcomeStep } from './steps/WelcomeStep';
import { PersonalProfileStep } from './steps/PersonalProfileStep';
import { LifestyleRoutineStep } from './steps/LifestyleRoutineStep';
import { GrowthDeepDiveStep } from './steps/GrowthDeepDiveStep';
import { FirstChatStep } from './steps/FirstChatStep';
import { IntrospectionStep } from './steps/IntrospectionStep';
import { LifePlanStep } from './steps/LifePlanStep';
import { FocusAreasStep } from './steps/FocusAreasStep';
import { FirstWeekStep } from './steps/FirstWeekStep';
import { FinalNotesStep } from './steps/FinalNotesStep';
import { DashboardActivation } from './steps/DashboardActivation';
import { GamifiedJourneyHeader } from './GamifiedJourneyHeader';
import { PhaseTransition } from './PhaseTransition';
import JourneyChatDock from '@/components/aurora/JourneyChatDock';
import { JourneyResetDialog, JourneyLoadingState } from '@/components/journey-shared';

interface LaunchpadFlowProps {
  className?: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export function LaunchpadFlow({ className, onComplete, onClose }: LaunchpadFlowProps) {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  // ============ Authenticated hooks ============
  const authProgress = useLaunchpadProgress();
  const authAutoSave = useLaunchpadAutoSave();
  
  // ============ Unified adapter ============
  const currentStep = authProgress.currentStep;
  const isLaunchpadComplete = authProgress.isLaunchpadComplete;
  const isCompleting = authProgress.isCompleting;
  const totalSteps = authProgress.totalSteps;
  const isResetting = authProgress.isResetting;
  const isLoadingData = authAutoSave.isLoading;
  const launchpadData = authAutoSave.launchpadData;
  
  const getStepRewards = authProgress.getStepRewards;
  
  const completeStep = useCallback((args: { step: number; data?: Record<string, unknown> }) => {
    authProgress.completeStep(args);
  }, [authProgress]);
  
  const resetJourney = useCallback(() => {
    authProgress.resetJourney();
  }, [authProgress]);
  
  const getSavedData = useCallback((step: number) => {
    return authAutoSave.getSavedData(step);
  }, [authAutoSave]);
  
  const handleAutoSave = useCallback((step: number, data: Record<string, unknown>) => {
    authAutoSave.autoSave(step, data);
  }, [authAutoSave]);
  
  // ============ Local state ============
  const [viewingStep, setViewingStep] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [showingPhaseTransition, setShowingPhaseTransition] = useState(false);
  const [completedPhaseId, setCompletedPhaseId] = useState<number | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  const displayedStep = viewingStep ?? currentStep;
  const currentStepMeta = STEPS.find(s => s.id === displayedStep);
  const currentPhase = getPhaseForStep(displayedStep);

  const handleResetJourney = () => {
    resetJourney();
    setViewingStep(null);
    setShowResetDialog(false);
  };

  const handleStepComplete = (data?: Record<string, unknown>) => {
    if (viewingStep !== null) {
      setViewingStep(null);
      return;
    }
    
    // Store profile data for GrowthDeepDiveStep (step 2)
    if (currentStep === 2 && data) {
      setProfileData(data);
    }
    
    // Check if this step completes a phase
    if (isLastStepInPhase(currentStep) && currentStep < 11) {
      const phase = getPhaseForStep(currentStep);
      if (phase) {
        setCompletedPhaseId(phase.id);
        setShowingPhaseTransition(true);
      }
    }
    
    completeStep({ step: currentStep, data });
    
    if (currentStep === 11 && onComplete) {
      onComplete();
    }
  };

  const handlePhaseTransitionContinue = () => {
    setShowingPhaseTransition(false);
    setCompletedPhaseId(null);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/today');
    }
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
    ? displayedStep < 11 
    : (viewingStep !== null && displayedStep < currentStep);

  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      isCompleting: viewingStep === null ? isCompleting : false,
      rewards: getStepRewards(displayedStep),
    };
    
    // Get previous answers for GrowthDeepDiveStep
    const previousAnswers = profileData || 
      launchpadData?.personalProfile || 
      undefined;

    switch (displayedStep) {
      case 1:
        return (
          <WelcomeStep 
            key={`step-1-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={getSavedData(1) as Record<string, string | string[]> | undefined}
            onAutoSave={(data) => handleAutoSave(1, data)}
          />
        );
      case 2:
        return (
          <PersonalProfileStep 
            key={`step-2-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={(getSavedData(2) as Record<string, unknown>) ?? undefined}
            onAutoSave={(data) => handleAutoSave(2, data)}
          />
        );
      case 3:
        return (
          <LifestyleRoutineStep 
            key={`step-3-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={(getSavedData(3) as Record<string, unknown>) ?? undefined}
            onAutoSave={(data) => handleAutoSave(3, data)}
          />
        );
      case 4:
        return (
          <GrowthDeepDiveStep 
            key={`step-4-${viewingStep ?? 'current'}`} 
            {...stepProps} 
            previousAnswers={previousAnswers as Record<string, unknown> | undefined}
            savedData={getSavedData(4) as { answers?: Record<string, string[]>; currentAreaIndex?: number } | undefined}
            onAutoSave={(data) => handleAutoSave(4, data)}
          />
        );
      case 5:
        return (
          <FirstChatStep 
            key={`step-5-${viewingStep ?? 'current'}`} 
            {...stepProps}
            savedData={authAutoSave.getSavedData(5) as { messages?: Array<{ role: 'user' | 'assistant'; content: string }>; questionIndex?: number; answers?: string[]; isComplete?: boolean } | undefined}
            onAutoSave={(data) => handleAutoSave(5, data)}
          />
        );
      case 6:
        return (
          <IntrospectionStep 
            key={`step-6-${viewingStep ?? 'current'}`} 
            {...stepProps}
            savedFormSubmissionId={launchpadData?.step_3_form_submission_id ?? undefined}
          />
        );
      case 7:
        return (
          <LifePlanStep 
            key={`step-7-${viewingStep ?? 'current'}`} 
            {...stepProps}
            savedFormSubmissionId={launchpadData?.step_4_form_submission_id ?? undefined}
          />
        );
      case 8:
        return (
          <FocusAreasStep 
            key={`step-8-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={getSavedData(8) as { focus_areas?: string[] } | undefined}
            onAutoSave={(data) => handleAutoSave(8, data)}
          />
        );
      case 9:
        return (
          <FirstWeekStep 
            key={`step-9-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={getSavedData(9) as { selectedQuit?: string[]; selectedBuild?: string[]; selectedCareerStatus?: string; selectedCareerGoal?: string } | undefined}
            onAutoSave={(data) => handleAutoSave(9, data as unknown as Record<string, unknown>)}
          />
        );
      case 10:
        return (
          <FinalNotesStep 
            key={`step-10-${viewingStep ?? 'current'}`}
            {...stepProps}
            savedData={getSavedData(10) as { notes?: string } | undefined}
            onAutoSave={(data) => handleAutoSave(10, data)}
          />
        );
      case 11:
        return (
          <DashboardActivation key={`step-11-${viewingStep ?? 'current'}`} {...stepProps} />
        );
      default:
        return null;
    }
  };

  // Show loader while data is loading
  if (isLoadingData) {
    return <JourneyLoadingState theme="launchpad" />;
  }

  // Show phase transition screen
  if (showingPhaseTransition && completedPhaseId) {
    const completedPhase = PHASES.find(p => p.id === completedPhaseId);
    const nextPhase = PHASES.find(p => p.id === completedPhaseId + 1);
    
    if (completedPhase) {
      return (
        <div className={cn("min-h-screen flex flex-col", className)} dir={isRTL ? 'rtl' : 'ltr'}>
          <PhaseTransition
            completedPhase={completedPhase}
            nextPhase={nextPhase}
            onContinue={handlePhaseTransitionContinue}
          />
        </div>
      );
    }
  }

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Gamified Header with Live Orb */}
      <GamifiedJourneyHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        displayedStep={displayedStep}
        isViewing={viewingStep !== null}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={handleNavigatePrev}
        onNext={handleNavigateNext}
        onClose={handleClose}
        onReset={() => setShowResetDialog(true)}
        showReset={currentStep > 1}
      />

      {/* Reset Dialog - using shared component */}
      <JourneyResetDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onConfirm={handleResetJourney}
        isResetting={isResetting}
        journeyType="launchpad"
      />
      
      {/* Step content */}
      <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl pb-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`step-${displayedStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Aurora Chat Dock */}
      <JourneyChatDock />
    </div>
  );
}
