import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, DollarSign, CheckCircle2, X } from "lucide-react";
import { useFinancesJourney } from "@/hooks/useFinancesJourney";
import { Skeleton } from "@/components/ui/skeleton";
import JourneyChatDock from '@/components/aurora/JourneyChatDock';

// Step components
import VisionStep from "./steps/VisionStep";
import CurrentStateStep from "./steps/CurrentStateStep";
import IncomeStep from "./steps/IncomeStep";
import ExpensesStep from "./steps/ExpensesStep";
import SavingsStep from "./steps/SavingsStep";
import DebtStep from "./steps/DebtStep";
import GoalsStep from "./steps/GoalsStep";
import ActionPlanStep from "./steps/ActionPlanStep";

const TOTAL_STEPS = 8;

const stepTitles = {
  he: [
    'חזון פיננסי',
    'מצב נוכחי',
    'הכנסות',
    'הוצאות',
    'חסכונות',
    'חובות',
    'מטרות',
    'תוכנית פעולה'
  ],
  en: [
    'Financial Vision',
    'Current State',
    'Income',
    'Expenses',
    'Savings',
    'Debt',
    'Goals',
    'Action Plan'
  ]
};

interface FinancesJourneyFlowProps {
  journeyId?: string;
  onComplete?: () => void;
  onClose?: () => void;
}

const FinancesJourneyFlow = ({ journeyId, onComplete, onClose }: FinancesJourneyFlowProps) => {
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
  } = useFinancesJourney(journeyId);

  const [activeStep, setActiveStep] = useState(1);
  const [stepData, setStepData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (journey && !isLoading) {
      setActiveStep(journey.current_step);
      setStepData((journey.journey_data || {}) as Record<string, unknown>);
    }
  }, [journey, isLoading]);

  const progressPercentage = ((activeStep - 1) / TOTAL_STEPS) * 100;

  const handleNext = async () => {
    const saved = await saveStepData(activeStep, stepData[`step_${activeStep}`] as Record<string, unknown> || {});
    
    if (saved) {
      if (activeStep < TOTAL_STEPS) {
        setActiveStep(prev => prev + 1);
      } else {
        await completeJourney();
        onComplete?.();
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else {
      if (onClose) onClose();
      else navigate('/finances');
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    else navigate('/finances');
  };

  const updateStepData = (stepNumber: number, data: unknown) => {
    setStepData(prev => ({
      ...prev,
      [`step_${stepNumber}`]: data
    }));
  };

  const renderStep = () => {
    const stepProps = {
      data: (stepData[`step_${activeStep}`] || {}) as Record<string, unknown>,
      onUpdate: (data: unknown) => updateStepData(activeStep, data),
      language
    };

    switch (activeStep) {
      case 1: return <VisionStep {...stepProps} />;
      case 2: return <CurrentStateStep {...stepProps} />;
      case 3: return <IncomeStep {...stepProps} />;
      case 4: return <ExpensesStep {...stepProps} />;
      case 5: return <SavingsStep {...stepProps} />;
      case 6: return <DebtStep {...stepProps} />;
      case 7: return <GoalsStep {...stepProps} />;
      case 8: return <ActionPlanStep {...stepProps} journeyData={journeyData} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-100 to-background dark:from-emerald-950/50 dark:to-background p-4 md:p-8">
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
      className="min-h-screen bg-gradient-to-b from-emerald-100 to-background dark:from-emerald-950/50 dark:to-background" 
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
              <div className="p-2 bg-emerald-500/20 dark:bg-emerald-600/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {language === 'he' ? 'מסע הפיננסים' : 'Finances Journey'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'he' 
                    ? `שלב ${activeStep} מתוך ${TOTAL_STEPS}` 
                    : `Step ${activeStep} of ${TOTAL_STEPS}`}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-900/30"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
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
              className="h-2 bg-emerald-200 dark:bg-emerald-950/50 [&>div]:bg-gradient-to-r [&>div]:from-emerald-600 [&>div]:to-emerald-400" 
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
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                        ? 'bg-emerald-500/30 dark:bg-emerald-600/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500 dark:ring-emerald-400' 
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
            className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-emerald-300/50 dark:border-emerald-800/30 p-6 shadow-lg dark:shadow-none"
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
            className="border-emerald-300 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          >
            {isRTL ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
            {language === 'he' ? 'הקודם' : 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
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

export default FinancesJourneyFlow;
