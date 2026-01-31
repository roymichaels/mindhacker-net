/**
 * DNA Threads System - Multi-Thread Orb Visual Mapping
 * 
 * Maps user traits, hobbies, patterns, and consciousness levels
 * to unique visual threads that create a one-of-a-kind orb
 */

// ============= Types =============

export type ThreadSource = 'trait' | 'hobby' | 'pattern' | 'strength' | 'growth_edge';
export type ThreadAnimation = 'pulse' | 'wave' | 'orbit' | 'spiral' | 'breathe';
export type BaseGeometry = 'icosahedron' | 'octahedron' | 'dodecahedron' | 'sphere' | 'torus';

export interface OrbDNAThread {
  id: string;
  label: string;
  source: ThreadSource;
  color: string; // HSL format "h s% l%"
  intensity: number; // 0-1
  animation: ThreadAnimation;
  layer: number; // 0=core, 1=inner, 2=middle, 3=outer
  rotationAxis: { x: number; y: number; z: number };
  rotationSpeed: number;
}

export interface OrbDNAShape {
  baseGeometry: BaseGeometry;
  edgeSharpness: number; // 0-1
  symmetry: number; // 0-1
  organicFlow: number; // 0-1
  complexity: number; // 1-6 fractal octaves
}

export interface CoreGlow {
  color: string;
  intensity: number;
  pulseRate: number;
}

export interface MotionProfile {
  speed: number;
  pulseRate: number;
  reactivity: number;
  smoothness: number;
}

export interface MultiThreadOrbProfile {
  threads: OrbDNAThread[];
  shape: OrbDNAShape;
  coreGlow: CoreGlow;
  motionProfile: MotionProfile;
  consciousnessLevel: number;
  dominantColors: string[]; // Top 3 colors from threads
}

// ============= Color Mappings =============

/**
 * Trait to color mapping - Hebrew traits
 */
const TRAIT_COLORS: Record<string, { color: string; animation: ThreadAnimation }> = {
  // Warrior/Action traits
  'שאפתן': { color: '15 85% 55%', animation: 'pulse' },
  'אמביציוזי': { color: '15 85% 55%', animation: 'pulse' },
  'נחוש': { color: '10 80% 50%', animation: 'pulse' },
  'אמיץ': { color: '5 85% 52%', animation: 'spiral' },
  'מתמיד': { color: '25 80% 52%', animation: 'pulse' },
  'מתמיד פיזית': { color: '45 85% 55%', animation: 'spiral' },
  'לוחמני': { color: '0 80% 50%', animation: 'pulse' },
  
  // Sage/Analytical traits
  'אנליטי': { color: '200 80% 50%', animation: 'wave' },
  'חכם': { color: '210 75% 52%', animation: 'wave' },
  'הגיוני': { color: '195 78% 48%', animation: 'wave' },
  'סקרן': { color: '185 75% 50%', animation: 'orbit' },
  'אינטלקטואל': { color: '220 70% 55%', animation: 'wave' },
  'ביקורתי': { color: '215 72% 48%', animation: 'wave' },
  
  // Explorer traits
  'הרפתקן': { color: '45 85% 55%', animation: 'spiral' },
  'חופשי': { color: '55 75% 55%', animation: 'spiral' },
  'פתוח': { color: '40 80% 50%', animation: 'orbit' },
  
  // Creator traits
  'יצירתי': { color: '320 75% 55%', animation: 'orbit' },
  'חדשני': { color: '330 70% 52%', animation: 'orbit' },
  'דמיוני': { color: '310 72% 50%', animation: 'breathe' },
  'אמן': { color: '315 78% 55%', animation: 'orbit' },
  
  // Mystic traits
  'אינטואיטיבי': { color: '270 70% 50%', animation: 'breathe' },
  'רוחני': { color: '275 65% 48%', animation: 'breathe' },
  'מיסטי': { color: '280 72% 52%', animation: 'breathe' },
  'חולם': { color: '260 68% 55%', animation: 'breathe' },
  
  // Healer traits
  'אמפתי': { color: '145 70% 45%', animation: 'breathe' },
  'חם': { color: '140 65% 48%', animation: 'breathe' },
  'תומך': { color: '150 68% 50%', animation: 'wave' },
  'מרפא': { color: '155 72% 45%', animation: 'breathe' },
};

/**
 * Hobby to color mapping
 */
const HOBBY_COLORS: Record<string, { color: string; animation: ThreadAnimation; particleType: string }> = {
  // Physical/Warrior hobbies
  'martial-arts': { color: '15 85% 50%', animation: 'spiral', particleType: 'sparks' },
  'fitness': { color: '25 80% 52%', animation: 'pulse', particleType: 'energy' },
  'sports': { color: '20 78% 48%', animation: 'spiral', particleType: 'trails' },
  'hiking': { color: '45 75% 50%', animation: 'spiral', particleType: 'dust' },
  'dancing': { color: '340 75% 55%', animation: 'orbit', particleType: 'sparkle' },
  
  // Intellectual/Sage hobbies
  'science': { color: '185 75% 50%', animation: 'wave', particleType: 'electric' },
  'psychology': { color: '240 60% 55%', animation: 'wave', particleType: 'glow' },
  'reading': { color: '220 65% 50%', animation: 'wave', particleType: 'particles' },
  'technology': { color: '200 80% 52%', animation: 'wave', particleType: 'circuit' },
  
  // Spiritual/Mystic hobbies
  'philosophy': { color: '270 60% 48%', animation: 'breathe', particleType: 'mist' },
  'meditation': { color: '260 55% 45%', animation: 'breathe', particleType: 'aura' },
  'yoga': { color: '155 60% 48%', animation: 'breathe', particleType: 'flow' },
  'tarot': { color: '285 70% 50%', animation: 'orbit', particleType: 'stars' },
  'magic': { color: '280 75% 52%', animation: 'spiral', particleType: 'sparkle' },
  
  // Creative hobbies
  'music': { color: '320 70% 55%', animation: 'wave', particleType: 'notes' },
  'art': { color: '330 75% 50%', animation: 'orbit', particleType: 'paint' },
  'writing': { color: '250 60% 52%', animation: 'wave', particleType: 'ink' },
  'photography': { color: '35 70% 50%', animation: 'orbit', particleType: 'flash' },
  'gaming': { color: '195 85% 55%', animation: 'pulse', particleType: 'pixels' },
  
  // Social/Healer hobbies
  'mentoring': { color: '145 65% 50%', animation: 'breathe', particleType: 'warmth' },
  'teaching': { color: '150 60% 48%', animation: 'wave', particleType: 'knowledge' },
  'volunteering': { color: '140 62% 45%', animation: 'breathe', particleType: 'hearts' },
};

/**
 * Consciousness patterns to visual properties
 */
const PATTERN_VISUALS: Record<string, { color: string; shapeModifier: Partial<OrbDNAShape> }> = {
  // Blocking patterns (darker, more muted)
  'אלחוש רגשי': { 
    color: '220 30% 40%',
    shapeModifier: { edgeSharpness: 0.3, organicFlow: 0.4 }
  },
  'פרפקציוניזם': {
    color: '200 35% 45%',
    shapeModifier: { edgeSharpness: 0.9, symmetry: 0.95 }
  },
  'איסוף ידע': {
    color: '210 40% 48%',
    shapeModifier: { complexity: 5 }
  },
  'פחד מכישלון': {
    color: '240 25% 38%',
    shapeModifier: { organicFlow: 0.3 }
  },
  'ביקורת עצמית': {
    color: '230 30% 42%',
    shapeModifier: { edgeSharpness: 0.7 }
  },
  'דחיינות': {
    color: '190 25% 40%',
    shapeModifier: { organicFlow: 0.6 }
  },
};

/**
 * Growth edges to aspirational colors (lighter, glowing)
 */
const GROWTH_COLORS: Record<string, string> = {
  'חיבור רגשי': '145 70% 60%',
  'פעולה מלוכלכת': '30 85% 60%',
  'ריבונות אישית': '45 90% 58%',
  'פתיחות': '175 65% 55%',
  'גמישות': '280 60% 58%',
  'אמון': '200 70% 55%',
  'הרפיה': '170 60% 52%',
  'תחושה': '340 65% 58%',
};

// ============= Consciousness Level Geometry =============

/**
 * Map consciousness score (0-100) to Hawkins scale and geometry
 */
export function getConsciousnessGeometry(score: number): { geometry: BaseGeometry; hawkinsLevel: string } {
  if (score >= 90) return { geometry: 'torus', hawkinsLevel: 'Peace (600+)' };
  if (score >= 80) return { geometry: 'sphere', hawkinsLevel: 'Love (500+)' };
  if (score >= 70) return { geometry: 'dodecahedron', hawkinsLevel: 'Acceptance (350+)' };
  if (score >= 60) return { geometry: 'dodecahedron', hawkinsLevel: 'Willingness (310+)' };
  if (score >= 50) return { geometry: 'icosahedron', hawkinsLevel: 'Courage (200+)' };
  if (score >= 40) return { geometry: 'icosahedron', hawkinsLevel: 'Pride (175)' };
  return { geometry: 'octahedron', hawkinsLevel: 'Desire (125)' };
}

// ============= Thread Generation =============

interface LaunchpadSummaryData {
  identity_profile?: {
    dominant_traits?: string[];
    suggested_ego_state?: string;
    identity_title?: string;
  };
  consciousness_analysis?: {
    dominant_patterns?: string[];
    growth_edges?: string[];
    strengths?: string[];
  };
  behavioral_insights?: {
    habits_to_cultivate?: string[];
    resistance_patterns?: string[];
  };
}

/**
 * Generate unique rotation axis for each thread
 */
function generateRotationAxis(index: number, seed: string): { x: number; y: number; z: number } {
  const seedNum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    x: Math.sin((index + seedNum) * 1.7),
    y: Math.cos((index + seedNum) * 2.3),
    z: Math.sin((index + seedNum) * 0.8),
  };
}

/**
 * Main function: Generate all DNA threads from user data
 */
export function generateOrbThreads(
  summaryData: LaunchpadSummaryData | null,
  hobbies: string[] = [],
  consciousnessScore: number = 50
): MultiThreadOrbProfile {
  const threads: OrbDNAThread[] = [];
  const identityProfile = summaryData?.identity_profile;
  const consciousnessAnalysis = summaryData?.consciousness_analysis;
  
  // 1. Add threads from dominant traits (Layer 0 - core)
  const dominantTraits = identityProfile?.dominant_traits || [];
  dominantTraits.slice(0, 4).forEach((trait, i) => {
    const mapping = TRAIT_COLORS[trait];
    const color = mapping?.color || generateColorForUnknown(trait, 0);
    const animation = mapping?.animation || 'pulse';
    
    threads.push({
      id: `trait-${i}`,
      label: trait,
      source: 'trait',
      color,
      intensity: 1 - i * 0.15,
      animation,
      layer: 0,
      rotationAxis: generateRotationAxis(i, trait),
      rotationSpeed: 0.003 + i * 0.001,
    });
  });
  
  // 2. Add threads from hobbies (Layer 1 - inner)
  const uniqueHobbies = [...new Set(hobbies)].slice(0, 5);
  uniqueHobbies.forEach((hobby, i) => {
    const mapping = HOBBY_COLORS[hobby];
    const color = mapping?.color || generateColorForUnknown(hobby, 1);
    const animation = mapping?.animation || 'orbit';
    
    threads.push({
      id: `hobby-${i}`,
      label: hobby,
      source: 'hobby',
      color,
      intensity: 0.8 - i * 0.1,
      animation,
      layer: 1,
      rotationAxis: generateRotationAxis(i + 10, hobby),
      rotationSpeed: 0.004 + i * 0.0008,
    });
  });
  
  // 3. Add threads from strengths (Layer 1 - inner, brighter)
  const strengths = consciousnessAnalysis?.strengths || [];
  strengths.slice(0, 3).forEach((strength, i) => {
    threads.push({
      id: `strength-${i}`,
      label: strength,
      source: 'strength',
      color: generateStrengthColor(strength, i),
      intensity: 0.7 - i * 0.1,
      animation: 'wave',
      layer: 1,
      rotationAxis: generateRotationAxis(i + 20, strength),
      rotationSpeed: 0.0025,
    });
  });
  
  // 4. Add threads from consciousness patterns (Layer 2 - middle, muted)
  const patterns = consciousnessAnalysis?.dominant_patterns || [];
  patterns.slice(0, 3).forEach((pattern, i) => {
    const mapping = PATTERN_VISUALS[pattern];
    const color = mapping?.color || '220 30% 42%';
    
    threads.push({
      id: `pattern-${i}`,
      label: pattern,
      source: 'pattern',
      color,
      intensity: 0.45 - i * 0.1,
      animation: 'wave',
      layer: 2,
      rotationAxis: generateRotationAxis(i + 30, pattern),
      rotationSpeed: 0.002,
    });
  });
  
  // 5. Add threads from growth edges (Layer 3 - outer, subtle/aspirational)
  const growthEdges = consciousnessAnalysis?.growth_edges || [];
  growthEdges.slice(0, 3).forEach((edge, i) => {
    const color = GROWTH_COLORS[edge] || generateGrowthColor(edge);
    
    threads.push({
      id: `growth-${i}`,
      label: edge,
      source: 'growth_edge',
      color,
      intensity: 0.35 - i * 0.08,
      animation: 'breathe',
      layer: 3,
      rotationAxis: generateRotationAxis(i + 40, edge),
      rotationSpeed: 0.0015,
    });
  });
  
  // Calculate shape based on patterns and consciousness
  const shape = calculateShape(patterns, consciousnessScore);
  
  // Calculate core glow from dominant thread color
  const dominantThreadColor = threads[0]?.color || '200 80% 50%';
  const coreGlow: CoreGlow = {
    color: dominantThreadColor,
    intensity: 0.6 + (consciousnessScore / 100) * 0.3,
    pulseRate: 1.2,
  };
  
  // Motion profile based on traits
  const motionProfile: MotionProfile = calculateMotionProfile(dominantTraits, consciousnessScore);
  
  // Get top 3 colors for gradient effects
  const dominantColors = threads
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3)
    .map(t => t.color);
  
  return {
    threads,
    shape,
    coreGlow,
    motionProfile,
    consciousnessLevel: consciousnessScore,
    dominantColors,
  };
}

// ============= Helper Functions =============

function generateColorForUnknown(label: string, layer: number): string {
  // Generate a deterministic but unique color from the label
  const hash = label.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  const hue = hash % 360;
  const saturation = 60 + (layer * 5);
  const lightness = 50 - (layer * 3);
  return `${hue} ${saturation}% ${lightness}%`;
}

function generateStrengthColor(strength: string, index: number): string {
  const hash = strength.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseHue = (hash * 37) % 360;
  // Strengths are brighter, more saturated
  return `${baseHue} 75% 55%`;
}

function generateGrowthColor(edge: string): string {
  const hash = edge.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseHue = (hash * 23) % 360;
  // Growth colors are lighter, aspirational
  return `${baseHue} 65% 60%`;
}

function calculateShape(patterns: string[], consciousnessScore: number): OrbDNAShape {
  const { geometry } = getConsciousnessGeometry(consciousnessScore);
  
  // Calculate shape modifiers from patterns
  let edgeSharpness = 0.5;
  let symmetry = 0.6;
  let organicFlow = 0.5;
  let complexity = 3;
  
  patterns.forEach(pattern => {
    const modifier = PATTERN_VISUALS[pattern]?.shapeModifier;
    if (modifier) {
      if (modifier.edgeSharpness !== undefined) edgeSharpness = modifier.edgeSharpness;
      if (modifier.symmetry !== undefined) symmetry = modifier.symmetry;
      if (modifier.organicFlow !== undefined) organicFlow = modifier.organicFlow;
      if (modifier.complexity !== undefined) complexity = modifier.complexity;
    }
  });
  
  return {
    baseGeometry: geometry,
    edgeSharpness,
    symmetry,
    organicFlow,
    complexity,
  };
}

function calculateMotionProfile(traits: string[], consciousnessScore: number): MotionProfile {
  // Ambitious/active traits = faster motion
  const activeTraits = ['שאפתן', 'אמביציוזי', 'נחוש', 'אמיץ', 'לוחמני', 'הרפתקן'];
  const calmTraits = ['רוחני', 'מיסטי', 'אמפתי', 'חם'];
  
  let speed = 1.0;
  let pulseRate = 1.0;
  let reactivity = 0.5;
  
  traits.forEach(trait => {
    if (activeTraits.includes(trait)) {
      speed += 0.15;
      pulseRate += 0.2;
      reactivity += 0.1;
    }
    if (calmTraits.includes(trait)) {
      speed -= 0.1;
      pulseRate -= 0.15;
    }
  });
  
  // Higher consciousness = more smooth, balanced
  const smoothness = 0.4 + (consciousnessScore / 100) * 0.4;
  
  return {
    speed: Math.max(0.5, Math.min(2.0, speed)),
    pulseRate: Math.max(0.5, Math.min(2.5, pulseRate)),
    reactivity: Math.max(0.2, Math.min(1.0, reactivity)),
    smoothness,
  };
}

/**
 * Default multi-thread profile when no data available
 */
export const DEFAULT_MULTI_THREAD_PROFILE: MultiThreadOrbProfile = {
  threads: [
    {
      id: 'default-0',
      label: 'Explorer',
      source: 'trait',
      color: '200 80% 50%',
      intensity: 0.8,
      animation: 'wave',
      layer: 0,
      rotationAxis: { x: 0.5, y: 0.8, z: 0.3 },
      rotationSpeed: 0.003,
    },
    {
      id: 'default-1',
      label: 'Curious',
      source: 'trait',
      color: '220 70% 55%',
      intensity: 0.6,
      animation: 'orbit',
      layer: 1,
      rotationAxis: { x: 0.3, y: 0.5, z: 0.8 },
      rotationSpeed: 0.004,
    },
  ],
  shape: {
    baseGeometry: 'icosahedron',
    edgeSharpness: 0.5,
    symmetry: 0.6,
    organicFlow: 0.5,
    complexity: 3,
  },
  coreGlow: {
    color: '200 80% 50%',
    intensity: 0.6,
    pulseRate: 1.0,
  },
  motionProfile: {
    speed: 1.0,
    pulseRate: 1.0,
    reactivity: 0.5,
    smoothness: 0.6,
  },
  consciousnessLevel: 50,
  dominantColors: ['200 80% 50%', '220 70% 55%'],
};
