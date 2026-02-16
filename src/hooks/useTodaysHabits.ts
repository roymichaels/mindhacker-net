import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { ActionItem } from '@/services/actionItems';

export interface TodayHabit {
  id: string;
  title: string;
  category: string | null;
  isCompleted: boolean;
  logId: string | null;
}

export function useTodaysHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const query = useQuery({
    queryKey: ['action-items', 'habits', user?.id, today],
    queryFn: async (): Promise<TodayHabit[]> => {
      if (!user?.id) return [];

      // Fetch habits from action_items
      const { data: habits } = await supabase
        .from('action_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'habit')
        .order('created_at', { ascending: true });

      if (!habits || habits.length === 0) return [];

      // Fetch today's logs from daily_habit_logs (still used for daily tracking)
      const { data: logs } = await supabase
        .from('daily_habit_logs')
        .select('id, habit_item_id, is_completed')
        .eq('user_id', user.id)
        .eq('track_date', today);

      // Also check action_items metadata for legacy habit IDs
      const logsMap = new Map(logs?.map(l => [l.habit_item_id, l]) || []);

      return habits.map(habit => {
        const legacyId = (habit as any).metadata?.legacy_id;
        const log = logsMap.get(legacyId) || logsMap.get(habit.id);
        return {
          id: habit.id,
          title: (habit as any).title,
          category: (habit as any).pillar,
          isCompleted: log?.is_completed || false,
          logId: log?.id || null,
        };
      });
    },
    enabled: !!user?.id,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string; completed: boolean }) => {
      if (!user?.id) throw new Error('No user');

      const existing = query.data?.find(h => h.id === habitId);

      if (existing?.logId) {
        await supabase
          .from('daily_habit_logs')
          .update({ 
            is_completed: completed,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', existing.logId);
      } else {
        // Use the legacy_id from metadata if available, otherwise the action_item id
        const { data: actionItem } = await supabase
          .from('action_items')
          .select('metadata')
          .eq('id', habitId)
          .single();
        
        const habitItemId = (actionItem as any)?.metadata?.legacy_id || habitId;

        await supabase
          .from('daily_habit_logs')
          .insert({
            user_id: user.id,
            habit_item_id: habitItemId,
            track_date: today,
            is_completed: completed,
            completed_at: completed ? new Date().toISOString() : null,
          });
      }
    },
    onMutate: async ({ habitId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['action-items', 'habits', user?.id, today] });
      const previousData = queryClient.getQueryData(['action-items', 'habits', user?.id, today]);
      
      queryClient.setQueryData(['action-items', 'habits', user?.id, today], (old: TodayHabit[] | undefined) => 
        old?.map(h => h.id === habitId ? { ...h, isCompleted: completed } : h)
      );
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['action-items', 'habits', user?.id, today], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items', 'habits'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-activity'] });
    },
  });

  const completedCount = query.data?.filter(h => h.isCompleted).length || 0;
  const totalCount = query.data?.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    habits: query.data || [],
    isLoading: query.isLoading,
    toggleHabit: (habitId: string, completed: boolean) => toggleMutation.mutate({ habitId, completed }),
    isToggling: toggleMutation.isPending,
    completedCount,
    totalCount,
    progress,
  };
}
