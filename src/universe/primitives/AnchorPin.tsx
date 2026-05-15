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
  // Stagger pin sway with the delay so neighbours don't bob in sync.
  const swayDelay = `${(delay * 1.7) % 6}s`;
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
      {/* Pin stack with subtle sway — translates the whole landmark
          column ±2px vertically over 6s. */}
      <div
        className="relative flex flex-col items-center"
        style={{
          animation: 'aion-pin-sway 6s ease-in-out infinite',
          animationDelay: swayDelay,
        }}
      >
        {/* Label whisper — ABOVE the icon (reference image pattern). */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: SACRED_DURATION.dissolve,
            delay: delay + 0.4,
            ease: SACRED_EASE.dissolve,
          }}
          dir={rtl ? 'rtl' : 'ltr'}
          className="mb-2 whitespace-nowrap text-center pointer-events-none"
        >
          <div
            className="text-[11px] text-foreground/65 leading-tight tracking-wide"
            style={{ textShadow: `0 0 8px hsl(${hueHsl} / 0.35)` }}
          >
            {label}
          </div>
          {meta && (
            <div className="text-[10px] text-foreground/35 leading-tight mt-0.5 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-500">
              {meta}
            </div>
          )}
        </motion.div>

        {/* Halo ring + icon — softer double bloom. */}
        <div
          className={cn(
            'relative h-11 w-11 rounded-full flex items-center justify-center',
            'transition-transform duration-500 group-hover:scale-110 group-active:scale-95',
          )}
          style={{
            background: `radial-gradient(closest-side, hsl(${hueHsl} / 0.32), hsl(${hueHsl} / 0.04) 70%, transparent 100%)`,
            boxShadow: [
              `0 0 18px hsl(${hueHsl} / 0.55)`,
              `0 0 60px hsl(${hueHsl} / 0.35)`,
              `inset 0 0 0 1px hsl(${hueHsl} / 0.65)`,
            ].join(', '),
          }}
        >
          <span
            className="relative text-foreground/90"
            style={{ filter: `drop-shadow(0 0 6px hsl(${hueHsl} / 0.75))` }}
          >
            {icon}
          </span>
          {/* Outer breathing ring */}
          <span
            aria-hidden
            className="absolute inset-[-6px] rounded-full pointer-events-none"
            style={{
              border: `1px solid hsl(${hueHsl} / 0.30)`,
              opacity: 0.55,
              animation: 'aion-breath 5.4s ease-in-out infinite',
            }}
          />
        </div>

        {/* Vertical light column — beacon planted on the surface.
            Falls FROM the icon halo DOWN to the ground rings. */}
        <div
          aria-hidden
          className="relative"
          style={{ width: '1.5px', height: '78px' }}
        >
          <div
            className="absolute inset-0 blur-[1.5px]"
            style={{
              background: `linear-gradient(180deg, hsl(${hueHsl} / 0.0) 0%, hsl(${hueHsl} / 0.55) 35%, hsl(${hueHsl} / 0.85) 80%, hsl(${hueHsl} / 0.45) 100%)`,
            }}
          />
          {/* Soft outer glow halo around the column */}
          <div
            className="absolute -inset-x-2 inset-y-0 blur-md"
            style={{
              background: `linear-gradient(180deg, transparent 0%, hsl(${hueHsl} / 0.18) 60%, hsl(${hueHsl} / 0.30) 100%)`,
              opacity: 0.55,
            }}
          />
        </div>

        {/* Concentric ground rings — three, with slow pulse on the outermost. */}
        <div className="relative" style={{ marginTop: '-2px' }}>
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 -top-1 h-4 w-14 rounded-full"
            style={{
              border: `1px solid hsl(${hueHsl} / 0.55)`,
              boxShadow: `0 0 10px hsl(${hueHsl} / 0.35)`,
            }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 top-0 h-6 w-24 rounded-full"
            style={{
              border: `1px solid hsl(${hueHsl} / 0.22)`,
              opacity: 0.7,
            }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 top-1 h-9 w-36 rounded-full"
            style={{
              border: `1px solid hsl(${hueHsl} / 0.10)`,
              opacity: 0.5,
              animation: 'aion-ring-pulse 7.2s ease-in-out infinite',
              animationDelay: swayDelay,
            }}
          />
        </div>
      </div>
    </motion.button>
  );
}