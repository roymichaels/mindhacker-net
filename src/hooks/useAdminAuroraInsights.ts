import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LaunchpadSummary {
  id: string;
  user_id: string;
  summary_data: any;
  consciousness_score: number;
  transformation_readiness: number;
  clarity_score: number;
  generated_at: string;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string | null;
  } | null;
}

interface LifePlan {
  id: string;
  user_id: string;
  summary_id: string | null;
  duration_months: number;
  start_date: string;
  end_date: string;
  plan_data: any;
  status: string;
  progress_percentage: number;
  created_at: string;
}

interface LifePlanMilestone {
  id: string;
  plan_id: string;
  week_number: number;
  month_number: number;
  title: string;
  description: string | null;
  focus_area: string | null;
  tasks: any;
  goal: string | null;
  challenge: string | null;
  hypnosis_recommendation: string | null;
  is_completed: boolean;
  completed_at: string | null;
  xp_reward: number;
  tokens_reward: number;
}

interface UserChecklist {
  id: string;
  title: string;
  status: string;
  origin: string;
  items: Array<{
    id: string;
    content: string;
    is_completed: boolean;
  }>;
}

export function useAdminLaunchpadSummaries() {
  return useQuery({
    queryKey: ['admin-launchpad-summaries'],
    queryFn: async () => {
      // Get summaries
      const { data: summaries, error: summaryError } = await supabase
        .from('launchpad_summaries')
        .select('*')
        .order('generated_at', { ascending: false });
      
      if (summaryError) throw summaryError;
      if (!summaries) return [];

      // Get profiles for user names
      const userIds = summaries.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Map profiles to summaries
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return summaries.map(summary => ({
        ...summary,
        profile: profileMap.get(summary.user_id) || null,
      })) as LaunchpadSummary[];
    },
  });
}

export function useAdminUserSummary(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-summary', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('launchpad_summaries')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as LaunchpadSummary | null;
    },
    enabled: !!userId,
  });
}

export function useAdminUserLifePlan(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-life-plan', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('life_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as LifePlan | null;
    },
    enabled: !!userId,
  });
}

export function useAdminPlanMilestones(planId: string | null) {
  return useQuery({
    queryKey: ['admin-plan-milestones', planId],
    queryFn: async () => {
      if (!planId) return [];

      const { data, error } = await supabase
        .from('life_plan_milestones')
        .select('*')
        .eq('plan_id', planId)
        .order('week_number', { ascending: true });

      if (error) throw error;
      return data as LifePlanMilestone[];
    },
    enabled: !!planId,
  });
}

export function useAdminUserChecklists(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-checklists', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('aurora_checklists')
        .select(`
          id,
          title,
          status,
          origin,
          aurora_checklist_items(id, content, is_completed)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(checklist => ({
        ...checklist,
        items: checklist.aurora_checklist_items || [],
      })) as UserChecklist[];
    },
    enabled: !!userId,
  });
}

export function useAdminUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get user email from auth (admin only via edge function or RPC if available)
      // For now just return profile
      return profile;
    },
    enabled: !!userId,
  });
}

// Aggregate stats for admin overview
export function useAdminAuroraStats() {
  return useQuery({
    queryKey: ['admin-aurora-stats'],
    queryFn: async () => {
      // Count total summaries
      const { count: totalSummaries } = await supabase
        .from('launchpad_summaries')
        .select('*', { count: 'exact', head: true });

      // Count active plans
      const { count: activePlans } = await supabase
        .from('life_plans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get average scores
      const { data: summaries } = await supabase
        .from('launchpad_summaries')
        .select('consciousness_score, transformation_readiness, clarity_score');

      let avgConsciousness = 0;
      let avgReadiness = 0;
      let avgClarity = 0;

      if (summaries && summaries.length > 0) {
        avgConsciousness = Math.round(
          summaries.reduce((acc, s) => acc + (s.consciousness_score || 0), 0) / summaries.length
        );
        avgReadiness = Math.round(
          summaries.reduce((acc, s) => acc + (s.transformation_readiness || 0), 0) / summaries.length
        );
        avgClarity = Math.round(
          summaries.reduce((acc, s) => acc + (s.clarity_score || 0), 0) / summaries.length
        );
      }

      // Count completed plans
      const { count: completedPlans } = await supabase
        .from('life_plans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      return {
        totalSummaries: totalSummaries || 0,
        activePlans: activePlans || 0,
        completedPlans: completedPlans || 0,
        avgConsciousness,
        avgReadiness,
        avgClarity,
      };
    },
  });
}
