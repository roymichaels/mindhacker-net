import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Get or create a conversation scoped to a specific pillar.
 * Each pillar gets one persistent Aurora conversation per user.
 */
export function usePillarConversation(pillar: string | null) {
  const { user } = useAuth();

  const { data: conversationId, isLoading } = useQuery({
    queryKey: ['pillar-conversation', user?.id, pillar],
    queryFn: async () => {
      if (!user?.id || !pillar) return null;

      const { data, error } = await supabase.rpc('get_or_create_pillar_conversation', {
        p_user_id: user.id,
        p_pillar: pillar,
      });

      if (error) {
        console.error('Failed to get pillar conversation:', error);
        throw error;
      }

      return data as string;
    },
    enabled: !!user?.id && !!pillar,
  });

  return { conversationId: conversationId ?? null, isLoading };
}
