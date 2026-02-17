/**
 * OnboardingReveal — Neural Diagnostics Screen
 * 
 * Computes and displays diagnostic scores from the intake data,
 * then triggers AI summary generation and navigates to dashboard.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Zap, Brain, Heart, Clock, Target, Headphones } from 'lucide-react';
import { FRICTION_PILLAR_MAP, PILLAR_LABELS } from '@/flows/onboardingFlowSpec';
import type { FlowAnswers } from '@/lib/flow/types';

interface OnboardingRevealProps {
  answers: FlowAnswers;
}

// ─── Score computation helpers ───

function computeNervousSystemScore(answers: FlowAnswers): number {
  let score = 70;
  const zone = answers.pressure_zone as string;
  if (zone === 'cognitive_overload') score -= 15;
  if (zone === 'energy_instability') score -= 12;
  if (zone === 'emotional_strain') score -= 10;

  const signals = (answers.functional_signals as string[]) || [];
  score -= signals.length * 4;

  const sleepQ = answers.sleep_quality as number;
  if (sleepQ && sleepQ <= 2) score -= 10;
  if (sleepQ && sleepQ >= 4) score += 5;

  return Math.max(10, Math.min(100, score));
}

function computeEnergyScore(answers: FlowAnswers): number {
  let score = 65;
  const sleepQ = answers.sleep_quality as number;
  if (sleepQ) score += (sleepQ - 3) * 5;

  const screen = answers.screen_before_bed as string;
  if (screen === 'yes') score -= 8;

  const caffeine = answers.caffeine_intake as string;
  if (caffeine === '4_plus') score -= 10;
  if (caffeine === '0') score += 5;

  const activity = answers.activity_level as string;
  if (activity === 'daily') score += 10;
  if (activity === 'sedentary') score -= 10;

  const water = answers.water_intake as string;
  if (water === 'under_1L') score -= 8;
  if (water === 'over_3L') score += 5;

  const crash = answers.energy_crash_time as string;
  if (crash === 'no_crash') score += 8;

  return Math.max(10, Math.min(100, score));
}

function computeHormonalRiskIndex(answers: FlowAnswers): number {
  let risk = 30; // lower is better
  const bodyFat = answers.body_fat_estimate as string;
  if (bodyFat === 'high') risk += 15;

  const activity = answers.activity_level as string;
  if (activity === 'sedentary') risk += 15;
  if (activity === 'daily') risk -= 10;

  const sun = answers.sun_exposure as string;
  if (sun === 'under_10m') risk += 10;
  if (sun === 'over_30m') risk -= 5;

  const cold = answers.cold_exposure as string;
  if (cold === 'frequent') risk -= 8;
  if (cold === 'never') risk += 5;

  const sleepQ = answers.sleep_quality as number;
  if (sleepQ && sleepQ <= 2) risk += 10;

  const alcohol = answers.alcohol_frequency as string;
  if (alcohol === 'daily') risk += 12;

  return Math.max(5, Math.min(95, risk));
}

function computeDopamineLoadIndex(answers: FlowAnswers): number {
  let load = 20; // lower is better
  const screen = answers.daily_screen_time as string;
  if (screen === '6h_plus') load += 25;
  if (screen === '4_6h') load += 15;
  if (screen === '2_4h') load += 8;

  const social = answers.social_media_frequency as string;
  if (social === 'heavy') load += 20;
  if (social === 'moderate') load += 8;

  const caffeine = answers.caffeine_intake as string;
  if (caffeine === '4_plus') load += 10;
  if (caffeine === '2_3') load += 5;

  const alcohol = answers.alcohol_frequency as string;
  if (alcohol === 'daily') load += 15;
  if (alcohol === 'weekly') load += 5;

  return Math.max(5, Math.min(95, load));
}

function computeTimeOptimization(answers: FlowAnswers): number {
  let potential = 50;
  const workHours = answers.daily_work_hours as number;
  if (workHours && workHours <= 6) potential += 15;
  if (workHours && workHours >= 10) potential -= 15;

  const commute = answers.commute_duration as string;
  if (commute === 'none') potential += 10;
  if (commute === 'over_60m') potential -= 12;

  const dependents = answers.dependents as string;
  if (dependents === 'none') potential += 8;
  if (dependents === 'children') potential -= 10;

  const household = answers.household_responsibility as string;
  if (household === 'low') potential += 5;
  if (household === 'high') potential -= 8;

  return Math.max(10, Math.min(100, potential));
}

function getHypnosisTheme(answers: FlowAnswers): { he: string; en: string; icon: string } {
  const zone = answers.pressure_zone as string;
  const themes: Record<string, { he: string; en: string; icon: string }> = {
    cognitive_overload: { he: 'שקט מנטלי ובהירות', en: 'Mental Stillness & Clarity', icon: '🧘' },
    energy_instability: { he: 'טעינה אנרגטית עמוקה', en: 'Deep Energy Recharge', icon: '⚡' },
    career_stagnation: { he: 'פריצת תקרה מקצועית', en: 'Career Breakthrough', icon: '🚀' },
    financial_instability: { he: 'שליטה פיננסית', en: 'Financial Mastery', icon: '💰' },
    emotional_strain: { he: 'ריפוי רגשי ואיזון', en: 'Emotional Healing & Balance', icon: '💜' },
    direction_confusion: { he: 'בהירות כיוון', en: 'Direction Clarity', icon: '🧭' },
    lack_structure: { he: 'בניית משמעת פנימית', en: 'Inner Discipline Building', icon: '🏗️' },
  };
  return themes[zone] || themes.cognitive_overload;
}

export function OnboardingReveal({ answers }: OnboardingRevealProps) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isHe = language === 'he';

  const pressureZone = answers.pressure_zone as string;
  const pillar = FRICTION_PILLAR_MAP[pressureZone] || 'mind';
  const pillarInfo = PILLAR_LABELS[pillar];

  // Compute diagnostic scores
  const diagnostics = useMemo(() => ({
    nervousSystem: computeNervousSystemScore(answers),
    energyStability: computeEnergyScore(answers),
    hormonalRisk: computeHormonalRiskIndex(answers),
    dopamineLoad: computeDopamineLoadIndex(answers),
    timeOptimization: computeTimeOptimization(answers),
    urgency: (answers.urgency_scale as number) || 5,
    commitment: (answers.restructure_willingness as number) || 5,
    hypnosisTheme: getHypnosisTheme(answers),
  }), [answers]);

  const target90 = answers.target_90_days as string;
  const targetLabels: Record<string, { he: string; en: string }> = {
    body_composition: { he: 'שיפור הרכב גוף', en: 'Body Composition' },
    stabilize_energy: { he: 'ייצוב אנרגיה', en: 'Energy Stabilization' },
    increase_income: { he: 'הגדלת הכנסה', en: 'Income Growth' },
    change_career: { he: 'שינוי קריירה', en: 'Career Change' },
    build_discipline: { he: 'בניית משמעת', en: 'Discipline Building' },
    improve_relationship: { he: 'שיפור מערכת יחסים', en: 'Relationship' },
    build_business: { he: 'בניית עסק', en: 'Business Building' },
    mental_clarity: { he: 'בהירות מנטלית', en: 'Mental Clarity' },
  };

  const handleEnterSystem = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const step1Data: Record<string, unknown> = {};
      const step2Data: Record<string, unknown> = {};

      // Gather all step1 keys
      ['pressure_zone', 'functional_signals', 'target_90_days', 'why_matters', 'urgency_scale', 'restructure_willingness', 'final_notes'].forEach(key => {
        if (answers[key] !== undefined) step1Data[key] = answers[key];
      });
      step1Data.selected_pillar = pillar;
      step1Data.diagnostic_scores = {
        nervous_system: diagnostics.nervousSystem,
        energy_stability: diagnostics.energyStability,
        hormonal_risk: diagnostics.hormonalRisk,
        dopamine_load: diagnostics.dopamineLoad,
        time_optimization: diagnostics.timeOptimization,
      };

      // Gather all step2 keys
      ['age_bracket', 'gender', 'body_fat_estimate', 'activity_level',
       'wake_time', 'sleep_time', 'sleep_quality', 'screen_before_bed',
       'daily_screen_time', 'social_media_frequency', 'caffeine_intake', 'alcohol_frequency',
       'diet_type', 'protein_awareness', 'water_intake', 'sun_exposure', 'cold_exposure',
       'work_type', 'daily_work_hours', 'commute_duration', 'energy_peak_time', 'energy_crash_time',
       'dependents', 'household_responsibility', 'social_life_frequency',
       'execution_pattern', 'motivation_driver'].forEach(key => {
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
          current_step: 13,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      // Trigger AI summary generation
      await supabase.functions.invoke('generate-launchpad-summary', {
        body: { userId: user.id },
      });

      navigate('/today', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error(isHe ? 'שגיאה בשמירה, נסה שוב' : 'Error saving, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const ScoreBar = ({ value, inverted = false, color = 'bg-primary' }: { value: number; inverted?: boolean; color?: string }) => (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6" dir={isHe ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-5"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <Brain className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {isHe ? 'תוצאות כיול המערכת' : 'System Calibration Results'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isHe ? 'מבוסס על הנתונים שסיפקת' : 'Based on your intake data'}
          </p>
        </motion.div>

        {/* Diagnostic Scores */}
        <div className="space-y-3">
          {/* Nervous System */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card border border-border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{isHe ? 'מצב מערכת עצבים' : 'Nervous System State'}</span>
              </div>
              <span className="text-sm font-bold text-primary">{diagnostics.nervousSystem}%</span>
            </div>
            <ScoreBar value={diagnostics.nervousSystem} />
          </motion.div>

          {/* Energy */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-card border border-border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{isHe ? 'יציבות אנרגיה' : 'Energy Stability'}</span>
              </div>
              <span className="text-sm font-bold text-amber-500">{diagnostics.energyStability}%</span>
            </div>
            <ScoreBar value={diagnostics.energyStability} color="bg-amber-500" />
          </motion.div>

          {/* Hormonal Risk */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card border border-border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">{isHe ? 'מדד סיכון הורמונלי' : 'Hormonal Risk Index'}</span>
              </div>
              <span className="text-sm font-bold text-red-500">{diagnostics.hormonalRisk}%</span>
            </div>
            <ScoreBar value={diagnostics.hormonalRisk} color="bg-red-500" inverted />
          </motion.div>

          {/* Dopamine Load */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-card border border-border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">{isHe ? 'מדד עומס דופמין' : 'Dopamine Load Index'}</span>
              </div>
              <span className="text-sm font-bold text-purple-500">{diagnostics.dopamineLoad}%</span>
            </div>
            <ScoreBar value={diagnostics.dopamineLoad} color="bg-purple-500" inverted />
          </motion.div>

          {/* Time Optimization */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl bg-card border border-border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{isHe ? 'פוטנציאל אופטימיזציית זמן' : 'Time Optimization Potential'}</span>
              </div>
              <span className="text-sm font-bold text-blue-500">{diagnostics.timeOptimization}%</span>
            </div>
            <ScoreBar value={diagnostics.timeOptimization} color="bg-blue-500" />
          </motion.div>
        </div>

        {/* 90-Day Target & Hypnosis Theme */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl bg-primary/10 border border-primary/30 p-4 space-y-1"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary/70">{isHe ? 'יעד 90 יום' : '90-Day Target'}</span>
            </div>
            <p className="text-base font-semibold text-foreground">
              {isHe ? targetLabels[target90]?.he : targetLabels[target90]?.en}
            </p>
            <p className="text-xs text-muted-foreground">
              {isHe ? `דחיפות: ${diagnostics.urgency}/10 • מחויבות: ${diagnostics.commitment}/10` : `Urgency: ${diagnostics.urgency}/10 • Commitment: ${diagnostics.commitment}/10`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-2xl bg-accent/10 border border-accent/30 p-4 space-y-1"
          >
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent/70">{isHe ? 'תוכנית היפנוזה אישית — שבוע 1' : 'Personalized Hypnosis Theme — Week 1'}</span>
            </div>
            <p className="text-base font-semibold text-foreground">
              {diagnostics.hypnosisTheme.icon} {isHe ? diagnostics.hypnosisTheme.he : diagnostics.hypnosisTheme.en}
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <button
            onClick={handleEnterSystem}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isHe ? 'בונה תוכנית 90 יום...' : 'Building your 90-day plan...'}
              </>
            ) : (
              <>
                {isHe ? 'הפעל את המערכת' : 'Activate My System'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
