/**
 * PlanChatWizard — "Talk to your plan" free-form chat for surgical plan edits.
 * Uses Aurora + command bus to make targeted changes without regenerating.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { MessageSquare, Send, Loader2, Sparkles, Wrench, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseAllTags, stripAllTags } from '@/lib/commandBus';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface PlanChatWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_ACTIONS_HE = [
  'הוסף תרגול חדש לתוכנית',
  'הסר משימה מהשבוע הנוכחי',
  'שנה את הפוקוס של אבן דרך',
  'החלף פעילות בתוכנית',
];
const QUICK_ACTIONS_EN = [
  'Add a new practice to my plan',
  'Remove a task from this week',
  'Change a milestone focus area',
  'Swap an activity in my plan',
];

export function PlanChatWizard({ open, onOpenChange }: PlanChatWizardProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const handleClose = (val: boolean) => {
    if (!val) {
      setMessages([]);
      setInput('');
    }
    onOpenChange(val);
  };

  const processCommands = useCallback(async (fullText: string) => {
    // Parse commands from Aurora's response
    const commands = parseAllTags(fullText);
    if (commands.length === 0) return;

    // Process practice commands specifically
    const practiceAddRegex = /\[practice:add:([a-f0-9-]+):(\d+):(\w+):(true|false)\]/g;
    const practiceRemoveRegex = /\[practice:remove:([a-f0-9-]+)\]/g;

    let match;
    let changesMade = false;

    // Practice additions
    while ((match = practiceAddRegex.exec(fullText)) !== null) {
      const [, practiceId, duration, frequency, isCore] = match;
      if (user?.id) {
        const { error } = await supabase.from('user_practices').insert({
          user_id: user.id,
          practice_id: practiceId,
          duration_minutes: parseInt(duration),
          frequency,
          is_core: isCore === 'true',
        });
        if (!error) changesMade = true;
      }
    }

    // Practice removals
    while ((match = practiceRemoveRegex.exec(fullText)) !== null) {
      const [, userPracticeId] = match;
      const { error } = await supabase
        .from('user_practices')
        .delete()
        .eq('id', userPracticeId);
      if (!error) changesMade = true;
    }

    if (changesMade || commands.length > 0) {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-practices'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-missions'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-milestones'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-traits'] });
      queryClient.invalidateQueries({ queryKey: ['life-plan'] });
      queryClient.invalidateQueries({ queryKey: ['daily-queue'] });
      queryClient.invalidateQueries({ queryKey: ['trait-gallery'] });
    }
  }, [user?.id, queryClient]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user?.id || isStreaming) return;

    const userMsg: ChatMsg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    let assistantText = '';

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/plan-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            language,
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error(isHe ? 'יותר מדי בקשות, נסה שוב בעוד רגע' : 'Too many requests, try again shortly');
        } else if (resp.status === 402) {
          toast.error(isHe ? 'נדרש תשלום' : 'Payment required');
        }
        throw new Error('Stream failed');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantText += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m);
                }
                return [...prev, { role: 'assistant', content: assistantText }];
              });
            }
          } catch {
            // partial JSON, wait for more
          }
        }
      }

      // Process any commands in the final response
      if (assistantText) {
        await processCommands(assistantText);
      }
    } catch (err) {
      console.error('Plan chat error:', err);
      if (!assistantText) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: isHe ? 'שגיאה בתקשורת. נסה שוב.' : 'Communication error. Please try again.' },
        ]);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const quickActions = isHe ? QUICK_ACTIONS_HE : QUICK_ACTIONS_EN;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="block">{isHe ? 'דבר עם התוכנית' : 'Talk to Your Plan'}</span>
              <span className="block text-[10px] font-normal text-muted-foreground">
                {isHe ? 'שינויים כירורגיים בלבד — בלי ליצור מחדש' : 'Surgical changes only — no regeneration'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0 px-4 py-3" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  {isHe ? 'מה תרצה לשנות בתוכנית?' : 'What would you like to change?'}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {isHe
                    ? 'אני יכולה להוסיף ולהסיר תרגולים, לשנות אבני דרך, להחליף משימות ועוד — בלי ליצור תוכנית חדשה'
                    : 'I can add/remove practices, modify milestones, swap tasks and more — without creating a new plan'}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center max-w-sm">
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qa)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {qa}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex",
                      msg.role === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/70 border border-border/50 text-foreground"
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                          <ReactMarkdown>{stripAllTags(msg.content)}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className={cn("flex", isRTL ? 'justify-end' : 'justify-start')}>
                  <div className="bg-muted/70 border border-border/50 rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-border/50 shrink-0">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isHe ? 'ספר לי מה לשנות...' : 'Tell me what to change...'}
              className="min-h-[44px] max-h-[100px] text-sm resize-none rounded-xl"
              dir={isRTL ? 'rtl' : 'ltr'}
              disabled={isStreaming}
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="shrink-0 h-11 w-11 rounded-xl"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className={cn("h-4 w-4", isRTL && "rotate-180")} />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
