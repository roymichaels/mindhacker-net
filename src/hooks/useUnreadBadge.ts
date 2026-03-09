/**
 * useUnreadBadge — tracks unread Aurora proactive messages
 * Shows a badge on the Aurora tab when there are unsent/pending notifications
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUnreadBadge() {
  const { user } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['aurora-unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('aurora_proactive_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('sent_at', 'is', null)
        .is('clicked_at', null)
        .is('dismissed_at', null);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Poll every 30s
  });

  return unreadCount;
}
