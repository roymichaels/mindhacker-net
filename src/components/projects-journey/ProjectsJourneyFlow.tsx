import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useProjectsJourneyProgress, PROJECTS_JOURNEY_STEPS, PROJECTS_JOURNEY_PHASES } from '@/hooks/useProjectsJourneyProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { JourneyHeader, JourneyResetDialog, JourneyLoadingState } from '@/components/journey-shared';
import { Button } from '@/components/ui/button';
import { GenericJourneyStep } from '@/components/admin-journey/steps/GenericJourneyStep';
import { PROJECTS_STEP_CONFIGS } from './stepConfigs';

interface ProjectsJourneyFlowProps {
  className?: string;
  journeyId?: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export function ProjectsJourneyFlow({ className, journeyId, onComplete, onClose }: ProjectsJourneyFlowProps) {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const {
    currentStep, isJourneyComplete, isLoading, isCompleting, isResetting,
    totalSteps, completeStep, saveStepData, getStepData, resetJourney,
  } = useProjectsJourneyProgress(journeyId);
  
  const [viewingStep, setViewingStep] = useState<number | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const displayedStep = viewingStep ?? currentStep;

  const handleResetJourney = () => { resetJourney(); setViewingStep(null); setShowResetDialog(false); };

  const handleStepComplete = useCallback((data?: Record<string, unknown>) => {
    if (viewingStep !== null) { setViewingStep(null); return; }
    completeStep({ step: currentStep, data });
    if (currentStep === totalSteps && onComplete) onComplete();
  }, [viewingStep, currentStep, totalSteps, completeStep, onComplete]);

  const handleAutoSave = useCallback((step: number, data: Record<string, unknown>) => { saveStepData(step, data); }, [saveStepData]);
  const handleClose = () => { if (onClose) onClose(); else navigate('/projects'); };
  const handleNavigatePrev = () => { if (displayedStep > 1) setViewingStep(displayedStep - 1); };
  const handleNavigateNext = () => { if (displayedStep < currentStep) setViewingStep(displayedStep + 1 === currentStep ? null : displayedStep + 1); };
  const canGoPrev = displayedStep > 1;
  const canGoNext = isJourneyComplete ? displayedStep < totalSteps : (viewingStep !== null && displayedStep < currentStep);

  const renderCurrentStep = () => {
    const config = PROJECTS_STEP_CONFIGS[displayedStep];
    if (!config) return null;
    return (
      <GenericJourneyStep
        key={`step-${displayedStep}`}
        onComplete={handleStepComplete}
        isCompleting={viewingStep === null ? isCompleting : false}
        savedData={getStepData(displayedStep) || undefined}
        onAutoSave={(data) => handleAutoSave(displayedStep, data)}
        {...config}
      />
    );
  };

  if (isLoading) return <JourneyLoadingState theme="projects" />;

  if (isJourneyComplete && viewingStep === null) {
    return (
      <div className={cn("min-h-screen flex flex-col bg-background", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <JourneyHeader theme="projects" currentStep={currentStep} totalSteps={totalSteps} displayedStep={totalSteps}
          isViewing={false} canGoPrev={true} canGoNext={false} onPrev={handleNavigatePrev} onNext={handleNavigateNext}
          onClose={handleClose} onReset={() => setShowResetDialog(true)} showReset phases={PROJECTS_JOURNEY_PHASES} steps={PROJECTS_JOURNEY_STEPS} />
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold">{language === 'he' ? 'מסע הפרויקטים הושלם!' : 'Projects Journey Complete!'}</h2>
            <p className="text-muted-foreground">{language === 'he' ? 'כל הכבוד! אתה מוכן לנהל פרויקטים כמו מקצוען.' : 'Congratulations! You\'re ready to manage projects like a pro.'}</p>
            <Button onClick={handleClose} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-semibold">
              {language === 'he' ? 'חזור לפרויקטים' : 'Back to Projects'}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <JourneyHeader theme="projects" currentStep={currentStep} totalSteps={totalSteps} displayedStep={displayedStep}
        isViewing={viewingStep !== null} canGoPrev={canGoPrev} canGoNext={canGoNext}
        onPrev={handleNavigatePrev} onNext={handleNavigateNext} onClose={handleClose}
        onReset={() => setShowResetDialog(true)} showReset={currentStep > 1}
        phases={PROJECTS_JOURNEY_PHASES} steps={PROJECTS_JOURNEY_STEPS} />
      <JourneyResetDialog open={showResetDialog} onOpenChange={setShowResetDialog}
        onConfirm={handleResetJourney} isResetting={isResetting} journeyType="projects" />
      <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl pb-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`step-${displayedStep}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ProjectsJourneyFlow;
