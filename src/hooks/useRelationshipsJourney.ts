import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface RelationshipsJourneyData {
  step_1_vision?: {
    relationship_vision: string;
    ideal_connections: string;
    motivation: string;
  };
  step_2_current_state?: {
    relationship_satisfaction: number;
    support_level: string;
    loneliness_level: number;
    key_relationships: string[];
  };
  step_3_family?: {
    family_dynamics: string;
    family_challenges: string[];
    family_strengths: string[];
    family_goals: string;
  };
  step_4_partner?: {
    relationship_status: string;
    partner_satisfaction: number;
    communication_quality: string;
    romantic_goals: string;
  };
  step_5_social?: {
    social_circle_size: string;
    friendship_quality: string;
    community_involvement: string[];
    networking_goals: string;
  };
  step_6_communication?: {
    communication_style: string;
    conflict_approach: string;
    listening_skills: string;
    expression_challenges: string[];
  };
  step_7_boundaries?: {
    boundary_awareness: string;
    boundary_challenges: string[];
    boundary_goals: string;
    self_protection: string;
  };
  step_8_action_plan?: {
    priority_relationship: string;
    first_action: string;
    weekly_commitment: string;
    support_needed: string;
  };
}

export interface RelationshipsJourney {
  id: string;
  user_id: string;
  journey_data: RelationshipsJourneyData;
  current_step: number;
  journey_complete: boolean;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export const useRelationshipsJourney = (journeyId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<RelationshipsJourney | null>(null);
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
            .from('relationships_journeys')
            .select('*')
            .eq('id', journeyId)
            .single();

          if (error) throw error;
          
          const mappedData: RelationshipsJourney = {
            id: data.id,
            user_id: data.user_id,
            journey_data: {
              step_1_vision: data.step_1_vision as RelationshipsJourneyData['step_1_vision'],
              step_2_current_state: data.step_2_current_state as RelationshipsJourneyData['step_2_current_state'],
              step_3_family: data.step_3_family as RelationshipsJourneyData['step_3_family'],
              step_4_partner: data.step_4_partner as RelationshipsJourneyData['step_4_partner'],
              step_5_social: data.step_5_social as RelationshipsJourneyData['step_5_social'],
              step_6_communication: data.step_6_communication as RelationshipsJourneyData['step_6_communication'],
              step_7_boundaries: data.step_7_boundaries as RelationshipsJourneyData['step_7_boundaries'],
              step_8_action_plan: data.step_8_action_plan as RelationshipsJourneyData['step_8_action_plan'],
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
            .from('relationships_journeys')
            .select('*')
            .eq('user_id', user.id)
            .eq('journey_complete', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (existing) {
            const mappedData: RelationshipsJourney = {
              id: existing.id,
              user_id: existing.user_id,
              journey_data: {
                step_1_vision: existing.step_1_vision as RelationshipsJourneyData['step_1_vision'],
                step_2_current_state: existing.step_2_current_state as RelationshipsJourneyData['step_2_current_state'],
                step_3_family: existing.step_3_family as RelationshipsJourneyData['step_3_family'],
                step_4_partner: existing.step_4_partner as RelationshipsJourneyData['step_4_partner'],
                step_5_social: existing.step_5_social as RelationshipsJourneyData['step_5_social'],
                step_6_communication: existing.step_6_communication as RelationshipsJourneyData['step_6_communication'],
                step_7_boundaries: existing.step_7_boundaries as RelationshipsJourneyData['step_7_boundaries'],
                step_8_action_plan: existing.step_8_action_plan as RelationshipsJourneyData['step_8_action_plan'],
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
              .from('relationships_journeys')
              .insert({
                user_id: user.id,
                current_step: 1,
                journey_complete: false
              })
              .select()
              .single();

            if (createError) throw createError;
            
            const mappedData: RelationshipsJourney = {
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
        console.error('Error fetching/creating relationships journey:', error);
        toast.error('שגיאה בטעינת מסע הקשרים');
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
        .from('relationships_journeys')
        .update(updatePayload)
        .eq('id', journey.id);

      if (error) throw error;

      setJourney(prev => prev ? {
        ...prev,
        journey_data: {
          ...prev.journey_data,
          [stepKey]: data
        } as RelationshipsJourneyData,
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
        .from('relationships_journeys')
        .update({
          journey_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', journey.id);

      if (updateError) throw updateError;

      toast.success('מסע הקשרים הושלם בהצלחה!');
      navigate('/relationships');
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
    2: 'current_state',
    3: 'family',
    4: 'partner',
    5: 'social',
    6: 'communication',
    7: 'boundaries',
    8: 'action_plan'
  };
  return stepNames[stepNumber] || 'unknown';
}

export default useRelationshipsJourney;
