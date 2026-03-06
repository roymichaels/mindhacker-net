import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { OrbRef, OrbProps, OrbState } from './types';
import { getEgoStateColors } from '@/lib/egoStates';

// ===== Color Utilities =====
function normalizeCssColor(input: string | undefined | null): string {
  if (!input) return 'transparent';
  const trimmed = input.trim();
  if (/^(hsl|hsla|rgb|rgba)\(/i.test(trimmed)) return trimmed;
  if (/^\d+\s+\d+%\s+\d+%$/.test(trimmed)) return `hsl(${trimmed})`;
  return trimmed;
}

function hslWithAlpha(input: string | undefined | null, alpha: number): string {
  const c = normalizeCssColor(input);
  // "hsl(H, S%, L%)" format
  const m = c.match(/^hsl\((\s*\d+\s*),\s*(\d+%\s*),\s*(\d+%\s*)\)$/i);
  if (m) return `hsl(${m[1]} ${m[2]} ${m[3]} / ${alpha})`;
  // "hsl(H S% L%)" format
  const m2 = c.match(/^hsl\((\s*\d+)\s+(\d+%)\s+(\d+%)\)$/i);
  if (m2) return `hsl(${m2[1]} ${m2[2]} ${m2[3]} / ${alpha})`;
  return c;
}

/** Parse HSL string to components */
function parseHsl(input: string): { h: number; s: number; l: number } | null {
  const c = normalizeCssColor(input);
  const m = c.match(/hsl\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/i);
  if (m) return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
  return null;
}

/** Create a lighter tint of a color */
function lighten(input: string, amount: number): string {
  const parsed = parseHsl(input);
  if (!parsed) return input;
  const l = Math.min(95, parsed.l + amount);
  return `hsl(${parsed.h} ${parsed.s}% ${l}%)`;
}

/** Create a darker shade */
function darken(input: string, amount: number): string {
  const parsed = parseHsl(input);
  if (!parsed) return input;
  const l = Math.max(5, parsed.l - amount);
  return `hsl(${parsed.h} ${parsed.s}% ${l}%)`;
}

/** Shift hue */
function shiftHue(input: string, degrees: number): string {
  const parsed = parseHsl(input);
  if (!parsed) return input;
  const h = (parsed.h + degrees + 360) % 360;
  return `hsl(${h} ${parsed.s}% ${parsed.l}%)`;
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

  // Resolve colors: profile > themeColors > egoState fallback
  const egoColors = getEgoStateColors(egoState);
  const colors = useMemo(() => {
    if (profile) {
      const primary = normalizeCssColor(profile.primaryColor);
      const secondary = normalizeCssColor(profile.secondaryColors?.[0] || profile.primaryColor);
      const secondary2 = normalizeCssColor(profile.secondaryColors?.[1] || profile.accentColor || profile.primaryColor);
      const accent = normalizeCssColor(profile.accentColor);
      return {
        primary, secondary, secondary2, accent,
        glow: accent,
        highlight: lighten(primary, 30),
        shadow: darken(secondary, 15),
        rim: lighten(accent, 20),
        core: lighten(primary, 40),
        depth: darken(primary, 20),
      };
    }
    if (themeColors) {
      const primary = normalizeCssColor(themeColors.primary);
      const secondary = normalizeCssColor(themeColors.secondary);
      const accent = normalizeCssColor(themeColors.accent);
      return {
        primary, secondary, secondary2: accent, accent,
        glow: normalizeCssColor(themeColors.glow),
        highlight: lighten(primary, 25),
        shadow: darken(secondary, 15),
        rim: lighten(accent, 20),
        core: lighten(primary, 35),
        depth: darken(primary, 20),
      };
    }
    const primary = normalizeCssColor(egoColors.primary);
    const secondary = normalizeCssColor(egoColors.secondary);
    const accent = normalizeCssColor(egoColors.accent);
    return {
      primary, secondary, secondary2: accent, accent,
      glow: normalizeCssColor(egoColors.glow),
      highlight: normalizeCssColor(egoColors.highlight),
      shadow: normalizeCssColor(egoColors.shadow),
      rim: lighten(accent, 20),
      core: lighten(primary, 35),
      depth: darken(primary, 20),
    };
  }, [profile, themeColors, egoColors]);

  // Gradient stops from profile for richer color
  const gradientStops = useMemo(() => {
    if (profile?.gradientStops?.length >= 3) {
      return profile.gradientStops.map(s => normalizeCssColor(s));
    }
    return [colors.primary, colors.secondary, colors.accent];
  }, [profile?.gradientStops, colors]);

  useImperativeHandle(ref, () => ({
    setSpeaking: (speaking: boolean) => setInternalState(speaking ? 'speaking' : 'idle'),
    setListening: (listening: boolean) => setInternalState(listening ? 'listening' : 'idle'),
    setThinking: (thinking: boolean) => setInternalState(thinking ? 'thinking' : 'idle'),
    updateState: setInternalState,
    setAudioLevel: setInternalAudioLevel,
    setTunnelMode: setInternalTunnelMode,
  }), []);

  React.useEffect(() => { onReady?.(); }, [onReady]);

  // === ORGANIC BLOB ANIMATION ===
  const blobRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      phaseRef.current += 0.008;
      const t = phaseRef.current;
      if (blobRef.current) {
        const amp = 7;
        const r1 = Math.sin(t * 0.7) * amp + Math.cos(t * 1.7 + 0.3) * (amp * 0.6) + Math.sin(t * 2.3 + 1.1) * 2.5;
        const r2 = Math.sin(t * 0.9 + 1.2) * (amp * 0.8) + Math.cos(t * 0.5 + 2.4) * amp + Math.sin(t * 1.9) * 2;
        const r3 = Math.sin(t * 1.1 + 2.1) * amp + Math.cos(t * 0.8 + 0.7) * (amp * 0.7) + Math.cos(t * 2.1 + 3.0) * 2.5;
        const r4 = Math.sin(t * 0.6 + 3.3) * (amp * 0.9) + Math.cos(t * 1.4 + 1.5) * amp + Math.sin(t * 1.8 + 2.2) * 2;
        const r5 = Math.sin(t * 0.8 + 0.5) * amp + Math.cos(t * 1.2 + 2.8) * (amp * 0.6) + Math.sin(t * 2.5 + 0.9) * 3;
        const r6 = Math.sin(t * 1.3 + 1.8) * (amp * 0.7) + Math.cos(t * 0.6 + 3.1) * amp + Math.cos(t * 1.6 + 0.4) * 2;
        const r7 = Math.sin(t * 0.5 + 2.6) * amp + Math.cos(t * 1.1 + 0.2) * (amp * 0.8) + Math.sin(t * 2.0 + 1.7) * 2.5;
        const r8 = Math.sin(t * 1.0 + 3.5) * (amp * 0.9) + Math.cos(t * 0.9 + 1.9) * amp + Math.cos(t * 1.5 + 2.6) * 2;

        const base = 50;
        const br = `${base + r1}% ${base - r2}% ${base + r3}% ${base - r4}% / ${base + r5}% ${base - r6}% ${base + r7}% ${base - r8}%`;
        const scale = 1 + Math.sin(t * 0.35) * 0.03 + Math.sin(t * 0.8) * 0.01;
        const rotate = Math.sin(t * 0.25) * 3 + Math.cos(t * 0.15) * 1.5;
        const tx = Math.sin(t * 0.3 + 1.0) * 2;
        const ty = Math.cos(t * 0.25 + 0.5) * 2;

        blobRef.current.style.borderRadius = br;
        blobRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`;
      }

      // Animate specular highlight position
      if (highlightRef.current) {
        const hx = 30 + Math.sin(t * 0.4) * 8;
        const hy = 25 + Math.cos(t * 0.35) * 6;
        highlightRef.current.style.background = `radial-gradient(circle at ${hx}% ${hy}%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.15) 25%, transparent 55%)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Dynamic sizing
  const orbDiam = size * 0.78;
  const audioBoost = audioLevel * 0.12;
  const stateScale = state === 'speaking' ? 1.04 : state === 'listening' ? 1.02 : 1;

  // Build the rich multi-layer 3D gradient
  const orbBackground = useMemo(() => {
    // Layer 1: Main color gradient (3+ stops for richness)
    const mainGrad = gradientStops.length >= 4
      ? `linear-gradient(135deg, ${gradientStops[0]} 0%, ${gradientStops[1]} 35%, ${gradientStops[2]} 65%, ${gradientStops[3] || gradientStops[2]} 100%)`
      : `linear-gradient(135deg, ${gradientStops[0]} 0%, ${gradientStops[1]} 50%, ${gradientStops[2]} 100%)`;

    // Layer 2: Depth — dark core-bottom for 3D illusion
    const depthGrad = `radial-gradient(circle at 55% 65%, ${hslWithAlpha(colors.depth, 0.5)} 0%, transparent 50%)`;

    // Layer 3: Light scatter — top-left bright zone (simulates key light)
    const lightGrad = `radial-gradient(circle at 35% 30%, ${hslWithAlpha(colors.core, 0.5)} 0%, transparent 45%)`;

    // Layer 4: Rim / fresnel edge glow
    const rimGrad = `radial-gradient(circle at 50% 50%, transparent 42%, ${hslWithAlpha(colors.rim, 0.25)} 65%, transparent 72%)`;

    // Layer 5: Secondary color wash for richness
    const washGrad = `radial-gradient(ellipse at 70% 70%, ${hslWithAlpha(colors.secondary2, 0.3)} 0%, transparent 50%)`;

    return `${lightGrad}, ${depthGrad}, ${rimGrad}, ${washGrad}, ${mainGrad}`;
  }, [gradientStops, colors]);

  // Inner shadow for concavity illusion
  const orbShadow = useMemo(() => {
    return `
      0 0 ${20 + audioBoost * 40}px ${hslWithAlpha(colors.glow, 0.3)},
      0 0 ${50 + audioBoost * 60}px ${hslWithAlpha(colors.accent, 0.15)},
      inset 0 -${orbDiam * 0.12}px ${orbDiam * 0.25}px ${hslWithAlpha(colors.depth, 0.4)},
      inset 0 ${orbDiam * 0.08}px ${orbDiam * 0.2}px ${hslWithAlpha(colors.core, 0.25)}
    `;
  }, [colors, orbDiam, audioBoost]);

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Outer glow layers */}
      {showGlow && (
        <>
          <div
            className="absolute rounded-full blur-2xl"
            style={{
              width: size * 1.3,
              height: size * 1.3,
              background: `radial-gradient(circle, ${hslWithAlpha(colors.glow, 0.2)} 0%, transparent 70%)`,
              transform: `scale(${stateScale + audioBoost})`,
              transition: 'transform 0.15s ease-out',
            }}
          />
          <div
            className="absolute rounded-full blur-xl"
            style={{
              width: size * 1.15,
              height: size * 1.15,
              background: `radial-gradient(circle, ${hslWithAlpha(colors.accent, 0.15)} 0%, transparent 60%)`,
              transform: `scale(${stateScale + audioBoost * 0.5})`,
              transition: 'transform 0.15s ease-out',
            }}
          />
        </>
      )}

      {/* Main orb body — organic blob */}
      <div
        ref={blobRef}
        style={{
          width: orbDiam,
          height: orbDiam,
          borderRadius: '50%',
          background: orbBackground,
          boxShadow: orbShadow,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Specular highlight — animated position for 3D feel */}
        <div
          ref={highlightRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 'inherit',
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.12) 22%, transparent 50%)',
            mixBlendMode: 'soft-light',
          }}
        />

        {/* Secondary specular (smaller, sharper — simulates point light) */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '35%',
            height: '35%',
            top: '15%',
            left: '22%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 70%)',
            filter: 'blur(3px)',
          }}
        />

        {/* Subsurface scatter — warm/cool edge glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 'inherit',
            background: `radial-gradient(circle at 75% 75%, ${hslWithAlpha(colors.accent, 0.2)} 0%, transparent 40%)`,
          }}
        />

        {/* Fresnel rim edge */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 'inherit',
            boxShadow: `inset 0 0 ${orbDiam * 0.08}px ${hslWithAlpha(colors.rim, 0.35)}`,
          }}
        />
      </div>

      {/* Tunnel mode vortex */}
      {isTunnel && (
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.35,
            height: size * 0.35,
            background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.secondary}, ${colors.accent}, ${colors.primary})`,
            opacity: 0.5,
            animation: 'spin 4s linear infinite reverse',
          }}
        />
      )}
    </div>
  );
});
