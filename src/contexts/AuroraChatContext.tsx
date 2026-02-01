import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuroraChatContextType {
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  defaultConversationId: string | null;
  activeConversationId: string | null;
  isLoading: boolean;
  handleNewChat: () => Promise<void>;
  handleSelectConversation: (id: string) => void;
  // For global input - allows sending messages from anywhere
  sendMessageRef: React.MutableRefObject<((message: string) => void) | null>;
  registerSendMessage: (fn: (message: string) => void) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
}

const AuroraChatContext = createContext<AuroraChatContextType | null>(null);

export const useAuroraChatContext = () => {
  const context = useContext(AuroraChatContext);
  if (!context) {
    throw new Error('useAuroraChatContext must be used within AuroraChatProvider');
  }
  return context;
};

// Safe version that returns null if not in provider
export const useAuroraChatContextSafe = () => {
  return useContext(AuroraChatContext);
};

export const AuroraChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const sendMessageRef = useRef<((message: string) => void) | null>(null);

  // Get or create the default AI conversation
  const { data: defaultConversationId, isLoading } = useQuery({
    queryKey: ['aurora-default-conversation', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_or_create_ai_conversation', { user_id: user.id });
      
      if (error) {
        console.error('Failed to get/create AI conversation:', error);
        throw error;
      }
      
      return data as string;
    },
    enabled: !!user?.id,
  });

  const activeConversationId = currentConversationId || defaultConversationId || null;

  const handleNewChat = useCallback(async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: user.id,
        participant_2: null,
        type: 'ai',
      })
      .select('id')
      .single();
    
    if (!error && data) {
      setCurrentConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['aurora-conversations'] });
    }
  }, [user?.id, queryClient]);

  const handleSelectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const registerSendMessage = useCallback((fn: (message: string) => void) => {
    sendMessageRef.current = fn;
  }, []);

  return (
    <AuroraChatContext.Provider
      value={{
        currentConversationId,
        setCurrentConversationId,
        defaultConversationId: defaultConversationId || null,
        activeConversationId,
        isLoading,
        handleNewChat,
        handleSelectConversation,
        sendMessageRef,
        registerSendMessage,
        isStreaming,
        setIsStreaming,
      }}
    >
      {children}
    </AuroraChatContext.Provider>
  );
};
