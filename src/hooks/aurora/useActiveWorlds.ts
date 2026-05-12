/**
 * useActiveWorlds — lists currently active life-worlds for the home strip.
 *
 * "Active" = the user has recent activity inside that domain (conversation,
 * artifact, mission, etc.). For the initial Minimal Home pass we return an
 * empty array, which causes <ActiveWorldsStrip /> to render nothing. As
 * domain-activity signals get wired in, this hook is the single place to
 * compute the list.
 */
import { useMemo } from 'react';
import { CORE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';

export interface ActiveWorld {
  id: string;
  labelHe: string;
  labelEn: string;
  color: string;
}

export function useActiveWorlds(): { worlds: ActiveWorld[]; isLoading: boolean } {
  return useMemo(() => {
    // Placeholder: no recent-activity selector yet. Returning [] keeps the
    // strip hidden until real signals are wired.
    const worlds: ActiveWorld[] = [];
    void CORE_DOMAINS as LifeDomain[];
    return { worlds, isLoading: false };
  }, []);
}
