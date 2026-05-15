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
  // River-style curve: bias the control point DOWN so the path arcs
  // along the terrain instead of leaping over it.
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 + 0.05;
  const pathId = `ep-${gid}`;
  const d = `M ${from.x * 100} ${from.y * 100} Q ${mx * 100} ${my * 100} ${to.x * 100} ${to.y * 100}`;
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: intensity, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={`hsl(${hueHsl} / 0.0)`} />
          <stop offset="50%" stopColor={`hsl(${hueHsl} / 0.65)`} />
          <stop offset="100%" stopColor={`hsl(${hueHsl} / 0.0)`} />
        </linearGradient>
        <filter id={`glow-${gid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
        <path id={pathId} d={d} />
      </defs>

      {/* Pass 1 — wide soft glow underlay (river bed) */}
      <path
        d={d}
        fill="none"
        stroke={`hsl(${hueHsl} / 0.22)`}
        strokeWidth={2.4}
        vectorEffect="non-scaling-stroke"
        filter={`url(#glow-${gid})`}
      />

      {/* Pass 2 — mid stroke with travelling shimmer */}
      <path
        d={d}
        fill="none"
        stroke={`url(#grad-${gid})`}
        strokeWidth={0.9}
        vectorEffect="non-scaling-stroke"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0 100; 10 90; 0 100"
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

      {/* Pass 3 — flowing light particles */}
      {[0, 0.33, 0.66].map((delay, i) => (
        <circle
          key={i}
          r={0.55}
          fill={`hsl(${hueHsl} / 0.95)`}
          filter={`url(#glow-${gid})`}
        >
          <animateMotion
            dur="7s"
            repeatCount="indefinite"
            begin={`${delay * 7}s`}
            keyPoints="0;1"
            keyTimes="0;1"
            calcMode="linear"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0; 1; 1; 0"
            keyTimes="0; 0.15; 0.85; 1"
            dur="7s"
            begin={`${delay * 7}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}