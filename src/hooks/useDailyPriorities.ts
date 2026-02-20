/**
 * @module useDailyPriorities
 * Checks if the user has submitted their 5 daily priorities today.
 * Provides submit logic that inserts them as action_items with source='user' and tag 'daily_priority'.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const todayStr = () => new Date().toISOString().slice(0, 10);

export function useDailyPriorities() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = todayStr();

  const { data: filledToday = false, isLoading } = useQuery({
    queryKey: ['daily-priorities-filled', user?.id, today],
    queryFn: async () => {
      if (!user?.id) return false;
      const { count } = await supabase
        .from('action_items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('source', 'user')
        .contains('tags', ['daily_priority'])
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);
      return (count || 0) >= 5;
    },
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async (priorities: string[]) => {
      if (!user?.id) throw new Error('No user');
      if (priorities.length !== 5) throw new Error('Exactly 5 priorities required');

      const rows = priorities.map((title, idx) => ({
        user_id: user.id,
        type: 'task' as const,
        source: 'user' as const,
        status: 'todo' as const,
        title,
        order_index: idx,
        tags: ['daily_priority'],
        due_at: `${today}T23:59:59`,
        metadata: { daily_priority_date: today, priority_rank: idx + 1 },
      }));

      const { error } = await supabase
        .from('action_items')
        .insert(rows as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-priorities-filled'] });
      queryClient.invalidateQueries({ queryKey: ['daily-roadmap-tasks'] });
    },
  });

  return {
    filledToday,
    isLoading,
    submitPriorities: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}
