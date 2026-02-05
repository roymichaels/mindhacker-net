import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Heart, CheckCircle2, X } from "lucide-react";
import { useHealthJourney } from "@/hooks/useHealthJourney";
import { Skeleton } from "@/components/ui/skeleton";

// Import all step components
import HealthVisionStep from "./steps/HealthVisionStep";
import CurrentStateStep from "./steps/CurrentStateStep";
import NutritionStep from "./steps/NutritionStep";
import ExerciseStep from "./steps/ExerciseStep";
import SleepStep from "./steps/SleepStep";
import StressStep from "./steps/StressStep";
import BeliefsStep from "./steps/BeliefsStep";
import ActivationStep from "./steps/ActivationStep";

const TOTAL_STEPS = 8;

const stepTitles = {
  he: [
    'חזון בריאות',
    'מצב נוכחי',
    'תזונה',
    'פעילות גופנית',
    'שינה ומנוחה',
    'מתח ורגש',
    'אמונות מגבילות',
    'סיכום והפעלה'
  ],
  en: [
    'Health Vision',
    'Current State',
    'Nutrition',
    'Exercise',
    'Sleep & Rest',
    'Stress & Emotions',
    'Limiting Beliefs',
    'Summary & Activation'
  ]
};

const HealthJourneyContainer = () => {
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
    journeyData,
    goToStep
  } = useHealthJourney(journeyId);

  const [activeStep, setActiveStep] = useState(1);
  const [stepData, setStepData] = useState<Record<string, any>>({});

  // Sync active step with journey data
  useEffect(() => {
    if (journey && !isLoading) {
      setActiveStep(journey.current_step);
      setStepData(journey.journey_data || {});
    }
  }, [journey, isLoading]);

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
      navigate('/health');
    }
  };

  const updateStepData = (stepNumber: number, data: any) => {
    setStepData(prev => ({
      ...prev,
      [`step_${stepNumber}`]: data
    }));
  };

  const renderStep = () => {
    const stepProps = {
      data: stepData[`step_${activeStep}`] || {},
      onUpdate: (data: any) => updateStepData(activeStep, data),
      language
    };

    switch (activeStep) {
      case 1:
        return <HealthVisionStep {...stepProps} />;
      case 2:
        return <CurrentStateStep {...stepProps} />;
      case 3:
        return <NutritionStep {...stepProps} />;
      case 4:
        return <ExerciseStep {...stepProps} />;
      case 5:
        return <SleepStep {...stepProps} />;
      case 6:
        return <StressStep {...stepProps} />;
      case 7:
        return <BeliefsStep {...stepProps} />;
      case 8:
        return <ActivationStep {...stepProps} journeyData={journeyData} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-100 to-background dark:from-red-950/50 dark:to-background p-4 md:p-8">
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
      className="min-h-screen bg-gradient-to-b from-red-100 to-background dark:from-red-950/50 dark:to-background" 
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
              <div className="p-2 bg-red-500/20 dark:bg-red-600/20 rounded-lg">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {language === 'he' ? 'מסע הבריאות' : 'Health Journey'}
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
              onClick={() => navigate('/health')}
              className="text-muted-foreground hover:text-red-400 hover:bg-red-900/30"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-red-700 dark:text-red-400">
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
              className="h-2 bg-red-200 dark:bg-red-950/50 [&>div]:bg-gradient-to-r [&>div]:from-red-600 [&>div]:to-red-400" 
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
                      ? 'bg-red-600 text-white' 
                      : isCurrent 
                        ? 'bg-red-500/30 dark:bg-red-600/30 text-red-700 dark:text-red-400 ring-2 ring-red-500 dark:ring-red-400' 
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
            className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-red-300/50 dark:border-red-800/30 p-6 shadow-lg dark:shadow-none"
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
            className="border-red-300 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            {isRTL ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
            {language === 'he' ? 'הקודם' : 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
          >
            {isSaving ? (
              <span className="animate-pulse">
                {language === 'he' ? 'שומר...' : 'Saving...'}
              </span>
            ) : activeStep === TOTAL_STEPS ? (
              <>
                {language === 'he' ? 'סיים וצור תוכנית' : 'Finish & Create Plan'}
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

export default HealthJourneyContainer;
