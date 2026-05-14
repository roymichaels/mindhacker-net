/**
 * PresenceRouteBridge — Phase 5B.
 *
 * When the user is on identity-shaping surfaces (profile / DNA / avatar /
 * self), AION's presence shifts to `evolving`. On leave, it relaxes back to
 * `resting` unless another emitter has already moved it.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { aionPresenceBus } from '@/aion/presenceState';

const EVOLVING_PREFIXES = ['/profile', '/dna', '/avatar', '/self'];

export default function PresenceRouteBridge() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isEvolving = EVOLVING_PREFIXES.some((p) => pathname.startsWith(p));
    if (isEvolving) {
      aionPresenceBus.set('evolving');
      return () => {
        if (aionPresenceBus.get() === 'evolving') aionPresenceBus.set('resting');
      };
    }
  }, [pathname]);

  return null;
}