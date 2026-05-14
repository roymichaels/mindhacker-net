/**
 * WorldShell — canonical container for any cognitive world.
 *
 * Top: AION presence anchor (canonical orb + world-scoped line).
 * Middle: WorldStage (the scene).
 * Bottom: WorldComposer (world-scoped verbs).
 */
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CanonicalAionModel from '@/components/orb/CanonicalAionModel';
import { useTranslation } from '@/hooks/useTranslation';
import { getWorld } from '@/worlds/registry';
import { useWorldAion } from '@/worlds/aion/useWorldAion';
import { useWorldProjection } from '@/worlds/graph/useWorldProjection';
import WorldStage from './WorldStage';
import WorldComposer from './WorldComposer';
import ScaffoldScene from './scenes/ScaffoldScene';
import RitualOrbitsScene from './scenes/RitualOrbitsScene';
import BandStackScene from './scenes/BandStackScene';
import type { CognitiveWorldId } from '@/worlds/types';
import { useWorldEvolution } from '@/worlds/evolution/useWorldEvolution';

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
  const navigate = useNavigate();
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

  return (
    <div className="mx-auto w-full max-w-md px-4 py-4 space-y-5" dir={isHe ? 'rtl' : 'ltr'}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={isHe ? 'חזור' : 'Back'}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center text-foreground/70"
          >
            <ArrowLeft className={`w-4 h-4 ${isHe ? 'rotate-180' : ''}`} />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.32em] text-foreground/40">
              {isHe ? 'עולם' : 'World'}
            </p>
            <p className="text-[14px] font-medium text-foreground/85">
              {isHe ? world.labelHe : world.labelEn}
            </p>
          </div>
          <div className="w-9 h-9" />
        </div>
      )}

      {!isBandStack && (
        <div className="flex flex-col items-center gap-3">
          <CanonicalAionModel size={140} ariaLabel="AION" />
          <p className="text-[12px] text-foreground/65 text-center max-w-xs">{aion.shortLine}</p>
        </div>
      )}

      {isBandStack ? scene : <WorldStage>{scene}</WorldStage>}

      {!isBandStack && <WorldComposer verbs={aion.verbs} worldId={worldId} />}
    </div>
  );
}
