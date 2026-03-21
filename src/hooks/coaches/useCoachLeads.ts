import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyCoachProfile } from '@/domain/coaches';
import { toast } from 'sonner';

export interface CoachLead {
  id: string;
  coach_id: string;
  landing_page_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  status: string;
  notes: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export const useCoachLeads = () => {
  const { data: myProfile } = useMyCoachProfile();

  return useQuery({
    queryKey: ['coach-leads', myProfile?.id],
    queryFn: async (): Promise<CoachLead[]> => {
      if (!myProfile?.id) return [];
      const { data, error } = await supabase
        .from('coach_leads')
        .select('*')
        .eq('coach_id', myProfile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CoachLead[];
    },
    enabled: !!myProfile?.id,
  });
};

export const useCoachLeadStats = () => {
  const { data: leads, isLoading } = useCoachLeads();
  const stats = {
    total: leads?.length || 0,
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0,
    lost: leads?.filter(l => l.status === 'lost').length || 0,
  };
  return { stats, isLoading };
};

export const useAddCoachLead = () => {
  const queryClient = useQueryClient();
  const { data: myProfile } = useMyCoachProfile();

  return useMutation({
    mutationFn: async (lead: { name: string; email: string; phone?: string; source?: string; notes?: string }) => {
      if (!myProfile?.id) throw new Error('Not a coach');
      const { data, error } = await supabase
        .from('coach_leads')
        .insert({ ...lead, coach_id: myProfile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-leads'] });
      toast.success('Lead added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateCoachLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Pick<CoachLead, 'status' | 'notes' | 'tags'>> }) => {
      const { error } = await supabase
        .from('coach_leads')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-leads'] });
      toast.success('Lead updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteCoachLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coach_leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-leads'] });
      toast.success('Lead deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
