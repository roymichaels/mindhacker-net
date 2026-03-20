/**
 * useAION — Hook that composes the AION identity from existing systems.
 *
 * This is a BRIDGE layer that pulls from:
 * - useOrbProfile (visual rendering data)
 * - useXpProgress (level/xp)
 * - useSoulWallet (mint/wallet status)
 * - useProfile (user data)
 *
 * It does NOT replace those hooks — it wraps them into the AION abstraction.
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress } from '@/hooks/useGameState';
import type { AIONIdentity, DNAProfile } from './types';
import { DEFAULT_AION_IDENTITY, DEFAULT_DNA_PROFILE } from './types';

export function useAION(): {
  aion: AIONIdentity;
  isLoading: boolean;
  /** The orb profile for visual rendering — pass to Orb/PersonalizedOrb */
  visualProfile: ReturnType<typeof useOrbProfile>['profile'];
} {
  const { user } = useAuth();
  const orbProfile = useOrbProfile();
  const { level } = useXpProgress();

  const aion = useMemo<AIONIdentity>(() => {
    if (!user) return DEFAULT_AION_IDENTITY;

    // Build a preliminary DNA from orb profile computed data
    const dna: DNAProfile | null = orbProfile.seed
      ? {
          ...DEFAULT_DNA_PROFILE,
          dnaSeed: orbProfile.seed,
          dominantArchetype: orbProfile.profile.computedFrom?.egoState || 'guardian',
        }
      : null;

    return {
      userId: user.id,
      name: 'AION',
      level,
      egoState: orbProfile.profile.computedFrom?.egoState || 'guardian',
      dna,
      visualProfileId: user.id, // links to orb_profiles table
      isMinted: false, // will be connected to useSoulWallet
      walletAddress: null,
    };
  }, [user, orbProfile.profile, orbProfile.seed, level]);

  return {
    aion,
    isLoading: orbProfile.isLoading,
    visualProfile: orbProfile.profile,
  };
}
