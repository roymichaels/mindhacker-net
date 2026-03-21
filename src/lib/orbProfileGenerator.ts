/**
 * Orb Profile Generator — PURE VISUAL generator for personalized orbs.
 *
 * ARCHITECTURE RULE:
 *   This module must NOT compute identity (archetype, egoState, traits).
 *   Identity comes ONLY from DNA via mapDNAtoVisual.
 *   This module converts visual parameters → OrbProfile for rendering.
 *
 * Data flow:
 *   DNA (computeDNA) → mapDNAtoVisual → generateOrbProfile (visual) → Orb (render)
 */

import { getArchetype, type ArchetypeId } from './archetypes';
import { generateUserOrb, type UserOrbInput } from './userOrbGenerator';
import { hashUserId } from './orbSeed';
import type { VisualDNAInput } from './visualDNA';
import { dnaArchetypeToVisual } from './mapDNAtoVisual';
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
 * Generate a personalized orb profile from user data.
 *
 * IMPORTANT: Archetype is derived from egoState (which comes from DNA via the caller).
 * This function does NOT independently compute identity.
 */
export function generateOrbProfile(input: GenerateOrbProfileInput): OrbProfile {
  const seed = input.seed ?? (input.userId ? hashUserId(input.userId) : 0);
  
  // Archetype from DNA-provided egoState — NO independent identity computation
  const dominantArchetype = dnaArchetypeToVisual(input.egoState || 'explorer');

  // ─── Delegate to gallery-quality generator ───
  const userOrbInput: UserOrbInput = {
    userId: input.userId || `seed-${seed}`,
    hobbies: input.hobbies,
    traits: input.selectedTraitIds,
    decisionStyle: input.decisionStyle,
    conflictStyle: input.conflictStyle,
    problemSolvingStyle: input.problemSolvingStyle,
    priorities: input.priorities,
    egoState: input.egoState,
    level: input.level,
    experience: input.experience,
    streak: input.streak,
    clarityScore: input.clarityScore,
    consciousnessScore: input.consciousnessScore,
    dominantArchetype,
    secondaryArchetype: null, // DNA provides this if available
    archetypeWeights: [{ id: dominantArchetype, weight: 1 }],
  };
  
  const profile = generateUserOrb(userOrbInput);
  
  return profile;
}

/**
 * @deprecated Use dnaArchetypeToVisual from mapDNAtoVisual instead.
 * Kept for backward compatibility — delegates to the canonical mapping.
 */
export function egoStateToArchetype(egoState: string): ArchetypeId {
  return dnaArchetypeToVisual(egoState);
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
  const lerp = (a: number | undefined | null, b: number | undefined | null, fallback = 0) => {
    const sa = typeof a === 'number' && !isNaN(a) ? a : fallback;
    const sb = typeof b === 'number' && !isNaN(b) ? b : fallback;
    return sa + (sb - sa) * t;
  };
  
  return {
    ...to,
    morphIntensity: lerp(from.morphIntensity, to.morphIntensity),
    morphSpeed: lerp(from.morphSpeed, to.morphSpeed),
    fractalOctaves: Math.round(lerp(from.fractalOctaves, to.fractalOctaves, 4)),
    coreIntensity: lerp(from.coreIntensity, to.coreIntensity, 1),
    coreSize: lerp(from.coreSize, to.coreSize, 0.3),
    layerCount: Math.round(lerp(from.layerCount, to.layerCount, 3)),
    geometryDetail: t < 1 ? from.geometryDetail : to.geometryDetail, // Snap — scene rebuild is destructive
    particleCount: Math.round(lerp(from.particleCount, to.particleCount, 20)),
    motionSpeed: lerp(from.motionSpeed, to.motionSpeed, 1),
    pulseRate: lerp(from.pulseRate, to.pulseRate, 1),
    smoothness: lerp(from.smoothness, to.smoothness, 0.6),
    textureIntensity: lerp(from.textureIntensity, to.textureIntensity, 0.5),
    // Smooth HSL color lerping
    primaryColor: lerpHsl(from.primaryColor, to.primaryColor, t),
    secondaryColors: lerpHslArray(from.secondaryColors, to.secondaryColors, t),
    accentColor: lerpHsl(from.accentColor, to.accentColor, t),
    particleColor: lerpHsl(from.particleColor, to.particleColor, t),
    // Geometry snaps at end of transition (handled by morph hook)
    geometryFamily: t < 1 ? from.geometryFamily : to.geometryFamily,
    seed: to.seed,
    // Smooth numeric lerp — NaN-safe with fallbacks
    bloomStrength: lerp(from.bloomStrength, to.bloomStrength, 0.4),
    chromaShift: lerp(from.chromaShift, to.chromaShift, 0.1),
    dayNightBias: lerp(from.dayNightBias, to.dayNightBias, 0.5),
    patternIntensity: lerp(from.patternIntensity, to.patternIntensity, 0.4),
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
