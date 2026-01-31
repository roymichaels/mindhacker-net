import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useGuestLaunchpadProgress } from '@/hooks/useGuestLaunchpadProgress';
import { useGuestLaunchpadAutoSave } from '@/hooks/useGuestLaunchpadAutoSave';
import { STEPS, PHASES, getPhaseForStep, isLastStepInPhase } from '@/hooks/useLaunchpadProgress';
import { motion, AnimatePresence } from 'framer-motion';
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
import { GuestDashboardActivation } from './steps/GuestDashboardActivation';
import { PhaseTransition } from './PhaseTransition';
import { GamifiedJourneyHeader } from './GamifiedJourneyHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    resetJourney,
    isResetting,
  } = useGuestLaunchpadProgress();
  
  // Auto-save hooks for each step
  const step1Save = useGuestLaunchpadAutoSave({ stepKey: 'step_1' });
  const step2Save = useGuestLaunchpadAutoSave({ stepKey: 'step_2' });
  const step3Save = useGuestLaunchpadAutoSave({ stepKey: 'step_3' });
  const step4Save = useGuestLaunchpadAutoSave({ stepKey: 'step_4' });
  const step8Save = useGuestLaunchpadAutoSave({ stepKey: 'step_8' });
  const step9Save = useGuestLaunchpadAutoSave({ stepKey: 'step_9' });
  const step10Save = useGuestLaunchpadAutoSave({ stepKey: 'step_10' });
  
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
    
    // Map step to appropriate data key - same as LaunchpadFlow
    // Phase 1 (Who you are): 1-Welcome, 2-Profile, 3-LifestyleRoutine
    // Phase 2 (What's not working): 4-GrowthDeepDive, 5-FirstChat, 6-Introspection, 7-LifePlan
    // Phase 3 (Who you want to be): 8-FocusAreas, 9-FirstWeek, 10-FinalNotes, 11-Dashboard
    let stepData: Record<string, unknown> | undefined;
    switch (currentStep) {
      case 1:
        stepData = data ? { intention: JSON.stringify(data) } : undefined;
        break;
      case 2:
        stepData = data ? { profile_data: data } : undefined;
        break;
      case 3:
        stepData = data ? { lifestyle_data: data } : undefined;
        break;
      case 4:
        stepData = data ? { growth_data: data } : undefined;
        break;
      case 5:
        stepData = data ? { summary: JSON.stringify(data) } : undefined;
        break;
      case 6:
        stepData = data ? { form_data: data } : undefined;
        break;
      case 7:
        stepData = data ? { form_data: data } : undefined;
        break;
      case 8:
        stepData = data?.focusAreas ? { focus_areas: data.focusAreas as string[] } : undefined;
        break;
      case 9:
        stepData = data ? { actions: data } : undefined;
        break;
      case 10:
        stepData = data ? { final_notes: data.notes as string } : undefined;
        break;
      default:
        stepData = data;
    }
    
    completeStep({ step: currentStep, data: stepData });
    
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
      window.history.back();
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
      case 4:
        step4Save.saveData(data);
        break;
      case 8:
        step8Save.saveData(data);
        break;
      case 9:
        step9Save.saveData(data);
        break;
      case 10:
        step10Save.saveData(data);
        break;
    }
  }, [step1Save, step2Save, step3Save, step4Save, step8Save, step9Save, step10Save]);

  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      isCompleting: viewingStep === null ? isCompleting : false,
      rewards: getStepRewards(displayedStep),
    };

    // Same step order as LaunchpadFlow:
    // Phase 1 (Who you are): 1-Welcome, 2-Profile, 3-LifestyleRoutine
    // Phase 2 (What's not working): 4-GrowthDeepDive, 5-FirstChat, 6-Introspection, 7-LifePlan
    // Phase 3 (Who you want to be): 8-FocusAreas, 9-FirstWeek, 10-FinalNotes, 11-Dashboard
    
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
          <LifestyleRoutineStep 
            {...stepProps}
            onAutoSave={(data) => handleAutoSave(3, data)}
            savedData={step3Save.loadData() || undefined}
            key={`guest-step-3-${displayedStep}`}
          />
        );
      case 4:
        return (
          <GrowthDeepDiveStep 
            {...stepProps}
            previousAnswers={profileData || progress?.step_2_profile_data || undefined}
            onAutoSave={(data) => handleAutoSave(4, data)}
            savedData={step4Save.loadData() || undefined}
            key={`guest-step-4-${displayedStep}`}
          />
        );
      case 5:
        return (
          <FirstChatStep 
            {...stepProps}
            key={`guest-step-5-${displayedStep}`}
          />
        );
      case 6:
        return (
          <IntrospectionStep 
            {...stepProps}
            key={`guest-step-6-${displayedStep}`}
          />
        );
      case 7:
        return (
          <LifePlanStep 
            {...stepProps}
            key={`guest-step-7-${displayedStep}`}
          />
        );
      case 8:
        return (
          <FocusAreasStep 
            {...stepProps}
            savedData={step8Save.loadData() as { focus_areas?: string[] } | undefined}
            onAutoSave={(data) => handleAutoSave(8, data)}
            key={`guest-step-8-${displayedStep}`}
          />
        );
      case 9:
        return (
          <FirstWeekStep 
            {...stepProps}
            savedData={step9Save.loadData() as { selectedQuit?: string[]; selectedBuild?: string[]; selectedCareerStatus?: string; selectedCareerGoal?: string } | undefined}
            onAutoSave={(data) => handleAutoSave(9, data as unknown as Record<string, unknown>)}
            key={`guest-step-9-${displayedStep}`}
          />
        );
      case 10:
        return (
          <FinalNotesStep 
            {...stepProps}
            savedData={step10Save.loadData() as { notes?: string } | undefined}
            onAutoSave={(data) => handleAutoSave(10, data)}
            key={`guest-step-10-${displayedStep}`}
          />
        );
      case 11:
        return (
          <GuestDashboardActivation 
            {...stepProps}
            key={`guest-step-11-${displayedStep}`}
          />
        );
      default:
        return null;
    }
  };

  // Show phase transition screen
  if (showingPhaseTransition && completedPhaseId !== null) {
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
      {/* Gamified Header with Orb - same as authenticated flow */}
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

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'he' ? 'התחל מסע מחדש?' : 'Start Journey Over?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'he' 
                ? 'פעולה זו תמחק את כל התשובות שלך ותתחיל את המסע מההתחלה. פעולה זו לא ניתנת לביטול.'
                : 'This will delete all your answers and start the journey from the beginning. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <AlertDialogCancel>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetJourney}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting 
                ? (language === 'he' ? 'מאפס...' : 'Resetting...')
                : (language === 'he' ? 'התחל מחדש' : 'Start Over')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Step content - same layout as LaunchpadFlow */}
      <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`guest-step-${displayedStep}`}
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
