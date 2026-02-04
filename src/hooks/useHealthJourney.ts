import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface HealthJourneyData {
  step_1_vision?: {
    health_vision: string;
    ideal_feeling: string;
    motivation: string;
  };
  step_2_current_state?: {
    energy_level: string;
    sleep_quality: string;
    pain_areas: string[];
    overall_health: number;
  };
  step_3_nutrition?: {
    eating_habits: string;
    water_intake: string;
    diet_challenges: string[];
    allergies: string[];
  };
  step_4_exercise?: {
    current_activity: string;
    preferred_exercise: string[];
    limitations: string[];
    frequency_goal: string;
  };
  step_5_sleep?: {
    sleep_hours: string;
    sleep_quality: string;
    sleep_issues: string[];
    bedtime_routine: string;
  };
  step_6_stress?: {
    stress_level: number;
    stress_triggers: string[];
    coping_methods: string[];
    relaxation_time: string;
  };
  step_7_beliefs?: {
    health_beliefs: string[];
    limiting_patterns: string;
    past_obstacles: string;
    subconscious_blocks: string[];
  };
  step_8_activation?: {
    commitment_level: number;
    priority_area: string;
    first_action: string;
    support_needed: string;
  };
}

export interface HealthJourney {
  id: string;
  user_id: string;
  journey_data: HealthJourneyData;
  current_step: number;
  is_completed: boolean;
  plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useHealthJourney = (journeyId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<HealthJourney | null>(null);
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
            .from('health_journeys')
            .select('*')
            .eq('id', journeyId)
            .single();

          if (error) throw error;
          setJourney(data as unknown as HealthJourney);
        } else {
          // Fetch latest incomplete journey or create new
          const { data: existing, error: fetchError } = await supabase
            .from('health_journeys')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_completed', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (existing) {
            setJourney(existing as unknown as HealthJourney);
          } else {
            // Create new journey
            const { data: newJourney, error: createError } = await supabase
              .from('health_journeys')
              .insert({
                user_id: user.id,
                journey_data: {},
                current_step: 1,
                is_completed: false
              })
              .select()
              .single();

            if (createError) throw createError;
            setJourney(newJourney as unknown as HealthJourney);
          }
        }
      } catch (error) {
        console.error('Error fetching/creating health journey:', error);
        toast.error('שגיאה בטעינת מסע הבריאות');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrCreateJourney();
  }, [user, journeyId]);

  // Save step data
  const saveStepData = useCallback(async (stepNumber: number, data: Partial<HealthJourneyData>) => {
    if (!journey || !user) return false;

    setIsSaving(true);
    try {
      const stepKey = `step_${stepNumber}_${getStepName(stepNumber)}` as keyof HealthJourneyData;
      const updatedData = {
        ...journey.journey_data,
        [stepKey]: data
      };

      const { error } = await supabase
        .from('health_journeys')
        .update({
          journey_data: updatedData,
          current_step: Math.max(journey.current_step, stepNumber + 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', journey.id);

      if (error) throw error;

      setJourney(prev => prev ? {
        ...prev,
        journey_data: updatedData,
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
      // Call edge function to generate health plan
      const { data: planData, error: planError } = await supabase.functions.invoke('generate-health-plan', {
        body: {
          journeyData: journey.journey_data,
          userId: user.id
        }
      });

      if (planError) throw planError;

      // Update journey as completed with plan reference
      const { error: updateError } = await supabase
        .from('health_journeys')
        .update({
          is_completed: true,
          plan_id: planData?.planId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', journey.id);

      if (updateError) throw updateError;

      toast.success('מסע הבריאות הושלם! תוכנית 90 יום נוצרה בהצלחה');
      navigate('/health/plan');
      return planData;
    } catch (error) {
      console.error('Error completing journey:', error);
      toast.error('שגיאה ביצירת תוכנית הבריאות');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [journey, user, navigate]);

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
    currentStep: journey?.current_step || 1,
    journeyData: journey?.journey_data || {}
  };
};

// Helper function to get step name
function getStepName(stepNumber: number): string {
  const stepNames: Record<number, string> = {
    1: 'vision',
    2: 'current_state',
    3: 'nutrition',
    4: 'exercise',
    5: 'sleep',
    6: 'stress',
    7: 'beliefs',
    8: 'activation'
  };
  return stepNames[stepNumber] || 'unknown';
}

export default useHealthJourney;
