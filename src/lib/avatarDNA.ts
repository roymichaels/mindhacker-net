/**
 * Avatar DNA System
 * 
 * Maps user traits, hobbies, behaviors, and preferences to visual properties
 * that determine the appearance of their personalized avatar/orb.
 */

import { ArchetypeId, blendArchetypes, type ArchetypeBlend } from './archetypes';

// ============================================
// HOBBY MAPPING
// ============================================

export type HobbyCategory = 
  | 'tech'
  | 'creative'
  | 'physical'
  | 'spiritual'
  | 'social'
  | 'intellectual'
  | 'nature'
  | 'business';

export interface HobbyVisualProps {
  archetype: ArchetypeId;
  colorModifier: { hue: number; saturation: number; lightness: number };
  textureIntensity: number;
  particleType: 'electric' | 'flowing' | 'sparks' | 'mist' | 'glow' | 'none';
}

export const HOBBY_MAPPINGS: Record<string, HobbyVisualProps> = {
  // Tech hobbies - Sage archetype, electric blue
  'gaming': { archetype: 'sage', colorModifier: { hue: 210, saturation: 80, lightness: 55 }, textureIntensity: 0.8, particleType: 'electric' },
  'coding': { archetype: 'sage', colorModifier: { hue: 190, saturation: 85, lightness: 50 }, textureIntensity: 0.9, particleType: 'electric' },
  'robotics': { archetype: 'sage', colorModifier: { hue: 200, saturation: 75, lightness: 50 }, textureIntensity: 0.7, particleType: 'electric' },
  'technology': { archetype: 'sage', colorModifier: { hue: 195, saturation: 80, lightness: 52 }, textureIntensity: 0.75, particleType: 'electric' },
  'crypto': { archetype: 'sage', colorModifier: { hue: 180, saturation: 70, lightness: 48 }, textureIntensity: 0.8, particleType: 'electric' },
  
  // Creative hobbies - Creator archetype, magenta/pink
  'art': { archetype: 'creator', colorModifier: { hue: 320, saturation: 75, lightness: 55 }, textureIntensity: 0.9, particleType: 'flowing' },
  'music': { archetype: 'creator', colorModifier: { hue: 280, saturation: 70, lightness: 60 }, textureIntensity: 0.85, particleType: 'flowing' },
  'writing': { archetype: 'creator', colorModifier: { hue: 300, saturation: 65, lightness: 55 }, textureIntensity: 0.7, particleType: 'mist' },
  'photography': { archetype: 'creator', colorModifier: { hue: 340, saturation: 75, lightness: 58 }, textureIntensity: 0.8, particleType: 'glow' },
  'design': { archetype: 'creator', colorModifier: { hue: 310, saturation: 80, lightness: 55 }, textureIntensity: 0.85, particleType: 'flowing' },
  'crafts': { archetype: 'creator', colorModifier: { hue: 350, saturation: 70, lightness: 60 }, textureIntensity: 0.6, particleType: 'sparks' },
  
  // Physical hobbies - Warrior archetype, orange/red
  'martial-arts': { archetype: 'warrior', colorModifier: { hue: 15, saturation: 85, lightness: 50 }, textureIntensity: 0.9, particleType: 'sparks' },
  'gym': { archetype: 'warrior', colorModifier: { hue: 10, saturation: 80, lightness: 52 }, textureIntensity: 0.85, particleType: 'sparks' },
  'sports': { archetype: 'warrior', colorModifier: { hue: 25, saturation: 75, lightness: 55 }, textureIntensity: 0.8, particleType: 'sparks' },
  'running': { archetype: 'warrior', colorModifier: { hue: 20, saturation: 80, lightness: 52 }, textureIntensity: 0.75, particleType: 'sparks' },
  'swimming': { archetype: 'healer', colorModifier: { hue: 195, saturation: 70, lightness: 55 }, textureIntensity: 0.6, particleType: 'flowing' },
  'yoga': { archetype: 'healer', colorModifier: { hue: 170, saturation: 65, lightness: 50 }, textureIntensity: 0.5, particleType: 'mist' },
  'dance': { archetype: 'creator', colorModifier: { hue: 330, saturation: 75, lightness: 58 }, textureIntensity: 0.8, particleType: 'flowing' },
  
  // Spiritual hobbies - Mystic archetype, purple/indigo
  'meditation': { archetype: 'mystic', colorModifier: { hue: 270, saturation: 65, lightness: 50 }, textureIntensity: 0.6, particleType: 'mist' },
  'tarot': { archetype: 'mystic', colorModifier: { hue: 280, saturation: 70, lightness: 45 }, textureIntensity: 0.9, particleType: 'mist' },
  'astrology': { archetype: 'mystic', colorModifier: { hue: 260, saturation: 75, lightness: 50 }, textureIntensity: 0.85, particleType: 'glow' },
  'magic': { archetype: 'mystic', colorModifier: { hue: 290, saturation: 80, lightness: 48 }, textureIntensity: 0.95, particleType: 'mist' },
  'spirituality': { archetype: 'mystic', colorModifier: { hue: 275, saturation: 65, lightness: 52 }, textureIntensity: 0.7, particleType: 'glow' },
  'philosophy': { archetype: 'mystic', colorModifier: { hue: 250, saturation: 60, lightness: 48 }, textureIntensity: 0.7, particleType: 'mist' },
  
  // Social hobbies - Healer archetype, green/turquoise
  'volunteering': { archetype: 'healer', colorModifier: { hue: 150, saturation: 65, lightness: 48 }, textureIntensity: 0.6, particleType: 'glow' },
  'mentoring': { archetype: 'healer', colorModifier: { hue: 160, saturation: 60, lightness: 50 }, textureIntensity: 0.7, particleType: 'glow' },
  'community': { archetype: 'healer', colorModifier: { hue: 155, saturation: 55, lightness: 52 }, textureIntensity: 0.5, particleType: 'flowing' },
  'networking': { archetype: 'explorer', colorModifier: { hue: 45, saturation: 75, lightness: 55 }, textureIntensity: 0.7, particleType: 'electric' },
  
  // Intellectual hobbies - Sage archetype, blue/cyan
  'reading': { archetype: 'sage', colorModifier: { hue: 220, saturation: 65, lightness: 52 }, textureIntensity: 0.5, particleType: 'mist' },
  'science': { archetype: 'sage', colorModifier: { hue: 185, saturation: 75, lightness: 50 }, textureIntensity: 0.8, particleType: 'electric' },
  'psychology': { archetype: 'sage', colorModifier: { hue: 240, saturation: 60, lightness: 55 }, textureIntensity: 0.7, particleType: 'mist' },
  'history': { archetype: 'sage', colorModifier: { hue: 35, saturation: 55, lightness: 45 }, textureIntensity: 0.5, particleType: 'none' },
  'languages': { archetype: 'sage', colorModifier: { hue: 200, saturation: 60, lightness: 55 }, textureIntensity: 0.6, particleType: 'flowing' },
  
  // Nature hobbies - Explorer archetype, gold/earth tones
  'hiking': { archetype: 'explorer', colorModifier: { hue: 40, saturation: 70, lightness: 50 }, textureIntensity: 0.75, particleType: 'sparks' },
  'gardening': { archetype: 'healer', colorModifier: { hue: 120, saturation: 55, lightness: 45 }, textureIntensity: 0.4, particleType: 'flowing' },
  'nature': { archetype: 'explorer', colorModifier: { hue: 85, saturation: 65, lightness: 48 }, textureIntensity: 0.6, particleType: 'flowing' },
  'travel': { archetype: 'explorer', colorModifier: { hue: 50, saturation: 80, lightness: 55 }, textureIntensity: 0.8, particleType: 'glow' },
  'camping': { archetype: 'explorer', colorModifier: { hue: 30, saturation: 65, lightness: 45 }, textureIntensity: 0.65, particleType: 'sparks' },
  
  // Business hobbies - Explorer/Warrior mix
  'entrepreneurship': { archetype: 'explorer', colorModifier: { hue: 42, saturation: 85, lightness: 52 }, textureIntensity: 0.85, particleType: 'electric' },
  'investing': { archetype: 'sage', colorModifier: { hue: 160, saturation: 60, lightness: 45 }, textureIntensity: 0.7, particleType: 'glow' },
  'marketing': { archetype: 'creator', colorModifier: { hue: 345, saturation: 70, lightness: 55 }, textureIntensity: 0.8, particleType: 'flowing' },
};

// ============================================
// BEHAVIOR MAPPING
// ============================================

export interface BehaviorVisualProps {
  motionModifier: {
    speed: number;        // Multiplier for base speed
    pulseRate: number;    // Pulse animation rate
    smoothness: number;   // 0-1, how smooth vs sharp movements
  };
  morphologyModifier: {
    edgeSharpness: number;  // Added to base
    organicFlow: number;    // Added to base
  };
}

export const DECISION_STYLE_MAPPINGS: Record<string, BehaviorVisualProps> = {
  'gut-feeling': {
    motionModifier: { speed: 1.3, pulseRate: 1.4, smoothness: 0.4 },
    morphologyModifier: { edgeSharpness: 0.1, organicFlow: 0.15 },
  },
  'pros-cons': {
    motionModifier: { speed: 0.8, pulseRate: 0.9, smoothness: 0.8 },
    morphologyModifier: { edgeSharpness: -0.1, organicFlow: -0.1 },
  },
  'seek-advice': {
    motionModifier: { speed: 0.9, pulseRate: 1.0, smoothness: 0.7 },
    morphologyModifier: { edgeSharpness: -0.05, organicFlow: 0.1 },
  },
  'sleep-on-it': {
    motionModifier: { speed: 0.7, pulseRate: 0.8, smoothness: 0.9 },
    morphologyModifier: { edgeSharpness: -0.15, organicFlow: 0.2 },
  },
  'quick-decision': {
    motionModifier: { speed: 1.4, pulseRate: 1.3, smoothness: 0.3 },
    morphologyModifier: { edgeSharpness: 0.15, organicFlow: -0.1 },
  },
};

export const CONFLICT_STYLE_MAPPINGS: Record<string, BehaviorVisualProps> = {
  'direct': {
    motionModifier: { speed: 1.2, pulseRate: 1.2, smoothness: 0.4 },
    morphologyModifier: { edgeSharpness: 0.2, organicFlow: -0.15 },
  },
  'avoid': {
    motionModifier: { speed: 0.7, pulseRate: 0.7, smoothness: 0.9 },
    morphologyModifier: { edgeSharpness: -0.2, organicFlow: 0.2 },
  },
  'diplomatic': {
    motionModifier: { speed: 0.9, pulseRate: 0.9, smoothness: 0.85 },
    morphologyModifier: { edgeSharpness: -0.1, organicFlow: 0.15 },
  },
  'compromise': {
    motionModifier: { speed: 0.95, pulseRate: 1.0, smoothness: 0.75 },
    morphologyModifier: { edgeSharpness: 0, organicFlow: 0.05 },
  },
};

export const PROBLEM_SOLVING_MAPPINGS: Record<string, BehaviorVisualProps> = {
  'solve-immediately': {
    motionModifier: { speed: 1.4, pulseRate: 1.5, smoothness: 0.3 },
    morphologyModifier: { edgeSharpness: 0.15, organicFlow: -0.1 },
  },
  'research-first': {
    motionModifier: { speed: 0.75, pulseRate: 0.8, smoothness: 0.8 },
    morphologyModifier: { edgeSharpness: 0.05, organicFlow: 0 },
  },
  'calm-then-solve': {
    motionModifier: { speed: 0.8, pulseRate: 0.9, smoothness: 0.9 },
    morphologyModifier: { edgeSharpness: -0.1, organicFlow: 0.15 },
  },
  'delegate': {
    motionModifier: { speed: 0.9, pulseRate: 0.85, smoothness: 0.7 },
    morphologyModifier: { edgeSharpness: -0.05, organicFlow: 0.1 },
  },
};

// ============================================
// TRAIT CATEGORY MAPPING
// ============================================

export interface TraitVisualInfluence {
  archetype: ArchetypeId;
  weight: number;
  colorInfluence: number;  // 0-1 how much this affects color
}

export const TRAIT_CATEGORY_MAPPINGS: Record<string, TraitVisualInfluence> = {
  // Identity traits - who you are
  'ambitious': { archetype: 'warrior', weight: 0.8, colorInfluence: 0.6 },
  'creative': { archetype: 'creator', weight: 0.9, colorInfluence: 0.7 },
  'analytical': { archetype: 'sage', weight: 0.85, colorInfluence: 0.6 },
  'empathetic': { archetype: 'healer', weight: 0.9, colorInfluence: 0.7 },
  'curious': { archetype: 'explorer', weight: 0.8, colorInfluence: 0.5 },
  'intuitive': { archetype: 'mystic', weight: 0.85, colorInfluence: 0.7 },
  
  // Behavior traits - how you act
  'determined': { archetype: 'warrior', weight: 0.7, colorInfluence: 0.5 },
  'reflective': { archetype: 'mystic', weight: 0.6, colorInfluence: 0.4 },
  'growing': { archetype: 'explorer', weight: 0.5, colorInfluence: 0.3 },
  'nurturing': { archetype: 'healer', weight: 0.7, colorInfluence: 0.5 },
  'innovative': { archetype: 'creator', weight: 0.75, colorInfluence: 0.5 },
  'methodical': { archetype: 'sage', weight: 0.6, colorInfluence: 0.4 },
};

// ============================================
// LIFE PRIORITY MAPPING
// ============================================

export const PRIORITY_MAPPINGS: Record<string, ArchetypeId> = {
  'career': 'warrior',
  'business': 'explorer',
  'family': 'healer',
  'relationships': 'healer',
  'health': 'warrior',
  'spirituality': 'mystic',
  'creativity': 'creator',
  'wealth': 'explorer',
  'freedom': 'explorer',
  'learning': 'sage',
  'adventure': 'explorer',
  'impact': 'healer',
  'purpose': 'mystic',
  'balance': 'healer',
};

// ============================================
// DNA COMPUTATION
// ============================================

export interface UserDataForDNA {
  hobbies: string[];
  decisionStyle?: string;
  conflictStyle?: string;
  problemSolvingStyle?: string;
  traits: string[];
  priorities: string[];
  level: number;
  experience: number;
  streak: number;
  clarityScore?: number;
}

export interface AvatarDNA {
  archetypeBlend: ArchetypeBlend;
  dominantHobbies: string[];
  particleTypes: Set<string>;
  textureIntensity: number;
  motionProfile: {
    speed: number;
    pulseRate: number;
    smoothness: number;
  };
  complexityLevel: number;  // Based on user level/XP
  particleCount: number;
  layerCount: number;
}

export function computeAvatarDNA(userData: UserDataForDNA): AvatarDNA {
  const archetypeWeights: Partial<Record<ArchetypeId, number>> = {};
  const particleTypes = new Set<string>();
  let textureIntensity = 0.5;
  
  // 1. Process hobbies - major influence on archetype
  const hobbyCount = userData.hobbies.length || 1;
  for (const hobby of userData.hobbies) {
    const mapping = HOBBY_MAPPINGS[hobby];
    if (mapping) {
      archetypeWeights[mapping.archetype] = 
        (archetypeWeights[mapping.archetype] || 0) + (1.5 / hobbyCount);
      textureIntensity = Math.max(textureIntensity, mapping.textureIntensity);
      if (mapping.particleType !== 'none') {
        particleTypes.add(mapping.particleType);
      }
    }
  }
  
  // 2. Process traits - moderate influence
  for (const trait of userData.traits) {
    const mapping = TRAIT_CATEGORY_MAPPINGS[trait.toLowerCase()];
    if (mapping) {
      archetypeWeights[mapping.archetype] = 
        (archetypeWeights[mapping.archetype] || 0) + (mapping.weight * 0.5);
    }
  }
  
  // 3. Process priorities - minor influence
  for (const priority of userData.priorities) {
    const archetype = PRIORITY_MAPPINGS[priority.toLowerCase()];
    if (archetype) {
      archetypeWeights[archetype] = 
        (archetypeWeights[archetype] || 0) + 0.3;
    }
  }
  
  // 4. Compute motion profile from behaviors
  const motionProfile = {
    speed: 1.0,
    pulseRate: 1.0,
    smoothness: 0.6,
  };
  
  if (userData.decisionStyle) {
    const dm = DECISION_STYLE_MAPPINGS[userData.decisionStyle];
    if (dm) {
      motionProfile.speed *= dm.motionModifier.speed;
      motionProfile.pulseRate *= dm.motionModifier.pulseRate;
      motionProfile.smoothness = (motionProfile.smoothness + dm.motionModifier.smoothness) / 2;
    }
  }
  
  if (userData.conflictStyle) {
    const cm = CONFLICT_STYLE_MAPPINGS[userData.conflictStyle];
    if (cm) {
      motionProfile.speed *= cm.motionModifier.speed;
      motionProfile.smoothness = (motionProfile.smoothness + cm.motionModifier.smoothness) / 2;
    }
  }
  
  if (userData.problemSolvingStyle) {
    const pm = PROBLEM_SOLVING_MAPPINGS[userData.problemSolvingStyle];
    if (pm) {
      motionProfile.pulseRate *= pm.motionModifier.pulseRate;
    }
  }
  
  // 5. Calculate complexity from level/XP
  const level = userData.level || 1;
  let complexityLevel: number;
  let particleCount: number;
  let layerCount: number;
  
  if (level <= 3) {
    complexityLevel = 1;
    particleCount = 0;
    layerCount = 1;
  } else if (level <= 6) {
    complexityLevel = 2;
    particleCount = 10;
    layerCount = 2;
  } else if (level <= 9) {
    complexityLevel = 3;
    particleCount = 25;
    layerCount = 3;
  } else {
    complexityLevel = 4;
    particleCount = 50;
    layerCount = 4;
  }
  
  // Streak bonus
  if (userData.streak >= 7) {
    particleCount += 10;
  }
  
  // Clarity score bonus
  if ((userData.clarityScore || 0) >= 70) {
    textureIntensity = Math.min(1, textureIntensity + 0.1);
  }
  
  // 6. Blend archetypes
  const archetypeBlend = blendArchetypes(archetypeWeights);
  
  return {
    archetypeBlend,
    dominantHobbies: userData.hobbies.slice(0, 3),
    particleTypes,
    textureIntensity,
    motionProfile,
    complexityLevel,
    particleCount,
    layerCount,
  };
}

/**
 * Get a summary description of the avatar DNA for display
 */
export function getAvatarDNASummary(dna: AvatarDNA, isHebrew: boolean): string {
  const { archetypeBlend } = dna;
  const primary = archetypeBlend.dominantArchetype;
  const secondary = archetypeBlend.secondaryArchetype;
  
  if (isHebrew) {
    const archetypeNamesHe: Record<ArchetypeId, string> = {
      warrior: 'לוחם',
      mystic: 'מיסטיקן',
      creator: 'יוצר',
      sage: 'חכם',
      healer: 'מרפא',
      explorer: 'חוקר',
    };
    
    if (secondary) {
      return `${archetypeNamesHe[primary]}-${archetypeNamesHe[secondary]}`;
    }
    return archetypeNamesHe[primary];
  } else {
    const archetypeNames: Record<ArchetypeId, string> = {
      warrior: 'Warrior',
      mystic: 'Mystic',
      creator: 'Creator',
      sage: 'Sage',
      healer: 'Healer',
      explorer: 'Explorer',
    };
    
    if (secondary) {
      return `${archetypeNames[primary]}-${archetypeNames[secondary]}`;
    }
    return archetypeNames[primary];
  }
}
