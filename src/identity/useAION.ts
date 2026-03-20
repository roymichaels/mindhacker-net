/**
 * useAION — Canonical hook that composes the AION identity from existing systems.
 *
 * This is the PRIMARY identity hook. New code should use this instead of
 * directly accessing useSoulWallet, useOrbProfile, etc.
 *
 * It bridges:
 * - useOrbProfile (visual rendering data)
 * - useXpProgress (level/xp)
 * - useSoulWallet (mint/wallet status) — now properly integrated
 *
 * It does NOT replace those hooks — it wraps them into the AION abstraction.
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress } from '@/hooks/useGameState';
import { useSoulWallet } from '@/hooks/useSoulWallet';
import type { AIONIdentity, DNAProfile } from './types';
import { DEFAULT_AION_IDENTITY, DEFAULT_DNA_PROFILE } from './types';

export function useAION() {
  const { user } = useAuth();
  const orbProfile = useOrbProfile();
  const { level } = useXpProgress();
  const { isMinted, walletAddress, isLoading: walletLoading } = useSoulWallet();

  const aion = useMemo<AIONIdentity>(() => {
    if (!user) return DEFAULT_AION_IDENTITY;

    // Build a preliminary DNA from orb profile computed data
    const dna: DNAProfile | null = orbProfile.seed
      ? {
          ...DEFAULT_DNA_PROFILE,
          dnaSeed: String(orbProfile.seed ?? ''),
          dominantArchetype: orbProfile.profile.computedFrom?.egoState || 'guardian',
        }
      : null;

    return {
      userId: user.id,
      name: 'AION',
      level,
      egoState: orbProfile.profile.computedFrom?.egoState || 'guardian',
      dna,
      visualProfileId: user.id,
      isMinted,
      walletAddress,
    };
  }, [user, orbProfile.profile, orbProfile.seed, level, isMinted, walletAddress]);

  return {
    /** The composed AION identity */
    aion,
    /** Whether identity data is still loading */
    isLoading: orbProfile.isLoading || walletLoading,
    /** The orb profile for visual rendering — pass to Orb/PersonalizedOrb */
    visualProfile: orbProfile.profile,
  };
}
