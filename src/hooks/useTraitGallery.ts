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
  /** Sanitized display name — always a short trait badge, never mission text */
  displayName: string;
  description: string | null;
  icon: string;
  pillar: string;
  level: number;
  xp_total: number;
  xp_in_level: number;
  xp_progress: number; // 0-100
  trait_type: 'trait' | 'legacy';
}

const XP_PER_LEVEL = 100;

// Pillar glow colors (HSL values for CSS)
export const PILLAR_COLORS: Record<string, string> = {
  consciousness: '263 70% 58%',  // violet — mystical awareness
  presence: '292 84% 61%',       // fuchsia — style & aesthetics
  power: '0 72% 51%',            // red — raw strength
  vitality: '38 92% 50%',        // amber — sun energy
  focus: '188 85% 53%',          // cyan — laser clarity
  combat: '215 14% 54%',         // slate — steel discipline
  expansion: '239 84% 67%',      // indigo — deep mind
  wealth: '160 84% 39%',         // emerald — money
  influence: '271 81% 56%',      // purple — royalty
  relationships: '199 89% 48%',  // sky — open connection
  business: '25 95% 53%',        // orange — entrepreneurship
  projects: '217 91% 60%',       // blue — structure
  play: '84 81% 44%',            // lime — fun energy
  order: '173 80% 40%',          // teal — clean precision
  romantics: '347 77% 50%',      // rose — love & passion
};

export function useTraitGallery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trait-gallery', user?.id],
    queryFn: async (): Promise<TraitCard[]> => {
      if (!user?.id) return [];

      // Get all user skills — ONLY from skills table, never missions
      const { data: skills, error: skillsErr } = await supabase
        .from('skills')
        .select('id, name, name_he, description, icon, category, pillar, trait_type')
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
          // CRITICAL: display name is sanitized — never shows mission text
          displayName: getTraitDisplayName(s.name, s.name_he, true),
          description: s.description,
          icon: s.icon || '⭐',
          pillar,
          level,
          xp_total: xpTotal,
          xp_in_level: xpInLevel,
          xp_progress: xpProgress,
          trait_type: (s.trait_type as 'trait' | 'legacy') || 'legacy',
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
