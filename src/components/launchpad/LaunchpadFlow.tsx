import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
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

interface LaunchpadFlowProps {
  className?: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export function LaunchpadFlow({ className, onComplete, onClose }: LaunchpadFlowProps) {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { 
    currentStep, 
    isLaunchpadComplete, 
    completeStep, 
    isCompleting,
    getStepRewards,
    totalSteps,
    resetJourney,
    isResetting,
  } = useLaunchpadProgress();
  
  const { autoSave, getSavedData, isLoading: isLoadingData, launchpadData } = useLaunchpadAutoSave();
  
  const [viewingStep, setViewingStep] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [showingPhaseTransition, setShowingPhaseTransition] = useState(false);
  const [completedPhaseId, setCompletedPhaseId] = useState<number | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // The step we're actually showing (could be current or a past step we're reviewing)
  const displayedStep = viewingStep ?? currentStep;
  const currentStepMeta = STEPS.find(s => s.id === displayedStep);
  const currentPhase = getPhaseForStep(displayedStep);

  const handleResetJourney = () => {
    resetJourney();
    setViewingStep(null);
    setShowResetDialog(false);
  };

  const handleStepComplete = (data?: Record<string, unknown>) => {
    // If viewing a past step, just go back to current
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
      navigate('/dashboard');
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
  // If complete, allow navigating through all steps; otherwise only to current
  const canGoNext = isLaunchpadComplete 
    ? displayedStep < 11 
    : (viewingStep !== null && displayedStep < currentStep);

  // Auto-save handler for each step
  const handleAutoSave = useCallback((step: number, data: Record<string, unknown>) => {
    autoSave(step, data);
  }, [autoSave]);

  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      isCompleting: viewingStep === null ? isCompleting : false,
      rewards: getStepRewards(displayedStep),
    };

    // New step order based on phases:
    // Phase 1 (Who you are): 1-Welcome, 2-Profile, 3-LifestyleRoutine
    // Phase 2 (What's not working): 4-GrowthDeepDive, 5-FirstChat, 6-Introspection, 7-LifePlan
    // Phase 3 (Who you want to be): 8-FocusAreas, 9-FirstWeek, 10-FinalNotes, 11-Dashboard
    
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
            savedData={getSavedData(2) ?? undefined}
            onAutoSave={(data) => handleAutoSave(2, data)}
          />
        );
      case 3:
        return (
          <LifestyleRoutineStep 
            key={`step-3-${viewingStep ?? 'current'}`}
            {...stepProps} 
            savedData={getSavedData(3) ?? undefined}
            onAutoSave={(data) => handleAutoSave(3, data)}
          />
        );
      case 4:
        return (
          <GrowthDeepDiveStep 
            key={`step-4-${viewingStep ?? 'current'}`} 
            {...stepProps} 
            previousAnswers={profileData || launchpadData?.personalProfile as Record<string, unknown> || undefined}
            savedData={getSavedData(4) as { answers?: Record<string, string[]>; currentAreaIndex?: number } | undefined}
            onAutoSave={(data) => handleAutoSave(4, data)}
          />
        );
      case 5:
        return (
          <FirstChatStep 
            key={`step-5-${viewingStep ?? 'current'}`} 
            {...stepProps}
            savedData={getSavedData(5) as { messages?: Array<{ role: 'user' | 'assistant'; content: string }>; questionIndex?: number; answers?: string[]; isComplete?: boolean } | undefined}
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
        return <DashboardActivation key={`step-11-${viewingStep ?? 'current'}`} {...stepProps} />;
      default:
        return null;
    }
  };

  // Allow completed users to view the journey (removed redirect)

  // CRITICAL FIX: Show loader while data is loading to prevent components
  // from mounting with null savedData and triggering autoSave that overwrites DB
  if (isLoadingData) {
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
    <div className={cn("min-h-screen flex flex-col", className)} dir={isRTL ? 'rtl' : 'ltr'}>
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
              key={displayedStep}
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
