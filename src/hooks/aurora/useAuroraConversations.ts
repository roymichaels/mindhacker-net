import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAuroraConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [activePillar, setActivePillar] = useState<string | null>(null);

  // Get or create the default AI conversation
  const { data: defaultConversationId, isLoading } = useQuery({
    queryKey: ['aurora-default-conversation', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.rpc('get_or_create_ai_conversation', { user_id: user.id });
      if (error) {
        console.error('Failed to get/create AI conversation:', error);
        throw error;
      }
      return data as string;
    },
    enabled: !!user?.id,
  });

  // Get or create pillar-specific conversation
  const { data: pillarConversationId } = useQuery({
    queryKey: ['pillar-conversation', user?.id, activePillar],
    queryFn: async () => {
      if (!user?.id || !activePillar) return null;
      const { data, error } = await supabase.rpc('get_or_create_pillar_conversation', {
        p_user_id: user.id,
        p_pillar: activePillar,
      });
      if (error) {
        console.error('Failed to get pillar conversation:', error);
        throw error;
      }
      return data as string;
    },
    enabled: !!user?.id && !!activePillar,
  });

  const activeConversationId = activePillar
    ? (pillarConversationId || null)
    : (currentConversationId || defaultConversationId || null);

  const handleNewChat = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('handleNewChat: No user ID available');
      return false;
    }
    try {
      const { data, error } = await supabase.rpc('create_ai_conversation', { p_user_id: user.id });
      if (error) {
        console.error('Failed to create new chat (RPC):', error);
        return false;
      }
      const newId = data as string | null;
      if (!newId) return false;
      setActivePillar(null);
      setCurrentConversationId(newId);
      queryClient.invalidateQueries({ queryKey: ['aurora-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['aurora-messages'] });
      return true;
    } catch (err) {
      console.error('handleNewChat error:', err);
      return false;
    }
  }, [user?.id, queryClient]);

  const handleSelectConversation = useCallback((id: string) => {
    setActivePillar(null);
    setCurrentConversationId(id);
  }, []);

  return {
    currentConversationId,
    setCurrentConversationId,
    defaultConversationId: defaultConversationId || null,
    activeConversationId,
    isLoading,
    handleNewChat,
    handleSelectConversation,
    activePillar,
    setActivePillar,
    pillarConversationId: pillarConversationId || null,
  };
}
