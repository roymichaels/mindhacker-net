/**
 * Hook to manage business 90-day plans and milestones
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BusinessPlanMilestone {
  id: string;
  plan_id: string;
  week_number: number;
  title: string;
  description: string | null;
  focus_area: string | null;
  tasks: { title: string; completed: boolean }[];
  is_completed: boolean;
  completed_at: string | null;
  xp_reward: number;
  tokens_reward: number;
}

export interface BusinessPlan {
  id: string;
  business_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'paused';
  start_date: string | null;
  end_date: string | null;
  plan_data: Record<string, unknown>;
  total_weeks: number;
  current_week: number;
  created_at: string;
  updated_at: string;
  milestones?: BusinessPlanMilestone[];
}

export function useBusinessPlan(businessId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch the active plan for a business
  const { data: plan, isLoading } = useQuery({
    queryKey: ['business-plan', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('business_plans')
        .select(`
          *,
          milestones:business_plan_milestones(*)
        `)
        .eq('business_id', businessId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        // Parse tasks JSONB for each milestone and sort by week_number
        type MilestoneRow = Record<string, unknown> & { week_number?: number; tasks?: unknown };
        const rawMilestones = (data.milestones || []) as MilestoneRow[];
        
        const parsedMilestones = rawMilestones
          .map((m) => ({
            ...m,
            tasks: Array.isArray(m.tasks) ? m.tasks : [],
          }))
          .sort((a, b) => ((a.week_number || 0) as number) - ((b.week_number || 0) as number));
        
        return { ...data, milestones: parsedMilestones } as BusinessPlan;
      }
      
      return null;
    },
    enabled: !!businessId && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Create a new plan
  const createPlanMutation = useMutation({
    mutationFn: async (planData: {
      title: string;
      description?: string;
      milestones?: Omit<BusinessPlanMilestone, 'id' | 'plan_id'>[];
    }) => {
      if (!businessId || !user?.id) throw new Error('Missing IDs');
      
      // Create the plan
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 90);
      
      const { data: newPlan, error: planError } = await supabase
        .from('business_plans')
        .insert({
          business_id: businessId,
          user_id: user.id,
          title: planData.title,
          description: planData.description,
          status: 'active',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          total_weeks: 12,
          current_week: 1,
        })
        .select()
        .single();
      
      if (planError) throw planError;
      
      // Create milestones if provided
      if (planData.milestones && planData.milestones.length > 0) {
        const milestonesWithPlanId = planData.milestones.map(m => ({
          ...m,
          plan_id: newPlan.id,
        }));
        
        const { error: milestonesError } = await supabase
          .from('business_plan_milestones')
          .insert(milestonesWithPlanId);
        
        if (milestonesError) throw milestonesError;
      }
      
      return newPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-plan', businessId] });
    },
  });

  // Complete a milestone
  const completeMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase
        .from('business_plan_milestones')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', milestoneId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-plan', businessId] });
    },
  });

  // Update milestone tasks
  const updateMilestoneTasksMutation = useMutation({
    mutationFn: async ({ milestoneId, tasks }: { 
      milestoneId: string; 
      tasks: { title: string; completed: boolean }[];
    }) => {
      const { error } = await supabase
        .from('business_plan_milestones')
        .update({ tasks })
        .eq('id', milestoneId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-plan', businessId] });
    },
  });

  // Calculate progress
  const progress = plan ? {
    totalMilestones: plan.milestones?.length || 0,
    completedMilestones: plan.milestones?.filter(m => m.is_completed).length || 0,
    percentage: plan.milestones?.length 
      ? Math.round((plan.milestones.filter(m => m.is_completed).length / plan.milestones.length) * 100)
      : 0,
    currentWeek: plan.current_week,
    totalWeeks: plan.total_weeks,
  } : null;

  return {
    plan,
    progress,
    isLoading,
    createPlan: createPlanMutation.mutate,
    isCreating: createPlanMutation.isPending,
    completeMilestone: completeMilestoneMutation.mutate,
    updateMilestoneTasks: updateMilestoneTasksMutation.mutate,
  };
}
