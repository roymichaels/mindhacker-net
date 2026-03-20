/**
 * useAION — Canonical hook that composes the AION identity from existing systems.
 *
 * This is the PRIMARY identity hook. New code should use this instead of
 * directly accessing useSoulWallet, useOrbProfile, etc.
 *
 * It bridges:
 * - useOrbProfile (visual rendering data)
 * - useXpProgress (level/xp)
 * - useSoulWallet (mint/wallet status)
 * - profiles.aion_name / aion_activated (AION identity)
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress } from '@/hooks/useGameState';
import { useSoulWallet } from '@/hooks/useSoulWallet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AIONIdentity, DNAProfile } from './types';
import { DEFAULT_AION_IDENTITY, DEFAULT_DNA_PROFILE } from './types';

export function useAION() {
  const { user } = useAuth();
  const orbProfile = useOrbProfile();
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

    const dna: DNAProfile | null = orbProfile.seed
      ? {
          ...DEFAULT_DNA_PROFILE,
          dnaSeed: String(orbProfile.seed ?? ''),
          dominantArchetype: orbProfile.profile.computedFrom?.egoState || 'guardian',
        }
      : null;

    return {
      userId: user.id,
      name: aionData?.aion_name || 'AION',
      level,
      egoState: orbProfile.profile.computedFrom?.egoState || 'guardian',
      dna,
      visualProfileId: user.id,
      isMinted,
      walletAddress,
    };
  }, [user, orbProfile.profile, orbProfile.seed, level, isMinted, walletAddress, aionData?.aion_name]);

  return {
    /** The composed AION identity */
    aion,
    /** Whether AION has been activated by the user */
    isActivated: aionData?.aion_activated ?? false,
    /** Whether identity data is still loading */
    isLoading: orbProfile.isLoading || walletLoading || aionLoading,
    /** The orb profile for visual rendering — pass to Orb/PersonalizedOrb */
    visualProfile: orbProfile.profile,
  };
}
