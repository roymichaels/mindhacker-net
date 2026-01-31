/**
 * Archetype System - Dynamic Identity-Based Avatar
 * 
 * Replaces the static Ego States with 6 core archetypes that blend
 * together based on user's actual personality, hobbies, and behaviors.
 */

export type ArchetypeId = 'warrior' | 'mystic' | 'creator' | 'sage' | 'healer' | 'explorer';

export interface ArchetypeColors {
  primary: string;      // Main HSL color
  secondary: string;    // Secondary HSL color
  accent: string;       // Accent/glow HSL color
  gradient: string[];   // Gradient colors
}

export interface ArchetypeMorphology {
  edgeSharpness: number;    // 0-1: 0=smooth, 1=sharp/spiky
  organicFlow: number;      // 0-1: how organic vs geometric
  symmetry: number;         // 0-1: how symmetrical
  complexity: number;       // 0-1: fractal complexity
}

export interface ArchetypeMotion {
  baseSpeed: number;        // Movement speed multiplier
  pulseIntensity: number;   // How much it pulses
  breathingRate: number;    // Breathing animation rate
  reactivity: number;       // How quickly it responds to input
}

export interface ArchetypeTexture {
  type: 'flowing' | 'crystalline' | 'fractal' | 'ethereal' | 'organic' | 'electric';
  noiseScale: number;
  layerBlending: number;
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  colors: ArchetypeColors;
  morphology: ArchetypeMorphology;
  motion: ArchetypeMotion;
  texture: ArchetypeTexture;
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    nameHe: 'לוחם',
    description: 'Driven by action, courage, and determination',
    descriptionHe: 'מונע על ידי פעולה, אומץ ונחישות',
    icon: '⚔️',
    colors: {
      primary: '15 85% 55%',      // Deep orange
      secondary: '0 75% 50%',      // Red
      accent: '45 90% 60%',        // Gold
      gradient: ['15 85% 55%', '0 75% 50%', '45 90% 60%'],
    },
    morphology: {
      edgeSharpness: 0.7,
      organicFlow: 0.3,
      symmetry: 0.8,
      complexity: 0.5,
    },
    motion: {
      baseSpeed: 1.3,
      pulseIntensity: 0.8,
      breathingRate: 0.7,
      reactivity: 0.9,
    },
    texture: {
      type: 'crystalline',
      noiseScale: 1.2,
      layerBlending: 0.6,
    },
  },
  
  mystic: {
    id: 'mystic',
    name: 'Mystic',
    nameHe: 'מיסטיקן',
    description: 'Connected to intuition, wisdom, and the unseen',
    descriptionHe: 'מחובר לאינטואיציה, חוכמה והנסתר',
    icon: '🔮',
    colors: {
      primary: '270 70% 50%',      // Deep purple
      secondary: '240 60% 45%',    // Indigo
      accent: '300 80% 70%',       // Violet glow
      gradient: ['270 70% 50%', '240 60% 45%', '300 80% 70%'],
    },
    morphology: {
      edgeSharpness: 0.2,
      organicFlow: 0.9,
      symmetry: 0.5,
      complexity: 0.8,
    },
    motion: {
      baseSpeed: 0.7,
      pulseIntensity: 0.5,
      breathingRate: 1.2,
      reactivity: 0.4,
    },
    texture: {
      type: 'ethereal',
      noiseScale: 0.8,
      layerBlending: 0.9,
    },
  },
  
  creator: {
    id: 'creator',
    name: 'Creator',
    nameHe: 'יוצר',
    description: 'Fueled by imagination, expression, and innovation',
    descriptionHe: 'מונע על ידי דמיון, ביטוי עצמי וחדשנות',
    icon: '🎨',
    colors: {
      primary: '320 75% 55%',      // Magenta
      secondary: '280 70% 60%',    // Purple-pink
      accent: '340 85% 65%',       // Hot pink
      gradient: ['320 75% 55%', '280 70% 60%', '340 85% 65%'],
    },
    morphology: {
      edgeSharpness: 0.4,
      organicFlow: 0.7,
      symmetry: 0.3,
      complexity: 0.9,
    },
    motion: {
      baseSpeed: 1.0,
      pulseIntensity: 0.7,
      breathingRate: 0.9,
      reactivity: 0.8,
    },
    texture: {
      type: 'fractal',
      noiseScale: 1.5,
      layerBlending: 0.7,
    },
  },
  
  sage: {
    id: 'sage',
    name: 'Sage',
    nameHe: 'חכם',
    description: 'Guided by knowledge, analysis, and understanding',
    descriptionHe: 'מונחה על ידי ידע, ניתוח והבנה',
    icon: '📚',
    colors: {
      primary: '200 80% 50%',      // Cyan
      secondary: '220 70% 55%',    // Blue
      accent: '180 75% 60%',       // Teal
      gradient: ['200 80% 50%', '220 70% 55%', '180 75% 60%'],
    },
    morphology: {
      edgeSharpness: 0.5,
      organicFlow: 0.4,
      symmetry: 0.95,
      complexity: 0.6,
    },
    motion: {
      baseSpeed: 0.8,
      pulseIntensity: 0.4,
      breathingRate: 0.8,
      reactivity: 0.6,
    },
    texture: {
      type: 'crystalline',
      noiseScale: 0.6,
      layerBlending: 0.5,
    },
  },
  
  healer: {
    id: 'healer',
    name: 'Healer',
    nameHe: 'מרפא',
    description: 'Nurturing connection, empathy, and restoration',
    descriptionHe: 'מטפח חיבור, אמפתיה והחלמה',
    icon: '💚',
    colors: {
      primary: '160 65% 45%',      // Teal-green
      secondary: '140 55% 50%',    // Green
      accent: '175 70% 55%',       // Turquoise
      gradient: ['160 65% 45%', '140 55% 50%', '175 70% 55%'],
    },
    morphology: {
      edgeSharpness: 0.1,
      organicFlow: 0.95,
      symmetry: 0.7,
      complexity: 0.4,
    },
    motion: {
      baseSpeed: 0.6,
      pulseIntensity: 0.3,
      breathingRate: 1.4,
      reactivity: 0.3,
    },
    texture: {
      type: 'organic',
      noiseScale: 0.5,
      layerBlending: 0.8,
    },
  },
  
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    nameHe: 'חוקר',
    description: 'Driven by curiosity, adventure, and discovery',
    descriptionHe: 'מונע על ידי סקרנות, הרפתקאות וגילוי',
    icon: '🌟',
    colors: {
      primary: '45 85% 55%',       // Gold
      secondary: '35 80% 50%',     // Orange-gold
      accent: '55 90% 65%',        // Bright yellow
      gradient: ['45 85% 55%', '35 80% 50%', '55 90% 65%'],
    },
    morphology: {
      edgeSharpness: 0.3,
      organicFlow: 0.6,
      symmetry: 0.4,
      complexity: 0.7,
    },
    motion: {
      baseSpeed: 1.2,
      pulseIntensity: 0.6,
      breathingRate: 1.0,
      reactivity: 0.85,
    },
    texture: {
      type: 'electric',
      noiseScale: 1.0,
      layerBlending: 0.65,
    },
  },
};

export function getArchetype(id: ArchetypeId): Archetype {
  return ARCHETYPES[id];
}

export function getAllArchetypes(): Archetype[] {
  return Object.values(ARCHETYPES);
}

/**
 * Blend multiple archetypes based on weights
 * Returns a combined visual profile
 */
export interface ArchetypeBlend {
  archetypes: { id: ArchetypeId; weight: number }[];
  dominantArchetype: ArchetypeId;
  secondaryArchetype: ArchetypeId | null;
  blendedColors: ArchetypeColors;
  blendedMorphology: ArchetypeMorphology;
  blendedMotion: ArchetypeMotion;
  blendedTexture: ArchetypeTexture;
}

export function blendArchetypes(
  weights: Partial<Record<ArchetypeId, number>>
): ArchetypeBlend {
  // Normalize weights
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w || 0), 0) || 1;
  const normalizedWeights: { id: ArchetypeId; weight: number }[] = [];
  
  for (const [id, weight] of Object.entries(weights)) {
    if (weight && weight > 0) {
      normalizedWeights.push({
        id: id as ArchetypeId,
        weight: weight / totalWeight,
      });
    }
  }
  
  // Sort by weight descending
  normalizedWeights.sort((a, b) => b.weight - a.weight);
  
  // If no weights, default to explorer
  if (normalizedWeights.length === 0) {
    normalizedWeights.push({ id: 'explorer', weight: 1 });
  }
  
  const dominantArchetype = normalizedWeights[0].id;
  const secondaryArchetype = normalizedWeights[1]?.id || null;
  
  // Blend colors (weighted average of HSL values)
  const blendedColors = blendColors(normalizedWeights);
  const blendedMorphology = blendMorphology(normalizedWeights);
  const blendedMotion = blendMotion(normalizedWeights);
  const blendedTexture = blendTexture(normalizedWeights);
  
  return {
    archetypes: normalizedWeights,
    dominantArchetype,
    secondaryArchetype,
    blendedColors,
    blendedMorphology,
    blendedMotion,
    blendedTexture,
  };
}

function parseHSL(hsl: string): [number, number, number] {
  const parts = hsl.split(' ').map(p => parseFloat(p));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function formatHSL(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function blendHSL(colors: { hsl: string; weight: number }[]): string {
  let h = 0, s = 0, l = 0;
  
  // For hue, we need to handle circular blending
  let sinSum = 0, cosSum = 0;
  
  for (const { hsl, weight } of colors) {
    const [hue, sat, light] = parseHSL(hsl);
    const hueRad = (hue * Math.PI) / 180;
    sinSum += Math.sin(hueRad) * weight;
    cosSum += Math.cos(hueRad) * weight;
    s += sat * weight;
    l += light * weight;
  }
  
  h = (Math.atan2(sinSum, cosSum) * 180) / Math.PI;
  if (h < 0) h += 360;
  
  return formatHSL(h, s, l);
}

function blendColors(
  weights: { id: ArchetypeId; weight: number }[]
): ArchetypeColors {
  const primaryColors = weights.map(({ id, weight }) => ({
    hsl: ARCHETYPES[id].colors.primary,
    weight,
  }));
  
  const secondaryColors = weights.map(({ id, weight }) => ({
    hsl: ARCHETYPES[id].colors.secondary,
    weight,
  }));
  
  const accentColors = weights.map(({ id, weight }) => ({
    hsl: ARCHETYPES[id].colors.accent,
    weight,
  }));
  
  return {
    primary: blendHSL(primaryColors),
    secondary: blendHSL(secondaryColors),
    accent: blendHSL(accentColors),
    gradient: [
      blendHSL(primaryColors),
      blendHSL(secondaryColors),
      blendHSL(accentColors),
    ],
  };
}

function blendMorphology(
  weights: { id: ArchetypeId; weight: number }[]
): ArchetypeMorphology {
  let edgeSharpness = 0, organicFlow = 0, symmetry = 0, complexity = 0;
  
  for (const { id, weight } of weights) {
    const m = ARCHETYPES[id].morphology;
    edgeSharpness += m.edgeSharpness * weight;
    organicFlow += m.organicFlow * weight;
    symmetry += m.symmetry * weight;
    complexity += m.complexity * weight;
  }
  
  return { edgeSharpness, organicFlow, symmetry, complexity };
}

function blendMotion(
  weights: { id: ArchetypeId; weight: number }[]
): ArchetypeMotion {
  let baseSpeed = 0, pulseIntensity = 0, breathingRate = 0, reactivity = 0;
  
  for (const { id, weight } of weights) {
    const m = ARCHETYPES[id].motion;
    baseSpeed += m.baseSpeed * weight;
    pulseIntensity += m.pulseIntensity * weight;
    breathingRate += m.breathingRate * weight;
    reactivity += m.reactivity * weight;
  }
  
  return { baseSpeed, pulseIntensity, breathingRate, reactivity };
}

function blendTexture(
  weights: { id: ArchetypeId; weight: number }[]
): ArchetypeTexture {
  // For texture type, use the dominant archetype's texture
  const dominantId = weights[0]?.id || 'explorer';
  const dominant = ARCHETYPES[dominantId].texture;
  
  let noiseScale = 0, layerBlending = 0;
  
  for (const { id, weight } of weights) {
    const t = ARCHETYPES[id].texture;
    noiseScale += t.noiseScale * weight;
    layerBlending += t.layerBlending * weight;
  }
  
  return {
    type: dominant.type,
    noiseScale,
    layerBlending,
  };
}
