/**
 * useAION — Canonical hook that composes the AION identity.
 *
 * AION depends ONLY on DNA (single source of truth).
 * DNA is computed by useDNA from all scattered signals.
 *
 * This hook adds:
 *   - AION name (user-defined, from profiles)
 *   - AION activation status
 *   - Wallet/mint status
 *   - Visual profile reference (Orb reads from DNA-derived values)
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSoulWallet } from '@/hooks/useSoulWallet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDNA } from './useDNA';
import type { AIONIdentity } from './types';
import { DEFAULT_AION_IDENTITY } from './types';
import { useXpProgress } from '@/hooks/useGameState';

export function useAION() {
  const { user } = useAuth();
  const { dna, isLoading: dnaLoading } = useDNA();
  const { level } = useXpProgress();
  const { isMinted, walletAddress, isLoading: walletLoading } = useSoulWallet();

  // Fetch AION-specific fields from profiles
  const { data: aionData, isLoading: aionLoading } = useQuery({
    queryKey: ['aion-identity', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('aion_name, aion_activated')
        .eq('id', user.id)
        .single();
      return data as { aion_name: string | null; aion_activated: boolean | null } | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
  });

  const aion = useMemo<AIONIdentity>(() => {
    if (!user) return DEFAULT_AION_IDENTITY;

    return {
      userId: user.id,
      name: aionData?.aion_name || 'AION',
      level,
      // AION's egoState comes from DNA — single source of truth
      egoState: dna.dominantArchetype || 'guardian',
      // DNA is the canonical identity layer
      dna,
      visualProfileId: user.id,
      isMinted,
      walletAddress,
    };
  }, [user, aionData?.aion_name, level, dna, isMinted, walletAddress]);

  return {
    /** The composed AION identity — depends only on DNA */
    aion,
    /** Whether AION has been activated by the user */
    isActivated: aionData?.aion_activated ?? false,
    /** Whether identity data is still loading */
    isLoading: dnaLoading || walletLoading || aionLoading,
  };
}
