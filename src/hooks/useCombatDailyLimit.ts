import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/** Returns true if the user already created a combat thread today (UTC-normalized local date) */
export function useCombatDailyLimit() {
  const { user } = useAuth();

  const { data: hasPostedToday = false, isLoading: loading } = useQuery({
    queryKey: ['combat-daily-limit', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Use local date start/end to prevent timezone bypass
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Get combat category IDs
      const combatCategoryNames = ['Striking', 'Grappling', 'Tactical', 'Weapons', 'Conditioning', 'Solo Training', 'Mistake Analysis', 'Sparring IQ', 'Biomechanics'];
      const { data: categories } = await supabase
        .from('community_categories')
        .select('id')
        .in('name_en', combatCategoryNames);
      
      if (!categories || categories.length === 0) return false;
      const categoryIds = categories.map(c => c.id);

      const { count } = await supabase
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('category_id', categoryIds)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      return (count ?? 0) > 0;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  return { hasPostedToday, loading };
}
