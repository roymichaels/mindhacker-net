/**
 * FlowRenderer — Orchestrator for config-driven flow steps
 * 
 * Renders one QuestionCard at a time, manages navigation,
 * progress tracking, and auto-saving.
 */
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { QuestionCard } from './QuestionCard';
import { FlowProgress } from './FlowProgress';
import { getVisibleMiniSteps, isMiniStepValid, collectStepAnswers } from '@/lib/flow/flowSpec';
import type { FlowStep, FlowAnswers, MiniStep } from '@/lib/flow/types';

interface FlowRendererProps {
  /** The current macro step spec */
  step: FlowStep;
  /** The macro step number (1-based, for display) */
  stepNumber: number;
  /** Total macro steps in the flow */
  totalSteps: number;
  /** Previously saved answers (restored from DB) */
  savedAnswers?: Record<string, unknown>;
  /** All answers across the entire flow (for branching) */
  allAnswers?: FlowAnswers;
  /** Called on every change for auto-save */
  onAutoSave: (data: Record<string, unknown>) => void;
  /** Called when all mini-steps in this macro step are complete */
  onComplete: (data: Record<string, unknown>) => void;
  /** Is the parent completing/saving */
  isCompleting?: boolean;
}

export function FlowRenderer({
  step,
  stepNumber,
  totalSteps,
  savedAnswers,
  allAnswers = {},
  onAutoSave,
  onComplete,
  isCompleting,
}: FlowRendererProps) {
  const { language, isRTL } = useTranslation();

  // Merge parent answers with local answers for branching
  const [answers, setAnswers] = useState<FlowAnswers>(() => {
    const initial: FlowAnswers = { ...allAnswers };
    if (savedAnswers) {
      Object.entries(savedAnswers).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          initial[k] = v as string | string[] | number;
        }
      });
    }
    return initial;
  });

  const [currentMiniIdx, setCurrentMiniIdx] = useState(0);

  // Recompute visible mini-steps when answers change
  const visibleMiniSteps = getVisibleMiniSteps(step, answers);
  const totalMini = visibleMiniSteps.length;
  const currentMini: MiniStep | undefined = visibleMiniSteps[currentMiniIdx];

  // Clamp index if it goes out of bounds
  useEffect(() => {
    if (currentMiniIdx >= totalMini && totalMini > 0) {
      setCurrentMiniIdx(totalMini - 1);
    }
  }, [totalMini, currentMiniIdx]);

  const handleChange = useCallback((value: string | string[] | number) => {
    if (!currentMini) return;
    setAnswers(prev => {
      const next = { ...prev, [currentMini.id]: value };
      // Auto-save the step's collected data
      const stepData = collectStepAnswers(step, next);
      onAutoSave(stepData);
      return next;
    });
  }, [currentMini, step, onAutoSave]);

  const goNext = useCallback(() => {
    if (currentMiniIdx < totalMini - 1) {
      setCurrentMiniIdx(currentMiniIdx + 1);
    } else {
      // All mini-steps done — complete the macro step
      const stepData = collectStepAnswers(step, answers);
      onComplete(stepData);
    }
  }, [currentMiniIdx, totalMini, step, answers, onComplete]);

  const goPrev = useCallback(() => {
    if (currentMiniIdx > 0) {
      setCurrentMiniIdx(currentMiniIdx - 1);
    }
  }, [currentMiniIdx]);

  const handleSkip = useCallback(() => {
    goNext();
  }, [goNext]);

  if (!currentMini) {
    // No mini-steps visible — auto-complete
    const stepData = collectStepAnswers(step, answers);
    onComplete(stepData);
    return null;
  }

  const stepTitle = language === 'he' ? step.title_he : step.title_en;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <FlowProgress
        currentStep={stepNumber}
        totalSteps={totalSteps}
        currentMiniStep={currentMiniIdx}
        totalMiniSteps={totalMini}
        stepTitle={stepTitle}
      />

      {/* Card container */}
      <div className="rounded-2xl bg-card border border-border shadow-lg p-6 md:p-8 space-y-6">
        {/* Back button */}
        {currentMiniIdx > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            className="gap-1"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {language === 'he' ? 'חזרה' : 'Back'}
          </Button>
        )}

        {/* Current question */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentMini.id}
            miniStep={currentMini}
            value={answers[currentMini.id]}
            onChange={handleChange}
            onNext={goNext}
            onSkip={handleSkip}
            showSkip={!currentMini.validation.required}
            autoAdvance={currentMini.inputType === 'single_select'}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
