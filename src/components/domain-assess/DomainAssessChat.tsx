/**
 * DomainAssessChat — Reusable AI conversation assessment for any domain.
 * Streams messages from domain-assess edge function, extracts profile via tool call.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useDomainAssessment } from '@/hooks/useDomainAssessment';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { getDomainById } from '@/navigation/lifeDomains';
import type { DomainAssessmentResult, DomainAssessMeta, Confidence } from '@/lib/domain-assess/types';
import { DOMAIN_ASSESS_META } from '@/lib/domain-assess/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domain-assess`;

const COLOR_MAP: Record<string, { bg: string; text: string; bubble: string; btn: string; icon: string }> = {
  emerald: { bg: 'from-emerald-500/10', text: 'text-emerald-500', bubble: 'bg-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700', icon: 'text-emerald-500' },
  purple:  { bg: 'from-purple-500/10',  text: 'text-purple-500',  bubble: 'bg-purple-600',  btn: 'bg-purple-600 hover:bg-purple-700',  icon: 'text-purple-500' },
  sky:     { bg: 'from-sky-500/10',     text: 'text-sky-500',     bubble: 'bg-sky-600',     btn: 'bg-sky-600 hover:bg-sky-700',     icon: 'text-sky-500' },
};

interface Props {
  domainId: string;
}

export default function DomainAssessChat({ domainId }: Props) {
  const navigate = useNavigate();
  const { t, language, isRTL } = useTranslation();
  const { saveAssessment } = useDomainAssessment(domainId);

  const meta = DOMAIN_ASSESS_META[domainId];
  const domain = getDomainById(domainId);
  const colors = COLOR_MAP[meta?.color ?? 'emerald'];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleToolCall = useCallback(async (toolArgs: any) => {
    const subscores = toolArgs.subscores as Record<string, number>;
    const subsystems = meta.subsystems;

    // Weighted index
    let domain_index = 0;
    for (const sub of subsystems) {
      domain_index += (subscores[sub.id] ?? 0) * sub.weight;
    }
    domain_index = Math.round(domain_index);

    const result: DomainAssessmentResult = {
      assessed_at: new Date().toISOString(),
      domain_index,
      confidence: toolArgs.confidence as Confidence,
      subscores,
      findings: toolArgs.findings ?? [],
      mirror_statement: toolArgs.mirror_statement,
      one_next_step: toolArgs.one_next_step,
      selected_focus_items: [],
    };

    setSaving(true);
    try {
      await saveAssessment(result);
      navigate(`/arena/${domainId}/results`);
    } catch (err) {
      console.error('Failed to save:', err);
      setSaving(false);
    }
  }, [saveAssessment, navigate, domainId, meta]);

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
      body: JSON.stringify({ messages: msgs, language, domainId }),
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
  }, [language, handleToolCall]);

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

  const Icon = domain?.icon;
  const isHe = language === 'he';

  // Intro screen
  if (!started) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            {Icon && <Icon className={cn("w-14 h-14 mx-auto mb-4", colors.icon)} />}
            <h1 className="text-2xl font-black text-foreground mb-2">{t(meta.introTitleKey)}</h1>
            <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">{t(meta.introSubtitleKey)}</p>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
              {isHe ? 'שיחה קצרה. בלי תוכניות — רק מראה.' : 'Short conversation. No plans — just a mirror.'}
            </p>
            <Button onClick={startConversation} className={colors.btn} size="lg">
              {isHe ? 'בוא נתחיל' : "Let's begin"}
            </Button>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  // Saving screen
  if (saving) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className={cn("w-8 h-8 animate-spin", colors.icon)} />
          <p className="text-sm text-muted-foreground">{isHe ? 'מעבד תוצאות...' : 'Processing results...'}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col h-[calc(100vh-120px)]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3 py-3 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate('/arena')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            {Icon && <Icon className={cn("w-5 h-5", colors.icon)} />}
            <h1 className="text-lg font-bold text-foreground">
              {isHe ? (domain?.labelHe ?? domainId) : (domain?.labelEn ?? domainId)}
            </h1>
          </div>
          <span className="ms-auto text-xs text-muted-foreground">
            {messages.filter(m => m.role === 'user').length} {isHe ? 'הודעות' : 'messages'}
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
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'user'
                    ? `${colors.bubble} text-white rounded-ee-sm`
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
                <Loader2 className={cn("w-4 h-4 animate-spin", colors.icon)} />
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
              placeholder={isHe ? 'הקלד תשובה...' : 'Type your answer...'}
              disabled={isStreaming}
              className="flex-1 bg-muted/50 border-border/50"
              autoFocus
            />
            <Button type="submit" size="icon" disabled={isStreaming || !input.trim()}
              className={cn(colors.btn, "shrink-0")}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
