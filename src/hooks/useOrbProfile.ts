/**
 * Hook to generate and manage personalized orb profile
 * Combines data from game state, dashboard, and life model
 */

import { useMemo, useEffect } from 'react';
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
 * Convert database row to OrbProfile
 */
function rowToProfile(row: OrbProfileRow): OrbProfile {
  return {
    primaryColor: row.primary_color,
    secondaryColors: row.secondary_colors || [],
    accentColor: row.accent_color || row.primary_color,
    morphIntensity: row.morph_intensity,
    morphSpeed: row.morph_speed,
    fractalOctaves: Math.max(2, Math.min(6, row.geometry_detail)),
    coreIntensity: row.core_intensity,
    coreSize: 0.2 + Math.min((row.computed_from as any)?.level || 1, 15) * 0.02,
    layerCount: row.layer_count,
    geometryDetail: row.geometry_detail,
    particleEnabled: row.particle_enabled,
    particleCount: row.particle_count,
    particleColor: row.secondary_colors?.[0] || row.primary_color,
    computedFrom: {
      egoState: (row.computed_from as any)?.egoState || 'guardian',
      level: (row.computed_from as any)?.level || 1,
      streak: (row.computed_from as any)?.streak || 0,
      topTraitCategories: (row.computed_from as any)?.topTraitCategories || [],
      clarityScore: (row.computed_from as any)?.clarityScore || 0,
    },
  };
}

/**
 * Convert OrbProfile to database row format
 */
function profileToRow(profile: OrbProfile, userId: string): Partial<OrbProfileRow> {
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
    computed_from: profile.computedFrom as unknown as Record<string, unknown>,
  };
}

export function useOrbProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get user data from various sources
  const { gameState } = useGameState();
  const { characterTraits } = useDashboard();
  const { lifeDirection } = useLifeModel();
  const { isLaunchpadComplete } = useLaunchpadProgress();

  // Fetch stored profile from database
  const { data: storedProfile, isLoading } = useQuery({
    queryKey: ['orb-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('orb_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching orb profile:', error);
        return null;
      }
      
      return data ? rowToProfile(data as OrbProfileRow) : null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract trait IDs from character traits
  const selectedTraitIds = useMemo(() => {
    return characterTraits
      .filter((t) => t.element_type === 'character_trait')
      .map((t) => t.content);
  }, [characterTraits]);

  // Compute profile from current user data
  const computedProfile = useMemo((): OrbProfile => {
    if (!user?.id) return DEFAULT_ORB_PROFILE;

    return generateOrbProfile({
      egoState: gameState?.activeEgoState || 'guardian',
      level: gameState?.level || 1,
      experience: gameState?.experience || 0,
      streak: gameState?.sessionStreak || 0,
      selectedTraitIds,
      clarityScore: lifeDirection?.clarity_score || 0,
      consciousnessScore: 50, // Default, can be enhanced with actual data
      transformationReadiness: isLaunchpadComplete ? 70 : 30,
    });
  }, [
    user?.id,
    gameState?.activeEgoState,
    gameState?.level,
    gameState?.experience,
    gameState?.sessionStreak,
    selectedTraitIds,
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
        .upsert([row as any], { onConflict: 'user_id' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orb-profile', user?.id] });
    },
  });

  // Auto-save profile when computed profile changes significantly
  useEffect(() => {
    if (!user?.id || isLoading) return;
    
    // Only save if user has completed launchpad or has significant data
    const hasSignificantData = 
      selectedTraitIds.length > 0 ||
      (gameState?.level || 1) > 1 ||
      isLaunchpadComplete;
    
    if (!hasSignificantData) return;

    // Check if profile needs updating
    const needsUpdate = !storedProfile ||
      storedProfile.computedFrom.egoState !== computedProfile.computedFrom.egoState ||
      storedProfile.computedFrom.level !== computedProfile.computedFrom.level ||
      storedProfile.computedFrom.streak !== computedProfile.computedFrom.streak ||
      JSON.stringify(storedProfile.computedFrom.topTraitCategories) !== 
        JSON.stringify(computedProfile.computedFrom.topTraitCategories);

    if (needsUpdate) {
      saveProfileMutation.mutate(computedProfile);
    }
  }, [
    user?.id,
    isLoading,
    storedProfile,
    computedProfile,
    selectedTraitIds.length,
    gameState?.level,
    isLaunchpadComplete,
  ]);

  // Return the stored profile if available, otherwise computed
  const profile = storedProfile || computedProfile;

  return {
    profile,
    computedProfile,
    storedProfile,
    isLoading,
    isPersonalized: !!user?.id && (selectedTraitIds.length > 0 || (gameState?.level || 1) > 1),
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
  const { isLaunchpadComplete } = useLaunchpadProgress();

  const selectedTraitIds = useMemo(() => {
    return characterTraits
      .filter((t) => t.element_type === 'character_trait')
      .map((t) => t.content);
  }, [characterTraits]);

  return useMemo((): OrbProfile => {
    if (!user?.id) return DEFAULT_ORB_PROFILE;

    return generateOrbProfile({
      egoState: gameState?.activeEgoState || 'guardian',
      level: gameState?.level || 1,
      experience: gameState?.experience || 0,
      streak: gameState?.sessionStreak || 0,
      selectedTraitIds,
      clarityScore: lifeDirection?.clarity_score || 0,
      consciousnessScore: 50,
      transformationReadiness: isLaunchpadComplete ? 70 : 30,
    });
  }, [
    user?.id,
    gameState?.activeEgoState,
    gameState?.level,
    gameState?.experience,
    gameState?.sessionStreak,
    selectedTraitIds,
    lifeDirection?.clarity_score,
    isLaunchpadComplete,
  ]);
}
