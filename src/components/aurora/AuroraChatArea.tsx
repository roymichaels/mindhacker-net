import { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraChat } from '@/hooks/aurora/useAuroraChat';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import AuroraChatMessage from './AuroraChatMessage';
import AuroraTypingIndicator from './AuroraTypingIndicator';
import AuroraWelcome from './AuroraWelcome';
import AuroraChatQuickActions from './AuroraChatQuickActions';
import { UserNotificationBell } from '@/components/UserNotificationBell';

interface AuroraChatAreaProps {
  conversationId: string | null;
}

const AuroraChatArea = ({ conversationId }: AuroraChatAreaProps) => {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { registerSendMessage, setIsStreaming } = useAuroraChatContext();

  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    regenerateLastResponse,
  } = useAuroraChat(conversationId);

  // Register sendMessage with the global context
  useEffect(() => {
    registerSendMessage(sendMessage);
  }, [registerSendMessage, sendMessage]);

  // Sync streaming state with context
  useEffect(() => {
    setIsStreaming(isStreaming);
  }, [isStreaming, setIsStreaming]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Floating Quick Actions - fixed position over chat */}
      <div className={`absolute top-2 z-20 flex items-center gap-1 pointer-events-none ${isRTL ? 'right-2 flex-row-reverse' : 'left-2'}`}>
        <div className="pointer-events-auto flex items-center gap-1">
          <AuroraChatQuickActions />
          <UserNotificationBell />
        </div>
      </div>

      {/* Messages Area - takes remaining space and scrolls */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="w-full h-full px-4 pb-4">
          {messages.length === 0 && !isStreaming ? (
            <AuroraWelcome onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <AuroraChatMessage
                  key={message.id}
                  id={message.id}
                  content={message.content}
                  isOwn={message.sender_id === user?.id}
                  isAI={message.is_ai_message}
                  timestamp={message.created_at}
                  onRegenerate={message.is_ai_message ? regenerateLastResponse : undefined}
                />
              ))}
              
              {/* Streaming message */}
              {isStreaming && streamingContent && (
                <AuroraChatMessage
                  id="streaming"
                  content={streamingContent}
                  isOwn={false}
                  isAI
                  isStreaming
                />
              )}

              {/* Typing indicator */}
              {isStreaming && !streamingContent && (
                <AuroraTypingIndicator />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AuroraChatArea;
