/**
 * AddItemWizard — Aurora-powered conversational wizard for adding items to the user's plate.
 * Uses the same chat UI as DomainAssessChat but with a custom edge function for item creation.
 * When Aurora extracts enough info, she creates the item via tool call and optionally triggers plan recalc.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import AuroraChatMessage from '@/components/aurora/AuroraChatMessage';
import AuroraTypingIndicator from '@/components/aurora/AuroraTypingIndicator';
import AuroraChatInput from '@/components/aurora/AuroraChatInput';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-plate-item`;

interface AddItemWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hub: 'core' | 'arena';
}

export function AddItemWizard({ open, onOpenChange, hub }: AddItemWizardProps) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isHe = language === 'he';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [started, setStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCounter = useRef(0);
  const startedRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setMessages([]);
      setStarted(false);
      startedRef.current = false;
      setStreamingContent('');
      setSaving(false);
      msgCounter.current = 0;
    }
  }, [open]);

  const handleToolCall = useCallback(async (toolArgs: any) => {
    setSaving(true);
    try {
      // The edge function creates the item and returns confirmation
      // Tool call has: title, description, type, pillar, priority
      const itemType = toolArgs.type || 'goal';
      const pillar = toolArgs.pillar || null;

      if (itemType === 'project') {
        await supabase.from('user_projects').insert({
          user_id: user!.id,
          title: toolArgs.title,
          description: toolArgs.description || null,
          category: toolArgs.category || 'general',
          status: 'active',
          priority: toolArgs.priority || 'medium',
          vision: toolArgs.vision || null,
          why_it_matters: toolArgs.why_it_matters || null,
          desired_outcome: toolArgs.desired_outcome || null,
          linked_life_areas: toolArgs.pillars || (pillar ? [pillar] : []),
          project_type: 'standard',
        } as any);
      } else if (itemType === 'business') {
        await supabase.from('business_journeys').insert({
          user_id: user!.id,
          business_name: toolArgs.title,
          step_1_vision: { description: toolArgs.description, vision: toolArgs.vision },
          current_step: 1,
        });
      } else {
        // goal, habit, task → action_items
        await supabase.from('action_items').insert({
          user_id: user!.id,
          title: toolArgs.title,
          description: toolArgs.description || null,
          type: itemType,
          source: 'user',
          status: 'todo',
          pillar,
          tags: toolArgs.tags || [],
        });
      }

      // Invalidate plate query
      queryClient.invalidateQueries({ queryKey: ['user-plate'] });
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });

      toast.success(isHe ? 'נוסף בהצלחה! התוכנית תעודכן.' : 'Added successfully! Plan will update.');

      // Trigger plan recalculation in background
      supabase.functions.invoke('generate-90day-strategy', {
        body: { userId: user!.id, recalculate: true },
      }).catch(err => console.warn('Plan recalc triggered:', err));

      setTimeout(() => {
        onOpenChange(false);
        setSaving(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to save item:', err);
      toast.error(isHe ? 'שגיאה בשמירה' : 'Error saving item');
      setSaving(false);
    }
  }, [user, queryClient, isHe, onOpenChange]);

  async function streamChat(
    msgs: { role: string; content: string }[],
    onDelta: (t: string) => void,
    onDone: () => void,
    onToolCall: (args: any) => void,
  ) {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: msgs, language, hub }),
    });

    if (!resp.ok || !resp.body) throw new Error(`Stream failed: ${resp.status}`);

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let toolCallArgs = '';
    let isToolCallFlag = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const choice = parsed.choices?.[0];
          if (!choice) continue;

          const toolCall = choice.delta?.tool_calls?.[0];
          if (toolCall) {
            isToolCallFlag = true;
            if (toolCall.function?.arguments) {
              toolCallArgs += toolCall.function.arguments;
            }
            continue;
          }

          const content = choice.delta?.content as string | undefined;
          if (content) onDelta(content);

          if (choice.finish_reason === 'tool_calls' && toolCallArgs) {
            try {
              const args = JSON.parse(toolCallArgs);
              onToolCall(args);
            } catch (pe) {
              console.error('Failed to parse tool args:', pe);
            }
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    if (isToolCallFlag && toolCallArgs) {
      try {
        const args = JSON.parse(toolCallArgs);
        onToolCall(args);
      } catch { /* already tried */ }
    }

    onDone();
  }

  const addAssistantMessage = useCallback((content: string) => {
    msgCounter.current += 1;
    const msg: ChatMessage = {
      id: `wizard-ai-${msgCounter.current}`,
      role: 'assistant',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  const startConversation = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
    setIsStreaming(true);
    setStreamingContent('');
    let assistantSoFar = '';
    const updateAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setStreamingContent(assistantSoFar);
    };
    try {
      await streamChat([], updateAssistant, () => {
        setIsStreaming(false);
        if (assistantSoFar) addAssistantMessage(assistantSoFar);
        setStreamingContent('');
      }, handleToolCall);
    } catch (e) {
      console.error(e);
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [language, handleToolCall, addAssistantMessage, hub]);

  // Auto-start when opened
  useEffect(() => {
    if (open && !startedRef.current) {
      const timer = setTimeout(startConversation, 300);
      return () => clearTimeout(timer);
    }
  }, [open, startConversation]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    msgCounter.current += 1;
    const userMsg: ChatMessage = {
      id: `wizard-user-${msgCounter.current}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    const updated = [...messagesRef.current, userMsg];
    setMessages(updated);

    setIsStreaming(true);
    setStreamingContent('');

    let assistantSoFar = '';
    const updateAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setStreamingContent(assistantSoFar);
    };
    try {
      await streamChat(
        updated.map(m => ({ role: m.role, content: m.content })),
        updateAssistant,
        () => {
          setIsStreaming(false);
          if (assistantSoFar) addAssistantMessage(assistantSoFar);
          setStreamingContent('');
        },
        handleToolCall
      );
    } catch (e) {
      console.error(e);
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [isStreaming, handleToolCall, addAssistantMessage]);

  if (saving) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl w-[95vw] h-[80vh] p-0 gap-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-xl flex flex-col">
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{isHe ? 'מוסיף לתוכנית שלך...' : 'Adding to your plan...'}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] h-[80vh] p-0 gap-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-xl flex flex-col">
        <div className={cn("flex flex-col h-full")} dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="flex items-center gap-3 py-3 px-4 shrink-0 border-b border-border/30">
            <AuroraHoloOrb size={32} glow="subtle" />
            <div className="flex-1">
              <h1 className="text-sm font-bold text-foreground">
                {isHe ? 'אורורה' : 'Aurora'}
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {isHe
                  ? (hub === 'core' ? 'הוספת יעד אישי' : 'הוספת פרויקט / עסק / יעד')
                  : (hub === 'core' ? 'Add Personal Goal' : 'Add Project / Business / Goal')}
              </p>
            </div>
          </div>

          {/* Chat messages */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <AuroraChatMessage
                      key={message.id}
                      id={message.id}
                      content={message.content}
                      isOwn={message.role === 'user'}
                      isAI={message.role === 'assistant'}
                      timestamp={message.created_at}
                    />
                  ))}
                </AnimatePresence>

                {isStreaming && streamingContent && (
                  <AuroraChatMessage
                    id="streaming"
                    content={streamingContent}
                    isOwn={false}
                    isAI
                    isStreaming
                  />
                )}

                {isStreaming && !streamingContent && (
                  <AuroraTypingIndicator />
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>

          {/* Input */}
          <AuroraChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
