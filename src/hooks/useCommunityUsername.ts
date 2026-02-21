import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useCommunityUsername() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: username, isLoading } = useQuery({
    queryKey: ['community-username', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('community_username')
        .eq('id', user.id)
        .single();
      return (data as any)?.community_username as string | null;
    },
    enabled: !!user?.id,
  });

  const setUsername = useMutation({
    mutationFn: async (newUsername: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const trimmed = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (trimmed.length < 3 || trimmed.length > 20) throw new Error('Username must be 3-20 chars');
      
      const { error } = await supabase
        .from('profiles')
        .update({ community_username: trimmed } as any)
        .eq('id', user.id);
      
      if (error) {
        if (error.code === '23505') throw new Error('Username already taken');
        throw error;
      }
      return trimmed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-username'] });
    },
  });

  return { username, isLoading, setUsername };
}
