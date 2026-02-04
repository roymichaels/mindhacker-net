import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export interface DayActivity {
  date: string;
  dayLabel: string;
  hypnosis: number;
  habits: number;
  tasks: number;
  total: number;
}

export function useWeeklyActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-activity', user?.id],
    queryFn: async (): Promise<DayActivity[]> => {
      if (!user?.id) return [];

      const today = startOfDay(new Date());
      const sevenDaysAgo = subDays(today, 6);
      const startDate = sevenDaysAgo.toISOString();

      // Fetch hypnosis sessions
      const { data: hypnosisData } = await supabase
        .from('hypnosis_sessions')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate);

      // Fetch habit completions
      const { data: habitsData } = await supabase
        .from('daily_habit_logs')
        .select('track_date')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('track_date', format(sevenDaysAgo, 'yyyy-MM-dd'));

      // Fetch completed tasks
      const { data: tasksData } = await supabase
        .from('aurora_checklist_items')
        .select('completed_at, aurora_checklists!inner(user_id)')
        .eq('aurora_checklists.user_id', user.id)
        .eq('is_completed', true)
        .not('completed_at', 'is', null)
        .gte('completed_at', startDate);

      // Build day map
      const dayMap = new Map<string, DayActivity>();
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayLabelsHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

      for (let i = 0; i <= 6; i++) {
        const date = subDays(today, 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayIndex = date.getDay();
        dayMap.set(dateStr, {
          date: dateStr,
          dayLabel: dayLabels[dayIndex],
          hypnosis: 0,
          habits: 0,
          tasks: 0,
          total: 0,
        });
      }

      // Aggregate hypnosis
      hypnosisData?.forEach((session) => {
        const dateStr = format(new Date(session.created_at), 'yyyy-MM-dd');
        const day = dayMap.get(dateStr);
        if (day) {
          day.hypnosis += 1;
          day.total += 1;
        }
      });

      // Aggregate habits
      habitsData?.forEach((log) => {
        const dateStr = log.track_date;
        const day = dayMap.get(dateStr);
        if (day) {
          day.habits += 1;
          day.total += 1;
        }
      });

      // Aggregate tasks
      tasksData?.forEach((task) => {
        if (task.completed_at) {
          const dateStr = format(new Date(task.completed_at), 'yyyy-MM-dd');
          const day = dayMap.get(dateStr);
          if (day) {
            day.tasks += 1;
            day.total += 1;
          }
        }
      });

      return Array.from(dayMap.values());
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useWeeklyXP() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-xp', user?.id],
    queryFn: async () => {
      if (!user?.id) return { current: 0, previous: 0, change: 0 };

      const today = startOfDay(new Date());
      const sevenDaysAgo = subDays(today, 6);
      const fourteenDaysAgo = subDays(today, 13);

      // Current week XP
      const { data: currentData } = await supabase
        .from('xp_events')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      const currentXP = currentData?.reduce((sum, e) => sum + e.amount, 0) || 0;

      // Previous week XP for comparison
      const { data: previousData } = await supabase
        .from('xp_events')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString());

      const previousXP = previousData?.reduce((sum, e) => sum + e.amount, 0) || 0;

      const change = previousXP > 0 
        ? Math.round(((currentXP - previousXP) / previousXP) * 100)
        : currentXP > 0 ? 100 : 0;

      return { current: currentXP, previous: previousXP, change };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
}
