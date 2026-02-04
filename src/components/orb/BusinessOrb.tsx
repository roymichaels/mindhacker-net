/**
 * BusinessOrb - Renders a business-specific orb with unique visual identity
 * Uses the same rendering engine as PersonalizedOrb but with business data
 */

import React, { forwardRef } from 'react';
import { useBusinessOrbProfile, DEFAULT_BUSINESS_ORB_PROFILE } from '@/hooks/useBusinessOrbProfile';
import { Orb } from './Orb';
import type { OrbRef, OrbProps } from './types';

export interface BusinessOrbProps extends Omit<OrbProps, 'profile' | 'egoState'> {
  /** Business journey ID */
  businessId: string;
  /** Show loading skeleton while loading */
  showLoadingSkeleton?: boolean;
}

export const BusinessOrb = forwardRef<OrbRef, BusinessOrbProps>(
  function BusinessOrb(
    {
      businessId,
      showLoadingSkeleton = false,
      size = 200,
      state = 'idle',
      audioLevel,
      tunnelMode,
      className,
      showGlow = true,
      onReady,
      ...props
    },
    ref
  ) {
    const { profile, isLoading } = useBusinessOrbProfile(businessId);

    // Business theme colors (gold/amber)
    const themeColors = {
      primary: 'hsl(45, 90%, 50%)',
      secondary: 'hsl(35, 80%, 45%)',
      accent: 'hsl(38, 95%, 55%)',
      glow: 'hsl(45, 100%, 60%)',
    };

    // Show skeleton while loading
    if (showLoadingSkeleton && isLoading) {
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

    const activeProfile = profile || DEFAULT_BUSINESS_ORB_PROFILE;

    return (
      <Orb
        ref={ref}
        size={size}
        state={state}
        audioLevel={audioLevel}
        tunnelMode={tunnelMode}
        egoState="explorer"
        className={className}
        showGlow={showGlow}
        onReady={onReady}
        profile={activeProfile}
        themeColors={themeColors}
        {...props}
      />
    );
  }
);

export default BusinessOrb;
