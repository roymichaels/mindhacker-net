import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeStep } from './steps/WelcomeStep';
import { FirstChatStep } from './steps/FirstChatStep';
import { IntrospectionStep } from './steps/IntrospectionStep';
import { LifePlanStep } from './steps/LifePlanStep';
import { FocusAreasStep } from './steps/FocusAreasStep';
import { FirstWeekStep } from './steps/FirstWeekStep';
import { DashboardActivation } from './steps/DashboardActivation';
import { LaunchpadProgress } from './LaunchpadProgress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LaunchpadFlowProps {
  className?: string;
  onComplete?: () => void;
}

export function LaunchpadFlow({ className, onComplete }: LaunchpadFlowProps) {
  const { language, isRTL } = useTranslation();
  const { 
    currentStep, 
    isLaunchpadComplete, 
    completeStep, 
    isCompleting,
    getStepRewards 
  } = useLaunchpadProgress();
  
  const [stepData, setStepData] = useState<Record<string, unknown>>({});

  const handleStepComplete = (data?: Record<string, unknown>) => {
    completeStep({ step: currentStep, data });
    if (currentStep === 7 && onComplete) {
      onComplete();
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      isCompleting,
      rewards: getStepRewards(currentStep),
    };

    switch (currentStep) {
      case 1:
        return <WelcomeStep {...stepProps} />;
      case 2:
        return <FirstChatStep {...stepProps} />;
      case 3:
        return <IntrospectionStep {...stepProps} />;
      case 4:
        return <LifePlanStep {...stepProps} />;
      case 5:
        return <FocusAreasStep {...stepProps} />;
      case 6:
        return <FirstWeekStep {...stepProps} />;
      case 7:
        return <DashboardActivation {...stepProps} />;
      default:
        return null;
    }
  };

  if (isLaunchpadComplete) {
    return null;
  }

  return (
    <div className={cn("min-h-screen flex flex-col", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with progress */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b p-4">
        <div className="max-w-2xl mx-auto">
          <LaunchpadProgress compact />
        </div>
      </div>
      
      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
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
