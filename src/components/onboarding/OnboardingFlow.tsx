/**
 * OnboardingFlow — Full-screen 5-step identity calibration orchestrator.
 * 
 * Dark background, no nav, auto-advance, 5-segment progress.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import onboardingFlowSpec, { FRICTION_PILLAR_MAP } from '@/flows/onboardingFlowSpec';
import { getVisibleMiniSteps } from '@/lib/flow/flowSpec';
import { OnboardingReveal } from './OnboardingReveal';
import type { FlowAnswers, MiniStep, FlowOption } from '@/lib/flow/types';
import { cn } from '@/lib/utils';

export function OnboardingFlow() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const isHe = language === 'he';

  const [answers, setAnswers] = useState<FlowAnswers>({});
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [currentMiniIdx, setCurrentMiniIdx] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout>>();

  const steps = onboardingFlowSpec.steps;
  const currentStep = steps[currentStepIdx];
  const visibleMiniSteps = currentStep ? getVisibleMiniSteps(currentStep, answers) : [];
  const currentMini: MiniStep | undefined = visibleMiniSteps[currentMiniIdx];

  // Compute overall progress (flat across all mini-steps)
  const totalMiniSteps = steps.reduce((acc, step) => {
    const visible = getVisibleMiniSteps(step, answers);
    return acc + (visible.length || 1);
  }, 0);
  
  let completedMinis = 0;
  for (let i = 0; i < currentStepIdx; i++) {
    completedMinis += getVisibleMiniSteps(steps[i], answers).length || 1;
  }
  completedMinis += currentMiniIdx;

  // Auto-save on every change
  const autoSave = useCallback(async (updatedAnswers: FlowAnswers) => {
    if (!user?.id) return;
    try {
      const step1Data: Record<string, unknown> = {};
      const step2Data: Record<string, unknown> = {};
      
      ['friction_type', 'specific_tension', 'desired_shift', 'commitment_level'].forEach(key => {
        if (updatedAnswers[key]) step1Data[key] = updatedAnswers[key];
      });
      if (updatedAnswers.friction_type) {
        step1Data.selected_pillar = FRICTION_PILLAR_MAP[updatedAnswers.friction_type as string] || 'mind';
      }
      ['age_range', 'work_structure', 'experience_level'].forEach(key => {
        if (updatedAnswers[key]) step2Data[key] = updatedAnswers[key];
      });

      await supabase.from('launchpad_progress').upsert({
        user_id: user.id,
        step_1_intention: step1Data as any,
        step_2_profile_data: step2Data as any,
        current_step: currentStepIdx + 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Auto-save error:', e);
    }
  }, [user?.id, currentStepIdx]);

  const advanceToNext = useCallback(() => {
    setSelectedValue(null);
    
    if (currentMiniIdx < visibleMiniSteps.length - 1) {
      setCurrentMiniIdx(currentMiniIdx + 1);
    } else if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setCurrentMiniIdx(0);
    } else {
      setShowReveal(true);
    }
  }, [currentMiniIdx, visibleMiniSteps.length, currentStepIdx, steps.length]);

  const handleSelect = useCallback((value: string) => {
    if (!currentMini) return;
    setSelectedValue(value);
    
    const updated = { ...answers, [currentMini.id]: value };
    setAnswers(updated);
    autoSave(updated);

    // Auto-advance after 400ms
    if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    advanceTimeout.current = setTimeout(() => {
      advanceToNext();
    }, 400);
  }, [currentMini, answers, autoSave, advanceToNext]);

  const goBack = useCallback(() => {
    setSelectedValue(null);
    if (currentMiniIdx > 0) {
      setCurrentMiniIdx(currentMiniIdx - 1);
    } else if (currentStepIdx > 0) {
      const prevStep = steps[currentStepIdx - 1];
      const prevVisible = getVisibleMiniSteps(prevStep, answers);
      setCurrentStepIdx(currentStepIdx - 1);
      setCurrentMiniIdx(Math.max(0, prevVisible.length - 1));
    }
  }, [currentMiniIdx, currentStepIdx, steps, answers]);

  useEffect(() => {
    return () => {
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    };
  }, []);

  if (showReveal) {
    return <OnboardingReveal answers={answers} />;
  }

  if (!currentMini) return null;

  const canGoBack = currentStepIdx > 0 || currentMiniIdx > 0;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 5-segment progress bar */}
      <div className="flex gap-1 px-6 pt-6">
        {steps.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{
                width: idx < currentStepIdx ? '100%' : idx === currentStepIdx ? `${((currentMiniIdx + 1) / (visibleMiniSteps.length || 1)) * 100}%` : '0%',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentStepIdx}-${currentMiniIdx}-${currentMini.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full space-y-8"
          >
            {/* Question */}
            <h1 className="text-2xl font-bold text-white text-center leading-tight">
              {isHe ? currentMini.title_he : currentMini.title_en}
            </h1>

            {/* Options */}
            <div className="space-y-3">
              {currentMini.options?.map((option: FlowOption) => {
                const isSelected = selectedValue === option.value || answers[currentMini.id] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    whileTap={{ scale: 0.97 }}
                    animate={isSelected && selectedValue === option.value ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'w-full min-h-[56px] rounded-2xl px-5 py-4 text-start flex items-center gap-3 transition-all duration-200 border',
                      isSelected
                        ? 'bg-primary/20 border-primary/60 text-white'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                    )}
                  >
                    {option.icon && <span className="text-xl shrink-0">{option.icon}</span>}
                    <span className="font-medium text-base">
                      {isHe ? option.label_he : option.label_en}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back button (subtle, at bottom) */}
      {canGoBack && (
        <div className="px-6 pb-8 flex justify-center">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {isHe ? 'חזרה' : 'Back'}
          </button>
        </div>
      )}
    </div>
  );
}
