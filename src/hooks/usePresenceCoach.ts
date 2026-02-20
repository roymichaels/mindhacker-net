/**
 * @module hooks/usePresenceCoach
 * @purpose Read/write Presence bio-scan data from life_domains table (domain_id = 'presence').
 */

import { useLifeDomains } from './useLifeDomains';
import { useMemo, useCallback } from 'react';
import type {
  PresenceDomainConfig,
  PresenceScanResult,
} from '@/lib/presence/types';

export function usePresenceCoach() {
  const { getDomain, upsertDomain, isLoading } = useLifeDomains();

  const domainRow = getDomain('presence');
  const config: PresenceDomainConfig = useMemo(
    () => (domainRow?.domain_config as PresenceDomainConfig) ?? {},
    [domainRow],
  );

  const saveConfig = useCallback(
    async (patch: Partial<PresenceDomainConfig>) => {
      const merged = { ...config, ...patch };
      await upsertDomain.mutateAsync({
        domainId: 'presence',
        config: merged as Record<string, any>,
        status: merged.completed ? 'configured' : undefined,
      });
    },
    [config, upsertDomain],
  );

  const saveScanResult = useCallback(
    async (result: PresenceScanResult) => {
      const history = [...(config.scan_history ?? [])];
      if (config.latest_scan) history.unshift(config.latest_scan);
      await saveConfig({
        latest_scan: result,
        scan_history: history,
      });
    },
    [config, saveConfig],
  );

  const saveFocusItems = useCallback(
    async (itemIds: string[]) => {
      await saveConfig({ focus_items_selected: itemIds });
    },
    [saveConfig],
  );

  const markComplete = useCallback(
    async () => {
      await saveConfig({
        completed: true,
        completed_at: new Date().toISOString(),
      });
    },
    [saveConfig],
  );

  return {
    config,
    isLoading,
    isSaving: upsertDomain.isPending,
    saveScanResult,
    saveFocusItems,
    markComplete,
    saveConfig,
  };
}
