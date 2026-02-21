import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/** Returns true if the user already created a thread today (UTC-normalized local date) */
export function useCommunityDailyLimit() {
  const { user } = useAuth();

  const { data: hasPostedToday = false, isLoading: loading } = useQuery({
    queryKey: ['community-daily-limit', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const { count } = await supabase
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      return (count ?? 0) > 0;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  return { hasPostedToday, loading };
}
