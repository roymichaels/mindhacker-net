import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface LearningJourneyData {
  step_1_vision?: {
    learning_vision: string;
    mastery_goals: string;
    motivation: string;
  };
  step_2_learning_style?: {
    preferred_style: string;
    best_time: string;
    learning_environment: string;
    attention_span: string;
  };
  step_3_skills?: {
    current_skills: string[];
    skill_levels: Record<string, string>;
    proud_skills: string;
    skills_to_improve: string[];
  };
  step_4_reading?: {
    reading_habit: string;
    favorite_topics: string[];
    books_per_year: string;
    reading_goals: string;
  };
  step_5_courses?: {
    courses_completed: string[];
    current_courses: string[];
    platforms_used: string[];
    course_preferences: string;
  };
  step_6_practice?: {
    practice_frequency: string;
    practice_methods: string[];
    application_areas: string;
    hands_on_learning: string;
  };
  step_7_goals?: {
    skills_to_acquire: string[];
    timeline: string;
    certification_goals: string[];
    career_impact: string;
  };
  step_8_action_plan?: {
    first_learning_action: string;
    weekly_commitment: string;
    accountability: string;
    resources_needed: string;
  };
}

export interface LearningJourney {
  id: string;
  user_id: string;
  journey_data: LearningJourneyData;
  current_step: number;
  journey_complete: boolean;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export const useLearningJourney = (journeyId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<LearningJourney | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOrCreateJourney = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        if (journeyId) {
          const { data, error } = await supabase
            .from('learning_journeys')
            .select('*')
            .eq('id', journeyId)
            .single();

          if (error) throw error;
          
          const mappedData: LearningJourney = {
            id: data.id,
            user_id: data.user_id,
            journey_data: {
              step_1_vision: data.step_1_vision as LearningJourneyData['step_1_vision'],
              step_2_learning_style: data.step_2_learning_style as LearningJourneyData['step_2_learning_style'],
              step_3_skills: data.step_3_skills as LearningJourneyData['step_3_skills'],
              step_4_reading: data.step_4_reading as LearningJourneyData['step_4_reading'],
              step_5_courses: data.step_5_courses as LearningJourneyData['step_5_courses'],
              step_6_practice: data.step_6_practice as LearningJourneyData['step_6_practice'],
              step_7_goals: data.step_7_goals as LearningJourneyData['step_7_goals'],
              step_8_action_plan: data.step_8_action_plan as LearningJourneyData['step_8_action_plan'],
            },
            current_step: data.current_step,
            journey_complete: data.journey_complete,
            ai_summary: data.ai_summary,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          setJourney(mappedData);
        } else {
          const { data: existing, error: fetchError } = await supabase
            .from('learning_journeys')
            .select('*')
            .eq('user_id', user.id)
            .eq('journey_complete', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (existing) {
            const mappedData: LearningJourney = {
              id: existing.id,
              user_id: existing.user_id,
              journey_data: {
                step_1_vision: existing.step_1_vision as LearningJourneyData['step_1_vision'],
                step_2_learning_style: existing.step_2_learning_style as LearningJourneyData['step_2_learning_style'],
                step_3_skills: existing.step_3_skills as LearningJourneyData['step_3_skills'],
                step_4_reading: existing.step_4_reading as LearningJourneyData['step_4_reading'],
                step_5_courses: existing.step_5_courses as LearningJourneyData['step_5_courses'],
                step_6_practice: existing.step_6_practice as LearningJourneyData['step_6_practice'],
                step_7_goals: existing.step_7_goals as LearningJourneyData['step_7_goals'],
                step_8_action_plan: existing.step_8_action_plan as LearningJourneyData['step_8_action_plan'],
              },
              current_step: existing.current_step,
              journey_complete: existing.journey_complete,
              ai_summary: existing.ai_summary,
              created_at: existing.created_at,
              updated_at: existing.updated_at
            };
            setJourney(mappedData);
          } else {
            const { data: newJourney, error: createError } = await supabase
              .from('learning_journeys')
              .insert({
                user_id: user.id,
                current_step: 1,
                journey_complete: false
              })
              .select()
              .single();

            if (createError) throw createError;
            
            const mappedData: LearningJourney = {
              id: newJourney.id,
              user_id: newJourney.user_id,
              journey_data: {},
              current_step: newJourney.current_step,
              journey_complete: newJourney.journey_complete,
              ai_summary: newJourney.ai_summary,
              created_at: newJourney.created_at,
              updated_at: newJourney.updated_at
            };
            setJourney(mappedData);
          }
        }
      } catch (error) {
        console.error('Error fetching/creating learning journey:', error);
        toast.error('שגיאה בטעינת מסע הלמידה');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrCreateJourney();
  }, [user, journeyId]);

  const saveStepData = useCallback(async (stepNumber: number, data: Record<string, unknown>) => {
    if (!journey || !user) return false;

    setIsSaving(true);
    try {
      const stepKey = `step_${stepNumber}_${getStepName(stepNumber)}`;
      
      const updatePayload: Record<string, unknown> = {
        [stepKey]: data,
        current_step: Math.max(journey.current_step, stepNumber + 1),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('learning_journeys')
        .update(updatePayload)
        .eq('id', journey.id);

      if (error) throw error;

      setJourney(prev => prev ? {
        ...prev,
        journey_data: {
          ...prev.journey_data,
          [stepKey]: data
        } as LearningJourneyData,
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

  const completeJourney = useCallback(async () => {
    if (!journey || !user) return null;

    setIsSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('learning_journeys')
        .update({
          journey_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', journey.id);

      if (updateError) throw updateError;

      toast.success('מסע הלמידה הושלם בהצלחה!');
      navigate('/learning');
      return { success: true };
    } catch (error) {
      console.error('Error completing journey:', error);
      toast.error('שגיאה בהשלמת המסע');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [journey, user, navigate]);

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

function getStepName(stepNumber: number): string {
  const stepNames: Record<number, string> = {
    1: 'vision',
    2: 'learning_style',
    3: 'skills',
    4: 'reading',
    5: 'courses',
    6: 'practice',
    7: 'goals',
    8: 'action_plan'
  };
  return stepNames[stepNumber] || 'unknown';
}

export default useLearningJourney;
