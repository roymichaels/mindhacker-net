import { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraChat } from '@/hooks/aurora/useAuroraChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import AuroraChatMessage from './AuroraChatMessage';
import AuroraChatInput from './AuroraChatInput';
import AuroraTypingIndicator from './AuroraTypingIndicator';
import AuroraWelcome from './AuroraWelcome';

interface AuroraChatAreaProps {
  conversationId: string | null;
}

const AuroraChatArea = ({ conversationId }: AuroraChatAreaProps) => {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    regenerateLastResponse,
  } = useAuroraChat(conversationId);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="h-full flex flex-col relative isolate">
      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="w-full h-full pb-44 sm:pb-32 px-4">
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

      {/* Input Area */}
      <AuroraChatInput
        onSend={sendMessage}
        disabled={isStreaming}
      />
    </div>
  );
};

export default AuroraChatArea;
