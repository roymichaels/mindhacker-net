/**
 * useSoulWallet — Hook for AION wallet status, minting, and wizard trigger.
 *
 * LEGACY NAME: This file keeps the SoulWallet name for backward compatibility.
 * New code should import from src/identity/:
 *   import { useAIONWallet } from '@/identity';
 *
 * The underlying table is still `soul_wallets` — DO NOT rename DB tables yet.
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

async function getAccessTokenWithRetry(): Promise<string> {
  let lastToken: string | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }

    lastToken = data.session?.access_token ?? null;
    if (lastToken) return lastToken;

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error('No authenticated session available yet. Please try again.');
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
      const accessToken = await getAccessTokenWithRetry();
      const { data, error } = await supabase.functions.invoke('web3-wallet', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: { action: 'create', wallet_address: walletAddress, provider },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soul-wallet'] }),
  });

  const mintAvatar = useMutation({
    mutationFn: async (nftMetadata?: Record<string, unknown>) => {
      const accessToken = await getAccessTokenWithRetry();
      const { data, error } = await supabase.functions.invoke('web3-wallet', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
