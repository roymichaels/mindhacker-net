/**
 * Hook to generate and manage personalized orb profile
 * 
 * FULL DNA SYSTEM - Maps user traits, hobbies, behaviors, AI summary → visual profile
 * Now includes: deterministic seed, diagnostic state, version tracking
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
import { VISUAL_DEFAULTS } from '@/components/orb/types';
import { hashUserId } from '@/lib/orbSeed';
import type { OrbProfile, DiagnosticState } from '@/components/orb/types';
import type { ArchetypeId } from '@/lib/archetypes';

export type { OrbProfile };

export const DEFAULT_ORB_PROFILE: OrbProfile = {
  ...GENERATOR_DEFAULT,
  computedFrom: { ...GENERATOR_DEFAULT.computedFrom },
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
 * Convert database row to OrbProfile - FIXED: preserve motion/texture fields
 */
function rowToProfile(row: OrbProfileRow): OrbProfile & { _rawHasVisualDNA: boolean } {
  const cf = row.computed_from as Record<string, unknown>;
  
  // Read visual DNA from the dedicated bucket (new) OR flat keys (legacy)
  const vdBucket = (cf?.visualDNA as Record<string, unknown>) ?? {};
  // Helper: try bucket first, then flat cf, then default
  const vd = <T>(key: string, fallback: T): T => {
    const val = vdBucket[key] ?? cf?.[key];
    return (val !== undefined && val !== null) ? (val as T) : fallback;
  };
  const safeNum = (v: unknown, fb: number) => (typeof v === 'number' && !isNaN(v)) ? v : fb;
  
  // Track whether DB actually had COMPLETE visual DNA stored (not just partial with nulls)
  const rawStops = (vdBucket.gradientStops ?? cf?.gradientStops) as string[] | undefined;
  const rawMaterialType = vdBucket.materialType ?? cf?.materialType;
  const rawBloom = vdBucket.bloomStrength ?? cf?.bloomStrength;
  const rawPattern = vdBucket.patternIntensity ?? cf?.patternIntensity;
  // Must have stops + materialType + no null numeric fields to count as "complete"
  const rawHasVisualDNA = !!(rawStops && rawStops.length >= 3 && rawMaterialType && typeof rawBloom === 'number' && typeof rawPattern === 'number');
  
  const gradientStops = (rawStops && rawStops.length >= 3) ? rawStops : VISUAL_DEFAULTS.gradientStops;
  
  // Validate material params
  const rawMatParams = vd<OrbProfile['materialParams'] | null>('materialParams', null);
  const materialParams = rawMatParams 
    ? { ...rawMatParams, emissiveIntensity: Math.max(0.05, rawMatParams.emissiveIntensity ?? 0.3) } 
    : VISUAL_DEFAULTS.materialParams;
  
  return {
    ...VISUAL_DEFAULTS,
    // Visual DNA fields – read from bucket with fallbacks
    gradientStops,
    gradientMode: vd('gradientMode', VISUAL_DEFAULTS.gradientMode),
    coreGradient: vd('coreGradient', VISUAL_DEFAULTS.coreGradient),
    rimLightColor: vd('rimLightColor', VISUAL_DEFAULTS.rimLightColor),
    materialType: vd('materialType', VISUAL_DEFAULTS.materialType),
    materialParams,
    patternType: vd('patternType', VISUAL_DEFAULTS.patternType),
    patternIntensity: safeNum(vd('patternIntensity', null), VISUAL_DEFAULTS.patternIntensity),
    particlePalette: vd('particlePalette', VISUAL_DEFAULTS.particlePalette),
    particleMode: vd('particleMode', VISUAL_DEFAULTS.particleMode),
    particleBehavior: vd('particleBehavior', VISUAL_DEFAULTS.particleBehavior),
    bloomStrength: safeNum(vd('bloomStrength', null), VISUAL_DEFAULTS.bloomStrength),
    chromaShift: safeNum(vd('chromaShift', null), VISUAL_DEFAULTS.chromaShift),
    dayNightBias: safeNum(vd('dayNightBias', null), VISUAL_DEFAULTS.dayNightBias),
    // Standard row fields
    primaryColor: row.primary_color,
    secondaryColors: row.secondary_colors || [],
    accentColor: row.accent_color || row.primary_color,
    morphIntensity: row.morph_intensity,
    morphSpeed: row.morph_speed,
    fractalOctaves: Math.max(2, Math.min(6, row.geometry_detail)),
    coreIntensity: row.core_intensity,
    coreSize: 0.2 + Math.min((cf?.level as number) || 1, 15) * 0.02,
    layerCount: row.layer_count,
    geometryDetail: row.geometry_detail,
    particleEnabled: row.particle_enabled,
    particleCount: row.particle_count,
    particleColor: row.secondary_colors?.[0] || row.primary_color,
    motionSpeed: safeNum(cf?.motionSpeed, 1.0),
    pulseRate: safeNum(cf?.pulseRate, 1.0),
    smoothness: safeNum(cf?.smoothness, 0.6),
    textureType: (cf?.textureType as string) ?? 'flowing',
    textureIntensity: safeNum(cf?.textureIntensity, 0.5),
    seed: (cf?.seed as number) ?? undefined,
    geometryFamily: (cf?.geometryFamily as OrbProfile['geometryFamily']) ?? undefined,
    diagnosticState: 'ok',
    _rawHasVisualDNA: rawHasVisualDNA,
    computedFrom: {
      dominantArchetype: ((cf?.dominantArchetype as string) || 'explorer') as ArchetypeId,
      secondaryArchetype: (cf?.secondaryArchetype as ArchetypeId | null) || null,
      archetypeWeights: (cf?.archetypeWeights as { id: ArchetypeId; weight: number }[]) || [],
      dominantHobbies: (cf?.dominantHobbies as string[]) || [],
      egoState: (cf?.egoState as string) || 'guardian',
      level: (cf?.level as number) || 1,
      streak: (cf?.streak as number) || 0,
      topTraitCategories: (cf?.topTraitCategories as string[]) || [],
      clarityScore: (cf?.clarityScore as number) || 0,
      orb_profile_version: (cf?.orb_profile_version as string) || undefined,
    },
  };
}

/**
 * Convert OrbProfile to database row format - FIXED: store all computed fields
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
      // Metadata
      dominantArchetype: profile.computedFrom.dominantArchetype,
      secondaryArchetype: profile.computedFrom.secondaryArchetype,
      archetypeWeights: profile.computedFrom.archetypeWeights,
      dominantHobbies: profile.computedFrom.dominantHobbies,
      level: profile.computedFrom.level,
      streak: profile.computedFrom.streak,
      clarityScore: profile.computedFrom.clarityScore,
      egoState: profile.computedFrom.egoState,
      topTraitCategories: profile.computedFrom.topTraitCategories,
      orb_profile_version: profile.computedFrom.orb_profile_version,
      // Motion/texture (flat for backward compat)
      motionSpeed: profile.motionSpeed,
      pulseRate: profile.pulseRate,
      smoothness: profile.smoothness,
      textureType: profile.textureType,
      textureIntensity: profile.textureIntensity,
      seed: profile.seed,
      geometryFamily: profile.geometryFamily,
      // ✅ Dedicated visual DNA bucket with guaranteed non-null values
      visualDNA: {
        gradientStops: profile.gradientStops ?? VISUAL_DEFAULTS.gradientStops,
        gradientMode: profile.gradientMode ?? VISUAL_DEFAULTS.gradientMode,
        coreGradient: profile.coreGradient ?? VISUAL_DEFAULTS.coreGradient,
        rimLightColor: profile.rimLightColor ?? VISUAL_DEFAULTS.rimLightColor,
        materialType: profile.materialType ?? VISUAL_DEFAULTS.materialType,
        materialParams: profile.materialParams ?? VISUAL_DEFAULTS.materialParams,
        patternType: profile.patternType ?? VISUAL_DEFAULTS.patternType,
        patternIntensity: typeof profile.patternIntensity === 'number' ? profile.patternIntensity : VISUAL_DEFAULTS.patternIntensity,
        particlePalette: profile.particlePalette ?? VISUAL_DEFAULTS.particlePalette,
        particleMode: profile.particleMode ?? VISUAL_DEFAULTS.particleMode,
        particleBehavior: profile.particleBehavior ?? VISUAL_DEFAULTS.particleBehavior,
        bloomStrength: typeof profile.bloomStrength === 'number' ? profile.bloomStrength : VISUAL_DEFAULTS.bloomStrength,
        chromaShift: typeof profile.chromaShift === 'number' ? profile.chromaShift : VISUAL_DEFAULTS.chromaShift,
        dayNightBias: typeof profile.dayNightBias === 'number' ? profile.dayNightBias : VISUAL_DEFAULTS.dayNightBias,
      },
    },
  };
}

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

/** Check if ORB_DEBUG is enabled */
function isOrbDebug(): boolean {
  try { return localStorage.getItem('ORB_DEBUG') === 'true'; } catch { return false; }
}

export function useOrbProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastSavedRef = useRef<{ signature: string; at: number } | null>(null);
  
  const { gameState } = useGameState();
  const { isLaunchpadComplete, progress } = useLaunchpadProgress();

  const profileData = useMemo(() => {
    return extractProfileData(progress?.step_2_profile_data as Record<string, unknown> | null);
  }, [progress?.step_2_profile_data]);

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

  const summarySignals = useMemo(() => {
    return extractSummarySignals(summaryRow?.summary_data as Record<string, unknown> | null);
  }, [summaryRow?.summary_data]);

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

  const profileSignature = (p: OrbProfile) =>
    JSON.stringify({
      primaryColor: p.primaryColor,
      secondaryColors: p.secondaryColors,
      accentColor: p.accentColor,
      layerCount: p.layerCount,
      geometryDetail: p.geometryDetail,
      level: p.computedFrom.level,
      seed: p.seed,
    });

  // Compute seed
  const seed = useMemo(() => user?.id ? hashUserId(user.id) : 0, [user?.id]);

  // Detect missing data for diagnostic state
  const diagnosticInfo = useMemo((): { state: DiagnosticState; missedFields: string[] } => {
    if (!user?.id) return { state: 'no_user', missedFields: ['user_id'] };
    
    const missed: string[] = [];
    const hasProfileData = profileData.hobbies.length > 0 || !!profileData.decisionStyle || !!profileData.conflictStyle;
    const hasSummary = !!summaryRow;
    const hasGameProgress = (gameState?.level || 1) > 1;
    
    if (!hasProfileData) missed.push('hobbies', 'decisionStyle', 'conflictStyle', 'priorities');
    if (!hasSummary) missed.push('launchpad_summary');
    if (!hasGameProgress) missed.push('game_state_level');
    if (!profileData.traits.length && !summarySignals.traits?.length) missed.push('traits');
    
    const hasAtLeastOne = hasProfileData || hasSummary || hasGameProgress;
    return { 
      state: hasAtLeastOne ? 'ok' : 'missing_data', 
      missedFields: missed 
    };
  }, [user?.id, profileData, summaryRow, gameState?.level, summarySignals.traits]);

  // FULL DNA: Compute profile from all user signals + seed
  const computedProfile = useMemo((): OrbProfile => {
    if (!user?.id) return DEFAULT_ORB_PROFILE;

    const level = gameState?.level || 1;
    const streak = gameState?.sessionStreak || 0;
    const experience = gameState?.experience || 0;

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
      seed,
      userId: user.id,
      // Pass intake data for Visual DNA
      step1Intention: progress?.step_1_intention as unknown as Record<string, unknown> | null,
      step2ProfileData: progress?.step_2_profile_data as Record<string, unknown> | null,
      summaryRow: summaryRow ? {
        clarity_score: summaryRow.clarity_score,
        consciousness_score: summaryRow.consciousness_score,
        transformation_readiness: summaryRow.transformation_readiness,
        summary_data: summaryRow.summary_data as Record<string, unknown> | null,
      } : null,
    };

    const profile = generateOrbProfile(input);
    
    // Apply diagnostic state
    profile.diagnosticState = diagnosticInfo.state;
    profile.missedFields = diagnosticInfo.missedFields;
    
    // If missing data, apply grayscale + low particles
    if (diagnosticInfo.state === 'missing_data') {
      profile.primaryColor = '0 0% 45%';
      profile.secondaryColors = ['0 0% 55%', '0 0% 35%'];
      profile.accentColor = '0 0% 60%';
      profile.particleColor = '0 0% 50%';
      profile.particleCount = Math.min(5, profile.particleCount);
      profile.particleEnabled = profile.particleCount > 0;
    }

    // Debug logging
    if (isOrbDebug()) {
      console.group('[ORB_DEBUG] Profile Computed');
      console.log('User ID:', user.id);
      console.log('Seed:', seed);
      console.log('Diagnostic:', diagnosticInfo.state, diagnosticInfo.missedFields);
      console.log('Input:', input);
      console.log('Output:', profile);
      console.groupEnd();
    }

    return profile;
  }, [user?.id, profileData, summarySignals, summaryRow, gameState?.level, gameState?.sessionStreak, gameState?.experience, gameState?.activeEgoState, seed, diagnosticInfo]);

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

  // Auto-save when profile changes significantly
  useEffect(() => {
    if (!user?.id || isLoading || saveProfileMutation.isPending) return;

    // Check RAW DB data for visualDNA bucket — the key detection
    const rawHasVisualDNA = !!(storedProfile as OrbProfile & { _rawHasVisualDNA?: boolean })?._rawHasVisualDNA;
    const storedLacksVisualDNA = !!storedProfile && !rawHasVisualDNA;

    // Debug: log what the DB actually has
    if (isOrbDebug()) {
      console.log('[ORB_DB_CHECK] rawHasVisualDNA:', rawHasVisualDNA, 'storedLacksVisualDNA:', storedLacksVisualDNA);
      console.log('[ORB_DB_CHECK] computedProfile.gradientStops:', computedProfile.gradientStops);
      console.log('[ORB_DB_CHECK] computedProfile.materialType:', computedProfile.materialType);
    }

    // If stored profile exists but lacks visual DNA, force-save immediately (bypass all gates)
    if (storedLacksVisualDNA) {
      if (isOrbDebug()) console.log('[ORB_DB_FIX] Force-saving visual DNA to DB');
      lastSavedRef.current = { signature: 'force-visual-dna', at: Date.now() };
      saveProfileMutation.mutate(computedProfile);
      return;
    }

    // Normal save logic: check if significant data exists
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
      storedProfile.computedFrom.level !== computedProfile.computedFrom.level ||
      storedProfile.seed !== computedProfile.seed;

    if (!needsUpdate) return;

    const signature = profileSignature(computedProfile);
    const now = Date.now();
    const last = lastSavedRef.current;
    if (last && last.signature === signature && now - last.at < 5000) return;

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
    seed,
    diagnosticState: diagnosticInfo.state,
    missedFields: diagnosticInfo.missedFields,
  };
}

export function useOrbProfileComputed() {
  const { user } = useAuth();
  const { gameState } = useGameState();
  const { progress } = useLaunchpadProgress();

  const profileData = useMemo(() => {
    return extractProfileData(progress?.step_2_profile_data as Record<string, unknown> | null);
  }, [progress?.step_2_profile_data]);

  const seed = useMemo(() => user?.id ? hashUserId(user.id) : 0, [user?.id]);

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
      seed,
      userId: user.id,
    });
  }, [user?.id, profileData, gameState?.activeEgoState, gameState?.level, gameState?.sessionStreak, gameState?.experience, seed]);
}
