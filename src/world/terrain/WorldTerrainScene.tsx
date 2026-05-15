/**
 * WorldTerrainScene — Phase 5D.1.
 *
 * Flagship "world is the interface" surface. Composes the depth spine
 * (CosmosLayer + HazeLayer come from ShellV2 globally) with a
 * PlanetHorizonLayer + AnchorField. No card frames, no list, no
 * summary panel. The whisper title fades after entry and the world
 * stays. Mobile-first by construction.
 */
/**
 * WorldTerrainScene — Phase 5D.1B.
 *
 * Composes the deepened universe spine for `/outer-world`:
 *   - PlanetHorizonLayer (multi-rate parallax body + rim)
 *   - TerrainValleyLayer (ridges + ground plane + drifting fog)
 *   - AnchorField        (pins + flowing rivers)
 *
 * Adds a top-light wash so all layers share one light source, plus a
 * scene-local bottom void that anchors the composer area into the
 * terrain. The whisper title is shorter and dimmer.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { usePresenceParallax, SACRED_DURATION, SACRED_EASE } from '@/universe';
import PlanetHorizonLayer from './PlanetHorizonLayer';
import TerrainValleyLayer from './TerrainValleyLayer';
import AnchorField from './AnchorField';

const WHISPER_VISIBLE_MS = 3000;

interface Props {
  /** Optional overlay slot (e.g. legacy bottom-sheet trigger). */
  footer?: ReactNode;
}

export default function WorldTerrainScene({ footer }: Props) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const parallax = usePresenceParallax(0.6);

  // Multi-rate parallax slices — one source, three planes.
  const parallaxDistant = { x: parallax.x * 0.25, y: parallax.y * 0.25 };
  const parallaxMid = { x: parallax.x * 0.6, y: parallax.y * 0.6 };
  const parallaxNear = parallax;

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
      {/* Top-light wash — single warm/cool source so every layer agrees. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh]"
        style={{
          background:
            'radial-gradient(80% 70% at 50% 0%, hsl(var(--aion-cyan) / 0.10) 0%, hsl(var(--aion-violet) / 0.06) 45%, transparent 80%)',
          zIndex: 13,
        }}
      />

      {/* Structure (far) — planet horizon arc. */}
      <PlanetHorizonLayer
        parallaxBody={parallaxDistant}
        parallaxRim={parallaxMid}
      />

      {/* Structure (mid) — terrain valley. */}
      <TerrainValleyLayer parallax={parallaxMid} />

      {/* Anchors (near) — pins + flowing rivers. */}
      <AnchorField parallax={parallaxNear} />

      {/* Scene-local bottom void — softer than AtmosphereLayer's, warmer
          near the horizon edge. Anchors composer into the terrain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[28vh]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, hsl(240 50% 3% / 0.65) 55%, hsl(240 50% 2%) 100%)',
          zIndex: 17,
        }}
      />

      {/* Title whisper — short, dim. */}
      <AnimatePresence>
        {whisperVisible && (
          <motion.div
            key="whisper"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.45, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: SACRED_DURATION.dissolve, ease: SACRED_EASE.dissolve }}
            className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+72px)] flex flex-col items-center px-6"
            style={{ zIndex: 18 }}
          >
            <p className="aion-text-hero text-[11px] tracking-[0.32em] uppercase text-foreground/50">
              {isHe ? 'העולם החיצוני' : 'Outer World'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer slot — used by OuterWorldHub for the legacy chevron. */}
      {footer && (
        <div
          className="absolute inset-x-0 flex justify-center pointer-events-none"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
            zIndex: 19,
          }}
        >
          <div className="pointer-events-auto">{footer}</div>
        </div>
      )}
    </div>
  );
}