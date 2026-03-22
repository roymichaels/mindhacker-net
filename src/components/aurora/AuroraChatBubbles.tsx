import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useAuroraChat } from '@/hooks/aurora/useAuroraChat';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

import { toast } from 'sonner';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { useAION } from '@/identity';
import { TTSPlayer } from './TTSPlayer';

interface AuroraChatBubblesProps {
  showOrbAboveMessages?: boolean;
}

const AuroraChatBubbles = ({ showOrbAboveMessages = false }: AuroraChatBubblesProps) => {
  const { user } = useAuth();
  const { language, isRTL, t } = useTranslation();
  const { aion } = useAION();
  const { profile: orbProfile } = useOrbProfile();
  const aiDisplayName = aion.name;
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && !scrollToMessageId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, scrollToMessageId]);

  // Scroll to specific message when searching
  useEffect(() => {
    if (scrollToMessageId && isChatExpanded && messages.length > 0) {
      setTimeout(() => {
        const messageEl = messageRefs.current.get(scrollToMessageId);
        if (messageEl) {
          messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      const inputArea = document.querySelector('[data-global-chat-input]');
      if (inputArea && inputArea.contains(e.target as Node)) return;
      const dockContainer = document.querySelector('[data-aurora-dock]');
      if (dockContainer && dockContainer.contains(e.target as Node)) return;
      setIsChatExpanded(false);
    }
  }, [setIsChatExpanded]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsChatExpanded(false);
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
    <div className="w-full px-4 space-y-3 pb-4" ref={scrollRef}>
        {/* Persistent orb */}
        {showOrbAboveMessages && (
          <div className="flex justify-center pt-6 pb-2">
            <StandaloneMorphOrb size={56} profile={AURORA_ORB_PROFILE} geometryFamily="octa" level={100} />
          </div>
        )}
        {messages.length === 0 && !streamingContent && (
          <div className="text-center text-muted-foreground text-sm pb-4">
            {language === 'he'
              ? `אני ${aion.name}. הגרסה שלך — בלי הרעש.`
              : `I'm ${aion.name}. Your version — without the noise.`}
          </div>
        )}

        {messages.map((message) => {
          const isAI = message.is_ai_message;
          
          return (
            <motion.div
              key={message.id}
              ref={(el) => {
                if (el) messageRefs.current.set(message.id, el);
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "group flex gap-2.5 transition-all duration-300",
                isAI ? "justify-start" : "justify-end"
              )}
            >
              {/* AION avatar */}
              {isAI && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500/15 via-cyan-400/15 to-amber-400/15 border border-fuchsia-400/30 flex items-center justify-center">
                    <AuroraOrbIcon className="w-4 h-4" size={16} gradient />
                  </div>
                </div>
              )}

              <div className="space-y-1 max-w-[80%]">
                {/* Name label */}
                <span className={cn(
                  "text-[10px] font-semibold block px-1",
                  isAI ? "text-fuchsia-400/70" : "text-primary/50 text-end"
                )}>
                  {isAI ? aiDisplayName : (language === 'he' ? 'את/ה' : 'You')}
                </span>

                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    isAI
                      ? "bg-muted/30 text-foreground border border-border/30 rounded-ss-md"
                      : "bg-primary text-primary-foreground rounded-ee-md"
                  )}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {isAI ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                
                {/* Action buttons for AI messages */}
                {isAI && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ps-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(message.content)}
                      title={t('messages.copy')}
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <TTSPlayer messageId={message.id} content={message.content} compact className="h-6 w-6" />
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
            className="flex gap-2.5 justify-start"
          >
            <div className="flex-shrink-0 mt-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500/15 via-cyan-400/15 to-amber-400/15 border border-fuchsia-400/30 flex items-center justify-center">
                <AuroraOrbIcon className="w-4 h-4" size={16} gradient />
              </div>
            </div>
            <div className="max-w-[80%] space-y-1">
              <span className="text-[10px] font-semibold text-fuchsia-400/70 block px-1">{aiDisplayName}</span>
              <div className="rounded-2xl rounded-ss-md px-3.5 py-2.5 text-sm bg-muted/30 text-foreground border border-border/30">
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0">
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isStreaming && !streamingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5 justify-start"
          >
            <div className="flex-shrink-0 mt-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500/15 via-cyan-400/15 to-amber-400/15 border border-fuchsia-400/30 flex items-center justify-center">
                <AuroraOrbIcon className="w-4 h-4 animate-pulse" size={16} gradient />
              </div>
            </div>
            <div className="bg-muted/30 border border-border/30 rounded-2xl rounded-ss-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-fuchsia-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Pillar action button */}
        {activePillar && pillarActionCallback && pillarActionLabel && messages.length >= 2 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center pt-2 pb-1"
          >
            <Button
              onClick={pillarActionCallback}
              disabled={pillarActionLoading}
              size="lg"
              className="gap-2 rounded-full shadow-lg shadow-primary/20 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8"
            >
              {pillarActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
              {pillarActionLabel}
            </Button>
          </motion.div>
        )}
    </div>
  );
};

export default AuroraChatBubbles;
