import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toggleActionStatus } from '@/services/actionItems';

export interface NowQueueItem {
  pillarId: string;
  hub: 'core' | 'arena';
  actionType: string;
  title: string;
  titleEn: string;
  durationMin: number;
  urgencyScore: number;
  reason: string;
  sourceType: 'plan' | 'assessment' | 'template' | 'habit';
  sourceId?: string;
}

export interface NowEngineData {
  today_queue: NowQueueItem[];
  generated_at: string;
  tier: string;
  max_actions: number;
  energy_level: number | null;
  day_intensity?: string;
  has_core_strategy?: boolean;
  has_arena_strategy?: boolean;
  core_week?: number | null;
  arena_week?: number | null;
}

export function useNowEngine() {
  const { user } = useAuth();
  const { language } = useTranslation();

  const query = useQuery<NowEngineData>({
    queryKey: ['now-engine', user?.id, language],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-today-queue', {
        body: { user_id: user!.id, language },
      });
      if (error) throw error;
      return data as NowEngineData;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 min cache
    refetchOnWindowFocus: false,
  });

  return {
    queue: query.data?.today_queue || [],
    nextAction: query.data?.today_queue?.[0] || null,
    tier: query.data?.tier || 'clarity',
    maxActions: query.data?.max_actions || 3,
    energyLevel: query.data?.energy_level,
    dayIntensity: query.data?.day_intensity || 'medium',
    hasCoreStrategy: query.data?.has_core_strategy || false,
    hasArenaStrategy: query.data?.has_arena_strategy || false,
    coreWeek: query.data?.core_week || null,
    arenaWeek: query.data?.arena_week || null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useCompleteNowAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ actionId, done }: { actionId: string; done: boolean }) => {
      return toggleActionStatus(actionId, done);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['now-engine'] });
      queryClient.invalidateQueries({ queryKey: ['action-items'] });
    },
  });
}
