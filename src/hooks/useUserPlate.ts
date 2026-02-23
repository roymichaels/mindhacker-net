/**
 * useUserPlate — Aggregates all user's real-life items across data sources.
 * Returns items mapped to pillars for display in Core/Arena grids.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PlateItemType = 'project' | 'business' | 'goal' | 'habit' | 'milestone' | 'task';

export interface PlateItem {
  id: string;
  title: string;
  type: PlateItemType;
  status: string;
  pillar: string | null;
  pillars: string[]; // can be mapped to multiple
  description: string | null;
  source: string; // table origin
  progress?: number;
  createdAt: string;
}

export function useUserPlate() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-plate', user?.id],
    queryFn: async (): Promise<PlateItem[]> => {
      if (!user) return [];

      const [projectsRes, businessRes, actionItemsRes] = await Promise.all([
        supabase
          .from('user_projects')
          .select('id, title, description, status, linked_life_areas, progress_percentage, project_type, category, created_at')
          .eq('user_id', user.id)
          .neq('status', 'archived'),
        supabase
          .from('business_journeys')
          .select('id, business_name, current_step, journey_complete, created_at')
          .eq('user_id', user.id),
        supabase
          .from('action_items')
          .select('id, title, description, type, status, pillar, source, created_at')
          .eq('user_id', user.id)
          .in('type', ['goal', 'milestone'])
          .neq('status', 'done')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      const items: PlateItem[] = [];

      // Projects
      for (const p of projectsRes.data || []) {
        const linkedAreas = (p.linked_life_areas as string[]) || [];
        items.push({
          id: p.id,
          title: p.title,
          type: 'project',
          status: p.status || 'active',
          pillar: linkedAreas[0] || 'projects',
          pillars: linkedAreas.length ? linkedAreas : ['projects'],
          description: p.description,
          source: 'user_projects',
          progress: p.progress_percentage || 0,
          createdAt: p.created_at,
        });
      }

      // Businesses
      for (const b of businessRes.data || []) {
        items.push({
          id: b.id,
          title: b.business_name || 'Unnamed Business',
          type: 'business',
          status: b.journey_complete ? 'complete' : 'active',
          pillar: 'business',
          pillars: ['business', 'wealth'],
          description: null,
          source: 'business_journeys',
          progress: Math.round((b.current_step / 10) * 100),
          createdAt: b.created_at,
        });
      }

      // Goals & Milestones from action_items
      for (const a of actionItemsRes.data || []) {
        items.push({
          id: a.id,
          title: a.title,
          type: (a.type as PlateItemType) || 'goal',
          status: a.status || 'todo',
          pillar: a.pillar || null,
          pillars: a.pillar ? [a.pillar] : [],
          description: a.description,
          source: 'action_items',
          createdAt: a.created_at,
        });
      }

      return items;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/** Filter plate items by hub */
export function filterByHub(items: PlateItem[], hub: 'core' | 'arena'): PlateItem[] {
  const corePillars = ['consciousness', 'presence', 'power', 'vitality', 'focus', 'combat', 'expansion'];
  const arenaPillars = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play'];

  const pillars = hub === 'core' ? corePillars : arenaPillars;

  return items.filter(item => {
    if (item.pillars.length === 0) return false;
    return item.pillars.some(p => pillars.includes(p));
  });
}
