/**
 * DomainAssessChat — Uses Aurora chat UI for domain assessments.
 * Streams messages from domain-assess edge function, extracts profile via tool call.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useTranslation } from '@/hooks/useTranslation';
import { useDomainAssessment } from '@/hooks/useDomainAssessment';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence } from 'framer-motion';
import AuroraChatMessage from '@/components/aurora/AuroraChatMessage';
import AuroraTypingIndicator from '@/components/aurora/AuroraTypingIndicator';
import AuroraChatInput from '@/components/aurora/AuroraChatInput';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import type { DomainAssessmentResult, Confidence } from '@/lib/domain-assess/types';
import { DOMAIN_ASSESS_META } from '@/lib/domain-assess/types';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domain-assess`;

function isCoreDomain(domainId: string): boolean {
  return CORE_DOMAINS.some(d => d.id === domainId);
}

function getBasePath(domainId: string): string {
  return isCoreDomain(domainId) ? '/life' : '/arena';
}

interface Props {
  domainId: string;
}

export default function DomainAssessChat({ domainId }: Props) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { saveAssessment } = useDomainAssessment(domainId);

  const meta = DOMAIN_ASSESS_META[domainId];
  const domain = getDomainById(domainId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const isHe = language === 'he';
  let msgCounter = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleToolCall = useCallback(async (toolArgs: any) => {
    const subscores = toolArgs.subscores as Record<string, number>;
    const subsystems = meta.subsystems;

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
      navigate(`${getBasePath(domainId)}/${domainId}/results`);
    } catch (err) {
      console.error('Failed to save:', err);
      setSaving(false);
    }
  }, [saveAssessment, navigate, domainId, meta]);

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

  const addAssistantMessage = useCallback((content: string) => {
    msgCounter.current += 1;
    setMessages(prev => [...prev, {
      id: `assess-ai-${msgCounter.current}`,
      role: 'assistant',
      content,
      created_at: new Date().toISOString(),
    }]);
  }, []);

  const startConversation = useCallback(async () => {
    if (started) return;
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
  }, [language, handleToolCall, started, addAssistantMessage]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    msgCounter.current += 1;
    const userMsg: ChatMessage = {
      id: `assess-user-${msgCounter.current}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    const updated = [...messages, userMsg];
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
  }, [messages, isStreaming, handleToolCall, addAssistantMessage]);

  // Auto-start
  useEffect(() => { startConversation(); }, []);

  const Icon = domain?.icon;

  if (saving) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{isHe ? 'מעבד תוצאות...' : 'Processing results...'}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col h-[calc(100vh-120px)]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header — Aurora style */}
        <div className="flex items-center gap-3 py-3 px-2 shrink-0 border-b border-border/30">
          <Button variant="ghost" size="icon" onClick={() => navigate(getBasePath(domainId))} className="shrink-0">
            <BackIcon className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shrink-0">
            <AuroraOrbIcon size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-foreground">
              {isHe ? 'אורורה' : 'Aurora'}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {isHe ? (domain?.labelHe ?? domainId) : (domain?.labelEn ?? domainId)}
            </p>
          </div>
        </div>

        {/* Chat messages — Aurora style */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
            <div className="space-y-6">
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

              {/* Streaming message */}
              {isStreaming && streamingContent && (
                <AuroraChatMessage
                  id="streaming"
                  content={streamingContent}
                  isOwn={false}
                  isAI
                  isStreaming
                />
              )}

              {/* Typing indicator */}
              {isStreaming && !streamingContent && (
                <AuroraTypingIndicator />
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>

        {/* Input — Aurora style */}
        <AuroraChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </PageShell>
  );
}
