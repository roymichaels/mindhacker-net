/**
 * PersonalizedOrb — PURE VISUAL RENDERER for AION identity.
 *
 * ARCHITECTURE RULE:
 *   Orb is a visual representation of DNA/AION.
 *   It must NOT compute identity (archetype, egoState, traits).
 *   Identity comes ONLY from DNA via mapDNAtoVisual.
 *
 * Data flow:
 *   DNA (useDNA) → mapDNAtoVisual → useOrbProfile (visual) → PersonalizedOrb (render)
 *
 * Uses level-based shape morphing: every 25 levels unlocks a new morph shape.
 * Small sizes (<80px) use CSS renderer for performance.
 * Larger sizes use WebGL morphing orb for full 3D effect.
 */

import React, { forwardRef, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { useXpProgress } from '@/hooks/useGameState';
import { useDNA } from '@/identity/useDNA';
import { mapDNAtoVisual } from '@/lib/mapDNAtoVisual';
import { Orb } from './Orb';
import { OrbDebugOverlay } from './OrbDebugOverlay';
import { StandaloneMorphOrb } from './GalleryMorphOrb';
import type { OrbRef, OrbProps, OrbProfile } from './types';
import { DEFAULT_ORB_PROFILE, interpolateOrbProfiles } from '@/lib/orbProfileGenerator';

export interface PersonalizedOrbProps extends Omit<OrbProps, 'egoState'> {
  forceEgoState?: string;
  disablePersonalization?: boolean;
  showLoadingSkeleton?: boolean;
}

/** Threshold: use WebGL morphing orb for sizes >= this */
const MORPH_SIZE_THRESHOLD = 80;

export const PersonalizedOrb = forwardRef<OrbRef, PersonalizedOrbProps>(
  function PersonalizedOrb(
    {
      forceEgoState,
      disablePersonalization = false,
      showLoadingSkeleton = false,
      size = 300,
      state,
      audioLevel,
      tunnelMode,
      className,
      showGlow = true,
      onReady,
      renderer,
      ...props
    },
    ref
  ) {
    const { user } = useAuth();
    const { profile, isLoading, isPersonalized, storedProfile, seed, diagnosticState, missedFields } = useOrbProfile();
    const { theme, loading: themeLoading } = useThemeSettings();
    const { level } = useXpProgress();
    // EgoState from DNA — Orb does NOT compute identity
    const { dna } = useDNA();
    const dnaVisual = useMemo(() => mapDNAtoVisual(dna), [dna]);

    // Smooth transition state
    const prevProfileRef = useRef<OrbProfile | null>(null);
    const [transitionProfile, setTransitionProfile] = useState<OrbProfile | null>(null);
    const animFrameRef = useRef<number>(0);

    const themeColors = useMemo(() => ({
      primary: `hsl(${theme.primary_h}, ${theme.primary_s}, ${theme.primary_l})`,
      secondary: `hsl(${theme.secondary_h}, ${theme.secondary_s}, ${theme.secondary_l})`,
      accent: `hsl(${theme.accent_h}, ${theme.accent_s}, ${theme.accent_l})`,
      glow: `hsl(${theme.primary_h}, ${theme.primary_s}, ${theme.primary_glow_l || '70'}%)`,
    }), [theme.primary_h, theme.primary_s, theme.primary_l, theme.primary_glow_l, 
         theme.secondary_h, theme.secondary_s, theme.secondary_l,
         theme.accent_h, theme.accent_s, theme.accent_l]);

    const activeProfile = useMemo(() => {
      if (disablePersonalization || !user) {
        return {
          ...DEFAULT_ORB_PROFILE,
          primaryColor: themeColors.primary,
          secondaryColors: [themeColors.secondary],
          accentColor: themeColors.accent,
        };
      }
      return profile;
    }, [disablePersonalization, user, profile, themeColors]);

    // Smooth transition when profile changes
    useEffect(() => {
      const prev = prevProfileRef.current;
      if (!prev || prev === activeProfile) {
        prevProfileRef.current = activeProfile;
        return;
      }

      if (prev.geometryFamily !== activeProfile.geometryFamily) {
        prevProfileRef.current = activeProfile;
        setTransitionProfile(null);
        return;
      }

      const startTime = performance.now();
      const duration = 800;

      const tick = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        if (t < 1) {
          setTransitionProfile(interpolateOrbProfiles(prev, activeProfile, eased));
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          setTransitionProfile(null);
          prevProfileRef.current = activeProfile;
        }
      };

      animFrameRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animFrameRef.current);
    }, [activeProfile]);

    const displayProfile = transitionProfile || activeProfile;
    const egoState = forceEgoState || displayProfile.computedFrom.egoState || 'guardian';

    if (showLoadingSkeleton && (themeLoading || (isLoading && !storedProfile))) {
      return (
        <div className={className} style={{ width: size, height: size }}>
          <div
            className="w-full h-full rounded-full animate-pulse"
            style={{
              background: `radial-gradient(circle, ${themeColors.primary} 0%, transparent 70%)`,
              opacity: 0.3,
            }}
          />
        </div>
      );
    }

    // Use WebGL morphing orb for larger sizes, CSS orb for small (HUD/avatars)
    const useMorphOrb = size >= MORPH_SIZE_THRESHOLD && renderer !== 'css';

    if (useMorphOrb) {
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <StandaloneMorphOrb
            size={size}
            profile={displayProfile}
            geometryFamily={displayProfile.geometryFamily || 'sphere'}
            level={level}
          />
          <OrbDebugOverlay
            profile={displayProfile}
            userId={user?.id}
            seed={seed}
            missedFields={missedFields}
            diagnosticState={diagnosticState}
          />
        </div>
      );
    }

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <Orb
          ref={ref}
          size={size}
          state={state}
          audioLevel={audioLevel}
          tunnelMode={tunnelMode}
          egoState={egoState}
          className={className}
          showGlow={showGlow}
          onReady={onReady}
          profile={displayProfile}
          themeColors={themeColors}
          renderer={renderer}
          {...props}
        />
        <OrbDebugOverlay
          profile={displayProfile}
          userId={user?.id}
          seed={seed}
          missedFields={missedFields}
          diagnosticState={diagnosticState}
        />
      </div>
    );
  }
);

export default PersonalizedOrb;
