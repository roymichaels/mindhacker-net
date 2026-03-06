/**
 * useTraitDetail — Fetches detailed info for a single trait:
 * missions, milestones, and their completion status.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TraitMilestone {
  id: string;
  title: string;
  title_en: string | null;
  is_completed: boolean;
  milestone_number: number;
}

export interface TraitMission {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  pillar: string;
  is_completed: boolean;
  milestones: TraitMilestone[];
}

export interface TraitDetail {
  skill_id: string;
  name: string;
  name_he: string | null;
  description: string | null;
  icon: string;
  pillar: string;
  level: number;
  xp_total: number;
  missions: TraitMission[];
}

export function useTraitDetail(skillId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trait-detail', skillId, user?.id],
    queryFn: async (): Promise<TraitDetail | null> => {
      if (!user?.id || !skillId) return null;

      // Get skill
      const { data: skill } = await supabase
        .from('skills')
        .select('id, name, name_he, description, icon, pillar, category, mission_id')
        .eq('id', skillId)
        .single();

      if (!skill) return null;

      // Get progress
      const { data: prog } = await supabase
        .from('user_skill_progress')
        .select('xp_total, level')
        .eq('user_id', user.id)
        .eq('skill_id', skillId)
        .single();

      // Get missions linked to this trait (via primary_skill_id)
      const { data: missions } = await supabase
        .from('plan_missions')
        .select('id, title, title_en, description, description_en, pillar, is_completed')
        .eq('primary_skill_id', skillId);

      // Also check legacy link (mission_id on skill)
      let allMissionIds = (missions || []).map(m => m.id);
      if (skill.mission_id && !allMissionIds.includes(skill.mission_id)) {
        const { data: legacyMission } = await supabase
          .from('plan_missions')
          .select('id, title, title_en, description, description_en, pillar, is_completed')
          .eq('id', skill.mission_id)
          .single();
        if (legacyMission) {
          (missions || []).push(legacyMission);
          allMissionIds.push(legacyMission.id);
        }
      }

      // Get milestones for all missions
      const { data: milestones } = allMissionIds.length > 0
        ? await supabase
            .from('life_plan_milestones')
            .select('id, mission_id, title, title_en, is_completed, milestone_number')
            .in('mission_id', allMissionIds)
            .order('milestone_number', { ascending: true })
        : { data: [] };

      const milestonesByMission = new Map<string, TraitMilestone[]>();
      (milestones || []).forEach(ms => {
        if (!ms.mission_id) return;
        if (!milestonesByMission.has(ms.mission_id)) milestonesByMission.set(ms.mission_id, []);
        milestonesByMission.get(ms.mission_id)!.push({
          id: ms.id,
          title: ms.title,
          title_en: ms.title_en,
          is_completed: ms.is_completed ?? false,
          milestone_number: ms.milestone_number ?? 0,
        });
      });

      return {
        skill_id: skill.id,
        name: skill.name,
        name_he: skill.name_he,
        description: skill.description,
        icon: skill.icon || '⭐',
        pillar: skill.pillar || skill.category || 'mind',
        level: prog?.level || 1,
        xp_total: prog?.xp_total || 0,
        missions: (missions || []).map(m => ({
          id: m.id,
          title: m.title,
          title_en: m.title_en,
          description: m.description,
          description_en: m.description_en,
          pillar: m.pillar || '',
          is_completed: m.is_completed ?? false,
          milestones: milestonesByMission.get(m.id) || [],
        })),
      };
    },
    enabled: !!user?.id && !!skillId,
  });
}
