/**
 * AuroraHoloOrb — Aurora's diamond-shaped holographic identity orb.
 * For small sizes (<80px): CSS/SVG diamond. For large sizes: delegates to SharedOrbView.
 */
import { cn } from '@/lib/utils';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import type { OrbProfile } from '@/components/orb/types';

interface AuroraHoloOrbProps {
  size?: number;
  className?: string;
  animate?: boolean;
  /** Glow intensity — 'subtle' for inline, 'full' for hero */
  glow?: 'none' | 'subtle' | 'full';
}

export const AURORA_ORB_PROFILE: OrbProfile = {
  ...DEFAULT_ORB_PROFILE,
  primaryColor: '270 80% 70%',
  secondaryColors: ['190 90% 70%', '260 70% 65%', '300 80% 75%'],
  accentColor: '260 80% 55%',
  morphSpeed: 0,
  morphIntensity: 0,
  geometryDetail: 128,
  particleCount: 0,
  particleEnabled: false,
  materialType: 'iridescent',
  geometryFamily: 'octa',
  gradientStops: ['270 80% 70%', '190 90% 70%', '300 80% 75%', '260 70% 65%'],
  coreGradient: ['270 80% 70%', '190 90% 70%'],
  rimLightColor: '300 80% 75%',
  bloomStrength: 0.8,
  chromaShift: 0.4,
  materialParams: { metalness: 0.3, roughness: 0.1, clearcoat: 1.0, transmission: 0.3, ior: 2.0, emissiveIntensity: 0.4 },
};

export function AuroraHoloOrb({ size = 32, className, animate = true, glow = 'subtle' }: AuroraHoloOrbProps) {
  const id = `holo-${size}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div
      className={cn(
        "relative shrink-0",
        glow === 'full' && "drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]",
        glow === 'subtle' && "drop-shadow-[0_0_4px_rgba(139,92,246,0.25)]",
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
          <radialGradient id={`${id}-base`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e0c3fc" />
            <stop offset="30%" stopColor="#8ec5fc" />
            <stop offset="60%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </radialGradient>

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

          <radialGradient id={`${id}-highlight`} cx="35%" cy="25%" r="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>

        {/* Diamond shape (rotated square) */}
        <g transform="rotate(45 50 50)">
          {/* Outer glow */}
          <rect
            x="18" y="18" width="64" height="64" rx="6"
            fill="none"
            stroke={`url(#${id}-sweep)`}
            strokeWidth="1.5"
            opacity="0.4"
            filter={`url(#${id}-blur)`}
          >
            {animate && <animate attributeName="width" values="64;62;64" dur="3s" repeatCount="indefinite" />}
            {animate && <animate attributeName="height" values="64;62;64" dur="3s" repeatCount="indefinite" />}
            {animate && <animate attributeName="x" values="18;19;18" dur="3s" repeatCount="indefinite" />}
            {animate && <animate attributeName="y" values="18;19;18" dur="3s" repeatCount="indefinite" />}
          </rect>

          {/* Main body */}
          <rect
            x="22" y="22" width="56" height="56" rx="4"
            fill={`url(#${id}-base)`}
          >
            {animate && (
              <>
                <animate attributeName="width" values="56;54;57;56" dur="4s" repeatCount="indefinite" />
                <animate attributeName="height" values="56;54;57;56" dur="4s" repeatCount="indefinite" />
                <animate attributeName="x" values="22;23;21.5;22" dur="4s" repeatCount="indefinite" />
                <animate attributeName="y" values="22;23;21.5;22" dur="4s" repeatCount="indefinite" />
              </>
            )}
          </rect>

          {/* Iridescent overlay */}
          <rect
            x="22" y="22" width="56" height="56" rx="4"
            fill={`url(#${id}-sweep)`}
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Highlight */}
          <rect
            x="22" y="22" width="56" height="56" rx="4"
            fill={`url(#${id}-highlight)`}
          />
        </g>

        {/* Specular sparkle */}
        <circle cx="40" cy="35" r="1.5" fill="white" opacity="0.5">
          {animate && <animate attributeName="opacity" values="0.5;0.8;0.3;0.5" dur="2.5s" repeatCount="indefinite" />}
        </circle>
        <circle cx="58" cy="52" r="1" fill="white" opacity="0.3">
          {animate && <animate attributeName="opacity" values="0.3;0.6;0.2;0.3" dur="3s" repeatCount="indefinite" />}
        </circle>

        {/* Breathing pulse */}
        {animate && (
          <g transform="rotate(45 50 50)">
            <rect
              x="22" y="22" width="56" height="56" rx="4"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1"
              opacity="0.3"
            >
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="1;2;1" dur="3s" repeatCount="indefinite" />
            </rect>
          </g>
        )}
      </svg>
    </div>
  );
}