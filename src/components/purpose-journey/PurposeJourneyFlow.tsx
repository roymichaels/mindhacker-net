import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Compass, CheckCircle2, X } from "lucide-react";
import { usePurposeJourney } from "@/hooks/usePurposeJourney";
import { Skeleton } from "@/components/ui/skeleton";

// Import all step components
import VisionStep from "./steps/VisionStep";
import ValuesStep from "./steps/ValuesStep";
import MeaningStep from "./steps/MeaningStep";
import MissionStep from "./steps/MissionStep";
import StrengthsStep from "./steps/StrengthsStep";
import ContributionStep from "./steps/ContributionStep";
import LegacyStep from "./steps/LegacyStep";
import ActionPlanStep from "./steps/ActionPlanStep";

const TOTAL_STEPS = 8;

const stepTitles = {
  he: [
    'חזון ייעודי',
    'ערכי ליבה',
    'משמעות',
    'שליחות',
    'חוזקות ייחודיות',
    'תרומה לעולם',
    'מורשת',
    'תוכנית פעולה'
  ],
  en: [
    'Purpose Vision',
    'Core Values',
    'Meaning',
    'Mission',
    'Unique Strengths',
    'Contribution',
    'Legacy',
    'Action Plan'
  ]
};

const PurposeJourneyFlow = () => {
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
  } = usePurposeJourney(journeyId);

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
      navigate('/purpose');
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
        return <VisionStep {...stepProps} />;
      case 2:
        return <ValuesStep {...stepProps} />;
      case 3:
        return <MeaningStep {...stepProps} />;
      case 4:
        return <MissionStep {...stepProps} />;
      case 5:
        return <StrengthsStep {...stepProps} />;
      case 6:
        return <ContributionStep {...stepProps} />;
      case 7:
        return <LegacyStep {...stepProps} />;
      case 8:
        return <ActionPlanStep {...stepProps} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-background dark:from-purple-950/50 dark:to-background p-4 md:p-8">
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
      className="min-h-screen bg-gradient-to-b from-purple-100 to-background dark:from-purple-950/50 dark:to-background" 
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
              <div className="p-2 bg-purple-500/20 dark:bg-purple-600/20 rounded-lg">
                <Compass className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {language === 'he' ? 'מסע הייעוד' : 'Purpose Journey'}
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
              onClick={() => navigate('/purpose')}
              className="text-muted-foreground hover:text-purple-400 hover:bg-purple-900/30"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-purple-700 dark:text-purple-400">
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
              className="h-2 bg-purple-200 dark:bg-purple-950/50 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-fuchsia-400" 
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
                      ? 'bg-purple-600 text-white' 
                      : isCurrent 
                        ? 'bg-purple-500/30 dark:bg-purple-600/30 text-purple-700 dark:text-purple-400 ring-2 ring-purple-500 dark:ring-purple-400' 
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
            className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-purple-300/50 dark:border-purple-800/30 p-6 shadow-lg dark:shadow-none"
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
            className="border-purple-300 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {isRTL ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
            {language === 'he' ? 'הקודם' : 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400"
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
    </div>
  );
};

export default PurposeJourneyFlow;
