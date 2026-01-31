/**
 * Orb Visual System - Simplified Direct Mapping
 * 
 * מיפוי ישיר מנתוני משתמש לפרופיל ויזואלי ללא שכבות ביניים מיותרות
 * 
 * User Data → Visual Profile → THREE.js
 */

// ============== COLOR PALETTES ==============
// 6 פלטות מוגדרות מראש - צבעים נקיים ובהירים

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;      // Main vibrant color
  secondary: string;    // Complementary color
  accent: string;       // Highlight/glow color
  glow: string;         // Outer glow color
  gradient: string[];   // For layered effects
}

// ============== MORPHOLOGY - GEOMETRIC SHAPES ==============
// Each life approach creates distinct geometric pulsation patterns

export interface MorphologyProfile {
  // Shape deformation
  edgeSharpness: number;    // 0=smooth organic, 1=sharp crystalline
  spikeCount: number;       // Number of geometric spikes (0=sphere, 4=tetrahedron, 6=cube, 12=dodecahedron)
  spikeIntensity: number;   // How pronounced the spikes are
  symmetry: number;         // Symmetry level (higher = more geometric)
  
  // Animation pattern
  pulsePattern: 'sine' | 'square' | 'triangle' | 'sawtooth' | 'organic';
  rotationAxis: 'y' | 'x' | 'z' | 'diagonal' | 'wobble';
  breathingRate: number;    // Speed of breathing animation
  
  // Fractal complexity
  noiseScale: number;       // Scale of fractal noise
  noiseOctaves: number;     // Complexity layers
  waveFrequency: number;    // Wave deformation frequency
}

export const MORPHOLOGY_PROFILES: Record<string, MorphologyProfile> = {
  // Tech - Crystalline Icosahedron (sharp, geometric, digital)
  tech: {
    edgeSharpness: 0.85,
    spikeCount: 20,         // Icosahedron-like
    spikeIntensity: 0.15,
    symmetry: 0.95,
    pulsePattern: 'square',
    rotationAxis: 'y',
    breathingRate: 1.2,
    noiseScale: 2.5,
    noiseOctaves: 3,
    waveFrequency: 8,
  },
  
  // Creative - Fluid Star (asymmetric, flowing, expressive)
  creative: {
    edgeSharpness: 0.4,
    spikeCount: 7,          // Star-like
    spikeIntensity: 0.25,
    symmetry: 0.3,
    pulsePattern: 'organic',
    rotationAxis: 'wobble',
    breathingRate: 0.9,
    noiseScale: 1.8,
    noiseOctaves: 5,
    waveFrequency: 3,
  },
  
  // Action - Octahedron (dynamic, angular, powerful)
  action: {
    edgeSharpness: 0.75,
    spikeCount: 8,          // Octahedron
    spikeIntensity: 0.3,
    symmetry: 0.8,
    pulsePattern: 'triangle',
    rotationAxis: 'diagonal',
    breathingRate: 1.5,
    noiseScale: 2.0,
    noiseOctaves: 2,
    waveFrequency: 6,
  },
  
  // Mystic - Ethereal Dodecahedron (flowing, mystical, complex)
  mystic: {
    edgeSharpness: 0.3,
    spikeCount: 12,         // Dodecahedron
    spikeIntensity: 0.12,
    symmetry: 0.6,
    pulsePattern: 'sine',
    rotationAxis: 'x',
    breathingRate: 0.6,
    noiseScale: 1.2,
    noiseOctaves: 6,
    waveFrequency: 2,
  },
  
  // Healing - Soft Sphere (smooth, organic, nurturing)
  healing: {
    edgeSharpness: 0.1,
    spikeCount: 0,          // Pure sphere
    spikeIntensity: 0.05,
    symmetry: 0.9,
    pulsePattern: 'sine',
    rotationAxis: 'y',
    breathingRate: 0.5,
    noiseScale: 0.8,
    noiseOctaves: 4,
    waveFrequency: 1,
  },
  
  // Explorer - Tetrahedron Burst (adventurous, multi-faceted)
  explorer: {
    edgeSharpness: 0.6,
    spikeCount: 4,          // Tetrahedron base
    spikeIntensity: 0.2,
    symmetry: 0.7,
    pulsePattern: 'sawtooth',
    rotationAxis: 'wobble',
    breathingRate: 1.0,
    noiseScale: 1.5,
    noiseOctaves: 4,
    waveFrequency: 4,
  },
};

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  // טכנולוגיה - ציאן-מגנטה חייזרי (Alien Mercury)
  tech: {
    id: 'tech',
    name: 'Alien Cyber',
    primary: '185 100% 60%',     // Bright Alien Cyan
    secondary: '280 100% 65%',   // Vivid Purple
    accent: '320 100% 70%',      // Hot Magenta
    glow: '200 100% 85%',        // Electric Cyan Glow
    gradient: ['185 100% 60%', '280 100% 65%', '320 100% 70%', '45 100% 65%'],
  },
  
  // יצירתיות - מגנטה-ציאן קוסמי (Cosmic Creator)
  creative: {
    id: 'creative',
    name: 'Cosmic Creator',
    primary: '310 100% 65%',     // Hot Magenta
    secondary: '190 100% 60%',   // Alien Cyan
    accent: '45 100% 70%',       // Electric Gold
    glow: '280 100% 80%',        // Purple Glow
    gradient: ['310 100% 65%', '190 100% 60%', '45 100% 70%', '160 100% 60%'],
  },
  
  // ספורט/פעולה - כתום-סגול אנרגטי (Energy Burst)
  action: {
    id: 'action',
    name: 'Energy Burst',
    primary: '25 100% 60%',      // Vivid Orange
    secondary: '280 100% 60%',   // Electric Purple
    accent: '55 100% 70%',       // Bright Yellow
    glow: '15 100% 75%',         // Orange Glow
    gradient: ['25 100% 60%', '280 100% 60%', '55 100% 70%', '320 100% 65%'],
  },
  
  // רוחניות - סגול-ציאן אתרי (Ethereal Mystic)
  mystic: {
    id: 'mystic',
    name: 'Ethereal Mystic',
    primary: '270 100% 65%',     // Deep Vivid Purple
    secondary: '190 100% 60%',   // Ethereal Cyan
    accent: '320 100% 70%',      // Mystic Magenta
    glow: '250 100% 80%',        // Indigo Glow
    gradient: ['270 100% 65%', '190 100% 60%', '320 100% 70%', '160 100% 55%'],
  },
  
  // חברתי/ריפוי - ציאן-מגנטה מרפא (Healing Aura)
  healing: {
    id: 'healing',
    name: 'Healing Aura',
    primary: '165 100% 55%',     // Vibrant Teal
    secondary: '310 100% 60%',   // Soft Magenta
    accent: '55 100% 65%',       // Warm Yellow
    glow: '175 100% 75%',        // Turquoise Glow
    gradient: ['165 100% 55%', '310 100% 60%', '55 100% 65%', '280 90% 60%'],
  },
  
  // הרפתקנות - זהב-ציאן הרפתקני (Explorer's Flame)
  explorer: {
    id: 'explorer',
    name: 'Explorer\'s Flame',
    primary: '45 100% 60%',      // Bright Gold
    secondary: '185 100% 60%',   // Adventure Cyan
    accent: '15 100% 65%',       // Flame Orange
    glow: '55 100% 80%',         // Golden Glow
    gradient: ['45 100% 60%', '185 100% 60%', '15 100% 65%', '320 100% 60%'],
  },
};

// ============== HOBBY TO PALETTE MAPPING ==============

const HOBBY_PALETTE_MAP: Record<string, string> = {
  // טכנולוגיה
  'gaming': 'tech',
  'coding': 'tech',
  'technology': 'tech',
  'computers': 'tech',
  'programming': 'tech',
  'video_games': 'tech',
  'robotics': 'tech',
  'electronics': 'tech',
  'ai': 'tech',
  'data_science': 'tech',
  
  // יצירתיות
  'art': 'creative',
  'music': 'creative',
  'writing': 'creative',
  'photography': 'creative',
  'design': 'creative',
  'dancing': 'creative',
  'crafts': 'creative',
  'painting': 'creative',
  'drawing': 'creative',
  'singing': 'creative',
  'theater': 'creative',
  'fashion': 'creative',
  
  // ספורט/פעולה
  'sports': 'action',
  'fitness': 'action',
  'martial_arts': 'action',
  'running': 'action',
  'gym': 'action',
  'basketball': 'action',
  'football': 'action',
  'soccer': 'action',
  'swimming': 'action',
  'cycling': 'action',
  'yoga': 'action',
  
  // רוחניות
  'meditation': 'mystic',
  'spirituality': 'mystic',
  'philosophy': 'mystic',
  'astrology': 'mystic',
  'mindfulness': 'mystic',
  'tarot': 'mystic',
  'energy_work': 'mystic',
  
  // חברתי/ריפוי
  'volunteering': 'healing',
  'therapy': 'healing',
  'counseling': 'healing',
  'social_work': 'healing',
  'community': 'healing',
  'helping_others': 'healing',
  'caregiving': 'healing',
  'nursing': 'healing',
  'psychology': 'healing',
  
  // הרפתקנות
  'travel': 'explorer',
  'hiking': 'explorer',
  'camping': 'explorer',
  'exploration': 'explorer',
  'adventure': 'explorer',
  'nature': 'explorer',
  'outdoors': 'explorer',
  'climbing': 'explorer',
  'backpacking': 'explorer',
  'photography_nature': 'explorer',
};

// ============== VISUAL PROFILE ==============

export interface OrbVisualProfile {
  // Colors - no blending, clean palette
  palette: ColorPalette;
  secondaryPalette: ColorPalette | null;
  
  // Morphology - geometric shape behavior
  morphology: MorphologyProfile;
  
  // Intensity based on level
  intensity: number;        // 0-1
  glowStrength: number;     // 0-1
  
  // Complexity based on progression
  layerCount: number;       // 2-5
  geometryDetail: number;   // 3-6
  fractalOctaves: number;   // 2-6
  
  // Particles
  particleEnabled: boolean;
  particleCount: number;
  
  // Core
  coreSize: number;         // 0.2-0.5
  coreIntensity: number;    // 0.5-1.0
  
  // Animation
  morphIntensity: number;   // 0.1-0.5
  morphSpeed: number;       // 0.5-1.5
  pulseRate: number;        // 0.5-1.5
  
  // Metadata
  dominantHobbyCategory: string;
  level: number;
}

/**
 * Get morphology profile for a palette ID
 */
export function getMorphology(paletteId: string): MorphologyProfile {
  return MORPHOLOGY_PROFILES[paletteId] || MORPHOLOGY_PROFILES.explorer;
}

// ============== CORE FUNCTIONS ==============

/**
 * Get the dominant palette from hobbies
 */
export function hobbyToPalette(hobbies: string[]): { primary: ColorPalette; secondary: ColorPalette | null } {
  if (!hobbies || hobbies.length === 0) {
    return { primary: COLOR_PALETTES.explorer, secondary: null };
  }
  
  // Count occurrences of each palette category
  const paletteCounts: Record<string, number> = {};
  
  hobbies.forEach((hobby, index) => {
    const normalizedHobby = hobby.toLowerCase().replace(/[^a-z_]/g, '_');
    const paletteId = HOBBY_PALETTE_MAP[normalizedHobby];
    
    if (paletteId) {
      // Earlier hobbies have more weight
      const weight = hobbies.length - index;
      paletteCounts[paletteId] = (paletteCounts[paletteId] || 0) + weight;
    }
  });
  
  // Sort by count
  const sorted = Object.entries(paletteCounts)
    .sort((a, b) => b[1] - a[1]);
  
  if (sorted.length === 0) {
    return { primary: COLOR_PALETTES.explorer, secondary: null };
  }
  
  const primary = COLOR_PALETTES[sorted[0][0]] || COLOR_PALETTES.explorer;
  const secondary = sorted.length > 1 
    ? COLOR_PALETTES[sorted[1][0]] || null 
    : null;
  
  return { primary, secondary };
}

/**
 * Convert level to intensity values
 */
export function levelToIntensity(level: number): { intensity: number; glowStrength: number } {
  const normalizedLevel = Math.min(level, 30);
  
  return {
    intensity: 0.6 + (normalizedLevel / 30) * 0.4,
    glowStrength: 0.5 + (normalizedLevel / 30) * 0.5,
  };
}

/**
 * Convert level to complexity values
 */
export function levelToComplexity(level: number): {
  layerCount: number;
  geometryDetail: number;
  fractalOctaves: number;
  particleCount: number;
} {
  const normalizedLevel = Math.min(level, 30);
  
  return {
    layerCount: 2 + Math.floor(normalizedLevel / 8),        // 2-5
    geometryDetail: 4 + Math.floor(normalizedLevel / 6),    // 4-9
    fractalOctaves: 3 + Math.floor(normalizedLevel / 6),    // 3-8
    particleCount: 80 + normalizedLevel * 4,                // Always 80-200 particles
  };
}

/**
 * Generate a complete visual profile
 */
export function generateVisualProfile(
  hobbies: string[],
  level: number = 1,
  streak: number = 0
): OrbVisualProfile {
  const { primary, secondary } = hobbyToPalette(hobbies);
  const { intensity, glowStrength } = levelToIntensity(level);
  const complexity = levelToComplexity(level);
  const morphology = getMorphology(primary.id);
  
  // Streak bonus
  const streakBonus = Math.min(streak, 30) / 30 * 0.15;
  
  return {
    palette: primary,
    secondaryPalette: secondary,
    morphology,
    
    intensity: Math.min(1, intensity + streakBonus),
    glowStrength: Math.min(1, glowStrength + streakBonus * 0.5),
    
    layerCount: complexity.layerCount,
    geometryDetail: complexity.geometryDetail,
    fractalOctaves: complexity.fractalOctaves,
    
    particleEnabled: true, // Always enable particles
    particleCount: Math.max(40, complexity.particleCount), // Minimum 40 particles
    
    coreSize: 0.25 + level * 0.012,
    coreIntensity: 0.6 + (level / 30) * 0.4,
    
    morphIntensity: 0.15 + (level / 30) * 0.2,
    morphSpeed: 0.8 + (level / 30) * 0.4,
    pulseRate: 0.8 + streak * 0.02,
    
    dominantHobbyCategory: primary.id,
    level,
  };
}

/**
 * Convert visual profile to legacy OrbProfile format
 * For backwards compatibility with existing components
 */
export function visualProfileToOrbProfile(vp: OrbVisualProfile): {
  primaryColor: string;
  secondaryColors: string[];
  accentColor: string;
  morphIntensity: number;
  morphSpeed: number;
  fractalOctaves: number;
  coreIntensity: number;
  coreSize: number;
  layerCount: number;
  geometryDetail: number;
  particleEnabled: boolean;
  particleCount: number;
  particleColor: string;
} {
  return {
    primaryColor: vp.palette.primary,
    secondaryColors: [vp.palette.secondary, vp.palette.accent],
    accentColor: vp.palette.accent,
    morphIntensity: vp.morphIntensity,
    morphSpeed: vp.morphSpeed,
    fractalOctaves: vp.fractalOctaves,
    coreIntensity: vp.coreIntensity,
    coreSize: vp.coreSize,
    layerCount: vp.layerCount,
    geometryDetail: vp.geometryDetail,
    particleEnabled: vp.particleEnabled,
    particleCount: vp.particleCount,
    particleColor: vp.palette.glow,
  };
}

// ============== SHADER UTILITIES ==============

/**
 * Parse HSL string to RGB values for shaders
 */
export function hslToRgb(hsl: string): [number, number, number] {
  const parts = hsl.split(' ');
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [r, g, b];
}

/**
 * Get gradient shader uniforms from palette
 */
export function paletteToShaderColors(palette: ColorPalette): {
  colorA: [number, number, number];
  colorB: [number, number, number];
  colorC: [number, number, number];
} {
  return {
    colorA: hslToRgb(palette.primary),
    colorB: hslToRgb(palette.secondary),
    colorC: hslToRgb(palette.accent),
  };
}

// ============== GRADIENT SHADER CODE ==============

export const GRADIENT_VERTEX_SHADER = `
varying vec3 vNormal;
varying vec3 vPosition;
varying float vFresnel;
varying vec3 vWorldPos;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
  vFresnel = pow(1.0 - max(dot(viewDir, worldNormal), 0.0), 1.8);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const GRADIENT_FRAGMENT_SHADER = `
uniform vec3 colorA;
uniform vec3 colorB;
uniform vec3 colorC;
uniform float time;
uniform float intensity;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vFresnel;
varying vec3 vWorldPos;

// Rainbow hue shift for liquid mercury effect
vec3 hueShift(vec3 color, float shift) {
  vec3 p = vec3(0.55735) * dot(vec3(0.55735), color);
  vec3 u = color - p;
  vec3 v = cross(vec3(0.55735), u);
  return u * cos(shift * 6.28318) + v * sin(shift * 6.28318) + p;
}

void main() {
  // Multi-axis gradient blend for fluid motion
  float blend1 = vNormal.y * 0.5 + 0.5 + sin(time * 0.7 + vPosition.x * 2.0) * 0.2;
  float blend2 = sin(vPosition.x * 3.0 + vPosition.z * 2.0 + time * 0.5) * 0.5 + 0.5;
  float blend3 = cos(vPosition.y * 2.5 + time * 0.4) * 0.5 + 0.5;
  
  // Rainbow iridescence based on view angle - ALIEN MERCURY EFFECT
  float hueOffset = vFresnel * 0.4 + sin(time * 0.3 + vPosition.x + vPosition.y) * 0.15;
  
  // Liquid swirl pattern
  float swirl = sin(vPosition.x * 4.0 + vPosition.y * 3.0 + vPosition.z * 5.0 + time * 0.6) * 0.5 + 0.5;
  
  // Three-color gradient with swirl
  vec3 color1 = mix(colorA, colorB, blend1);
  vec3 color2 = mix(color1, colorC, blend2 * 0.4 + swirl * 0.3);
  
  // Apply rainbow hue shift for iridescence
  vec3 iridescentColor = hueShift(color2, hueOffset);
  
  // Bright fresnel rim with color cycling
  vec3 rimColor = hueShift(colorC * 2.0, vFresnel * 0.3 + time * 0.1);
  iridescentColor = mix(iridescentColor, rimColor, vFresnel * 0.8);
  
  // Hot spots for liquid mercury shine
  float hotSpot = pow(max(0.0, sin(vPosition.x * 6.0 + time * 2.0) * sin(vPosition.y * 5.0 + time * 1.5)), 4.0);
  iridescentColor += vec3(1.0, 0.95, 0.9) * hotSpot * 0.4;
  
  // Secondary color pops
  float colorPop = pow(swirl * blend3, 2.0);
  iridescentColor += hueShift(colorB, time * 0.2) * colorPop * 0.3;
  
  // Intensity boost with slight bloom simulation
  iridescentColor *= intensity * 1.2;
  
  gl_FragColor = vec4(iridescentColor, 0.95);
}
`;
