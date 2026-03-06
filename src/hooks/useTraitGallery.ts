/**
 * useTraitGallery — Fetches trait-based skills for the gallery view.
 * CRITICAL: Card titles come ONLY from skills.name / skills.name_he.
 * Never from plan_missions.title or any mission fallback.
 * Legacy names are sanitized client-side via traitNameSanitizer.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getTraitDisplayName } from '@/utils/traitNameSanitizer';

export interface TraitCard {
  id: string;
  name: string;
  name_he: string | null;
  description: string | null;
  icon: string;
  pillar: string;
  level: number;
  xp_total: number;
  xp_in_level: number;
  xp_progress: number; // 0-100
  trait_type: 'trait' | 'legacy';
  mission_id: string | null;
}

const XP_PER_LEVEL = 100;

// Pillar glow colors (HSL values for CSS)
export const PILLAR_COLORS: Record<string, string> = {
  consciousness: '280 80% 60%',
  presence: '330 80% 60%',
  power: '0 80% 55%',
  vitality: '140 70% 45%',
  focus: '200 85% 55%',
  combat: '15 90% 55%',
  expansion: '260 70% 60%',
  wealth: '45 95% 50%',
  influence: '270 70% 60%',
  relationships: '340 80% 60%',
  business: '160 60% 45%',
  projects: '30 70% 50%',
  play: '50 90% 55%',
  order: '190 80% 50%',
};

export function useTraitGallery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trait-gallery', user?.id],
    queryFn: async (): Promise<TraitCard[]> => {
      if (!user?.id) return [];

      // Get all user skills with progress
      const { data: skills, error: skillsErr } = await supabase
        .from('skills')
        .select('id, name, name_he, description, icon, category, pillar, mission_id, trait_type')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (skillsErr || !skills) return [];

      const skillIds = skills.map(s => s.id);
      const { data: progress } = await supabase
        .from('user_skill_progress')
        .select('skill_id, xp_total, level')
        .eq('user_id', user.id)
        .in('skill_id', skillIds);

      const progressMap = new Map(
        (progress || []).map(p => [p.skill_id, p])
      );

      return skills.map(s => {
        const prog = progressMap.get(s.id);
        const xpTotal = prog?.xp_total || 0;
        const level = prog?.level || 1;
        const xpInLevel = xpTotal % XP_PER_LEVEL;
        const xpProgress = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
        
        // Determine pillar from skill's pillar field, or from category
        const pillar = s.pillar || categoryToPillar(s.category) || 'mind';

        return {
          id: s.id,
          name: s.name,
          name_he: s.name_he,
          description: s.description,
          icon: s.icon || '⭐',
          pillar,
          level,
          xp_total: xpTotal,
          xp_in_level: xpInLevel,
          xp_progress: xpProgress,
          trait_type: (s.trait_type as 'trait' | 'legacy') || 'legacy',
          mission_id: s.mission_id,
        };
      }).sort((a, b) => {
        // Traits first, then by XP
        if (a.trait_type === 'trait' && b.trait_type !== 'trait') return -1;
        if (a.trait_type !== 'trait' && b.trait_type === 'trait') return 1;
        return b.xp_total - a.xp_total;
      });
    },
    enabled: !!user?.id,
  });
}

function categoryToPillar(category: string): string {
  const map: Record<string, string> = {
    spirit: 'consciousness',
    social: 'presence',
    body: 'power',
    mind: 'focus',
    wealth: 'wealth',
  };
  return map[category] || category;
}
