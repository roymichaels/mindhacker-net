import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  ActionItem,
  getHabits,
  getMilestones,
  getTaskChecklists,
  getByParent,
  getOverdueCount,
  getSessionCountToday,
  toggleActionStatus,
  completeAction,
  uncompleteAction,
  createAction,
  deleteAction,
  CreateActionItemInput,
} from '@/services/actionItems';

const KEYS = {
  habits: (uid: string) => ['action-items', 'habits', uid] as const,
  milestones: (uid: string, planId?: string) => ['action-items', 'milestones', uid, planId] as const,
  checklists: (uid: string) => ['action-items', 'checklists', uid] as const,
  children: (parentId: string) => ['action-items', 'children', parentId] as const,
  overdueCount: (uid: string) => ['action-items', 'overdue', uid] as const,
  sessionsToday: (uid: string) => ['action-items', 'sessions-today', uid] as const,
};

export function useHabits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.habits(user?.id || ''),
    queryFn: () => getHabits(user!.id),
    enabled: !!user?.id,
  });
}

export function useMilestones(planId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.milestones(user?.id || '', planId),
    queryFn: () => getMilestones(user!.id, planId),
    enabled: !!user?.id,
  });
}

export function useTaskChecklists() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.checklists(user?.id || ''),
    queryFn: () => getTaskChecklists(user!.id),
    enabled: !!user?.id,
  });
}

export function useChecklistChildren(parentId: string | null) {
  return useQuery({
    queryKey: KEYS.children(parentId || ''),
    queryFn: () => getByParent(parentId!),
    enabled: !!parentId,
  });
}

export function useOverdueCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.overdueCount(user?.id || ''),
    queryFn: () => getOverdueCount(user!.id),
    enabled: !!user?.id,
  });
}

export function useSessionsToday() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.sessionsToday(user?.id || ''),
    queryFn: () => getSessionCountToday(user!.id),
    enabled: !!user?.id,
  });
}

export function useToggleAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => toggleActionStatus(id, done),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items'] });
    },
  });
}

export function useCreateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActionItemInput) => createAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items'] });
    },
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items'] });
    },
  });
}
