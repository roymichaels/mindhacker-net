/**
 * useVitalityEngine — Data access layer for the Precision Vitality Intelligence Engine
 * Loads onboarding data, builds snapshot, persists to life_domains.
 */
import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useQuery } from '@tanstack/react-query';
import { VITALITY_DATA_MAP } from '@/lib/vitality/dataMap';
import { buildVitalitySnapshot } from '@/lib/vitality/scoring';
import type { VitalityDomainConfig, VitalityAssessment } from '@/lib/vitality/types';

export function useVitalityEngine() {
  const { user } = useAuth();
  const { getDomain, upsertDomain } = useLifeDomains();

  // Fetch launchpad_progress raw data
  const launchpadQuery = useQuery({
    queryKey: ['launchpad-vitality-raw', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launchpad_progress')
        .select('step_1_intention, step_2_profile_data')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as { step_1_intention: Record<string, any> | null; step_2_profile_data: Record<string, any> | null } | null;
    },
  });

  // Get existing vitality domain config
  const domainRow = getDomain('vitality');
  const config = (domainRow?.domain_config ?? { history: [], completed: false, completed_at: null }) as unknown as VitalityDomainConfig;

  // Extract all vitality-relevant fields from onboarding data + standalone intake
  const rawInputs = useMemo(() => {
    const out: Record<string, any> = {};
    // First pull from onboarding
    if (launchpadQuery.data) {
      const s1 = (launchpadQuery.data.step_1_intention as Record<string, any>) ?? {};
      const s2 = (launchpadQuery.data.step_2_profile_data as Record<string, any>) ?? {};
      for (const field of VITALITY_DATA_MAP) {
        const source = field.sourceColumn === 'step_1_intention' ? s1 : s2;
        if (source[field.internalKey] !== undefined) {
          out[field.internalKey] = source[field.internalKey];
        }
      }
    }
    // Override with standalone intake answers if available
    const intakeAnswers = (domainRow?.domain_config as any)?.intake_answers;
    if (intakeAnswers && typeof intakeAnswers === 'object') {
      Object.assign(out, intakeAnswers);
    }
    return out;
  }, [launchpadQuery.data, domainRow?.domain_config]);

  // Compute a fresh assessment from current onboarding data
  const computeAssessment = useCallback((): VitalityAssessment | null => {
    if (Object.keys(rawInputs).length === 0) return null;
    return buildVitalitySnapshot(rawInputs);
  }, [rawInputs]);

  // Save assessment to life_domains
  const saveAssessment = useCallback(async (assessment: VitalityAssessment) => {
    const history = [...(config.history ?? [])];
    if (config.latest_assessment) {
      history.unshift(config.latest_assessment);
    }
    // Keep max 20 history items
    const trimmedHistory = history.slice(0, 20);

    const newConfig: VitalityDomainConfig = {
      latest_assessment: assessment,
      history: trimmedHistory,
      completed: config.completed,
      completed_at: config.completed_at,
    };

    await upsertDomain.mutateAsync({
      domainId: 'vitality',
      config: newConfig as unknown as Record<string, any>,
      status: 'configured',
    });
  }, [config, upsertDomain]);

  // Compute + save in one action
  const runAssessment = useCallback(async () => {
    const assessment = computeAssessment();
    if (!assessment) return null;
    await saveAssessment(assessment);
    return assessment;
  }, [computeAssessment, saveAssessment]);

  // Save assessment from standalone intake form
  const saveAssessmentFromIntake = useCallback(async (assessment: VitalityAssessment, intakeAnswers: Record<string, any>) => {
    const history = [...(config.history ?? [])];
    if (config.latest_assessment) {
      history.unshift(config.latest_assessment);
    }
    const trimmedHistory = history.slice(0, 20);

    const newConfig: VitalityDomainConfig & { intake_answers: Record<string, any> } = {
      latest_assessment: assessment,
      history: trimmedHistory,
      completed: true,
      completed_at: new Date().toISOString(),
      intake_answers: intakeAnswers,
    };

    await upsertDomain.mutateAsync({
      domainId: 'vitality',
      config: newConfig as unknown as Record<string, any>,
      status: 'configured',
    });
  }, [config, upsertDomain]);

  // Mark complete
  const markComplete = useCallback(async () => {
    const newConfig: VitalityDomainConfig = {
      ...config,
      completed: true,
      completed_at: new Date().toISOString(),
    };
    await upsertDomain.mutateAsync({
      domainId: 'vitality',
      config: newConfig as unknown as Record<string, any>,
      status: 'configured',
    });
  }, [config, upsertDomain]);

  return {
    rawInputs,
    config,
    latestAssessment: config.latest_assessment ?? null,
    isLoading: launchpadQuery.isLoading,
    hasData: Object.keys(rawInputs).length > 0,
    computeAssessment,
    runAssessment,
    saveAssessmentFromIntake,
    markComplete,
    isSaving: upsertDomain.isPending,
  };
}
