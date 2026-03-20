import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useCoachingJourneyProgress, COACHING_STEPS, COACHING_PHASES } from '@/hooks/useCoachingJourneyProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { JourneyHeader, JourneyResetDialog, JourneyLoadingState } from '@/components/journey-shared';
import { CoachVisionStep } from './steps/CoachVisionStep';
import { CoachNicheStep } from './steps/CoachNicheStep';
import { CoachMethodologyStep } from './steps/CoachMethodologyStep';
import { CoachIdealClientStep } from './steps/CoachIdealClientStep';
import { CoachValuePropStep } from './steps/CoachValuePropStep';
import { CoachCredentialsStep } from './steps/CoachCredentialsStep';
import { CoachServicesStep } from './steps/CoachServicesStep';
import { CoachMarketingStep } from './steps/CoachMarketingStep';
import { CoachOperationsStep } from './steps/CoachOperationsStep';
import { CoachActionPlanStep } from './steps/CoachActionPlanStep';
import JourneyChatDock from '@/components/aurora/JourneyChatDock';

interface CoachingJourneyFlowProps {
  className?: string;
  journeyId?: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export function CoachingJourneyFlow({ className, journeyId, onComplete, onClose }: CoachingJourneyFlowProps) {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  const {
    currentStep, isJourneyComplete, isLoading, isCompleting, isResetting,
    totalSteps, completeStep, saveStepData, getStepData, resetJourney, getStepRewards,
  } = useCoachingJourneyProgress(journeyId);
  
  const [viewingStep, setViewingStep] = useState<number | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  const displayedStep = viewingStep ?? currentStep;

  const handleResetJourney = () => {
    resetJourney();
    setViewingStep(null);
    setShowResetDialog(false);
  };

  const handleStepComplete = useCallback((data?: Record<string, unknown>) => {
    if (viewingStep !== null) {
      setViewingStep(null);
      return;
    }
    completeStep({ step: currentStep, data });
    if (currentStep === totalSteps && onComplete) {
      onComplete();
    }
  }, [viewingStep, currentStep, totalSteps, completeStep, onComplete]);

  const handleAutoSave = useCallback((step: number, data: Record<string, unknown>) => {
    saveStepData(step, data);
  }, [saveStepData]);

  const handleClose = () => {
    if (onClose) onClose();
    else navigate('/coaches');
  };

  const handleNavigatePrev = () => {
    if (displayedStep > 1) setViewingStep(displayedStep - 1);
  };

  const handleNavigateNext = () => {
    if (displayedStep < currentStep) {
      setViewingStep(displayedStep + 1 === currentStep ? null : displayedStep + 1);
    }
  };

  const canGoPrev = displayedStep > 1;
  const canGoNext = isJourneyComplete 
    ? displayedStep < totalSteps 
    : (viewingStep !== null && displayedStep < currentStep);

  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      isCompleting: viewingStep === null ? isCompleting : false,
      savedData: getStepData(displayedStep) || undefined,
      onAutoSave: (data: Record<string, unknown>) => handleAutoSave(displayedStep, data),
    };
    
    switch (displayedStep) {
      case 1: return <CoachVisionStep key="step-1" {...stepProps} />;
      case 2: return <CoachNicheStep key="step-2" {...stepProps} />;
      case 3: return <CoachMethodologyStep key="step-3" {...stepProps} />;
      case 4: return <CoachIdealClientStep key="step-4" {...stepProps} />;
      case 5: return <CoachValuePropStep key="step-5" {...stepProps} />;
      case 6: return <CoachCredentialsStep key="step-6" {...stepProps} />;
      case 7: return <CoachServicesStep key="step-7" {...stepProps} />;
      case 8: return <CoachMarketingStep key="step-8" {...stepProps} />;
      case 9: return <CoachOperationsStep key="step-9" {...stepProps} />;
      case 10: return <CoachActionPlanStep key="step-10" {...stepProps} />;
      default: return null;
    }
  };

  if (isLoading) {
    return <JourneyLoadingState theme="coaching" />;
  }

  if (isJourneyComplete && viewingStep === null) {
    return (
      <div className={cn("min-h-screen flex flex-col bg-background", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <JourneyHeader theme="coaching" currentStep={currentStep} totalSteps={totalSteps} displayedStep={totalSteps}
          isViewing={false} canGoPrev={true} canGoNext={false} onPrev={handleNavigatePrev} onNext={handleNavigateNext}
          onClose={handleClose} onReset={() => setShowResetDialog(true)} showReset={true}
          phases={COACHING_PHASES} steps={COACHING_STEPS} />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold">
              {language === 'he' ? 'מסע האימון הושלם!' : 'Coaching Journey Complete!'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'he' 
                ? 'כל הכבוד! הפרופיל שלך כמאמן מוכן. הירשם ל-Coach Pro כדי להופיע בדף המאמנים ולהתחיל לקבל לקוחות!'
                : 'Congratulations! Your coach profile is ready. Subscribe to Coach Pro to appear on the Coaches page and start getting clients!'}
            </p>
            <div className="space-y-3">
              <Button onClick={handleClose}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold hover:from-orange-600 hover:to-amber-500 transition-all">
                {language === 'he' ? 'חזור לדף המאמנים' : 'Back to Coaches Page'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <JourneyHeader theme="coaching" currentStep={currentStep} totalSteps={totalSteps} displayedStep={displayedStep}
        isViewing={viewingStep !== null} canGoPrev={canGoPrev} canGoNext={canGoNext}
        onPrev={handleNavigatePrev} onNext={handleNavigateNext} onClose={handleClose}
        onReset={() => setShowResetDialog(true)} showReset={currentStep > 1}
        phases={COACHING_PHASES} steps={COACHING_STEPS} />

      <JourneyResetDialog open={showResetDialog} onOpenChange={setShowResetDialog}
        onConfirm={handleResetJourney} isResetting={isResetting} journeyType="business" />
      
      <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl pb-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`step-${displayedStep}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <JourneyChatDock />
    </div>
  );
}

export default CoachingJourneyFlow;
