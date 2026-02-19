/**
 * Hook to manage business orb profiles
 * Generates and caches visual DNA for each business
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  generateBusinessOrbProfile, 
  type BusinessOrbProfile,
  INDUSTRY_PALETTES 
} from '@/lib/businessOrbSystem';
import type { OrbProfile } from '@/components/orb/types';

// Default business orb profile
import { VISUAL_DEFAULTS } from '@/components/orb/types';

export const DEFAULT_BUSINESS_ORB_PROFILE: OrbProfile = {
  ...VISUAL_DEFAULTS,
  primaryColor: INDUSTRY_PALETTES.other.primary,
  secondaryColors: [INDUSTRY_PALETTES.other.secondary],
  accentColor: INDUSTRY_PALETTES.other.accent,
  morphIntensity: 0.15,
  morphSpeed: 0.7,
  fractalOctaves: 4,
  coreIntensity: 0.7,
  coreSize: 0.25,
  layerCount: 2,
  geometryDetail: 4,
  particleEnabled: false,
  particleCount: 30,
  particleColor: INDUSTRY_PALETTES.other.glow,
  motionSpeed: 1.0,
  pulseRate: 1.0,
  smoothness: 0.6,
  textureType: 'flowing',
  textureIntensity: 0.5,
  computedFrom: {
    egoState: 'guardian',
    level: 1,
    streak: 0,
    clarityScore: 0,
  },
};

/**
 * Convert BusinessOrbProfile to OrbProfile for rendering
 */
function businessToOrbProfile(bp: BusinessOrbProfile): OrbProfile {
  return {
    ...VISUAL_DEFAULTS,
    primaryColor: bp.primaryColor,
    secondaryColors: bp.secondaryColors,
    accentColor: bp.accentColor,
    morphIntensity: bp.morphIntensity,
    morphSpeed: bp.morphSpeed,
    fractalOctaves: Math.max(3, bp.geometryDetail),
    coreIntensity: 0.6 + (bp.maturity / 100) * 0.3,
    coreSize: 0.2 + (bp.maturity / 100) * 0.15,
    layerCount: bp.maturity >= 50 ? 3 : 2,
    geometryDetail: bp.geometryDetail,
    particleEnabled: bp.particleEnabled,
    particleCount: bp.particleCount,
    particleColor: bp.glowColor,
    motionSpeed: bp.morphSpeed,
    pulseRate: 0.8 + (bp.maturity / 100) * 0.4,
    smoothness: 0.6,
    textureType: 'flowing',
    textureIntensity: 0.5,
    computedFrom: {
      egoState: 'explorer',
      level: Math.ceil(bp.maturity / 10),
      streak: 0,
      clarityScore: bp.maturity,
    },
  };
}

interface BusinessJourneyData {
  id: string;
  business_name: string | null;
  current_step: number;
  journey_complete: boolean;
  step_1_vision: unknown;
  step_2_business_model: unknown;
}

interface StoredBusinessOrbProfile {
  id: string;
  business_id: string;
  primary_color: string;
  secondary_colors: string[];
  accent_color: string;
  morph_intensity: number;
  morph_speed: number;
  geometry_detail: number;
  particle_enabled: boolean;
  particle_count: number;
  computed_from: Record<string, unknown>;
}

/**
 * Hook to get and manage a single business orb profile
 */
export function useBusinessOrbProfile(businessId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch the business journey data
  const { data: journeyData, isLoading: journeyLoading } = useQuery({
    queryKey: ['business-journey', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('business_journeys')
        .select('id, business_name, current_step, journey_complete, step_1_vision, step_2_business_model')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data as BusinessJourneyData;
    },
    enabled: !!businessId && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch stored orb profile
  const { data: storedProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['business-orb-profile', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('business_orb_profiles')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as StoredBusinessOrbProfile | null;
    },
    enabled: !!businessId && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Compute profile from journey data
  const computedProfile = useMemo((): OrbProfile => {
    if (!journeyData) return DEFAULT_BUSINESS_ORB_PROFILE;
    
    const businessProfile = generateBusinessOrbProfile(journeyData);
    return businessToOrbProfile(businessProfile);
  }, [journeyData]);

  // Convert stored profile to OrbProfile
  const parsedStoredProfile = useMemo((): OrbProfile | null => {
    if (!storedProfile) return null;
    
    return {
      ...VISUAL_DEFAULTS,
      primaryColor: storedProfile.primary_color,
      secondaryColors: storedProfile.secondary_colors || [],
      accentColor: storedProfile.accent_color,
      morphIntensity: storedProfile.morph_intensity,
      morphSpeed: storedProfile.morph_speed || 0.7,
      fractalOctaves: storedProfile.geometry_detail,
      coreIntensity: 0.7,
      coreSize: 0.25,
      layerCount: 2,
      geometryDetail: storedProfile.geometry_detail,
      particleEnabled: storedProfile.particle_enabled,
      particleCount: storedProfile.particle_count,
      particleColor: storedProfile.secondary_colors?.[0] || storedProfile.primary_color,
      motionSpeed: 1.0,
      pulseRate: 1.0,
      smoothness: 0.6,
      textureType: 'flowing',
      textureIntensity: 0.5,
      computedFrom: {
        egoState: (storedProfile.computed_from?.egoState as string) || 'explorer',
        level: (storedProfile.computed_from?.level as number) || 1,
        streak: 0,
        clarityScore: (storedProfile.computed_from?.maturity as number) || 0,
      },
    };
  }, [storedProfile]);

  // Mutation to save profile
  const saveProfileMutation = useMutation({
    mutationFn: async (profile: OrbProfile) => {
      if (!businessId || !user?.id) throw new Error('Missing IDs');
      
      const { error } = await supabase
        .from('business_orb_profiles')
        .upsert({
          business_id: businessId,
          primary_color: profile.primaryColor,
          secondary_colors: profile.secondaryColors,
          accent_color: profile.accentColor,
          morph_intensity: profile.morphIntensity,
          morph_speed: profile.morphSpeed,
          geometry_detail: profile.geometryDetail,
          particle_enabled: profile.particleEnabled,
          particle_count: profile.particleCount,
          computed_from: {
            ...profile.computedFrom,
            maturity: profile.computedFrom.clarityScore,
          },
        }, { onConflict: 'business_id' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-orb-profile', businessId] });
    },
  });

  // Use stored profile if available, otherwise computed
  const profile = parsedStoredProfile || computedProfile;

  return {
    profile,
    computedProfile,
    storedProfile: parsedStoredProfile,
    journeyData,
    isLoading: journeyLoading || profileLoading,
    saveProfile: saveProfileMutation.mutate,
    isSaving: saveProfileMutation.isPending,
  };
}

/**
 * Hook to get all business orb profiles for a user
 */
export function useAllBusinessOrbProfiles() {
  const { user } = useAuth();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['user-business-journeys', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('business_journeys')
        .select('id, business_name, current_step, journey_complete, step_1_vision, step_2_business_model')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BusinessJourneyData[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Generate profiles for all businesses
  const profiles = useMemo(() => {
    if (!businesses) return [];
    
    return businesses.map(biz => ({
      businessId: biz.id,
      businessName: biz.business_name,
      profile: businessToOrbProfile(generateBusinessOrbProfile(biz)),
    }));
  }, [businesses]);

  return {
    profiles,
    isLoading,
    hasBusinesses: (businesses?.length || 0) > 0,
  };
}
