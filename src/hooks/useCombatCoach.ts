/**
 * @module hooks/useCombatCoach
 * CRUD hook for Combat domain_config data via life_domains.
 */
import { useLifeDomains } from './useLifeDomains';
import { useMemo, useCallback } from 'react';
import type { CombatDomainConfig, CombatAssessmentResult } from '@/lib/combat/types';

export function useCombatCoach() {
  const { getDomain, upsertDomain, isLoading } = useLifeDomains();

  const domainRow = getDomain('combat');
  const config: CombatDomainConfig = useMemo(
    () => (domainRow?.domain_config as CombatDomainConfig) ?? {},
    [domainRow],
  );

  const saveConfig = useCallback(
    async (patch: Partial<CombatDomainConfig>) => {
      const merged = { ...config, ...patch };
      await upsertDomain.mutateAsync({
        domainId: 'combat',
        config: merged as Record<string, any>,
        status: merged.completed ? 'configured' : undefined,
      });
    },
    [config, upsertDomain],
  );

  const saveAssessment = useCallback(
    async (result: CombatAssessmentResult) => {
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
