/**
 * CanonicalAionModel — Phase 5B visual canonization.
 *
 * Single source of truth for the live AION visual. Wraps the same WebGL
 * `OrganicSphere` model used on the marketing hero and pins it to the AION
 * brand palette (cyan / violet / soft-blue glow) defined in `index.css`:
 *   --aion-cyan    188 95% 65%
 *   --aion-violet  265 85% 66%
 *   --aion-magenta 305 80% 65%
 *
 * Use `CANONICAL_AION_PROFILE` directly when feeding any OrbProfile-aware
 * renderer; use `<CanonicalAionModel />` to mount the model at a given size.
 * For personalized DNA orbs (Profile / Identity surfaces), pass an explicit
 * `profile` to `OrbView` instead — this canonical profile is reserved for
 * AION-as-presence.
 */
import OrbView from './v2/OrbView';
import type { OrbProfile } from './types';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';

const CYAN = '188 95% 65%';
const CYAN_DEEP = '198 85% 55%';
const VIOLET = '265 85% 66%';
const VIOLET_DEEP = '258 75% 50%';
const MAGENTA = '305 80% 65%';

/**
 * Canonical AION orb visual — the model behind the homepage hero, in the
 * logo's cyan→violet palette. Liquid-glass / iridescent material so the
 * surface always reads as "alive", never as a flat sphere.
 */
export const CANONICAL_AION_PROFILE: OrbProfile = {
  ...DEFAULT_ORB_PROFILE,
  // Core palette
  primaryColor: VIOLET,
  secondaryColors: [CYAN, MAGENTA],
  accentColor: CYAN,
  particleColor: CYAN,
  // Gradient
  gradientStops: [CYAN, CYAN_DEEP, VIOLET, VIOLET_DEEP, MAGENTA],
  gradientMode: 'noise',
  coreGradient: [CYAN, VIOLET],
  rimLightColor: CYAN,
  particlePalette: [CYAN, VIOLET, MAGENTA],
  // Material — iridescent reads closest to the homepage AION model
  materialType: 'iridescent',
  materialParams: {
    metalness: 0.35,
    roughness: 0.18,
    clearcoat: 0.85,
    transmission: 0.25,
    ior: 1.45,
    emissiveIntensity: 0.55,
  },
  patternType: 'swirl',
  patternIntensity: 0.55,
  // Motion / presence
  morphIntensity: 0.7,
  morphSpeed: 0.9,
  fractalOctaves: 4,
  coreIntensity: 0.85,
  coreSize: 0.32,
  layerCount: 3,
  geometryDetail: 5,
  motionSpeed: 1.05,
  pulseRate: 1.0,
  smoothness: 0.78,
  bloomStrength: 0.85,
  chromaShift: 0.35,
  dayNightBias: 0.35,
  geometryFamily: 'sphere',
  diagnosticState: 'ok',
};

interface CanonicalAionModelProps {
  size?: number;
  className?: string;
  audioLevel?: number;
  ariaLabel?: string;
  onClick?: () => void;
}

export default function CanonicalAionModel({
  size = 200,
  className,
  audioLevel,
  ariaLabel,
  onClick,
}: CanonicalAionModelProps) {
  return (
    <OrbView
      size={size}
      profile={CANONICAL_AION_PROFILE}
      tier={size > 256 ? 'cinematic' : 'standard'}
      audioLevel={audioLevel}
      className={className}
      ariaLabel={ariaLabel}
      onClick={onClick}
    />
  );
}