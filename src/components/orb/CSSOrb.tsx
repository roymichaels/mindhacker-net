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
      phaseRef.current += 0.008;
      const t = phaseRef.current;
      if (blobRef.current) {
        // Dramatic organic alien blob deformation — layered sine waves at different frequencies
        const amp = 8; // High amplitude for visible deformation
        const r1 = Math.sin(t * 0.7) * amp + Math.cos(t * 1.7 + 0.3) * (amp * 0.6) + Math.sin(t * 2.3 + 1.1) * 3;
        const r2 = Math.sin(t * 0.9 + 1.2) * (amp * 0.8) + Math.cos(t * 0.5 + 2.4) * amp + Math.sin(t * 1.9) * 2.5;
        const r3 = Math.sin(t * 1.1 + 2.1) * amp + Math.cos(t * 0.8 + 0.7) * (amp * 0.7) + Math.cos(t * 2.1 + 3.0) * 3;
        const r4 = Math.sin(t * 0.6 + 3.3) * (amp * 0.9) + Math.cos(t * 1.4 + 1.5) * amp + Math.sin(t * 1.8 + 2.2) * 2;
        const r5 = Math.sin(t * 0.8 + 0.5) * amp + Math.cos(t * 1.2 + 2.8) * (amp * 0.6) + Math.sin(t * 2.5 + 0.9) * 3.5;
        const r6 = Math.sin(t * 1.3 + 1.8) * (amp * 0.7) + Math.cos(t * 0.6 + 3.1) * amp + Math.cos(t * 1.6 + 0.4) * 2.5;
        const r7 = Math.sin(t * 0.5 + 2.6) * amp + Math.cos(t * 1.1 + 0.2) * (amp * 0.8) + Math.sin(t * 2.0 + 1.7) * 3;
        const r8 = Math.sin(t * 1.0 + 3.5) * (amp * 0.9) + Math.cos(t * 0.9 + 1.9) * amp + Math.cos(t * 1.5 + 2.6) * 2;

        const base = 50;
        const br = `${base + r1}% ${base - r2}% ${base + r3}% ${base - r4}% / ${base + r5}% ${base - r6}% ${base + r7}% ${base - r8}%`;

        // Breathing scale pulsation
        const scale = 1 + Math.sin(t * 0.35) * 0.04 + Math.sin(t * 0.8) * 0.015;

        // Organic slow rotation
        const rotate = Math.sin(t * 0.25) * 4 + Math.cos(t * 0.15) * 2;

        // Subtle translation drift
        const tx = Math.sin(t * 0.3 + 1.0) * 3;
        const ty = Math.cos(t * 0.25 + 0.5) * 3;

        blobRef.current.style.borderRadius = br;
        blobRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`;
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
