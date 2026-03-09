import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeDifficulty, formatDifficultyMessage, type DifficultySignals, type DifficultyAnalysis } from '@/lib/adaptiveDifficulty';

/**
 * Hook that computes adaptive difficulty signals from the user's real data
 * and provides a recommendation for Aurora to present.
 */
export function useAdaptiveDifficulty() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['adaptive-difficulty', user?.id],
    queryFn: async (): Promise<{ signals: DifficultySignals; analysis: DifficultyAnalysis } | null> => {
      if (!user?.id) return null;

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

      // Parallel data fetch
      const [tasksRes, completedRes, pulseRes, profileRes] = await Promise.all([
        // All tasks scheduled in last 7 days
        supabase.from('action_items')
          .select('id, status, scheduled_date')
          .eq('user_id', user.id)
          .eq('type', 'task')
          .gte('scheduled_date', weekAgo)
          .lte('scheduled_date', today),
        // Completed tasks in last 7 days
        supabase.from('action_items')
          .select('id, completed_at')
          .eq('user_id', user.id)
          .eq('type', 'task')
          .eq('status', 'done')
          .gte('completed_at', `${weekAgo}T00:00:00`),
        // Pulse data last 7 days
        supabase.from('daily_pulse_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('log_date', weekAgo)
          .order('log_date', { ascending: false }),
        // Profile for streak
        supabase.from('profiles')
          .select('session_streak, aurora_preferences')
          .eq('id', user.id)
          .single(),
      ]);

      const allTasks = tasksRes.data || [];
      const completedTasks = completedRes.data || [];
      const pulses = pulseRes.data || [];
      const profile = profileRes.data;

      const totalScheduled = allTasks.length || 1;
      const skipped = allTasks.filter((t: any) => t.status === 'skipped').length;

      // Compute pulse averages
      const avgEnergy = pulses.length > 0
        ? pulses.reduce((s: number, p: any) => s + p.energy_rating, 0) / pulses.length
        : 3;
      const avgConfidence = pulses.length > 0
        ? pulses.reduce((s: number, p: any) => s + p.task_confidence, 0) / pulses.length
        : 3;
      const sleepCompliance = pulses.length > 0
        ? pulses.filter((p: any) => p.sleep_compliance === 'yes').length / pulses.length
        : 0.5;

      // Dominant mood
      const moodCounts: Record<string, number> = {};
      pulses.forEach((p: any) => {
        moodCounts[p.mood_signal] = (moodCounts[p.mood_signal] || 0) + 1;
      });
      const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

      // Current intensity from preferences
      const prefs = (profile?.aurora_preferences as Record<string, unknown>) || {};
      const currentIntensity = (prefs.difficulty_level as 'low' | 'medium' | 'high') || 'medium';

      const signals: DifficultySignals = {
        completionRate7d: completedTasks.length / totalScheduled,
        streakDays: profile?.session_streak || 0,
        skipRate7d: skipped / totalScheduled,
        avgEnergy7d: avgEnergy,
        avgConfidence7d: avgConfidence,
        dominantMood,
        sleepComplianceRate: sleepCompliance,
        currentIntensity,
      };

      const analysis = analyzeDifficulty(signals);
      return { signals, analysis };
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // Cache for 30 min
    refetchOnWindowFocus: false,
  });
}
