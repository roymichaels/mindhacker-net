/**
 * Hook: useDataMarketplace
 * Manages user's data consent, contribution status, and revenue earnings.
 */
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DataConsent {
  id: string;
  category: string;
  is_opted_in: boolean;
  opted_in_at: string | null;
  opted_out_at: string | null;
}

export interface RevenueShare {
  id: string;
  category: string;
  share_mos: number;
  paid_at: string | null;
  created_at: string;
}

export function useDataConsent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const consentsQuery = useQuery({
    queryKey: ['fm-data-consent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('fm_data_consent')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as DataConsent[];
    },
    enabled: !!user?.id,
  });

  const toggleConsent = useMutation({
    mutationFn: async ({ category, optIn }: { category: string; optIn: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('fm_data_consent')
        .upsert({
          user_id: user.id,
          category,
          is_opted_in: optIn,
          opted_in_at: optIn ? new Date().toISOString() : null,
          opted_out_at: optIn ? null : new Date().toISOString(),
        }, { onConflict: 'user_id,category' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fm-data-consent', user?.id] });
    },
  });

  return {
    consents: consentsQuery.data ?? [],
    isLoading: consentsQuery.isLoading,
    toggleConsent,
  };
}

export function useDataRevenue() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fm-data-revenue', user?.id],
    queryFn: async () => {
      if (!user?.id) return { shares: [], totalEarned: 0 };
      const { data, error } = await (supabase as any)
        .from('fm_data_revenue_shares')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      const shares = (data ?? []) as RevenueShare[];
      const totalEarned = shares.reduce((sum, s) => sum + s.share_mos, 0);
      return { shares, totalEarned };
    },
    enabled: !!user?.id,
  });
}

export function useDataListings() {
  return useQuery({
    queryKey: ['fm-data-listings'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('fm_data_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60000,
  });
}
