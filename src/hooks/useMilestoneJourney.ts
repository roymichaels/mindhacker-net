import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface JourneyStep {
  title: string;
  description: string;
  icon: string;
  duration_seconds: number;
  type: 'prepare' | 'warm_up' | 'core' | 'challenge' | 'cool_down' | 'reflect' | 'celebrate';
  guidance_lines: string[];
  completion_criteria: string;
}

export interface MilestoneJourney {
  id: string;
  milestone_id: string;
  steps: {
    steps: JourneyStep[];
    journey_theme: string;
    journey_emoji: string;
  };
  total_steps: number;
  completed_steps: number;
  current_step: number;
  status: string;
}

export function useMilestoneJourney(milestoneId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['milestone-journey', milestoneId, user?.id],
    queryFn: async () => {
      if (!milestoneId || !user?.id) return null;
      const { data, error } = await supabase
        .from('milestone_journey_steps')
        .select('*')
        .eq('milestone_id', milestoneId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as MilestoneJourney | null;
    },
    enabled: !!milestoneId && !!user?.id,
  });
}

export function useGenerateMilestoneJourney() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      milestone_id: string;
      milestone_title: string;
      milestone_description?: string;
      focus_area?: string;
      duration_minutes?: number;
      language: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-milestone-journey', {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.journey as MilestoneJourney;
    },
    onSuccess: (journey) => {
      queryClient.invalidateQueries({ queryKey: ['milestone-journey', journey.milestone_id] });
    },
    onError: (err) => {
      toast({
        title: 'Error generating journey',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateJourneyProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ journeyId, currentStep, completedSteps, status }: {
      journeyId: string;
      currentStep: number;
      completedSteps: number;
      status?: string;
    }) => {
      const { error } = await supabase
        .from('milestone_journey_steps')
        .update({
          current_step: currentStep,
          completed_steps: completedSteps,
          status: status || 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', journeyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone-journey'] });
    },
  });
}
