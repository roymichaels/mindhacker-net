import { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useAuroraConversations } from '@/hooks/aurora/useAuroraConversations';
import { useAuroraCommands, CommandType, AuroraCommand } from '@/hooks/aurora/useAuroraCommands';
import { useAuroraDockUI } from '@/hooks/aurora/useAuroraDockUI';

// Re-export types for consumers
export type { CommandType, AuroraCommand };

interface AuroraChatContextType {
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  defaultConversationId: string | null;
  activeConversationId: string | null;
  isLoading: boolean;
  handleNewChat: () => Promise<boolean>;
  handleSelectConversation: (id: string) => void;
  sendMessageRef: React.MutableRefObject<((message: string, imageBase64?: string) => void) | null>;
  registerSendMessage: (fn: (message: string, imageBase64?: string) => void) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  isDockVisible: boolean;
  setIsDockVisible: (visible: boolean) => void;
  isChatExpanded: boolean;
  setIsChatExpanded: (expanded: boolean) => void;
  toggleChatExpanded: () => void;
  scrollToMessageId: string | null;
  setScrollToMessageId: (id: string | null) => void;
  openChatAndScrollToMessage: (conversationId: string, messageId: string) => void;
  executeCommand: (command: AuroraCommand) => void;
  registerCommandHandler: (handler: (command: AuroraCommand) => void) => void;
  pendingProactiveMessage: string | null;
  setPendingProactiveMessage: (message: string | null) => void;
  pendingAssistantGreeting: string | null;
  setPendingAssistantGreeting: (message: string | null) => void;
  activePillar: string | null;
  setActivePillar: (pillar: string | null) => void;
  pillarConversationId: string | null;
  assessmentDomainId: string | null;
  startAssessment: (domainId: string) => void;
  endAssessment: () => void;
  pillarActionCallback: (() => void) | null;
  pillarActionLabel: string | null;
  pillarActionLoading: boolean;
  setPillarAction: (label: string | null, callback: (() => void) | null) => void;
  setPillarActionLoading: (loading: boolean) => void;
}

const AuroraChatContext = createContext<AuroraChatContextType | null>(null);

export const useAuroraChatContext = () => {
  const context = useContext(AuroraChatContext);
  if (!context) {
    throw new Error('useAuroraChatContext must be used within AuroraChatProvider');
  }
  return context;
};

export const useAuroraChatContextSafe = () => {
  return useContext(AuroraChatContext);
};

export const AuroraChatProvider = ({ children }: { children: ReactNode }) => {
  const conversations = useAuroraConversations();
  const commands = useAuroraCommands();
  const dockUI = useAuroraDockUI();

  const openChatAndScrollToMessage = useCallback((conversationId: string, messageId: string) => {
    dockUI.openChatAndScrollToMessage(conversationId, messageId, conversations.setCurrentConversationId);
  }, [dockUI, conversations.setCurrentConversationId]);

  // Listen for global Aurora events
  useEffect(() => {
    const handleNewChatEvent = () => {
      conversations.handleNewChat();
    };
    window.addEventListener('aurora:new-chat', handleNewChatEvent);
    return () => {
      window.removeEventListener('aurora:new-chat', handleNewChatEvent);
    };
  }, [conversations.handleNewChat]);

  return (
    <AuroraChatContext.Provider
      value={{
        ...conversations,
        ...commands,
        ...dockUI,
        openChatAndScrollToMessage,
      }}
    >
      {children}
    </AuroraChatContext.Provider>
  );
};
