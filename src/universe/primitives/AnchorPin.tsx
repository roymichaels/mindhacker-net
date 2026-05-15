/**
 * AnchorPin — Phase 5D.1.
 *
 * Canonical "glowing node on terrain" — the only allowed shape for an
 * interactive cognitive object inside a universe scene. Composed of:
 *
 *   - dropped light cone (origin point on the terrain)
 *   - ringed icon halo
 *   - faint label that fades in with sacred easing
 *
 * No card, no border, no background fill. Position is normalised
 * viewport coordinates (0..1).
 */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SACRED_DURATION, SACRED_EASE } from './SacredEasings';

export interface AnchorPinProps {
  /** Normalised viewport position (0..1, top-left). */
  x: number;
  y: number;
  icon: ReactNode;
  label: string;
  /** Optional secondary line (count, status). */
  meta?: string;
  /** HSL string used for halo + light cone. */
  hueHsl?: string;
  /** Reveal delay in seconds — used to stagger an AnchorField. */
  delay?: number;
  /** Right-to-left label flow. */
  rtl?: boolean;
  onActivate?: () => void;
  /** Slight parallax offset in [-1, 1] applied as a multiplier. */
  parallax?: { x: number; y: number };
  /** Parallax depth — higher = more shift. Default 14px. */
  depth?: number;
}

export default function AnchorPin({
  x,
  y,
  icon,
  label,
  meta,
  hueHsl = 'var(--aion-violet)',
  delay = 0,
  rtl = false,
  onActivate,
  parallax,
  depth = 14,
}: AnchorPinProps) {
  const px = parallax?.x ?? 0;
  const py = parallax?.y ?? 0;
  return (
    <motion.button
      type="button"
      onClick={onActivate}
      aria-label={label}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: SACRED_DURATION.breath, delay, ease: SACRED_EASE.breath }}
      className="absolute -translate-x-1/2 flex flex-col items-center pointer-events-auto group"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: `translate(${-50 + px * depth * 0.5}%, ${py * depth}px)`,
        transition: 'transform 1200ms cubic-bezier(0.22,0.61,0.36,1)',
      }}
    >
      {/* Halo ring + icon */}
      <div
        className={cn(
          'relative h-12 w-12 rounded-full flex items-center justify-center',
          'transition-transform group-hover:scale-110 group-active:scale-95',
        )}
        style={{
          background: `radial-gradient(closest-side, hsl(${hueHsl} / 0.30), hsl(${hueHsl} / 0.06) 70%, transparent 100%)`,
          boxShadow: `0 0 36px hsl(${hueHsl} / 0.45), inset 0 0 0 1px hsl(${hueHsl} / 0.55)`,
        }}
      >
        <span
          className="relative text-foreground/85"
          style={{ filter: `drop-shadow(0 0 6px hsl(${hueHsl} / 0.65))` }}
        >
          {icon}
        </span>
        {/* Outer breathing ring */}
        <span
          aria-hidden
          className="absolute inset-[-6px] rounded-full pointer-events-none"
          style={{
            border: `1px solid hsl(${hueHsl} / 0.30)`,
            opacity: 0.6,
            animation: 'aion-breath 5.4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Dropped light cone — narrow ellipse beneath the pin. */}
      <div
        aria-hidden
        className="mt-1 h-3 w-14 rounded-full blur-md"
        style={{
          background: `radial-gradient(60% 100% at 50% 0%, hsl(${hueHsl} / 0.55), transparent 75%)`,
          opacity: 0.85,
        }}
      />
      {/* Concentric ground rings */}
      <div
        aria-hidden
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-20 rounded-full"
        style={{
          border: `1px solid hsl(${hueHsl} / 0.18)`,
          opacity: 0.6,
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 h-9 w-28 rounded-full"
        style={{
          border: `1px solid hsl(${hueHsl} / 0.10)`,
          opacity: 0.5,
        }}
      />

      {/* Label whisper — to the side of the pin, no card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: SACRED_DURATION.dissolve, delay: delay + 0.4, ease: SACRED_EASE.dissolve }}
        dir={rtl ? 'rtl' : 'ltr'}
        className={cn(
          'absolute top-1 whitespace-nowrap text-start',
          rtl ? 'right-full me-3' : 'left-full ms-3',
        )}
      >
        <div className="text-[13px] text-foreground/90 leading-tight">{label}</div>
        {meta && (
          <div className="text-[11px] text-foreground/55 leading-tight mt-0.5">{meta}</div>
        )}
      </motion.div>
    </motion.button>
  );
}