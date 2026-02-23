/**
 * Hook for managing domain assessment data (wealth, influence, relationships).
 * Mirrors useConsciousnessCoach but generalized for any domain.
 * For Apex users: auto-triggers modular strategy addition on assessment save.
 */
import { useLifeDomains } from './useLifeDomains';
import { useMemo, useCallback } from 'react';
import { useSubscriptionGate } from './useSubscriptionGate';
import { useStrategyPlans } from './useStrategyPlans';
import { usePillarAccess } from './usePillarAccess';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import type { DomainAssessmentConfig, DomainAssessmentResult } from '@/lib/domain-assess/types';

export function useDomainAssessment(domainId: string) {
  const { getDomain, upsertDomain, isLoading } = useLifeDomains();
  const { isApex } = useSubscriptionGate();
  const { generateStrategy } = useStrategyPlans();
  const { addPillar } = usePillarAccess();

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

      // Apex auto-trigger: modularly add this pillar to existing strategy
      if (isApex) {
        const hub = CORE_DOMAINS.some(d => d.id === domainId) ? 'core' : 'arena';
        try {
          await addPillar(domainId, hub);
          generateStrategy.mutate({ hub, singlePillar: domainId });
        } catch (e) {
          console.warn('Auto strategy update failed:', e);
        }
      }
    },
    [config, upsertDomain, domainId, isApex, generateStrategy, addPillar],
  );

  return {
    config,
    isLoading,
    isSaving: upsertDomain.isPending,
    saveAssessment,
  };
}
