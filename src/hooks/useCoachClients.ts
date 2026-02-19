import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyCoachProfile } from '@/domain/coaches';
import { toast } from 'sonner';

export interface PractitionerClient {
  id: string;
  practitioner_id: string;
  client_user_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined profile data
  profile?: {
    id: string;
    full_name: string | null;
  };
}

export const useCoachClients = () => {
  const { data: myProfile } = useMyCoachProfile();

  return useQuery({
    queryKey: ['coach-clients', myProfile?.id],
    queryFn: async (): Promise<PractitionerClient[]> => {
      if (!myProfile?.id) return [];

      const { data, error } = await supabase
        .from('practitioner_clients')
        .select('*')
        .eq('practitioner_id', myProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const clientUserIds = data?.map(c => c.client_user_id) || [];
      
      if (clientUserIds.length === 0) return data || [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', clientUserIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (data || []).map((client) => ({
        ...client,
        profile: profileMap.get(client.client_user_id),
      }));
    },
    enabled: !!myProfile?.id,
  });
};

export const useCoachClientStats = () => {
  const { data: clients, isLoading } = useCoachClients();

  const stats = {
    total: clients?.length || 0,
    active: clients?.filter((c) => c.status === 'active').length || 0,
    inactive: clients?.filter((c) => c.status === 'inactive').length || 0,
    completed: clients?.filter((c) => c.status === 'completed').length || 0,
  };

  return { stats, isLoading };
};

export const useAddCoachClient = () => {
  const queryClient = useQueryClient();
  const { data: myProfile } = useMyCoachProfile();

  return useMutation({
    mutationFn: async ({
      clientUserId,
      notes,
    }: {
      clientUserId: string;
      notes?: string;
    }) => {
      if (!myProfile?.id) throw new Error('Not a practitioner');

      const { data, error } = await supabase
        .from('practitioner_clients')
        .insert({
          practitioner_id: myProfile.id,
          client_user_id: clientUserId,
          notes,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-clients'] });
      toast.success('Client added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add client: ${error.message}`);
    },
  });
};

export const useUpdateCoachClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      updates,
    }: {
      clientId: string;
      updates: Partial<Pick<PractitionerClient, 'status' | 'notes'>>;
    }) => {
      const { data, error } = await supabase
        .from('practitioner_clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-clients'] });
      toast.success('Client updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update client: ${error.message}`);
    },
  });
};

export const useRemoveCoachClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('practitioner_clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-clients'] });
      toast.success('Client removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove client: ${error.message}`);
    },
  });
};
