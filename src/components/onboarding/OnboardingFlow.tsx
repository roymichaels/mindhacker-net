/**
 * OnboardingFlow — Full-screen 13-step neural architecture intake orchestrator.
 * 
 * Supports multi_select (toggle + continue), single_select (auto-advance),
 * slider, and textarea input types.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import onboardingFlowSpec, { FRICTION_PILLAR_MAP } from '@/flows/onboardingFlowSpec';
import { getVisibleMiniSteps } from '@/lib/flow/flowSpec';
import { OnboardingReveal } from './OnboardingReveal';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import type { FlowAnswers, MiniStep, FlowOption } from '@/lib/flow/types';
import { cn } from '@/lib/utils';

// Keys that go into step_1_intention
const STEP1_KEYS = [
  'pressure_zone', 'functional_signals', 'target_90_days',
  'why_matters', 'urgency_scale', 'restructure_willingness', 'final_notes',
];

// Keys that go into step_2_profile_data
const STEP2_KEYS = [
  'age_bracket', 'gender', 'body_fat_estimate', 'activity_level',
  'wake_time', 'sleep_time', 'sleep_quality', 'screen_before_bed',
  'daily_screen_time', 'social_media_frequency', 'caffeine_intake', 'alcohol_frequency',
  'diet_type', 'protein_awareness', 'water_intake', 'sun_exposure', 'cold_exposure',
  'work_type', 'daily_work_hours', 'commute_duration', 'energy_peak_time', 'energy_crash_time',
  'dependents', 'household_responsibility', 'social_life_frequency',
  'execution_pattern', 'motivation_driver',
];

export function OnboardingFlow() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHe = language === 'he';

  const [answers, setAnswers] = useState<FlowAnswers>({});
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [currentMiniIdx, setCurrentMiniIdx] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [textareaValue, setTextareaValue] = useState('');
  const advanceTimeout = useRef<ReturnType<typeof setTimeout>>();

  const steps = onboardingFlowSpec.steps;
  const currentStep = steps[currentStepIdx];
  const visibleMiniSteps = currentStep ? getVisibleMiniSteps(currentStep, answers) : [];
  const currentMini: MiniStep | undefined = visibleMiniSteps[currentMiniIdx];

  const isMultiSelect = currentMini?.inputType === 'multi_select';
  const isSlider = currentMini?.inputType === 'slider';
  const isTextarea = currentMini?.inputType === 'textarea';
  const currentMultiSelections = isMultiSelect ? (answers[currentMini?.id || ''] as string[] || []) : [];

  // Sync textarea value when mini-step changes
  useEffect(() => {
    if (currentMini && isTextarea) {
      setTextareaValue((answers[currentMini.id] as string) || '');
    }
  }, [currentMini?.id, isTextarea]);

  // Auto-save on every change
  const autoSave = useCallback(async (updatedAnswers: FlowAnswers) => {
    if (!user?.id) return;
    try {
      const step1Data: Record<string, unknown> = {};
      const step2Data: Record<string, unknown> = {};

      STEP1_KEYS.forEach(key => {
        if (updatedAnswers[key] !== undefined) step1Data[key] = updatedAnswers[key];
      });

      // Map pressure_zone to pillar
      if (updatedAnswers.pressure_zone) {
        step1Data.selected_pillar = FRICTION_PILLAR_MAP[updatedAnswers.pressure_zone as string] || 'mind';
      }

      STEP2_KEYS.forEach(key => {
        if (updatedAnswers[key] !== undefined) step2Data[key] = updatedAnswers[key];
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
    setTextareaValue('');
    
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

    if (isMultiSelect) {
      const current = (answers[currentMini.id] as string[]) || [];
      const toggled = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      const updated = { ...answers, [currentMini.id]: toggled };
      setAnswers(updated);
      autoSave(updated);
    } else {
      setSelectedValue(value);
      const updated = { ...answers, [currentMini.id]: value };
      setAnswers(updated);
      autoSave(updated);

      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
      advanceTimeout.current = setTimeout(() => {
        advanceToNext();
      }, 400);
    }
  }, [currentMini, isMultiSelect, answers, autoSave, advanceToNext]);

  const handleSliderChange = useCallback((value: number[]) => {
    if (!currentMini) return;
    const updated = { ...answers, [currentMini.id]: value[0] };
    setAnswers(updated);
  }, [currentMini, answers]);

  const handleSliderCommit = useCallback(() => {
    autoSave(answers);
  }, [answers, autoSave]);

  const handleTextareaSubmit = useCallback(() => {
    if (!currentMini) return;
    const updated = { ...answers, [currentMini.id]: textareaValue };
    setAnswers(updated);
    autoSave(updated);
    advanceToNext();
  }, [currentMini, textareaValue, answers, autoSave, advanceToNext]);

  const handleContinue = useCallback(() => {
    if (isSlider) {
      autoSave(answers);
      advanceToNext();
    } else if (isTextarea) {
      handleTextareaSubmit();
    } else if (currentMultiSelections.length > 0) {
      advanceToNext();
    }
  }, [isSlider, isTextarea, currentMultiSelections.length, advanceToNext, autoSave, answers, handleTextareaSubmit]);

  const goBack = useCallback(() => {
    setSelectedValue(null);
    setTextareaValue('');
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
  const showContinueBtn = isMultiSelect ? currentMultiSelections.length > 0 : (isSlider || isTextarea);
  const canContinue = isSlider 
    ? answers[currentMini.id] !== undefined 
    : isTextarea 
      ? !currentMini.validation.required || textareaValue.length >= (currentMini.validation.minChars || 1)
      : currentMultiSelections.length > 0;

  // Phase labels
  const phaseLabels: Record<number, { he: string; en: string }> = {
    1: { he: 'אבחון מצב', en: 'State Diagnosis' },
    2: { he: 'אבחון מצב', en: 'State Diagnosis' },
    3: { he: 'בסיס ביולוגי', en: 'Biological Baseline' },
    4: { he: 'בסיס ביולוגי', en: 'Biological Baseline' },
    5: { he: 'בסיס ביולוגי', en: 'Biological Baseline' },
    6: { he: 'בסיס ביולוגי', en: 'Biological Baseline' },
    7: { he: 'ארכיטקטורת זמן', en: 'Time Architecture' },
    8: { he: 'ארכיטקטורת זמן', en: 'Time Architecture' },
    9: { he: 'מערכת הפעלה פסיכולוגית', en: 'Psychological OS' },
    10: { he: 'מערכת הפעלה פסיכולוגית', en: 'Psychological OS' },
    11: { he: 'מערכת הפעלה פסיכולוגית', en: 'Psychological OS' },
    12: { he: 'פילטר מחויבות', en: 'Commitment Filter' },
    13: { he: 'פילטר מחויבות', en: 'Commitment Filter' },
  };

  const currentPhase = phaseLabels[currentStep.id];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top bar: phase label + progress + exit */}
      <div className="px-6 pt-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-primary font-semibold">
            {isHe ? currentPhase?.he : currentPhase?.en}
          </span>
          <button
            onClick={() => navigate(user ? '/today' : '/')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Exit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-1">
          {steps.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
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
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentStepIdx}-${currentMiniIdx}-${currentMini.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            <div className="bg-card border border-border rounded-2xl shadow-lg p-6 space-y-6">
              {/* Question */}
              <div className="text-center space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                  {isHe ? currentMini.title_he : currentMini.title_en}
                </h1>
                {isMultiSelect && (
                  <p className="text-sm text-muted-foreground">
                    {isHe ? 'ניתן לבחור מספר תשובות' : 'You can select multiple answers'}
                  </p>
                )}
              </div>

              {/* Slider input */}
              {isSlider && (
                <div className="space-y-4 px-2">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-primary">
                      {(answers[currentMini.id] as number) ?? currentMini.sliderMin ?? 1}
                    </span>
                    {currentMini.sliderUnit && (
                      <span className="text-lg text-muted-foreground ms-1">{currentMini.sliderUnit}</span>
                    )}
                  </div>
                  <Slider
                    value={[(answers[currentMini.id] as number) ?? currentMini.sliderMin ?? 1]}
                    min={currentMini.sliderMin ?? 1}
                    max={currentMini.sliderMax ?? 10}
                    step={currentMini.sliderStep ?? 1}
                    onValueChange={handleSliderChange}
                    onValueCommit={handleSliderCommit}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{currentMini.sliderMin ?? 1}</span>
                    <span>{currentMini.sliderMax ?? 10}</span>
                  </div>
                </div>
              )}

              {/* Textarea input */}
              {isTextarea && (
                <div className="space-y-2">
                  <Textarea
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    placeholder={isHe ? 'כתוב כאן...' : 'Write here...'}
                    className="min-h-[120px] text-base"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  {currentMini.validation.minChars && (
                    <p className="text-xs text-muted-foreground text-end">
                      {textareaValue.length}/{currentMini.validation.minChars} {isHe ? 'תווים מינימום' : 'min chars'}
                    </p>
                  )}
                </div>
              )}

              {/* Options (select types) */}
              {!isSlider && !isTextarea && (
                <div className="grid grid-cols-1 gap-3">
                  {currentMini.options?.map((option: FlowOption) => {
                    const isSelected = isMultiSelect
                      ? currentMultiSelections.includes(option.value)
                      : (selectedValue === option.value || answers[currentMini.id] === option.value);
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        whileTap={{ scale: 0.97 }}
                        animate={isSelected && !isMultiSelect && selectedValue === option.value ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'w-full min-h-[56px] rounded-2xl px-5 py-4 text-start flex items-center gap-3 transition-all duration-200 border',
                          isSelected
                            ? 'bg-primary/20 border-primary/60 text-foreground'
                            : 'bg-muted/50 border-border text-foreground/80 hover:bg-muted hover:border-border/80'
                        )}
                      >
                        {option.icon && <span className="text-xl shrink-0">{option.icon}</span>}
                        <span className="font-medium text-sm sm:text-base">
                          {isHe ? option.label_he : option.label_en}
                        </span>
                        {isMultiSelect && isSelected && (
                          <span className="ms-auto text-primary">✓</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Continue button */}
              {showContinueBtn && (
                <AnimatePresence>
                  {canContinue && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={handleContinue}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      {isHe ? 'המשך' : 'Continue'}
                      {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                    </motion.button>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back button */}
      {canGoBack && (
        <div className="px-6 pb-8 flex justify-center">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {isHe ? 'חזרה' : 'Back'}
          </button>
        </div>
      )}
    </div>
  );
}
