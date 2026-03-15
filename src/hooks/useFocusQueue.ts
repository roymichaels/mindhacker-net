/**
 * useFocusQueue — Fetches today's action_items sorted by priority_score.
 * Supports drag-and-drop reordering that persists priority_score to DB.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface FocusQueueItem {
  id: string;
  title: string;
  type: string;
  status: string;
  priority_score: number;
  pillar: string | null;
  tags: string[] | null;
  due_at: string | null;
  xp_reward: number;
  completed_at: string | null;
  metadata: Record<string, any> | null;
  time_block: string | null;
  energy_phase: string | null;
  start_time: string | null;
  end_time: string | null;
  scheduled_date: string | null;
}

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function useFocusQueue() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = todayStr();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['focus-queue', user?.id, today],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('action_items')
        .select('id, title, type, status, priority_score, pillar, tags, due_at, xp_reward, completed_at, metadata, time_block, energy_phase, start_time, end_time, scheduled_date')
        .eq('user_id', user.id)
        .in('status', ['todo', 'doing'])
        .in('type', ['task', 'habit', 'session'])
        .or(`scheduled_date.eq.${today},due_at.gte.${today}T00:00:00,due_at.lte.${today}T23:59:59,scheduled_date.is.null`)
        .order('priority_score', { ascending: false, nullsFirst: false })
        .order('order_index', { ascending: true })
        .limit(20);
      if (error) throw error;
      return (data || []) as FocusQueueItem[];
    },
    enabled: !!user?.id,
  });

  const completedCount = items.filter(i => i.status === 'done').length;
  const totalCount = items.length;

  // Reorder mutation — updates priority_score for all items in new order
  const reorderMutation = useMutation({
    mutationFn: async (reorderedIds: string[]) => {
      const updates = reorderedIds.map((id, idx) => ({
        id,
        priority_score: (reorderedIds.length - idx) * 10, // Higher score = higher priority
      }));
      // Batch update
      for (const u of updates) {
        const { error } = await supabase
          .from('action_items')
          .update({ priority_score: u.priority_score } as any)
          .eq('id', u.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-queue'] });
    },
  });

  // Complete a task
  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('action_items')
        .update({ status: 'done' as any })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-queue'] });
      queryClient.invalidateQueries({ queryKey: ['action-items'] });
    },
  });

  // Skip a task
  const skipMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('action_items')
        .update({ status: 'skipped' as any })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-queue'] });
      queryClient.invalidateQueries({ queryKey: ['action-items'] });
    },
  });

  const nextItem = items.find(i => i.status !== 'done') || null;
  const nextIndex = nextItem ? items.indexOf(nextItem) : -1;

  return {
    items,
    isLoading,
    nextItem,
    nextIndex,
    completedCount,
    totalCount,
    reorder: reorderMutation.mutateAsync,
    complete: completeMutation.mutateAsync,
    skip: skipMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
  };
}
