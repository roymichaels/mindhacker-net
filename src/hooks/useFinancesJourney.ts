import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface FinancesJourneyData {
  step_1_vision?: {
    financial_vision: string;
    money_goals: string;
    motivation: string;
  };
  step_2_current_state?: {
    financial_situation: string;
    stress_level: number;
    monthly_overview: string;
    financial_awareness: string;
  };
  step_3_income?: {
    primary_income: string;
    income_sources: string[];
    income_stability: string;
    income_growth_potential: string;
  };
  step_4_expenses?: {
    monthly_expenses: string;
    expense_categories: string[];
    spending_patterns: string;
    biggest_expenses: string[];
  };
  step_5_savings?: {
    current_savings: string;
    savings_rate: string;
    emergency_fund: string;
    savings_goals: string[];
  };
  step_6_debt?: {
    total_debt: string;
    debt_types: string[];
    debt_management: string;
    debt_reduction_goal: string;
  };
  step_7_goals?: {
    short_term_goals: string[];
    long_term_goals: string[];
    investment_interest: string;
    financial_education: string;
  };
  step_8_action_plan?: {
    priority_action: string;
    first_week_action: string;
    monthly_review: string;
    support_needed: string;
  };
}

export interface FinancesJourney {
  id: string;
  user_id: string;
  journey_data: FinancesJourneyData;
  current_step: number;
  journey_complete: boolean;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export const useFinancesJourney = (journeyId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<FinancesJourney | null>(null);
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
            .from('finance_journeys')
            .select('*')
            .eq('id', journeyId)
            .single();

          if (error) throw error;
          
          const mappedData: FinancesJourney = {
            id: data.id,
            user_id: data.user_id,
            journey_data: {
              step_1_vision: data.step_1_vision as FinancesJourneyData['step_1_vision'],
              step_2_current_state: data.step_2_current_state as FinancesJourneyData['step_2_current_state'],
              step_3_income: data.step_3_income as FinancesJourneyData['step_3_income'],
              step_4_expenses: data.step_4_expenses as FinancesJourneyData['step_4_expenses'],
              step_5_savings: data.step_5_savings as FinancesJourneyData['step_5_savings'],
              step_6_debt: data.step_6_debt as FinancesJourneyData['step_6_debt'],
              step_7_goals: data.step_7_goals as FinancesJourneyData['step_7_goals'],
              step_8_action_plan: data.step_8_action_plan as FinancesJourneyData['step_8_action_plan'],
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
            .from('finance_journeys')
            .select('*')
            .eq('user_id', user.id)
            .eq('journey_complete', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (existing) {
            const mappedData: FinancesJourney = {
              id: existing.id,
              user_id: existing.user_id,
              journey_data: {
                step_1_vision: existing.step_1_vision as FinancesJourneyData['step_1_vision'],
                step_2_current_state: existing.step_2_current_state as FinancesJourneyData['step_2_current_state'],
                step_3_income: existing.step_3_income as FinancesJourneyData['step_3_income'],
                step_4_expenses: existing.step_4_expenses as FinancesJourneyData['step_4_expenses'],
                step_5_savings: existing.step_5_savings as FinancesJourneyData['step_5_savings'],
                step_6_debt: existing.step_6_debt as FinancesJourneyData['step_6_debt'],
                step_7_goals: existing.step_7_goals as FinancesJourneyData['step_7_goals'],
                step_8_action_plan: existing.step_8_action_plan as FinancesJourneyData['step_8_action_plan'],
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
              .from('finance_journeys')
              .insert({
                user_id: user.id,
                current_step: 1,
                journey_complete: false
              })
              .select()
              .single();

            if (createError) throw createError;
            
            const mappedData: FinancesJourney = {
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
        console.error('Error fetching/creating finances journey:', error);
        toast.error('שגיאה בטעינת מסע הפיננסים');
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
        .from('finance_journeys')
        .update(updatePayload)
        .eq('id', journey.id);

      if (error) throw error;

      setJourney(prev => prev ? {
        ...prev,
        journey_data: {
          ...prev.journey_data,
          [stepKey]: data
        } as FinancesJourneyData,
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
        .from('finance_journeys')
        .update({
          journey_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', journey.id);

      if (updateError) throw updateError;

      toast.success('מסע הפיננסים הושלם בהצלחה!');
      navigate('/finances');
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
    3: 'income',
    4: 'expenses',
    5: 'savings',
    6: 'debt',
    7: 'goals',
    8: 'action_plan'
  };
  return stepNames[stepNumber] || 'unknown';
}

export default useFinancesJourney;
