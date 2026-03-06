import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { OrbRef, OrbProps, OrbState } from './types';
import { getEgoStateColors } from '@/lib/egoStates';

function normalizeCssColor(input: string | undefined | null): string {
  if (!input) return 'transparent';
  const trimmed = input.trim();
  if (/^(hsl|hsla|rgb|rgba)\(/i.test(trimmed)) return trimmed;
  if (/^\d+\s+\d+%\s+\d+%$/.test(trimmed)) return `hsl(${trimmed})`;
  return trimmed;
}

function hslWithAlpha(input: string | undefined | null, alpha: number): string {
  const c = normalizeCssColor(input);
  const m = c.match(/^hsl\((\s*\d+\s*),\s*(\d+%\s*),\s*(\d+%\s*)\)$/i);
  if (m) return `hsl(${m[1]} ${m[2]} ${m[3]} / ${alpha})`;
  const m2 = c.match(/^hsl\((\s*\d+)\s+(\d+%)\s+(\d+%)\)$/i);
  if (m2) return `hsl(${m2[1]} ${m2[2]} ${m2[3]} / ${alpha})`;
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

  // === ORGANIC BLOB ANIMATION via requestAnimationFrame ===
  const blobRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      phaseRef.current += 0.012;
      const t = phaseRef.current;
      if (blobRef.current) {
        // Generate organic blob deformation using multiple sine waves
        const r1 = Math.sin(t * 0.7) * 3 + Math.cos(t * 1.3) * 2;
        const r2 = Math.sin(t * 0.9 + 1) * 2.5 + Math.cos(t * 0.6 + 2) * 1.5;
        const r3 = Math.sin(t * 1.1 + 2) * 2 + Math.cos(t * 0.8 + 3) * 3;
        const r4 = Math.sin(t * 0.5 + 3) * 2.5 + Math.cos(t * 1.2) * 2;
        const r5 = Math.sin(t * 0.8 + 1.5) * 1.5 + Math.cos(t * 1.0 + 0.5) * 2;
        const r6 = Math.sin(t * 1.3 + 0.8) * 2 + Math.cos(t * 0.7 + 1.2) * 1.5;
        const r7 = Math.sin(t * 0.6 + 2.5) * 2.5 + Math.cos(t * 1.1 + 1.8) * 2;
        const r8 = Math.sin(t * 1.0 + 3.2) * 1.5 + Math.cos(t * 0.9 + 2.8) * 2.5;

        // Build organic border-radius with 8 values
        const base = 50;
        const br = `${base + r1}% ${base - r2}% ${base + r3}% ${base - r4}% / ${base + r5}% ${base - r6}% ${base + r7}% ${base - r8}%`;

        // Gentle scale pulsation
        const scale = 1 + Math.sin(t * 0.4) * 0.02;

        // Subtle rotation
        const rotate = Math.sin(t * 0.3) * 2;

        blobRef.current.style.borderRadius = br;
        blobRef.current.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Dynamic scaling based on audio level and state
  const baseScale = 1;
  const audioScale = 1 + audioLevel * 0.15;
  const stateScale = state === 'speaking' ? 1.05 : state === 'listening' ? 1.02 : 1;
  const totalScale = baseScale * audioScale * stateScale;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Outer glow rings */}
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

      {/* Main orb — organic blob */}
      <div
        ref={blobRef}
        className="relative transition-shadow duration-300"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, ${hslWithAlpha(colors.highlight, 1)} 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, ${hslWithAlpha(colors.shadow, 1)} 0%, transparent 40%),
            linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)
          `,
          boxShadow: `
            0 0 ${30 + audioLevel * 20}px ${colors.glow},
            0 0 ${60 + audioLevel * 40}px ${hslWithAlpha(colors.accent, 0.25)},
            inset 0 0 ${40 + audioLevel * 20}px ${hslWithAlpha(colors.highlight, 0.25)}
          `,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute inset-4 opacity-40"
          style={{
            borderRadius: 'inherit',
            background: `radial-gradient(circle at 40% 40%, ${hslWithAlpha(colors.highlight, 1)} 0%, transparent 60%)`,
          }}
        />

        {/* Subtle organic texture overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            borderRadius: 'inherit',
            background: `
              radial-gradient(circle at 20% 80%, ${hslWithAlpha(colors.accent, 0.3)} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${hslWithAlpha(colors.primary, 0.3)} 0%, transparent 50%)
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
