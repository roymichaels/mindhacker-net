import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const COACHING_STEPS = [
  { id: 1, title: 'חזון ולמה', titleEn: 'Vision & Why', subtitle: 'למה אתה רוצה לאמן?', subtitleEn: 'Why do you want to coach?', icon: '🎯' },
  { id: 2, title: 'נישת אימון', titleEn: 'Coaching Niche', subtitle: 'באיזה תחום תתמחה?', subtitleEn: 'What will you specialize in?', icon: '🧭' },
  { id: 3, title: 'מתודולוגיה', titleEn: 'Methodology', subtitle: 'הגישה והשיטה שלך', subtitleEn: 'Your approach and method', icon: '📘' },
  { id: 4, title: 'הלקוח האידיאלי', titleEn: 'Ideal Client', subtitle: 'מי המתאמן המושלם?', subtitleEn: 'Who is your ideal coachee?', icon: '👤' },
  { id: 5, title: 'הצעת ערך', titleEn: 'Value Proposition', subtitle: 'מה מייחד אותך?', subtitleEn: 'What makes you unique?', icon: '💎' },
  { id: 6, title: 'ניסיון והסמכות', titleEn: 'Credentials', subtitle: 'הניסיון והכישורים שלך', subtitleEn: 'Your experience and skills', icon: '🏅' },
  { id: 7, title: 'שירותים ותמחור', titleEn: 'Services & Pricing', subtitle: 'מה תציע וכמה?', subtitleEn: 'What will you offer and at what price?', icon: '💰' },
  { id: 8, title: 'שיווק', titleEn: 'Marketing', subtitle: 'איך תגיע ללקוחות?', subtitleEn: 'How will you reach clients?', icon: '📣' },
  { id: 9, title: 'תפעול', titleEn: 'Operations', subtitle: 'כלים ותהליכים', subtitleEn: 'Tools and processes', icon: '⚙️' },
  { id: 10, title: 'תוכנית פעולה', titleEn: 'Action Plan', subtitle: 'הצעדים הראשונים', subtitleEn: 'Your first steps', icon: '🚀' },
];

export const COACHING_PHASES = [
  { id: 1, title: 'יסודות', titleEn: 'Foundation', icon: '🎯', steps: [1, 2, 3] },
  { id: 2, title: 'מיצוב והתמחות', titleEn: 'Positioning & Expertise', icon: '💎', steps: [4, 5, 6] },
  { id: 3, title: 'תכנון והשקה', titleEn: 'Planning & Launch', icon: '🚀', steps: [7, 8, 9, 10] },
];

interface CoachingJourneyData {
  id: string;
  user_id: string;
  coaching_niche: string | null;
  current_step: number;
  journey_complete: boolean;
  step_1_vision: Record<string, unknown>;
  step_2_niche: Record<string, unknown>;
  step_3_methodology: Record<string, unknown>;
  step_4_ideal_client: Record<string, unknown>;
  step_5_value_proposition: Record<string, unknown>;
  step_6_credentials: Record<string, unknown>;
  step_7_services: Record<string, unknown>;
  step_8_marketing: Record<string, unknown>;
  step_9_operations: Record<string, unknown>;
  step_10_action_plan: Record<string, unknown>;
  ai_summary: string | null;
}

function getStepDataKey(step: number): string {
  const keys: Record<number, string> = {
    1: 'vision',
    2: 'niche',
    3: 'methodology',
    4: 'ideal_client',
    5: 'value_proposition',
    6: 'credentials',
    7: 'services',
    8: 'marketing',
    9: 'operations',
    10: 'action_plan',
  };
  return keys[step] || 'unknown';
}

export function useCoachingJourneyProgress(journeyId?: string) {
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<CoachingJourneyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const currentStep = journeyData?.current_step ?? 1;
  const isJourneyComplete = journeyData?.journey_complete ?? false;
  const totalSteps = 10;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchOrCreateJourney = async () => {
      try {
        if (journeyId) {
          const { data: existing, error } = await supabase
            .from('coaching_journeys')
            .select('*')
            .eq('id', journeyId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) throw error;
          if (existing) {
            setJourneyData(existing as unknown as CoachingJourneyData);
          } else {
            const { data: created, error: createError } = await supabase
              .from('coaching_journeys')
              .insert({ user_id: user.id })
              .select()
              .single();
            if (createError) throw createError;
            setJourneyData(created as unknown as CoachingJourneyData);
          }
        } else {
          const { data: created, error: createError } = await supabase
            .from('coaching_journeys')
            .insert({ user_id: user.id })
            .select()
            .single();
          if (createError) throw createError;
          setJourneyData(created as unknown as CoachingJourneyData);
        }
      } catch (error) {
        console.error('Error in coaching journey:', error);
        toast.error('שגיאה בטעינת מסע האימון');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrCreateJourney();
  }, [user, journeyId]);

  const completeStep = useCallback(async ({ step, data }: { step: number; data?: Record<string, unknown> }) => {
    if (!user || !journeyData) return;
    
    setIsCompleting(true);
    try {
      const nextStep = Math.min(step + 1, totalSteps + 1);
      const isComplete = step === totalSteps;

      const updateData: Record<string, unknown> = {
        current_step: nextStep,
        journey_complete: isComplete,
        updated_at: new Date().toISOString(),
      };

      if (data && step <= 10) {
        const dataKey = `step_${step}_${getStepDataKey(step)}`;
        updateData[dataKey] = data;
      }

      // Save niche from step 2
      if (step === 2 && data?.niche) {
        updateData.coaching_niche = data.niche;
      }

      const { error } = await supabase
        .from('coaching_journeys')
        .update(updateData)
        .eq('id', journeyData.id);

      if (error) throw error;

      const stepKey = `step_${step}_${getStepDataKey(step)}` as keyof CoachingJourneyData;
      setJourneyData(prev => prev ? {
        ...prev,
        current_step: nextStep,
        journey_complete: isComplete,
        [stepKey]: data || prev[stepKey],
        ...(step === 2 && data?.niche ? { coaching_niche: data.niche as string } : {}),
      } : null);
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('שגיאה בשמירת השלב');
    } finally {
      setIsCompleting(false);
    }
  }, [user, journeyData, totalSteps]);

  const saveStepData = useCallback(async (step: number, data: Record<string, unknown>) => {
    if (!user || !journeyData) return;
    try {
      const dataKey = `step_${step}_${getStepDataKey(step)}`;
      const { error } = await supabase
        .from('coaching_journeys')
        .update({ [dataKey]: data, updated_at: new Date().toISOString() })
        .eq('id', journeyData.id);
      if (error) throw error;

      setJourneyData(prev => prev ? {
        ...prev,
        [`step_${step}_${getStepDataKey(step)}`]: data,
      } as CoachingJourneyData : null);
    } catch (error) {
      console.error('Error saving step data:', error);
    }
  }, [user, journeyData]);

  const getStepData = useCallback((step: number): Record<string, unknown> | null => {
    if (!journeyData) return null;
    const dataKey = `step_${step}_${getStepDataKey(step)}` as keyof CoachingJourneyData;
    return (journeyData[dataKey] as Record<string, unknown>) || null;
  }, [journeyData]);

  const resetJourney = useCallback(async () => {
    if (!user || !journeyData) return;
    setIsResetting(true);
    try {
      const { error } = await supabase
        .from('coaching_journeys')
        .update({
          current_step: 1, journey_complete: false,
          step_1_vision: {}, step_2_niche: {}, step_3_methodology: {},
          step_4_ideal_client: {}, step_5_value_proposition: {}, step_6_credentials: {},
          step_7_services: {}, step_8_marketing: {}, step_9_operations: {},
          step_10_action_plan: {}, ai_summary: null, coaching_niche: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', journeyData.id);
      if (error) throw error;
      setJourneyData(prev => prev ? {
        ...prev, current_step: 1, journey_complete: false,
        step_1_vision: {}, step_2_niche: {}, step_3_methodology: {},
        step_4_ideal_client: {}, step_5_value_proposition: {}, step_6_credentials: {},
        step_7_services: {}, step_8_marketing: {}, step_9_operations: {},
        step_10_action_plan: {}, ai_summary: null, coaching_niche: null,
      } : null);
      toast.success('המסע אופס בהצלחה');
    } catch (error) {
      console.error('Error resetting journey:', error);
      toast.error('שגיאה באיפוס המסע');
    } finally {
      setIsResetting(false);
    }
  }, [user, journeyData]);

  const getStepRewards = useCallback((step: number) => {
    return { xp: 25, tokens: step === totalSteps ? 10 : 0 };
  }, [totalSteps]);

  return {
    journeyData, currentStep, isJourneyComplete, isLoading, isCompleting,
    isResetting, totalSteps, completeStep, saveStepData, getStepData,
    resetJourney, getStepRewards,
  };
}
