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

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  // טכנולוגיה - ציאן-כחול חשמלי
  tech: {
    id: 'tech',
    name: 'Electric Neon',
    primary: '195 100% 50%',     // Bright Cyan
    secondary: '220 100% 60%',   // Electric Blue
    accent: '180 100% 70%',      // Bright Teal
    glow: '200 100% 80%',        // Light Cyan
    gradient: ['195 100% 50%', '220 100% 60%', '180 100% 70%'],
  },
  
  // יצירתיות - מגנטה-סגול
  creative: {
    id: 'creative',
    name: 'Vibrant Magenta',
    primary: '320 90% 55%',      // Hot Magenta
    secondary: '280 85% 60%',    // Vivid Purple
    accent: '340 100% 65%',      // Hot Pink
    glow: '300 100% 75%',        // Bright Violet
    gradient: ['320 90% 55%', '280 85% 60%', '340 100% 65%'],
  },
  
  // ספורט/פעולה - כתום-זהב
  action: {
    id: 'action',
    name: 'Fiery Gold',
    primary: '25 100% 55%',      // Vivid Orange
    secondary: '45 100% 55%',    // Golden Yellow
    accent: '15 100% 60%',       // Flame Orange
    glow: '35 100% 70%',         // Bright Gold
    gradient: ['25 100% 55%', '45 100% 55%', '15 100% 60%'],
  },
  
  // רוחניות - סגול עמוק-אינדיגו
  mystic: {
    id: 'mystic',
    name: 'Deep Mystic',
    primary: '270 85% 50%',      // Deep Purple
    secondary: '250 80% 55%',    // Indigo
    accent: '290 90% 65%',       // Violet
    glow: '260 100% 75%',        // Light Purple
    gradient: ['270 85% 50%', '250 80% 55%', '290 90% 65%'],
  },
  
  // חברתי/ריפוי - ירוק-טורקיז
  healing: {
    id: 'healing',
    name: 'Healing Teal',
    primary: '165 80% 45%',      // Teal
    secondary: '150 70% 50%',    // Sea Green
    accent: '175 85% 55%',       // Turquoise
    glow: '160 100% 70%',        // Light Teal
    gradient: ['165 80% 45%', '150 70% 50%', '175 85% 55%'],
  },
  
  // הרפתקנות - זהב-שמש
  explorer: {
    id: 'explorer',
    name: 'Golden Explorer',
    primary: '45 95% 55%',       // Bright Gold
    secondary: '35 90% 50%',     // Rich Orange Gold
    accent: '55 100% 60%',       // Sunny Yellow
    glow: '50 100% 75%',         // Light Gold
    gradient: ['45 95% 55%', '35 90% 50%', '55 100% 60%'],
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
    geometryDetail: 3 + Math.floor(normalizedLevel / 7),    // 3-7
    fractalOctaves: 2 + Math.floor(normalizedLevel / 6),    // 2-7
    particleCount: normalizedLevel > 3 ? 15 + normalizedLevel * 2 : 0,
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
  
  // Streak bonus
  const streakBonus = Math.min(streak, 30) / 30 * 0.15;
  
  return {
    palette: primary,
    secondaryPalette: secondary,
    
    intensity: Math.min(1, intensity + streakBonus),
    glowStrength: Math.min(1, glowStrength + streakBonus * 0.5),
    
    layerCount: complexity.layerCount,
    geometryDetail: complexity.geometryDetail,
    fractalOctaves: complexity.fractalOctaves,
    
    particleEnabled: complexity.particleCount > 0,
    particleCount: complexity.particleCount,
    
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

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  
  vec3 viewDir = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
  vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
  vFresnel = pow(1.0 - max(dot(viewDir, worldNormal), 0.0), 2.0);
  
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

void main() {
  // Dynamic gradient blend based on normal direction
  float blend1 = vNormal.y * 0.5 + 0.5 + sin(time * 0.5) * 0.1;
  float blend2 = sin(vPosition.x * 2.0 + time * 0.3) * 0.5 + 0.5;
  
  // Three-color gradient
  vec3 color = mix(
    mix(colorA, colorB, blend1),
    colorC,
    blend2 * 0.3 + sin(time * 0.7) * 0.15
  );
  
  // Add fresnel rim glow
  vec3 rimColor = colorC * 1.5;
  color = mix(color, rimColor, vFresnel * 0.6);
  
  // Intensity boost
  color *= intensity;
  
  gl_FragColor = vec4(color, 1.0);
}
`;
