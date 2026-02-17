/**
 * Hook to generate and manage personalized orb profile
 * 
 * FULL DNA SYSTEM - Maps user traits, hobbies, behaviors, AI summary → visual profile
 * User Data + AI Summary → generateOrbProfile() → computeAvatarDNA() → OrbProfile → THREE.js
 */

import { useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/hooks/useGameState';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateOrbProfile,
  DEFAULT_ORB_PROFILE as GENERATOR_DEFAULT,
  type GenerateOrbProfileInput,
} from '@/lib/orbProfileGenerator';
import type { OrbProfile } from '@/components/orb/types';
import type { ArchetypeId } from '@/lib/archetypes';

// Re-export types
export type { OrbProfile };

// Default orb profile
export const DEFAULT_ORB_PROFILE: OrbProfile = {
  ...GENERATOR_DEFAULT,
  computedFrom: {
    ...GENERATOR_DEFAULT.computedFrom,
  },
};

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
 * Extract profile fields from step_2_profile_data
 */
function extractProfileData(profileData: Record<string, unknown> | null) {
  if (!profileData) return { hobbies: [], decisionStyle: undefined, conflictStyle: undefined, problemSolvingStyle: undefined, priorities: [], traits: [] };
  return {
    hobbies: (profileData.hobbies as string[]) || [],
    decisionStyle: (profileData.decision_style as string) || undefined,
    conflictStyle: (profileData.conflict_handling as string) || undefined,
    problemSolvingStyle: (profileData.problem_approach as string) || undefined,
    priorities: (profileData.life_priorities as string[]) || [],
    traits: (profileData.traits as string[]) || (profileData.selectedTraits as string[]) || [],
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
    motionSpeed: 1.0,
    pulseRate: 1.0,
    smoothness: 0.6,
    textureType: 'flowing',
    textureIntensity: 0.5,
    computedFrom: {
      dominantArchetype: ((computedFrom?.dominantArchetype as string) || 'explorer') as ArchetypeId,
      secondaryArchetype: (computedFrom?.secondaryArchetype as ArchetypeId | null) || null,
      archetypeWeights: [],
      dominantHobbies: (computedFrom?.dominantHobbies as string[]) || [],
      egoState: (computedFrom?.egoState as string) || 'guardian',
      level: (computedFrom?.level as number) || 1,
      streak: (computedFrom?.streak as number) || 0,
      topTraitCategories: [],
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
    computed_from: {
      dominantHobbies: profile.computedFrom.dominantHobbies,
      level: profile.computedFrom.level,
      streak: profile.computedFrom.streak,
      clarityScore: profile.computedFrom.clarityScore,
      egoState: profile.computedFrom.egoState,
    },
  };
}

/**
 * Extract AI summary data relevant to orb
 */
function extractSummarySignals(summaryData: Record<string, unknown> | null): {
  egoState?: string;
  traits?: string[];
} {
  if (!summaryData) return {};
  const identityProfile = summaryData.identity_profile as Record<string, unknown> | undefined;
  return {
    egoState: identityProfile?.suggested_ego_state as string | undefined,
    traits: (identityProfile?.dominant_traits as string[]) || [],
  };
}

export function useOrbProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastSavedRef = useRef<{ signature: string; at: number } | null>(null);
  
  // Get user data sources
  const { gameState } = useGameState();
  const { isLaunchpadComplete, progress } = useLaunchpadProgress();

  // Extract FULL profile data from launchpad (hobbies, decision style, conflict, priorities, traits)
  const profileData = useMemo(() => {
    return extractProfileData(progress?.step_2_profile_data as Record<string, unknown> | null);
  }, [progress?.step_2_profile_data]);

  // Fetch AI summary data from launchpad_summaries
  const { data: summaryRow } = useQuery({
    queryKey: ['launchpad-summary-orb', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('launchpad_summaries')
        .select('summary_data, clarity_score, consciousness_score, transformation_readiness')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) { console.error('Error fetching summary for orb:', error); return null; }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // Extract AI signals
  const summarySignals = useMemo(() => {
    return extractSummarySignals(summaryRow?.summary_data as Record<string, unknown> | null);
  }, [summaryRow?.summary_data]);

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
      if (error) { console.error('Error fetching orb profile:', error); return null; }
      return data ? rowToProfile(data as OrbProfileRow) : null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Generate profile signature for comparison
  const profileSignature = (p: OrbProfile) =>
    JSON.stringify({
      primaryColor: p.primaryColor,
      secondaryColors: p.secondaryColors,
      accentColor: p.accentColor,
      layerCount: p.layerCount,
      geometryDetail: p.geometryDetail,
      level: p.computedFrom.level,
    });

  // FULL DNA: Compute profile from all user signals
  const computedProfile = useMemo((): OrbProfile => {
    if (!user?.id) return DEFAULT_ORB_PROFILE;

    const level = gameState?.level || 1;
    const streak = gameState?.sessionStreak || 0;
    const experience = gameState?.experience || 0;

    // Merge traits from profile data + AI summary
    const allTraits = [
      ...(profileData.traits || []),
      ...(summarySignals.traits || []),
    ];

    const input: GenerateOrbProfileInput = {
      hobbies: profileData.hobbies,
      decisionStyle: profileData.decisionStyle,
      conflictStyle: profileData.conflictStyle,
      problemSolvingStyle: profileData.problemSolvingStyle,
      priorities: profileData.priorities,
      selectedTraitIds: allTraits,
      level,
      experience,
      streak,
      clarityScore: summaryRow?.clarity_score ?? undefined,
      consciousnessScore: summaryRow?.consciousness_score ?? undefined,
      transformationReadiness: summaryRow?.transformation_readiness ?? undefined,
      egoState: summarySignals.egoState || gameState?.activeEgoState,
    };

    return generateOrbProfile(input);
  }, [user?.id, profileData, summarySignals, summaryRow, gameState?.level, gameState?.sessionStreak, gameState?.experience, gameState?.activeEgoState]);

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
    
    const hasSignificantData = 
      profileData.hobbies.length > 0 ||
      (gameState?.level || 1) > 1 ||
      isLaunchpadComplete ||
      !!summaryRow;
    
    if (!hasSignificantData) return;

    const needsUpdate =
      !storedProfile ||
      storedProfile.primaryColor !== computedProfile.primaryColor ||
      storedProfile.accentColor !== computedProfile.accentColor ||
      JSON.stringify(storedProfile.secondaryColors) !== JSON.stringify(computedProfile.secondaryColors) ||
      storedProfile.layerCount !== computedProfile.layerCount ||
      storedProfile.geometryDetail !== computedProfile.geometryDetail ||
      storedProfile.computedFrom.level !== computedProfile.computedFrom.level;

    if (!needsUpdate) return;

    const signature = profileSignature(computedProfile);
    const now = Date.now();
    const last = lastSavedRef.current;
    if ((!!last && last.signature === signature) || (!!last && now - last.at < 3000 && saveProfileMutation.isPending)) return;

    lastSavedRef.current = { signature, at: now };
    saveProfileMutation.mutate(computedProfile);
  }, [user?.id, isLoading, storedProfile, computedProfile, profileData.hobbies, gameState?.level, isLaunchpadComplete, summaryRow]);

  const hasPersonalizationSignals = profileData.hobbies.length > 0 || isLaunchpadComplete || !!summaryRow;
  const profile = hasPersonalizationSignals ? computedProfile : (storedProfile || computedProfile);

  return {
    profile,
    computedProfile,
    storedProfile,
    isLoading,
    isPersonalized: !!user?.id && (profileData.hobbies.length > 0 || (gameState?.level || 1) > 1 || !!summaryRow),
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
  const { progress } = useLaunchpadProgress();

  const profileData = useMemo(() => {
    return extractProfileData(progress?.step_2_profile_data as Record<string, unknown> | null);
  }, [progress?.step_2_profile_data]);

  return useMemo((): OrbProfile => {
    if (!user?.id) return DEFAULT_ORB_PROFILE;

    return generateOrbProfile({
      hobbies: profileData.hobbies,
      decisionStyle: profileData.decisionStyle,
      conflictStyle: profileData.conflictStyle,
      problemSolvingStyle: profileData.problemSolvingStyle,
      priorities: profileData.priorities,
      selectedTraitIds: profileData.traits,
      level: gameState?.level || 1,
      experience: gameState?.experience || 0,
      streak: gameState?.sessionStreak || 0,
      egoState: gameState?.activeEgoState,
    });
  }, [user?.id, profileData, gameState?.activeEgoState, gameState?.level, gameState?.sessionStreak, gameState?.experience]);
}
