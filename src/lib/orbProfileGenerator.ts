/**
 * Orb Profile Generator
 * Pure functions to compute orb configuration from user data
 */

import { EGO_STATES, getEgoStateColors } from './egoStates';
import { TRAIT_CATEGORIES, getTrait, TraitCategory } from './characterTraits';

export interface OrbProfile {
  // Colors
  primaryColor: string;
  secondaryColors: string[];
  accentColor: string;
  
  // Morphing configuration
  morphIntensity: number;  // 0-1
  morphSpeed: number;      // 0.5-2
  fractalOctaves: number;  // 2-6
  
  // Core configuration
  coreIntensity: number;   // 0.3-1
  coreSize: number;        // 0.2-0.5
  
  // Layer configuration
  layerCount: number;      // 1-4
  geometryDetail: number;  // 3-6 (icosahedron subdivisions)
  
  // Particle configuration
  particleEnabled: boolean;
  particleCount: number;
  particleColor: string;
  
  // Computed from metadata
  computedFrom: {
    egoState: string;
    level: number;
    streak: number;
    topTraitCategories: string[];
    clarityScore: number;
  };
}

// Default profile for new/unauthenticated users
export const DEFAULT_ORB_PROFILE: OrbProfile = {
  primaryColor: 'hsl(210, 100%, 50%)',
  secondaryColors: ['hsl(200, 100%, 60%)'],
  accentColor: 'hsl(220, 90%, 65%)',
  morphIntensity: 0.15,
  morphSpeed: 1.0,
  fractalOctaves: 3,
  coreIntensity: 0.5,
  coreSize: 0.3,
  layerCount: 1,
  geometryDetail: 4,
  particleEnabled: false,
  particleCount: 0,
  particleColor: 'hsl(210, 100%, 70%)',
  computedFrom: {
    egoState: 'guardian',
    level: 1,
    streak: 0,
    topTraitCategories: [],
    clarityScore: 0,
  },
};

/**
 * Map ego state to primary color palette
 */
export function getEgoStatePrimaryColor(egoState: string): string {
  const colors = getEgoStateColors(egoState);
  return colors.primary;
}

/**
 * Calculate dominant trait categories from selected trait IDs
 */
export function calculateDominantTraitCategories(
  selectedTraitIds: string[]
): { category: TraitCategory; count: number; color: string }[] {
  const categoryCount: Record<TraitCategory, number> = {
    inner_strength: 0,
    thinking: 0,
    heart: 0,
    leadership: 0,
    social: 0,
    spiritual: 0,
  };

  selectedTraitIds.forEach((id) => {
    const trait = getTrait(id);
    if (trait) {
      categoryCount[trait.category]++;
    }
  });

  return (Object.entries(categoryCount) as [TraitCategory, number][])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({
      category,
      count,
      color: TRAIT_CATEGORIES[category].color,
    }));
}

/**
 * Convert HEX color to HSL string
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
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

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Calculate layer count based on level
 */
export function calculateLayerCount(level: number): number {
  if (level >= 10) return 4;
  if (level >= 7) return 3;
  if (level >= 4) return 2;
  return 1;
}

/**
 * Calculate geometry detail (icosahedron subdivisions) based on level
 */
export function calculateGeometryDetail(level: number): number {
  if (level >= 10) return 6;
  if (level >= 7) return 5;
  if (level >= 4) return 4;
  return 3;
}

/**
 * Calculate morph intensity based on consciousness/clarity score
 */
export function calculateMorphIntensity(clarityScore: number): number {
  // Higher clarity = smoother, more focused movement
  const baseIntensity = 0.12;
  const maxIntensity = 0.25;
  const normalized = Math.min(clarityScore / 100, 1);
  
  // Inverse relationship - higher clarity = lower chaos
  return baseIntensity + (1 - normalized) * (maxIntensity - baseIntensity);
}

/**
 * Calculate morph speed based on transformation readiness
 */
export function calculateMorphSpeed(transformationReadiness: number): number {
  const baseSpeed = 0.8;
  const maxSpeed = 1.8;
  const normalized = Math.min(transformationReadiness / 100, 1);
  
  return baseSpeed + normalized * (maxSpeed - baseSpeed);
}

/**
 * Calculate particle count based on streak
 */
export function calculateParticleCount(streak: number): number {
  if (streak === 0) return 0;
  return Math.min(streak * 3, 50); // Cap at 50 particles
}

/**
 * Calculate core intensity based on consciousness score
 */
export function calculateCoreIntensity(consciousnessScore: number): number {
  const baseIntensity = 0.3;
  const maxIntensity = 1.0;
  const normalized = Math.min(consciousnessScore / 100, 1);
  
  return baseIntensity + normalized * (maxIntensity - baseIntensity);
}

/**
 * Calculate fractal octaves based on level
 */
export function calculateFractalOctaves(level: number): number {
  if (level >= 10) return 6;
  if (level >= 7) return 5;
  if (level >= 4) return 4;
  return 3;
}

export interface GenerateOrbProfileInput {
  egoState: string;
  level: number;
  experience: number;
  streak: number;
  selectedTraitIds: string[];
  clarityScore: number;
  consciousnessScore: number;
  transformationReadiness: number;
}

/**
 * Generate complete orb profile from user data
 */
export function generateOrbProfile(input: GenerateOrbProfileInput): OrbProfile {
  const {
    egoState = 'guardian',
    level = 1,
    streak = 0,
    selectedTraitIds = [],
    clarityScore = 0,
    consciousnessScore = 0,
    transformationReadiness = 50,
  } = input;

  // Get ego state colors
  const egoColors = getEgoStateColors(egoState);
  const primaryColor = egoColors.primary;
  const accentColor = egoColors.accent;

  // Calculate dominant trait categories
  const dominantCategories = calculateDominantTraitCategories(selectedTraitIds);
  
  // Get secondary colors from top 2-3 trait categories
  const secondaryColors = dominantCategories
    .slice(0, 3)
    .map((cat) => hexToHsl(cat.color));
  
  // If no traits selected, use ego state secondary color
  if (secondaryColors.length === 0) {
    secondaryColors.push(egoColors.secondary);
  }

  // Particle color from dominant trait or ego state
  const particleColor = dominantCategories.length > 0
    ? hexToHsl(dominantCategories[0].color)
    : egoColors.glow;

  // Calculate all parameters
  const morphIntensity = calculateMorphIntensity(clarityScore);
  const morphSpeed = calculateMorphSpeed(transformationReadiness);
  const fractalOctaves = calculateFractalOctaves(level);
  const coreIntensity = calculateCoreIntensity(consciousnessScore);
  const coreSize = 0.2 + Math.min(level * 0.02, 0.3);
  const layerCount = calculateLayerCount(level);
  const geometryDetail = calculateGeometryDetail(level);
  const particleEnabled = streak > 0;
  const particleCount = calculateParticleCount(streak);

  return {
    primaryColor,
    secondaryColors,
    accentColor,
    morphIntensity,
    morphSpeed,
    fractalOctaves,
    coreIntensity,
    coreSize,
    layerCount,
    geometryDetail,
    particleEnabled,
    particleCount,
    particleColor,
    computedFrom: {
      egoState,
      level,
      streak,
      topTraitCategories: dominantCategories.slice(0, 3).map((c) => c.category),
      clarityScore,
    },
  };
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
    primaryColor: t < 0.5 ? from.primaryColor : to.primaryColor,
    secondaryColors: t < 0.5 ? from.secondaryColors : to.secondaryColors,
    accentColor: t < 0.5 ? from.accentColor : to.accentColor,
    morphIntensity: lerp(from.morphIntensity, to.morphIntensity),
    morphSpeed: lerp(from.morphSpeed, to.morphSpeed),
    fractalOctaves: Math.round(lerp(from.fractalOctaves, to.fractalOctaves)),
    coreIntensity: lerp(from.coreIntensity, to.coreIntensity),
    coreSize: lerp(from.coreSize, to.coreSize),
    layerCount: Math.round(lerp(from.layerCount, to.layerCount)),
    geometryDetail: Math.round(lerp(from.geometryDetail, to.geometryDetail)),
    particleEnabled: to.particleEnabled,
    particleCount: Math.round(lerp(from.particleCount, to.particleCount)),
    particleColor: t < 0.5 ? from.particleColor : to.particleColor,
    computedFrom: to.computedFrom,
  };
}
