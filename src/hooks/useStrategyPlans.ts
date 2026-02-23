/**
 * useStrategyPlans — hook for managing 90-day strategy plans.
 * Reads active Core + Arena strategies and provides generation trigger.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StrategyWeek {
  week: number;
  theme_en: string;
  theme_he: string;
  intensity: string;
  pillar_focus: string[];
  goals_en: string[];
  goals_he: string[];
  daily_actions: {
    pillar: string;
    action_en: string;
    action_he: string;
    duration_min: number;
    block_type: string;
  }[];
}

export interface StrategyPillarGoal {
  goal_en: string;
  goal_he: string;
  milestones_en: string[];
  milestones_he: string[];
}

export interface StrategyData {
  hub: 'core' | 'arena';
  title_en: string;
  title_he: string;
  vision_en: string;
  vision_he: string;
  weeks?: StrategyWeek[];
  pillars?: Record<string, { goals: StrategyPillarGoal[] }>;
}

export interface StrategyPlan {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  plan_data: { hub: string; strategy: StrategyData };
  status: string;
  progress_percentage: number;
  created_at: string;
}

export function useStrategyPlans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['strategy-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return { core: null, arena: null };

      const { data, error } = await supabase
        .from('life_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const plans = (data || []) as unknown as StrategyPlan[];
      return {
        core: plans.find(p => p.plan_data?.hub === 'core') || null,
        arena: plans.find(p => p.plan_data?.hub === 'arena') || null,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const generateStrategy = useMutation({
    mutationFn: async ({ hub, forceRegenerate }: { hub?: 'core' | 'arena' | 'both'; forceRegenerate?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('generate-90day-strategy', {
        body: {
          user_id: user!.id,
          hub: hub || 'both',
          force_regenerate: forceRegenerate || false,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-plans'] });
      queryClient.invalidateQueries({ queryKey: ['now-engine'] });
      toast({
        title: '✅ Strategy generated',
        description: 'Your 90-day plan has been created based on your assessments.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate strategy',
        variant: 'destructive',
      });
    },
  });

  // Current week calculation
  const getCurrentWeek = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(12, Math.max(1, Math.ceil((diffDays + 1) / 7)));
  };

  const corePlan = query.data?.core;
  const arenaPlan = query.data?.arena;

  return {
    corePlan,
    arenaPlan,
    coreStrategy: corePlan?.plan_data?.strategy as StrategyData | null,
    arenaStrategy: arenaPlan?.plan_data?.strategy as StrategyData | null,
    coreWeek: corePlan ? getCurrentWeek(corePlan.start_date) : null,
    arenaWeek: arenaPlan ? getCurrentWeek(arenaPlan.start_date) : null,
    hasAnyStrategy: !!(corePlan || arenaPlan),
    isLoading: query.isLoading,
    generateStrategy,
    isGenerating: generateStrategy.isPending,
  };
}
