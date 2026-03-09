/**
 * userOrbGenerator.ts — Generates a user's personal orb using the new gallery-quality
 * renderer, driven by their identity traits from onboarding.
 *
 * Merges the old DNA thread system (trait → color/animation mappings) with the new
 * gallery orb generator (hueProfile-style materials/geometries) so every user orb
 * looks as polished as the collection orbs while being uniquely theirs.
 */

import type { OrbProfile, MaterialType, PatternType, GeometryFamily } from '@/components/orb/types';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import { VISUAL_DEFAULTS } from '@/components/orb/types';
import type { ArchetypeId } from '@/lib/archetypes';
import { hashUserId, seedFloat, seedInt, seedHueOffset } from '@/lib/orbSeed';

// ─── Trait → Visual Mappings ───

/** Each archetype maps to a primary material + fallback + preferred geometry */
const ARCHETYPE_VISUALS: Record<ArchetypeId, {
  materials: MaterialType[];
  geometries: GeometryFamily[];
  patterns: PatternType[];
  hueRange: [number, number]; // base hue range
  intensityBias: number; // 0-1
}> = {
  warrior: {
    materials: ['metal', 'obsidian', 'ember', 'lava'],
    geometries: ['octa', 'spiky', 'tetra', 'cube'],
    patterns: ['shards', 'fractal', 'strata'],
    hueRange: [0, 35],
    intensityBias: 0.75,
  },
  sage: {
    materials: ['crystal', 'ice', 'glass', 'holographic'],
    geometries: ['icosa', 'dodeca', 'sphere', 'capsule'],
    patterns: ['cellular', 'fractal', 'voronoi'],
    hueRange: [190, 230],
    intensityBias: 0.6,
  },
  creator: {
    materials: ['iridescent', 'plasma', 'holographic', 'nebula'],
    geometries: ['torus', 'knot', 'dodeca', 'capsule'],
    patterns: ['swirl', 'voronoi', 'fractal'],
    hueRange: [280, 340],
    intensityBias: 0.7,
  },
  mystic: {
    materials: ['nebula', 'void', 'plasma', 'iridescent'],
    geometries: ['dodeca', 'torus', 'sphere', 'knot'],
    patterns: ['voronoi', 'swirl', 'cellular'],
    hueRange: [250, 290],
    intensityBias: 0.65,
  },
  healer: {
    materials: ['glass', 'crystal', 'ice', 'bone'],
    geometries: ['sphere', 'capsule', 'icosa', 'dodeca'],
    patterns: ['cellular', 'swirl', 'strata'],
    hueRange: [130, 180],
    intensityBias: 0.55,
  },
  explorer: {
    materials: ['tiger', 'metal', 'thorny', 'ember'],
    geometries: ['icosa', 'spiky', 'octa', 'knot'],
    patterns: ['fractal', 'shards', 'strata'],
    hueRange: [35, 65],
    intensityBias: 0.7,
  },
};

/** Hobby categories shift the hue */
const HOBBY_HUE_SHIFTS: Record<string, number> = {
  // Physical → warm shift
  'martial-arts': 10, 'gym': 5, 'fitness': 5, 'sports': 15, 'running': 8, 'hiking': 20,
  // Tech → cool shift
  'coding': -20, 'gaming': -15, 'technology': -25, 'robotics': -18, 'crypto': -30,
  // Creative → magenta shift
  'art': 40, 'music': 30, 'writing': 25, 'photography': 35, 'design': 38, 'dance': 45,
  // Spiritual → purple shift
  'meditation': -40, 'yoga': -35, 'tarot': -50, 'philosophy': -45, 'astrology': -55,
  // Social → green shift
  'mentoring': -60, 'teaching': -65, 'volunteering': -70,
  // Nature → green/teal
  'gardening': -80, 'nature': -75, 'travel': -10,
};

/** Decision style → pattern preference */
const DECISION_PATTERN: Record<string, PatternType> = {
  'analytical': 'fractal',
  'intuitive': 'swirl',
  'collaborative': 'cellular',
  'decisive': 'shards',
  'methodical': 'strata',
  'creative': 'voronoi',
};

/** Conflict style → geometry modifier */
const CONFLICT_GEOMETRY: Record<string, GeometryFamily> = {
  'confrontational': 'spiky',
  'avoidant': 'sphere',
  'collaborative': 'dodeca',
  'competitive': 'octa',
  'accommodating': 'capsule',
  'compromising': 'icosa',
};

export interface UserOrbInput {
  userId: string;
  // From onboarding
  hobbies?: string[];
  traits?: string[];
  decisionStyle?: string;
  conflictStyle?: string;
  problemSolvingStyle?: string;
  priorities?: string[];
  egoState?: string;
  // From game state
  level?: number;
  experience?: number;
  streak?: number;
  // From AI summary
  clarityScore?: number;
  consciousnessScore?: number;
  // Computed archetype
  dominantArchetype?: ArchetypeId;
  secondaryArchetype?: ArchetypeId | null;
  archetypeWeights?: { id: ArchetypeId; weight: number }[];
}

function p(overrides: Partial<OrbProfile>): OrbProfile {
  return { ...DEFAULT_ORB_PROFILE, particleEnabled: false, particleCount: 0, ...overrides };
}

/**
 * Generate a gallery-quality OrbProfile from user traits.
 * Uses the same hueProfile approach as generatedOrbs.ts but driven by real user data.
 */
export function generateUserOrb(input: UserOrbInput): OrbProfile {
  const seed = hashUserId(input.userId);
  const archetype = input.dominantArchetype || 'explorer';
  const secondaryArchetype = input.secondaryArchetype || null;
  const vis = ARCHETYPE_VISUALS[archetype];
  const secVis = secondaryArchetype ? ARCHETYPE_VISUALS[secondaryArchetype] : null;

  // ─── 1. Determine base hue from archetype + hobbies ───
  const archetypeHue = vis.hueRange[0] + seedFloat(seed, 10) * (vis.hueRange[1] - vis.hueRange[0]);
  
  // Hobbies shift the hue
  let hobbyShift = 0;
  (input.hobbies || []).forEach((hobby, i) => {
    const shift = HOBBY_HUE_SHIFTS[hobby] || 0;
    hobbyShift += shift * (1 / (i + 1)); // diminishing influence
  });
  
  const baseHue = ((archetypeHue + hobbyShift + seedHueOffset(seed)) + 360) % 360;

  // ─── 2. Material from archetype + seed ───
  const matIdx = seedInt(seed, 20, 0, vis.materials.length - 1);
  let material = vis.materials[matIdx];
  
  // Secondary archetype can influence material (30% chance)
  if (secVis && seedFloat(seed, 21) < 0.3) {
    const secMatIdx = seedInt(seed, 22, 0, secVis.materials.length - 1);
    material = secVis.materials[secMatIdx];
  }

  // ─── 3. Geometry from archetype + conflict style ───
  let geometry: GeometryFamily;
  if (input.conflictStyle && CONFLICT_GEOMETRY[input.conflictStyle]) {
    geometry = CONFLICT_GEOMETRY[input.conflictStyle];
  } else {
    const geoIdx = seedInt(seed, 30, 0, vis.geometries.length - 1);
    geometry = vis.geometries[geoIdx];
  }

  // ─── 4. Pattern from decision style or archetype ───
  let pattern: PatternType;
  if (input.decisionStyle && DECISION_PATTERN[input.decisionStyle]) {
    pattern = DECISION_PATTERN[input.decisionStyle];
  } else {
    const patIdx = seedInt(seed, 40, 0, vis.patterns.length - 1);
    pattern = vis.patterns[patIdx];
  }

  // ─── 5. Intensity from level/streak/consciousness ───
  const level = input.level || 1;
  const streak = input.streak || 0;
  const consciousness = input.consciousnessScore || 50;
  
  const levelBoost = Math.min(level, 20) / 20 * 0.2;
  const streakBoost = Math.min(streak, 30) / 30 * 0.15;
  const consciousnessBoost = (consciousness / 100) * 0.15;
  
  const intensity = Math.min(1, Math.max(0.3, 
    vis.intensityBias + levelBoost + streakBoost + consciousnessBoost + (seedFloat(seed, 50) - 0.5) * 0.2
  ));

  // ─── 6. Particles from rarity-like logic ───
  const particleChance = intensity > 0.8 ? 0.8 : intensity > 0.6 ? 0.5 : 0.2;
  const particles = seedFloat(seed, 60) < particleChance;

  // ─── 7. Hue spread from trait diversity ───
  const traitCount = (input.traits?.length || 0) + (input.hobbies?.length || 0);
  const hueSpread = 30 + Math.min(traitCount, 10) * 10 + seedInt(seed, 70, 0, 30);

  // ─── 8. Sat/lit variance from personality ───
  const satBoost = (input.clarityScore || 50) > 60 ? 10 : -5;
  const litBoost = consciousness > 70 ? 8 : consciousness < 30 ? -10 : 0;

  // ─── 9. Build the profile using gallery-quality hueProfile approach ───
  const hue = Math.round(baseHue);
  const h1 = hue;
  const h2 = (hue + hueSpread) % 360;
  const h3 = (hue + hueSpread * 2) % 360;
  const sat = Math.min(98, Math.max(20, 40 + intensity * 55 + satBoost));
  const lit = Math.min(72, Math.max(18, 25 + intensity * 38 + litBoost));

  const metalness = material === 'metal' ? 0.65 + intensity * 0.35
    : material === 'iridescent' ? 0.3 + intensity * 0.25
    : material === 'obsidian' ? 0.7 + intensity * 0.2
    : material === 'plasma' ? 0.08
    : material === 'void' ? 0.9
    : 0.04;
  const roughness = material === 'metal' ? 0.4 - intensity * 0.35
    : material === 'glass' ? 0.12
    : material === 'matte' ? 0.9
    : material === 'bone' ? 0.8
    : material === 'thorny' ? 0.85
    : 0.06;
  const clearcoat = material === 'glass' ? 0.55 + intensity * 0.45
    : material === 'iridescent' ? 0.75 + intensity * 0.25
    : material === 'crystal' ? 0.8 + intensity * 0.2
    : material === 'ice' ? 0.9
    : intensity * 0.4;
  const transmission = material === 'glass' ? 0.3 + intensity * 0.4
    : material === 'crystal' ? 0.2 + intensity * 0.3
    : material === 'ice' ? 0.2 + intensity * 0.2
    : material === 'plasma' ? 0.2 + intensity * 0.3
    : 0;
  const emissive = material === 'plasma' ? 0.4 + intensity * 0.3
    : material === 'lava' ? 0.4 + intensity * 0.3
    : material === 'ember' ? 0.3 + intensity * 0.2
    : material === 'nebula' ? 0.2 + intensity * 0.2
    : material === 'iridescent' ? 0.15 + intensity * 0.2
    : intensity * 0.2;

  const profile = p({
    materialType: material,
    gradientMode: intensity > 0.6 ? 'noise' : intensity > 0.3 ? 'radial' : 'vertical',
    patternType: pattern,
    geometryFamily: geometry,
    bloomStrength: intensity * 0.8,
    chromaShift: intensity * 0.5,
    gradientStops: [
      `${h1} ${sat}% ${lit - 8}%`,
      `${h1} ${Math.min(98, sat + 15)}% ${lit + 12}%`,
      `${h2} ${sat}% ${lit + 22}%`,
      `${h3} ${Math.max(15, sat - 12)}% ${lit + 32}%`,
    ],
    coreGradient: [`${h1} ${sat}% ${lit}%`, `${h2} ${sat}% ${lit + 22}%`],
    rimLightColor: `${h3} ${Math.max(15, sat - 12)}% ${lit + 32}%`,
    primaryColor: `${h1} ${Math.min(98, sat + 15)}% ${lit + 12}%`,
    secondaryColors: [
      `${h1} ${sat}% ${lit}%`,
      `${h2} ${sat}% ${lit + 22}%`,
      `${h3} ${Math.max(20, sat - 8)}% ${lit + 18}%`,
    ],
    accentColor: `${h3} ${Math.max(15, sat - 12)}% ${lit + 32}%`,
    materialParams: {
      metalness, roughness, clearcoat, transmission,
      ior: 1.3 + intensity * 0.7,
      emissiveIntensity: emissive,
    },
    morphIntensity: 0.35 + intensity * 0.55,
    morphSpeed: 0.45 + intensity * 0.75,
    motionSpeed: 0.45 + intensity * 0.85,
    patternIntensity: 0.2 + intensity * 0.6,
    layerCount: Math.round(2 + intensity * 4),
    coreIntensity: 0.35 + intensity * 0.6,
    particleEnabled: particles,
    particleCount: particles ? Math.round(8 + intensity * 22) : 0,
    seed,
    dayNightBias: 0.4 + intensity * 0.3,
    // Preserve DNA metadata
    computedFrom: {
      dominantArchetype: archetype,
      secondaryArchetype: secondaryArchetype,
      archetypeWeights: input.archetypeWeights || [{ id: archetype, weight: 1 }],
      dominantHobbies: (input.hobbies || []).slice(0, 3),
      egoState: input.egoState || 'guardian',
      level,
      streak: streak,
      topTraitCategories: (input.traits || []).slice(0, 3),
      clarityScore: input.clarityScore || 0,
      orb_profile_version: 'gallery-v2',
    },
  });

  return profile;
}
