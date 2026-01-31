import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';
import type { OrbRef, OrbProps, OrbState } from './types';
import { getEgoStateColors } from '@/lib/egoStates';

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
    primary: profile.primaryColor,
    secondary: profile.secondaryColors[0] || profile.primaryColor,
    accent: profile.accentColor,
    glow: profile.accentColor,
    highlight: egoColors.highlight,
    shadow: egoColors.shadow,
  } : themeColors ? {
    primary: themeColors.primary,
    secondary: themeColors.secondary,
    accent: themeColors.accent,
    glow: themeColors.glow,
    highlight: `${themeColors.primary.replace(')', ', 0.8)')}`,
    shadow: `${themeColors.secondary.replace(')', ', 0.6)')}`,
  } : egoColors;

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
            radial-gradient(circle at 30% 30%, ${colors.highlight} 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, ${colors.shadow} 0%, transparent 40%),
            linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)
          `,
          boxShadow: `
            0 0 ${30 + audioLevel * 20}px ${colors.glow},
            0 0 ${60 + audioLevel * 40}px ${colors.accent}40,
            inset 0 0 ${40 + audioLevel * 20}px ${colors.highlight}40
          `,
          transform: `scale(${totalScale})`,
          transition: 'transform 0.1s ease-out, box-shadow 0.2s ease-out',
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute inset-4 rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${colors.highlight} 0%, transparent 60%)`,
          }}
        />

        {/* Wireframe overlay effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 10px, ${colors.accent}20 10px, ${colors.accent}20 11px),
              repeating-linear-gradient(90deg, transparent, transparent 10px, ${colors.accent}20 10px, ${colors.accent}20 11px)
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
