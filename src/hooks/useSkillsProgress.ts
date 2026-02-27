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
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('skill_xp_events')
        .select('skill_id, amount')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      if (error) throw error;
      // Aggregate by skill_id
      const map = new Map<string, number>();
      (data || []).forEach((e: any) => {
        map.set(e.skill_id, (map.get(e.skill_id) || 0) + e.amount);
      });
      return Array.from(map.entries()).map(([skill_id, total]) => ({ skill_id, total })) as TodaySkillGain[];
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
