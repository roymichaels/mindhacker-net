import { useEffect } from 'react';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';

/**
 * Sets the active pillar context on the AuroraDock so it scopes
 * conversation to the specified pillar. Clears on unmount.
 */
export function usePillarContext(pillar: string) {
  const ctx = useAuroraChatContextSafe();

  useEffect(() => {
    if (ctx) {
      ctx.setActivePillar(pillar);
    }
    return () => {
      if (ctx) {
        ctx.setActivePillar(null);
      }
    };
  }, [pillar, ctx]);
}
