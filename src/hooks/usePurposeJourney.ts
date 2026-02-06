import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface PurposeJourneyData {
  step_1_vision?: {
    life_purpose: string;
    big_picture: string;
    ideal_future: string;
  };
  step_2_values?: {
    core_values: string[];
    values_expression: string;
    neglected_value: string;
    values_conflict: string;
  };
  step_3_meaning?: {
    meaning_sources: string;
    peak_moments: string;
    flow_activities: string;
  };
  step_4_mission?: {
    personal_mission: string;
    unique_contribution: string;
    world_problem: string;
  };
  step_5_strengths?: {
    natural_talents: string[];
    learned_skills: string[];
    unique_combination: string;
    strength_application: string;
  };
  step_6_contribution?: {
    contribution_vision: string;
    target_audience: string;
    impact_measurement: string;
  };
  step_7_legacy?: {
    legacy_statement: string;
    remembered_for: string;
    life_message: string;
  };
  step_8_action_plan?: {
    first_steps: string[];
    support_needed: string;
    obstacles: string;
    commitment: string;
  };
}

export interface PurposeJourney {
  id: string;
  user_id: string;
  current_step: number;
  journey_complete: boolean;
  step_1_vision: PurposeJourneyData['step_1_vision'] | null;
  step_2_values: PurposeJourneyData['step_2_values'] | null;
  step_3_meaning: PurposeJourneyData['step_3_meaning'] | null;
  step_4_mission: PurposeJourneyData['step_4_mission'] | null;
  step_5_strengths: PurposeJourneyData['step_5_strengths'] | null;
  step_6_contribution: PurposeJourneyData['step_6_contribution'] | null;
  step_7_legacy: PurposeJourneyData['step_7_legacy'] | null;
  step_8_action_plan: PurposeJourneyData['step_8_action_plan'] | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

const STEP_KEYS: Record<number, keyof PurposeJourneyData> = {
  1: 'step_1_vision',
  2: 'step_2_values',
  3: 'step_3_meaning',
  4: 'step_4_mission',
  5: 'step_5_strengths',
  6: 'step_6_contribution',
  7: 'step_7_legacy',
  8: 'step_8_action_plan',
};

export const usePurposeJourney = (journeyId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<PurposeJourney | null>(null);
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
            .from('purpose_journeys')
            .select('*')
            .eq('id', journeyId)
            .single();

          if (error) throw error;
          setJourney(data as unknown as PurposeJourney);
        } else {
          // Fetch latest incomplete journey or create new
          const { data: existing, error: fetchError } = await supabase
            .from('purpose_journeys')
            .select('*')
            .eq('user_id', user.id)
            .eq('journey_complete', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (existing) {
            setJourney(existing as unknown as PurposeJourney);
          } else {
            // Create new journey
            const { data: newJourney, error: createError } = await supabase
              .from('purpose_journeys')
              .insert({
                user_id: user.id,
                current_step: 1,
                journey_complete: false
              })
              .select()
              .single();

            if (createError) throw createError;
            setJourney(newJourney as unknown as PurposeJourney);
          }
        }
      } catch (error) {
        console.error('Error fetching/creating purpose journey:', error);
        toast.error('שגיאה בטעינת מסע הייעוד');
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
        .from('purpose_journeys')
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
        .from('purpose_journeys')
        .update({
          journey_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', journey.id);

      if (updateError) throw updateError;

      toast.success('מסע הייעוד הושלם בהצלחה! 🎉');
      navigate('/purpose');
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
    return (journey[stepKey as keyof PurposeJourney] as Record<string, unknown>) || {};
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

export default usePurposeJourney;
