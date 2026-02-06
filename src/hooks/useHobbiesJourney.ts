import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface HobbiesJourneyData {
  step_1_discovery?: {
    current_hobbies: string[];
    past_interests: string;
    childhood_activities: string;
  };
  step_2_passion?: {
    brings_joy: string;
    flow_state: string;
    excited_about: string;
  };
  step_3_time?: {
    weekly_hours: string;
    ideal_hours: string;
    time_blockers: string;
  };
  step_4_creativity?: {
    creative_outlets: string[];
    creative_expression: string;
    new_creative_interests: string;
  };
  step_5_social?: {
    social_hobbies: string[];
    solo_hobbies: string[];
    preference: string;
    community_connection: string;
  };
  step_6_growth?: {
    skills_to_learn: string[];
    dream_hobby: string;
    growth_plan: string;
  };
  step_7_balance?: {
    work_life_hobby: string;
    integration_strategy: string;
    priorities: string;
  };
  step_8_action_plan?: {
    immediate_actions: string[];
    weekly_commitment: string;
    resources_needed: string;
    accountability: string;
  };
}

export interface HobbiesJourney {
  id: string;
  user_id: string;
  current_step: number;
  journey_complete: boolean;
  step_1_discovery: HobbiesJourneyData['step_1_discovery'] | null;
  step_2_passion: HobbiesJourneyData['step_2_passion'] | null;
  step_3_time: HobbiesJourneyData['step_3_time'] | null;
  step_4_creativity: HobbiesJourneyData['step_4_creativity'] | null;
  step_5_social: HobbiesJourneyData['step_5_social'] | null;
  step_6_growth: HobbiesJourneyData['step_6_growth'] | null;
  step_7_balance: HobbiesJourneyData['step_7_balance'] | null;
  step_8_action_plan: HobbiesJourneyData['step_8_action_plan'] | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

const STEP_KEYS: Record<number, keyof HobbiesJourneyData> = {
  1: 'step_1_discovery',
  2: 'step_2_passion',
  3: 'step_3_time',
  4: 'step_4_creativity',
  5: 'step_5_social',
  6: 'step_6_growth',
  7: 'step_7_balance',
  8: 'step_8_action_plan',
};

export const useHobbiesJourney = (journeyId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<HobbiesJourney | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch or create journey
  useEffect(() => {
    const fetchOrCreateJourney = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        if (journeyId) {
          // Fetch specific journey
          const { data, error } = await supabase
            .from('hobbies_journeys')
            .select('*')
            .eq('id', journeyId)
            .single();

          if (error) throw error;
          setJourney(data as unknown as HobbiesJourney);
        } else {
          // Fetch latest incomplete journey or create new
          const { data: existing, error: fetchError } = await supabase
            .from('hobbies_journeys')
            .select('*')
            .eq('user_id', user.id)
            .eq('journey_complete', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (existing) {
            setJourney(existing as unknown as HobbiesJourney);
          } else {
            // Create new journey
            const { data: newJourney, error: createError } = await supabase
              .from('hobbies_journeys')
              .insert({
                user_id: user.id,
                current_step: 1,
                journey_complete: false
              })
              .select()
              .single();

            if (createError) throw createError;
            setJourney(newJourney as unknown as HobbiesJourney);
          }
        }
      } catch (error) {
        console.error('Error fetching/creating hobbies journey:', error);
        toast.error('שגיאה בטעינת מסע התחביבים');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrCreateJourney();
  }, [user, journeyId]);

  // Save step data
  const saveStepData = useCallback(async (stepNumber: number, data: Record<string, unknown>) => {
    if (!journey || !user) return false;

    setIsSaving(true);
    try {
      const stepKey = STEP_KEYS[stepNumber];
      if (!stepKey) {
        console.error('Invalid step number:', stepNumber);
        return false;
      }

      const updatePayload: Record<string, unknown> = {
        [stepKey]: data,
        current_step: Math.max(journey.current_step, stepNumber + 1),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('hobbies_journeys')
        .update(updatePayload)
        .eq('id', journey.id);

      if (error) throw error;

      setJourney(prev => prev ? {
        ...prev,
        [stepKey]: data,
        current_step: Math.max(prev.current_step, stepNumber + 1)
      } : null);

      return true;
    } catch (error) {
      console.error('Error saving step data:', error);
      toast.error('שגיאה בשמירת הנתונים');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [journey, user]);

  // Complete journey
  const completeJourney = useCallback(async () => {
    if (!journey || !user) return null;

    setIsSaving(true);
    try {
      // Update journey as completed
      const { error: updateError } = await supabase
        .from('hobbies_journeys')
        .update({
          journey_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', journey.id);

      if (updateError) throw updateError;

      toast.success('מסע התחביבים הושלם בהצלחה! 🎨');
      navigate('/hobbies');
      return true;
    } catch (error) {
      console.error('Error completing journey:', error);
      toast.error('שגיאה בסיום המסע');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [journey, user, navigate]);

  // Get step data
  const getStepData = useCallback((stepNumber: number): Record<string, unknown> => {
    if (!journey) return {};
    const stepKey = STEP_KEYS[stepNumber];
    return (journey[stepKey as keyof HobbiesJourney] as Record<string, unknown>) || {};
  }, [journey]);

  // Navigate to step
  const goToStep = useCallback((step: number) => {
    if (!journey) return;
    setJourney(prev => prev ? { ...prev, current_step: step } : null);
  }, [journey]);

  return {
    journey,
    isLoading,
    isSaving,
    saveStepData,
    completeJourney,
    goToStep,
    getStepData,
    currentStep: journey?.current_step || 1,
  };
};

export default useHobbiesJourney;
