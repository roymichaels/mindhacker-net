/**
 * Hook: useMiningStats
 * Fetches the user's Play2Earn mining activity, rules, and daily stats.
 */
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MiningRule {
  id: string;
  activity_type: string;
  label_en: string;
  label_he: string;
  base_reward: number;
  max_daily: number;
  cooldown_minutes: number;
  is_active: boolean;
}

export interface MiningLog {
  id: string;
  activity_type: string;
  mos_awarded: number;
  source_table: string | null;
  mined_at: string;
  metadata: any;
}

export interface DailyBreakdown {
  activity_type: string;
  total: number;
  count: number;
  cap: number;
  label_en: string;
  label_he: string;
}

export function useMiningStats() {
  const { user } = useAuth();

  const { data: rules = [] } = useQuery({
    queryKey: ['fm-mining-rules'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('fm_mining_rules')
        .select('*')
        .eq('is_active', true)
        .order('base_reward', { ascending: false });
      if (error) throw error;
      return (data ?? []) as MiningRule[];
    },
    staleTime: 300000,
  });

  const { data: todayLogs = [], isLoading } = useQuery({
    queryKey: ['fm-mining-today', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await (supabase as any)
        .from('fm_mining_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('mined_at', `${today}T00:00:00`)
        .order('mined_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as MiningLog[];
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['fm-mining-recent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await (supabase as any)
        .from('fm_mining_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('mined_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as MiningLog[];
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Build daily breakdown
  const dailyBreakdown: DailyBreakdown[] = rules.map((rule) => {
    const logs = todayLogs.filter((l) => l.activity_type === rule.activity_type);
    return {
      activity_type: rule.activity_type,
      total: logs.reduce((sum, l) => sum + l.mos_awarded, 0),
      count: logs.length,
      cap: rule.max_daily,
      label_en: rule.label_en,
      label_he: rule.label_he,
    };
  }).filter((b) => b.count > 0 || b.cap > 0);

  const todayTotal = todayLogs.reduce((sum, l) => sum + l.mos_awarded, 0);
  const todayCount = todayLogs.length;

  return {
    rules,
    todayLogs,
    recentLogs,
    dailyBreakdown,
    todayTotal,
    todayCount,
    isLoading,
  };
}
