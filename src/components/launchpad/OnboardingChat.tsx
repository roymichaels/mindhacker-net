/**
 * OnboardingChat — Aurora-powered conversational onboarding.
 * Replaces the old multi-step LaunchpadFlow with a single AI chat.
 * Extracts structured data via tool calling and saves to launchpad_progress.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { cn } from '@/lib/utils';
import { Send, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-chat`;

interface Props {
  onComplete?: () => void;
  onClose?: () => void;
}

export default function OnboardingChat({ onComplete, onClose }: Props) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { completeStep } = useLaunchpadProgress();
  const isHe = language === 'he';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleToolCall = useCallback(async (toolArgs: any) => {
    setSaving(true);
    try {
      // Complete all steps rapidly with extracted data
      // The DB function complete_launchpad_step accepts arbitrary jsonb

      // Step 1: Welcome/Intent  
      await completeStep({
        step: 1,
        data: {
          intention: JSON.stringify({
            main_area: toolArgs.main_life_areas ?? [],
            selected_pillar: toolArgs.selected_pillar ?? 'mind',
            diagnostic_scores: toolArgs.diagnostic_scores ?? {},
          }),
        } as any,
      });

      // Step 2: Profile
      await completeStep({
        step: 2,
        data: {
          profile_data: {
            age_bracket: toolArgs.age_bracket ?? '',
            gender: toolArgs.gender ?? '',
            occupation: toolArgs.occupation ?? '',
            relationship_status: toolArgs.relationship_status ?? '',
            activity_level: toolArgs.activity_level ?? '',
            wake_time: toolArgs.wake_time ?? '',
            sleep_time: toolArgs.sleep_time ?? '',
            energy_level: toolArgs.energy_level ?? 5,
            diet_quality: toolArgs.diet_quality ?? '',
            substances: toolArgs.substances ?? {},
            stress_level: toolArgs.stress_level ?? '',
            exercise_types: toolArgs.exercise_types ?? [],
            deep_dive: {
              proudest_achievement: toolArgs.proudest_achievement ?? '',
              biggest_struggle: toolArgs.biggest_struggle ?? '',
              previous_attempts: toolArgs.previous_attempts ?? '',
            },
          },
        } as any,
      });

      // Steps 3-7: Intermediate steps (auto-complete)
      for (const step of [3, 4, 5, 6, 7]) {
        const stepData: Record<string, any> = {};
        if (step === 5) stepData.summary = toolArgs.aurora_summary ?? '';
        await completeStep({ step, data: stepData as any });
      }

      // Step 8: Focus areas
      await completeStep({
        step: 8,
        data: {
          focus_areas: [toolArgs.primary_focus, ...(toolArgs.main_life_areas?.slice(0, 2) ?? [])].filter(Boolean),
        } as any,
      });

      // Step 9: First week
      await completeStep({
        step: 9,
        data: {
          actions: [...(toolArgs.habits_to_build ?? []), ...(toolArgs.habits_to_break ?? [])],
          anchor_habit: toolArgs.habits_to_build?.[0] ?? '',
        } as any,
      });

      // Step 10: Final notes
      await completeStep({
        step: 10,
        data: {
          intention: JSON.stringify({
            notes: toolArgs.aurora_summary ?? '',
            coaching_style: toolArgs.coaching_style ?? 'balanced',
            commitment_level: toolArgs.commitment_level ?? 'ready',
            ninety_day_vision: toolArgs.ninety_day_vision ?? '',
          }),
        } as any,
      });

      // Step 11: Activate dashboard
      await completeStep({ step: 11, data: {} as any });

      toast.success(isHe ? 'הכיול הושלם! 🎉' : 'Calibration complete! 🎉');

      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      toast.error(isHe ? 'שגיאה בשמירת הנתונים' : 'Error saving data');
      setSaving(false);
    }
  }, [completeStep, navigate, onComplete, isHe]);

  async function streamChat(
    msgs: ChatMessage[],
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
      body: JSON.stringify({ messages: msgs, language }),
    });

    if (!resp.ok || !resp.body) {
      if (resp.status === 429) {
        toast.error(isHe ? 'יותר מדי בקשות, נסה שוב בעוד רגע' : 'Too many requests, try again shortly');
        throw new Error('Rate limited');
      }
      if (resp.status === 402) {
        toast.error(isHe ? 'נגמרו הקרדיטים' : 'Credits exhausted');
        throw new Error('Credits exhausted');
      }
      throw new Error(`Stream failed: ${resp.status}`);
    }

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

          if (choice?.delta?.tool_calls) {
            isToolCallFlag = true;
            for (const tc of choice.delta.tool_calls) {
              if (tc.function?.arguments) toolCallArgs += tc.function.arguments;
            }
          }

          const content = choice?.delta?.content as string | undefined;
          if (content) onDelta(content);

          if (choice?.finish_reason === 'tool_calls' && toolCallArgs) {
            try { onToolCall(JSON.parse(toolCallArgs)); } catch {}
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    if (toolCallArgs && isToolCallFlag) {
      try { onToolCall(JSON.parse(toolCallArgs)); } catch {}
    }
    onDone();
  }

  const startConversation = useCallback(async () => {
    if (started) return;
    setStarted(true);
    setIsStreaming(true);
    let assistantSoFar = '';
    const updateAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };
    try { await streamChat([], updateAssistant, () => setIsStreaming(false), handleToolCall); }
    catch (e) { console.error(e); setIsStreaming(false); }
  }, [language, handleToolCall, started]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsStreaming(true);

    let assistantSoFar = '';
    const updateAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };
    try {
      await streamChat(updated, updateAssistant, () => { setIsStreaming(false); inputRef.current?.focus(); }, handleToolCall);
    } catch (e) { console.error(e); setIsStreaming(false); }
  }, [input, messages, isStreaming, handleToolCall]);

  // Auto-start
  useEffect(() => { startConversation(); }, []);

  const messageCount = messages.filter(m => m.role === 'user').length;

  if (saving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold text-foreground">
          {isHe ? 'בונה את התוכנית שלך...' : 'Building your plan...'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isHe ? 'מעבד את כל מה שסיפרת לי' : 'Processing everything you shared'}
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-primary mt-2" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-80px)]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 shrink-0 border-b border-border/30">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">
            {isHe ? 'כיול מערכת — אורורה' : 'System Calibration — Aurora'}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {isHe ? `${messageCount} הודעות` : `${messageCount} messages`}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 py-4 px-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-ee-sm'
                  : 'bg-muted/70 text-foreground rounded-es-sm'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-muted/70 rounded-2xl rounded-es-sm px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 py-3 px-4 border-t border-border/30">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isHe ? 'הקלד תשובה...' : 'Type your answer...'}
            disabled={isStreaming}
            className="flex-1 bg-muted/50 border-border/50"
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isStreaming || !input.trim()}
            className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
