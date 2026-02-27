import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTodayQuests,
  getActiveBuild,
  getRecentLoot,
  getUserInventory,
  getLootCatalog,
  generateDailyQuests,
  generateWeeklyBuild,
  completeQuest,
  MapleQuest,
  UserBuild,
} from '@/services/mapleStory';

const KEYS = {
  quests: (uid: string, date: string) => ['maple', 'quests', uid, date] as const,
  build: (uid: string) => ['maple', 'build', uid] as const,
  loot: (uid: string) => ['maple', 'loot', uid] as const,
  inventory: (uid: string) => ['maple', 'inventory', uid] as const,
  catalog: ['maple', 'catalog'] as const,
};

export function useTodayQuests() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: KEYS.quests(user?.id || '', today),
    queryFn: () => getTodayQuests(user!.id, today),
    enabled: !!user?.id,
  });
}

export function useActiveBuild() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.build(user?.id || ''),
    queryFn: () => getActiveBuild(user!.id),
    enabled: !!user?.id,
  });
}

export function useRecentLoot() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.loot(user?.id || ''),
    queryFn: () => getRecentLoot(user!.id),
    enabled: !!user?.id,
  });
}

export function useUserInventory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.inventory(user?.id || ''),
    queryFn: () => getUserInventory(user!.id),
    enabled: !!user?.id,
  });
}

export function useLootCatalog() {
  return useQuery({
    queryKey: KEYS.catalog,
    queryFn: getLootCatalog,
  });
}

export function useGenerateQuests() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (language?: string) => generateDailyQuests(user!.id, language || 'he'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maple'] });
      qc.invalidateQueries({ queryKey: ['action-items'] });
    },
  });
}

export function useGenerateBuild() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (language?: string) => generateWeeklyBuild(user!.id, language || 'he'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maple'] });
    },
  });
}

export function useCompleteQuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questId: string) => completeQuest(questId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maple'] });
      qc.invalidateQueries({ queryKey: ['action-items'] });
    },
  });
}
