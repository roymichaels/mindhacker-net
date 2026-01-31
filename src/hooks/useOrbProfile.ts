/**
 * Hook to generate and manage personalized orb profile
 * 
 * SIMPLIFIED SYSTEM - Direct mapping from user data to visual profile
 * User Data → Visual Profile → THREE.js
 */

import { useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/hooks/useGameState';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateVisualProfile, 
  visualProfileToOrbProfile,
  COLOR_PALETTES,
  type OrbVisualProfile 
} from '@/lib/orbVisualSystem';
import type { OrbProfile } from '@/components/orb/types';
import type { ArchetypeId } from '@/lib/archetypes';

// Re-export types
export type { OrbProfile };

// Default orb profile
export const DEFAULT_ORB_PROFILE: OrbProfile = {
  primaryColor: COLOR_PALETTES.explorer.primary,
  secondaryColors: [COLOR_PALETTES.explorer.secondary, COLOR_PALETTES.explorer.accent],
  accentColor: COLOR_PALETTES.explorer.accent,
  morphIntensity: 0.15,
  morphSpeed: 0.8,
  fractalOctaves: 3,
  coreIntensity: 0.7,
  coreSize: 0.25,
  layerCount: 2,
  geometryDetail: 4,
  particleEnabled: false,
  particleCount: 0,
  particleColor: COLOR_PALETTES.explorer.glow,
  motionSpeed: 1.0,
  pulseRate: 1.0,
  smoothness: 0.6,
  textureType: 'flowing',
  textureIntensity: 0.5,
  computedFrom: {
    dominantArchetype: 'explorer',
    secondaryArchetype: null,
    archetypeWeights: [],
    dominantHobbies: [],
    egoState: 'guardian',
    level: 1,
    streak: 0,
    topTraitCategories: [],
    clarityScore: 0,
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
 * Extract hobbies from launchpad profile
 */
function extractHobbies(profileData: Record<string, unknown> | null): string[] {
  if (!profileData) return [];
  return (profileData.hobbies as string[]) || [];
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
 * Convert visual profile to full OrbProfile with metadata
 */
function visualToFullProfile(
  vp: OrbVisualProfile, 
  hobbies: string[],
  egoState?: string
): OrbProfile {
  const base = visualProfileToOrbProfile(vp);
  
  return {
    ...base,
    motionSpeed: vp.morphSpeed,
    pulseRate: vp.pulseRate,
    smoothness: 0.6,
    textureType: 'flowing',
    textureIntensity: 0.5,
    computedFrom: {
      dominantArchetype: (vp.dominantHobbyCategory === 'tech' ? 'sage' : 
                         vp.dominantHobbyCategory === 'creative' ? 'creator' :
                         vp.dominantHobbyCategory === 'action' ? 'warrior' :
                         vp.dominantHobbyCategory === 'mystic' ? 'mystic' :
                         vp.dominantHobbyCategory === 'healing' ? 'healer' : 'explorer') as ArchetypeId,
      secondaryArchetype: vp.secondaryPalette ? 
        (vp.secondaryPalette.id === 'tech' ? 'sage' : 
         vp.secondaryPalette.id === 'creative' ? 'creator' :
         vp.secondaryPalette.id === 'action' ? 'warrior' :
         vp.secondaryPalette.id === 'mystic' ? 'mystic' :
         vp.secondaryPalette.id === 'healing' ? 'healer' : 'explorer') as ArchetypeId : null,
      archetypeWeights: [],
      dominantHobbies: hobbies.slice(0, 3),
      egoState: egoState || 'guardian',
      level: vp.level,
      streak: 0,
      topTraitCategories: [],
      clarityScore: 0,
    },
  };
}

export function useOrbProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastSavedRef = useRef<{ signature: string; at: number } | null>(null);
  
  // Get user data - SIMPLIFIED sources
  const { gameState } = useGameState();
  const { isLaunchpadComplete, progress } = useLaunchpadProgress();

  // Extract hobbies from launchpad - this is the PRIMARY driver of visual identity
  const hobbies = useMemo(() => {
    return extractHobbies(progress?.step_2_profile_data as Record<string, unknown> | null);
  }, [progress?.step_2_profile_data]);

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

  // SIMPLIFIED: Compute profile directly from hobbies + level
  const computedProfile = useMemo((): OrbProfile => {
    if (!user?.id) return DEFAULT_ORB_PROFILE;

    const level = gameState?.level || 1;
    const streak = gameState?.sessionStreak || 0;
    
    // Generate visual profile using the new simplified system
    const visualProfile = generateVisualProfile(hobbies, level, streak);
    
    // Convert to full OrbProfile
    return visualToFullProfile(visualProfile, hobbies, gameState?.activeEgoState);
  }, [user?.id, hobbies, gameState?.level, gameState?.sessionStreak, gameState?.activeEgoState]);

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
    
    // Only save if user has hobbies or significant game progress
    const hasSignificantData = 
      hobbies.length > 0 ||
      (gameState?.level || 1) > 1 ||
      isLaunchpadComplete;
    
    if (!hasSignificantData) return;

    // Check if profile needs updating
    const needsUpdate =
      !storedProfile ||
      storedProfile.primaryColor !== computedProfile.primaryColor ||
      storedProfile.accentColor !== computedProfile.accentColor ||
      JSON.stringify(storedProfile.secondaryColors) !== JSON.stringify(computedProfile.secondaryColors) ||
      storedProfile.layerCount !== computedProfile.layerCount ||
      storedProfile.geometryDetail !== computedProfile.geometryDetail ||
      storedProfile.computedFrom.level !== computedProfile.computedFrom.level;

    if (!needsUpdate) return;

    // Debounce saves
    const signature = profileSignature(computedProfile);
    const now = Date.now();
    const last = lastSavedRef.current;
    const recentlySavedSame = !!last && last.signature === signature;
    const recentlySavedAny = !!last && now - last.at < 3000;

    if (recentlySavedSame || (recentlySavedAny && saveProfileMutation.isPending)) return;

    lastSavedRef.current = { signature, at: now };
    saveProfileMutation.mutate(computedProfile);
  }, [user?.id, isLoading, storedProfile, computedProfile, hobbies, gameState?.level, isLaunchpadComplete]);

  // Always prefer computed profile when user has hobbies (live data)
  const hasPersonalizationSignals = hobbies.length > 0 || isLaunchpadComplete;
  const profile = hasPersonalizationSignals ? computedProfile : (storedProfile || computedProfile);

  return {
    profile,
    computedProfile,
    storedProfile,
    isLoading,
    isPersonalized: !!user?.id && (hobbies.length > 0 || (gameState?.level || 1) > 1),
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
  const { isLaunchpadComplete, progress } = useLaunchpadProgress();

  const hobbies = useMemo(() => {
    return extractHobbies(progress?.step_2_profile_data as Record<string, unknown> | null);
  }, [progress?.step_2_profile_data]);

  return useMemo((): OrbProfile => {
    if (!user?.id) return DEFAULT_ORB_PROFILE;

    const level = gameState?.level || 1;
    const streak = gameState?.sessionStreak || 0;
    
    const visualProfile = generateVisualProfile(hobbies, level, streak);
    return visualToFullProfile(visualProfile, hobbies, gameState?.activeEgoState);
  }, [user?.id, hobbies, gameState?.activeEgoState, gameState?.level, gameState?.sessionStreak]);
}
