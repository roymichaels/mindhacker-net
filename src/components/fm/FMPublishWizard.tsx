/**
 * FMPublishWizard — Aurora-powered conversational wizard for publishing
 * services, bounties, or marketplace items in the FM.
 * Follows the same pattern as BusinessCreationWizard.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';

export type FMPublishType = 'service' | 'bounty' | 'marketplace';

interface FMPublishWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: FMPublishType;
}

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

const LABELS: Record<FMPublishType, { en: string; he: string; icon: string }> = {
  service: { en: 'Publish a Service', he: 'פרסום שירות', icon: '💼' },
  bounty: { en: 'Create a Bounty', he: 'יצירת באונטי', icon: '🎯' },
  marketplace: { en: 'List an Item', he: 'פרסום פריט', icon: '🛒' },
};

function getSystemPrompt(type: FMPublishType, isHe: boolean): string {
  if (isHe) {
    const typeMap: Record<FMPublishType, string> = {
      service: `אתה Aurora, עוזרת AI שעוזרת למשתמש לפרסם שירות חדש במרקט.
אספי את המידע הבא דרך שיחה טבעית (שאלה אחת בכל פעם):
1. כותרת השירות
2. תיאור מפורט - מה כולל השירות
3. קטגוריה (עיצוב, כתיבה, תרגום, פיתוח, תוכן, אחר)
4. מחיר ב-MOS (הסבירי שמומלץ 100-5000 MOS)

כשיש לך מספיק מידע, סכמי את הפרטים ושאלי "הכל נכון?" והוסיפי [READY] בסוף.
בתשובת [READY] הוסיפי גם את ה-JSON הבא בשורה נפרדת:
[DATA]{"title":"...","description":"...","category":"...","budget_mos":...}[/DATA]`,
      bounty: `אתה Aurora, עוזרת AI שעוזרת למשתמש ליצור באונטי (משימה עם תגמול) חדש.
אספי את המידע הבא דרך שיחה טבעית (שאלה אחת בכל פעם):
1. כותרת הבאונטי - מה המשימה
2. תיאור מפורט - מה צריך לעשות
3. קטגוריה (כתיבה, תיוג, משוב, עיצוב, תרגום)
4. תגמול ב-MOS (הסבירי שמומלץ 10-500 MOS)
5. זמן משוער לביצוע (בדקות)

כשיש לך מספיק מידע, סכמי את הפרטים ושאלי "הכל נכון?" והוסיפי [READY] בסוף.
בתשובת [READY] הוסיפי גם:
[DATA]{"title":"...","description":"...","category":"...","reward_mos":...,"estimated_minutes":...}[/DATA]`,
      marketplace: `אתה Aurora, עוזרת AI שעוזרת למשתמש לפרסם פריט במרקטפלייס.
אספי את המידע הבא דרך שיחה טבעית (שאלה אחת בכל פעם):
1. שם הפריט
2. תיאור - מה הפריט כולל
3. קטגוריה (קורסים, מוצרים דיגיטליים, NFTs, תבניות)
4. מחיר ב-MOS

כשיש לך מספיק מידע, סכמי את הפרטים ושאלי "הכל נכון?" והוסיפי [READY] בסוף.
בתשובת [READY] הוסיפי גם:
[DATA]{"title":"...","description":"...","category":"...","price_mos":...}[/DATA]`,
    };
    return typeMap[type] + '\n\nשמרי על שיחה קצרה, חמה ומקצועית. אל תשאלי יותר מ-5 שאלות.';
  }

  const typeMap: Record<FMPublishType, string> = {
    service: `You are Aurora, an AI assistant helping the user publish a new service on the marketplace.
Gather the following through natural conversation (one question at a time):
1. Service title
2. Detailed description - what's included
3. Category (design, writing, translation, development, content, other)
4. Price in MOS (suggest 100-5000 MOS range)

When you have enough info, summarize and ask "Does this look right?" and add [READY] at the end.
In the [READY] message, also include on a separate line:
[DATA]{"title":"...","description":"...","category":"...","budget_mos":...}[/DATA]`,
    bounty: `You are Aurora, an AI assistant helping the user create a new bounty (task with reward).
Gather the following through natural conversation (one question at a time):
1. Bounty title - what's the task
2. Detailed description - what needs to be done
3. Category (writing, labeling, feedback, design, translation)
4. Reward in MOS (suggest 10-500 MOS range)
5. Estimated completion time (in minutes)

When you have enough info, summarize and ask "Does this look right?" and add [READY] at the end.
In the [READY] message, also include:
[DATA]{"title":"...","description":"...","category":"...","reward_mos":...,"estimated_minutes":...}[/DATA]`,
    marketplace: `You are Aurora, an AI assistant helping the user list an item on the marketplace.
Gather the following through natural conversation (one question at a time):
1. Item name
2. Description - what's included
3. Category (courses, digital_products, nfts, templates)
4. Price in MOS

When you have enough info, summarize and ask "Does this look right?" and add [READY] at the end.
In the [READY] message, also include:
[DATA]{"title":"...","description":"...","category":"...","price_mos":...}[/DATA]`,
  };
  return typeMap[type] + '\n\nKeep the conversation short, warm and professional. Don\'t ask more than 5 questions.';
}

export default function FMPublishWizard({ open, onOpenChange, type }: FMPublishWizardProps) {
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  const label = LABELS[type];

  // Start conversation on open
  useEffect(() => {
    if (open && !hasStarted.current) {
      hasStarted.current = true;
      setMessages([]);
      setIsReady(false);
      setExtractedData(null);
      sendToAI([]);
    }
    if (!open) {
      hasStarted.current = false;
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendToAI = useCallback(async (currentMessages: Msg[]) => {
    setIsStreaming(true);
    const systemMsg: Msg = { role: 'system', content: getSystemPrompt(type, isHe) };

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [systemMsg, ...currentMessages],
            mode: 'fm-publish-wizard',
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error(isHe ? 'יותר מדי בקשות, נסה שוב בעוד דקה' : 'Too many requests, try again in a minute');
          setIsStreaming(false);
          return;
        }
        if (resp.status === 402) {
          toast.error(isHe ? 'נדרש תשלום, הוסף קרדיטים' : 'Payment required, please add credits');
          setIsStreaming(false);
          return;
        }
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

      // Check if ready & extract data
      if (assistantText.includes('[READY]')) {
        setIsReady(true);
        // Extract structured data
        const dataMatch = assistantText.match(/\[DATA\](.*?)\[\/DATA\]/s);
        if (dataMatch) {
          try {
            setExtractedData(JSON.parse(dataMatch[1]));
          } catch { /* ignore parse errors */ }
        }
        // Clean tags from display
        setMessages(prev =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? { ...m, content: m.content.replace('[READY]', '').replace(/\[DATA\].*?\[\/DATA\]/s, '').trim() }
              : m
          )
        );
      }
    } catch (err) {
      console.error('FM publish wizard AI error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: isHe ? 'מצטערת, משהו השתבש. נסי שוב.' : 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [type, isHe]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    await sendToAI(updated);
  };

  const handlePublish = async () => {
    if (!user?.id || !extractedData) return;
    setIsCreating(true);

    try {
      if (type === 'service') {
        const { error } = await supabase.from('fm_gigs').insert({
          title: extractedData.title || 'Untitled Service',
          description: extractedData.description || null,
          budget_mos: extractedData.budget_mos || 100,
          category: extractedData.category || 'other',
          poster_id: user.id,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['fm-gigs'] });
        toast.success(isHe ? 'השירות פורסם! 🎉' : 'Service published! 🎉');
      } else if (type === 'bounty') {
        const { error } = await supabase.from('fm_bounties').insert({
          title: extractedData.title || 'Untitled Bounty',
          description: extractedData.description || null,
          reward_mos: extractedData.reward_mos || 50,
          category: extractedData.category || 'writing',
          estimated_minutes: extractedData.estimated_minutes || null,
          creator_id: user.id,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['fm-bounties'] });
        toast.success(isHe ? 'הבאונטי נוצר! 🎉' : 'Bounty created! 🎉');
      } else {
        // marketplace - for now show coming soon
        toast.success(isHe ? 'הפריט נשמר! (מרקטפלייס בקרוב)' : 'Item saved! (Marketplace coming soon)');
      }

      onOpenChange(false);
    } catch (err: any) {
      console.error('Publish error:', err);
      toast.error(err.message || (isHe ? 'שגיאה בפרסום' : 'Error publishing'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg p-0 gap-0 overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>
        <AlertDialogTitle className="sr-only">{isHe ? label.he : label.en}</AlertDialogTitle>
        <AlertDialogDescription className="sr-only">
          {isHe ? 'אשף פרסום עם Aurora' : 'Aurora-powered publish wizard'}
        </AlertDialogDescription>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="shrink-0 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg">{label.icon}</span>
            <div>
              <h2 className="text-sm font-bold text-foreground">{isHe ? label.he : label.en}</h2>
              <p className="text-[10px] text-muted-foreground">{isHe ? 'Aurora תעזור לך' : 'Aurora will guide you'}</p>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="space-y-3">
            <AnimatePresence>
              {messages.filter(m => m.role !== 'system').map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
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
                <div className="bg-card border border-border/50 rounded-2xl px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input or Publish button */}
        <div className="border-t border-border/50 px-4 py-3 shrink-0" dir={isRTL ? 'rtl' : 'ltr'}>
          {isReady ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold gap-2"
                onClick={handlePublish}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {isHe ? 'פרסם!' : 'Publish!'}
              </Button>
            </motion.div>
          ) : (
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isHe ? 'ספר לי...' : 'Tell me...'}
                className="min-h-[44px] max-h-[100px] resize-none bg-card/50 text-sm"
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
      </AlertDialogContent>
    </AlertDialog>
  );
}
