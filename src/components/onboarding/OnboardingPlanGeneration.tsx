/**
 * OnboardingPlanGeneration — Shows animated analysis screen while generating the 100-day plan.
 * Calls generate-100day-strategy edge function, then completes onboarding.
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
import { generateOrbProfile, type OrbProfile } from '@/lib/orbProfileGenerator';
import { hashUserId } from '@/lib/orbSeed';
import { VISUAL_DEFAULTS } from '@/components/orb/types';

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
  const [alreadyHasPlan, setAlreadyHasPlan] = useState(false);

  // GUARD: Check immediately on mount if plan already exists — redirect without regenerating
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    supabase
      .from('life_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          setAlreadyHasPlan(true);
          // Also mark launchpad as complete
          supabase.from('launchpad_progress').upsert({
            user_id: user.id,
            launchpad_complete: true,
          }, { onConflict: 'user_id' }).then(() => {
            navigate('/now', { replace: true });
          });
        }
      });
    return () => { cancelled = true; };
  }, [user?.id, navigate]);

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
      // Check if plan already exists — skip regeneration
      const { data: existingPlan } = await supabase
        .from('life_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingPlan) {
        sessionStorage.setItem('just_completed_onboarding', '1');
        navigate('/ceremony', { replace: true });
        return;
      }

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

      // Generate 100-day plan + identity summary in parallel
      const CORE_IDS = ['consciousness', 'presence', 'power', 'vitality', 'focus', 'combat', 'expansion'];
      const corePillars = selectedPillars.filter(p => CORE_IDS.includes(p));
      const arenaPillars = selectedPillars.filter(p => !CORE_IDS.includes(p));
      
      // Both run concurrently — strategy creates the plan, launchpad-summary creates identity data
      const [strategyResult] = await Promise.allSettled([
        supabase.functions.invoke('generate-100day-strategy', {
          body: { 
            user_id: user.id, 
            hub: 'both',
            skip_quality_gate: true, // Use onboarding data, don't require pillar assessments
            selected_pillars: { core: corePillars, arena: arenaPillars },
          },
        }),
        supabase.functions.invoke('generate-launchpad-summary', {
          body: { userId: user.id },
        }),
      ]);
      
      // Log strategy result for debugging but don't block
      if (strategyResult.status === 'rejected') {
        console.warn('Strategy generation failed:', strategyResult.reason);
      } else if (strategyResult.value?.error) {
        console.warn('Strategy generation error:', strategyResult.value.error);
      }

      // Generate personalized orb avatar from onboarding answers
      try {
        const seed = hashUserId(user.id);
        const orbProfile = generateOrbProfile({
          hobbies: (step2Data.hobbies as string[]) || [],
          decisionStyle: step2Data.decision_style as string,
          conflictStyle: step2Data.conflict_handling as string,
          problemSolvingStyle: step2Data.problem_approach as string,
          priorities: (step2Data.life_priorities as string[]) || [],
          selectedTraitIds: (step2Data.traits as string[]) || [],
          level: 1,
          experience: 0,
          streak: 0,
          egoState: step2Data.execution_pattern as string || 'guardian',
          seed,
          userId: user.id,
          step1Intention: step1Data as Record<string, unknown>,
          step2ProfileData: step2Data as Record<string, unknown>,
        });

        const orbRow = {
          user_id: user.id,
          primary_color: orbProfile.primaryColor,
          secondary_colors: orbProfile.secondaryColors,
          accent_color: orbProfile.accentColor,
          morph_intensity: orbProfile.morphIntensity,
          morph_speed: orbProfile.morphSpeed,
          core_intensity: orbProfile.coreIntensity,
          layer_count: orbProfile.layerCount,
          particle_enabled: orbProfile.particleEnabled,
          particle_count: orbProfile.particleCount,
          geometry_detail: orbProfile.geometryDetail,
          computed_from: {
            dominantArchetype: orbProfile.computedFrom.dominantArchetype,
            secondaryArchetype: orbProfile.computedFrom.secondaryArchetype,
            archetypeWeights: orbProfile.computedFrom.archetypeWeights,
            dominantHobbies: orbProfile.computedFrom.dominantHobbies,
            level: 1,
            streak: 0,
            egoState: orbProfile.computedFrom.egoState,
            topTraitCategories: orbProfile.computedFrom.topTraitCategories,
            clarityScore: orbProfile.computedFrom.clarityScore,
            orb_profile_version: orbProfile.computedFrom.orb_profile_version,
            motionSpeed: orbProfile.motionSpeed,
            pulseRate: orbProfile.pulseRate,
            smoothness: orbProfile.smoothness,
            textureType: orbProfile.textureType,
            textureIntensity: orbProfile.textureIntensity,
            seed,
            geometryFamily: orbProfile.geometryFamily,
            visualDNA: {
              gradientStops: orbProfile.gradientStops ?? VISUAL_DEFAULTS.gradientStops,
              gradientMode: orbProfile.gradientMode ?? VISUAL_DEFAULTS.gradientMode,
              coreGradient: orbProfile.coreGradient ?? VISUAL_DEFAULTS.coreGradient,
              rimLightColor: orbProfile.rimLightColor ?? VISUAL_DEFAULTS.rimLightColor,
              materialType: orbProfile.materialType ?? VISUAL_DEFAULTS.materialType,
              materialParams: orbProfile.materialParams ?? VISUAL_DEFAULTS.materialParams,
              patternType: orbProfile.patternType ?? VISUAL_DEFAULTS.patternType,
              patternIntensity: typeof orbProfile.patternIntensity === 'number' ? orbProfile.patternIntensity : VISUAL_DEFAULTS.patternIntensity,
              particlePalette: orbProfile.particlePalette ?? VISUAL_DEFAULTS.particlePalette,
              particleMode: orbProfile.particleMode ?? VISUAL_DEFAULTS.particleMode,
              particleBehavior: orbProfile.particleBehavior ?? VISUAL_DEFAULTS.particleBehavior,
              bloomStrength: typeof orbProfile.bloomStrength === 'number' ? orbProfile.bloomStrength : VISUAL_DEFAULTS.bloomStrength,
              chromaShift: typeof orbProfile.chromaShift === 'number' ? orbProfile.chromaShift : VISUAL_DEFAULTS.chromaShift,
              dayNightBias: typeof orbProfile.dayNightBias === 'number' ? orbProfile.dayNightBias : VISUAL_DEFAULTS.dayNightBias,
            },
          },
        };

        await supabase
          .from('orb_profiles')
          .upsert([orbRow as any], { onConflict: 'user_id' });
      } catch {
        // Orb generation is non-blocking
      }

      // ─── Quick Win: Insert an immediate "first action" so users feel progress ───
      try {
        const quickWinTitle = language === 'he'
          ? '🎯 צעד ראשון: כתוב 3 דברים שאתה אסיר תודה עליהם היום'
          : '🎯 First step: Write 3 things you are grateful for today';
        const quickWinDesc = language === 'he'
          ? 'התחל את המסע עם תרגיל תודעה קצר. פתח את היומן וכתוב 3 דברים שאתה מעריך ברגע הזה.'
          : 'Start your journey with a short awareness exercise. Open your journal and write 3 things you appreciate right now.';

        await supabase.from('action_items').insert({
          user_id: user.id,
          title: quickWinTitle,
          description: quickWinDesc,
          type: 'task',
          source: 'system',
          status: 'todo',
          pillar: 'consciousness',
          scheduled_date: new Date().toISOString().split('T')[0],
          order_index: 0,
          xp_reward: 25,
          token_reward: 5,
        });
      } catch {
        // Non-blocking — quick win is nice-to-have
      }

      // Mark onboarding as fully complete and clear the phase so refresh won't re-trigger
      await supabase.from('launchpad_progress').upsert({
        user_id: user.id,
        launchpad_complete: true,
        step_3_lifestyle_data: { __onboarding_phase: 'complete' },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      sessionStorage.setItem('just_completed_onboarding', '1');
      navigate('/ceremony', { replace: true });
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(true);
      toast.error(t('onboarding.planGeneration.saveError'));
    }
  }, [user?.id, answers, selectedPillars, navigate, t]);

  useEffect(() => {
    if (alreadyHasPlan) return; // Don't run steps if plan exists
    const timer = setTimeout(() => {
      if (currentStep < analysisSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        completeOnboarding();
      }
    }, currentStep === 0 ? 800 : 1200);

    return () => clearTimeout(timer);
  }, [currentStep, analysisSteps.length, completeOnboarding, alreadyHasPlan]);

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