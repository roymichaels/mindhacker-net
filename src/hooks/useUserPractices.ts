/**
 * useUserPractices — CRUD hook for user_practices + practices library.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PracticeLibraryItem {
  id: string;
  name: string;
  name_he: string | null;
  category: string;
  pillar: string;
  difficulty_level: number;
  default_duration: number;
  energy_type: string;
  instructions: string | null;
  instructions_he: string | null;
}

export interface UserPractice {
  id: string;
  user_id: string;
  practice_id: string;
  skill_level: number;
  preferred_duration: number;
  frequency_per_week: number;
  is_core_practice: boolean;
  energy_phase: string;
  is_active: boolean;
  created_at: string;
  practice: PracticeLibraryItem;
}

const KEYS = {
  userPractices: (uid: string) => ['user-practices', uid] as const,
  practiceLibrary: ['practice-library'] as const,
};

/** All active user practices with joined library data */
export function useUserPractices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEYS.userPractices(user?.id || ''),
    queryFn: async (): Promise<UserPractice[]> => {
      const { data, error } = await supabase
        .from('user_practices')
        .select('*, practices(id, name, name_he, category, pillar, difficulty_level, default_duration, energy_type, instructions, instructions_he)')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at');
      if (error) throw error;
      return (data || []).map((row: any) => ({
        ...row,
        practice: row.practices,
      }));
    },
    enabled: !!user?.id,
  });
}

/** Full practice library (for add wizard) */
export function usePracticeLibrary() {
  return useQuery({
    queryKey: KEYS.practiceLibrary,
    queryFn: async (): Promise<PracticeLibraryItem[]> => {
      const { data, error } = await supabase
        .from('practices')
        .select('id, name, name_he, category, pillar, difficulty_level, default_duration, energy_type, instructions, instructions_he')
        .order('category, name');
      if (error) throw error;
      return (data || []) as PracticeLibraryItem[];
    },
  });
}

/** Add a practice to user's active set */
export function useAddPractice() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      practice_id: string;
      is_core_practice?: boolean;
      energy_phase?: string;
      preferred_duration?: number;
      frequency_per_week?: number;
    }) => {
      const { error } = await supabase.from('user_practices').upsert(
        {
          user_id: user!.id,
          practice_id: params.practice_id,
          is_active: true,
          is_core_practice: params.is_core_practice ?? false,
          energy_phase: params.energy_phase ?? 'day',
          preferred_duration: params.preferred_duration ?? 15,
          frequency_per_week: params.frequency_per_week ?? 3,
          skill_level: 1,
        },
        { onConflict: 'user_id,practice_id' },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-practices'] });
    },
  });
}

/** Remove (deactivate) a practice */
export function useRemovePractice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userPracticeId: string) => {
      const { error } = await supabase
        .from('user_practices')
        .update({ is_active: false })
        .eq('id', userPracticeId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-practices'] });
    },
  });
}

/** Update practice settings */
export function useUpdatePractice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      preferred_duration?: number;
      frequency_per_week?: number;
      energy_phase?: string;
      is_core_practice?: boolean;
    }) => {
      const { id, ...updates } = params;
      const { error } = await supabase
        .from('user_practices')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-practices'] });
    },
  });
}

// Category metadata
export const PRACTICE_CATEGORIES: Record<string, { he: string; en: string; emoji: string }> = {
  movement: { he: 'תנועה', en: 'Movement', emoji: '🧘' },
  training: { he: 'אימון', en: 'Training', emoji: '💪' },
  mindfulness: { he: 'מיינדפולנס', en: 'Mindfulness', emoji: '🧠' },
  health: { he: 'בריאות', en: 'Health', emoji: '☀️' },
  productivity: { he: 'פרודוקטיביות', en: 'Productivity', emoji: '🎯' },
  recovery: { he: 'התאוששות', en: 'Recovery', emoji: '❄️' },
  review: { he: 'סקירה', en: 'Review', emoji: '📊' },
  social: { he: 'חברתי', en: 'Social', emoji: '🤝' },
  learning: { he: 'למידה', en: 'Learning', emoji: '📚' },
  creation: { he: 'יצירה', en: 'Creation', emoji: '🎨' },
};

export const ENERGY_PHASE_META: Record<string, { he: string; en: string; emoji: string }> = {
  morning: { he: 'בוקר', en: 'Morning', emoji: '🌅' },
  day: { he: 'יום', en: 'Day', emoji: '☀️' },
  evening: { he: 'ערב', en: 'Evening', emoji: '🌙' },
};
