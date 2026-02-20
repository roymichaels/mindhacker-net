/**
 * Hook for managing domain assessment data (wealth, influence, relationships).
 * Mirrors useConsciousnessCoach but generalized for any domain.
 */
import { useLifeDomains } from './useLifeDomains';
import { useMemo, useCallback } from 'react';
import type { DomainAssessmentConfig, DomainAssessmentResult } from '@/lib/domain-assess/types';

export function useDomainAssessment(domainId: string) {
  const { getDomain, upsertDomain, isLoading } = useLifeDomains();

  const domainRow = getDomain(domainId);
  const config: DomainAssessmentConfig = useMemo(
    () => (domainRow?.domain_config as DomainAssessmentConfig) ?? {},
    [domainRow],
  );

  const saveAssessment = useCallback(
    async (result: DomainAssessmentResult) => {
      const history = [...(config.history ?? [])];
      if (config.latest_assessment) history.unshift(config.latest_assessment);
      const merged: DomainAssessmentConfig = {
        ...config,
        latest_assessment: result,
        history,
        completed: true,
        completed_at: new Date().toISOString(),
      };
      await upsertDomain.mutateAsync({
        domainId,
        config: merged as Record<string, any>,
        status: 'configured',
      });
    },
    [config, upsertDomain, domainId],
  );

  return {
    config,
    isLoading,
    isSaving: upsertDomain.isPending,
    saveAssessment,
  };
}
