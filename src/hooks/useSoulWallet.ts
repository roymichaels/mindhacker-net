/**
 * useSoulWallet — Hook for Soul Avatar wallet status, minting, and wizard trigger.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SoulWallet {
  id: string;
  user_id: string;
  wallet_address: string | null;
  wallet_provider: string;
  is_minted: boolean;
  minted_at: string | null;
  nft_metadata: Record<string, unknown>;
  created_at: string;
}

export function useSoulWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['soul-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('soul_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data as SoulWallet | null;
    },
    enabled: !!user?.id,
  });

  const createWallet = useMutation({
    mutationFn: async ({ walletAddress, provider }: { walletAddress: string; provider?: string }) => {
      const { data, error } = await supabase.functions.invoke('web3-wallet', {
        body: { action: 'create', wallet_address: walletAddress, provider },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soul-wallet'] }),
  });

  const mintAvatar = useMutation({
    mutationFn: async (nftMetadata?: Record<string, unknown>) => {
      const { data, error } = await supabase.functions.invoke('web3-wallet', {
        body: { action: 'mint', nft_metadata: nftMetadata },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soul-wallet'] }),
  });

  return {
    wallet,
    isLoading,
    hasWallet: !!wallet,
    isMinted: wallet?.is_minted ?? false,
    walletAddress: wallet?.wallet_address ?? null,
    createWallet,
    mintAvatar,
  };
}
