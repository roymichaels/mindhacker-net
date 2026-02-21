import { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraChat } from '@/hooks/aurora/useAuroraChat';
import { usePillarConversation } from '@/hooks/usePillarConversation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import VoiceRecordingButton from '@/components/aurora/VoiceRecordingButton';
import { useAuroraVoice } from '@/hooks/aurora/useAuroraVoice';
import { Skeleton } from '@/components/ui/skeleton';

interface PillarChatProps {
  pillar: string;
}

export default function PillarChat({ pillar }: PillarChatProps) {
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { conversationId, isLoading: convLoading } = usePillarConversation(pillar);
  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
  } = useAuroraChat(conversationId);

  const [input, setInput] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const domain = LIFE_DOMAINS.find(d => d.id === pillar);
  const pillarLabel = domain ? (isHe ? domain.labelHe : domain.labelEn) : pillar;

  const handleTranscription = useCallback((text: string) => {
    setIsTranscribing(false);
    setInput(prev => prev + (prev ? ' ' : '') + text);
  }, []);

  const {
    isRecording,
    recordingError,
    startRecording,
    stopRecording,
  } = useAuroraVoice({ onTranscription: handleTranscription });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (convLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollRef as any}>
        <div className="px-4 py-4 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="text-center py-12 space-y-3">
              <AuroraHoloOrb size={48} glow="subtle" />
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {isHe
                  ? `שלום! אני אורורה. בוא נדבר על ${pillarLabel} – שאל אותי כל דבר.`
                  : `Hey! I'm Aurora. Let's talk about ${pillarLabel} – ask me anything.`}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2.5",
                message.is_ai_message ? "justify-start" : "justify-end"
              )}
            >
              {message.is_ai_message && (
                <AuroraHoloOrb size={24} glow="none" />
              )}
              <div
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm max-w-[80%]",
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
            </div>
          ))}

          {/* Streaming */}
          {streamingContent && (
            <div className="flex gap-2.5 justify-start">
              <AuroraHoloOrb size={24} glow="subtle" />
              <div className="max-w-[80%] rounded-xl px-3.5 py-2 text-sm bg-muted/50 text-foreground">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isStreaming && !streamingContent && (
            <div className="flex gap-2.5 justify-start">
              <AuroraHoloOrb size={24} glow="subtle" />
              <div className="bg-muted/50 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input bar - docked to bottom */}
      <div className="shrink-0 border-t border-border/50 bg-background px-4 py-2">
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative bg-muted/30 rounded-lg border border-border/50 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isHe ? `שאל על ${pillarLabel}...` : `Ask about ${pillarLabel}...`}
                disabled={isStreaming || isRecording}
                rows={1}
                className={cn(
                  "w-full h-9 bg-transparent px-3 py-2 pe-10 text-sm leading-tight",
                  "resize-none overflow-hidden",
                  "focus:outline-none",
                  "disabled:opacity-50",
                  "placeholder:text-muted-foreground"
                )}
                dir={isRTL ? 'rtl' : 'ltr'}
                style={{ maxHeight: '120px' }}
              />
              <div className="absolute end-1">
                <VoiceRecordingButton
                  isRecording={isRecording}
                  isTranscribing={isTranscribing}
                  onStartRecording={startRecording}
                  onStopRecording={() => { setIsTranscribing(true); stopRecording(); }}
                  disabled={isStreaming}
                  compact
                  className="h-7 w-7"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isStreaming || !input.trim() || isRecording}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors shrink-0",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <Send className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {recordingError && (
            <p className="text-xs text-destructive mt-1 text-center">{recordingError}</p>
          )}
        </form>
      </div>
    </div>
  );
}
