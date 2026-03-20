/**
 * useDNA — Single hook that computes and caches the user's DNA profile.
 *
 * This is the CANONICAL source for identity data.
 * It reads from existing systems (no new DB tables) and consolidates into DNAProfile.
 *
 * Sources consumed:
 *   - useOrbProfile → egoState, archetype, traits, seed
 *   - useLaunchpadProgress → identity_profile from summary
 *   - useGameState → level, XP, streak
 *   - profiles table → active_ego_state
 *
 * Future sources (when data exists):
 *   - domain_assessments → pillar scores
 *   - user_skill_progress → skill distribution
 *   - community_members → community score
 *   - aurora_energy_patterns → energy patterns
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useGameState } from '@/hooks/useGameState';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { computeDNA, type DNAInputSignals } from './computeDNA';
import type { DNAProfile } from './types';
import { DEFAULT_DNA_PROFILE } from './types';

export function useDNA() {
  const { user } = useAuth();
  const { profile: orbProfile, seed, isLoading: orbLoading } = useOrbProfile();
  const { gameState } = useGameState();
  const { progress } = useLaunchpadProgress();

  const dna = useMemo<DNAProfile>(() => {
    if (!user) return DEFAULT_DNA_PROFILE;

    // Extract identity_profile from launchpad summary
    const summaryData = progress?.summary_data as Record<string, unknown> | null;
    const identityProfile = summaryData?.identity_profile as DNAInputSignals['identityProfile'] | undefined;

    // Extract energy level from aurora onboarding if available
    const energyLevel = (progress as Record<string, unknown>)?.energy_level as string | undefined;

    const input: DNAInputSignals = {
      orbData: {
        egoState: orbProfile.computedFrom?.egoState,
        dominantArchetype: orbProfile.computedFrom?.dominantArchetype,
        secondaryArchetype: orbProfile.computedFrom?.secondaryArchetype,
        topTraitCategories: orbProfile.computedFrom?.topTraitCategories,
        clarityScore: orbProfile.computedFrom?.clarityScore,
        seed: seed ?? undefined,
      },
      identityProfile,
      gameState: {
        level: gameState?.level,
        experience: gameState?.experience,
        streak: gameState?.sessionStreak,
      },
      energyLevel,
    };

    return computeDNA(input);
  }, [user, orbProfile.computedFrom, seed, gameState, progress]);

  return {
    /** The computed DNA profile — single source of truth */
    dna,
    /** Whether underlying data is still loading */
    isLoading: orbLoading,
  };
}
