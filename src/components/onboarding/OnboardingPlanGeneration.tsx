/**
 * OnboardingPlanGeneration — Shows animated analysis screen while generating the 100-day plan.
 * Calls generate-90day-strategy edge function, then completes onboarding.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Brain, Loader2 } from 'lucide-react';
import type { FlowAnswers } from '@/lib/flow/types';
import { FRICTION_PILLAR_MAP } from '@/flows/onboardingFlowSpec';

interface OnboardingPlanGenerationProps {
  answers: FlowAnswers;
  selectedPillars: string[];
}

export function OnboardingPlanGeneration({ answers, selectedPillars }: OnboardingPlanGenerationProps) {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(false);

  const analysisSteps = [
    t('onboarding.planGeneration.analyzingResults'),
    t('onboarding.planGeneration.identifyingPatterns'),
    t('onboarding.planGeneration.computingPriority'),
    t('onboarding.planGeneration.buildingMissions'),
    t('onboarding.planGeneration.creatingMilestones'),
    t('onboarding.planGeneration.calibratingActions'),
    t('onboarding.planGeneration.finalizingPlan'),
  ];

  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return;

    try {
      const pressureZone = answers.pressure_zone as string;
      const pillar = FRICTION_PILLAR_MAP[pressureZone] || 'mind';

      const step1Data: Record<string, unknown> = {};
      const step2Data: Record<string, unknown> = {};

      ['pressure_zone', 'functional_signals', 'target_90_days', 'why_matters',
       'urgency_scale', 'restructure_willingness', 'final_notes',
       'entry_context', 'failure_moment', 'non_negotiable_constraint'].forEach(key => {
        if (answers[key] !== undefined) step1Data[key] = answers[key];
      });
      step1Data.selected_pillar = pillar;

      ['age_bracket', 'gender', 'body_fat_estimate', 'activity_level',
       'wake_time', 'sleep_time', 'sleep_quality', 'screen_before_bed',
       'sleep_duration_avg', 'wake_during_night', 'sunlight_after_waking',
       'daily_screen_time', 'social_media_frequency', 'caffeine_intake', 'alcohol_frequency',
       'first_caffeine_timing', 'nicotine', 'weed_thc',
       'shorts_reels', 'gaming', 'porn_frequency', 'late_night_scrolling',
       'diet_type', 'protein_awareness', 'water_intake', 'sun_exposure', 'cold_exposure',
       'meals_per_day', 'nutrition_weak_point',
       'work_type', 'daily_work_hours', 'commute_duration', 'energy_peak_time', 'energy_crash_time',
       'dependents', 'household_responsibility', 'social_life_frequency',
       'training_window_available',
       'execution_pattern', 'motivation_driver', 'friction_trigger',
       'hypnosis_style', 'preferred_session_length', 'preferred_reminders'].forEach(key => {
        if (answers[key] !== undefined) step2Data[key] = answers[key];
      });

      const { error: upsertError } = await supabase
        .from('launchpad_progress')
        .upsert({
          user_id: user.id,
          step_1_intention: step1Data as any,
          step_2_profile_data: step2Data as any,
          launchpad_complete: true,
          step_7_dashboard_activated: true,
          current_step: 17,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      try {
        await supabase.functions.invoke('generate-90day-strategy', {
          body: { userId: user.id, pillars: selectedPillars },
        });
      } catch {
        // Strategy generation is optional
      }

      supabase.functions.invoke('generate-launchpad-summary', {
        body: { userId: user.id },
      }).catch(() => {});

      sessionStorage.setItem('just_completed_onboarding', '1');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(true);
      toast.error(t('onboarding.planGeneration.saveError'));
    }
  }, [user?.id, answers, selectedPillars, navigate, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < analysisSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        completeOnboarding();
      }
    }, currentStep === 0 ? 800 : 1200);

    return () => clearTimeout(timer);
  }, [currentStep, analysisSteps.length, completeOnboarding]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-4 max-w-sm">
          <Brain className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">{t('onboarding.planGeneration.error')}</h2>
          <button
            onClick={() => { setError(false); setCurrentStep(0); }}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
          >
            {t('onboarding.planGeneration.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-8 max-w-sm text-center"
      >
        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary"
        />

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {t('onboarding.planGeneration.buildingPlan')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {selectedPillars.length} {t('onboarding.planGeneration.pillarsSelected')}
          </p>
        </div>

        {/* Steps */}
        <div className="w-full space-y-2">
          {analysisSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{
                opacity: i <= currentStep ? 1 : 0.3,
                x: i <= currentStep ? 0 : (isRTL ? 20 : -20),
              }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              {i < currentStep ? (
                <span className="text-primary">✓</span>
              ) : i === currentStep ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <span className="w-4 h-4" />
              )}
              {step}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}