/**
 * @deprecated Phase 5F.4 — orb canonicalization.
 *
 * PersonalizedOrb is now a thin compatibility wrapper around the canonical
 * `OrbView`, which renders the user's DNA-derived orb identity into the
 * single global SharedOrbStage Canvas. New code should import `OrbView`
 * directly with `identity="user"`.
 */
import { forwardRef } from 'react';
import OrbView, { type OrbViewState } from './v2/OrbView';
import type { OrbRef, OrbProps } from './types';

export interface PersonalizedOrbProps extends Omit<OrbProps, 'egoState'> {
  forceEgoState?: string;
  disablePersonalization?: boolean;
  showLoadingSkeleton?: boolean;
}

const STATE_MAP: Record<string, OrbViewState> = {
  idle: 'idle',
  listening: 'listening',
  thinking: 'thinking',
  speaking: 'responding',
  responding: 'responding',
  breathing: 'recovery',
  session: 'focus',
  focus: 'focus',
  recovery: 'recovery',
  hypnosis: 'hypnosis',
};

function mapState(s: unknown): OrbViewState | undefined {
  if (typeof s !== 'string') return undefined;
  return STATE_MAP[s] ?? 'idle';
}

export const PersonalizedOrb = forwardRef<OrbRef, PersonalizedOrbProps>(
  function PersonalizedOrb(
    { size = 300, state, audioLevel, className, disablePersonalization = false },
    _ref,
  ) {
    return (
      <OrbView
        size={size}
        state={mapState(state)}
        audioLevel={audioLevel}
        className={className}
        identity={disablePersonalization ? 'aion' : 'user'}
        
        
      />
    );
  },
);

export default PersonalizedOrb;
