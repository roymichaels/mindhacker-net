import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LifePlan {
  id: string;
  user_id: string;
  duration_months: number;
  start_date: string;
  end_date: string;
  plan_data: any;
  status: string;
  progress_percentage: number;
  created_at: string;
}

interface Milestone {
  id: string;
  plan_id: string;
  week_number: number;
  month_number: number;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  focus_area: string | null;
  focus_area_en?: string | null;
  tasks: string[];
  tasks_en: string[] | null;
  goal: string | null;
  goal_en: string | null;
  challenge: string | null;
  hypnosis_recommendation: string | null;
  is_completed: boolean;
  completed_at: string | null;
  xp_reward: number;
  tokens_reward: number;
  start_date: string | null;
  end_date: string | null;
}

interface LaunchpadSummary {
  id: string;
  summary_data: any;
  consciousness_score: number;
  transformation_readiness: number;
  clarity_score: number;
  generated_at: string;
}

export function useLifePlan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['life-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('life_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as LifePlan | null;
    },
    enabled: !!user?.id,
  });
}

export function useMilestones(planId: string | null) {
  return useQuery({
    queryKey: ['milestones', planId],
    queryFn: async () => {
      if (!planId) return [];

      const { data, error } = await supabase
        .from('life_plan_milestones')
        .select('*')
        .eq('plan_id', planId)
        .order('week_number', { ascending: true });

      if (error) throw error;
      return data as Milestone[];
    },
    enabled: !!planId,
  });
}

export function useCurrentWeekMilestone(planId: string | null, startDate: string | null) {
  return useQuery({
    queryKey: ['current-week-milestone', planId, startDate],
    queryFn: async () => {
      if (!planId || !startDate) return null;

      // Calculate current week number
      const start = new Date(startDate);
      const now = new Date();
      const diffTime = now.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      // 100-day plan with 10 phases (10 days each)
      const currentPhase = Math.min(10, Math.max(1, Math.ceil((diffDays + 1) / 10)));
      const currentWeek = currentPhase; // week_number column = phase_number

      const { data, error } = await supabase
        .from('life_plan_milestones')
        .select('*')
        .eq('plan_id', planId)
        .eq('week_number', currentWeek)
        .maybeSingle();

      if (error) throw error;
      return data as Milestone | null;
    },
    enabled: !!planId && !!startDate,
  });
}

export function useLaunchpadSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['launchpad-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('launchpad_summaries')
        .select('*')
        .eq('user_id', user.id)
        // Regenerations can create multiple rows; always take the newest.
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as LaunchpadSummary | null;
    },
    enabled: !!user?.id,
  });
}

export function useCompleteMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      milestoneId, 
      planId 
    }: { 
      milestoneId: string; 
      planId: string;
    }) => {
      const { error } = await supabase
        .from('life_plan_milestones')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', milestoneId);

      if (error) throw error;

      return { milestoneId, planId };
    },
    onSuccess: ({ planId }) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', planId] });
      queryClient.invalidateQueries({ queryKey: ['life-plan'] });
      queryClient.invalidateQueries({ queryKey: ['current-week-milestone'] });
      
      toast({
        title: '🎉 Milestone completed!',
        description: '+50 XP, +5 Tokens',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete milestone',
        variant: 'destructive',
      });
    },
  });
}

export function useLifePlanWithMilestones() {
  const { data: plan, isLoading: planLoading } = useLifePlan();
  const { data: milestones, isLoading: milestonesLoading } = useMilestones(plan?.id || null);
  const { data: currentMilestone } = useCurrentWeekMilestone(plan?.id || null, plan?.start_date || null);
  const { data: summary } = useLaunchpadSummary();

  // Calculate current week
  const getCurrentWeek = () => {
    if (!plan?.start_date) return 1;
    const start = new Date(plan.start_date);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(10, Math.max(1, Math.ceil((diffDays + 1) / 10)));
  };

  return {
    plan,
    milestones: milestones || [],
    currentMilestone,
    currentWeek: getCurrentWeek(),
    summary,
    isLoading: planLoading || milestonesLoading,
    hasLifePlan: !!plan,
  };
}
