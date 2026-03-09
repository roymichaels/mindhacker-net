/**
 * CSSGalleryOrb — Rich CSS orb with radically different visual treatments
 * per material, geometry, and pattern. Each material is a unique "skin".
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

function norm(c: string | undefined): string {
  if (!c) return '260 60% 55%';
  const t = c.trim();
  if (/^\d+\s+\d+%?\s+\d+%?$/.test(t)) return t;
  const m = t.match(/hsl\(([^)]+)\)/i);
  if (m) return m[1].replace(/,/g, ' ').trim();
  return t;
}

function hue(c: string): number { return parseInt(c.split(' ')[0]) || 0; }

// ──── Clip-paths per geometry ────
const GEO_CLIPS: Record<string, string> = {
  sphere: '', dodeca: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
  icosa: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  octa: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  spiky: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  tetra: 'polygon(50% 0%, 100% 87%, 0% 87%)',
  cube: 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)',
  cone: 'polygon(50% 5%, 95% 95%, 5% 95%)',
  cylinder: 'polygon(15% 0%, 85% 0%, 95% 50%, 85% 100%, 15% 100%, 5% 50%)',
  capsule: '', knot: 'polygon(50% 0%, 80% 10%, 100% 40%, 90% 70%, 70% 90%, 50% 100%, 30% 90%, 10% 70%, 0% 40%, 20% 10%)',
  torus: '',
};

// ──── Each material returns completely different CSS ────
function renderMaterial(
  mat: string, p: string, a: string, s: string, s2: string,
  i: number, sz: number
): { bg: string; shadow: string; filter: string; extra?: React.CSSProperties } {
  const h = hue(p);

  switch (mat) {
    case 'metal':
      return {
        bg: `linear-gradient(160deg, hsl(${h} 10% 18%) 0%, hsl(${p}) 25%, hsl(${h} 15% 75%) 45%, hsl(${s}) 55%, hsl(${h} 10% 25%) 75%, hsl(${a}) 100%)`,
        shadow: `inset ${sz*0.04}px ${sz*0.04}px ${sz*0.12}px rgba(255,255,255,0.3), inset -${sz*0.03}px -${sz*0.06}px ${sz*0.1}px rgba(0,0,0,0.5), 0 0 ${sz*0.1}px hsl(${a}/0.3)`,
        filter: `contrast(1.3) saturate(0.7) brightness(0.95)`,
      };

    case 'iridescent':
      return {
        bg: `conic-gradient(from ${h}deg at 50% 50%, hsl(${p}), hsl(${(h+60)%360} 85% 65%), hsl(${(h+120)%360} 80% 60%), hsl(${(h+180)%360} 85% 55%), hsl(${(h+240)%360} 80% 65%), hsl(${(h+300)%360} 85% 60%), hsl(${p}))`,
        shadow: `0 0 ${sz*0.3}px hsl(${a}/0.4), inset 0 0 ${sz*0.15}px rgba(255,255,255,0.2)`,
        filter: `saturate(1.6) brightness(1.1)`,
      };

    case 'plasma':
      return {
        bg: `radial-gradient(circle at 45% 45%, hsl(${a}) 0%, hsl(${p}/0.8) 30%, hsl(${s}/0.4) 60%, transparent 80%), radial-gradient(circle at 60% 55%, hsl(${s2}/0.7) 0%, transparent 50%), hsl(${h} 40% 8%)`,
        shadow: `0 0 ${sz*0.5}px hsl(${a}/0.6), 0 0 ${sz*0.8}px hsl(${p}/0.3), inset 0 0 ${sz*0.25}px hsl(${a}/0.5)`,
        filter: `brightness(1.3) saturate(1.5)`,
      };

    case 'wire':
      return {
        bg: `radial-gradient(circle, hsl(${h} 15% 8%) 30%, hsl(${h} 20% 5%) 100%)`,
        shadow: `0 0 ${sz*0.15}px hsl(${p}/0.4), inset 0 0 ${sz*0.05}px hsl(${a}/0.2)`,
        filter: 'brightness(1.1)',
        extra: {
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 8px, hsl(${p}/0.5) 8px, transparent 9px),
            repeating-linear-gradient(60deg, transparent, transparent 10px, hsl(${a}/0.4) 10px, transparent 11px),
            repeating-linear-gradient(120deg, transparent, transparent 9px, hsl(${s}/0.35) 9px, transparent 10px)
          `,
        },
      };

    case 'lava':
      return {
        bg: `radial-gradient(ellipse at 40% 60%, hsl(${h} 95% 55%) 0%, hsl(${h} 90% 35%) 30%, hsl(${h} 40% 8%) 70%), radial-gradient(circle at 65% 35%, hsl(${(h+15)%360} 100% 60%/0.6) 0%, transparent 40%)`,
        shadow: `0 0 ${sz*0.4}px hsl(${h} 100% 50%/0.5), 0 0 ${sz*0.6}px hsl(${h} 90% 40%/0.3), inset 0 ${sz*0.05}px ${sz*0.15}px hsl(${h} 100% 60%/0.4)`,
        filter: `brightness(1.1) saturate(1.8) contrast(1.2)`,
        extra: {
          backgroundImage: `
            radial-gradient(ellipse 30% 20% at 25% 70%, hsl(${(h+10)%360} 100% 65%/0.7), transparent),
            radial-gradient(ellipse 20% 25% at 70% 45%, hsl(${h} 100% 70%/0.5), transparent),
            radial-gradient(ellipse 15% 15% at 50% 30%, hsl(${(h+20)%360} 100% 75%/0.4), transparent)
          `,
        },
      };

    case 'crystal':
      return {
        bg: `linear-gradient(${45+h%90}deg, hsl(${p}/0.9) 0%, hsl(${a}/0.7) 20%, rgba(255,255,255,0.3) 22%, hsl(${s}/0.8) 40%, rgba(255,255,255,0.2) 42%, hsl(${p}/0.6) 60%, hsl(${s2}/0.8) 80%, hsl(${a}/0.9) 100%)`,
        shadow: `inset ${sz*0.02}px ${sz*0.03}px ${sz*0.08}px rgba(255,255,255,0.5), 0 0 ${sz*0.2}px hsl(${a}/0.3)`,
        filter: `saturate(1.3) brightness(1.15) contrast(1.1)`,
        extra: {
          backgroundImage: `
            linear-gradient(${110+h%60}deg, transparent 30%, rgba(255,255,255,0.25) 31%, transparent 33%),
            linear-gradient(${200+h%60}deg, transparent 50%, rgba(255,255,255,0.2) 51%, transparent 53%),
            linear-gradient(${320+h%60}deg, transparent 40%, rgba(255,255,255,0.15) 41%, transparent 43%)
          `,
        },
      };

    case 'matte':
      return {
        bg: `radial-gradient(circle at 45% 40%, hsl(${p}) 0%, hsl(${s}) 60%, hsl(${h} ${Math.max(10,parseInt(s.split(' ')[1])-30)}% ${Math.max(15,parseInt(s.split(' ')[2])-15)}%) 100%)`,
        shadow: `inset 0 -${sz*0.08}px ${sz*0.15}px rgba(0,0,0,0.25), 0 ${sz*0.02}px ${sz*0.06}px rgba(0,0,0,0.3)`,
        filter: `saturate(0.85) contrast(1.05) brightness(0.95)`,
      };

    case 'nebula':
      return {
        bg: `radial-gradient(ellipse at 30% 40%, hsl(${(h+240)%360} 70% 60%/0.6) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, hsl(${(h+300)%360} 80% 50%/0.5) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, hsl(${p}/0.4) 0%, hsl(${h} 30% 5%) 100%)`,
        shadow: `0 0 ${sz*0.35}px hsl(${(h+270)%360} 80% 60%/0.3), 0 0 ${sz*0.5}px hsl(${p}/0.15)`,
        filter: `brightness(1.05) saturate(1.4)`,
        extra: {
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 45% 65%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 85% 75%, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 35% 80%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 60% 10%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 10% 90%, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 80% 45%, rgba(255,255,255,0.7), transparent)
          `,
        },
      };

    case 'obsidian':
      return {
        bg: `radial-gradient(circle at 40% 35%, hsl(${h} 20% 22%) 0%, hsl(${h} 15% 8%) 60%, hsl(${h} 10% 3%) 100%)`,
        shadow: `inset ${sz*0.03}px ${sz*0.03}px ${sz*0.1}px rgba(255,255,255,0.08), inset -${sz*0.02}px -${sz*0.05}px ${sz*0.08}px rgba(0,0,0,0.6), 0 0 ${sz*0.12}px hsl(${a}/0.2)`,
        filter: `contrast(1.4) brightness(0.85)`,
        extra: {
          backgroundImage: `linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.06) 41%, transparent 43%), linear-gradient(225deg, transparent 55%, rgba(255,255,255,0.04) 56%, transparent 58%)`,
        },
      };

    case 'tiger':
      return {
        bg: `radial-gradient(circle at 45% 40%, hsl(${h} 80% 55%) 0%, hsl(${h} 70% 40%) 100%)`,
        shadow: `inset 0 -${sz*0.06}px ${sz*0.12}px rgba(0,0,0,0.3), 0 0 ${sz*0.1}px hsl(${a}/0.3)`,
        filter: `saturate(1.3) contrast(1.15)`,
        extra: {
          backgroundImage: `
            repeating-linear-gradient(${35+h%30}deg, transparent, transparent 6px, hsl(${h} 20% 10%/0.7) 6px, hsl(${h} 20% 10%/0.7) 9px, transparent 9px, transparent 14px),
            repeating-linear-gradient(${-15+h%30}deg, transparent, transparent 8px, hsl(${h} 15% 8%/0.5) 8px, hsl(${h} 15% 8%/0.5) 10px, transparent 10px, transparent 18px)
          `,
        },
      };

    case 'thorny':
      return {
        bg: `radial-gradient(circle at 50% 50%, hsl(${s}) 0%, hsl(${p}) 50%, hsl(${h} 30% 12%) 100%)`,
        shadow: `0 0 ${sz*0.08}px hsl(${a}/0.3), inset 0 0 ${sz*0.1}px rgba(0,0,0,0.4)`,
        filter: `saturate(1.1) contrast(1.2) brightness(0.9)`,
        extra: {
          backgroundImage: `
            conic-gradient(from 0deg at 50% 50%, transparent 0deg, hsl(${h} 25% 10%/0.6) 5deg, transparent 10deg, transparent 20deg, hsl(${h} 25% 10%/0.5) 25deg, transparent 30deg, transparent 40deg, hsl(${h} 25% 10%/0.4) 45deg, transparent 50deg, transparent 60deg, hsl(${h} 25% 10%/0.5) 65deg, transparent 70deg, transparent 80deg, hsl(${h} 25% 10%/0.6) 85deg, transparent 90deg, transparent 100deg, hsl(${h} 25% 10%/0.4) 105deg, transparent 110deg, transparent 120deg, hsl(${h} 25% 10%/0.5) 125deg, transparent 130deg, transparent 140deg, hsl(${h} 25% 10%/0.6) 145deg, transparent 150deg, transparent 160deg, hsl(${h} 25% 10%/0.5) 165deg, transparent 170deg, transparent 180deg, hsl(${h} 25% 10%/0.4) 185deg, transparent 190deg, transparent 200deg, hsl(${h} 25% 10%/0.5) 205deg, transparent 210deg, transparent 220deg, hsl(${h} 25% 10%/0.6) 225deg, transparent 230deg, transparent 240deg, hsl(${h} 25% 10%/0.5) 245deg, transparent 250deg, transparent 260deg, hsl(${h} 25% 10%/0.4) 265deg, transparent 270deg, transparent 280deg, hsl(${h} 25% 10%/0.5) 285deg, transparent 290deg, transparent 300deg, hsl(${h} 25% 10%/0.6) 305deg, transparent 310deg, transparent 320deg, hsl(${h} 25% 10%/0.5) 325deg, transparent 330deg, transparent 340deg, hsl(${h} 25% 10%/0.4) 345deg, transparent 350deg, transparent 360deg)
          `,
        },
      };

    case 'bone':
      return {
        bg: `radial-gradient(circle at 42% 38%, hsl(${h} 15% 82%) 0%, hsl(${h} 12% 68%) 40%, hsl(${h} 10% 52%) 80%, hsl(${h} 8% 38%) 100%)`,
        shadow: `inset 0 -${sz*0.05}px ${sz*0.1}px rgba(0,0,0,0.2), inset 0 ${sz*0.03}px ${sz*0.06}px rgba(255,255,255,0.15), 0 ${sz*0.02}px ${sz*0.05}px rgba(0,0,0,0.25)`,
        filter: `saturate(0.4) contrast(1.1) brightness(1.0)`,
        extra: {
          backgroundImage: `
            radial-gradient(ellipse 40% 15% at 30% 50%, hsl(${h} 8% 45%/0.3), transparent),
            radial-gradient(ellipse 15% 40% at 65% 40%, hsl(${h} 8% 42%/0.25), transparent),
            radial-gradient(ellipse 25% 10% at 50% 70%, hsl(${h} 8% 48%/0.2), transparent)
          `,
        },
      };

    case 'ember':
      return {
        bg: `radial-gradient(circle at 50% 55%, hsl(${h} 80% 20%) 0%, hsl(${h} 50% 8%) 70%), radial-gradient(circle at 50% 50%, hsl(${h} 100% 50%/0.3) 0%, transparent 60%)`,
        shadow: `0 0 ${sz*0.25}px hsl(${h} 100% 50%/0.35), inset 0 0 ${sz*0.15}px hsl(${h} 90% 45%/0.3)`,
        filter: `brightness(1.0) saturate(1.6) contrast(1.15)`,
        extra: {
          backgroundImage: `
            radial-gradient(ellipse 20% 10% at 35% 55%, hsl(${(h+15)%360} 100% 65%/0.6), transparent),
            radial-gradient(ellipse 15% 8% at 55% 40%, hsl(${h} 100% 60%/0.5), transparent),
            radial-gradient(ellipse 10% 15% at 45% 70%, hsl(${(h+5)%360} 100% 55%/0.4), transparent),
            radial-gradient(ellipse 8% 8% at 65% 60%, hsl(${(h+20)%360} 100% 70%/0.6), transparent)
          `,
        },
      };

    case 'ice':
      return {
        bg: `linear-gradient(170deg, hsl(${h} 40% 88%) 0%, hsl(${h} 55% 78%) 30%, hsl(${h} 50% 65%) 60%, hsl(${h} 45% 50%) 100%)`,
        shadow: `inset ${sz*0.03}px ${sz*0.03}px ${sz*0.1}px rgba(255,255,255,0.5), inset -${sz*0.02}px -${sz*0.04}px ${sz*0.08}px hsl(${h} 40% 40%/0.3), 0 0 ${sz*0.15}px hsl(${h} 50% 70%/0.3)`,
        filter: `saturate(0.9) brightness(1.15) contrast(1.05)`,
        extra: {
          backgroundImage: `
            linear-gradient(${60+h%40}deg, transparent 35%, rgba(255,255,255,0.4) 36%, transparent 38%),
            linear-gradient(${140+h%40}deg, transparent 45%, rgba(255,255,255,0.3) 46%, transparent 48%),
            linear-gradient(${250+h%40}deg, transparent 55%, rgba(255,255,255,0.25) 56%, transparent 58%),
            linear-gradient(${330+h%40}deg, transparent 25%, rgba(255,255,255,0.2) 26%, transparent 28%)
          `,
        },
      };

    case 'void':
      return {
        bg: `radial-gradient(circle at 50% 50%, hsl(${h} 60% 8%) 0%, hsl(${h} 40% 3%) 50%, black 100%), radial-gradient(circle at 50% 50%, hsl(${a}/0.15) 0%, transparent 40%)`,
        shadow: `0 0 ${sz*0.2}px hsl(${a}/0.25), inset 0 0 ${sz*0.3}px hsl(${h} 50% 3%)`,
        filter: `contrast(1.5) brightness(0.8)`,
        extra: {
          backgroundImage: `
            radial-gradient(circle at 50% 50%, hsl(${a}/0.1) 0%, transparent 30%),
            radial-gradient(1px 1px at 25% 35%, hsl(${a}/0.5), transparent),
            radial-gradient(1px 1px at 75% 65%, hsl(${p}/0.4), transparent),
            radial-gradient(1px 1px at 50% 20%, hsl(${s}/0.3), transparent)
          `,
        },
      };

    case 'holographic':
      return {
        bg: `conic-gradient(from ${h}deg at 50% 50%, hsl(0 90% 65%), hsl(45 90% 65%), hsl(90 90% 60%), hsl(135 85% 60%), hsl(180 90% 55%), hsl(225 85% 60%), hsl(270 90% 65%), hsl(315 85% 60%), hsl(360 90% 65%))`,
        shadow: `0 0 ${sz*0.25}px hsl(${a}/0.35), 0 0 ${sz*0.4}px hsl(${(h+180)%360} 80% 60%/0.2)`,
        filter: `saturate(1.5) brightness(1.15)`,
        extra: {
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, transparent 1px, transparent 3px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, transparent 1px, transparent 3px)
          `,
        },
      };

    case 'glass':
    default:
      return {
        bg: `radial-gradient(circle at 30% 28%, rgba(255,255,255,${0.3+i*0.15}) 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, hsl(${p}/0.85) 0%, hsl(${s}/0.65) 50%, hsl(${a}/0.45) 100%)`,
        shadow: `inset 0 ${sz*0.04}px ${sz*0.12}px rgba(255,255,255,0.25), inset 0 -${sz*0.06}px ${sz*0.15}px hsl(${p}/0.3), 0 0 ${sz*0.15}px hsl(${a}/0.25)`,
        filter: `saturate(${1+i*0.4}) brightness(${1.05+i*0.1})`,
      };
  }
}

// ──── Pattern overlays ────
function patternCSS(pat: string | undefined, p: string, a: string, i: number): React.CSSProperties | null {
  const al = 0.12 + i * 0.25;
  switch (pat) {
    case 'voronoi': return {
      background: `radial-gradient(circle at 20% 30%, hsl(${a}/${al}) 8%, transparent 9%), radial-gradient(circle at 60% 20%, hsl(${p}/${al}) 6%, transparent 7%), radial-gradient(circle at 40% 70%, hsl(${a}/${al*0.8}) 10%, transparent 11%), radial-gradient(circle at 80% 55%, hsl(${p}/${al}) 7%, transparent 8%), radial-gradient(circle at 50% 45%, hsl(${a}/${al*0.6}) 12%, transparent 13%)`,
    };
    case 'cellular': return {
      backgroundImage: `repeating-radial-gradient(circle at 25% 25%, transparent 0px, transparent ${8+i*4}px, hsl(${a}/${al*0.6}) ${8+i*4+1}px), repeating-radial-gradient(circle at 75% 75%, transparent 0px, transparent ${10+i*5}px, hsl(${p}/${al*0.5}) ${10+i*5+1}px)`,
    };
    case 'fractal': return {
      background: `repeating-conic-gradient(from 0deg at 50% 50%, hsl(${p}/${al*0.3}) 0deg, transparent 15deg, hsl(${a}/${al*0.2}) 30deg, transparent 45deg)`,
    };
    case 'shards': return {
      background: `linear-gradient(30deg, transparent 40%, hsl(${a}/${al}) 41%, transparent 43%), linear-gradient(110deg, transparent 35%, hsl(${p}/${al*0.8}) 36%, transparent 38%), linear-gradient(200deg, transparent 50%, hsl(${a}/${al*0.7}) 51%, transparent 53%), linear-gradient(280deg, transparent 30%, hsl(${p}/${al*0.6}) 31%, transparent 33%)`,
    };
    case 'swirl': return {
      background: `conic-gradient(from 0deg at 50% 50%, hsl(${p}/${al}) 0deg, transparent 30deg, hsl(${a}/${al*0.8}) 90deg, transparent 120deg, hsl(${p}/${al*0.6}) 180deg, transparent 210deg, hsl(${a}/${al*0.7}) 270deg, transparent 300deg, hsl(${p}/${al}) 360deg)`,
    };
    case 'strata': return {
      background: `repeating-linear-gradient(0deg, transparent, transparent ${6+i*3}px, hsl(${a}/${al*0.5}) ${6+i*3+1}px, transparent ${6+i*3+2}px), repeating-linear-gradient(90deg, transparent, transparent ${8+i*4}px, hsl(${p}/${al*0.4}) ${8+i*4+1}px, transparent ${8+i*4+2}px)`,
    };
    default: return null;
  }
}

export function CSSGalleryOrb({ profile, size, level = 100, geometryFamily, className }: CSSGalleryOrbProps) {
  const primary = norm(profile.primaryColor);
  const accent = norm(profile.accentColor);
  const sec = norm(profile.secondaryColors?.[0] || profile.primaryColor);
  const sec2 = norm(profile.secondaryColors?.[1] || profile.accentColor);
  const i = Math.min(level / 100, 1);
  const geo = geometryFamily || profile.geometryFamily || 'sphere';
  const mat = profile.materialType || 'glass';
  const pat = profile.patternType;

  const clip = GEO_CLIPS[geo] || '';
  const isRound = geo === 'sphere' || geo === 'capsule' || geo === 'torus';
  const borderRadius = isRound ? '50%' : geo === 'cube' ? '12%' : '50%';
  const capsuleRadius = geo === 'capsule' ? `${size * 0.4}px` : undefined;

  const ms = renderMaterial(mat, primary, accent, sec, sec2, i, size);
  const po = patternCSS(pat, primary, accent, i);

  // Different animation speeds by material
  const rotDur = mat === 'holographic' ? 8 : mat === 'iridescent' ? 12 : mat === 'plasma' ? 10 : mat === 'lava' ? 15 : mat === 'nebula' ? 35 : mat === 'metal' ? 40 : mat === 'void' ? 50 : 25;
  const counterDur = mat === 'plasma' ? 6 : mat === 'holographic' ? 5 : mat === 'lava' ? 10 : 16;

  // No specular for certain materials
  const showSpecular = !['metal', 'matte', 'wire', 'void', 'obsidian', 'lava', 'ember', 'tiger', 'thorny', 'bone', 'nebula'].includes(mat);
  // No outer glow for matte/bone/obsidian
  const showGlow = !['matte', 'bone', 'obsidian'].includes(mat);
  // Extra bright glow for plasma/lava/ember/holographic
  const glowIntensity = ['plasma', 'lava', 'ember', 'holographic'].includes(mat) ? 0.4 : 0.15;

  // Torus special rendering
  if (geo === 'torus') {
    return (
      <div className={className} style={{ width: size, height: size, margin: '0 auto', position: 'relative' }}>
        {showGlow && <div className="absolute rounded-full blur-2xl pointer-events-none" style={{
          inset: '-30%', background: `radial-gradient(circle, hsl(${primary}/${glowIntensity + 0.15}), transparent 65%)`,
        }} />}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: '5%', border: `${size * 0.18}px solid transparent`, borderRadius: '50%',
            backgroundImage: ms.bg, backgroundOrigin: 'border-box', backgroundClip: 'border-box',
            boxShadow: ms.shadow, filter: ms.filter,
            mask: `radial-gradient(circle, transparent ${size * 0.18}px, black ${size * 0.19}px)`,
            WebkitMask: `radial-gradient(circle, transparent ${size * 0.18}px, black ${size * 0.19}px)`,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: rotDur, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size, margin: '0 auto', position: 'relative' }}>
      {/* Outer glow */}
      {showGlow && (
        <div className="absolute rounded-full blur-2xl pointer-events-none" style={{
          inset: '-25%',
          background: `radial-gradient(circle, hsl(${primary}/${glowIntensity + i * 0.15}), transparent 65%)`,
        }} />
      )}

      {/* Main orb body */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        animate={mat === 'matte' || mat === 'bone' ? {} : { rotate: [0, 360] }}
        transition={{ duration: rotDur, repeat: Infinity, ease: 'linear' }}
        style={{
          borderRadius: capsuleRadius || borderRadius,
          clipPath: clip || undefined,
          background: ms.bg,
          boxShadow: ms.shadow,
          filter: ms.filter,
        }}
      >
        {/* Material-specific extra layer */}
        {ms.extra && (
          <div className="absolute inset-0 pointer-events-none" style={{ ...ms.extra, borderRadius: 'inherit' }} />
        )}

        {/* Pattern overlay */}
        {po && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: [0, -360] }}
            transition={{ duration: counterDur, repeat: Infinity, ease: 'linear' }}
            style={{
              ...po, borderRadius: 'inherit',
              mixBlendMode: mat === 'plasma' || mat === 'lava' || mat === 'ember' ? 'screen' : mat === 'metal' || mat === 'obsidian' ? 'overlay' : 'soft-light',
              opacity: 0.6 + i * 0.4,
            }}
          />
        )}

        {/* Color wash — counter-rotating */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ rotate: [0, -360] }}
          transition={{ duration: counterDur * 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            background: `radial-gradient(ellipse 55% 40% at 35% 25%, hsl(${accent}/${0.2 * i}), transparent), radial-gradient(ellipse 45% 50% at 70% 75%, hsl(${sec2}/${0.15 * i}), transparent)`,
            borderRadius: 'inherit',
          }}
        />

        {/* Specular — only for glossy materials */}
        {showSpecular && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: mat === 'crystal' || mat === 'ice'
              ? 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 20%, transparent 40%)'
              : 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.06) 25%, transparent 45%)',
            borderRadius: 'inherit',
            mixBlendMode: 'soft-light',
          }} />
        )}
      </motion.div>

      {/* Breathing pulse — intensity varies */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          scale: mat === 'plasma' || mat === 'lava' ? [1, 1.08, 1] : [1, 1.04, 1],
          opacity: mat === 'plasma' || mat === 'lava' || mat === 'ember' ? [0.5, 1, 0.5] : [0.3, 0.6, 0.3],
        }}
        transition={{ duration: mat === 'plasma' ? 2 : mat === 'lava' ? 3 : mat === 'ember' ? 2.5 : 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          borderRadius: capsuleRadius || borderRadius,
          clipPath: clip || undefined,
          background: `radial-gradient(circle, hsl(${accent}/${['plasma','lava','ember','holographic'].includes(mat) ? 0.12 : 0.05}), transparent 60%)`,
        }}
      />

      {/* Particles */}
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
                  width: 2 + i * 2, height: 2 + i * 2,
                  background: `hsl(${accent})`,
                  left: `${50 + Math.cos(angle * Math.PI / 180) * dist}%`,
                  top: `${50 + Math.sin(angle * Math.PI / 180) * dist}%`,
                  boxShadow: `0 0 4px hsl(${accent}/0.6)`,
                }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 2 + pi * 0.3, repeat: Infinity, ease: 'easeInOut', delay: pi * 0.4 }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
