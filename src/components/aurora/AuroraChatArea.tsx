import { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraChat } from '@/hooks/aurora/useAuroraChat';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useCommandBus } from '@/hooks/aurora/useCommandBus';
import { ScrollArea } from '@/components/ui/scroll-area';
import AuroraChatMessage from './AuroraChatMessage';
import AuroraTypingIndicator from './AuroraTypingIndicator';
import AuroraWelcome from './AuroraWelcome';
import AuroraActionConfirmation from './AuroraActionConfirmation';
import { AnimatePresence } from 'framer-motion';

interface AuroraChatAreaProps {
  conversationId: string | null;
}

const AuroraChatArea = ({ conversationId }: AuroraChatAreaProps) => {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { registerSendMessage, setIsStreaming, pendingProactiveMessage, setPendingProactiveMessage } = useAuroraChatContext();
  const proactiveHandled = useRef(false);

  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    regenerateLastResponse,
  } = useAuroraChat(conversationId);

  const { pendingCommands, confirmCommand, rejectCommand } = useCommandBus();

  // Register sendMessage with the global context
  useEffect(() => {
    registerSendMessage(sendMessage);
  }, [registerSendMessage, sendMessage]);

  // Auto-send pending proactive message when Aurora opens
  useEffect(() => {
    if (pendingProactiveMessage && !proactiveHandled.current && conversationId && !isStreaming) {
      proactiveHandled.current = true;
      const msg = pendingProactiveMessage;
      setPendingProactiveMessage(null);
      sendMessage(msg);
    }
  }, [pendingProactiveMessage, conversationId, isStreaming, sendMessage, setPendingProactiveMessage]);

  // Reset flag when proactive message changes
  useEffect(() => {
    if (!pendingProactiveMessage) {
      proactiveHandled.current = false;
    }
  }, [pendingProactiveMessage]);

  // Sync streaming state with context
  useEffect(() => {
    setIsStreaming(isStreaming);
  }, [isStreaming, setIsStreaming]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, pendingCommands]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area - centered like ChatGPT */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
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

              {/* Pending command confirmations */}
              <AnimatePresence>
                {pendingCommands.map((pending) => (
                  <AuroraActionConfirmation
                    key={pending.id}
                    actionType={pending.actionType}
                    actionDescription={pending.description}
                    onConfirm={() => confirmCommand(pending.id)}
                    onCancel={() => rejectCommand(pending.id)}
                    onAlwaysAllow={() => confirmCommand(pending.id, true)}
                    isRTL={isRTL}
                  />
                ))}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AuroraChatArea;
