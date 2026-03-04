/**
 * OnboardingReveal — Neural Diagnostics + Week 1 Protocol + Daily Structure
 * 
 * Unified reveal screen: 7 diagnostic scores (incl. Consciousness), Week 1 protocol, 8-8-8 daily structure preview.
 */
import { useState, useMemo, useCallback } from 'react';
import { TIER_FEATURES, TIER_CONFIGS } from '@/lib/subscriptionTiers';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Zap, Brain, Heart, Clock, Target, Shield, Activity, Sun, Moon, Dumbbell, BookOpen, Coffee } from 'lucide-react';
import { FRICTION_PILLAR_MAP, PILLAR_LABELS } from '@/flows/onboardingFlowSpec';
import type { FlowAnswers } from '@/lib/flow/types';
import { flowAudit } from '@/lib/flowAudit';
import { requireAuthOrOpenModal, requireCheckoutUrlOrToast } from '@/lib/guards';

interface OnboardingRevealProps {
  answers: FlowAnswers;
  onContinue?: () => void;
}

// ─── Score computation helpers ───

function computeEnergyStability(a: FlowAnswers): number {
  let score = 65;
  const sleepQ = a.sleep_quality as number;
  if (sleepQ) score += (sleepQ - 3) * 5;
  const screen = a.screen_before_bed as string;
  if (screen === 'yes') score -= 8;
  const caffeine = a.caffeine_intake as string;
  if (caffeine === '4_plus' || caffeine === '3_plus') score -= 10;
  if (caffeine === '0') score += 5;
  const activity = a.activity_level as string;
  if (activity === 'daily' || activity === '5x_plus' || activity === 'athlete') score += 10;
  if (activity === 'sedentary' || activity === 'none') score -= 10;
  const water = a.water_intake as string;
  if (water === 'under_1L') score -= 8;
  if (water === 'over_3L') score += 5;
  const crash = a.energy_crash_time as string;
  if (crash === 'no_crash' || crash === 'none_varies') score += 8;
  const sunlight = a.sunlight_after_waking as string;
  if (sunlight === 'yes') score += 5;
  if (sunlight === 'no') score -= 5;
  const sleepDur = a.sleep_duration_avg as string;
  if (sleepDur === 'under_5h') score -= 12;
  if (sleepDur === '5_6h') score -= 6;
  if (sleepDur === '7_8h') score += 5;
  if (sleepDur === '8_plus') score += 3;
  return Math.max(10, Math.min(100, score));
}

function computeRecoveryDebt(a: FlowAnswers): number {
  let debt = 25; // lower is better
  const sleepQ = a.sleep_quality as number;
  if (sleepQ && sleepQ <= 2) debt += 15;
  if (sleepQ && sleepQ >= 4) debt -= 5;
  const screen = a.screen_before_bed as string;
  if (screen === 'yes') debt += 10;
  const caffeine = a.caffeine_intake as string;
  if (caffeine === '3_plus' || caffeine === '4_plus') debt += 10;
  const alcohol = a.alcohol_frequency as string;
  if (alcohol === '4x_plus' || alcohol === 'daily') debt += 15;
  if (alcohol === '2_3x_week') debt += 8;
  const wakeNight = a.wake_during_night as string;
  if (wakeNight === '2x_plus' || wakeNight === 'often') debt += 12;
  if (wakeNight === '1x') debt += 5;
  const sleepDur = a.sleep_duration_avg as string;
  if (sleepDur === 'under_5h') debt += 15;
  if (sleepDur === '5_6h') debt += 8;
  const lateScroll = a.late_night_scrolling as string;
  if (lateScroll === 'often') debt += 10;
  if (lateScroll === 'sometimes') debt += 5;
  return Math.max(5, Math.min(95, debt));
}

function computeDopamineLoad(a: FlowAnswers): number {
  let load = 20;
  const screen = a.daily_screen_time as string;
  if (screen === '6h_plus' || screen === '4h_plus') load += 25;
  if (screen === '4_6h' || screen === '2_4h') load += 12;
  const social = a.social_media_frequency as string;
  if (social === 'heavy' || social === '4h_plus') load += 15;
  if (social === 'moderate' || social === '1_2h' || social === '2_4h') load += 8;
  const shorts = a.shorts_reels as string;
  if (shorts === 'heavy_daily') load += 15;
  if (shorts === 'daily') load += 8;
  const gaming = a.gaming as string;
  if (gaming === 'daily') load += 10;
  if (gaming === 'few_days') load += 5;
  const porn = a.porn_frequency as string;
  if (porn === 'daily') load += 12;
  if (porn === '2_5x_week') load += 8;
  const lateScroll = a.late_night_scrolling as string;
  if (lateScroll === 'often') load += 8;
  return Math.max(5, Math.min(95, load));
}

function computeExecutionReliability(a: FlowAnswers): number {
  let score = 60;
  const pattern = a.execution_pattern as string;
  const patternMap: Record<string, number> = {
    start_strong_quit: -15, overplan_delay: -12, avoid_hard_tasks: -18,
    burn_out_fast: -15, intense_inconsistent: -10, consistent_plateaued: 5,
  };
  if (pattern && patternMap[pattern] !== undefined) score += patternMap[pattern];
  const friction = a.friction_trigger as string;
  const frictionMap: Record<string, number> = {
    too_tired: -8, too_distracted: -10, too_overwhelmed: -12,
    too_perfectionist: -5, too_reactive: -8, no_clear_step: -10,
  };
  if (friction && frictionMap[friction] !== undefined) score += frictionMap[friction];
  const commitment = a.restructure_willingness as number;
  if (commitment) score += (commitment - 5) * 2;
  const urgency = a.urgency_scale as number;
  if (urgency && urgency >= 8) score += 5;
  return Math.max(10, Math.min(100, score));
}

function computeTimeLeverage(a: FlowAnswers): number {
  let potential = 50;
  const workHours = a.daily_work_hours as string;
  if (workHours === '0_4') potential += 15;
  if (workHours === '10_plus') potential -= 15;
  const commute = a.commute_duration as string;
  if (commute === '0' || commute === 'none') potential += 10;
  if (commute === '60_plus' || commute === 'over_60m') potential -= 12;
  const dependents = a.dependents as string;
  if (dependents === 'none') potential += 8;
  if (dependents === 'kids' || dependents === 'children') potential -= 10;
  const household = a.household_responsibility as string;
  if (household === 'low') potential += 5;
  if (household === 'high') potential -= 8;
  return Math.max(10, Math.min(100, potential));
}

function computeHormonalRisk(a: FlowAnswers): number {
  let risk = 30;
  const bodyFat = a.body_fat_estimate as string;
  if (bodyFat === 'high' || bodyFat === 'very_high') risk += 15;
  const activity = a.activity_level as string;
  if (activity === 'sedentary' || activity === 'none') risk += 15;
  if (activity === 'daily' || activity === '5x_plus' || activity === 'athlete') risk -= 10;
  const sun = a.sun_exposure as string;
  const sunlight = a.sunlight_after_waking as string;
  if (sun === 'under_10m' || sunlight === 'no') risk += 10;
  if (sun === 'over_30m' || sunlight === 'yes') risk -= 5;
  const sleepQ = a.sleep_quality as number;
  if (sleepQ && sleepQ <= 2) risk += 10;
  const alcohol = a.alcohol_frequency as string;
  if (alcohol === '4x_plus' || alcohol === 'daily') risk += 12;
  const nicotine = a.nicotine as string;
  if (nicotine === 'daily') risk += 8;
  const weed = a.weed_thc as string;
  if (weed === 'daily') risk += 6;
  return Math.max(5, Math.min(95, risk));
}

// ─── Week 1 Protocol helpers ───

function getAnchorHabits(a: FlowAnswers, isHe: boolean): string[] {
  const habits: string[] = [];
  const wake = a.wake_time as string;
  if (wake) habits.push(isHe ? `השכמה ב-${wake}` : `Wake at ${wake}`);
  const sleep = a.sleep_time as string;
  if (sleep) habits.push(isHe ? `מסכים כבויים עד ${sleep}` : `Screens off by ${sleep}`);
  const sunlight = a.sunlight_after_waking as string;
  if (sunlight !== 'yes') {
    habits.push(isHe ? '10 דק׳ אור שמש אחרי השכמה' : '10min sunlight after waking');
  } else {
    habits.push(isHe ? 'המשך חשיפה לאור בוקר' : 'Continue morning light exposure');
  }
  return habits.slice(0, 3);
}

function getFocusBlocks(a: FlowAnswers, isHe: boolean): string[] {
  const peak = a.energy_peak_time as string;
  const peakMap: Record<string, string> = {
    early: '06:00–09:00', morning: '08:00–11:00', midday: '10:00–13:00',
    afternoon: '13:00–16:00', evening: '17:00–20:00', late_night: '21:00–00:00',
  };
  const window = peakMap[peak] || '09:00–12:00';
  return [
    isHe ? `עבודה עמוקה: ${window}` : `Deep work: ${window}`,
    isHe ? 'בלוק אדמין: 60 דק׳ אחרי הצהריים' : 'Admin block: 60min after lunch',
    isHe ? 'סשן למידה: 30 דק׳ ערב' : 'Learning session: 30min evening',
  ];
}

function getRecoveryBlock(a: FlowAnswers, isHe: boolean): string {
  const sleep = a.sleep_time as string || '23:00';
  return isHe ? `החל מ-${sleep}: ללא מסכים, נשימות, קריאה` : `From ${sleep}: no screens, breathwork, reading`;
}

function getTrainingSuggestion(a: FlowAnswers, isHe: boolean): string {
  const window = a.training_window_available as string;
  const activity = a.activity_level as string;
  const windowLabel: Record<string, string> = {
    morning: isHe ? 'בוקר' : 'morning', midday: isHe ? 'צהריים' : 'midday',
    evening: isHe ? 'ערב' : 'evening', none_consistent: isHe ? 'גמיש' : 'flexible',
  };
  if (activity === 'none' || activity === 'sedentary') {
    return isHe ? `הליכה 20 דק׳ (${windowLabel[window] || 'בוקר'})` : `20min walk (${windowLabel[window] || 'morning'})`;
  }
  return isHe ? `אימון ${windowLabel[window] || 'בוקר'} — 45 דק׳` : `Training ${windowLabel[window] || 'morning'} — 45min`;
}

// ─── Daily Structure helper ───

function getDailyStructure(a: FlowAnswers, isHe: boolean) {
  const wake = a.wake_time as string || '07:00';
  const sleep = a.sleep_time as string || '23:00';
  const peak = a.energy_peak_time as string || 'morning';
  const training = a.training_window_available as string || 'morning';

  const peakWindows: Record<string, { start: string; end: string }> = {
    early: { start: '06:00', end: '09:00' }, morning: { start: '08:00', end: '11:00' },
    midday: { start: '10:00', end: '13:00' }, afternoon: { start: '13:00', end: '16:00' },
    evening: { start: '17:00', end: '20:00' }, late_night: { start: '21:00', end: '00:00' },
  };
  const trainingWindows: Record<string, { start: string; end: string }> = {
    morning: { start: '06:30', end: '07:30' }, midday: { start: '12:00', end: '13:00' },
    evening: { start: '18:00', end: '19:00' }, none_consistent: { start: '17:00', end: '18:00' },
  };

  const deepWork = peakWindows[peak] || peakWindows.morning;
  const trainingBlock = trainingWindows[training] || trainingWindows.morning;

  return [
    { icon: Moon, label: isHe ? 'שינה' : 'Sleep', time: `${sleep} – ${wake}`, color: 'text-indigo-400' },
    { icon: Brain, label: isHe ? 'עבודה עמוקה' : 'Deep Work', time: `${deepWork.start} – ${deepWork.end}`, color: 'text-amber-500' },
    { icon: Coffee, label: isHe ? 'אדמין' : 'Admin', time: isHe ? 'אחרי ארוחת צהריים' : 'After lunch', color: 'text-muted-foreground' },
    { icon: Dumbbell, label: isHe ? 'אימון' : 'Training', time: `${trainingBlock.start} – ${trainingBlock.end}`, color: 'text-green-500' },
    { icon: BookOpen, label: isHe ? 'פיתוח אישי' : 'Personal Dev', time: isHe ? '30 דק׳ ערב' : '30min evening', color: 'text-purple-500' },
    { icon: Sun, label: isHe ? 'ריקברי' : 'Recovery', time: `${sleep}+`, color: 'text-cyan-500' },
  ];
}

// ─── Score interpretation ───

function getInterpretation(key: string, value: number, isHe: boolean, inverted = false): string {
  const effective = inverted ? value : 100 - value;
  // For inverted metrics (higher = worse), high value = bad
  if (inverted) {
    if (value >= 70) return isHe ? 'דורש טיפול מיידי' : 'Needs immediate attention';
    if (value >= 50) return isHe ? 'בטווח אזהרה' : 'In warning range';
    if (value >= 30) return isHe ? 'סביר — יש מקום לשיפור' : 'Moderate — room to improve';
    return isHe ? 'מצוין' : 'Excellent';
  }
  if (value >= 70) return isHe ? 'מצוין' : 'Excellent';
  if (value >= 50) return isHe ? 'סביר — יש מקום לשיפור' : 'Moderate — room to improve';
  if (value >= 30) return isHe ? 'נמוך — עדיפות גבוהה' : 'Low — high priority';
  return isHe ? 'דורש טיפול מיידי' : 'Needs immediate attention';
}

export function OnboardingReveal({ answers, onContinue }: OnboardingRevealProps) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [isLoading, setIsLoading] = useState(false);
  const isHe = language === 'he';

  const pressureZone = answers.pressure_zone as string;
  const pillar = FRICTION_PILLAR_MAP[pressureZone] || 'mind';

  // Compute 6 diagnostic scores
  const diagnostics = useMemo(() => ({
    energyStability: computeEnergyStability(answers),
    recoveryDebt: computeRecoveryDebt(answers),
    dopamineLoad: computeDopamineLoad(answers),
    executionReliability: computeExecutionReliability(answers),
    timeLeverage: computeTimeLeverage(answers),
    hormonalRisk: computeHormonalRisk(answers),
  }), [answers]);

  // Week 1 Protocol
  const week1 = useMemo(() => ({
    anchorHabits: getAnchorHabits(answers, isHe),
    focusBlocks: getFocusBlocks(answers, isHe),
    recoveryBlock: getRecoveryBlock(answers, isHe),
    trainingSuggestion: getTrainingSuggestion(answers, isHe),
  }), [answers, isHe]);

  // Daily structure
  const dailyStructure = useMemo(() => getDailyStructure(answers, isHe), [answers, isHe]);

  const handleEnterSystem = useCallback(async () => {
    if (!requireAuthOrOpenModal(user, openAuthModal, {
      reason: 'start_free',
      nextActionName: 'onboarding_start_free',
      onSuccess: () => handleEnterSystem(),
    })) {
      flowAudit.markFlag('authModalOpened', true);
      return;
    }
    setIsLoading(true);

    try {
      const step1Data: Record<string, unknown> = {};
      const step2Data: Record<string, unknown> = {};

      // STEP1 keys
      ['pressure_zone', 'functional_signals', 'target_90_days', 'why_matters',
       'urgency_scale', 'restructure_willingness', 'final_notes',
       'entry_context', 'failure_moment', 'non_negotiable_constraint'].forEach(key => {
        if (answers[key] !== undefined) step1Data[key] = answers[key];
      });
      step1Data.selected_pillar = pillar;
      step1Data.diagnostic_scores = {
        energy_stability: diagnostics.energyStability,
        recovery_debt: diagnostics.recoveryDebt,
        dopamine_load: diagnostics.dopamineLoad,
        execution_reliability: diagnostics.executionReliability,
        time_leverage: diagnostics.timeLeverage,
        hormonal_risk: diagnostics.hormonalRisk,
      };

      // STEP2 keys
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

      // Trigger AI summary generation (non-blocking, may not exist yet)
      supabase.functions.invoke('generate-launchpad-summary', {
        body: { userId: user.id },
      }).catch(() => { /* silently ignore if function doesn't exist */ });

      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error(isHe ? 'שגיאה בשמירה, נסה שוב' : 'Error saving, please try again');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, openAuthModal, navigate, isHe, answers, pillar, diagnostics]);

  const ScoreBar = ({ value, color = 'bg-primary' }: { value: number; color?: string }) => (
    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
    </div>
  );

  const { t } = useTranslation();
  const scores = [
    { key: 'energy', icon: Zap, label: t('onboarding.reveal.energyStability'), value: diagnostics.energyStability, color: 'text-amber-500', barColor: 'bg-amber-500', inverted: false },
    { key: 'recovery', icon: Heart, label: t('onboarding.reveal.recoveryDebt'), value: diagnostics.recoveryDebt, color: 'text-red-500', barColor: 'bg-red-500', inverted: true },
    { key: 'dopamine', icon: Zap, label: t('onboarding.reveal.dopamineLoad'), value: diagnostics.dopamineLoad, color: 'text-purple-500', barColor: 'bg-purple-500', inverted: true },
    { key: 'execution', icon: Target, label: t('onboarding.reveal.executionReliability'), value: diagnostics.executionReliability, color: 'text-green-500', barColor: 'bg-green-500', inverted: false },
    { key: 'time', icon: Clock, label: t('onboarding.reveal.timeLeverage'), value: diagnostics.timeLeverage, color: 'text-blue-500', barColor: 'bg-blue-500', inverted: false },
    { key: 'hormonal', icon: Shield, label: t('onboarding.reveal.hormonalRisk'), value: diagnostics.hormonalRisk, color: 'text-orange-500', barColor: 'bg-orange-500', inverted: true },
  ];

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 sm:p-6 overflow-y-auto" dir={isHe ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full space-y-6 py-6"
      >
        {/* ─── Title ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-2">
          <Brain className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {isHe ? 'תוצאות כיול + פרוטוקול שבוע 1' : 'Calibration Results + Week 1 Protocol'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isHe ? 'מבוסס על 70+ משתנים התנהגותיים' : 'Based on 70+ behavioral variables'}
          </p>
        </motion.div>

        {/* ─── Section 1: 6 Diagnostic Scores ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
            {isHe ? 'אבחון מערכת' : 'System Diagnostics'}
          </h2>
          <div className="space-y-2">
            {scores.map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, x: isHe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-xl bg-card border border-border p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${s.color}`}>{s.value}%</span>
                </div>
                <ScoreBar value={s.value} color={s.barColor} />
                <p className="text-[11px] text-muted-foreground">{getInterpretation(s.key, s.value, isHe, s.inverted)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Section 2: Week 1 Protocol ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
            {t('onboarding.reveal.week1Protocol')}
          </h2>

          {/* Anchor Habits */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-2">
            <span className="text-xs font-bold text-primary">⚓ {t('onboarding.reveal.anchorHabits')}</span>
            {week1.anchorHabits.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-sm">{h}</span>
              </div>
            ))}
          </div>

          {/* Focus Blocks */}
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">🎯 {t('onboarding.reveal.focusBlocks')}</span>
            {week1.focusBlocks.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Recovery + Training */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-3 space-y-1">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">🛡️ {t('onboarding.reveal.recovery')}</span>
              <p className="text-xs text-muted-foreground">{week1.recoveryBlock}</p>
            </div>
            <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-3 space-y-1">
              <span className="text-xs font-bold text-green-600 dark:text-green-400">💪 {t('onboarding.reveal.training')}</span>
              <p className="text-xs text-muted-foreground">{week1.trainingSuggestion}</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Section 3: Daily Structure 8-8-8 ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
            {t('onboarding.reveal.dailyStructure')} 8-8-8
          </h2>
          <div className="rounded-xl bg-card border border-border p-3 space-y-2">
            {dailyStructure.map((block, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <block.icon className={`w-4 h-4 ${block.color} shrink-0`} />
                <span className="text-sm font-medium flex-1">{block.label}</span>
                <span className="text-xs text-muted-foreground font-mono">{block.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── CTA: Continue to Tier Selection ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <button
            onClick={() => {
              if (onContinue) {
                onContinue();
              } else {
                // Fallback: legacy behavior
                sessionStorage.setItem('just_completed_onboarding', '1');
                handleEnterSystem();
              }
            }}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                {t('onboarding.reveal.continueToPath')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
