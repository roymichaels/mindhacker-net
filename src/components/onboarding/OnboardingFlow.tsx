/**
 * OnboardingFlow — Full-screen neural architecture intake orchestrator.
 * 
 * Flow: Intro Splash → Basic Info → 16-step calibration → Reveal
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, ArrowRight, X, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import onboardingFlowSpec, { FRICTION_PILLAR_MAP } from '@/flows/onboardingFlowSpec';
import { getVisibleMiniSteps } from '@/lib/flow/flowSpec';
import { OnboardingReveal } from './OnboardingReveal';
import { OnboardingIntro } from './OnboardingIntro';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { MobileTimePicker } from '@/components/ui/mobile-time-picker';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FlowAnswers, MiniStep, FlowOption } from '@/lib/flow/types';
import { cn } from '@/lib/utils';

// ─── Sortable Item for priority_rank ───
function SortableRankItem({ item, index, language }: { item: FlowOption; index: number; language: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.value });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const label = language === 'he' ? item.label_he : item.label_en;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all select-none",
        isDragging
          ? "border-primary bg-primary/15 shadow-lg scale-[1.02]"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <span className="text-lg font-bold text-primary/70 min-w-[24px] text-center">{index + 1}</span>
      {item.icon && <span className="text-lg shrink-0">{item.icon}</span>}
      <span className="text-sm leading-tight flex-1">{label}</span>
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>
    </div>
  );
}

// Keys that go into step_1_intention
const STEP1_KEYS = [
  'entry_context', 'pressure_zone', 'functional_signals', 'failure_moment',
  'target_90_days', 'urgency_scale', 'restructure_willingness',
  'non_negotiable_constraint', 'final_notes',
];

// Keys that go into step_2_profile_data
const STEP2_KEYS = [
  'age_bracket', 'gender', 'body_fat_estimate', 'activity_level',
  'wake_time', 'sleep_time', 'sleep_duration_avg', 'sleep_quality', 'screen_before_bed',
  'wake_during_night', 'sunlight_after_waking',
  'caffeine_intake', 'first_caffeine_timing', 'alcohol_frequency', 'nicotine', 'weed_thc',
  'daily_screen_time', 'shorts_reels', 'gaming', 'porn_frequency', 'late_night_scrolling',
  'diet_type', 'protein_awareness', 'meals_per_day', 'water_intake', 'nutrition_weak_point',
  'work_type', 'daily_work_hours', 'commute_duration', 'energy_peak_time', 'energy_crash_time',
  'dependents', 'household_responsibility', 'social_life_frequency', 'training_window_available',
  'execution_pattern', 'friction_trigger', 'motivation_driver',
  'hypnosis_style', 'preferred_session_length', 'preferred_reminders',
];

export function OnboardingFlow() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHe = language === 'he';

  const [showIntro, setShowIntro] = useState(true);
  const [answers, setAnswers] = useState<FlowAnswers>({});
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [currentMiniIdx, setCurrentMiniIdx] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const [showAnalyzing, setShowAnalyzing] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [textareaValue, setTextareaValue] = useState('');
  const [rankedItems, setRankedItems] = useState<FlowOption[]>([]);
  const [isRestoring, setIsRestoring] = useState(true);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout>>();

  const steps = onboardingFlowSpec.steps;

  // Restore saved progress on mount
  useEffect(() => {
    if (!user?.id) { setIsRestoring(false); return; }
    
    (async () => {
      try {
        const { data } = await supabase
          .from('launchpad_progress')
          .select('step_1_intention, step_2_profile_data, current_step')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          const restored: FlowAnswers = {};
          if (data.step_1_intention && typeof data.step_1_intention === 'object') {
            Object.assign(restored, data.step_1_intention as Record<string, unknown>);
          }
          if (data.step_2_profile_data && typeof data.step_2_profile_data === 'object') {
            Object.assign(restored, data.step_2_profile_data as Record<string, unknown>);
          }
          
          if (Object.keys(restored).length > 0) {
            setAnswers(restored);
            // Restore step position — go to saved step (0-indexed)
            const savedStep = typeof data.current_step === 'number' ? Math.max(0, data.current_step - 1) : 0;
            if (savedStep > 0) {
              setCurrentStepIdx(savedStep);
              setCurrentMiniIdx(0);
              setShowIntro(false);
            }
          }
        }
      } catch (e) {
        console.error('Restore onboarding error:', e);
      } finally {
        setIsRestoring(false);
      }
    })();
  }, [user?.id]);
  const currentStep = steps[currentStepIdx];
  const visibleMiniSteps = currentStep ? getVisibleMiniSteps(currentStep, answers) : [];
  const currentMini: MiniStep | undefined = visibleMiniSteps[currentMiniIdx];

  const isMultiSelect = currentMini?.inputType === 'multi_select';
  const isSlider = currentMini?.inputType === 'slider';
  const isTextarea = currentMini?.inputType === 'textarea';
  const isTimePicker = currentMini?.inputType === 'time_picker';
  const isPriorityRank = currentMini?.inputType === 'priority_rank';
  const currentMultiSelections = isMultiSelect ? (answers[currentMini?.id || ''] as string[] || []) : [];

  // DnD sensors for priority_rank
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Sync textarea value when mini-step changes
  useEffect(() => {
    if (currentMini && isTextarea) {
      setTextareaValue((answers[currentMini.id] as string) || '');
    }
  }, [currentMini?.id, isTextarea]);

  // Auto-set default for time_picker so Continue is immediately enabled
  useEffect(() => {
    if (currentMini && isTimePicker && !answers[currentMini.id]) {
      const min = currentMini.minHour ?? 0;
      const max = currentMini.maxHour ?? 23;
      let defaultH = 7;
      if (min <= max) {
        defaultH = (defaultH >= min && defaultH <= max) ? defaultH : min;
      } else {
        defaultH = min;
      }
      const defaultTime = `${String(defaultH).padStart(2, '0')}:00`;
      const updated = { ...answers, [currentMini.id]: defaultTime };
      setAnswers(updated);
      autoSave(updated);
    }
  }, [currentMini?.id, isTimePicker]);

  // Initialize ranked items for priority_rank
  useEffect(() => {
    if (currentMini && isPriorityRank && currentMini.options) {
      const saved = answers[currentMini.id];
      if (Array.isArray(saved) && saved.length === currentMini.options.length) {
        const ordered = saved
          .map(v => currentMini.options!.find(o => o.value === v))
          .filter(Boolean) as FlowOption[];
        setRankedItems(ordered);
      } else {
        setRankedItems([...currentMini.options]);
        const initial = currentMini.options.map(o => o.value);
        const updated = { ...answers, [currentMini.id]: initial };
        setAnswers(updated);
        autoSave(updated);
      }
    }
  }, [currentMini?.id, isPriorityRank]);

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
      setShowAnalyzing(true);
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

  const handleTimeChange = useCallback((time: string) => {
    if (!currentMini) return;
    const updated = { ...answers, [currentMini.id]: time };
    setAnswers(updated);
    autoSave(updated);
  }, [currentMini, answers, autoSave]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentMini) return;

    const oldIndex = rankedItems.findIndex(i => i.value === active.id);
    const newIndex = rankedItems.findIndex(i => i.value === over.id);
    const reordered = arrayMove(rankedItems, oldIndex, newIndex);
    setRankedItems(reordered);

    const values = reordered.map(i => i.value);
    const updated = { ...answers, [currentMini.id]: values };
    setAnswers(updated);
    autoSave(updated);
  }, [rankedItems, currentMini, answers, autoSave]);

  const handleContinue = useCallback(() => {
    if (isSlider) {
      autoSave(answers);
      advanceToNext();
    } else if (isTextarea) {
      handleTextareaSubmit();
    } else if (isTimePicker) {
      advanceToNext();
    } else if (isPriorityRank) {
      advanceToNext();
    } else if (currentMultiSelections.length > 0) {
      advanceToNext();
    }
  }, [isSlider, isTextarea, isTimePicker, isPriorityRank, currentMultiSelections.length, advanceToNext, autoSave, answers, handleTextareaSubmit]);

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

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          {isHe ? 'טוען...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <OnboardingIntro
        onComplete={(basicInfo) => {
          setAnswers(prev => ({
            ...prev,
            gender: basicInfo.gender,
            age_bracket: basicInfo.ageBracket,
          }));
          setShowIntro(false);
        }}
      />
    );
  }

  if (showAnalyzing && !showReveal) {
    const analysisSteps = isHe
      ? ['מנתח דפוסי שינה...', 'מחשב עומס דופמין...', 'מעריך יציבות אנרגיה...', 'בונה פרופיל ביולוגי...', 'מכוון תוכנית 100 יום...']
      : ['Analyzing sleep patterns...', 'Computing dopamine load...', 'Evaluating energy stability...', 'Building biological profile...', 'Calibrating 100-day plan...'];
    
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8 max-w-sm text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary"
          />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">{isHe ? 'מנתח את הנתונים שלך' : 'Analyzing Your Data'}</h2>
            <p className="text-sm text-muted-foreground">{isHe ? 'יוצר דוח אבחון מותאם אישית...' : 'Creating your personalized diagnostic report...'}</p>
          </div>
          <div className="w-full space-y-2">
            {analysisSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.8, duration: 0.4 }}
                onAnimationComplete={() => {
                  if (i === analysisSteps.length - 1) {
                    setTimeout(() => setShowReveal(true), 600);
                  }
                }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.8 + 0.3 }}
                  className="text-primary"
                >✓</motion.span>
                {step}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (showReveal) {
    return <OnboardingReveal answers={answers} />;
  }

  if (!currentMini) return null;

  const canGoBack = currentStepIdx > 0 || currentMiniIdx > 0;
  const isSingleSelect = currentMini.inputType === 'single_select';
  // Show continue for all non-auto-advance types
  const showContinueBtn = isMultiSelect || isSlider || isTextarea || isTimePicker || isPriorityRank;
  const canContinue = isSlider
    ? answers[currentMini.id] !== undefined
    : isTextarea
      ? !currentMini.validation.required || textareaValue.length >= (currentMini.validation.minChars || 1)
      : isTimePicker
        ? !!answers[currentMini.id]
        : isPriorityRank
          ? rankedItems.length > 0
          : currentMultiSelections.length > 0;

  // Phase labels
  const phaseLabels: Record<number, { he: string; en: string }> = {
    0: { he: 'הקשר כניסה', en: 'Entry Context' },
    1: { he: 'אבחון מצב', en: 'State Diagnosis' },
    2: { he: 'אבחון מצב', en: 'State Diagnosis' },
    3: { he: 'אבחון מצב', en: 'State Diagnosis' },
    4: { he: 'בסיס ביולוגי', en: 'Biological Baseline' },
    5: { he: 'בסיס ביולוגי', en: 'Biological Baseline' },
    6: { he: 'בסיס ביולוגי', en: 'Biological Baseline' },
    7: { he: 'בסיס ביולוגי', en: 'Biological Baseline' },
    8: { he: 'בסיס ביולוגי', en: 'Biological Baseline' },
    9: { he: 'ארכיטקטורת זמן', en: 'Time Architecture' },
    10: { he: 'ארכיטקטורת זמן', en: 'Time Architecture' },
    11: { he: 'מערכת הפעלה פסיכולוגית', en: 'Psychological OS' },
    12: { he: 'מערכת הפעלה פסיכולוגית', en: 'Psychological OS' },
    13: { he: 'מערכת הפעלה פסיכולוגית', en: 'Psychological OS' },
    14: { he: 'יעד + מחויבות', en: 'Target + Commitment' },
    15: { he: 'יעד + מחויבות', en: 'Target + Commitment' },
    16: { he: 'יעד + מחויבות', en: 'Target + Commitment' },
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
                {currentMini.prompt_he && (
                  <p className="text-sm text-muted-foreground">
                    {isHe ? currentMini.prompt_he : currentMini.prompt_en}
                  </p>
                )}
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

              {/* Time Picker input */}
              {isTimePicker && (
                <div className="flex flex-col items-center gap-4">
                  <MobileTimePicker
                    value={typeof answers[currentMini.id] === 'string' && /^\d{2}:\d{2}$/.test(answers[currentMini.id] as string) ? (answers[currentMini.id] as string) : undefined}
                    onChange={handleTimeChange}
                    minHour={currentMini.minHour}
                    maxHour={currentMini.maxHour}
                  />
                  {/* Render fallback options (e.g. "Flexible") below the picker */}
                  {currentMini.options && currentMini.options.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 w-full">
                      {currentMini.options.map((opt) => {
                        const label = isHe ? opt.label_he : opt.label_en;
                        const isSelected = answers[currentMini.id] === opt.value;
                        return (
                          <motion.button
                            key={opt.value}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              if (isSelected) {
                                // Deselect — revert to time default
                                const min = currentMini.minHour ?? 0;
                                const defaultH = min <= (currentMini.maxHour ?? 23) ? (7 >= min ? 7 : min) : min;
                                handleTimeChange(`${String(defaultH).padStart(2, '0')}:00`);
                              } else {
                                const updated = { ...answers, [currentMini.id]: opt.value };
                                setAnswers(updated);
                                autoSave(updated);
                              }
                            }}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                              isSelected
                                ? "bg-primary/20 border-primary/60 text-foreground"
                                : "bg-muted/50 border-border text-muted-foreground hover:border-border/80"
                            )}
                          >
                            {opt.icon && <span className="mr-1">{opt.icon}</span>}
                            {label}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Priority Rank — Drag to reorder */}
              {isPriorityRank && rankedItems.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={rankedItems.map(i => i.value)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {rankedItems.map((item, index) => (
                        <SortableRankItem key={item.value} item={item} index={index} language={language} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Options (single_select / multi_select) */}
              {isSingleSelect || isMultiSelect ? (
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
              ) : null}

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
