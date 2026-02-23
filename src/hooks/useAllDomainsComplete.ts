/**
 * useAllDomainsComplete — Detects when all 14 life domains are configured/active.
 * Returns whether synthesis has already been done or should be triggered.
 */
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAllDomainsComplete() {
  const { user } = useAuth();
  const { statusMap, isLoading: domainsLoading } = useLifeDomains();

  // Check if all 14 domains are configured or active
  const allComplete = !domainsLoading && LIFE_DOMAINS.every(
    (d) => statusMap[d.id] === 'configured' || statusMap[d.id] === 'active'
  );

  const completedCount = LIFE_DOMAINS.filter(
    (d) => statusMap[d.id] === 'configured' || statusMap[d.id] === 'active'
  ).length;

  // Check if synthesis was already performed (look for pillar_synthesis source in identity elements)
  const { data: hasSynthesis, isLoading: synthLoading } = useQuery({
    queryKey: ['pillar-synthesis-done', user?.id],
    enabled: !!user?.id && allComplete,
    queryFn: async () => {
      const { data } = await supabase
        .from('aurora_identity_elements')
        .select('id')
        .eq('user_id', user!.id)
        .eq('metadata->>source', 'pillar_synthesis')
        .limit(1);
      return (data?.length ?? 0) > 0;
    },
  });

  return {
    allComplete,
    completedCount,
    totalDomains: LIFE_DOMAINS.length,
    hasSynthesis: hasSynthesis ?? false,
    shouldTriggerSynthesis: allComplete && !synthLoading && !hasSynthesis,
    isLoading: domainsLoading || synthLoading,
  };
}
