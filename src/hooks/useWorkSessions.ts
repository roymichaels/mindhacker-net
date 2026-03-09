import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTodaySessions,
  getRecentSessions,
  getTodayWorkScore,
  getWeekScores,
  startWorkSession,
  stopWorkSession,
  createManualWorkBlock,
  deleteWorkSession,
} from '@/services/workSessions';

const KEYS = {
  todaySessions: (uid: string) => ['work-sessions', 'today', uid] as const,
  recent: (uid: string) => ['work-sessions', 'recent', uid] as const,
  todayScore: (uid: string) => ['work-scores', 'today', uid] as const,
  weekScores: (uid: string) => ['work-scores', 'week', uid] as const,
};

export function useTodayWorkSessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.todaySessions(user?.id || ''),
    queryFn: () => getTodaySessions(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30_000, // refresh every 30s for active timer
  });
}

export function useRecentWorkSessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.recent(user?.id || ''),
    queryFn: () => getRecentSessions(user!.id),
    enabled: !!user?.id,
  });
}

export function useTodayWorkScore() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.todayScore(user?.id || ''),
    queryFn: () => getTodayWorkScore(user!.id),
    enabled: !!user?.id,
  });
}

export function useWeekWorkScores() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.weekScores(user?.id || ''),
    queryFn: () => getWeekScores(user!.id),
    enabled: !!user?.id,
  });
}

export function useStartWorkSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: { title: string; action_item_id?: string; is_deep_work?: boolean; tags?: string[] }) =>
      startWorkSession({ ...input, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] });
    },
  });
}

export function useStopWorkSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stopWorkSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['work-scores'] });
    },
  });
}

export function useCreateManualWorkBlock() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: {
      title: string;
      started_at: string;
      ended_at: string;
      duration_seconds: number;
      is_deep_work?: boolean;
      energy_level?: 'low' | 'medium' | 'high';
      notes?: string;
    }) => createManualWorkBlock({ ...input, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['work-scores'] });
    },
  });
}

export function useDeleteWorkSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] });
    },
  });
}
