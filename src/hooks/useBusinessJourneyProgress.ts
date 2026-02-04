import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const BUSINESS_STEPS = [
  { id: 1, title: 'חזון ומטרה', titleEn: 'Vision & Goals', subtitle: 'למה אתה רוצה להקים עסק?', subtitleEn: 'Why do you want to start a business?', icon: '🎯' },
  { id: 2, title: 'מודל עסקי', titleEn: 'Business Model', subtitle: 'סוג העסק ומודל ההכנסות', subtitleEn: 'Business type and revenue model', icon: '💼' },
  { id: 3, title: 'קהל יעד', titleEn: 'Target Audience', subtitle: 'מי הלקוח האידיאלי שלך?', subtitleEn: 'Who is your ideal customer?', icon: '👥' },
  { id: 4, title: 'הצעת ערך', titleEn: 'Value Proposition', subtitle: 'מה מייחד אותך מהמתחרים?', subtitleEn: 'What makes you unique?', icon: '💎' },
  { id: 5, title: 'אתגרים', titleEn: 'Challenges', subtitle: 'מה עוצר אותך?', subtitleEn: 'What is holding you back?', icon: '⚠️' },
  { id: 6, title: 'משאבים', titleEn: 'Resources', subtitle: 'מה יש לך ומה חסר?', subtitleEn: 'What do you have and what is missing?', icon: '🛠️' },
  { id: 7, title: 'תכנון פיננסי', titleEn: 'Financial Planning', subtitle: 'יעדים והכנסות', subtitleEn: 'Goals and revenue targets', icon: '💰' },
  { id: 8, title: 'שיווק', titleEn: 'Marketing', subtitle: 'איך תגיע ללקוחות?', subtitleEn: 'How will you reach customers?', icon: '📣' },
  { id: 9, title: 'תפעול', titleEn: 'Operations', subtitle: 'מבנה ותהליכים', subtitleEn: 'Structure and processes', icon: '⚙️' },
  { id: 10, title: 'תוכנית פעולה', titleEn: 'Action Plan', subtitle: 'הצעדים הראשונים שלך', subtitleEn: 'Your first steps', icon: '🚀' },
];

export const BUSINESS_PHASES = [
  { id: 1, title: 'יסודות', titleEn: 'Foundation', icon: '🎯', steps: [1, 2, 3] },
  { id: 2, title: 'אתגרים ומשאבים', titleEn: 'Challenges & Resources', icon: '⚠️', steps: [4, 5, 6] },
  { id: 3, title: 'תכנון וביצוע', titleEn: 'Planning & Execution', icon: '🚀', steps: [7, 8, 9, 10] },
];

export function getBusinessPhaseForStep(stepId: number) {
  return BUSINESS_PHASES.find(phase => phase.steps.includes(stepId));
}

export function isLastStepInBusinessPhase(stepId: number) {
  const phase = getBusinessPhaseForStep(stepId);
  if (!phase) return false;
  return phase.steps[phase.steps.length - 1] === stepId;
}

interface BusinessJourneyData {
  id: string;
  user_id: string;
  business_name: string | null;
  current_step: number;
  journey_complete: boolean;
  step_1_vision: Record<string, unknown>;
  step_2_business_model: Record<string, unknown>;
  step_3_target_audience: Record<string, unknown>;
  step_4_value_proposition: Record<string, unknown>;
  step_5_challenges: Record<string, unknown>;
  step_6_resources: Record<string, unknown>;
  step_7_financial: Record<string, unknown>;
  step_8_marketing: Record<string, unknown>;
  step_9_operations: Record<string, unknown>;
  step_10_action_plan: Record<string, unknown>;
  ai_summary: string | null;
}

export function useBusinessJourneyProgress(journeyId?: string) {
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<BusinessJourneyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const currentStep = journeyData?.current_step ?? 1;
  const isJourneyComplete = journeyData?.journey_complete ?? false;
  const totalSteps = 10;

  // Fetch journey by ID or create new one
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchOrCreateJourney = async () => {
      try {
        if (journeyId) {
          // Fetch specific journey by ID
          const { data: existing, error: fetchError } = await supabase
            .from('business_journeys')
            .select('*')
            .eq('id', journeyId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching business journey:', fetchError);
            throw fetchError;
          }

          if (existing) {
            setJourneyData(existing as unknown as BusinessJourneyData);
          } else {
            // Journey not found - create new one
            const { data: created, error: createError } = await supabase
              .from('business_journeys')
              .insert({ user_id: user.id })
              .select()
              .single();

            if (createError) throw createError;
            setJourneyData(created as unknown as BusinessJourneyData);
          }
        } else {
          // Create new journey
          const { data: created, error: createError } = await supabase
            .from('business_journeys')
            .insert({ user_id: user.id })
            .select()
            .single();

          if (createError) throw createError;
          setJourneyData(created as unknown as BusinessJourneyData);
        }
      } catch (error) {
        console.error('Error in business journey:', error);
        toast.error('שגיאה בטעינת המסע העסקי');
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
      const stepKey = `step_${step}_${getStepDataKey(step)}` as keyof BusinessJourneyData;
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

      const { error } = await supabase
        .from('business_journeys')
        .update(updateData)
        .eq('id', journeyData.id);

      if (error) throw error;

      setJourneyData(prev => prev ? {
        ...prev,
        current_step: nextStep,
        journey_complete: isComplete,
        [stepKey]: data || prev[stepKey],
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
        .from('business_journeys')
        .update({ 
          [dataKey]: data,
          updated_at: new Date().toISOString() 
        })
        .eq('id', journeyData.id);

      if (error) throw error;

      setJourneyData(prev => prev ? {
        ...prev,
        [`step_${step}_${getStepDataKey(step)}`]: data,
      } as BusinessJourneyData : null);

    } catch (error) {
      console.error('Error saving step data:', error);
    }
  }, [user, journeyData]);

  const getStepData = useCallback((step: number): Record<string, unknown> | null => {
    if (!journeyData) return null;
    const dataKey = `step_${step}_${getStepDataKey(step)}` as keyof BusinessJourneyData;
    return (journeyData[dataKey] as Record<string, unknown>) || null;
  }, [journeyData]);

  const resetJourney = useCallback(async () => {
    if (!user || !journeyData) return;
    
    setIsResetting(true);
    try {
      const { error } = await supabase
        .from('business_journeys')
        .update({
          current_step: 1,
          journey_complete: false,
          step_1_vision: {},
          step_2_business_model: {},
          step_3_target_audience: {},
          step_4_value_proposition: {},
          step_5_challenges: {},
          step_6_resources: {},
          step_7_financial: {},
          step_8_marketing: {},
          step_9_operations: {},
          step_10_action_plan: {},
          ai_summary: null,
          business_name: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', journeyData.id);

      if (error) throw error;

      setJourneyData(prev => prev ? {
        ...prev,
        current_step: 1,
        journey_complete: false,
        step_1_vision: {},
        step_2_business_model: {},
        step_3_target_audience: {},
        step_4_value_proposition: {},
        step_5_challenges: {},
        step_6_resources: {},
        step_7_financial: {},
        step_8_marketing: {},
        step_9_operations: {},
        step_10_action_plan: {},
        ai_summary: null,
        business_name: null,
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
    return { xp: 20, tokens: step === totalSteps ? 5 : 0 };
  }, [totalSteps]);

  return {
    journeyData,
    currentStep,
    isJourneyComplete,
    isLoading,
    isCompleting,
    isResetting,
    totalSteps,
    completeStep,
    saveStepData,
    getStepData,
    resetJourney,
    getStepRewards,
  };
}

function getStepDataKey(step: number): string {
  const keys: Record<number, string> = {
    1: 'vision',
    2: 'business_model',
    3: 'target_audience',
    4: 'value_proposition',
    5: 'challenges',
    6: 'resources',
    7: 'financial',
    8: 'marketing',
    9: 'operations',
    10: 'action_plan',
  };
  return keys[step] || 'unknown';
}
