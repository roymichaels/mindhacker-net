/**
 * useSkillsProgress — SSOT hook for skill progression.
 * 
 * SSOT: skill_xp_events is the ledger (source of truth).
 *       user_skill_progress is the cache (derived).
 *       Only write path: award_skill_xp() RPC.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export interface SkillProgress {
  user_id: string;
  skill_id: string;
  xp_total: number;
  level: number;
  updated_at: string;
  skill: {
    id: string;
    name: string;
    name_he: string | null;
    description: string | null;
    category: string;
    icon: string;
  };
}

export interface TodaySkillGain {
  skill_id: string;
  total: number;
}

export function useSkillsProgress() {
  const { user } = useAuth();

  const { data: skills, isLoading } = useQuery({
    queryKey: ['skill-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_skill_progress')
        .select('*, skills(*)')
        .eq('user_id', user.id)
        .order('xp_total', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        user_id: row.user_id,
        skill_id: row.skill_id,
        xp_total: row.xp_total,
        level: row.level,
        updated_at: row.updated_at,
        skill: row.skills,
      })) as SkillProgress[];
    },
    enabled: !!user?.id,
  });

  const { data: todayGains } = useQuery({
    queryKey: ['skill-today-gains', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .rpc('get_skill_gains_today', { p_user_id: user.id, p_tz: getUserTimezone() });
      if (error) throw error;
      return (data || []).map((r: any) => ({ skill_id: r.skill_id, total: Number(r.total) })) as TodaySkillGain[];
    },
    enabled: !!user?.id,
  });

  const { data: allSkills } = useQuery({
    queryKey: ['skills-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('category, name');
      if (error) throw error;
      return data || [];
    },
  });

  return {
    skills: skills || [],
    todayGains: todayGains || [],
    allSkills: allSkills || [],
    isLoading,
    topSkills: (skills || []).slice(0, 12),
    totalTodayXP: (todayGains || []).reduce((sum, g) => sum + g.total, 0),
  };
}
