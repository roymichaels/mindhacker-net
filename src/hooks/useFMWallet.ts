import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFMWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ['fm-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // Try to fetch existing wallet
      const { data, error } = await supabase
        .from('fm_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data;
      // Auto-create wallet if it doesn't exist
      const { data: created, error: createErr } = await supabase
        .from('fm_wallets')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' })
        .select()
        .single();
      if (createErr) throw createErr;
      return created;
    },
    enabled: !!user?.id,
  });

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      // Ensure wallet exists first (upsert)
      const { error: upsertError } = await supabase
        .from('fm_wallets')
        .upsert({ user_id: user.id, onboarding_complete: true }, { onConflict: 'user_id' });
      if (upsertError) throw upsertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fm-wallet', user?.id] });
    },
  });

  return {
    wallet: walletQuery.data,
    isLoading: walletQuery.isLoading,
    completeOnboarding,
  };
}

export function useFMTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fm-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('fm_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });
}

export function useFMBounties() {
  return useQuery({
    queryKey: ['fm-bounties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fm_bounties')
        .select('*')
        .eq('status', 'active')
        .order('reward_mos', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFMClaims() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fm-claims', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('fm_bounty_claims')
        .select('*, fm_bounties(title, reward_mos, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });
}
