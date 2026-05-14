/**
 * RitualOrbitsScene — Habits world.
 *
 * Each ritual is a satellite. Smaller orbit radius = stronger momentum
 * (closer to the gravitational center). Decaying habits drift outward
 * with a slower, dimmer pulse.
 */
import { motion } from 'framer-motion';
import type { WorldProjection } from '@/worlds/graph/worldGraphTypes';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  projection: WorldProjection;
  accentHsl: string;
}

export default function RitualOrbitsScene({ projection, accentHsl }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const accent = `hsl(${accentHsl})`;
  const stageSize = 320;
  const cx = stageSize / 2;
  const cy = stageSize / 2;

  const rituals = projection.nodes.length
    ? projection.nodes
    : [
        { id: 'd1', kind: 'ritual', label: '—', weight: 0.6, worldId: 'habits' as const },
      ];

  return (
    <div className="relative w-full flex items-center justify-center py-6">
      <div
        className="relative"
        style={{ width: stageSize, height: stageSize }}
        aria-label={isHe ? 'מסלולי הרגלים' : 'Habit orbits'}
      >
        {/* gravity well */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 70, height: 70, left: cx - 35, top: cy - 35,
            background: `radial-gradient(circle, ${accent}, transparent 70%)`,
          }}
          animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* faint orbit rings */}
        {[0.3, 0.55, 0.8, 1].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/[0.04]"
            style={{
              width: r * stageSize, height: r * stageSize,
              left: cx - (r * stageSize) / 2, top: cy - (r * stageSize) / 2,
            }}
          />
        ))}
        {/* satellites */}
        {rituals.map((node, i) => {
          const w = node.weight ?? 0.4;
          // higher momentum → tighter orbit
          const radius = 38 + (1 - w) * 110;
          const dur = 18 + (1 - w) * 30;
          const angleOffset = (i * 360) / rituals.length;
          const decay = node.kind === 'decay';
          const dotSize = decay ? 8 : 10 + w * 6;
          const dotColor = decay ? `${accent}` : accent;
          const dotOpacity = decay ? 0.45 : 0.95;
          return (
            <motion.div
              key={node.id}
              className="absolute"
              style={{ left: cx, top: cy, width: 0, height: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: dur, repeat: Infinity, ease: 'linear', delay: -angleOffset / 360 * dur }}
            >
              <div
                className="absolute"
                style={{
                  transform: `translate(${radius - dotSize / 2}px, -${dotSize / 2}px)`,
                }}
              >
                <motion.div
                  className="rounded-full"
                  style={{
                    width: dotSize, height: dotSize,
                    background: dotColor, opacity: dotOpacity,
                    boxShadow: `0 0 12px ${dotColor}`,
                  }}
                  animate={{
                    scale: decay ? [0.85, 1, 0.85] : [0.95, 1.15, 0.95],
                    opacity: decay ? [0.3, 0.55, 0.3] : [0.7, 1, 0.7],
                  }}
                  transition={{ duration: decay ? 6 : 2 + w * 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span
                  className="absolute text-[10px] text-foreground/65 whitespace-nowrap"
                  style={{
                    left: dotSize + 6,
                    top: -4,
                  }}
                >
                  {node.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
