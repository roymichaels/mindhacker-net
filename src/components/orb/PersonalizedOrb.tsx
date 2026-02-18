/**
 * PersonalizedOrb - Wrapper component that loads user's orb profile
 * and renders the appropriate orb with personalized settings.
 * Now includes: debug overlay, diagnostic rendering, smooth transitions.
 */

import React, { forwardRef, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { Orb } from './Orb';
import { OrbDebugOverlay } from './OrbDebugOverlay';
import type { OrbRef, OrbProps, OrbProfile } from './types';
import { DEFAULT_ORB_PROFILE, interpolateOrbProfiles } from '@/lib/orbProfileGenerator';

export interface PersonalizedOrbProps extends Omit<OrbProps, 'egoState'> {
  forceEgoState?: string;
  disablePersonalization?: boolean;
  showLoadingSkeleton?: boolean;
}

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
      ...props
    },
    ref
  ) {
    const { user } = useAuth();
    const { profile, isLoading, isPersonalized, storedProfile, seed, diagnosticState, missedFields } = useOrbProfile();
    const { theme, loading: themeLoading } = useThemeSettings();

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

      // Don't transition if geometry family changed (requires rebuild)
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
