import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
    queryKey: ['todays-habits', user?.id, today],
    queryFn: async (): Promise<TodayHabit[]> => {
      if (!user?.id) return [];

      // Fetch daily minimums (habits)
      const { data: habits } = await supabase
        .from('aurora_daily_minimums')
        .select('id, title, category')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (!habits || habits.length === 0) return [];

      // Fetch today's logs
      const { data: logs } = await supabase
        .from('daily_habit_logs')
        .select('id, habit_item_id, is_completed')
        .eq('user_id', user.id)
        .eq('track_date', today);

      const logsMap = new Map(logs?.map(l => [l.habit_item_id, l]) || []);

      return habits.map(habit => {
        const log = logsMap.get(habit.id);
        return {
          id: habit.id,
          title: habit.title,
          category: habit.category,
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
        // Update existing log
        await supabase
          .from('daily_habit_logs')
          .update({ 
            is_completed: completed,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', existing.logId);
      } else {
        // Create new log
        await supabase
          .from('daily_habit_logs')
          .insert({
            user_id: user.id,
            habit_item_id: habitId,
            track_date: today,
            is_completed: completed,
            completed_at: completed ? new Date().toISOString() : null,
          });
      }
    },
    onMutate: async ({ habitId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todays-habits', user?.id, today] });
      const previousData = queryClient.getQueryData(['todays-habits', user?.id, today]);
      
      queryClient.setQueryData(['todays-habits', user?.id, today], (old: TodayHabit[] | undefined) => 
        old?.map(h => h.id === habitId ? { ...h, isCompleted: completed } : h)
      );
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['todays-habits', user?.id, today], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todays-habits'] });
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
