/**
 * @deprecated Phase 5F.4 — orb canonicalization.
 * Thin wrapper around `OrbView`. Pulls business-specific OrbProfile via
 * `useBusinessOrbProfile` and renders through the single shared canvas.
 */
import { forwardRef } from 'react';
import OrbView from './v2/OrbView';
import { useBusinessOrbProfile, DEFAULT_BUSINESS_ORB_PROFILE } from '@/hooks/useBusinessOrbProfile';
import type { OrbRef, OrbProps } from './types';

export interface BusinessOrbProps extends Omit<OrbProps, 'profile' | 'egoState'> {
  businessId: string;
  showLoadingSkeleton?: boolean;
}

export const BusinessOrb = forwardRef<OrbRef, BusinessOrbProps>(function BusinessOrb(
  { businessId, size = 200, audioLevel, className },
  _ref,
) {
  const { profile } = useBusinessOrbProfile(businessId);
  return (
    <OrbView
      size={size}
      profile={profile ?? DEFAULT_BUSINESS_ORB_PROFILE}
      audioLevel={audioLevel}
      className={className}
      
      
    />
  );
});

export default BusinessOrb;
