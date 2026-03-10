/**
 * Hook for managing career applications — fetch, create, update.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CareerPath } from '@/pages/CareerHub';

export interface CareerApplication {
  id: string;
  user_id: string;
  career_path: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  structured_answers: Record<string, unknown>;
  ai_conversation: Array<{ role: string; content: string }>;
  ai_summary: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useCareerApplication(careerPath: CareerPath) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['career-application', careerPath, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('career_applications' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('career_path', careerPath)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CareerApplication | null;
    },
    enabled: !!user?.id,
  });
}

export function useAllCareerApplications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['career-applications-all', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('career_applications' as any)
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []) as unknown as CareerApplication[];
    },
    enabled: !!user?.id,
  });
}

export function useSubmitCareerApplication() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      careerPath: CareerPath;
      structuredAnswers: Record<string, unknown>;
      aiConversation: Array<{ role: string; content: string }>;
      aiSummary: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('career_applications' as any)
        .upsert({
          user_id: user.id,
          career_path: params.careerPath,
          structured_answers: params.structuredAnswers,
          ai_conversation: params.aiConversation,
          ai_summary: params.aiSummary,
          status: 'pending',
        }, { onConflict: 'user_id,career_path' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['career-application', vars.careerPath] });
      qc.invalidateQueries({ queryKey: ['career-applications-all'] });
    },
  });
}
