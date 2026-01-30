import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadProgress, STEPS } from '@/hooks/useLaunchpadProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WelcomeStep } from './steps/WelcomeStep';
import { PersonalProfileStep } from './steps/PersonalProfileStep';
import { GrowthDeepDiveStep } from './steps/GrowthDeepDiveStep';
import { FirstChatStep } from './steps/FirstChatStep';
import { IntrospectionStep } from './steps/IntrospectionStep';
import { LifePlanStep } from './steps/LifePlanStep';
import { FocusAreasStep } from './steps/FocusAreasStep';
import { FirstWeekStep } from './steps/FirstWeekStep';
import { DashboardActivation } from './steps/DashboardActivation';
import { LaunchpadProgress } from './LaunchpadProgress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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
    isStepCompleted,
    totalSteps,
  } = useLaunchpadProgress();
  
  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const [viewingStep, setViewingStep] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  
  // The step we're actually showing (could be current or a past step we're reviewing)
  const displayedStep = viewingStep ?? currentStep;

  const handleStepComplete = (data?: Record<string, unknown>) => {
    // If viewing a past step, just go back to current
    if (viewingStep !== null) {
      setViewingStep(null);
      return;
    }
    
    // Store profile data for GrowthDeepDiveStep
    if (currentStep === 2 && data) {
      setProfileData(data);
    }
    
    completeStep({ step: currentStep, data });
    if (currentStep === 9 && onComplete) {
      onComplete();
    }
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
      if (isStepCompleted(displayedStep - 1)) {
        setViewingStep(displayedStep - 1);
      }
    }
  };

  const handleNavigateNext = () => {
    if (viewingStep !== null && viewingStep < currentStep) {
      if (viewingStep + 1 === currentStep) {
        setViewingStep(null); // Go back to current step
      } else {
        setViewingStep(viewingStep + 1);
      }
    }
  };

  const canGoPrev = displayedStep > 1 && isStepCompleted(displayedStep - 1);
  const canGoNext = viewingStep !== null && viewingStep < currentStep;

  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      isCompleting: viewingStep === null ? isCompleting : false,
      rewards: getStepRewards(displayedStep),
    };

    switch (displayedStep) {
      case 1:
        return <WelcomeStep {...stepProps} />;
      case 2:
        return <PersonalProfileStep {...stepProps} />;
      case 3:
        return <GrowthDeepDiveStep {...stepProps} previousAnswers={profileData || undefined} />;
      case 4:
        return <FirstChatStep {...stepProps} />;
      case 5:
        return <IntrospectionStep {...stepProps} />;
      case 6:
        return <LifePlanStep {...stepProps} />;
      case 7:
        return <FocusAreasStep {...stepProps} />;
      case 8:
        return <FirstWeekStep {...stepProps} />;
      case 9:
        return <DashboardActivation {...stepProps} />;
      default:
        return null;
    }
  };

  if (isLaunchpadComplete) {
    return null;
  }

  const currentStepMeta = STEPS.find(s => s.id === displayedStep);

  return (
    <div className={cn("min-h-screen flex flex-col", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with progress and navigation */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto p-4">
          {/* Top row: Close button and navigation */}
          <div className="flex items-center justify-between mb-3">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-9 w-9"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Step indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {displayedStep}/{totalSteps}
              </span>
              {viewingStep !== null && (
                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-600 rounded-full">
                  {language === 'he' ? 'צפייה' : 'Viewing'}
                </span>
              )}
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNavigatePrev}
                disabled={!canGoPrev}
                className="h-9 w-9"
              >
                {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNavigateNext}
                disabled={!canGoNext}
                className="h-9 w-9"
              >
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <LaunchpadProgress compact />
        </div>
      </div>
      
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
