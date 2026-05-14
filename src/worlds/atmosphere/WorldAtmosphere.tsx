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
import { useWorldClimate } from '@/worlds/runtime/useWorldClimate';

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
  const climate = useWorldClimate(worldId);
  const drift = MOTION_DRIFT[preset.motion];
  const tint = CLIMATE_TINT[state.climate];

  // Momentum boosts ambient brightness slightly — the more the user works the
  // world, the more it "comes alive". Capped to stay quiet. Phase 5C.2:
  // climate.luminosity now adds a continuously evolving baseline so worlds
  // breathe even while idle.
  const liveness = Math.min(
    1,
    preset.ambient * (0.6 + climate.luminosity * 0.6) + state.momentum * 0.2,
  );

  // Climate-driven motion multiplier — environments speed up or slow down
  // continuously without ever feeling jumpy.
  const motionMul = 0.6 + climate.motionIntensity;
  const aDur = drift.aDur / motionMul;
  const bDur = drift.bDur / motionMul;

  // Pulse amplitude inversely tied to harmonic stability.
  const pulseAmp = Math.max(0.04, (1 - climate.harmonicStability) * 0.35);

  // Particle density scales with both preset and live activity.
  const particleDensity = Math.min(1, preset.particles * (0.5 + climate.particleActivity));

  // Hue bias for the climate veil from emotional temperature (-1 cool .. +1 warm).
  const tempHueBias = climate.emotionalTemperature * 35; // degrees

  const primary = `hsl(${preset.primaryHsl})`;
  const secondary = `hsl(${preset.secondaryHsl})`;
  const accent = `hsl(${preset.accentHsl})`;

  // Particulate field — generated once per worldId so it stays stable.
  const particles = useMemo(() => {
    const count = Math.round(8 + particleDensity * 22);
    const seed = worldId.charCodeAt(0) * 13;
    const layers: string[] = [];
    for (let i = 0; i < count; i++) {
      const x = ((seed * (i + 1) * 17) % 100).toFixed(1);
      const y = ((seed * (i + 3) * 23) % 100).toFixed(1);
      const a = (0.25 + ((i * 7) % 30) / 100).toFixed(2);
      layers.push(`radial-gradient(1px 1px at ${x}% ${y}%, hsl(0 0% 100% / ${a}), transparent 60%)`);
    }
    return layers.join(',');
  }, [worldId, particleDensity]);

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
          width: `${50 + preset.depth * 8 + climate.temporalCoherence * 10}vh`,
          height: `${50 + preset.depth * 8 + climate.temporalCoherence * 10}vh`,
          background: `radial-gradient(closest-side, ${primary}, transparent 70%)`,
          opacity: 0.14 * liveness + 0.12 * climate.luminosity,
        }}
        animate={{ x: [0, drift.aDist, 0], y: [0, drift.aDist * 0.6, 0] }}
        transition={{ duration: aDur, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Distant glow B */}
      <motion.div
        className="absolute top-[15%] -right-[18%] rounded-full blur-3xl"
        style={{
          width: `${55 + preset.depth * 8 + climate.temporalCoherence * 10}vh`,
          height: `${55 + preset.depth * 8 + climate.temporalCoherence * 10}vh`,
          background: `radial-gradient(closest-side, ${secondary}, transparent 70%)`,
          opacity: 0.12 * liveness + 0.12 * climate.luminosity,
        }}
        animate={{ x: [0, -drift.bDist, 0], y: [0, drift.bDist * 0.5, 0] }}
        transition={{ duration: bDur, repeat: Infinity, ease: 'easeInOut' }}
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
            opacity: liveness * (0.7 + climate.atmosphericDensity * 0.4),
          }}
        />
      )}

      {/* Climate-driven volumetric fog — independent of preset light, always present. */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: `${30 + climate.atmosphericDensity * 35}%`,
          background: `linear-gradient(180deg, transparent, hsl(var(--background) / ${0.35 * climate.atmosphericDensity}) 80%, hsl(var(--background) / ${0.55 * climate.atmosphericDensity}) 100%)`,
        }}
      />

      {/* Climate veil */}
      {tint.intensity > 0 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(80% 60% at 50% 50%, hsl(${(tint.hue + tempHueBias + 360) % 360} 70% 50% / ${tint.intensity * 0.18}), transparent 70%)`,
          }}
          animate={{ opacity: [1 - pulseAmp, 1, 1 - pulseAmp] }}
          transition={{ duration: state.climate === 'turbulent' ? 5 : 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Particulate light — concept-art "stardust" axis */}
      <motion.div
        className="absolute inset-0 mix-blend-screen"
        style={{ backgroundImage: particles }}
        animate={{ opacity: [0.12 + particleDensity * 0.18, 0.2 + particleDensity * 0.25, 0.12 + particleDensity * 0.18] }}
        transition={{ duration: 6 / motionMul, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Resonance shimmer — faint cross-world coupling tint when high. */}
      {climate.resonance > 0.5 && (
        <motion.div
          className="absolute inset-0 mix-blend-screen pointer-events-none"
          style={{
            background: `radial-gradient(60% 40% at 50% 40%, ${accent}22, transparent 70%)`,
          }}
          animate={{ opacity: [climate.resonance * 0.25, climate.resonance * 0.45, climate.resonance * 0.25] }}
          transition={{ duration: 8 / motionMul, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Environmental pulse — a low-frequency global breath. */}
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 50% 50%, ${primary}10, transparent 70%)` }}
        animate={{ opacity: [0.15, 0.15 + pulseAmp * 0.5, 0.15] }}
        transition={{ duration: 9 / motionMul, repeat: Infinity, ease: 'easeInOut' }}
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
