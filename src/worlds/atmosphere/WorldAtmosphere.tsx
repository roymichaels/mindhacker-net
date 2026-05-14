/**
 * WorldAtmosphere — cinematic environment layer for any cognitive world.
 *
 * Renders behind the scene inside `WorldShell`. Pure CSS + framer-motion;
 * no images, no decoration. Each world reads its `AtmospherePreset` and
 * a live `WorldState` (climate + momentum) to compose:
 *
 *   - depth gradient floor (palette spine)
 *   - 2 distant glow fields drifting per `motion` temperament
 *   - rim / volumetric / aurora light pass
 *   - particulate haze (density per preset, brightened by interaction)
 *   - climate veil (turbulent / heavy / open / charged colour bias)
 *
 * Pointer-events are off — the atmosphere never intercepts input.
 */
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useWorldState } from '@/worlds/state/useWorldState';
import { getAtmospherePreset, type MotionTemperament } from './atmospherePresets';
import type { CognitiveWorldId } from '../types';
import type { Climate } from '@/worlds/state/worldStateTypes';

interface Props {
  worldId: CognitiveWorldId;
  /** When true, atmosphere fills viewport (full-bleed). Otherwise it fills its parent. */
  fullBleed?: boolean;
}

const CLIMATE_TINT: Record<Climate, { hue: number; intensity: number }> = {
  still:     { hue: 0,   intensity: 0.0 },
  calm:      { hue: 200, intensity: 0.15 },
  open:      { hue: 180, intensity: 0.25 },
  charged:   { hue: 50,  intensity: 0.35 },
  heavy:     { hue: 270, intensity: 0.4 },
  turbulent: { hue: 330, intensity: 0.5 },
};

const MOTION_DRIFT: Record<MotionTemperament, { aDur: number; bDur: number; aDist: number; bDist: number }> = {
  orbital:      { aDur: 32, bDur: 38, aDist: 8,  bDist: 10 },
  weather:      { aDur: 22, bDur: 28, aDist: 14, bDist: 18 },
  tectonic:     { aDur: 60, bDur: 75, aDist: 4,  bDist: 6 },
  temporal:     { aDur: 45, bDur: 55, aDist: 10, bDist: 12 },
  social:       { aDur: 30, bDur: 36, aDist: 12, bDist: 14 },
  ritual:       { aDur: 26, bDur: 32, aDist: 6,  bDist: 8 },
  generative:   { aDur: 24, bDur: 30, aDist: 12, bDist: 16 },
  transcendent: { aDur: 50, bDur: 65, aDist: 6,  bDist: 8 },
  inward:       { aDur: 40, bDur: 50, aDist: 6,  bDist: 8 },
};

export default function WorldAtmosphere({ worldId, fullBleed = false }: Props) {
  const preset = getAtmospherePreset(worldId);
  const state = useWorldState(worldId);
  const drift = MOTION_DRIFT[preset.motion];
  const tint = CLIMATE_TINT[state.climate];

  // Momentum boosts ambient brightness slightly — the more the user works the
  // world, the more it "comes alive". Capped to stay quiet.
  const liveness = Math.min(1, preset.ambient + state.momentum * 0.25);

  const primary = `hsl(${preset.primaryHsl})`;
  const secondary = `hsl(${preset.secondaryHsl})`;
  const accent = `hsl(${preset.accentHsl})`;

  // Particulate field — generated once per worldId so it stays stable.
  const particles = useMemo(() => {
    const count = Math.round(8 + preset.particles * 18);
    const seed = worldId.charCodeAt(0) * 13;
    const layers: string[] = [];
    for (let i = 0; i < count; i++) {
      const x = ((seed * (i + 1) * 17) % 100).toFixed(1);
      const y = ((seed * (i + 3) * 23) % 100).toFixed(1);
      const a = (0.25 + ((i * 7) % 30) / 100).toFixed(2);
      layers.push(`radial-gradient(1px 1px at ${x}% ${y}%, hsl(0 0% 100% / ${a}), transparent 60%)`);
    }
    return layers.join(',');
  }, [worldId, preset.particles]);

  const containerCls = fullBleed
    ? 'pointer-events-none fixed inset-0 overflow-hidden'
    : 'pointer-events-none absolute inset-0 overflow-hidden';

  return (
    <div aria-hidden className={containerCls}>
      {/* Depth floor — palette spine */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% 30%, ${primary}30, transparent 55%),
                       radial-gradient(120% 80% at 50% 100%, ${secondary}45, transparent 60%)`,
          opacity: liveness,
          transition: 'opacity 1200ms ease',
        }}
      />

      {/* Distant glow A */}
      <motion.div
        className="absolute -top-[18%] -left-[15%] rounded-full blur-3xl"
        style={{
          width: `${50 + preset.depth * 8}vh`,
          height: `${50 + preset.depth * 8}vh`,
          background: `radial-gradient(closest-side, ${primary}, transparent 70%)`,
          opacity: 0.18 * liveness,
        }}
        animate={{ x: [0, drift.aDist, 0], y: [0, drift.aDist * 0.6, 0] }}
        transition={{ duration: drift.aDur, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Distant glow B */}
      <motion.div
        className="absolute top-[15%] -right-[18%] rounded-full blur-3xl"
        style={{
          width: `${55 + preset.depth * 8}vh`,
          height: `${55 + preset.depth * 8}vh`,
          background: `radial-gradient(closest-side, ${secondary}, transparent 70%)`,
          opacity: 0.16 * liveness,
        }}
        animate={{ x: [0, -drift.bDist, 0], y: [0, drift.bDist * 0.5, 0] }}
        transition={{ duration: drift.bDur, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Light pass — varies per quality */}
      {preset.light === 'volumetric' && (
        <div
          className="absolute inset-x-0 top-0 h-[60%]"
          style={{
            background: `radial-gradient(80% 60% at 50% 0%, ${accent}22, transparent 70%)`,
            opacity: liveness,
          }}
        />
      )}
      {preset.light === 'rim-light' && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 100% at 50% 50%, transparent 60%, ${primary}22 100%)`,
            opacity: liveness,
          }}
        />
      )}
      {preset.light === 'aurora' && (
        <motion.div
          className="absolute inset-x-0 top-[20%] h-[40%] blur-2xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${primary}33, ${accent}33, ${secondary}33, transparent)`,
            opacity: 0.5 * liveness,
          }}
          animate={{ x: ['-5%', '5%', '-5%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {preset.light === 'depth-fog' && (
        <div
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            background: `linear-gradient(180deg, transparent, ${secondary}55 70%, hsl(var(--background)) 100%)`,
            opacity: liveness,
          }}
        />
      )}

      {/* Climate veil */}
      {tint.intensity > 0 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(80% 60% at 50% 50%, hsl(${tint.hue} 70% 50% / ${tint.intensity * 0.18}), transparent 70%)`,
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: state.climate === 'turbulent' ? 5 : 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Particulate light — concept-art "stardust" axis */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{ backgroundImage: particles, opacity: 0.18 + preset.particles * 0.18 }}
      />

      {/* Edge vignette — pulls focus inward */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(120% 80% at 50% 50%, transparent 55%, hsl(var(--background) / 0.55) 100%)',
        }}
      />
    </div>
  );
}
