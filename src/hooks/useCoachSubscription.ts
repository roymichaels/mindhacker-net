import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CoachSubscription {
  subscribed: boolean;
  tier: string | null;
  client_limit: number | null;
  current_period_end: string | null;
  status: string | null;
}

export function useCoachSubscription() {
  const { user } = useAuth();

  return useQuery<CoachSubscription>({
    queryKey: ['coach-subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-coach-subscription');
      if (error) throw error;
      return data as CoachSubscription;
    },
    enabled: !!user,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
