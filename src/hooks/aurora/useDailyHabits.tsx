import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface HabitItem {
  id: string;
  checklist_id: string;
  content: string;
  is_recurring: boolean;
  order_index: number;
  created_at: string;
}

interface DailyHabitLog {
  id: string;
  user_id: string;
  habit_item_id: string;
  track_date: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string; // 'manual' | 'aurora' from DB but typed as string
  notes: string | null;
}

interface HabitWithStreak extends HabitItem {
  todayLog: DailyHabitLog | null;
  streak: number;
  weeklyHistory: { date: string; completed: boolean }[];
}

interface DailyHabitsResult {
  habits: HabitWithStreak[];
  loading: boolean;
  todayStats: {
    completed: number;
    total: number;
    percentage: number;
  };
  weeklyStats: {
    completed: number;
    total: number;
    percentage: number;
  };
  completeHabit: (habitItemId: string, completedBy?: 'manual' | 'aurora') => Promise<boolean>;
  uncompleteHabit: (habitItemId: string) => Promise<boolean>;
  getHabitsForAurora: () => string;
}

/**
 * Hook for managing daily recurring habits with streak tracking.
 */
export const useDailyHabits = (user: User | null): DailyHabitsResult => {
  const [habits, setHabits] = useState<HabitWithStreak[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // Calculate streak for a habit
  const calculateStreak = useCallback((logs: DailyHabitLog[]): number => {
    if (logs.length === 0) return 0;

    // Sort by date descending
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.track_date).getTime() - new Date(a.track_date).getTime()
    );

    let streak = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    let checkDate = new Date(todayDate);

    for (const log of sortedLogs) {
      const logDate = new Date(log.track_date);
      logDate.setHours(0, 0, 0, 0);
      
      // Check if this log is for the expected date
      const expectedDateStr = checkDate.toISOString().split('T')[0];
      const logDateStr = logDate.toISOString().split('T')[0];
      
      if (logDateStr === expectedDateStr && log.is_completed) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (logDateStr < expectedDateStr) {
        // Missed a day, streak broken
        break;
      }
    }

    return streak;
  }, []);

  // Get weekly history (last 7 days)
  const getWeeklyHistory = useCallback((logs: DailyHabitLog[]): { date: string; completed: boolean }[] => {
    const history: { date: string; completed: boolean }[] = [];
    const todayDate = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const log = logs.find(l => l.track_date === dateStr);
      history.push({
        date: dateStr,
        completed: log?.is_completed || false,
      });
    }

    return history;
  }, []);

  // Fetch habits and their logs
  const fetchHabits = useCallback(async () => {
    if (!user?.id) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      // Get all recurring habit items
      const { data: habitItems, error: habitsError } = await supabase
        .from('aurora_checklist_items')
        .select(`
          id,
          checklist_id,
          content,
          is_recurring,
          order_index,
          created_at,
          aurora_checklists!inner(user_id, status)
        `)
        .eq('is_recurring', true)
        .eq('aurora_checklists.user_id', user.id)
        .eq('aurora_checklists.status', 'active');

      if (habitsError) {
        console.error('Failed to fetch habits:', habitsError);
        setLoading(false);
        return;
      }

      if (!habitItems || habitItems.length === 0) {
        setHabits([]);
        setLoading(false);
        return;
      }

      // Get logs for last 30 days for streak calculation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const habitIds = habitItems.map(h => h.id);

      const { data: logs, error: logsError } = await supabase
        .from('daily_habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .in('habit_item_id', habitIds)
        .gte('track_date', thirtyDaysAgoStr);

      if (logsError) {
        console.error('Failed to fetch habit logs:', logsError);
      }

      const allLogs = logs || [];

      // Build habits with streak data
      const habitsWithStreak: HabitWithStreak[] = habitItems.map(item => {
        const itemLogs = allLogs.filter(l => l.habit_item_id === item.id);
        const todayLog = itemLogs.find(l => l.track_date === today) || null;
        const streak = calculateStreak(itemLogs);
        const weeklyHistory = getWeeklyHistory(itemLogs);

        return {
          id: item.id,
          checklist_id: item.checklist_id,
          content: item.content,
          is_recurring: item.is_recurring,
          order_index: item.order_index,
          created_at: item.created_at,
          todayLog: todayLog as DailyHabitLog | null,
          streak,
          weeklyHistory,
        };
      });

      setHabits(habitsWithStreak);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, today, calculateStreak, getWeeklyHistory]);

  useEffect(() => {
    fetchHabits();

    // Subscribe to changes
    if (user?.id) {
      const channel = supabase
        .channel('daily-habit-logs')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_habit_logs',
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchHabits()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, fetchHabits]);

  // Complete habit for today
  const completeHabit = useCallback(async (
    habitItemId: string, 
    completedBy: 'manual' | 'aurora' = 'manual'
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Upsert the log for today
      const { error } = await supabase
        .from('daily_habit_logs')
        .upsert({
          user_id: user.id,
          habit_item_id: habitItemId,
          track_date: today,
          is_completed: true,
          completed_at: new Date().toISOString(),
          completed_by: completedBy,
        }, {
          onConflict: 'user_id,habit_item_id,track_date',
        });

      if (error) {
        console.error('Failed to complete habit:', error);
        return false;
      }

      // Award XP
      await supabase.rpc('aurora_award_xp', {
        p_user_id: user.id,
        p_amount: 15,
        p_reason: 'Daily habit completed',
      });

      return true;
    } catch (err) {
      console.error('Error completing habit:', err);
      return false;
    }
  }, [user?.id, today]);

  // Uncomplete habit (remove today's log)
  const uncompleteHabit = useCallback(async (habitItemId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('daily_habit_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('habit_item_id', habitItemId)
        .eq('track_date', today);

      if (error) {
        console.error('Failed to uncomplete habit:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error uncompleting habit:', err);
      return false;
    }
  }, [user?.id, today]);

  // Generate context string for Aurora
  const getHabitsForAurora = useCallback((): string => {
    if (habits.length === 0) return '';

    const lines: string[] = [
      `## 🔄 מעקב הרגלים יומי (היום: ${today})`,
    ];

    for (const habit of habits) {
      const status = habit.todayLog?.is_completed ? '✅' : '❓';
      const streakText = habit.streak > 0 ? ` (streak: ${habit.streak} ימים${habit.streak >= 3 ? ' 🔥' : ''})` : '';
      lines.push(`- ${habit.content}: ${status}${streakText}`);
    }

    const completedToday = habits.filter(h => h.todayLog?.is_completed).length;
    lines.push(`\nסה"כ היום: ${completedToday}/${habits.length}`);

    lines.push(`\nכשמשתמש אומר שביצע הרגל, השתמש בתגית: [habit:complete:שם_הרגל]`);

    return lines.join('\n');
  }, [habits, today]);

  // Calculate stats
  const todayStats = {
    completed: habits.filter(h => h.todayLog?.is_completed).length,
    total: habits.length,
    percentage: habits.length > 0 
      ? Math.round((habits.filter(h => h.todayLog?.is_completed).length / habits.length) * 100)
      : 0,
  };

  const weeklyCompleted = habits.reduce((acc, h) => {
    return acc + h.weeklyHistory.filter(d => d.completed).length;
  }, 0);
  const weeklyTotal = habits.length * 7;

  const weeklyStats = {
    completed: weeklyCompleted,
    total: weeklyTotal,
    percentage: weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0,
  };

  return {
    habits,
    loading,
    todayStats,
    weeklyStats,
    completeHabit,
    uncompleteHabit,
    getHabitsForAurora,
  };
};
