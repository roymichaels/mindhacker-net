/**
 * CSSGalleryOrb — Rich CSS orb that visually differentiates
 * materials, geometries, patterns, glow levels, and rarity.
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
  if (/^\d+\s+\d+%?\s+\d+%?$/.test(t)) return t;
  const m = t.match(/hsl\(([^)]+)\)/i);
  if (m) return m[1].replace(/,/g, ' ').trim();
  return t;
}

/** Parse hue from HSL string */
function hue(c: string): number {
  return parseInt(c.split(' ')[0]) || 0;
}

// ──── Clip-paths per geometry ────
const GEOMETRY_CLIPS: Record<string, string> = {
  sphere: '',
  dodeca: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
  icosa: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  octa: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  spiky: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  tetra: 'polygon(50% 0%, 100% 87%, 0% 87%)',
  cube: 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)',
  cone: 'polygon(50% 5%, 95% 95%, 5% 95%)',
  cylinder: 'polygon(15% 0%, 85% 0%, 95% 50%, 85% 100%, 15% 100%, 5% 50%)',
  capsule: '',
  knot: 'polygon(50% 0%, 80% 10%, 100% 40%, 90% 70%, 70% 90%, 50% 100%, 30% 90%, 10% 70%, 0% 40%, 20% 10%)',
  torus: '', // uses border-radius trick
};

// ──── Material visual configs ────
function getMaterialStyle(
  mat: string | undefined,
  primary: string,
  accent: string,
  sec: string,
  intensity: number,
  size: number,
) {
  const m = mat || 'glass';

  switch (m) {
    case 'metal':
      return {
        background: `
          linear-gradient(145deg, hsl(${primary} / 0.4) 0%, hsl(${sec} / 0.9) 30%, hsl(${primary} / 0.3) 50%, hsl(${accent} / 0.8) 70%, hsl(${primary} / 0.5) 100%),
          radial-gradient(circle at 40% 35%, rgba(255,255,255,0.25), transparent 40%)
        `,
        boxShadow: `
          inset ${size * 0.05}px ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.2),
          inset -${size * 0.03}px -${size * 0.08}px ${size * 0.12}px hsl(${primary} / 0.5),
          0 0 ${size * 0.15}px hsl(${accent} / ${0.3 * intensity})
        `,
        filter: `contrast(1.2) saturate(${0.7 + intensity * 0.5})`,
      };

    case 'iridescent':
      return {
        background: `
          conic-gradient(from ${hue(primary)}deg at 50% 50%, 
            hsl(${primary}) 0deg, hsl(${accent}) 60deg, hsl(${sec}) 120deg,
            hsl(${(hue(primary) + 180) % 360} 80% 60%) 180deg, 
            hsl(${accent}) 240deg, hsl(${primary}) 300deg, hsl(${primary}) 360deg),
          radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), transparent 50%)
        `,
        boxShadow: `
          0 0 ${size * 0.3}px hsl(${accent} / ${0.35 * intensity}),
          inset 0 0 ${size * 0.15}px hsl(${primary} / 0.3)
        `,
        filter: `saturate(${1.4 + intensity * 0.5}) brightness(${1.05 + intensity * 0.15})`,
      };

    case 'plasma':
      return {
        background: `
          radial-gradient(circle at 50% 50%, hsl(${accent} / 0.95) 0%, hsl(${primary} / 0.7) 35%, transparent 65%),
          radial-gradient(circle at 30% 40%, hsl(${sec} / 0.8) 0%, transparent 45%),
          radial-gradient(circle at 70% 60%, hsl(${primary} / 0.9) 0%, transparent 50%),
          radial-gradient(circle, hsl(${primary} / 0.6) 0%, hsl(${accent} / 0.3) 100%)
        `,
        boxShadow: `
          0 0 ${size * 0.4}px hsl(${accent} / ${0.5 * intensity}),
          0 0 ${size * 0.6}px hsl(${primary} / ${0.25 * intensity}),
          inset 0 0 ${size * 0.2}px hsl(${accent} / 0.4)
        `,
        filter: `brightness(${1.15 + intensity * 0.25}) saturate(${1.2 + intensity * 0.6})`,
      };

    case 'wire':
      return {
        background: `
          radial-gradient(circle at 50% 50%, transparent 38%, hsl(${primary} / ${0.5 + intensity * 0.4}) 40%, transparent 42%),
          radial-gradient(circle at 50% 50%, transparent 55%, hsl(${accent} / ${0.3 + intensity * 0.3}) 57%, transparent 59%),
          radial-gradient(circle at 50% 50%, transparent 72%, hsl(${sec} / ${0.2 + intensity * 0.3}) 74%, transparent 76%),
          conic-gradient(from 0deg, hsl(${primary} / 0.15), hsl(${accent} / 0.1), hsl(${primary} / 0.15))
        `,
        boxShadow: `
          0 0 ${size * 0.2}px hsl(${primary} / ${0.3 * intensity}),
          inset 0 0 ${size * 0.1}px hsl(${accent} / 0.2)
        `,
        filter: `brightness(${1 + intensity * 0.15})`,
      };

    case 'glass':
    default:
      return {
        background: `
          radial-gradient(circle at 30% 28%, rgba(255,255,255,${0.35 + intensity * 0.2}) 0%, transparent 40%),
          radial-gradient(circle at 65% 70%, hsl(${accent} / ${0.5 * intensity}) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 50%, hsl(${primary} / 0.85) 0%, hsl(${sec} / 0.65) 50%, hsl(${accent} / 0.45) 100%)
        `,
        boxShadow: `
          inset 0 ${size * 0.04}px ${size * 0.12}px rgba(255,255,255,0.25),
          inset 0 -${size * 0.06}px ${size * 0.15}px hsl(${primary} / 0.3),
          0 0 ${size * 0.2}px hsl(${accent} / ${0.25 * intensity})
        `,
        filter: `saturate(${1 + intensity * 0.4}) brightness(${1.05 + intensity * 0.1})`,
      };
  }
}

// ──── Pattern overlays ────
function getPatternOverlay(
  pat: string | undefined,
  primary: string,
  accent: string,
  intensity: number,
): React.CSSProperties | null {
  const p = pat || 'none';
  const a = 0.1 + intensity * 0.25;

  switch (p) {
    case 'voronoi':
      return {
        background: `
          radial-gradient(circle at 20% 30%, hsl(${accent} / ${a}) 8%, transparent 9%),
          radial-gradient(circle at 60% 20%, hsl(${primary} / ${a}) 6%, transparent 7%),
          radial-gradient(circle at 40% 70%, hsl(${accent} / ${a * 0.8}) 10%, transparent 11%),
          radial-gradient(circle at 80% 55%, hsl(${primary} / ${a}) 7%, transparent 8%),
          radial-gradient(circle at 15% 80%, hsl(${accent} / ${a * 0.7}) 5%, transparent 6%),
          radial-gradient(circle at 75% 85%, hsl(${primary} / ${a * 0.9}) 8%, transparent 9%),
          radial-gradient(circle at 50% 45%, hsl(${accent} / ${a * 0.6}) 12%, transparent 13%)
        `,
      };
    case 'cellular':
      return {
        backgroundImage: `
          repeating-radial-gradient(circle at 25% 25%, transparent 0px, transparent ${8 + intensity * 4}px, hsl(${accent} / ${a * 0.6}) ${8 + intensity * 4 + 1}px),
          repeating-radial-gradient(circle at 75% 75%, transparent 0px, transparent ${10 + intensity * 5}px, hsl(${primary} / ${a * 0.5}) ${10 + intensity * 5 + 1}px)
        `,
      };
    case 'fractal':
      return {
        background: `
          repeating-conic-gradient(from 0deg at 50% 50%, hsl(${primary} / ${a * 0.3}) 0deg, transparent 15deg, hsl(${accent} / ${a * 0.2}) 30deg, transparent 45deg)
        `,
      };
    case 'shards':
      return {
        background: `
          linear-gradient(${30}deg, transparent 40%, hsl(${accent} / ${a}) 41%, transparent 43%),
          linear-gradient(${110}deg, transparent 35%, hsl(${primary} / ${a * 0.8}) 36%, transparent 38%),
          linear-gradient(${200}deg, transparent 50%, hsl(${accent} / ${a * 0.7}) 51%, transparent 53%),
          linear-gradient(${280}deg, transparent 30%, hsl(${primary} / ${a * 0.6}) 31%, transparent 33%),
          linear-gradient(${350}deg, transparent 55%, hsl(${accent} / ${a * 0.5}) 56%, transparent 58%)
        `,
      };
    case 'swirl':
      return {
        background: `conic-gradient(from 0deg at 50% 50%, 
          hsl(${primary} / ${a}) 0deg, transparent 30deg,
          hsl(${accent} / ${a * 0.8}) 90deg, transparent 120deg,
          hsl(${primary} / ${a * 0.6}) 180deg, transparent 210deg,
          hsl(${accent} / ${a * 0.7}) 270deg, transparent 300deg,
          hsl(${primary} / ${a}) 360deg)`,
      };
    case 'strata':
      return {
        background: `
          repeating-linear-gradient(0deg, transparent, transparent ${6 + intensity * 3}px, hsl(${accent} / ${a * 0.5}) ${6 + intensity * 3 + 1}px, transparent ${6 + intensity * 3 + 2}px),
          repeating-linear-gradient(90deg, transparent, transparent ${8 + intensity * 4}px, hsl(${primary} / ${a * 0.4}) ${8 + intensity * 4 + 1}px, transparent ${8 + intensity * 4 + 2}px)
        `,
      };
    default:
      return null;
  }
}

export function CSSGalleryOrb({ profile, size, level = 100, geometryFamily, className }: CSSGalleryOrbProps) {
  const primary = normColor(profile.primaryColor);
  const accent = normColor(profile.accentColor);
  const sec = normColor(profile.secondaryColors?.[0] || profile.primaryColor);
  const sec2 = normColor(profile.secondaryColors?.[1] || profile.accentColor);
  const i = Math.min(level / 100, 1);
  const geo = geometryFamily || profile.geometryFamily || 'sphere';
  const mat = profile.materialType || 'glass';
  const pat = profile.patternType;

  const clip = GEOMETRY_CLIPS[geo] || '';
  const isRound = geo === 'sphere' || geo === 'capsule' || geo === 'torus';
  const borderRadius = isRound ? '50%' : geo === 'cube' ? '12%' : '50%';

  const materialStyle = getMaterialStyle(mat, primary, accent, sec, i, size);
  const patternOverlay = getPatternOverlay(pat, primary, accent, i);

  // Animation duration varies by material
  const rotDuration = mat === 'iridescent' ? 12 : mat === 'plasma' ? 8 : mat === 'metal' ? 30 : 22;
  const counterDuration = mat === 'plasma' ? 6 : mat === 'iridescent' ? 9 : 16;

  // Torus: render as ring
  if (geo === 'torus') {
    return (
      <div className={className} style={{ width: size, height: size, margin: '0 auto', position: 'relative' }}>
        {/* Outer glow */}
        <div className="absolute rounded-full blur-2xl pointer-events-none" style={{
          inset: '-30%',
          background: `radial-gradient(circle, hsl(${primary} / ${0.3 * i}), transparent 65%)`,
        }} />
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: '5%',
            border: `${size * 0.18}px solid transparent`,
            borderRadius: '50%',
            backgroundImage: `conic-gradient(from 0deg, hsl(${primary}), hsl(${accent}), hsl(${sec}), hsl(${sec2}), hsl(${primary}))`,
            backgroundOrigin: 'border-box',
            backgroundClip: 'border-box',
            boxShadow: `
              0 0 ${size * 0.25}px hsl(${accent} / ${0.4 * i}),
              inset 0 0 ${size * 0.15}px hsl(${primary} / 0.3),
              0 0 ${size * 0.08}px hsl(${primary} / 0.3)
            `,
            filter: materialStyle.filter,
            mask: `radial-gradient(circle, transparent ${size * 0.18}px, black ${size * 0.19}px)`,
            WebkitMask: `radial-gradient(circle, transparent ${size * 0.18}px, black ${size * 0.19}px)`,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: rotDuration, repeat: Infinity, ease: 'linear' }}
        />
        {/* Specular on ring */}
        <div className="absolute rounded-full pointer-events-none" style={{
          inset: '5%',
          background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.3), transparent 40%)',
          mask: `radial-gradient(circle, transparent ${size * 0.18}px, black ${size * 0.19}px)`,
          WebkitMask: `radial-gradient(circle, transparent ${size * 0.18}px, black ${size * 0.19}px)`,
        }} />
      </div>
    );
  }

  // Capsule: pill shape
  const capsuleRadius = geo === 'capsule' ? `${size * 0.4}px` : undefined;

  return (
    <div className={className} style={{ width: size, height: size, margin: '0 auto', position: 'relative' }}>
      {/* Outer glow — scales with intensity */}
      <div className="absolute rounded-full blur-2xl pointer-events-none" style={{
        inset: '-25%',
        background: `radial-gradient(circle, hsl(${primary} / ${0.15 + 0.2 * i}), transparent 65%)`,
      }} />

      {/* Main orb body */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: rotDuration, repeat: Infinity, ease: 'linear' }}
        style={{
          borderRadius: capsuleRadius || borderRadius,
          clipPath: clip || undefined,
          background: materialStyle.background,
          boxShadow: materialStyle.boxShadow,
          filter: materialStyle.filter,
        }}
      >
        {/* Pattern overlay */}
        {patternOverlay && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: [0, -360] }}
            transition={{ duration: counterDuration, repeat: Infinity, ease: 'linear' }}
            style={{
              ...patternOverlay,
              borderRadius: 'inherit',
              mixBlendMode: mat === 'plasma' ? 'screen' : mat === 'metal' ? 'overlay' : 'soft-light',
              opacity: 0.6 + i * 0.4,
            }}
          />
        )}

        {/* Counter-rotating color wash for depth */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ rotate: [0, -360] }}
          transition={{ duration: counterDuration, repeat: Infinity, ease: 'linear' }}
          style={{
            background: `
              radial-gradient(ellipse 55% 40% at 35% 25%, hsl(${accent} / ${0.35 * i}), transparent),
              radial-gradient(ellipse 45% 50% at 70% 75%, hsl(${sec2} / ${0.25 * i}), transparent)
            `,
            borderRadius: 'inherit',
          }}
        />

        {/* Specular highlight */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: mat === 'metal'
            ? 'linear-gradient(145deg, rgba(255,255,255,0.35) 0%, transparent 35%, rgba(255,255,255,0.08) 60%, transparent 80%)'
            : mat === 'wire'
            ? 'none'
            : 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 30%, transparent 50%)',
          borderRadius: 'inherit',
          mixBlendMode: 'soft-light',
        }} />

        {/* Wire: extra grid lines */}
        {mat === 'wire' && (
          <div className="absolute inset-0 pointer-events-none" style={{
            borderRadius: 'inherit',
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 12px, hsl(${primary} / 0.3) 12px, transparent 13px),
              repeating-linear-gradient(60deg, transparent, transparent 14px, hsl(${accent} / 0.25) 14px, transparent 15px),
              repeating-linear-gradient(120deg, transparent, transparent 16px, hsl(${sec} / 0.2) 16px, transparent 17px)
            `,
          }} />
        )}
      </motion.div>

      {/* Breathing pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: mat === 'plasma' ? 2.5 : 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          borderRadius: capsuleRadius || borderRadius,
          clipPath: clip || undefined,
          background: `radial-gradient(circle, hsl(${accent} / ${0.06 + i * 0.06}), transparent 60%)`,
        }}
      />

      {/* Particle dots for particle-enabled orbs */}
      {profile.particleEnabled && (
        <>
          {Array.from({ length: Math.min(profile.particleCount || 5, 8) }).map((_, pi) => {
            const angle = (pi / (profile.particleCount || 5)) * 360;
            const dist = 38 + (pi % 3) * 6;
            return (
              <motion.div
                key={pi}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 2 + i * 2,
                  height: 2 + i * 2,
                  background: `hsl(${accent})`,
                  left: `${50 + Math.cos(angle * Math.PI / 180) * dist}%`,
                  top: `${50 + Math.sin(angle * Math.PI / 180) * dist}%`,
                  boxShadow: `0 0 4px hsl(${accent} / 0.6)`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.3, 0.8],
                }}
                transition={{
                  duration: 2 + pi * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: pi * 0.4,
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
