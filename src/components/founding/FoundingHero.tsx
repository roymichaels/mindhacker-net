import { motion } from 'framer-motion';
import { Orb } from '@/components/orb/Orb';
import { VISUAL_DEFAULTS } from '@/components/orb/types';
import type { OrbProfile } from '@/components/orb/types';

const heroOrbProfile: OrbProfile = {
  primaryColor: 'hsl(265, 85%, 55%)',
  secondaryColors: ['hsl(190, 95%, 45%)', 'hsl(230, 80%, 60%)'],
  accentColor: 'hsl(280, 90%, 65%)',
  morphSpeed: 0.3,
  morphIntensity: 0.6,
  fractalOctaves: 3,
  coreIntensity: 0.7,
  coreSize: 0.4,
  layerCount: 3,
  geometryDetail: 4,
  particleEnabled: true,
  particleCount: 20,
  particleColor: 'hsl(265, 85%, 65%)',
  motionSpeed: 0.5,
  pulseRate: 0.5,
  smoothness: 0.8,
  textureType: 'plasma',
  textureIntensity: 0.5,
  ...VISUAL_DEFAULTS,
  computedFrom: { level: 1, streak: 0, clarityScore: 50 },
};

interface Props {
  onCTA: () => void;
}

const FoundingHero = ({ onCTA }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 text-center relative z-10" dir="rtl">
      {/* Glowing orb */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-[60px] opacity-50"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6), rgba(6,182,212,0.3))' }} />
          <Orb
            size={180}
            renderer="css"
            primaryColor="hsl(265, 85%, 55%)"
            secondaryColors={['hsl(190, 95%, 45%)', 'hsl(230, 80%, 60%)']}
            accentColor="hsl(280, 90%, 65%)"
            morphSpeed={0.3}
            morphIntensity={0.6}
            particleEnabled={true}
            particleCount={20}
          />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6"
        style={{ textShadow: '0 0 40px rgba(124,58,237,0.3)' }}
      >
        אני בונה מערכת חדשה לחיים —
        <br />
        ואני פותח את המעגל הראשון
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 max-w-lg"
      >
        מערכת שעוזרת לך להתקדם,
        <br />
        לבנות את עצמך,
        <br />
        ואפילו להתחיל להרוויח תוך כדי
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        onClick={onCTA}
        className="py-4 px-10 rounded-2xl text-white font-bold text-lg"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          boxShadow: '0 0 30px rgba(124,58,237,0.5), 0 0 60px rgba(6,182,212,0.2)',
        }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
      >
        הגש בקשה להצטרף
      </motion.button>
    </div>
  );
};

export default FoundingHero;
