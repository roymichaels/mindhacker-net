/**
 * OnboardingReveal — "Your Personalized Upgrade Path is Ready"
 * 
 * Final reveal screen after 5-step calibration.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { FRICTION_PILLAR_MAP, PILLAR_LABELS, PILLAR_SUGGESTIONS } from '@/flows/onboardingFlowSpec';
import type { FlowAnswers } from '@/lib/flow/types';

interface OnboardingRevealProps {
  answers: FlowAnswers;
}

export function OnboardingReveal({ answers }: OnboardingRevealProps) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isHe = language === 'he';

  const frictionType = answers.friction_type as string;
  const pillar = FRICTION_PILLAR_MAP[frictionType] || 'mind';
  const pillarInfo = PILLAR_LABELS[pillar];
  const suggestions = PILLAR_SUGGESTIONS[pillar];
  const commitmentLevel = answers.commitment_level as string;

  const commitmentLabels: Record<string, { he: string; en: string }> = {
    real_change: { he: 'שינוי אמיתי', en: 'Real Change' },
    curious_cautious: { he: 'סקרנות זהירה', en: 'Curious Explorer' },
    need_structure: { he: 'צריך מבנה', en: 'Needs Structure' },
    want_clarity: { he: 'רוצה בהירות', en: 'Seeking Clarity' },
  };

  const handleEnterSystem = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      // Build step_1_intention data
      const step1Data = {
        friction_type: frictionType,
        selected_pillar: pillar,
        specific_tension: answers.specific_tension,
        desired_shift: answers.desired_shift,
        commitment_level: commitmentLevel,
      };

      // Build step_2_profile_data
      const step2Data = {
        age_range: answers.age_range,
        work_structure: answers.work_structure,
        experience_level: answers.experience_level,
      };

      // Save to launchpad_progress
      const { error: upsertError } = await supabase
        .from('launchpad_progress')
        .upsert({
          user_id: user.id,
          step_1_intention: step1Data as any,
          step_2_profile_data: step2Data as any,
          launchpad_complete: true,
          step_7_dashboard_activated: true,
          current_step: 7,
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

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6" dir={isHe ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        {/* Title */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">
              {isHe ? 'מסלול השדרוג האישי שלך מוכן' : 'Your Personalized Upgrade Path is Ready'}
            </h1>
          </motion.div>
        </div>

        {/* Reveal cards */}
        <div className="space-y-3">
          {/* Focus area */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-4 text-start"
          >
            <p className="text-sm text-white/50 mb-1">{isHe ? 'תחום מיקוד' : 'Focus Area'}</p>
            <p className="text-lg font-semibold text-white">
              {pillarInfo.icon} {isHe ? pillarInfo.he : pillarInfo.en}
            </p>
          </motion.div>

          {/* Friction type */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-4 text-start"
          >
            <p className="text-sm text-white/50 mb-1">{isHe ? 'חיכוך שזוהה' : 'Detected Friction'}</p>
            <p className="text-lg font-semibold text-white">{answers.specific_tension ? String(answers.specific_tension).replace(/_/g, ' ') : frictionType.replace(/_/g, ' ')}</p>
          </motion.div>

          {/* Commitment */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-4 text-start"
          >
            <p className="text-sm text-white/50 mb-1">{isHe ? 'רמת מחויבות' : 'Commitment Level'}</p>
            <p className="text-lg font-semibold text-white">
              {isHe ? commitmentLabels[commitmentLevel]?.he : commitmentLabels[commitmentLevel]?.en}
            </p>
          </motion.div>

          {/* Suggested quest + habit */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl bg-primary/10 border border-primary/30 p-4 text-start space-y-2"
          >
            <p className="text-sm text-primary/70 mb-1">{isHe ? 'מה מחכה לך' : 'What awaits you'}</p>
            <p className="text-base font-semibold text-white">
              🎯 {isHe ? suggestions.quest_he : suggestions.quest_en}
            </p>
            <p className="text-sm text-white/70">
              ⚡ {isHe ? suggestions.habit_he : suggestions.habit_en}
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button
            onClick={handleEnterSystem}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isHe ? 'כניסה למערכת' : 'Enter My System'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
