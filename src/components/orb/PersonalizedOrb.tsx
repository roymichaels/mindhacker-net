/**
 * PersonalizedOrb - Wrapper component that loads user's orb profile
 * and renders the appropriate orb with personalized settings
 */

import React, { forwardRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
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
    const { profile, isLoading, isPersonalized } = useOrbProfile();

    // Determine the profile to use
    const activeProfile = useMemo(() => {
      if (disablePersonalization || !user) {
        return DEFAULT_ORB_PROFILE;
      }
      return profile;
    }, [disablePersonalization, user, profile]);

    // Extract ego state from profile or use force override
    const egoState = forceEgoState || activeProfile.computedFrom.egoState || 'guardian';

    // Show skeleton while loading if requested
    if (showLoadingSkeleton && isLoading) {
      return (
        <div
          className={className}
          style={{ width: size, height: size }}
        >
          <div
            className="w-full h-full rounded-full animate-pulse"
            style={{
              background: `radial-gradient(circle, hsl(210, 100%, 50%) 0%, transparent 70%)`,
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
        // Pass profile data as custom props (will be used by enhanced WebGLOrb)
        profile={activeProfile}
        {...props}
      />
    );
  }
);

export default PersonalizedOrb;
