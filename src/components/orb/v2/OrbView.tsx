/**
 * OrbView — drop-in orb instance.
 *
 * Renders an empty tracked DOM box and tunnels a 3D scene (camera + organic
 * sphere) into the global SharedOrbStage Canvas via drei <View track={ref}/>.
 *
 * Drop-in replacement for AuroraOrbIcon, CSS gradient orbs and OrganicOrbCanvas
 * across header, presence button and Interactive AION.
 */
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { View, PerspectiveCamera } from '@react-three/drei';
import { OrganicSphere } from '../OrganicSphere';
import { Orb } from '../Orb';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { cn } from '@/lib/utils';
import type { OrbProfile } from '../types';

export type OrbViewState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'responding'
  | 'recovery'
  | 'focus'
  | 'hypnosis';

export type OrbViewTier = 'auto' | 'presence' | 'standard' | 'cinematic';

interface OrbViewProps {
  size?: number;
  state?: OrbViewState;
  tier?: OrbViewTier;
  audioLevel?: number;
  className?: string;
  /** Override profile (otherwise uses authenticated user's DNA-derived profile) */
  profile?: OrbProfile;
  /** Disable personalization (use neutral theme palette) */
  neutral?: boolean;
  /** Hue override in HSL CSS string ("hsl(265 90% 65%)") for ambient tinting */
  tintHue?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

/** Map size → tier */
function resolveTier(size: number, tier: OrbViewTier): 'presence' | 'standard' | 'cinematic' {
  if (tier !== 'auto') return tier;
  if (size <= 64) return 'presence';
  if (size <= 256) return 'standard';
  return 'cinematic';
}

/** Geometry segments by tier — keeps silhouette smooth at every scale. */
function tierSegments(t: 'presence' | 'standard' | 'cinematic'): number {
  return t === 'presence' ? 96 : t === 'standard' ? 160 : 256;
}

export const OrbView = forwardRef<HTMLDivElement, OrbViewProps>(function OrbView(
  {
    size = 56,
    state = 'idle',
    tier = 'auto',
    audioLevel = 0,
    className,
    profile: profileOverride,
    neutral = false,
    tintHue,
    ariaLabel,
    onClick,
  },
  ref,
) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = (el: HTMLDivElement | null) => {
    trackRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  const { profile: userProfile } = useOrbProfile();
  const { theme } = useThemeSettings();

  // Choose profile: explicit override > user profile > defaults tinted with theme/hue
  const profile = useMemo<OrbProfile>(() => {
    if (profileOverride) return profileOverride;
    if (!neutral && userProfile) return userProfile;
    const primary =
      tintHue || `hsl(${theme.primary_h}, ${theme.primary_s}, ${theme.primary_l})`;
    const accent = `hsl(${theme.accent_h}, ${theme.accent_s}, ${theme.accent_l})`;
    const secondary = `hsl(${theme.secondary_h}, ${theme.secondary_s}, ${theme.secondary_l})`;
    return {
      ...DEFAULT_ORB_PROFILE,
      primaryColor: primary,
      secondaryColors: [secondary],
      accentColor: accent,
    } as OrbProfile;
  }, [profileOverride, neutral, userProfile, tintHue, theme]);

  const resolvedTier = resolveTier(size, tier);
  const segments = tierSegments(resolvedTier);

  const [stageReady, setStageReady] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean((window as Window & { __MINDOS_ORB_STAGE_READY__?: boolean }).__MINDOS_ORB_STAGE_READY__);
  });

  useEffect(() => {
    const onStage = (event: Event) => {
      const detail = (event as CustomEvent<{ ready?: boolean }>).detail;
      setStageReady(Boolean(detail?.ready));
    };

    window.addEventListener('mindos:orb-stage', onStage as EventListener);
    return () => window.removeEventListener('mindos:orb-stage', onStage as EventListener);
  }, []);

  // Visibility gating — pause heavy frame work when offscreen
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // State multipliers — applied on top of OrganicSphere's base params via props
  const stateMul = STATE_MULTIPLIERS[state];
  const legacyState = LEGACY_STATE_MAP[state];
  // Use the WebGL stage at every tier (header → cinematic). Only fall back
  // to the CSS renderer when WebGL is genuinely unavailable.
  const shouldUseFallback = !stageReady;

  const Wrapper: any = onClick ? 'button' : 'div';
  return (
    <Wrapper
      ref={setRef}
      onClick={onClick}
      aria-label={ariaLabel}
      type={onClick ? 'button' : undefined}
      className={cn(
        'relative inline-block rounded-full',
        onClick && 'pointer-events-auto cursor-pointer bg-transparent border-0 p-0',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {shouldUseFallback ? (
        <Orb
          size={size}
          state={legacyState}
          audioLevel={audioLevel}
          profile={profile}
          renderer="css"
          showGlow={resolvedTier !== 'presence'}
          className="pointer-events-none"
        />
      ) : (
        <View
          className="h-full w-full rounded-full"
          style={{ width: '100%', height: '100%' }}
          visible={visible}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 3.2]} fov={45} near={0.1} far={100} />
          <OrganicSphere
            profile={profile}
            audioLevel={audioLevel}
            segments={segments}
            stateMultipliers={stateMul}
          />
        </View>
      )}
    </Wrapper>
  );
});

/**
 * State multipliers — applied to OrganicSphere base params.
 * Lerped inside the shader update loop, no React re-renders.
 */
export interface OrbStateMultipliers {
  volume: number;
  distortion: number;
  fresnel: number;
  timeFreq: number;
  intensityBoost: number; // light intensity scalar
}

export const STATE_MULTIPLIERS: Record<OrbViewState, OrbStateMultipliers> = {
  idle:       { volume: 1.00, distortion: 1.00, fresnel: 1.00, timeFreq: 1.00, intensityBoost: 1.00 },
  listening:  { volume: 1.30, distortion: 1.30, fresnel: 1.10, timeFreq: 1.60, intensityBoost: 1.10 },
  thinking:   { volume: 1.55, distortion: 1.55, fresnel: 1.20, timeFreq: 2.20, intensityBoost: 1.20 },
  responding: { volume: 1.40, distortion: 1.20, fresnel: 1.05, timeFreq: 1.80, intensityBoost: 1.30 },
  recovery:   { volume: 0.65, distortion: 0.55, fresnel: 0.85, timeFreq: 0.55, intensityBoost: 0.80 },
  focus:      { volume: 0.80, distortion: 0.70, fresnel: 1.30, timeFreq: 0.70, intensityBoost: 0.90 },
  hypnosis:   { volume: 1.80, distortion: 2.00, fresnel: 1.40, timeFreq: 1.30, intensityBoost: 1.15 },
};

const LEGACY_STATE_MAP = {
  idle: 'idle',
  listening: 'listening',
  thinking: 'thinking',
  responding: 'speaking',
  recovery: 'breathing',
  focus: 'session',
  hypnosis: 'session',
} as const;

export default OrbView;