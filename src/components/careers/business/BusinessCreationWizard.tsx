/**
 * BusinessCreationWizard — Aurora-powered conversational wizard for creating a new business.
 * Uses AI chat to gather business info, then creates the business_journey record.
 */
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Loader2, Sparkles, X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface BusinessCreationWizardProps {
  onClose: () => void;
  onComplete: (journeyId: string) => void;
}

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

const SYSTEM_PROMPT_HE = `אתה Aurora, עוזרת AI אישית שעוזרת למשתמש להקים עסק חדש.
המטרה שלך: לאסוף מידע על העסק של המשתמש דרך שיחה טבעית.

תשאלי שאלה אחת בכל פעם. תתחילי מהשם והחזון של העסק.

המידע שצריך לאסוף:
1. שם העסק והחזון
2. סוג העסק (שירותים, מוצרים, SaaS, קמעונאי וכו')
3. קהל יעד
4. הצעת ערך ייחודית
5. אתגרים עיקריים

כשיש לך מספיק מידע, תגידי "✅ יש לי מספיק מידע! בוא ניצור את העסק שלך." ותוסיפי את המילה המיוחדת [READY] בסוף.

שמרי על שיחה קצרה, חמה ומקצועית. אל תשאלי יותר מ-5 שאלות.`;

const SYSTEM_PROMPT_EN = `You are Aurora, a personal AI assistant helping the user set up a new business.
Your goal: gather business information through natural conversation.

Ask one question at a time. Start with the business name and vision.

Information to collect:
1. Business name and vision
2. Business type (services, products, SaaS, retail, etc.)
3. Target audience
4. Unique value proposition
5. Main challenges

When you have enough info, say "✅ I have enough information! Let's create your business." and add the special word [READY] at the end.

Keep the conversation short, warm and professional. Don't ask more than 5 questions.`;

export default function BusinessCreationWizard({ onClose, onComplete }: BusinessCreationWizardProps) {
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Start conversation on mount
  useEffect(() => {
    sendToAI([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendToAI = async (currentMessages: Msg[]) => {
    setIsStreaming(true);
    const systemMsg: Msg = { role: 'system', content: isHe ? SYSTEM_PROMPT_HE : SYSTEM_PROMPT_EN };

    try {
      const resp = await fetch(
        `${window.location.origin}/api/mindos-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [systemMsg, ...currentMessages],
            mode: 'business-wizard',
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        throw new Error('Stream failed');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
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
          } catch { /* partial */ }
        }
      }

      // Check if ready
      if (assistantText.includes('[READY]')) {
        setIsReady(true);
        // Clean the [READY] tag from display
        setMessages(prev =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? { ...m, content: m.content.replace('[READY]', '').trim() }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Business wizard AI error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: isHe ? 'מצטערת, משהו השתבש. נסה שוב.' : 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    await sendToAI(updated);
  };

  const handleCreateBusiness = async () => {
    if (!user) return;
    setIsCreating(true);

    try {
      // Extract business info from conversation
      const conversationText = messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      // Create business journey
      const { data, error } = await supabase
        .from('business_journeys')
        .insert({
          user_id: user.id,
          business_name: extractBusinessName(conversationText),
          step_1_vision: { conversation_context: conversationText, source: 'aurora-wizard' },
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success(isHe ? 'העסק נוצר בהצלחה!' : 'Business created successfully!');
      onComplete(data.id);
    } catch (err) {
      console.error('Create business error:', err);
      toast.error(isHe ? 'שגיאה ביצירת העסק' : 'Error creating business');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-bold">{isHe ? 'יצירת עסק חדש' : 'Create New Business'}</h2>
              <p className="text-[10px] text-muted-foreground">{isHe ? 'Aurora תעזור לך' : 'Aurora will guide you'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.filter(m => m.role !== 'system').map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border/50'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
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
              <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input or Create button */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent px-4 pt-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {isReady ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold gap-2"
                onClick={handleCreateBusiness}
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                {isHe ? 'צור את העסק!' : 'Create the Business!'}
              </Button>
            </motion.div>
          ) : (
            <div className="flex gap-2 items-end">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isHe ? 'ספר לי על העסק שלך...' : 'Tell me about your business...'}
                className="min-h-[44px] max-h-[120px] resize-none bg-card/50 text-sm"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                size="icon"
                className="shrink-0 h-11 w-11 bg-amber-500 hover:bg-amber-600 text-black"
                disabled={!input.trim() || isStreaming}
                onClick={handleSend}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Extract a business name from conversation text (best effort) */
function extractBusinessName(text: string): string | null {
  // Simple heuristic: look for quoted text after "name" keywords
  const nameMatch = text.match(/(?:שם.*?["״]([^"״]+)["״]|name.*?["']([^"']+)["'])/i);
  if (nameMatch) return nameMatch[1] || nameMatch[2];
  return null;
}
