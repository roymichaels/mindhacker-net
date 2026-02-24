/**
 * Hook for fetching and managing user's life domain configurations.
 * Uses action_items-style direct queries against life_domains table.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import { isAssessmentReady } from '@/utils/assessmentQuality';

export interface LifeDomainRow {
  id: string;
  user_id: string;
  domain_id: string;
  domain_config: Record<string, any>;
  status: string;
  configured_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useLifeDomains() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['life-domains', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<LifeDomainRow[]> => {
      const { data, error } = await supabase
        .from('life_domains')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      return (data ?? []) as LifeDomainRow[];
    },
  });

  /** Get a single domain's DB row (or undefined if not yet created) */
  const getDomain = (domainId: string) =>
    query.data?.find(d => d.domain_id === domainId);

  /** Upsert a domain row (creates if not exists) */
  const upsertDomain = useMutation({
    mutationFn: async ({ domainId, config, status }: { domainId: string; config?: Record<string, any>; status?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('life_domains')
        .upsert(
          {
            user_id: user.id,
            domain_id: domainId,
            ...(config !== undefined ? { domain_config: config } : {}),
            ...(status !== undefined ? { status } : {}),
            ...(status === 'configured' ? { configured_at: new Date().toISOString() } : {}),
          },
          { onConflict: 'user_id,domain_id' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-domains', user?.id] });
    },
  });

  /** Build a status map for quick lookups — normalized to assessment readiness gate */
  const statusMap: Record<string, string> = {};
  for (const d of LIFE_DOMAINS) {
    const row = getDomain(d.id);
    if (!row) {
      statusMap[d.id] = 'unconfigured';
      continue;
    }

    const cfg = row.domain_config as Record<string, any> | undefined;
    const hasLegacy = !!cfg?.latest && !cfg?.latest_assessment;

    // Legacy shape always requires reassessment
    if (hasLegacy) {
      statusMap[d.id] = 'needs_reassessment';
      continue;
    }

    const ready = isAssessmentReady(d.id, cfg);
    if (ready) {
      statusMap[d.id] = row.status === 'active' ? 'active' : 'configured';
      continue;
    }

    // Any partial/old assessment data that fails quality gate => needs reassessment
    const hasAnyAssessmentData = !!cfg?.latest_assessment || cfg?.completed === true || row.status === 'configured' || row.status === 'active';

    if (hasAnyAssessmentData) {
      statusMap[d.id] = 'needs_reassessment';
    } else {
      statusMap[d.id] = row.status ?? 'unconfigured';
    }
  }

  return {
    domains: query.data ?? [],
    statusMap,
    getDomain,
    upsertDomain,
    isLoading: query.isLoading,
  };
}
