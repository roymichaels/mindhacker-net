/**
 * WorkChatWizard — "Talk to your work plan" dialog.
 * Two modes: 'chat' (Talk to Work Plan) and 'wizard' (AI Work Wizard).
 * Free users see upgrade prompt for wizard mode; chat mode is Plus+ only.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Wrench, Brain, Lock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import AuroraChatMessage from '@/components/aurora/AuroraChatMessage';
import AuroraTypingIndicator from '@/components/aurora/AuroraTypingIndicator';
import AuroraChatInput from '@/components/aurora/AuroraChatInput';
import { createManualWorkBlock } from '@/services/workSessions';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface WorkChatWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'chat' | 'wizard';
}

const QUICK_CHAT_HE = [
  'נתח את הפרודוקטיביות שלי היום',
  'איזה משימות כדאי לתעדף?',
  'כמה עבודה עמוקה עשיתי השבוע?',
  'תן טיפ לשיפור ריכוז',
];
const QUICK_CHAT_EN = [
  'Analyze my productivity today',
  'Which tasks should I prioritize?',
  'How much deep work did I do this week?',
  'Give me a focus improvement tip',
];
const QUICK_WIZARD_HE = [
  'תכנן לי את יום העבודה',
  'צור לוח זמנים ל-4 שעות עבודה',
  'הצע בלוקי עבודה עמוקה',
  'סדר את המשימות שלי לפי עדיפות',
];
const QUICK_WIZARD_EN = [
  'Plan my work day',
  'Create a 4-hour work schedule',
  'Suggest deep work blocks',
  'Prioritize my pending tasks',
];

// Strip work command tags from visible text
function stripWorkTags(text: string): string {
  return text.replace(/\[work:(plan|create|suggest):[^\]]+\]/g, '').trim();
}

// Parse work plan commands from AI response
function parseWorkCommands(text: string): Array<{ title: string; durationMin: number; isDeepWork: boolean }> {
  const blocks: Array<{ title: string; durationMin: number; isDeepWork: boolean }> = [];
  const regex = /\[work:plan:([^|]+)\|(\d+)\|(true|false)\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push({
      title: match[1].trim(),
      durationMin: parseInt(match[2]),
      isDeepWork: match[3] === 'true',
    });
  }
  return blocks;
}

export function WorkChatWizard({ open, onOpenChange, mode }: WorkChatWizardProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { isPlus, showUpgradePrompt } = useSubscriptionGate();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClose = (val: boolean) => {
    if (!val) {
      setMessages([]);
      setAppliedCount(0);
    }
    onOpenChange(val);
  };

  const processWorkCommands = useCallback(async (text: string) => {
    if (!user?.id) return;
    const blocks = parseWorkCommands(text);
    if (blocks.length === 0) return;

    let created = 0;
    for (const block of blocks) {
      try {
        const now = new Date();
        const start = new Date(now.getTime() + created * block.durationMin * 60000);
        const end = new Date(start.getTime() + block.durationMin * 60000);
        await createManualWorkBlock({
          user_id: user.id,
          title: block.title,
          started_at: start.toISOString(),
          ended_at: end.toISOString(),
          duration_seconds: block.durationMin * 60,
          is_deep_work: block.isDeepWork,
        });
        created++;
      } catch (err) {
        console.error('Failed to create work block:', err);
      }
    }

    if (created > 0) {
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['work-scores'] });
      setAppliedCount(prev => prev + created);
      toast.success(
        isHe
          ? `✅ ${created} בלוקי עבודה נוצרו`
          : `✅ ${created} work blocks created`
      );
    }
  }, [user?.id, queryClient, isHe]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user?.id || isStreaming) return;

    const userMsg: ChatMsg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsStreaming(true);

    let assistantText = '';

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/work-chat`,
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
            mode,
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error(isHe ? 'יותר מדי בקשות, נסה שוב בעוד רגע' : 'Too many requests, try again shortly');
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
            // partial JSON
          }
        }
      }

      if (assistantText && mode === 'wizard') {
        await processWorkCommands(assistantText);
      }
    } catch (err) {
      console.error('Work chat error:', err);
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

  // Subscription gate check
  if (!isPlus) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex flex-col items-center py-8 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold">
              {isHe ? 'פיצ\'ר פרימיום' : 'Premium Feature'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {mode === 'wizard'
                ? (isHe ? 'הוויזארד AI לתכנון עבודה זמין למנויי Plus ומעלה' : 'AI Work Wizard is available for Plus subscribers and above')
                : (isHe ? 'שיחת AI על תוכנית העבודה זמינה למנויי Plus ומעלה' : 'AI Work Plan chat is available for Plus subscribers and above')
              }
            </p>
            <Button
              onClick={() => { onOpenChange(false); showUpgradePrompt(mode === 'wizard' ? 'ai_work_wizard' : 'work_chat'); }}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'שדרג עכשיו' : 'Upgrade Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const quickActions = mode === 'wizard'
    ? (isHe ? QUICK_WIZARD_HE : QUICK_WIZARD_EN)
    : (isHe ? QUICK_CHAT_HE : QUICK_CHAT_EN);

  const titleIcon = mode === 'wizard' ? Brain : Wrench;
  const TitleIcon = titleIcon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent preventClose className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TitleIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="block">
                {mode === 'wizard'
                  ? (isHe ? 'אשף עבודה AI' : 'AI Work Wizard')
                  : (isHe ? 'דבר עם תוכנית העבודה' : 'Talk to Work Plan')
                }
              </span>
              <span className="block text-[10px] font-normal text-muted-foreground">
                {mode === 'wizard'
                  ? (isHe ? 'תכנון חכם של יום העבודה' : 'Smart work day planning')
                  : (isHe ? 'ניתוח ואופטימיזציה של העבודה שלך' : 'Analyze and optimize your work')
                }
              </span>
            </div>
            {appliedCount > 0 && (
              <span className="ms-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                {appliedCount} {isHe ? 'בלוקים' : 'blocks'}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  {mode === 'wizard'
                    ? <Brain className="h-7 w-7 text-primary" />
                    : <Sparkles className="h-7 w-7 text-primary" />
                  }
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    {mode === 'wizard'
                      ? (isHe ? 'אני אתכנן לך את יום העבודה' : "I'll plan your work day")
                      : (isHe ? 'בוא נדבר על העבודה שלך' : "Let's talk about your work")
                    }
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    {mode === 'wizard'
                      ? (isHe ? 'אנתח את המשימות שלך ואציע לוח זמנים אופטימלי עם בלוקי עבודה עמוקה' : "I'll analyze your tasks and suggest an optimal schedule with deep work blocks")
                      : (isHe ? 'שאל שאלות על הפרודוקטיביות שלך, קבל טיפים ונתח דפוסי עבודה' : 'Ask about your productivity, get tips, and analyze work patterns')
                    }
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
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <AuroraChatMessage
                    key={i}
                    id={`work-chat-${i}`}
                    content={msg.role === 'assistant' ? stripWorkTags(msg.content) : msg.content}
                    isOwn={msg.role === 'user'}
                    isAI={msg.role === 'assistant'}
                    isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                  />
                ))}
                {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                  <AuroraTypingIndicator />
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        <AuroraChatInput onSend={sendMessage} disabled={isStreaming} bypassLimits />
      </DialogContent>
    </Dialog>
  );
}
