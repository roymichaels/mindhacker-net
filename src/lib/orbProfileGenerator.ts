/**
 * Orb Profile Generator - Dynamic Identity-Based Avatar System
 * 
 * Generates personalized orb profiles based on user's actual identity data.
 * Now includes deterministic per-user seed for structural variance.
 */

import { computeAvatarDNA, type UserDataForDNA, type AvatarDNA } from './avatarDNA';
import { getArchetype, type ArchetypeId } from './archetypes';
import { hashUserId, seedHueOffset, seedFloat, seedInt, pickGeometryFamily, seedMorphPhase } from './orbSeed';
import { buildVisualDNA, type VisualDNAInput } from './visualDNA';
import type { OrbProfile } from '@/components/orb/types';
import { VISUAL_DEFAULTS } from '@/components/orb/types';

export type { OrbProfile };

export const DEFAULT_ORB_PROFILE: OrbProfile = {
  ...VISUAL_DEFAULTS,
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
  diagnosticState: 'no_user',
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
  hobbies?: string[];
  decisionStyle?: string;
  conflictStyle?: string;
  problemSolvingStyle?: string;
  selectedTraitIds?: string[];
  priorities?: string[];
  level?: number;
  experience?: number;
  streak?: number;
  clarityScore?: number;
  consciousnessScore?: number;
  transformationReadiness?: number;
  egoState?: string;
  seed?: number;
  userId?: string;
  // Visual DNA intake data
  step1Intention?: Record<string, unknown> | null;
  step2ProfileData?: Record<string, unknown> | null;
  summaryRow?: VisualDNAInput['summaryRow'];
}

/** Apply seed-based hue offset to an HSL color string */
function applyHueOffset(hslStr: string, offset: number): string {
  const match = hslStr.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!match) return hslStr;
  const h = (parseInt(match[1]) + offset + 360) % 360;
  return `${h} ${match[2]}% ${match[3]}%`;
}

/**
 * Generate a personalized orb profile from user data
 */
export function generateOrbProfile(input: GenerateOrbProfileInput): OrbProfile {
  const seed = input.seed ?? (input.userId ? hashUserId(input.userId) : 0);
  
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
  
  const dna = computeAvatarDNA(userData);
  const baseProfile = dnaToOrbProfile(dna, userData, seed, input.egoState);
  
  // Merge Visual DNA from ALL intake signals
  const visualDNA = buildVisualDNA({
    step1Intention: input.step1Intention,
    step2ProfileData: input.step2ProfileData,
    summaryRow: input.summaryRow,
    gameState: { level: input.level, sessionStreak: input.streak, experience: input.experience },
    seed,
  });
  
  // Visual DNA overrides the base archetype profile
  return { ...baseProfile, ...visualDNA };
}

/**
 * Convert avatar DNA to orb profile with WIDENED ranges and seed-based variance
 */
function dnaToOrbProfile(
  dna: AvatarDNA, 
  userData: UserDataForDNA,
  seed: number,
  legacyEgoState?: string
): OrbProfile {
  const { archetypeBlend, motionProfile, complexityLevel } = dna;
  const { blendedColors, blendedMorphology, blendedMotion, blendedTexture } = archetypeBlend;
  
  // Seed-based offsets
  const hueOffset = seedHueOffset(seed);
  const geometryFamily = pickGeometryFamily(archetypeBlend.dominantArchetype, seed);
  
  // Apply hue offset to all colors
  const primaryColor = applyHueOffset(blendedColors.primary, hueOffset);
  const secondaryColor = applyHueOffset(blendedColors.secondary, hueOffset);
  const accentColor = applyHueOffset(blendedColors.accent, hueOffset);
  
  // WIDENED geometry detail: 2-6
  const geometryDetail = Math.min(6, 2 + complexityLevel);
  
  // WIDENED fractal octaves: 2-6
  const fractalOctaves = Math.min(6, 2 + complexityLevel);
  
  const level = userData.level || 1;
  const coreSize = 0.2 + Math.min(level, 15) * 0.015;
  const coreIntensity = Math.min(1, 0.6 + (level / 20) * 0.4);
  
  // WIDENED morphIntensity: 0.15–0.95
  const rawMorph = 0.15 + blendedMorphology.organicFlow * 0.5 + 
    (1 - blendedMorphology.edgeSharpness) * 0.3;
  const morphIntensity = Math.min(0.95, rawMorph + seedFloat(seed, 1) * 0.15);
  
  // WIDENED morphSpeed
  const morphSpeed = 0.5 + blendedMotion.baseSpeed * 0.4 + 
    motionProfile.smoothness * 0.3 + seedFloat(seed, 2) * 0.2;
  
  // WIDENED motionSpeed: 0.5–2.2
  const motionSpeed = Math.max(0.5, Math.min(2.2, 
    motionProfile.speed * (1 + seedFloat(seed, 3) * 0.3)
  ));
  
  // WIDENED pulseRate: 0.4–2.8
  const pulseRate = Math.max(0.4, Math.min(2.8, 
    motionProfile.pulseRate * (1 + seedFloat(seed, 4) * 0.4)
  ));
  
  // WIDENED layerCount: 1–5
  const layerCount = Math.min(5, dna.layerCount + seedInt(seed, 5, 0, 1));
  
  // WIDENED particleCount: 0–120
  const particleCount = Math.min(120, dna.particleCount + seedInt(seed, 6, 0, 20));
  
  const particleEnabled = particleCount > 0;
  
  // Texture type influenced by seed + archetype
  const textureTypes = ['flowing', 'crystalline', 'ethereal', 'electric', 'plasma', 'nebula'];
  const textureIdx = seedInt(seed, 7, 0, textureTypes.length - 1);
  const textureType = blendedTexture?.type || textureTypes[textureIdx];
  
  // Streak bonus
  const streakBonus = Math.min(userData.streak || 0, 30) / 30 * 0.15;
  
  // Smoothness with seed variance
  const smoothness = Math.max(0.2, Math.min(0.95, 
    motionProfile.smoothness + seedFloat(seed, 8) * 0.15
  ));

  return {
    ...VISUAL_DEFAULTS,
    primaryColor,
    secondaryColors: [secondaryColor, accentColor],
    accentColor,
    morphIntensity: Math.min(0.95, morphIntensity + streakBonus),
    morphSpeed,
    fractalOctaves,
    coreIntensity,
    coreSize,
    layerCount,
    geometryDetail,
    particleEnabled,
    particleCount,
    particleColor: accentColor,
    motionSpeed,
    pulseRate,
    smoothness,
    textureType,
    textureIntensity: dna.textureIntensity + seedFloat(seed, 9) * 0.1,
    seed,
    geometryFamily,
    diagnosticState: 'ok',
    computedFrom: {
      dominantArchetype: archetypeBlend.dominantArchetype,
      secondaryArchetype: archetypeBlend.secondaryArchetype,
      archetypeWeights: archetypeBlend.archetypes,
      level: userData.level || 1,
      streak: userData.streak || 0,
      dominantHobbies: dna.dominantHobbies,
      clarityScore: userData.clarityScore || 0,
      egoState: legacyEgoState,
      topTraitCategories: userData.traits.slice(0, 3),
    },
  };
}

export function generateDefaultProfile(): OrbProfile {
  return DEFAULT_ORB_PROFILE;
}

export function getArchetypeIcon(archetypeId: ArchetypeId): string {
  return getArchetype(archetypeId).icon;
}

export function getArchetypeName(archetypeId: ArchetypeId, isHebrew: boolean): string {
  const archetype = getArchetype(archetypeId);
  return isHebrew ? archetype.nameHe : archetype.name;
}

export function egoStateToArchetype(egoState: string): ArchetypeId {
  const mapping: Record<string, ArchetypeId> = {
    guardian: 'healer', healer: 'healer', mystic: 'mystic',
    visionary: 'creator', warrior: 'warrior', rebel: 'warrior',
    sage: 'sage', creator: 'creator', explorer: 'explorer',
    lover: 'healer', magician: 'mystic', ruler: 'warrior',
    innocent: 'explorer', everyman: 'healer', hero: 'warrior',
    outlaw: 'warrior', jester: 'creator', caregiver: 'healer',
  };
  return mapping[egoState.toLowerCase()] || 'explorer';
}

/**
 * Lerp an HSL string "H S% L%" component-wise
 */
function lerpHsl(a: string, b: string, t: number): string {
  const parseHsl = (s: string) => {
    const m = s.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?/);
    if (!m) return [200, 80, 50];
    return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
  };
  const [h1, s1, l1] = parseHsl(a);
  const [h2, s2, l2] = parseHsl(b);
  // Shortest-path hue interpolation
  let dh = h2 - h1;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const h = ((h1 + dh * t) % 360 + 360) % 360;
  const s = s1 + (s2 - s1) * t;
  const l = l1 + (l2 - l1) * t;
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function lerpHslArray(a: string[], b: string[], t: number): string[] {
  const maxLen = Math.max(a.length, b.length);
  const result: string[] = [];
  for (let i = 0; i < maxLen; i++) {
    const ca = a[Math.min(i, a.length - 1)];
    const cb = b[Math.min(i, b.length - 1)];
    result.push(lerpHsl(ca, cb, t));
  }
  return result;
}

function lerpMaterialParams(
  a: OrbProfile['materialParams'],
  b: OrbProfile['materialParams'],
  t: number
): OrbProfile['materialParams'] {
  const lerp = (x: number, y: number) => x + (y - x) * t;
  return {
    metalness: lerp(a.metalness, b.metalness),
    roughness: lerp(a.roughness, b.roughness),
    clearcoat: lerp(a.clearcoat, b.clearcoat),
    transmission: lerp(a.transmission, b.transmission),
    ior: lerp(a.ior, b.ior),
    emissiveIntensity: lerp(a.emissiveIntensity, b.emissiveIntensity),
  };
}

/**
 * Interpolate between two orb profiles for smooth transitions.
 * Colors are lerped in HSL space; enums snap at t=0.5; geometry snaps at t=1.
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
    // Smooth HSL color lerping
    primaryColor: lerpHsl(from.primaryColor, to.primaryColor, t),
    secondaryColors: lerpHslArray(from.secondaryColors, to.secondaryColors, t),
    accentColor: lerpHsl(from.accentColor, to.accentColor, t),
    particleColor: lerpHsl(from.particleColor, to.particleColor, t),
    // Geometry snaps at end of transition (handled by morph hook)
    geometryFamily: t < 1 ? from.geometryFamily : to.geometryFamily,
    seed: to.seed,
    // Smooth numeric lerp
    bloomStrength: lerp(from.bloomStrength, to.bloomStrength),
    chromaShift: lerp(from.chromaShift, to.chromaShift),
    dayNightBias: lerp(from.dayNightBias, to.dayNightBias),
    patternIntensity: lerp(from.patternIntensity, to.patternIntensity),
    // Smooth color lerps
    gradientStops: lerpHslArray(from.gradientStops, to.gradientStops, t),
    coreGradient: [
      lerpHsl(from.coreGradient[0], to.coreGradient[0], t),
      lerpHsl(from.coreGradient[1], to.coreGradient[1], t),
    ] as [string, string],
    rimLightColor: lerpHsl(from.rimLightColor, to.rimLightColor, t),
    // Smooth material params lerp
    materialParams: lerpMaterialParams(from.materialParams, to.materialParams, t),
    // Enums snap at 0.5
    gradientMode: t < 0.5 ? from.gradientMode : to.gradientMode,
    materialType: t < 0.5 ? from.materialType : to.materialType,
    patternType: t < 0.5 ? from.patternType : to.patternType,
    particlePalette: lerpHslArray(from.particlePalette, to.particlePalette, t),
    particleMode: t < 0.5 ? from.particleMode : to.particleMode,
    particleBehavior: t < 0.5 ? from.particleBehavior : to.particleBehavior,
  };
}

export function hexToHsl(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
