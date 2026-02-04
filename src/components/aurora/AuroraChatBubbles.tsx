import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useAuroraChat } from '@/hooks/aurora/useAuroraChat';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';

const AuroraChatBubbles = () => {
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const { 
    activeConversationId, 
    isChatExpanded, 
    setIsChatExpanded,
    registerSendMessage,
    isStreaming,
    setIsStreaming 
  } = useAuroraChatContext();
  
  const { 
    messages, 
    streamingContent, 
    sendMessage 
  } = useAuroraChat(activeConversationId);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Register send message function for global access
  useEffect(() => {
    registerSendMessage(async (message: string) => {
      setIsStreaming(true);
      try {
        await sendMessage(message);
      } finally {
        setIsStreaming(false);
      }
    });
  }, [registerSendMessage, sendMessage, setIsStreaming]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Handle click outside to close
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      // Check if clicking on the input area
      const inputArea = document.querySelector('[data-global-chat-input]');
      if (inputArea && inputArea.contains(e.target as Node)) {
        return; // Don't close if clicking on input
      }
      setIsChatExpanded(false);
    }
  }, [setIsChatExpanded]);

  // Handle ESC key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsChatExpanded(false);
    }
  }, [setIsChatExpanded]);

  useEffect(() => {
    if (isChatExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatExpanded, handleClickOutside, handleKeyDown]);

  if (!user) return null;

  return (
    <AnimatePresence>
      {isChatExpanded && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: 20, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-3xl mx-auto mb-2"
        >
          <div className="relative bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <AuroraOrbIcon className="w-5 h-5 text-primary" size={20} />
                <span className="text-sm font-medium text-foreground">
                  {language === 'he' ? 'אורורה' : 'Aurora'}
                </span>
              </div>
              <button
                onClick={() => setIsChatExpanded(false)}
                className="p-1 rounded-md hover:bg-muted/50 transition-colors"
                aria-label={language === 'he' ? 'סגור' : 'Close'}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages area */}
            <ScrollArea 
              ref={scrollRef as any}
              className="max-h-[400px] overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                {messages.length === 0 && !streamingContent && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    {language === 'he' 
                      ? 'שלום! אני אורורה, המלווה שלך. איך אוכל לעזור?' 
                      : 'Hello! I\'m Aurora, your companion. How can I help?'}
                  </div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      message.is_ai_message ? "justify-start" : "justify-end"
                    )}
                  >
                    {message.is_ai_message && (
                      <div className="shrink-0">
                        <AuroraOrbIcon className="w-6 h-6 text-primary" size={24} />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-4 py-2 text-sm",
                        message.is_ai_message
                          ? "bg-muted/50 text-foreground"
                          : "bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/40 text-foreground"
                      )}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      {message.is_ai_message ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Streaming content */}
                {streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="shrink-0">
                      <AuroraOrbIcon className="w-6 h-6 text-primary animate-pulse" size={24} />
                    </div>
                    <div className="max-w-[80%] rounded-xl px-4 py-2 text-sm bg-muted/50 text-foreground">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Loading indicator */}
                {isStreaming && !streamingContent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="shrink-0">
                      <AuroraOrbIcon className="w-6 h-6 text-primary animate-pulse" size={24} />
                    </div>
                    <div className="bg-muted/50 rounded-xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuroraChatBubbles;
