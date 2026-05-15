/**
 * EnergyPath — Phase 5D.1.
 *
 * A faint, animated light bridge between two normalised points
 * (0..1, top-left). Implemented with SVG so the curve and the moving
 * shimmer share one element. Used to subliminally connect related
 * AnchorPins so the field feels woven, not catalogued.
 */
import { useId } from 'react';

export interface EnergyPathProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  /** HSL string for the bridge tint. */
  hueHsl?: string;
  /** 0..1 — base opacity. */
  intensity?: number;
}

export default function EnergyPath({
  from,
  to,
  hueHsl = 'var(--aion-violet)',
  intensity = 0.45,
}: EnergyPathProps) {
  const gid = useId();
  // Build a smooth quadratic curve between the two points.
  // Control point sits midway with a vertical offset so the bridge arcs.
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - 0.04;
  const d = `M ${from.x * 100} ${from.y * 100} Q ${mx * 100} ${my * 100} ${to.x * 100} ${to.y * 100}`;
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: intensity }}
    >
      <defs>
        <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={`hsl(${hueHsl} / 0.0)`} />
          <stop offset="50%" stopColor={`hsl(${hueHsl} / 0.55)`} />
          <stop offset="100%" stopColor={`hsl(${hueHsl} / 0.0)`} />
        </linearGradient>
      </defs>
      {/* Soft underlay */}
      <path d={d} fill="none" stroke={`hsl(${hueHsl} / 0.18)`} strokeWidth={0.4} vectorEffect="non-scaling-stroke" />
      {/* Travelling shimmer */}
      <path d={d} fill="none" stroke={`url(#grad-${gid})`} strokeWidth={0.8} vectorEffect="non-scaling-stroke">
        <animate
          attributeName="stroke-dasharray"
          values="0 100; 8 92; 0 100"
          dur="9s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          values="0; -100"
          dur="9s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}