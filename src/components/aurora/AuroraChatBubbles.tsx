import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Volume2, Square, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useAuroraChat } from '@/hooks/aurora/useAuroraChat';
import { supabase } from '@/integrations/supabase/client';
import { useAuroraVoice } from '@/hooks/aurora/useAuroraVoice';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const AuroraChatBubbles = () => {
  const { user } = useAuth();
  const { language, isRTL, t } = useTranslation();
  const { isPlaying, activeMessageId, playMessage, stopPlayback } = useAuroraVoice();
  const { 
    activeConversationId, 
    isChatExpanded, 
    setIsChatExpanded,
    registerSendMessage,
    isStreaming,
    setIsStreaming,
    scrollToMessageId,
    setScrollToMessageId,
    pendingProactiveMessage,
    setPendingProactiveMessage,
    pendingAssistantGreeting,
    setPendingAssistantGreeting,
    activePillar,
    pillarActionCallback,
    pillarActionLabel,
    pillarActionLoading,
  } = useAuroraChatContext();
  
  const { 
    messages, 
    streamingContent, 
    sendMessage 
  } = useAuroraChat(activeConversationId);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const proactiveHandled = useRef(false);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t('messages.copied'));
  };

  const handleVoice = (messageId: string, content: string) => {
    if (isPlaying && activeMessageId === messageId) {
      stopPlayback();
    } else {
      playMessage(messageId, content);
    }
  };

  // Register send message function for global access
  useEffect(() => {
    registerSendMessage(async (message: string, imageBase64?: string) => {
      setIsStreaming(true);
      try {
        await sendMessage(message, imageBase64);
      } finally {
        setIsStreaming(false);
      }
    });
  }, [registerSendMessage, sendMessage, setIsStreaming]);

  // Auto-send pending proactive message in chat bubbles
  useEffect(() => {
    if (pendingProactiveMessage && !proactiveHandled.current && activeConversationId && isChatExpanded && !isStreaming) {
      proactiveHandled.current = true;
      const msg = pendingProactiveMessage;
      setPendingProactiveMessage(null);
      setIsStreaming(true);
      sendMessage(msg).finally(() => setIsStreaming(false));
    }
  }, [pendingProactiveMessage, activeConversationId, isChatExpanded, isStreaming, sendMessage, setPendingProactiveMessage, setIsStreaming]);

  useEffect(() => {
    if (!pendingProactiveMessage) proactiveHandled.current = false;
  }, [pendingProactiveMessage]);

  // Inject assistant greeting as a DB message (not sent as user prompt)
  const greetingHandled = useRef(false);
  useEffect(() => {
    if (pendingAssistantGreeting && !greetingHandled.current && activeConversationId && isChatExpanded) {
      greetingHandled.current = true;
      const greeting = pendingAssistantGreeting;
      setPendingAssistantGreeting(null);
      // Only inject if conversation is empty (no existing messages)
      if (messages.length === 0) {
        supabase.from('messages').insert({
          conversation_id: activeConversationId,
          sender_id: null,
          content: greeting,
          is_ai_message: true,
          is_read: true,
        }).then(({ error }) => {
          if (error) console.error('Failed to inject assistant greeting:', error);
        });
      }
    }
  }, [pendingAssistantGreeting, activeConversationId, isChatExpanded, setPendingAssistantGreeting, messages.length]);

  useEffect(() => {
    if (!pendingAssistantGreeting) greetingHandled.current = false;
  }, [pendingAssistantGreeting]);

  // Auto-scroll to bottom when new messages arrive (only if not searching)
  useEffect(() => {
    if (scrollRef.current && !scrollToMessageId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, scrollToMessageId]);

  // Scroll to specific message when searching
  useEffect(() => {
    if (scrollToMessageId && isChatExpanded && messages.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const messageEl = messageRefs.current.get(scrollToMessageId);
        if (messageEl) {
          messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the message briefly
          messageEl.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
          setTimeout(() => {
            messageEl.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
            setScrollToMessageId(null);
          }, 2000);
        } else {
          setScrollToMessageId(null);
        }
      }, 300);
    }
  }, [scrollToMessageId, isChatExpanded, messages, setScrollToMessageId]);

  // Handle click outside to close
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      // Check if clicking on the input area
      const inputArea = document.querySelector('[data-global-chat-input]');
      if (inputArea && inputArea.contains(e.target as Node)) {
        return; // Don't close if clicking on input
      }
      // Check if clicking on the dock drag handle or dock controls
      const dockContainer = document.querySelector('[data-aurora-dock]');
      if (dockContainer && dockContainer.contains(e.target as Node)) {
        return; // Don't close if clicking on dock controls (drag handle, bug report, etc.)
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
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-2 min-w-0">
                <AuroraHoloOrb size={24} glow="none" />
                <span className="text-sm font-bold text-foreground truncate">
                  {language === 'he' ? 'אורורה' : 'Aurora'}
                </span>
              </div>
              <button
                onClick={() => setIsChatExpanded(false)}
                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
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

                {messages.map((message) => {
                  const isPlayingThis = isPlaying && activeMessageId === message.id;
                  
                  return (
                    <motion.div
                      key={message.id}
                      ref={(el) => {
                        if (el) messageRefs.current.set(message.id, el);
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "group flex gap-3 transition-all duration-300 rounded-lg",
                        message.is_ai_message ? "justify-start" : "justify-end"
                      )}
                    >
                      {message.is_ai_message && (
                        <AuroraHoloOrb size={24} glow="none" />
                      )}
                      <div className="space-y-1.5 max-w-[80%]">
                        <div
                          className={cn(
                            "rounded-xl px-4 py-2 text-sm",
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
                        
                        {/* Action buttons for AI messages */}
                        {message.is_ai_message && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopy(message.content)}
                              title={t('messages.copy')}
                            >
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleVoice(message.id, message.content)}
                              title={isPlayingThis ? t('messages.stopReading') : t('messages.readAloud')}
                            >
                              {isPlayingThis ? (
                                <Square className="h-3 w-3 text-muted-foreground fill-current" />
                              ) : (
                                <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Streaming content */}
                {streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <AuroraHoloOrb size={24} glow="subtle" />
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
                    <AuroraHoloOrb size={24} glow="subtle" />
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
