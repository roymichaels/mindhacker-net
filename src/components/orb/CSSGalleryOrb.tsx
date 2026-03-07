/**
 * CSSGalleryOrb — Lightweight CSS orb for homepage sections.
 * Accepts same props as LazyOrbView but uses zero WebGL contexts.
 */
import { motion } from 'framer-motion';
import type { OrbProfile } from './types';

interface CSSGalleryOrbProps {
  profile: OrbProfile;
  size: number;
  level?: number;
  geometryFamily?: string;
  randomShapeCount?: boolean;
  className?: string;
}

function normColor(c: string | undefined): string {
  if (!c) return '260 60% 55%';
  const t = c.trim();
  // Already bare HSL values like "260 60% 55%"
  if (/^\d+\s+\d+%?\s+\d+%?$/.test(t)) return t;
  // hsl(260 60% 55%) → extract inner
  const m = t.match(/hsl\(([^)]+)\)/i);
  if (m) return m[1].replace(/,/g, ' ').trim();
  return t;
}

export function CSSGalleryOrb({ profile, size, level = 100, className }: CSSGalleryOrbProps) {
  const primary = normColor(profile.primaryColor);
  const accent = normColor(profile.accentColor);
  const sec = normColor(profile.secondaryColors?.[0] || profile.primaryColor);
  const i = Math.min(level / 100, 1);

  return (
    <div className={className} style={{ width: size, height: size, margin: '0 auto', position: 'relative' }}>
      {/* Outer glow */}
      <div
        className="absolute rounded-full blur-2xl pointer-events-none"
        style={{
          inset: '-25%',
          background: `radial-gradient(circle, hsl(${primary} / ${0.2 * i}), transparent 65%)`,
        }}
      />
      {/* Main orb */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{
          background: `
            radial-gradient(circle at 30% 30%, hsl(${accent} / ${0.9 * i}) 0%, transparent 55%),
            radial-gradient(circle at 70% 70%, hsl(${primary} / ${0.8 * i}) 0%, transparent 50%),
            radial-gradient(circle at 50% 45%, hsl(${sec} / ${0.6 * i}) 0%, hsl(${primary} / ${0.4 * i}) 80%)
          `,
          boxShadow: `
            inset 0 0 ${size * 0.3}px hsl(${primary} / ${0.3 * i}),
            inset 0 -${size * 0.12}px ${size * 0.2}px hsl(${accent} / ${0.15 * i}),
            0 0 ${size * 0.25}px hsl(${primary} / ${0.2 * i})
          `,
        }}
      >
        {/* Counter-rotating highlight */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 35% 25%, hsl(${accent} / ${0.4 * i}), transparent),
              radial-gradient(ellipse 50% 50% at 65% 75%, hsl(${primary} / ${0.2 * i}), transparent)
            `,
          }}
        />
        {/* Specular highlight */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.35) 0%, transparent 45%)',
            mixBlendMode: 'soft-light',
          }}
        />
      </motion.div>
      {/* Breathing pulse */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: `radial-gradient(circle, hsl(${accent} / 0.08), transparent 60%)`,
        }}
      />
    </div>
  );
}
