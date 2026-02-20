/**
 * @page ConsciousnessAssess (/life/consciousness/assess)
 * @tab Life
 * @purpose AI-driven conversational consciousness assessment
 * @data useConsciousnessCoach, consciousness-assess edge function
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useConsciousnessCoach } from '@/hooks/useConsciousnessCoach';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Send, Waves, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { ConsciousnessAssessmentResult, ConsciousnessSubscores, ConsciousnessFinding, Confidence } from '@/lib/consciousness/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/consciousness-assess`;

export default function ConsciousnessAssess() {
  const navigate = useNavigate();
  const { t, language, isRTL } = useTranslation();
  const { saveAssessment } = useConsciousnessCoach();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ConsciousnessAssessmentResult | null>(null);
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startConversation = useCallback(async () => {
    setStarted(true);
    setIsStreaming(true);

    // Send empty messages to trigger the AI's opening question
    let assistantSoFar = '';
    const updateAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamChat([], updateAssistant, () => setIsStreaming(false), handleToolCall);
    } catch (e) {
      console.error(e);
      setIsStreaming(false);
    }
  }, [language]);

  const handleToolCall = useCallback(async (toolArgs: any) => {
    // AI extracted the profile
    const subscores: ConsciousnessSubscores = toolArgs.subscores;
    const consciousness_index = Math.round(
      subscores.soul_intent_clarity * 0.20 +
      subscores.mask_awareness * 0.15 +
      subscores.frequency_stability * 0.15 +
      subscores.alignment_integrity * 0.20 +
      subscores.inner_signal_access * 0.15 +
      subscores.field_coherence * 0.15
    );

    const result: ConsciousnessAssessmentResult = {
      assessed_at: new Date().toISOString(),
      consciousness_index,
      confidence: toolArgs.confidence as Confidence,
      subscores,
      findings: toolArgs.findings as ConsciousnessFinding[],
      mirror_statement: toolArgs.mirror_statement,
      one_next_step: toolArgs.one_next_step,
      selected_focus_items: [],
    };

    setExtractedResult(result);
    setSaving(true);
    try {
      await saveAssessment(result);
      navigate('/life/consciousness/results');
    } catch (err) {
      console.error('Failed to save assessment:', err);
      setSaving(false);
    }
  }, [saveAssessment, navigate]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    let assistantSoFar = '';
    const updateAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamChat(updatedMessages, updateAssistant, () => {
        setIsStreaming(false);
        inputRef.current?.focus();
      }, handleToolCall);
    } catch (e) {
      console.error(e);
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, handleToolCall]);

  async function streamChat(
    msgs: ChatMessage[],
    onDelta: (text: string) => void,
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
      const errorText = await resp.text();
      console.error('Stream error:', resp.status, errorText);
      throw new Error(`Stream failed: ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let toolCallArgs = '';
    let isToolCall = false;

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

          // Check for tool calls
          if (choice?.delta?.tool_calls) {
            isToolCall = true;
            for (const tc of choice.delta.tool_calls) {
              if (tc.function?.arguments) {
                toolCallArgs += tc.function.arguments;
              }
            }
          }

          // Regular content
          const content = choice?.delta?.content as string | undefined;
          if (content) onDelta(content);

          // Check finish reason
          if (choice?.finish_reason === 'tool_calls' && toolCallArgs) {
            try {
              const args = JSON.parse(toolCallArgs);
              onToolCall(args);
            } catch (e) {
              console.error('Failed to parse tool call args:', e, toolCallArgs);
            }
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (toolCallArgs && isToolCall) {
      try {
        const args = JSON.parse(toolCallArgs);
        onToolCall(args);
      } catch { /* already handled */ }
    }

    onDone();
  }

  // Intro screen
  if (!started) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Waves className="w-14 h-14 text-violet-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-foreground mb-2">{t('consciousness.introTitle')}</h1>
            <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">{t('consciousness.introSubtitle')}</p>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">{t('consciousness.noPlanNote')}</p>
            <Button onClick={startConversation} className="bg-violet-600 hover:bg-violet-700" size="lg">
              {t('consciousness.begin')}
            </Button>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  // Saving screen
  if (saving || extractedResult) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground">{t('consciousness.assessSaving')}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col h-[calc(100vh-120px)]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3 py-3 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/consciousness')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-violet-500" />
            <h1 className="text-lg font-bold text-foreground">{t('consciousness.introTitle')}</h1>
          </div>
          <span className="ms-auto text-xs text-muted-foreground">
            {messages.filter(m => m.role === 'user').length} {t('consciousness.exchanges')}
          </span>
        </div>

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4 px-1">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-ee-sm'
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
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 py-3 border-t border-border/50">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('consciousness.chatPlaceholder')}
              disabled={isStreaming}
              className="flex-1 bg-muted/50 border-border/50"
              autoFocus
            />
            <Button type="submit" size="icon" disabled={isStreaming || !input.trim()}
              className="bg-violet-600 hover:bg-violet-700 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
