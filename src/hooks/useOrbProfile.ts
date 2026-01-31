/**
 * Hook to generate and manage personalized orb profile
 * Combines data from game state, dashboard, life model, and launchpad profile
 */

import { useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/hooks/useGameState';
import { useDashboard } from '@/hooks/aurora/useDashboard';
import { useLifeModel } from '@/hooks/aurora/useLifeModel';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { supabase } from '@/integrations/supabase/client';
import {
  OrbProfile,
  DEFAULT_ORB_PROFILE,
  generateOrbProfile,
} from '@/lib/orbProfileGenerator';
import type { ArchetypeId } from '@/lib/archetypes';

interface OrbProfileRow {
  id: string;
  user_id: string;
  primary_color: string;
  secondary_colors: string[];
  accent_color: string;
  morph_intensity: number;
  morph_speed: number;
  core_intensity: number;
  layer_count: number;
  particle_enabled: boolean;
  particle_count: number;
  geometry_detail: number;
  computed_from: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Extract user data from launchpad profile for DNA computation
 */
interface LaunchpadProfileData {
  hobbies?: string[];
  decisionStyle?: string;
  conflictStyle?: string;
  problemSolvingStyle?: string;
  priorities?: string[];
  // Additional fields from step_2_profile_data
  sleep_schedule?: string;
  exercise_frequency?: string;
  diet_type?: string;
  meditation_practice?: string;
}

function extractLaunchpadProfile(profileData: Record<string, unknown> | null): LaunchpadProfileData {
  if (!profileData) return {};
  
  return {
    hobbies: (profileData.hobbies as string[]) || [],
    decisionStyle: profileData.decision_making as string,
    conflictStyle: profileData.conflict_handling as string,
    problemSolvingStyle: profileData.problem_solving as string,
    priorities: (profileData.life_priorities as string[]) || [],
  };
}

/**
 * Convert database row to OrbProfile
 */
function rowToProfile(row: OrbProfileRow): OrbProfile {
  const computedFrom = row.computed_from as Record<string, unknown>;
  
  return {
    primaryColor: row.primary_color,
    secondaryColors: row.secondary_colors || [],
    accentColor: row.accent_color || row.primary_color,
    morphIntensity: row.morph_intensity,
    morphSpeed: row.morph_speed,
    fractalOctaves: Math.max(2, Math.min(6, row.geometry_detail)),
    coreIntensity: row.core_intensity,
    coreSize: 0.2 + Math.min((computedFrom?.level as number) || 1, 15) * 0.02,
    layerCount: row.layer_count,
    geometryDetail: row.geometry_detail,
    particleEnabled: row.particle_enabled,
    particleCount: row.particle_count,
    particleColor: row.secondary_colors?.[0] || row.primary_color,
    // Motion profile defaults
    motionSpeed: 1.0,
    pulseRate: 1.0,
    smoothness: 0.6,
    // Texture defaults
    textureType: 'flowing',
    textureIntensity: 0.5,
    computedFrom: {
      dominantArchetype: (computedFrom?.dominantArchetype as ArchetypeId) || 'explorer',
      secondaryArchetype: (computedFrom?.secondaryArchetype as ArchetypeId) || null,
      archetypeWeights: (computedFrom?.archetypeWeights as { id: ArchetypeId; weight: number }[]) || [],
      dominantHobbies: (computedFrom?.dominantHobbies as string[]) || [],
      egoState: (computedFrom?.egoState as string) || 'guardian',
      level: (computedFrom?.level as number) || 1,
      streak: (computedFrom?.streak as number) || 0,
      topTraitCategories: (computedFrom?.topTraitCategories as string[]) || [],
      clarityScore: (computedFrom?.clarityScore as number) || 0,
    },
  };
}

/**
 * Convert OrbProfile to database row format
 */
function profileToRow(profile: OrbProfile, userId: string): Record<string, unknown> {
  return {
    user_id: userId,
    primary_color: profile.primaryColor,
    secondary_colors: profile.secondaryColors,
    accent_color: profile.accentColor,
    morph_intensity: profile.morphIntensity,
    morph_speed: profile.morphSpeed,
    core_intensity: profile.coreIntensity,
    layer_count: profile.layerCount,
    particle_enabled: profile.particleEnabled,
    particle_count: profile.particleCount,
    geometry_detail: profile.geometryDetail,
    computed_from: profile.computedFrom as Record<string, unknown>,
  };
}

export function useOrbProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastSavedRef = useRef<{ signature: string; at: number } | null>(null);
  
  // Get user data from various sources
  const { gameState } = useGameState();
  const { characterTraits } = useDashboard();
  const { lifeDirection } = useLifeModel();
  const { isLaunchpadComplete, progress } = useLaunchpadProgress();

  // Extract launchpad profile data
  const launchpadProfile = useMemo(() => {
    return extractLaunchpadProfile(progress?.step_2_profile_data as Record<string, unknown> | null);
  }, [progress?.step_2_profile_data]);

  // Fetch launchpad summary for AI-derived insights - use maybeSingle() to avoid 406
  const { data: launchpadSummary } = useQuery({
    queryKey: ['launchpad-summary-orb', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('launchpad_summaries')
        .select('summary_data, consciousness_score, transformation_readiness')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching launchpad summary:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Extract AI-derived identity data from summary
  const summaryData = useMemo(() => {
    if (!launchpadSummary?.summary_data) return null;
    const data = launchpadSummary.summary_data as Record<string, unknown>;
    const identityProfile = data?.identity_profile as Record<string, unknown> | undefined;
    
    return {
      suggestedEgoState: identityProfile?.suggested_ego_state as string | undefined,
      dominantTraits: (identityProfile?.dominant_traits as string[]) || [],
      identityTitle: identityProfile?.identity_title as string | undefined,
      consciousnessScore: (launchpadSummary.consciousness_score as number) || 50,
      transformationReadiness: (launchpadSummary.transformation_readiness as number) || 0,
    };
  }, [launchpadSummary]);

  // Fetch stored profile from database
  const { data: storedProfile, isLoading } = useQuery({
    queryKey: ['orb-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('orb_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching orb profile:', error);
        return null;
      }
      
      return data ? rowToProfile(data as OrbProfileRow) : null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const approxEqual = (a: number, b: number, eps = 1e-4) => Math.abs(a - b) <= eps;
  const round4 = (n: number) => Math.round(n * 10000) / 10000;
  const profileSignature = (p: OrbProfile) =>
    JSON.stringify({
      primaryColor: p.primaryColor,
      secondaryColors: p.secondaryColors,
      accentColor: p.accentColor,
      morphIntensity: round4(p.morphIntensity),
      morphSpeed: round4(p.morphSpeed),
      coreIntensity: round4(p.coreIntensity),
      coreSize: round4(p.coreSize),
      layerCount: p.layerCount,
      geometryDetail: p.geometryDetail,
      particleEnabled: p.particleEnabled,
      particleCount: p.particleCount,
      particleColor: p.particleColor,
      computedFrom: {
        dominantArchetype: p.computedFrom.dominantArchetype,
        secondaryArchetype: p.computedFrom.secondaryArchetype,
        level: p.computedFrom.level,
        streak: p.computedFrom.streak,
        dominantHobbies: p.computedFrom.dominantHobbies,
        clarityScore: round4(p.computedFrom.clarityScore),
        egoState: p.computedFrom.egoState,
      },
    });

  // Extract trait IDs from character traits
  const selectedTraitIds = useMemo(() => {
    return characterTraits
      .filter((t) => t.element_type === 'character_trait')
      .map((t) => t.content);
  }, [characterTraits]);

  // Compute profile from current user data using the new DNA system
  // Now includes AI-derived data from launchpad_summaries
  const computedProfile = useMemo((): OrbProfile => {
    if (!user?.id) return DEFAULT_ORB_PROFILE;

    // Merge traits from character traits and AI analysis
    const allTraits = [
      ...selectedTraitIds,
      ...(summaryData?.dominantTraits || []),
    ];

    return generateOrbProfile({
      // Launchpad profile data
      hobbies: launchpadProfile.hobbies,
      decisionStyle: launchpadProfile.decisionStyle,
      conflictStyle: launchpadProfile.conflictStyle,
      problemSolvingStyle: launchpadProfile.problemSolvingStyle,
      priorities: launchpadProfile.priorities,
      
      // Identity elements - includes AI-derived traits
      selectedTraitIds: allTraits,
      
      // Game state
      level: gameState?.level || 1,
      experience: gameState?.experience || 0,
      streak: gameState?.sessionStreak || 0,
      
      // Aurora data - NOW includes AI summary data
      clarityScore: lifeDirection?.clarity_score || 0,
      consciousnessScore: summaryData?.consciousnessScore || 50,
      transformationReadiness: summaryData?.transformationReadiness || (isLaunchpadComplete ? 70 : 30),
      
      // Ego state priority: AI suggested > game state
      egoState: summaryData?.suggestedEgoState || gameState?.activeEgoState,
    });
  }, [
    user?.id,
    launchpadProfile,
    selectedTraitIds,
    summaryData,
    gameState?.activeEgoState,
    gameState?.level,
    gameState?.experience,
    gameState?.sessionStreak,
    lifeDirection?.clarity_score,
    isLaunchpadComplete,
  ]);

  // Mutation to save/update profile
  const saveProfileMutation = useMutation({
    mutationFn: async (profile: OrbProfile) => {
      if (!user?.id) throw new Error('No user');
      
      const row = profileToRow(profile, user.id);
      
      const { error } = await supabase
        .from('orb_profiles')
        .upsert([row as { user_id: string; [key: string]: unknown }], { onConflict: 'user_id' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orb-profile', user?.id] });
    },
  });

  // Auto-save profile when computed profile changes significantly
  useEffect(() => {
    if (!user?.id || isLoading) return;
    
    // Only save if user has launchpad profile data or significant game progress
    const hasSignificantData = 
      (launchpadProfile.hobbies && launchpadProfile.hobbies.length > 0) ||
      selectedTraitIds.length > 0 ||
      (gameState?.level || 1) > 1 ||
      isLaunchpadComplete;
    
    if (!hasSignificantData) return;

    // Check if profile needs updating (include visual/dna-affecting fields to avoid stale reverts)
    const needsUpdate =
      !storedProfile ||
      storedProfile.primaryColor !== computedProfile.primaryColor ||
      storedProfile.accentColor !== computedProfile.accentColor ||
      JSON.stringify(storedProfile.secondaryColors) !== JSON.stringify(computedProfile.secondaryColors) ||
      !approxEqual(storedProfile.morphIntensity, computedProfile.morphIntensity) ||
      !approxEqual(storedProfile.morphSpeed, computedProfile.morphSpeed) ||
      !approxEqual(storedProfile.coreIntensity, computedProfile.coreIntensity) ||
      !approxEqual(storedProfile.coreSize, computedProfile.coreSize) ||
      storedProfile.layerCount !== computedProfile.layerCount ||
      storedProfile.geometryDetail !== computedProfile.geometryDetail ||
      storedProfile.particleEnabled !== computedProfile.particleEnabled ||
      storedProfile.particleCount !== computedProfile.particleCount ||
      storedProfile.particleColor !== computedProfile.particleColor ||
      storedProfile.computedFrom.dominantArchetype !== computedProfile.computedFrom.dominantArchetype ||
      storedProfile.computedFrom.secondaryArchetype !== computedProfile.computedFrom.secondaryArchetype ||
      storedProfile.computedFrom.level !== computedProfile.computedFrom.level ||
      storedProfile.computedFrom.streak !== computedProfile.computedFrom.streak ||
      !approxEqual(
        storedProfile.computedFrom.clarityScore ?? 0,
        computedProfile.computedFrom.clarityScore ?? 0
      ) ||
      JSON.stringify(storedProfile.computedFrom.dominantHobbies) !==
        JSON.stringify(computedProfile.computedFrom.dominantHobbies);

    if (!needsUpdate) return;

    // Guard against rapid re-saves due to floating precision differences.
    const signature = profileSignature(computedProfile);
    const now = Date.now();
    const last = lastSavedRef.current;
    const recentlySavedSame = !!last && last.signature === signature;
    const recentlySavedAny = !!last && now - last.at < 3000;

    if (recentlySavedSame || (recentlySavedAny && saveProfileMutation.isPending)) return;

    lastSavedRef.current = { signature, at: now };
    saveProfileMutation.mutate(computedProfile);
  }, [
    user?.id,
    isLoading,
    storedProfile,
    computedProfile,
    launchpadProfile.hobbies,
    selectedTraitIds.length,
    gameState?.level,
    isLaunchpadComplete,
  ]);

  /**
   * IMPORTANT UX FIX:
   * We used to prefer `storedProfile` when present. If that row is stale (e.g., saved before
   * Launchpad summary / DNA improvements), the orb "reverts" to older colors/shape.
   *
   * Once the user has meaningful personalization signals, prefer the live computed profile
   * and keep DB in sync via the auto-save mutation.
   */
  const hasPersonalizationSignals =
    (launchpadProfile.hobbies && launchpadProfile.hobbies.length > 0) ||
    selectedTraitIds.length > 0 ||
    !!summaryData ||
    isLaunchpadComplete;

  const profile = hasPersonalizationSignals ? computedProfile : (storedProfile || computedProfile);

  return {
    profile,
    computedProfile,
    storedProfile,
    isLoading,
    isPersonalized: !!user?.id && (
      (launchpadProfile.hobbies && launchpadProfile.hobbies.length > 0) ||
      selectedTraitIds.length > 0 || 
      (gameState?.level || 1) > 1
    ),
    saveProfile: saveProfileMutation.mutate,
    isSaving: saveProfileMutation.isPending,
  };
}

/**
 * Lightweight hook for orb rendering without database sync
 */
export function useOrbProfileComputed() {
  const { user } = useAuth();
  const { gameState } = useGameState();
  const { characterTraits } = useDashboard();
  const { lifeDirection } = useLifeModel();
  const { isLaunchpadComplete, progress } = useLaunchpadProgress();

  const launchpadProfile = useMemo(() => {
    return extractLaunchpadProfile(progress?.step_2_profile_data as Record<string, unknown> | null);
  }, [progress?.step_2_profile_data]);

  const selectedTraitIds = useMemo(() => {
    return characterTraits
      .filter((t) => t.element_type === 'character_trait')
      .map((t) => t.content);
  }, [characterTraits]);

  return useMemo((): OrbProfile => {
    if (!user?.id) return DEFAULT_ORB_PROFILE;

    return generateOrbProfile({
      hobbies: launchpadProfile.hobbies,
      decisionStyle: launchpadProfile.decisionStyle,
      conflictStyle: launchpadProfile.conflictStyle,
      problemSolvingStyle: launchpadProfile.problemSolvingStyle,
      priorities: launchpadProfile.priorities,
      selectedTraitIds,
      level: gameState?.level || 1,
      experience: gameState?.experience || 0,
      streak: gameState?.sessionStreak || 0,
      clarityScore: lifeDirection?.clarity_score || 0,
      consciousnessScore: 50,
      transformationReadiness: isLaunchpadComplete ? 70 : 30,
      egoState: gameState?.activeEgoState,
    });
  }, [
    user?.id,
    launchpadProfile,
    selectedTraitIds,
    gameState?.activeEgoState,
    gameState?.level,
    gameState?.experience,
    gameState?.sessionStreak,
    lifeDirection?.clarity_score,
    isLaunchpadComplete,
  ]);
}
