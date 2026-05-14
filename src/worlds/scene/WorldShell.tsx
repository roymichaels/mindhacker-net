/**
 * WorldShell — canonical container for any cognitive world.
 *
 * Top: AION presence anchor (canonical orb + world-scoped line).
 * Middle: WorldStage (the scene).
 * Bottom: WorldComposer (world-scoped verbs).
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { getWorld } from '@/worlds/registry';
import { useWorldAion } from '@/worlds/aion/useWorldAion';
import { useWorldProjection } from '@/worlds/graph/useWorldProjection';
import AmbientGesture from './AmbientGesture';
import ScaffoldScene from './scenes/ScaffoldScene';
import RitualOrbitsScene from './scenes/RitualOrbitsScene';
import BandStackScene from './scenes/BandStackScene';
import type { CognitiveWorldId } from '@/worlds/types';
import { useWorldEvolution } from '@/worlds/evolution/useWorldEvolution';
import WorldAtmosphere from '@/worlds/atmosphere/WorldAtmosphere';

interface Props {
  worldId: CognitiveWorldId;
  /** Render override — used by SelfWorld to inject its band-stack scene. */
  sceneOverride?: React.ReactNode;
  /** Hide top nav (used when embedded inside the Profile modal). */
  embedded?: boolean;
  onOpenAdvanced?: () => void;
}

export default function WorldShell({ worldId, sceneOverride, embedded, onOpenAdvanced }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const world = getWorld(worldId);
  const aion = useWorldAion(worldId);
  const projection = useWorldProjection(worldId);
  useWorldEvolution(worldId);

  if (!world || !aion) {
    return (
      <div className="p-6 text-center text-foreground/50 text-sm">
        {isHe ? 'העולם לא נמצא' : 'World not found'}
      </div>
    );
  }

  let scene: React.ReactNode = sceneOverride;
  if (!scene) {
    if (world.scene.kind === 'band-stack') {
      scene = <BandStackScene onOpenAdvanced={onOpenAdvanced} />;
    } else if (world.scene.kind === 'ritual-orbits') {
      scene = <RitualOrbitsScene projection={projection} accentHsl={world.scene.accentHsl} />;
    } else {
      scene = <ScaffoldScene world={world} />;
    }
  }

  const isBandStack = world.scene.kind === 'band-stack';

  // SelfWorld stays in its scrolling band-stack chrome — it's the
  // identity hub, not a spatial world. Everything else goes full-bleed.
  if (isBandStack) {
    return (
      <div className="relative mx-auto w-full max-w-md px-4 py-4 space-y-5" dir={isHe ? 'rtl' : 'ltr'}>
        {embedded ? <WorldAtmosphere worldId={worldId} /> : <WorldAtmosphere worldId={worldId} fullBleed />}
        {scene}
      </div>
    );
  }

  return <ImmersiveWorldShell worldId={worldId} aionLine={aion.shortLine} verbs={aion.verbs} embedded={embedded}>{scene}</ImmersiveWorldShell>;
}

/**
 * Immersive world layout — Phase 5C "enter, don't open".
 * No header, no card frame, no verb bar. Atmosphere = page.
 * The orb is rendered globally by `PersistentWorldOrb` in App.tsx.
 */
function ImmersiveWorldShell({
  worldId,
  aionLine,
  verbs,
  embedded,
  children,
}: {
  worldId: CognitiveWorldId;
  aionLine: string;
  verbs: { id: string; label: string }[];
  embedded?: boolean;
  children: React.ReactNode;
}) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  // Whisper — name of the world surfaces once on entry, then dissolves.
  const [whisperVisible, setWhisperVisible] = useState(true);
  useEffect(() => {
    setWhisperVisible(true);
    const t = window.setTimeout(() => setWhisperVisible(false), 4200);
    return () => window.clearTimeout(t);
  }, [worldId]);

  return (
    <div
      className={embedded ? 'relative w-full h-full overflow-hidden' : 'fixed inset-0 z-20 overflow-hidden'}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      <WorldAtmosphere worldId={worldId} fullBleed={!embedded} />

      {/* Scene — full-bleed, no card. Centered in the available space. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-2xl">{children}</div>
      </div>

      {/* AION whisper — surfaces once on entry, dissolves into the atmosphere. */}
      <AnimatePresence>
        {whisperVisible && (
          <motion.div
            key={`whisper-${worldId}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-x-0 top-[18%] flex justify-center px-6"
          >
            <p className="text-center text-[12px] text-foreground/65 max-w-xs leading-relaxed">
              {aionLine}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!embedded && <AmbientGesture worldId={worldId} verbs={verbs} />}
    </div>
  );
}
