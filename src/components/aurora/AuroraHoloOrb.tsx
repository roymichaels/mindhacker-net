/**
 * AuroraHoloOrb — A holographic iridescent liquid orb for Aurora's identity.
 * Pure CSS/SVG animated — no WebGL dependency. Lightweight and scalable.
 */
import { cn } from '@/lib/utils';

interface AuroraHoloOrbProps {
  size?: number;
  className?: string;
  animate?: boolean;
  /** Glow intensity — 'subtle' for inline, 'full' for hero */
  glow?: 'none' | 'subtle' | 'full';
}

export function AuroraHoloOrb({ size = 32, className, animate = true, glow = 'subtle' }: AuroraHoloOrbProps) {
  const id = `holo-${size}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full",
        glow === 'full' && "shadow-[0_0_20px_4px_rgba(139,92,246,0.3),0_0_40px_8px_rgba(56,189,248,0.15)]",
        glow === 'subtle' && "shadow-[0_0_8px_2px_rgba(139,92,246,0.2)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="block"
      >
        <defs>
          {/* Main iridescent gradient — rotates for holo effect */}
          <radialGradient id={`${id}-base`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e0c3fc" />
            <stop offset="30%" stopColor="#8ec5fc" />
            <stop offset="60%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </radialGradient>

          {/* Iridescent sweep — animated */}
          <linearGradient id={`${id}-sweep`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.7">
              {animate && <animate attributeName="stop-color" values="#f0abfc;#67e8f9;#fbbf24;#a78bfa;#f0abfc" dur="4s" repeatCount="indefinite" />}
            </stop>
            <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.5">
              {animate && <animate attributeName="stop-color" values="#67e8f9;#fbbf24;#a78bfa;#f0abfc;#67e8f9" dur="4s" repeatCount="indefinite" />}
            </stop>
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.6">
              {animate && <animate attributeName="stop-color" values="#a78bfa;#f0abfc;#67e8f9;#fbbf24;#a78bfa" dur="4s" repeatCount="indefinite" />}
            </stop>
          </linearGradient>

          {/* Highlight blob for liquid feel */}
          <radialGradient id={`${id}-highlight`} cx="30%" cy="25%" r="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Secondary liquid highlight */}
          <radialGradient id={`${id}-highlight2`} cx="65%" cy="70%" r="25%">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
          </radialGradient>

          {/* Blur for soft edges */}
          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation="1" />
          </filter>

          {/* Organic distortion for liquid morph */}
          <filter id={`${id}-liquid`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="2" result="noise">
              {animate && <animate attributeName="seed" values="2;8;2" dur="6s" repeatCount="indefinite" />}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Outer glow ring */}
        <circle
          cx="50" cy="50" r="47"
          fill="none"
          stroke={`url(#${id}-sweep)`}
          strokeWidth="1.5"
          opacity="0.4"
          filter={`url(#${id}-blur)`}
        >
          {animate && <animate attributeName="r" values="47;46;47" dur="3s" repeatCount="indefinite" />}
        </circle>

        {/* Main orb body */}
        <circle
          cx="50" cy="50" r="44"
          fill={`url(#${id}-base)`}
          filter={`url(#${id}-liquid)`}
        >
          {animate && (
            <>
              <animate attributeName="r" values="44;43;44.5;44" dur="4s" repeatCount="indefinite" />
            </>
          )}
        </circle>

        {/* Iridescent overlay */}
        <circle
          cx="50" cy="50" r="44"
          fill={`url(#${id}-sweep)`}
          style={{ mixBlendMode: 'overlay' }}
          filter={`url(#${id}-liquid)`}
        >
          {animate && <animate attributeName="r" values="44;43;44.5;44" dur="4s" repeatCount="indefinite" />}
        </circle>

        {/* Primary specular highlight */}
        <circle
          cx="50" cy="50" r="44"
          fill={`url(#${id}-highlight)`}
        >
          {animate && (
            <animate attributeName="r" values="44;43;44.5;44" dur="4s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Secondary bottom highlight for depth */}
        <circle
          cx="50" cy="50" r="44"
          fill={`url(#${id}-highlight2)`}
        />

        {/* Inner bright core */}
        <circle
          cx="42" cy="38" r="8"
          fill="white"
          opacity="0.15"
          filter={`url(#${id}-blur)`}
        >
          {animate && (
            <>
              <animate attributeName="cx" values="42;44;42" dur="5s" repeatCount="indefinite" />
              <animate attributeName="cy" values="38;36;38" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0.25;0.15" dur="3s" repeatCount="indefinite" />
            </>
          )}
        </circle>

        {/* Tiny sparkle dots */}
        <circle cx="35" cy="30" r="1.2" fill="white" opacity="0.5">
          {animate && <animate attributeName="opacity" values="0.5;0.8;0.3;0.5" dur="2.5s" repeatCount="indefinite" />}
        </circle>
        <circle cx="60" cy="55" r="0.8" fill="white" opacity="0.3">
          {animate && <animate attributeName="opacity" values="0.3;0.6;0.2;0.3" dur="3s" repeatCount="indefinite" />}
        </circle>
        <circle cx="55" cy="35" r="0.6" fill="#c4b5fd" opacity="0.4">
          {animate && <animate attributeName="opacity" values="0.4;0.7;0.3;0.4" dur="2s" repeatCount="indefinite" />}
        </circle>
      </svg>
    </div>
  );
}
