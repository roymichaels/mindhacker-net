import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Loader2, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useAuroraChat } from '@/hooks/aurora/useAuroraChat';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

import { toast } from 'sonner';
import { useAION } from '@/identity';
import { TTSPlayer } from './TTSPlayer';
import { stripReasoning } from '@/lib/stripReasoning';
import { stripNiqqud } from '@/lib/hebrew';
import { AionOrb } from '@/components/aion/ui';

interface AuroraChatBubblesProps {
  showOrbAboveMessages?: boolean;
}

const AuroraChatBubbles = ({ showOrbAboveMessages = false }: AuroraChatBubblesProps) => {
  const { user } = useAuth();
  const { language, isRTL, t } = useTranslation();
  const { aion } = useAION();
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
  const bottomRef = useRef<HTMLDivElement>(null);
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

  // Resolve the nearest scrollable ancestor once.
  const getScrollParent = useCallback((): HTMLElement | null => {
    let el: HTMLElement | null = scrollRef.current;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      if (/(auto|scroll)/.test(style.overflowY)) return el;
      el = el.parentElement;
    }
    return null;
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    const parent = getScrollParent();
    if (parent) {
      parent.scrollTo({ top: parent.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
    bottomRef.current?.scrollIntoView({ block: 'end', behavior: smooth ? 'smooth' : 'auto' });
  }, [getScrollParent]);

  // Auto-scroll to bottom on every message / streaming chunk. Double rAF
  // ensures layout (including markdown reflow) has settled before we pin.
  useEffect(() => {
    if (scrollToMessageId) return;
    let raf1 = 0, raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => scrollToBottom(false));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [messages, streamingContent, isStreaming, scrollToMessageId, scrollToBottom]);

  // While streaming, content height grows between React renders (token
  // batching, image loads, markdown). Pin to the bottom on a tight interval
  // until the stream ends.
  useEffect(() => {
    if (!isStreaming || scrollToMessageId) return;
    const id = window.setInterval(() => scrollToBottom(false), 120);
    return () => window.clearInterval(id);
  }, [isStreaming, scrollToMessageId, scrollToBottom]);

  // Observe the messages container for any size mutation (images decoding,
  // late layout) and re-pin to bottom.
  useEffect(() => {
    const target = scrollRef.current;
    if (!target || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (scrollToMessageId) return;
      scrollToBottom(false);
    });
    ro.observe(target);
    return () => ro.disconnect();
  }, [scrollToBottom, scrollToMessageId]);

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
    <div className="w-full px-4 space-y-4 pb-4" ref={scrollRef}>
        {showOrbAboveMessages && (
          <div className="flex justify-center pt-6 pb-2">
            <AionOrb size="md" />
          </div>
        )}
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center gap-4 pt-16 pb-6 text-center">
            <AionOrb size="md" />
            <p className="aion-text-hero text-base font-medium tracking-wide max-w-[260px]" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'he'
                ? `אני ${aion.name}. הגרסה שלך — בלי הרעש.`
                : `I'm ${aion.name}. Your version — without the noise.`}
            </p>
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
                "group flex gap-3 transition-all duration-300",
                isAI ? "justify-start" : "justify-end"
              )}
            >
              {/* AION avatar */}
              {isAI && (
                <div className="flex-shrink-0 mt-1">
                  <AionOrb size="xs" breathing={false} glow={false} />
                </div>
              )}

              <div className="space-y-1 max-w-[82%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                    isAI
                      ? "atmo-surface-soft text-foreground rounded-ss-md"
                      : "aion-pill-surface text-foreground rounded-ee-md"
                  )}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {isAI ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0">
                      <ReactMarkdown>{stripNiqqud(stripReasoning(message.content))}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{stripNiqqud(message.content)}</p>
                  )}
                </div>
                
                {/* Action buttons for AI messages */}
                {isAI && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ps-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 aion-text-mute hover:text-foreground"
                      onClick={() => handleCopy(message.content)}
                      title={t('messages.copy')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <TTSPlayer messageId={message.id} content={message.content} compact className="h-6 w-6" />
                    <SaveToJournalButton excerpt={message.content} />
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
            <div className="flex-shrink-0 mt-1">
              <AionOrb size="xs" breathing glow={false} />
            </div>
            <div className="max-w-[82%]">
              <div className="rounded-2xl rounded-ss-md px-4 py-2.5 text-[15px] atmo-surface-soft text-foreground">
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0">
                  <ReactMarkdown>{stripNiqqud(stripReasoning(streamingContent))}</ReactMarkdown>
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
            className="flex gap-3 justify-start"
          >
            <div className="flex-shrink-0 mt-1">
              <AionOrb size="xs" breathing />
            </div>
            <div className="atmo-surface-soft rounded-ss-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full animate-aion-breath bg-foreground/55" />
                <span className="w-1.5 h-1.5 rounded-full animate-aion-breath bg-foreground/55" style={{ animationDelay: '300ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-aion-breath bg-foreground/55" style={{ animationDelay: '600ms' }} />
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
        {/* Bottom anchor — always pinned target for auto-scroll. */}
        <div ref={bottomRef} aria-hidden className="h-px w-full" />
    </div>
  );
};

export default AuroraChatBubbles;

function SaveToJournalButton({ excerpt }: { excerpt: string }) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      title={isHe ? 'שמור ביומן' : 'Save to Journal'}
      onClick={async () => {
        try {
          const { data, error } = await supabase.functions.invoke('aurora-capture-journal', {
            body: { excerpt },
          });
          if (error) throw error;
          if (data?.saved) {
            toast.success(isHe ? 'נשמר ביומן' : 'Saved to Journal');
            // Surface as floating artifact inside Interactive AION mode.
            try {
              const { emitArtifact } = await import('@/components/aion/artifacts/artifactBus');
              emitArtifact({
                kind: 'journal_capture',
                title: isHe ? 'נשמר ביומן' : 'Saved to Journal',
                body: excerpt.slice(0, 140),
                cta: { label: isHe ? 'פתח יומן' : 'Open Journal', href: '/journal' },
              });
            } catch {}
          } else {
            toast.message(isHe ? 'אין מספיק חומר רפלקטיבי לשמירה' : 'Not enough reflective content to save');
          }
        } catch (e) {
          console.error('save-to-journal failed', e);
          toast.error(isHe ? 'שמירה ליומן נכשלה' : 'Failed to save to Journal');
        }
      }}
    >
      <BookOpen className="h-3 w-3 text-muted-foreground" />
    </Button>
  );
}
