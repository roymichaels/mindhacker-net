/**
 * @module hooks/useConsciousnessCoach
 * CRUD hook for Consciousness domain_config data via life_domains.
 */
import { useLifeDomains } from './useLifeDomains';
import { useMemo, useCallback } from 'react';
import type { ConsciousnessDomainConfig, ConsciousnessAssessmentResult } from '@/lib/consciousness/types';

export function useConsciousnessCoach() {
  const { getDomain, upsertDomain, isLoading } = useLifeDomains();

  const domainRow = getDomain('consciousness');
  const config: ConsciousnessDomainConfig = useMemo(
    () => (domainRow?.domain_config as ConsciousnessDomainConfig) ?? {},
    [domainRow],
  );

  const saveConfig = useCallback(
    async (patch: Partial<ConsciousnessDomainConfig>) => {
      const merged = { ...config, ...patch };
      await upsertDomain.mutateAsync({
        domainId: 'consciousness',
        config: merged as Record<string, any>,
        status: merged.completed ? 'configured' : undefined,
      });
    },
    [config, upsertDomain],
  );

  const saveAssessment = useCallback(
    async (result: ConsciousnessAssessmentResult) => {
      const history = [...(config.history ?? [])];
      if (config.latest_assessment) history.unshift(config.latest_assessment);
      await saveConfig({
        latest_assessment: result,
        history,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    },
    [config, saveConfig],
  );

  const saveFocusItems = useCallback(
    async (itemIds: string[]) => {
      if (!config.latest_assessment) return;
      await saveConfig({
        latest_assessment: { ...config.latest_assessment, selected_focus_items: itemIds },
      });
    },
    [config, saveConfig],
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
    saveAssessment,
    saveFocusItems,
    markComplete,
    saveConfig,
  };
}
