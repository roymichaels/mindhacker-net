import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadProgress, STEPS, PHASES, getPhaseForStep, isLastStepInPhase } from '@/hooks/useLaunchpadProgress';
import { useGuestLaunchpadProgress } from '@/hooks/useGuestLaunchpadProgress';
import { useLaunchpadAutoSave } from '@/hooks/useLaunchpadAutoSave';
import { useGuestLaunchpadAutoSave } from '@/hooks/useGuestLaunchpadAutoSave';
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
import { GuestDashboardActivation } from './steps/GuestDashboardActivation';
import { GamifiedJourneyHeader } from './GamifiedJourneyHeader';
import { PhaseTransition } from './PhaseTransition';
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

export type LaunchpadMode = 'authenticated' | 'guest';

interface LaunchpadFlowProps {
  className?: string;
  mode?: LaunchpadMode;
  onComplete?: () => void;
  onClose?: () => void;
}

export function LaunchpadFlow({ className, mode = 'authenticated', onComplete, onClose }: LaunchpadFlowProps) {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const isGuest = mode === 'guest';
  
  // ============ Authenticated hooks ============
  const authProgress = useLaunchpadProgress();
  const authAutoSave = useLaunchpadAutoSave();
  
  // ============ Guest hooks ============
  const guestProgress = useGuestLaunchpadProgress();
  const step1Save = useGuestLaunchpadAutoSave({ stepKey: 'step_1' });
  const step2Save = useGuestLaunchpadAutoSave({ stepKey: 'step_2' });
  const step3Save = useGuestLaunchpadAutoSave({ stepKey: 'step_3' });
  const step4Save = useGuestLaunchpadAutoSave({ stepKey: 'step_4' });
  const step8Save = useGuestLaunchpadAutoSave({ stepKey: 'step_8' });
  const step9Save = useGuestLaunchpadAutoSave({ stepKey: 'step_9' });
  const step10Save = useGuestLaunchpadAutoSave({ stepKey: 'step_10' });
  
  // ============ Unified adapter ============
  const currentStep = isGuest ? guestProgress.currentStep : authProgress.currentStep;
  const isLaunchpadComplete = isGuest ? guestProgress.isLaunchpadComplete : authProgress.isLaunchpadComplete;
  const isCompleting = isGuest ? guestProgress.isCompleting : authProgress.isCompleting;
  const totalSteps = isGuest ? guestProgress.totalSteps : authProgress.totalSteps;
  const isResetting = isGuest ? guestProgress.isResetting : authProgress.isResetting;
  const isLoadingData = isGuest ? false : authAutoSave.isLoading;
  const launchpadData = isGuest ? null : authAutoSave.launchpadData;
  
  const getStepRewards = isGuest ? guestProgress.getStepRewards : authProgress.getStepRewards;
  
  const completeStep = useCallback((args: { step: number; data?: Record<string, unknown> }) => {
    if (isGuest) {
      // Map step to appropriate data key for guest
      let stepData: Record<string, unknown> | undefined;
      switch (args.step) {
        case 1:
          stepData = args.data ? { intention: JSON.stringify(args.data) } : undefined;
          break;
        case 2:
          stepData = args.data ? { profile_data: args.data } : undefined;
          break;
        case 3:
          stepData = args.data ? { lifestyle_data: args.data } : undefined;
          break;
        case 4:
          stepData = args.data ? { growth_data: args.data } : undefined;
          break;
        case 5:
          stepData = args.data ? { summary: JSON.stringify(args.data) } : undefined;
          break;
        case 6:
          stepData = args.data ? { form_data: args.data } : undefined;
          break;
        case 7:
          stepData = args.data ? { form_data: args.data } : undefined;
          break;
        case 8:
          stepData = args.data?.focusAreas ? { focus_areas: args.data.focusAreas as string[] } : undefined;
          break;
        case 9:
          stepData = args.data ? { actions: args.data } : undefined;
          break;
        case 10:
          stepData = args.data ? { final_notes: args.data.notes as string } : undefined;
          break;
        default:
          stepData = args.data;
      }
      guestProgress.completeStep({ step: args.step, data: stepData });
    } else {
      authProgress.completeStep(args);
    }
  }, [isGuest, guestProgress, authProgress]);
  
  const resetJourney = useCallback(() => {
    if (isGuest) {
      guestProgress.resetJourney();
    } else {
      authProgress.resetJourney();
    }
  }, [isGuest, guestProgress, authProgress]);
  
  const getSavedData = useCallback((step: number) => {
    if (isGuest) {
      switch (step) {
        case 1: return step1Save.loadData();
        case 2: return step2Save.loadData();
        case 3: return step3Save.loadData();
        case 4: return step4Save.loadData();
        case 8: return step8Save.loadData();
        case 9: return step9Save.loadData();
        case 10: return step10Save.loadData();
        default: return null;
      }
    } else {
      return authAutoSave.getSavedData(step);
    }
  }, [isGuest, step1Save, step2Save, step3Save, step4Save, step8Save, step9Save, step10Save, authAutoSave]);
  
  const handleAutoSave = useCallback((step: number, data: Record<string, unknown>) => {
    if (isGuest) {
      switch (step) {
        case 1: step1Save.saveData(data); break;
        case 2: step2Save.saveData(data); break;
        case 3: step3Save.saveData(data); break;
        case 4: step4Save.saveData(data); break;
        case 8: step8Save.saveData(data); break;
        case 9: step9Save.saveData(data); break;
        case 10: step10Save.saveData(data); break;
      }
    } else {
      authAutoSave.autoSave(step, data);
    }
  }, [isGuest, step1Save, step2Save, step3Save, step4Save, step8Save, step9Save, step10Save, authAutoSave]);
  
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
      navigate(isGuest ? '/free-journey' : '/dashboard');
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
      (isGuest ? guestProgress.progress?.step_2_profile_data : launchpadData?.personalProfile) || 
      undefined;

    // Step order based on phases:
    // Phase 1 (Who you are): 1-Welcome, 2-Profile, 3-LifestyleRoutine
    // Phase 2 (What's not working): 4-GrowthDeepDive, 5-FirstChat, 6-Introspection, 7-LifePlan
    // Phase 3 (Who you want to be): 8-FocusAreas, 9-FirstWeek, 10-FinalNotes, 11-Dashboard
    
    switch (displayedStep) {
      case 1:
        return (
          <WelcomeStep 
            key={`step-1-${mode}-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={getSavedData(1) as Record<string, string | string[]> | undefined}
            onAutoSave={(data) => handleAutoSave(1, data)}
          />
        );
      case 2:
        return (
          <PersonalProfileStep 
            key={`step-2-${mode}-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={(getSavedData(2) as Record<string, unknown>) ?? undefined}
            onAutoSave={(data) => handleAutoSave(2, data)}
          />
        );
      case 3:
        return (
          <LifestyleRoutineStep 
            key={`step-3-${mode}-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={(getSavedData(3) as Record<string, unknown>) ?? undefined}
            onAutoSave={(data) => handleAutoSave(3, data)}
          />
        );
      case 4:
        return (
          <GrowthDeepDiveStep 
            key={`step-4-${mode}-${viewingStep ?? 'current'}`} 
            {...stepProps} 
            previousAnswers={previousAnswers as Record<string, unknown> | undefined}
            savedData={getSavedData(4) as { answers?: Record<string, string[]>; currentAreaIndex?: number } | undefined}
            onAutoSave={(data) => handleAutoSave(4, data)}
          />
        );
      case 5:
        return (
          <FirstChatStep 
            key={`step-5-${mode}-${viewingStep ?? 'current'}`} 
            {...stepProps}
            savedData={!isGuest ? (authAutoSave.getSavedData(5) as { messages?: Array<{ role: 'user' | 'assistant'; content: string }>; questionIndex?: number; answers?: string[]; isComplete?: boolean } | undefined) : undefined}
            onAutoSave={!isGuest ? ((data) => handleAutoSave(5, data)) : undefined}
          />
        );
      case 6:
        return (
          <IntrospectionStep 
            key={`step-6-${mode}-${viewingStep ?? 'current'}`} 
            {...stepProps}
            savedFormSubmissionId={!isGuest ? (launchpadData?.step_3_form_submission_id ?? undefined) : undefined}
          />
        );
      case 7:
        return (
          <LifePlanStep 
            key={`step-7-${mode}-${viewingStep ?? 'current'}`} 
            {...stepProps}
            savedFormSubmissionId={!isGuest ? (launchpadData?.step_4_form_submission_id ?? undefined) : undefined}
          />
        );
      case 8:
        return (
          <FocusAreasStep 
            key={`step-8-${mode}-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={getSavedData(8) as { focus_areas?: string[] } | undefined}
            onAutoSave={(data) => handleAutoSave(8, data)}
          />
        );
      case 9:
        return (
          <FirstWeekStep 
            key={`step-9-${mode}-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={getSavedData(9) as { selectedQuit?: string[]; selectedBuild?: string[]; selectedCareerStatus?: string; selectedCareerGoal?: string } | undefined}
            onAutoSave={(data) => handleAutoSave(9, data as unknown as Record<string, unknown>)}
          />
        );
      case 10:
        return (
          <FinalNotesStep 
            key={`step-10-${mode}-${viewingStep ?? 'current'}`}
            {...stepProps}
            savedData={getSavedData(10) as { notes?: string } | undefined}
            onAutoSave={(data) => handleAutoSave(10, data)}
          />
        );
      case 11:
        return isGuest ? (
          <GuestDashboardActivation key={`step-11-guest-${viewingStep ?? 'current'}`} {...stepProps} />
        ) : (
          <DashboardActivation key={`step-11-auth-${viewingStep ?? 'current'}`} {...stepProps} />
        );
      default:
        return null;
    }
  };

  // Show loader while data is loading (authenticated only)
  if (!isGuest && isLoadingData) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {language === 'he' ? 'טוען את המסע שלך...' : 'Loading your journey...'}
          </p>
        </div>
      </div>
    );
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
      
      {/* Step content */}
      <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-step-${displayedStep}`}
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

export default LaunchpadFlow;
