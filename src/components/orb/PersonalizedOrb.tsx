/**
 * PersonalizedOrb - Wrapper component that loads user's orb profile
 * and renders the appropriate orb with personalized settings.
 * Uses theme colors from admin panel when user is not personalized.
 */

import React, { forwardRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { Orb } from './Orb';
import type { OrbRef, OrbProps } from './types';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';

export interface PersonalizedOrbProps extends Omit<OrbProps, 'egoState'> {
  /** Force a specific ego state instead of user's active one */
  forceEgoState?: string;
  /** Disable personalization and use defaults */
  disablePersonalization?: boolean;
  /** Show loading skeleton while profile loads */
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
    const { profile, isLoading, isPersonalized, storedProfile } = useOrbProfile();
    const { theme, loading: themeLoading } = useThemeSettings();

    // Create theme-based colors from admin panel settings
    const themeColors = useMemo(() => ({
      primary: `hsl(${theme.primary_h}, ${theme.primary_s}, ${theme.primary_l})`,
      secondary: `hsl(${theme.secondary_h}, ${theme.secondary_s}, ${theme.secondary_l})`,
      accent: `hsl(${theme.accent_h}, ${theme.accent_s}, ${theme.accent_l})`,
      glow: `hsl(${theme.primary_h}, ${theme.primary_s}, ${theme.primary_glow_l || '70'}%)`,
    }), [theme.primary_h, theme.primary_s, theme.primary_l, theme.primary_glow_l, 
         theme.secondary_h, theme.secondary_s, theme.secondary_l,
         theme.accent_h, theme.accent_s, theme.accent_l]);

    // Determine the profile to use - enhanced with theme colors
    const activeProfile = useMemo(() => {
      if (disablePersonalization || !user) {
        // Use theme colors from admin panel for default orb
        return {
          ...DEFAULT_ORB_PROFILE,
          primaryColor: themeColors.primary,
          secondaryColors: [themeColors.secondary],
          accentColor: themeColors.accent,
        };
      }
      return profile;
    }, [disablePersonalization, user, profile, themeColors]);

    // Extract ego state from profile or use force override
    const egoState = forceEgoState || activeProfile.computedFrom.egoState || 'guardian';

    // Show skeleton while loading if requested
    // Avoid "flash then disappear": during background refetches `isLoading` can flip true and
    // would replace a rendered orb with the skeleton. Only show skeleton on the initial load
    // when we don't have a stored profile yet.
    if (showLoadingSkeleton && (themeLoading || (isLoading && !storedProfile))) {
      return (
        <div
          className={className}
          style={{ width: size, height: size }}
        >
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
        // Pass profile data with theme colors
        profile={activeProfile}
        themeColors={themeColors}
        {...props}
      />
    );
  }
);

export default PersonalizedOrb;
