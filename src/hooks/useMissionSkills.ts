/**
 * useMissionSkills — Fetches mission-based skills with their milestones.
 * These are skills created from plan missions during strategy generation.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface MissionMilestone {
  id: string;
  title: string;
  title_en: string | null;
  is_completed: boolean;
  milestone_number: number;
}

export interface MissionSkill {
  skill_id: string;
  skill_name: string;
  skill_name_he: string | null;
  skill_icon: string;
  skill_category: string;
  mission_id: string;
  mission_title: string;
  mission_title_en: string | null;
  xp_total: number;
  level: number;
  milestones: MissionMilestone[];
}

export function useMissionSkills() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mission-skills', user?.id],
    queryFn: async (): Promise<MissionSkill[]> => {
      if (!user?.id) return [];

      // Get user's mission-linked skills
      const { data: skills, error: skillsErr } = await supabase
        .from('skills')
        .select('id, name, name_he, icon, category, mission_id')
        .eq('user_id', user.id)
        .not('mission_id', 'is', null);

      if (skillsErr || !skills || skills.length === 0) return [];

      // Get skill progress
      const skillIds = skills.map(s => s.id);
      const { data: progress } = await supabase
        .from('user_skill_progress')
        .select('skill_id, xp_total, level')
        .eq('user_id', user.id)
        .in('skill_id', skillIds);

      const progressMap = new Map(
        (progress || []).map(p => [p.skill_id, p])
      );

      // Get missions for titles
      const missionIds = skills.map(s => s.mission_id).filter(Boolean) as string[];
      const { data: missions } = await supabase
        .from('plan_missions')
        .select('id, title, title_en')
        .in('id', missionIds);

      const missionMap = new Map(
        (missions || []).map(m => [m.id, m])
      );

      // Get milestones for all missions
      const { data: milestones } = await supabase
        .from('life_plan_milestones')
        .select('id, mission_id, title, title_en, is_completed, milestone_number')
        .in('mission_id', missionIds)
        .order('milestone_number', { ascending: true });

      const milestonesByMission = new Map<string, MissionMilestone[]>();
      (milestones || []).forEach(ms => {
        const key = ms.mission_id;
        if (!key) return;
        if (!milestonesByMission.has(key)) milestonesByMission.set(key, []);
        milestonesByMission.get(key)!.push({
          id: ms.id,
          title: ms.title,
          title_en: ms.title_en,
          is_completed: ms.is_completed ?? false,
          milestone_number: ms.milestone_number ?? 0,
        });
      });

      return skills.map(s => {
        const prog = progressMap.get(s.id);
        const mission = missionMap.get(s.mission_id!);
        return {
          skill_id: s.id,
          skill_name: s.name,
          skill_name_he: s.name_he,
          skill_icon: s.icon,
          skill_category: s.category,
          mission_id: s.mission_id!,
          mission_title: mission?.title || s.name,
          mission_title_en: mission?.title_en || null,
          xp_total: prog?.xp_total || 0,
          level: prog?.level || 1,
          milestones: milestonesByMission.get(s.mission_id!) || [],
        };
      });
    },
    enabled: !!user?.id,
  });
}
