/**
 * Orb Profile Generator - Dynamic Identity-Based Avatar System
 * 
 * Generates personalized orb profiles based on user's actual identity data:
 * - Hobbies and interests
 * - Behavioral patterns
 * - Character traits
 * - Life priorities
 * - Level and XP progression
 */

import { computeAvatarDNA, type UserDataForDNA, type AvatarDNA } from './avatarDNA';
import { getArchetype, type ArchetypeId } from './archetypes';

export interface OrbProfile {
  // Colors
  primaryColor: string;
  secondaryColors: string[];
  accentColor: string;
  
  // Animation
  morphIntensity: number;
  morphSpeed: number;
  fractalOctaves: number;
  
  // Core
  coreIntensity: number;
  coreSize: number;
  
  // Geometry
  layerCount: number;
  geometryDetail: number;
  
  // Particles
  particleEnabled: boolean;
  particleCount: number;
  particleColor: string;
  
  // Motion profile
  motionSpeed: number;
  pulseRate: number;
  smoothness: number;
  
  // Texture
  textureType: string;
  textureIntensity: number;
  
  // Computed from data
  computedFrom: {
    dominantArchetype: ArchetypeId;
    secondaryArchetype: ArchetypeId | null;
    archetypeWeights: { id: ArchetypeId; weight: number }[];
    level: number;
    streak: number;
    dominantHobbies: string[];
    clarityScore: number;
    // Legacy compatibility
    egoState?: string;
    topTraitCategories?: string[];
  };
}

export const DEFAULT_ORB_PROFILE: OrbProfile = {
  primaryColor: '200 80% 50%',
  secondaryColors: ['220 70% 55%', '180 75% 60%'],
  accentColor: '180 75% 60%',
  morphIntensity: 0.5,
  morphSpeed: 0.8,
  fractalOctaves: 3,
  coreIntensity: 0.7,
  coreSize: 0.25,
  layerCount: 2,
  geometryDetail: 4,
  particleEnabled: false,
  particleCount: 0,
  particleColor: '200 80% 50%',
  motionSpeed: 1.0,
  pulseRate: 1.0,
  smoothness: 0.6,
  textureType: 'flowing',
  textureIntensity: 0.5,
  computedFrom: {
    dominantArchetype: 'explorer',
    secondaryArchetype: null,
    archetypeWeights: [{ id: 'explorer', weight: 1 }],
    level: 1,
    streak: 0,
    dominantHobbies: [],
    clarityScore: 0,
    egoState: 'guardian',
    topTraitCategories: [],
  },
};

export interface GenerateOrbProfileInput {
  // Profile data from launchpad
  hobbies?: string[];
  decisionStyle?: string;
  conflictStyle?: string;
  problemSolvingStyle?: string;
  
  // Identity elements
  selectedTraitIds?: string[];
  
  // Life priorities
  priorities?: string[];
  
  // Game state
  level?: number;
  experience?: number;
  streak?: number;
  
  // Aurora data
  clarityScore?: number;
  consciousnessScore?: number;
  transformationReadiness?: number;
  
  // Legacy support - will be phased out
  egoState?: string;
}

/**
 * Generate a personalized orb profile from user data
 */
export function generateOrbProfile(input: GenerateOrbProfileInput): OrbProfile {
  // Build user data for DNA computation
  const userData: UserDataForDNA = {
    hobbies: input.hobbies || [],
    decisionStyle: input.decisionStyle,
    conflictStyle: input.conflictStyle,
    problemSolvingStyle: input.problemSolvingStyle,
    traits: input.selectedTraitIds || [],
    priorities: input.priorities || [],
    level: input.level || 1,
    experience: input.experience || 0,
    streak: input.streak || 0,
    clarityScore: input.clarityScore,
  };
  
  // Compute avatar DNA
  const dna = computeAvatarDNA(userData);
  
  // Convert DNA to orb profile
  return dnaToOrbProfile(dna, userData, input.egoState);
}

/**
 * Convert avatar DNA to orb profile
 */
function dnaToOrbProfile(
  dna: AvatarDNA, 
  userData: UserDataForDNA,
  legacyEgoState?: string
): OrbProfile {
  const { archetypeBlend, motionProfile, complexityLevel } = dna;
  const { blendedColors, blendedMorphology, blendedMotion, blendedTexture } = archetypeBlend;
  
  // Calculate geometry detail based on complexity
  const geometryDetail = 2 + complexityLevel;
  
  // Calculate fractal octaves from complexity
  const fractalOctaves = Math.min(6, 2 + complexityLevel);
  
  // Calculate core size and intensity from level
  const level = userData.level || 1;
  const coreSize = 0.2 + Math.min(level, 15) * 0.015;
  const coreIntensity = Math.min(1, 0.6 + (level / 20) * 0.4);
  
  // Calculate morph intensity from morphology blend
  const morphIntensity = 0.3 + blendedMorphology.organicFlow * 0.5 + 
    (1 - blendedMorphology.edgeSharpness) * 0.2;
  
  // Calculate morph speed from motion blend
  const morphSpeed = 0.5 + blendedMotion.baseSpeed * 0.3 + 
    motionProfile.smoothness * 0.2;
  
  // Particle settings
  const particleEnabled = dna.particleCount > 0;
  
  // Streak bonus for intensity
  const streakBonus = Math.min(userData.streak || 0, 30) / 30 * 0.15;
  
  return {
    primaryColor: blendedColors.primary,
    secondaryColors: [blendedColors.secondary, blendedColors.accent],
    accentColor: blendedColors.accent,
    
    morphIntensity: Math.min(1, morphIntensity + streakBonus),
    morphSpeed,
    fractalOctaves,
    
    coreIntensity,
    coreSize,
    
    layerCount: dna.layerCount,
    geometryDetail,
    
    particleEnabled,
    particleCount: dna.particleCount,
    particleColor: blendedColors.accent,
    
    motionSpeed: motionProfile.speed,
    pulseRate: motionProfile.pulseRate,
    smoothness: motionProfile.smoothness,
    
    textureType: blendedTexture.type,
    textureIntensity: dna.textureIntensity,
    
    computedFrom: {
      dominantArchetype: archetypeBlend.dominantArchetype,
      secondaryArchetype: archetypeBlend.secondaryArchetype,
      archetypeWeights: archetypeBlend.archetypes,
      level: userData.level || 1,
      streak: userData.streak || 0,
      dominantHobbies: dna.dominantHobbies,
      clarityScore: userData.clarityScore || 0,
      // Legacy fields
      egoState: legacyEgoState,
      topTraitCategories: userData.traits.slice(0, 3),
    },
  };
}

/**
 * Generate a quick preview profile for non-authenticated users
 */
export function generateDefaultProfile(): OrbProfile {
  return DEFAULT_ORB_PROFILE;
}

/**
 * Get archetype icon for display
 */
export function getArchetypeIcon(archetypeId: ArchetypeId): string {
  return getArchetype(archetypeId).icon;
}

/**
 * Get archetype name for display
 */
export function getArchetypeName(archetypeId: ArchetypeId, isHebrew: boolean): string {
  const archetype = getArchetype(archetypeId);
  return isHebrew ? archetype.nameHe : archetype.name;
}

/**
 * Legacy compatibility: Map old ego state to closest archetype
 * This allows gradual migration from ego states to archetypes
 */
export function egoStateToArchetype(egoState: string): ArchetypeId {
  const mapping: Record<string, ArchetypeId> = {
    guardian: 'healer',
    healer: 'healer',
    mystic: 'mystic',
    visionary: 'creator',
    warrior: 'warrior',
    rebel: 'warrior',
    sage: 'sage',
    creator: 'creator',
    explorer: 'explorer',
    lover: 'healer',
    magician: 'mystic',
    ruler: 'warrior',
    innocent: 'explorer',
    everyman: 'healer',
    hero: 'warrior',
    outlaw: 'warrior',
    jester: 'creator',
    caregiver: 'healer',
  };
  
  return mapping[egoState.toLowerCase()] || 'explorer';
}

/**
 * Interpolate between two orb profiles for smooth transitions
 */
export function interpolateOrbProfiles(
  from: OrbProfile,
  to: OrbProfile,
  t: number
): OrbProfile {
  const lerp = (a: number, b: number) => a + (b - a) * t;
  
  return {
    ...to,
    morphIntensity: lerp(from.morphIntensity, to.morphIntensity),
    morphSpeed: lerp(from.morphSpeed, to.morphSpeed),
    fractalOctaves: Math.round(lerp(from.fractalOctaves, to.fractalOctaves)),
    coreIntensity: lerp(from.coreIntensity, to.coreIntensity),
    coreSize: lerp(from.coreSize, to.coreSize),
    layerCount: Math.round(lerp(from.layerCount, to.layerCount)),
    geometryDetail: Math.round(lerp(from.geometryDetail, to.geometryDetail)),
    particleCount: Math.round(lerp(from.particleCount, to.particleCount)),
    motionSpeed: lerp(from.motionSpeed ?? 1, to.motionSpeed ?? 1),
    pulseRate: lerp(from.pulseRate ?? 1, to.pulseRate ?? 1),
    smoothness: lerp(from.smoothness ?? 0.6, to.smoothness ?? 0.6),
    textureIntensity: lerp(from.textureIntensity ?? 0.5, to.textureIntensity ?? 0.5),
    primaryColor: t < 0.5 ? from.primaryColor : to.primaryColor,
    secondaryColors: t < 0.5 ? from.secondaryColors : to.secondaryColors,
    accentColor: t < 0.5 ? from.accentColor : to.accentColor,
    particleColor: t < 0.5 ? from.particleColor : to.particleColor,
  };
}

/**
 * Convert HEX color to HSL string
 */
export function hexToHsl(hex: string): string {
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
