/**
 * Orb Visual System - Maps user data to visual profiles
 * 
 * SIMPLIFIED: Hobbies + Level + Streak → Color Palette + Morphology
 */

import type { OrbProfile } from '@/components/orb/types';

// ===== COLOR PALETTES =====

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  gradient: string[];
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    primary: '210 80% 55%',
    secondary: '190 70% 50%',
    accent: '230 85% 65%',
    glow: '220 90% 70%',
    gradient: ['210 80% 55%', '190 70% 50%', '230 85% 65%'],
  },
  tech: {
    id: 'tech',
    name: 'Tech',
    primary: '170 80% 45%',
    secondary: '200 75% 50%',
    accent: '150 85% 55%',
    glow: '180 90% 60%',
    gradient: ['170 80% 45%', '200 75% 50%', '150 85% 55%'],
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    primary: '292 85% 55%',
    secondary: '320 75% 50%',
    accent: '270 80% 60%',
    glow: '300 90% 65%',
    gradient: ['292 85% 55%', '320 75% 50%', '270 80% 60%'],
  },
  action: {
    id: 'action',
    name: 'Action',
    primary: '15 90% 55%',
    secondary: '35 85% 50%',
    accent: '0 80% 60%',
    glow: '25 95% 65%',
    gradient: ['15 90% 55%', '35 85% 50%', '0 80% 60%'],
  },
  mystic: {
    id: 'mystic',
    name: 'Mystic',
    primary: '260 80% 55%',
    secondary: '280 75% 50%',
    accent: '240 85% 60%',
    glow: '270 90% 65%',
    gradient: ['260 80% 55%', '280 75% 50%', '240 85% 60%'],
  },
  healing: {
    id: 'healing',
    name: 'Healing',
    primary: '140 70% 45%',
    secondary: '160 65% 50%',
    accent: '120 75% 55%',
    glow: '150 80% 60%',
    gradient: ['140 70% 45%', '160 65% 50%', '120 75% 55%'],
  },
};

// ===== MORPHOLOGY PROFILES =====

export interface MorphologyProfile {
  id: string;
  morphIntensity: number;
  morphSpeed: number;
  fractalOctaves: number;
  coreIntensity: number;
  layerCount: number;
  geometryDetail: number;
  rotationAxis: 'y' | 'x' | 'z' | 'diagonal' | 'wobble';
}

export const MORPHOLOGY_PROFILES: Record<string, MorphologyProfile> = {
  explorer: { id: 'explorer', morphIntensity: 0.15, morphSpeed: 0.8, fractalOctaves: 3, coreIntensity: 0.7, layerCount: 2, geometryDetail: 4, rotationAxis: 'y' },
  tech: { id: 'tech', morphIntensity: 0.1, morphSpeed: 1.2, fractalOctaves: 4, coreIntensity: 0.8, layerCount: 3, geometryDetail: 5, rotationAxis: 'diagonal' },
  creative: { id: 'creative', morphIntensity: 0.25, morphSpeed: 0.6, fractalOctaves: 5, coreIntensity: 0.6, layerCount: 3, geometryDetail: 4, rotationAxis: 'wobble' },
  action: { id: 'action', morphIntensity: 0.2, morphSpeed: 1.5, fractalOctaves: 3, coreIntensity: 0.9, layerCount: 2, geometryDetail: 3, rotationAxis: 'x' },
  mystic: { id: 'mystic', morphIntensity: 0.3, morphSpeed: 0.4, fractalOctaves: 6, coreIntensity: 0.5, layerCount: 4, geometryDetail: 5, rotationAxis: 'z' },
  healing: { id: 'healing', morphIntensity: 0.12, morphSpeed: 0.5, fractalOctaves: 3, coreIntensity: 0.6, layerCount: 2, geometryDetail: 4, rotationAxis: 'y' },
};

export function getMorphology(paletteId: string): MorphologyProfile {
  return MORPHOLOGY_PROFILES[paletteId] || MORPHOLOGY_PROFILES.explorer;
}

// ===== HSL TO RGB =====

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r, g, b];
}

// ===== VISUAL PROFILE GENERATION =====

export interface OrbVisualProfile {
  palette: ColorPalette;
  secondaryPalette: ColorPalette | null;
  morphology: MorphologyProfile;
  dominantHobbyCategory: string;
  level: number;
  morphSpeed: number;
  pulseRate: number;
}

// Hobby category mapping
const HOBBY_CATEGORY_MAP: Record<string, string> = {
  // Tech
  programming: 'tech', coding: 'tech', gaming: 'tech', technology: 'tech', computers: 'tech', ai: 'tech', robotics: 'tech',
  // Creative
  art: 'creative', music: 'creative', painting: 'creative', drawing: 'creative', writing: 'creative', photography: 'creative', design: 'creative', singing: 'creative', dancing: 'creative',
  // Action
  sports: 'action', fitness: 'action', running: 'action', swimming: 'action', martial: 'action', hiking: 'action', climbing: 'action', surfing: 'action',
  // Mystic
  meditation: 'mystic', yoga: 'mystic', astrology: 'mystic', tarot: 'mystic', spirituality: 'mystic', philosophy: 'mystic',
  // Healing
  cooking: 'healing', gardening: 'healing', nature: 'healing', animals: 'healing', volunteering: 'healing', therapy: 'healing',
};

function categorizeHobby(hobby: string): string {
  const lower = hobby.toLowerCase();
  for (const [keyword, category] of Object.entries(HOBBY_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'explorer';
}

export function generateVisualProfile(
  hobbies: string[],
  level: number = 1,
  streak: number = 0
): OrbVisualProfile {
  // Categorize hobbies
  const categories = hobbies.map(categorizeHobby);
  const categoryCounts: Record<string, number> = {};
  for (const cat of categories) {
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // Find dominant category
  let dominantCategory = 'explorer';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = cat;
    }
  }

  // Find secondary category
  let secondaryCategory: string | null = null;
  let secondMaxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (cat !== dominantCategory && count > secondMaxCount) {
      secondMaxCount = count;
      secondaryCategory = cat;
    }
  }

  const palette = COLOR_PALETTES[dominantCategory] || COLOR_PALETTES.explorer;
  const secondaryPalette = secondaryCategory ? (COLOR_PALETTES[secondaryCategory] || null) : null;
  const morphology = getMorphology(dominantCategory);

  // Scale morphology by level
  const levelScale = Math.min(level / 10, 1.5);

  return {
    palette,
    secondaryPalette,
    morphology: {
      ...morphology,
      layerCount: Math.min(morphology.layerCount + Math.floor(level / 5), 5),
      geometryDetail: Math.min(morphology.geometryDetail + Math.floor(level / 8), 6),
    },
    dominantHobbyCategory: dominantCategory,
    level,
    morphSpeed: morphology.morphSpeed * (1 + streak * 0.05),
    pulseRate: 1.0 + levelScale * 0.3,
  };
}

export function visualProfileToOrbProfile(vp: OrbVisualProfile): OrbProfile {
  return {
    primaryColor: vp.palette.primary,
    secondaryColors: [vp.palette.secondary, vp.palette.accent],
    accentColor: vp.palette.accent,
    morphIntensity: vp.morphology.morphIntensity,
    morphSpeed: vp.morphology.morphSpeed,
    fractalOctaves: vp.morphology.fractalOctaves,
    coreIntensity: vp.morphology.coreIntensity,
    coreSize: 0.2 + Math.min(vp.level, 15) * 0.02,
    layerCount: vp.morphology.layerCount,
    geometryDetail: vp.morphology.geometryDetail,
    particleEnabled: vp.level >= 3,
    particleCount: Math.min(vp.level * 10, 100),
    particleColor: vp.palette.glow,
    motionSpeed: vp.morphSpeed,
    pulseRate: vp.pulseRate,
    smoothness: 0.6,
    textureType: 'flowing',
    textureIntensity: 0.5,
    computedFrom: {
      dominantHobbies: [],
      egoState: 'guardian',
      level: vp.level,
      streak: 0,
      clarityScore: 0,
    },
  };
}
