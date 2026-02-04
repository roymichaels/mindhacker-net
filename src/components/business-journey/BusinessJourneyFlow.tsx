import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useBusinessJourneyProgress, BUSINESS_STEPS, BUSINESS_PHASES, getBusinessPhaseForStep, isLastStepInBusinessPhase } from '@/hooks/useBusinessJourneyProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BusinessJourneyHeader } from './BusinessJourneyHeader';
import { VisionStep } from './steps/VisionStep';
import { BusinessModelStep } from './steps/BusinessModelStep';
import { TargetAudienceStep } from './steps/TargetAudienceStep';
import { ValuePropositionStep } from './steps/ValuePropositionStep';
import { ChallengesStep } from './steps/ChallengesStep';
import { ResourcesStep } from './steps/ResourcesStep';
import { FinancialStep } from './steps/FinancialStep';
import { MarketingStep } from './steps/MarketingStep';
import { OperationsStep } from './steps/OperationsStep';
import { ActionPlanStep } from './steps/ActionPlanStep';
import JourneyChatDock from '@/components/aurora/JourneyChatDock';
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

interface BusinessJourneyFlowProps {
  className?: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export function BusinessJourneyFlow({ className, onComplete, onClose }: BusinessJourneyFlowProps) {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  const {
    currentStep,
    isJourneyComplete,
    isLoading,
    isCompleting,
    isResetting,
    totalSteps,
    completeStep,
    saveStepData,
    getStepData,
    resetJourney,
    getStepRewards,
  } = useBusinessJourneyProgress();
  
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
    if (onClose) {
      onClose();
    } else {
      navigate('/business');
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
      case 1:
        return <VisionStep key="step-1" {...stepProps} />;
      case 2:
        return <BusinessModelStep key="step-2" {...stepProps} />;
      case 3:
        return <TargetAudienceStep key="step-3" {...stepProps} />;
      case 4:
        return <ValuePropositionStep key="step-4" {...stepProps} />;
      case 5:
        return <ChallengesStep key="step-5" {...stepProps} />;
      case 6:
        return <ResourcesStep key="step-6" {...stepProps} />;
      case 7:
        return <FinancialStep key="step-7" {...stepProps} />;
      case 8:
        return <MarketingStep key="step-8" {...stepProps} />;
      case 9:
        return <OperationsStep key="step-9" {...stepProps} />;
      case 10:
        return <ActionPlanStep key="step-10" {...stepProps} />;
      default:
        return null;
    }
  };

  // Show loader while data is loading
  if (isLoading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-muted-foreground">
            {language === 'he' ? 'טוען את המסע העסקי שלך...' : 'Loading your business journey...'}
          </p>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (isJourneyComplete && viewingStep === null) {
    return (
      <div className={cn("min-h-screen flex flex-col bg-background", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <BusinessJourneyHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
          displayedStep={totalSteps}
          isViewing={false}
          canGoPrev={true}
          canGoNext={false}
          onPrev={handleNavigatePrev}
          onNext={handleNavigateNext}
          onClose={handleClose}
          onReset={() => setShowResetDialog(true)}
          showReset={true}
        />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold">
              {language === 'he' ? 'המסע העסקי הושלם!' : 'Business Journey Complete!'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'he' 
                ? 'כל הכבוד! אספת את כל המידע הנדרש להקמת העסק שלך. עכשיו הזמן לפעולה!'
                : 'Congratulations! You have gathered all the information needed to start your business. Now it is time for action!'}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-purple-900 font-semibold hover:from-amber-600 hover:to-yellow-500 transition-all"
            >
              {language === 'he' ? 'חזור לדף העסקים' : 'Back to Business Page'}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Business Journey Header */}
      <BusinessJourneyHeader
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
                ? 'פעולה זו תמחק את כל התשובות שלך ותתחיל את המסע העסקי מההתחלה. פעולה זו לא ניתנת לביטול.'
                : 'This will delete all your answers and start the business journey from the beginning. This action cannot be undone.'
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
        <div className="w-full max-w-2xl pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${displayedStep}`}
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

      {/* Aurora Chat Dock */}
      <JourneyChatDock />
    </div>
  );
}

export default BusinessJourneyFlow;
