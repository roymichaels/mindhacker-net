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
    if (lastToken) {
      const validation = await supabase.auth.getUser(lastToken);
      if (!validation.error && validation.data.user) {
        return lastToken;
      }

      const refreshed = await supabase.auth.refreshSession();
      const refreshedToken = refreshed.data.session?.access_token ?? null;
      if (refreshedToken) {
        const refreshedValidation = await supabase.auth.getUser(refreshedToken);
        if (!refreshedValidation.error && refreshedValidation.data.user) {
          return refreshedToken;
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error('No authenticated session available yet. Please try again.');
}

async function invokeWalletFunction(accessToken: string, body: Record<string, unknown>) {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/web3-wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey:
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      typeof payload?.error === 'string'
        ? payload.error
        : `Wallet function failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload;
}

export function useSoulWallet() {
  const { user, session } = useAuth();
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
      if (!user?.id) {
        throw new Error('You must be signed in before creating a wallet.');
      }

      const accessToken = await getAccessTokenWithRetry();
      return invokeWalletFunction(accessToken, {
        action: 'create',
        wallet_address: walletAddress,
        provider,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soul-wallet'] }),
  });

  const mintAvatar = useMutation({
    mutationFn: async (nftMetadata?: Record<string, unknown>) => {
      if (!user?.id) {
        throw new Error('You must be signed in before minting AION.');
      }

      const accessToken = await getAccessTokenWithRetry();
      return invokeWalletFunction(accessToken, {
        action: 'mint',
        nft_metadata: nftMetadata,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soul-wallet'] }),
  });

  return {
    wallet,
    isLoading,
    hasWallet: !!wallet,
    isMinted: wallet?.is_minted ?? false,
    walletAddress: wallet?.wallet_address ?? null,
    hasSession: !!session?.access_token,
    createWallet,
    mintAvatar,
  };
}
