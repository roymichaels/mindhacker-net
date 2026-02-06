import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Palette, CheckCircle2, X } from "lucide-react";
import { useHobbiesJourney } from "@/hooks/useHobbiesJourney";
import { Skeleton } from "@/components/ui/skeleton";
import JourneyChatDock from '@/components/aurora/JourneyChatDock';

// Import all step components
import DiscoveryStep from "./steps/DiscoveryStep";
import PassionStep from "./steps/PassionStep";
import TimeStep from "./steps/TimeStep";
import CreativityStep from "./steps/CreativityStep";
import SocialStep from "./steps/SocialStep";
import GrowthStep from "./steps/GrowthStep";
import BalanceStep from "./steps/BalanceStep";
import ActionPlanStep from "./steps/ActionPlanStep";

const TOTAL_STEPS = 8;

const stepTitles = {
  he: [
    'גילוי תחביבים',
    'תשוקות',
    'זמן פנוי',
    'יצירתיות',
    'חברתי',
    'התפתחות',
    'איזון',
    'תוכנית פעולה'
  ],
  en: [
    'Discovery',
    'Passions',
    'Time',
    'Creativity',
    'Social',
    'Growth',
    'Balance',
    'Action Plan'
  ]
};

const HobbiesJourneyFlow = () => {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const {
    journey,
    isLoading,
    isSaving,
    saveStepData,
    completeJourney,
    currentStep,
    getStepData
  } = useHobbiesJourney(journeyId);

  const [activeStep, setActiveStep] = useState(1);
  const [stepData, setStepData] = useState<Record<string, Record<string, unknown>>>({});

  // Sync active step with journey data
  useEffect(() => {
    if (journey && !isLoading) {
      setActiveStep(journey.current_step);
      // Load existing step data
      const existingData: Record<string, Record<string, unknown>> = {};
      for (let i = 1; i <= TOTAL_STEPS; i++) {
        existingData[`step_${i}`] = getStepData(i);
      }
      setStepData(existingData);
    }
  }, [journey, isLoading, getStepData]);

  const progressPercentage = ((activeStep - 1) / TOTAL_STEPS) * 100;

  const handleNext = async () => {
    // Save current step data
    const saved = await saveStepData(activeStep, stepData[`step_${activeStep}`] || {});
    
    if (saved) {
      if (activeStep < TOTAL_STEPS) {
        setActiveStep(prev => prev + 1);
      } else {
        // Complete journey
        await completeJourney();
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else {
      navigate('/hobbies');
    }
  };

  const updateStepData = (stepNumber: number, data: Record<string, unknown>) => {
    setStepData(prev => ({
      ...prev,
      [`step_${stepNumber}`]: data
    }));
  };

  const renderStep = () => {
    const stepProps = {
      data: stepData[`step_${activeStep}`] || {},
      onUpdate: (data: Record<string, unknown>) => updateStepData(activeStep, data),
      language
    };

    switch (activeStep) {
      case 1:
        return <DiscoveryStep {...stepProps} />;
      case 2:
        return <PassionStep {...stepProps} />;
      case 3:
        return <TimeStep {...stepProps} />;
      case 4:
        return <CreativityStep {...stepProps} />;
      case 5:
        return <SocialStep {...stepProps} />;
      case 6:
        return <GrowthStep {...stepProps} />;
      case 7:
        return <BalanceStep {...stepProps} />;
      case 8:
        return <ActionPlanStep {...stepProps} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-100 to-background dark:from-teal-950/50 dark:to-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-teal-100 to-background dark:from-teal-950/50 dark:to-background" 
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 dark:bg-teal-600/20 rounded-lg">
                <Palette className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                  {language === 'he' ? 'מסע התחביבים' : 'Hobbies Journey'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'he' 
                    ? `שלב ${activeStep} מתוך ${TOTAL_STEPS}` 
                    : `Step ${activeStep} of ${TOTAL_STEPS}`}
                </p>
              </div>
            </div>
            
            {/* Exit Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/hobbies')}
              className="text-muted-foreground hover:text-teal-400 hover:bg-teal-900/30"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-teal-700 dark:text-teal-400">
                {language === 'he' 
                  ? stepTitles.he[activeStep - 1] 
                  : stepTitles.en[activeStep - 1]}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-teal-200 dark:bg-teal-950/50 [&>div]:bg-gradient-to-r [&>div]:from-teal-600 [&>div]:to-cyan-400" 
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < activeStep;
              const isCurrent = stepNum === activeStep;
              
              return (
                <button
                  key={idx}
                  onClick={() => stepNum <= currentStep && setActiveStep(stepNum)}
                  disabled={stepNum > currentStep}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isCompleted 
                      ? 'bg-teal-600 text-white' 
                      : isCurrent 
                        ? 'bg-teal-500/30 dark:bg-teal-600/30 text-teal-700 dark:text-teal-400 ring-2 ring-teal-500 dark:ring-teal-400' 
                        : 'bg-gray-200 dark:bg-gray-800/50 text-gray-500'
                  } ${stepNum <= currentStep ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-teal-300/50 dark:border-teal-800/30 p-6 shadow-lg dark:shadow-none"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between mt-6"
        >
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-teal-300 dark:border-teal-800/50 hover:bg-teal-100 dark:hover:bg-teal-900/30"
          >
            {isRTL ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
            {language === 'he' ? 'הקודם' : 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400"
          >
            {isSaving ? (
              <span className="animate-pulse">
                {language === 'he' ? 'שומר...' : 'Saving...'}
              </span>
            ) : activeStep === TOTAL_STEPS ? (
              <>
                {language === 'he' ? 'סיים מסע' : 'Complete Journey'}
                <CheckCircle2 className="w-4 h-4 ms-2" />
              </>
            ) : (
              <>
                {language === 'he' ? 'הבא' : 'Next'}
                {isRTL ? <ArrowLeft className="w-4 h-4 ms-2" /> : <ArrowRight className="w-4 h-4 ms-2" />}
              </>
            )}
          </Button>
        </motion.div>
      </div>
      <JourneyChatDock />
    </div>
  );
};

export default HobbiesJourneyFlow;
