/**
 * @module hooks/useExpansionCoach
 * CRUD hook for Expansion domain_config data via life_domains.
 */
import { useLifeDomains } from './useLifeDomains';
import { useMemo, useCallback } from 'react';
import type { ExpansionDomainConfig, ExpansionAssessmentResult } from '@/lib/expansion/types';

export function useExpansionCoach() {
  const { getDomain, upsertDomain, isLoading } = useLifeDomains();

  const domainRow = getDomain('expansion');
  const config: ExpansionDomainConfig = useMemo(
    () => (domainRow?.domain_config as ExpansionDomainConfig) ?? {},
    [domainRow],
  );

  const saveConfig = useCallback(
    async (patch: Partial<ExpansionDomainConfig>) => {
      const merged = { ...config, ...patch };
      await upsertDomain.mutateAsync({
        domainId: 'expansion',
        config: merged as Record<string, any>,
        status: merged.completed ? 'configured' : undefined,
      });
    },
    [config, upsertDomain],
  );

  const saveAssessment = useCallback(
    async (result: ExpansionAssessmentResult) => {
      const history = [...(config.history ?? [])];
      if (config.latest_assessment) history.unshift(config.latest_assessment);
      await saveConfig({
        latest_assessment: result,
        history,
        draft_answers: undefined,
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

  const saveDraft = useCallback(
    async (answers: Record<string, any>) => {
      await saveConfig({ draft_answers: answers });
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
    saveDraft,
  };
}
