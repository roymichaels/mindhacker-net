/**
 * useDNA — Single hook that computes and caches the user's DNA profile.
 *
 * This is the CANONICAL source for identity data.
 * It reads DIRECTLY from database tables (no dependency on OrbProfile).
 *
 * Sources consumed:
 *   - profiles → egoState, streak, level
 *   - launchpad_summaries → identity_profile, clarity/consciousness scores
 *   - launchpad_progress → onboarding traits/hobbies
 *   - useGameState → level, XP, streak
 *   - user_skill_progress → skill distribution
 *   - daily_habit_logs → habit completion rate
 *   - aurora_onboarding_progress → energy level
 *   - community_members → community engagement score
 *   - orb_profiles → seed (visual seed only)
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/hooks/useGameState';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { hashUserId } from '@/lib/orbSeed';
import { computeDNA, type DNAInputSignals } from './computeDNA';
import type { DNAProfile } from './types';
import { DEFAULT_DNA_PROFILE } from './types';

export function useDNA() {
  const { user } = useAuth();
  const { gameState } = useGameState();

  // ── Signal: Launchpad summary (identity profile, clarity, etc.) ──
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

  // ── Signal: Profile streak ──
  const { data: profileRow, isLoading: profileLoading } = useQuery({
    queryKey: ['dna-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('session_streak')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
  });

  // ── Signal: Launchpad onboarding traits ──
  const { data: launchpadProgress, isLoading: launchpadLoading } = useQuery({
    queryKey: ['dna-launchpad', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('launchpad_progress')
        .select('step_2_profile_data')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60_000,
  });

  // ── Signal: Skill distribution ──
  const { data: skillRows, isLoading: skillsLoading } = useQuery({
    queryKey: ['dna-skills', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_skill_progress')
        .select('skill_id, xp_total, skills(name)')
        .eq('user_id', user.id);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60_000,
  });

  // ── Signal: Habit completion rate (last 30 days) ──
  const { data: habitData, isLoading: habitsLoading } = useQuery({
    queryKey: ['dna-habits', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [totalRes, completedRes] = await Promise.all([
        supabase
          .from('daily_habit_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('track_date', thirtyDaysAgo.toISOString().split('T')[0]),
        supabase
          .from('daily_habit_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .gte('track_date', thirtyDaysAgo.toISOString().split('T')[0]),
      ]);
      
      const total = totalRes.count ?? 0;
      const completed = completedRes.count ?? 0;
      return { total, completed };
    },
    enabled: !!user?.id,
    staleTime: 10 * 60_000,
  });

  // ── Signal: Energy level ──
  const { data: energyData, isLoading: energyLoading } = useQuery({
    queryKey: ['dna-energy', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('aurora_onboarding_progress')
        .select('energy_level')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60_000,
  });

  // ── Signal: Community engagement ──
  const { data: communityData, isLoading: communityLoading } = useQuery({
    queryKey: ['dna-community', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('community_members')
        .select('total_points, posts_count, comments_count')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60_000,
  });

  // Compute seed from user ID (deterministic)
  const seed = useMemo(() => user?.id ? hashUserId(user.id) : 0, [user?.id]);

  const dna = useMemo<DNAProfile>(() => {
    if (!user) return DEFAULT_DNA_PROFILE;

    // Extract identity profile from summary
    const summaryData = summaryRow?.summary_data as Record<string, unknown> | null;
    const identityProfile = summaryData?.identity_profile as DNAInputSignals['identityProfile'] | undefined;

    // Extract traits from launchpad onboarding
    const step2 = launchpadProgress?.step_2_profile_data as Record<string, unknown> | null;
    const onboardingTraits = (step2?.traits as string[]) || (step2?.selectedTraits as string[]) || [];

    // Build ego state from multiple sources (priority: summary > game state)
    const egoState = identityProfile?.suggested_ego_state
      || gameState?.activeEgoState;

    // Build skill distribution map
    const skillDistribution: Record<string, number> = {};
    if (skillRows) {
      for (const row of skillRows) {
        const skillName = (row.skills as { name: string } | null)?.name || row.skill_id;
        skillDistribution[skillName] = row.xp_total;
      }
    }

    // Calculate habit completion rate
    const habitCompletionRate = habitData && habitData.total > 0
      ? habitData.completed / habitData.total
      : undefined;

    // Calculate community score (composite of points + activity)
    const communityScore = communityData
      ? Math.min(100, (communityData.total_points ?? 0) + (communityData.posts_count ?? 0) * 5 + (communityData.comments_count ?? 0) * 2)
      : undefined;

    // Merge traits from identity profile and onboarding
    const mergedTraits = [
      ...(identityProfile?.dominant_traits || []),
      ...onboardingTraits,
    ];
    // Deduplicate
    const uniqueTraits = [...new Set(mergedTraits)];

    const input: DNAInputSignals = {
      orbData: {
        egoState,
        dominantArchetype: undefined, // Will be derived by computeDNA from traits
        secondaryArchetype: null,
        topTraitCategories: uniqueTraits,
        clarityScore: summaryRow?.clarity_score ?? undefined,
        seed: seed || undefined,
      },
      identityProfile: identityProfile ? {
        ...identityProfile,
        dominant_traits: uniqueTraits.length > 0 ? uniqueTraits : identityProfile.dominant_traits,
      } : uniqueTraits.length > 0 ? {
        dominant_traits: uniqueTraits,
      } : undefined,
      gameState: {
        level: gameState?.level,
        experience: gameState?.experience,
        streak: gameState?.sessionStreak ?? (profileRow?.session_streak as number | undefined),
      },
      // New complete signals:
      skillDistribution: Object.keys(skillDistribution).length > 0 ? skillDistribution : undefined,
      habitCompletionRate,
      energyLevel: energyData?.energy_level ?? undefined,
      communityScore: communityScore && communityScore > 0 ? communityScore : undefined,
    };

    return computeDNA(input);
  }, [user, summaryRow, profileRow, launchpadProgress, gameState, skillRows, habitData, energyData, communityData, seed]);

  return {
    /** The computed DNA profile — single source of truth */
    dna,
    /** Deterministic seed from user ID */
    seed,
    /** Whether underlying data is still loading */
    isLoading: summaryLoading || profileLoading || launchpadLoading || skillsLoading || habitsLoading || energyLoading || communityLoading,
  };
}
