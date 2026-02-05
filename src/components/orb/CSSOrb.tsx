import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';
import type { OrbRef, OrbProps, OrbState } from './types';
import { getEgoStateColors } from '@/lib/egoStates';

function normalizeCssColor(input: string | undefined | null): string {
  if (!input) return 'transparent';
  const trimmed = input.trim();

  // Already a valid CSS function
  if (/^(hsl|hsla|rgb|rgba)\(/i.test(trimmed)) return trimmed;

  // Space-separated HSL like: "292 95% 73%" (common in orb profiles)
  if (/^\d+\s+\d+%\s+\d+%$/.test(trimmed)) {
    return `hsl(${trimmed})`;
  }

  // Hex or named colors fallback
  return trimmed;
}

function hslWithAlpha(input: string | undefined | null, alpha: number): string {
  const c = normalizeCssColor(input);
  const m = c.match(/^hsl\((\s*\d+\s*),\s*(\d+%\s*),\s*(\d+%\s*)\)$/i);
  if (m) return `hsl(${m[1]} ${m[2]} ${m[3]} / ${alpha})`;

  const m2 = c.match(/^hsl\((\s*\d+)\s+(\d+%)\s+(\d+%)\)$/i);
  if (m2) return `hsl(${m2[1]} ${m2[2]} ${m2[3]} / ${alpha})`;

  // If it's not HSL, return as-is (better than breaking)
  return c;
}

export const CSSOrb = forwardRef<OrbRef, OrbProps>(function CSSOrb(
  { size = 300, state: externalState, audioLevel: externalAudioLevel, tunnelMode, egoState = 'guardian', className, showGlow = true, onReady, profile, themeColors },
  ref
) {
  const [internalState, setInternalState] = useState<OrbState>('idle');
  const [internalAudioLevel, setInternalAudioLevel] = useState(0);
  const [internalTunnelMode, setInternalTunnelMode] = useState(false);

  const state = externalState ?? internalState;
  const audioLevel = externalAudioLevel ?? internalAudioLevel;
  const isTunnel = tunnelMode ?? internalTunnelMode;

  // Use profile colors first, then theme colors, then fall back to ego state colors
  const egoColors = getEgoStateColors(egoState);
  const colors = profile ? {
    primary: normalizeCssColor(profile.primaryColor),
    secondary: normalizeCssColor(profile.secondaryColors[0] || profile.primaryColor),
    accent: normalizeCssColor(profile.accentColor),
    glow: normalizeCssColor(profile.accentColor),
    highlight: normalizeCssColor(egoColors.highlight),
    shadow: normalizeCssColor(egoColors.shadow),
  } : themeColors ? {
    primary: normalizeCssColor(themeColors.primary),
    secondary: normalizeCssColor(themeColors.secondary),
    accent: normalizeCssColor(themeColors.accent),
    glow: normalizeCssColor(themeColors.glow),
    highlight: hslWithAlpha(themeColors.primary, 0.8),
    shadow: hslWithAlpha(themeColors.secondary, 0.6),
  } : {
    primary: normalizeCssColor(egoColors.primary),
    secondary: normalizeCssColor(egoColors.secondary),
    accent: normalizeCssColor(egoColors.accent),
    glow: normalizeCssColor(egoColors.glow),
    highlight: normalizeCssColor(egoColors.highlight),
    shadow: normalizeCssColor(egoColors.shadow),
  };

  useImperativeHandle(ref, () => ({
    setSpeaking: (speaking: boolean) => setInternalState(speaking ? 'speaking' : 'idle'),
    setListening: (listening: boolean) => setInternalState(listening ? 'listening' : 'idle'),
    setThinking: (thinking: boolean) => setInternalState(thinking ? 'thinking' : 'idle'),
    updateState: setInternalState,
    setAudioLevel: setInternalAudioLevel,
    setTunnelMode: setInternalTunnelMode,
  }), []);

  React.useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Dynamic scaling based on audio level and state
  const baseScale = 1;
  const audioScale = 1 + audioLevel * 0.15;
  const stateScale = state === 'speaking' ? 1.05 : state === 'listening' ? 1.02 : 1;
  const totalScale = baseScale * audioScale * stateScale;

  // Animation class based on state
  const animationClass = {
    idle: 'animate-float-gentle',
    listening: 'animate-pulse',
    speaking: 'animate-ring-pulse',
    thinking: 'animate-spin-slow',
    session: 'animate-breathe',
    breathing: 'animate-breathe',
  }[state];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Outer glow rings - only show if showGlow is true */}
      {showGlow && (
        <>
          <div
            className="absolute rounded-full opacity-20 blur-xl"
            style={{
              width: size * 1.4,
              height: size * 1.4,
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              transform: `scale(${totalScale})`,
              transition: 'transform 0.1s ease-out',
            }}
          />
          
          <div
            className="absolute rounded-full opacity-30 blur-lg"
            style={{
              width: size * 1.2,
              height: size * 1.2,
              background: `radial-gradient(circle, ${colors.accent} 0%, transparent 60%)`,
              transform: `scale(${totalScale})`,
              transition: 'transform 0.1s ease-out',
            }}
          />
        </>
      )}

      {/* Main orb */}
      <div
        className={cn(
          'relative rounded-full transition-all duration-300',
          animationClass,
          isTunnel && 'animate-spin-slow'
        )}
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: `
            radial-gradient(circle at 30% 30%, ${hslWithAlpha(colors.highlight, 1)} 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, ${hslWithAlpha(colors.shadow, 1)} 0%, transparent 40%),
            linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)
          `,
          boxShadow: `
            0 0 ${30 + audioLevel * 20}px ${colors.glow},
            0 0 ${60 + audioLevel * 40}px ${hslWithAlpha(colors.accent, 0.25)},
            inset 0 0 ${40 + audioLevel * 20}px ${hslWithAlpha(colors.highlight, 0.25)}
          `,
          transform: `scale(${totalScale})`,
          transition: 'transform 0.1s ease-out, box-shadow 0.2s ease-out',
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute inset-4 rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${hslWithAlpha(colors.highlight, 1)} 0%, transparent 60%)`,
          }}
        />

        {/* Wireframe overlay effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 10px, ${hslWithAlpha(colors.accent, 0.12)} 10px, ${hslWithAlpha(colors.accent, 0.12)} 11px),
              repeating-linear-gradient(90deg, transparent, transparent 10px, ${hslWithAlpha(colors.accent, 0.12)} 10px, ${hslWithAlpha(colors.accent, 0.12)} 11px)
            `,
          }}
        />
      </div>

      {/* Tunnel mode inner vortex */}
      {isTunnel && (
        <div
          className="absolute rounded-full animate-spin-slow"
          style={{
            width: size * 0.4,
            height: size * 0.4,
            background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.secondary}, ${colors.accent}, ${colors.primary})`,
            opacity: 0.6,
            animationDirection: 'reverse',
            animationDuration: '4s',
          }}
        />
      )}
    </div>
  );
});
