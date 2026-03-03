import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { debug } from '@/lib/debug';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Command types for cross-app control
export type CommandType = 'navigate' | 'setting' | 'mode' | 'action';

export interface AuroraCommand {
  type: CommandType;
  command: string;
  params?: Record<string, string>;
}

interface AuroraChatContextType {
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  defaultConversationId: string | null;
  activeConversationId: string | null;
  isLoading: boolean;
  handleNewChat: () => Promise<boolean>;
  handleSelectConversation: (id: string) => void;
  // For global input - allows sending messages from anywhere
  sendMessageRef: React.MutableRefObject<((message: string, imageBase64?: string) => void) | null>;
  registerSendMessage: (fn: (message: string, imageBase64?: string) => void) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  // Dock visibility — controlled by floating FAB
  isDockVisible: boolean;
  setIsDockVisible: (visible: boolean) => void;
  // Chat expanded state - shows message bubbles when focused
  isChatExpanded: boolean;
  setIsChatExpanded: (expanded: boolean) => void;
  toggleChatExpanded: () => void;
  // Search and navigate to specific message
  scrollToMessageId: string | null;
  setScrollToMessageId: (id: string | null) => void;
  openChatAndScrollToMessage: (conversationId: string, messageId: string) => void;
  // Command execution
  executeCommand: (command: AuroraCommand) => void;
  registerCommandHandler: (handler: (command: AuroraCommand) => void) => void;
  // Proactive messages
  pendingProactiveMessage: string | null;
  setPendingProactiveMessage: (message: string | null) => void;
  // Inject a greeting as an assistant message (not sent as user prompt)
  pendingAssistantGreeting: string | null;
  setPendingAssistantGreeting: (message: string | null) => void;
  // Pillar context
  activePillar: string | null;
  setActivePillar: (pillar: string | null) => void;
  pillarConversationId: string | null;
  // Assessment mode — opens assessment in the dock
  assessmentDomainId: string | null;
  startAssessment: (domainId: string) => void;
  endAssessment: () => void;
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
  const [isDockVisible, setIsDockVisible] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [scrollToMessageId, setScrollToMessageId] = useState<string | null>(null);
  const [pendingProactiveMessage, setPendingProactiveMessage] = useState<string | null>(null);
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [assessmentDomainId, setAssessmentDomainId] = useState<string | null>(null);
  const sendMessageRef = useRef<((message: string, imageBase64?: string) => void) | null>(null);
  const commandHandlerRef = useRef<((command: AuroraCommand) => void) | null>(null);

  const toggleChatExpanded = useCallback(() => {
    setIsChatExpanded(prev => !prev);
  }, []);

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

  // When pillar is active, use pillar conversation; otherwise use user-selected or default
  const activeConversationId = activePillar
    ? (pillarConversationId || null)
    : (currentConversationId || defaultConversationId || null);

  const handleNewChat = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('handleNewChat: No user ID available');
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .rpc('create_ai_conversation', { p_user_id: user.id });

      if (error) {
        console.error('Failed to create new chat (RPC):', error);
        return false;
      }

      const newId = data as string | null;
      if (!newId) return false;

      setActivePillar(null); // Clear pillar context on new chat
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

  const registerSendMessage = useCallback((fn: (message: string, imageBase64?: string) => void) => {
    sendMessageRef.current = fn;
  }, []);

  const openChatAndScrollToMessage = useCallback((conversationId: string, messageId: string) => {
    setCurrentConversationId(conversationId);
    setScrollToMessageId(messageId);
    setIsDockVisible(true);
    setIsChatExpanded(true);
  }, []);

  // Command execution system
  const executeCommand = useCallback((command: AuroraCommand) => {
    debug.log('Aurora executing command:', command);
    
    if (commandHandlerRef.current) {
      commandHandlerRef.current(command);
    }
    
    window.dispatchEvent(new CustomEvent('aurora:command', { detail: command }));
  }, []);

  const registerCommandHandler = useCallback((handler: (command: AuroraCommand) => void) => {
    commandHandlerRef.current = handler;
  }, []);

  // Listen for global Aurora events
  useEffect(() => {
    const handleNewChatEvent = () => {
      handleNewChat();
    };

    window.addEventListener('aurora:new-chat', handleNewChatEvent);
    return () => {
      window.removeEventListener('aurora:new-chat', handleNewChatEvent);
    };
  }, [handleNewChat]);

  const startAssessment = useCallback((domainId: string) => {
    setAssessmentDomainId(domainId);
    setIsDockVisible(true);
    setIsChatExpanded(true);
  }, []);

  const endAssessment = useCallback(() => {
    setAssessmentDomainId(null);
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
        isDockVisible,
        setIsDockVisible,
        isChatExpanded,
        setIsChatExpanded,
        toggleChatExpanded,
        scrollToMessageId,
        setScrollToMessageId,
        openChatAndScrollToMessage,
        executeCommand,
        registerCommandHandler,
        pendingProactiveMessage,
        setPendingProactiveMessage,
        activePillar,
        setActivePillar,
        pillarConversationId: pillarConversationId || null,
        assessmentDomainId,
        startAssessment,
        endAssessment,
      }}
    >
      {children}
    </AuroraChatContext.Provider>
  );
};
