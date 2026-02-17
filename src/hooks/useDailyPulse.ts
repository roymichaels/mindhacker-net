import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type MoodSignal = 'wired' | 'drained' | 'neutral' | 'focused' | 'flow';
export type SleepCompliance = 'yes' | 'partial' | 'no';

export interface DailyPulse {
  id: string;
  user_id: string;
  log_date: string;
  energy_rating: number;
  sleep_compliance: SleepCompliance;
  task_confidence: number;
  screen_discipline: boolean;
  mood_signal: MoodSignal;
  created_at: string;
}

export interface PulseInput {
  energy_rating: number;
  sleep_compliance: SleepCompliance;
  task_confidence: number;
  screen_discipline: boolean;
  mood_signal: MoodSignal;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function useDailyPulse() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = todayStr();

  const { data: todayPulse, isLoading } = useQuery({
    queryKey: ['daily-pulse', user?.id, today],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('daily_pulse_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', today)
        .maybeSingle();
      return data as DailyPulse | null;
    },
    enabled: !!user?.id,
  });

  const { data: weekPulses = [] } = useQuery({
    queryKey: ['weekly-pulse', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await supabase
        .from('daily_pulse_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', weekAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: false });
      return (data || []) as DailyPulse[];
    },
    enabled: !!user?.id,
  });

  const submitPulse = useMutation({
    mutationFn: async (input: PulseInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('daily_pulse_logs')
        .upsert({
          user_id: user.id,
          log_date: today,
          ...input,
        }, { onConflict: 'user_id,log_date' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-pulse'] });
      qc.invalidateQueries({ queryKey: ['weekly-pulse'] });
    },
  });

  const hasLoggedToday = !!todayPulse;

  // Compute weekly averages
  const weekStats = weekPulses.length > 0 ? {
    avgEnergy: weekPulses.reduce((s, p) => s + p.energy_rating, 0) / weekPulses.length,
    avgConfidence: weekPulses.reduce((s, p) => s + p.task_confidence, 0) / weekPulses.length,
    sleepComplianceRate: weekPulses.filter(p => p.sleep_compliance === 'yes').length / weekPulses.length,
    screenDisciplineRate: weekPulses.filter(p => p.screen_discipline).length / weekPulses.length,
    dominantMood: getDominantMood(weekPulses),
    daysLogged: weekPulses.length,
  } : null;

  return {
    todayPulse,
    weekPulses,
    weekStats,
    hasLoggedToday,
    isLoading,
    submitPulse,
  };
}

function getDominantMood(pulses: DailyPulse[]): MoodSignal {
  const counts: Record<string, number> = {};
  pulses.forEach(p => { counts[p.mood_signal] = (counts[p.mood_signal] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodSignal || 'neutral';
}
