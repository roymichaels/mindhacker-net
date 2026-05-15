/**
 * WorldTerrainScene — Phase 5D.1.
 *
 * Flagship "world is the interface" surface. Composes the depth spine
 * (CosmosLayer + HazeLayer come from ShellV2 globally) with a
 * PlanetHorizonLayer + AnchorField. No card frames, no list, no
 * summary panel. The whisper title fades after entry and the world
 * stays. Mobile-first by construction.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { usePresenceParallax, SACRED_DURATION, SACRED_EASE } from '@/universe';
import PlanetHorizonLayer from './PlanetHorizonLayer';
import AnchorField from './AnchorField';

const WHISPER_VISIBLE_MS = 4200;

export default function WorldTerrainScene() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const parallax = usePresenceParallax(0.6);

  const [whisperVisible, setWhisperVisible] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setWhisperVisible(false), WHISPER_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative w-full h-full overflow-hidden"
      data-shellv2-layer="chat"
      data-shellv2-route="outer-world"
    >
      {/* Structure layer — terrain horizon. */}
      <PlanetHorizonLayer parallax={parallax} />

      {/* Anchor layer — pins + bridges. */}
      <AnchorField parallax={parallax} />

      {/* Title whisper — top, dissolves into the field. */}
      <AnimatePresence>
        {whisperVisible && (
          <motion.div
            key="whisper"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: SACRED_DURATION.dissolve, ease: SACRED_EASE.dissolve }}
            className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+72px)] flex flex-col items-center px-6"
            style={{ zIndex: 18 }}
          >
            <p className="aion-text-hero text-[12px] tracking-[0.32em] uppercase text-foreground/55">
              {isHe ? 'העולם החיצוני' : 'Outer World'}
            </p>
            <p className="mt-2 text-center text-[12px] text-foreground/45 max-w-[20rem] leading-relaxed">
              {isHe
                ? 'מיפוי המציאות שמחוץ לך. אנשים, הזדמנויות, מקומות.'
                : 'A map of the reality outside you. People, opportunities, places.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}