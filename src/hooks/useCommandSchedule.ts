import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { supabase } from '@/integrations/supabase/client';
import {
  getScheduleBlocks,
  getDailyCompliance,
  updateBlockStatus,
  generateDayBlocks,
  type ScheduleBlock,
  type BlockType,
} from '@/services/scheduleBlocks';

const KEYS = {
  blocks: (uid: string, date: string) => ['schedule-blocks', uid, date] as const,
  compliance: (uid: string, date: string) => ['schedule-compliance', uid, date] as const,
  commitment: (uid: string) => ['schedule-commitment', uid] as const,
  template: (uid: string) => ['schedule-template', uid] as const,
};

/** Today's schedule blocks */
export function useTodayBlocks() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: KEYS.blocks(user?.id || '', today),
    queryFn: () => getScheduleBlocks(user!.id, today),
    enabled: !!user?.id,
  });
}

/** Daily compliance % */
export function useDailyCompliance(date?: string) {
  const { user } = useAuth();
  const d = date || new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: KEYS.compliance(user?.id || '', d),
    queryFn: () => getDailyCompliance(user!.id, d),
    enabled: !!user?.id,
  });
}

/** Read commitment state from life_plans.schedule_settings */
export function useScheduleCommitment() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.commitment(user?.id || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('life_plans')
        .select('id, schedule_settings')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const settings = (data.schedule_settings as Record<string, unknown>) || {};
      return {
        planId: data.id,
        committed: !!settings.schedule_committed,
        commitStartedAt: settings.commit_started_at as string | null,
        commitDays: (settings.commit_days as number) || 7,
        template: settings.schedule_template_week as ScheduleTemplate | null,
      };
    },
    enabled: !!user?.id,
  });
}

export interface ScheduleTemplate {
  blocks: Array<{
    block_type: BlockType;
    start_time: string;
    end_time: string;
    title_he: string;
    title_en: string;
    pillar?: string;
    intensity?: string;
  }>;
}

/** Commit to schedule */
export function useCommitSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const now = new Date().toISOString();

      // Get current settings and merge
      const { data: plan } = await supabase
        .from('life_plans')
        .select('schedule_settings')
        .eq('id', planId)
        .single();

      const currentSettings = (plan?.schedule_settings as Record<string, unknown>) || {};
      const merged = {
        ...currentSettings,
        schedule_committed: true,
        commit_started_at: now,
        commit_days: 7,
      };

      const { error } = await supabase
        .from('life_plans')
        .update({ schedule_settings: merged } as any)
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-commitment'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks'] });
    },
  });
}

/** Toggle block status */
export function useToggleBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'done' | 'skipped' | 'todo' }) =>
      updateBlockStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-compliance'] });
      queryClient.invalidateQueries({ queryKey: ['action-items'] });
    },
  });
}

/** Whether user has Command Schedule access */
export function useHasCommandSchedule() {
  const { isPlus, isApex } = useSubscriptionGate();
  return isPlus || isApex;
}
