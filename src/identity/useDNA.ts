/**
 * useDNA — Single hook that computes and caches the user's DNA profile.
 *
 * This is the CANONICAL source for identity data.
 * It reads from existing systems (no new DB tables) and consolidates into DNAProfile.
 *
 * Sources consumed:
 *   - useOrbProfile → egoState, archetype, traits, seed
 *   - launchpad_summaries → identity_profile from summary
 *   - useGameState → level, XP, streak
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useGameState } from '@/hooks/useGameState';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { computeDNA, type DNAInputSignals } from './computeDNA';
import type { DNAProfile } from './types';
import { DEFAULT_DNA_PROFILE } from './types';

export function useDNA() {
  const { user } = useAuth();
  const { profile: orbProfile, seed, isLoading: orbLoading } = useOrbProfile();
  const { gameState } = useGameState();

  // Fetch identity signals from launchpad_summaries
  const { data: summaryRow, isLoading: summaryLoading } = useQuery({
    queryKey: ['dna-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('launchpad_summaries')
        .select('summary_data, clarity_score, consciousness_score, transformation_readiness')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60_000,
  });

  const dna = useMemo<DNAProfile>(() => {
    if (!user) return DEFAULT_DNA_PROFILE;

    const summaryData = summaryRow?.summary_data as Record<string, unknown> | null;
    const identityProfile = summaryData?.identity_profile as DNAInputSignals['identityProfile'] | undefined;

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
    };

    return computeDNA(input);
  }, [user, orbProfile.computedFrom, seed, gameState, summaryRow]);

  return {
    /** The computed DNA profile — single source of truth */
    dna,
    /** Whether underlying data is still loading */
    isLoading: orbLoading || summaryLoading,
  };
}
