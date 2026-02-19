import type { ArchetypeId } from '@/lib/archetypes';

export type OrbState = 
  | 'idle'
  | 'listening'
  | 'speaking'
  | 'thinking'
  | 'session'
  | 'breathing';

export interface OrbRef {
  setSpeaking: (speaking: boolean) => void;
  setListening: (listening: boolean) => void;
  setThinking: (thinking: boolean) => void;
  updateState: (state: OrbState) => void;
  setAudioLevel: (level: number) => void;
  setTunnelMode: (enabled: boolean) => void;
}

export type GeometryFamily = 'sphere' | 'torus' | 'dodeca' | 'icosa' | 'octa' | 'spiky';
export type DiagnosticState = 'ok' | 'missing_data' | 'no_user';

// === NEW visual uniqueness types ===
export type GradientMode = 'vertical' | 'radial' | 'noise' | 'rim';
export type MaterialType = 'wire' | 'metal' | 'glass' | 'plasma' | 'iridescent';
export type PatternType = 'voronoi' | 'cellular' | 'fractal' | 'shards' | 'swirl' | 'strata';
export type ParticleMode = 'single' | 'cycle' | 'random' | 'byVelocity' | 'byRadius';
export type ParticleBehavior = 'orbit' | 'spiral' | 'halo' | 'burst' | 'drift';

export interface MaterialParams {
  metalness: number;
  roughness: number;
  clearcoat: number;
  transmission: number;
  ior: number;
  emissiveIntensity: number;
}

export interface OrbProfile {
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
  // Motion profile
  motionSpeed: number;
  pulseRate: number;
  smoothness: number;
  // Texture
  textureType: string;
  textureIntensity: number;
  // Per-user seed & geometry
  seed?: number;
  geometryFamily?: GeometryFamily;
  // Diagnostic
  diagnosticState?: DiagnosticState;
  missedFields?: string[];

  // === NEW: Visual Uniqueness Fields ===
  gradientStops: string[];         // 3-7 HSL color stops
  gradientMode: GradientMode;
  coreGradient: [string, string];
  rimLightColor: string;
  materialType: MaterialType;
  materialParams: MaterialParams;
  patternType: PatternType;
  patternIntensity: number;        // 0-1
  particlePalette: string[];       // 3-5 HSL colors
  particleMode: ParticleMode;
  particleBehavior: ParticleBehavior;
  bloomStrength: number;           // 0-1.5
  chromaShift: number;             // 0-0.8
  dayNightBias: number;            // 0-1 (0=dark, 1=bright)

  // Computed from data
  computedFrom: {
    dominantArchetype?: ArchetypeId;
    secondaryArchetype?: ArchetypeId | null;
    archetypeWeights?: { id: ArchetypeId; weight: number }[];
    dominantHobbies?: string[];
    // Legacy fields
    egoState?: string;
    level: number;
    streak: number;
    topTraitCategories?: string[];
    clarityScore: number;
    orb_profile_version?: string;
  };
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

export interface OrbProps {
  size?: number;
  state?: OrbState;
  audioLevel?: number;
  tunnelMode?: boolean;
  egoState?: string;
  className?: string;
  showGlow?: boolean;
  onReady?: () => void;
  renderer?: 'auto' | 'css' | 'webgl';
  profile?: OrbProfile;
  themeColors?: ThemeColors;
}

/** Default values for the new visual uniqueness fields */
export const VISUAL_DEFAULTS: Pick<OrbProfile, 'gradientStops' | 'gradientMode' | 'coreGradient' | 'rimLightColor' | 'materialType' | 'materialParams' | 'patternType' | 'patternIntensity' | 'particlePalette' | 'particleMode' | 'particleBehavior' | 'bloomStrength' | 'chromaShift' | 'dayNightBias'> = {
  gradientStops: ['200 80% 50%', '220 70% 55%', '180 75% 60%'],
  gradientMode: 'vertical',
  coreGradient: ['200 80% 50%', '180 75% 60%'],
  rimLightColor: '40 80% 65%',
  materialType: 'glass',
  materialParams: { metalness: 0.1, roughness: 0.4, clearcoat: 0.3, transmission: 0.2, ior: 1.5, emissiveIntensity: 0.3 },
  patternType: 'fractal',
  patternIntensity: 0.4,
  particlePalette: ['200 80% 60%', '260 70% 55%', '320 75% 60%'],
  particleMode: 'cycle',
  particleBehavior: 'orbit',
  bloomStrength: 0.4,
  chromaShift: 0.1,
  dayNightBias: 0.5,
};

export interface OrbContextValue {
  orbRef: React.RefObject<OrbRef | null>;
  state: OrbState;
  setState: (state: OrbState) => void;
  audioLevel: number;
  setAudioLevel: (level: number) => void;
  tunnelMode: boolean;
  setTunnelMode: (enabled: boolean) => void;
}
