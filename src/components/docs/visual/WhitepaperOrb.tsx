/**
 * WhitepaperOrb — A showcase CSSOrb for the visual whitepaper hero slide.
 * Uses a vibrant preset profile so it's never black.
 */
import { CSSOrb } from '@/components/orb/CSSOrb';
import { VISUAL_DEFAULTS } from '@/components/orb/types';
import type { OrbProfile } from '@/components/orb/types';
import { motion } from 'framer-motion';

const WHITEPAPER_ORB_PROFILE: OrbProfile = {
  primaryColor: 'hsl(271, 81%, 50%)',
  secondaryColors: ['hsl(187, 85%, 45%)', 'hsl(320, 80%, 55%)'],
  accentColor: 'hsl(45, 90%, 55%)',
  morphIntensity: 0.2,
  morphSpeed: 0.8,
  fractalOctaves: 4,
  coreIntensity: 0.8,
  coreSize: 0.3,
  layerCount: 5,
  geometryDetail: 5,
  particleEnabled: true,
  particleCount: 60,
  particleColor: 'hsl(271, 81%, 65%)',
  motionSpeed: 0.6,
  pulseRate: 0.4,
  smoothness: 0.8,
  textureType: 'noise',
  textureIntensity: 0.5,
  seed: 42,
  geometryFamily: 'sphere',
  ...VISUAL_DEFAULTS,
  gradientStops: ['271 81% 50%', '187 85% 45%', '320 80% 55%', '45 90% 55%'],
  gradientMode: 'radial',
  coreGradient: ['271 81% 55%', '187 85% 50%'],
  rimLightColor: '45 90% 65%',
  materialType: 'iridescent',
  bloomStrength: 0.7,
  chromaShift: 0.3,
  dayNightBias: 0.6,
  computedFrom: {
    level: 50,
    streak: 30,
    clarityScore: 80,
  },
};

interface Props {
  size?: number;
}

export function WhitepaperOrb({ size = 200 }: Props) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <CSSOrb
        size={size}
        state="idle"
        profile={WHITEPAPER_ORB_PROFILE}
        showGlow={true}
      />
    </motion.div>
  );
}
