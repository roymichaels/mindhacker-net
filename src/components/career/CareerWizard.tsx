/**
 * CareerWizard — Aurora-powered conversational wizard for all career paths.
 * Reusable across: business, coach, therapist, creator, freelancer.
 */
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Loader2, Sparkles, Building2, GraduationCap, Heart, Palette, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export type CareerType = 'business' | 'coach' | 'therapist' | 'creator' | 'freelancer';

interface CareerWizardProps {
  careerType: CareerType;
  onBack: () => void;
  onComplete: (journeyId: string) => void;
}

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

const CAREER_CONFIG: Record<CareerType, {
  icon: typeof Building2;
  gradient: string;
  buttonGradient: string;
  buttonHover: string;
}> = {
  business: {
    icon: Building2,
    gradient: 'from-amber-500 to-yellow-400',
    buttonGradient: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    buttonHover: 'hover:from-amber-600 hover:to-yellow-500',
  },
  coach: {
    icon: GraduationCap,
    gradient: 'from-purple-500 to-fuchsia-500',
    buttonGradient: 'bg-gradient-to-r from-purple-500 to-fuchsia-500',
    buttonHover: 'hover:from-purple-600 hover:to-fuchsia-600',
  },
  therapist: {
    icon: Heart,
    gradient: 'from-rose-500 to-pink-500',
    buttonGradient: 'bg-gradient-to-r from-rose-500 to-pink-500',
    buttonHover: 'hover:from-rose-600 hover:to-pink-600',
  },
  creator: {
    icon: Palette,
    gradient: 'from-sky-500 to-blue-500',
    buttonGradient: 'bg-gradient-to-r from-sky-500 to-blue-500',
    buttonHover: 'hover:from-sky-600 hover:to-blue-600',
  },
  freelancer: {
    icon: Code,
    gradient: 'from-emerald-500 to-teal-500',
    buttonGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    buttonHover: 'hover:from-emerald-600 hover:to-teal-600',
  },
};

const LABELS: Record<CareerType, { en: string; he: string; createEn: string; createHe: string; subtitleEn: string; subtitleHe: string }> = {
  business: {
    en: 'Business Setup', he: 'הקמת עסק',
    createEn: 'Create Business!', createHe: 'צור את העסק!',
    subtitleEn: 'Aurora will guide you', subtitleHe: 'Aurora תעזור לך',
  },
  coach: {
    en: 'Coaching Practice', he: 'פרקטיקת אימון',
    createEn: 'Launch Practice!', createHe: 'השק את הפרקטיקה!',
    subtitleEn: 'Build your coaching career', subtitleHe: 'בנה את הקריירה שלך',
  },
  therapist: {
    en: 'Therapy Practice', he: 'פרקטיקה טיפולית',
    createEn: 'Launch Practice!', createHe: 'השק את הפרקטיקה!',
    subtitleEn: 'Set up your therapy practice', subtitleHe: 'הקם את הפרקטיקה שלך',
  },
  creator: {
    en: 'Content Creator', he: 'יוצר תוכן',
    createEn: 'Start Creating!', createHe: 'התחל ליצור!',
    subtitleEn: 'Build your creator brand', subtitleHe: 'בנה את המותג שלך',
  },
  freelancer: {
    en: 'Freelancer Setup', he: 'הקמת פרילנס',
    createEn: 'Go Freelance!', createHe: 'התחל כפרילנסר!',
    subtitleEn: 'Launch your freelance career', subtitleHe: 'התחל את הקריירה שלך',
  },
};

function getSystemPrompt(type: CareerType, isHe: boolean): string {
  const prompts: Record<CareerType, { en: string; he: string }> = {
    business: {
      he: `אתה Aurora, עוזרת AI שעוזרת למשתמש להקים או לנהל עסק.
המטרה: לאסוף מידע על העסק דרך שיחה טבעית. העסק יכול להיות חדש או קיים.

תשאלי שאלה אחת בכל פעם. תתחילי בלשאול אם זה עסק חדש או קיים.

מידע לאסוף:
1. שם העסק, האם חדש או קיים, והחזון
2. סוג העסק (שירותים, מוצרים, SaaS וכו')
3. קהל יעד
4. הצעת ערך ייחודית
5. אתגרים עיקריים

כשיש מספיק מידע, אמרי "✅ יש לי מספיק מידע!" והוסיפי [READY] בסוף.
שמרי על שיחה קצרה וחמה. מקסימום 5 שאלות.`,
      en: `You are Aurora, an AI assistant helping the user set up or manage a business.
Goal: gather business info through natural conversation. The business can be new OR existing.

Ask one question at a time. Start by asking if this is a new or existing business.

Info to collect:
1. Business name, whether new or existing, and vision
2. Business type (services, products, SaaS, etc.)
3. Target audience
4. Unique value proposition
5. Main challenges

When ready, say "✅ I have enough information!" and add [READY] at the end.
Keep it short and warm. Max 5 questions.`,
    },
    coach: {
      he: `אתה Aurora, עוזרת AI שעוזרת למשתמש לבנות פרקטיקת אימון (קואצ'ינג).

תשאלי שאלה אחת בכל פעם:
1. מה הנישה שלך באימון? (חיים, עסקים, בריאות וכו')
2. מה הניסיון וההסמכות שלך?
3. מי הלקוח האידאלי שלך?
4. אילו שירותים תרצה להציע?
5. מה החזון שלך לפרקטיקה?

כשיש מספיק מידע, אמרי "✅ יש לי מספיק מידע!" והוסיפי [READY] בסוף.`,
      en: `You are Aurora, an AI assistant helping the user build a coaching practice.

Ask one question at a time:
1. What's your coaching niche? (life, business, health, etc.)
2. What's your experience and credentials?
3. Who is your ideal client?
4. What services would you like to offer?
5. What's your vision for your practice?

When ready, say "✅ I have enough information!" and add [READY] at the end.`,
    },
    therapist: {
      he: `אתה Aurora, עוזרת AI שעוזרת למשתמש לבנות פרקטיקה טיפולית.

תשאלי שאלה אחת בכל פעם:
1. מה ההתמחות שלך? (CBT, פסיכודינמי, זוגי וכו')
2. מה ההסמכות והניסיון שלך?
3. מי קהל היעד שלך?
4. אילו שירותים תרצה להציע?
5. מה החזון שלך לפרקטיקה?

כשיש מספיק מידע, אמרי "✅ יש לי מספיק מידע!" והוסיפי [READY] בסוף.`,
      en: `You are Aurora, an AI assistant helping the user build a therapy practice.

Ask one question at a time:
1. What's your specialization? (CBT, psychodynamic, couples, etc.)
2. What are your credentials and experience?
3. Who is your target audience?
4. What services would you like to offer?
5. What's your vision for your practice?

When ready, say "✅ I have enough information!" and add [READY] at the end.`,
    },
    creator: {
      he: `אתה Aurora, עוזרת AI שעוזרת למשתמש לבנות קריירה כיוצר תוכן.

תשאלי שאלה אחת בכל פעם:
1. מה הנישה שלך? (טכנולוגיה, לייפסטייל, חינוך וכו')
2. באילו פלטפורמות אתה פעיל?
3. מה סוג התוכן שתרצה ליצור?
4. איך תרצה למנף כסף?
5. מה החזון שלך כיוצר?

כשיש מספיק מידע, אמרי "✅ יש לי מספיק מידע!" והוסיפי [READY] בסוף.`,
      en: `You are Aurora, an AI assistant helping the user build a content creator career.

Ask one question at a time:
1. What's your niche? (tech, lifestyle, education, etc.)
2. Which platforms are you active on?
3. What type of content do you want to create?
4. How would you like to monetize?
5. What's your vision as a creator?

When ready, say "✅ I have enough information!" and add [READY] at the end.`,
    },
    freelancer: {
      he: `אתה Aurora, עוזרת AI שעוזרת למשתמש להקים קריירת פרילנס.

תשאלי שאלה אחת בכל פעם:
1. מה הכישורים העיקריים שלך?
2. מה הניסיון שלך?
3. מי הלקוח האידאלי שלך?
4. מה מודל התמחור שלך?
5. מה החזון שלך כפרילנסר?

כשיש מספיק מידע, אמרי "✅ יש לי מספיק מידע!" והוסיפי [READY] בסוף.`,
      en: `You are Aurora, an AI assistant helping the user launch a freelance career.

Ask one question at a time:
1. What are your main skills?
2. What's your experience?
3. Who is your ideal client?
4. What's your pricing model?
5. What's your vision as a freelancer?

When ready, say "✅ I have enough information!" and add [READY] at the end.`,
    },
  };

  return isHe ? prompts[type].he : prompts[type].en;
}

export default function CareerWizard({ careerType, onBack, onComplete }: CareerWizardProps) {
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

  const config = CAREER_CONFIG[careerType];
  const labels = LABELS[careerType];
  const Icon = config.icon;

  useEffect(() => {
    sendToAI([]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendToAI = async (currentMessages: Msg[]) => {
    setIsStreaming(true);
    const systemMsg: Msg = { role: 'system', content: getSystemPrompt(careerType, isHe) };

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
            mode: `${careerType}-wizard`,
          }),
        }
      );

      if (!resp.ok || !resp.body) throw new Error('Stream failed');

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

      if (assistantText.includes('[READY]')) {
        setIsReady(true);
        setMessages(prev =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? { ...m, content: m.content.replace('[READY]', '').trim() }
              : m
          )
        );
      }
    } catch (err) {
      console.error(`${careerType} wizard AI error:`, err);
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

  const handleCreate = async () => {
    if (!user) return;
    setIsCreating(true);

    try {
      const conversationText = messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const nameMatch = conversationText.match(/(?:שם.*?["״]([^"״]+)["״]|name.*?["']([^"']+)["'])/i);
      const extractedName = nameMatch ? (nameMatch[1] || nameMatch[2]) : null;

      let journeyId: string;

      if (careerType === 'business') {
        const { data, error } = await supabase
          .from('business_journeys')
          .insert({
            user_id: user.id,
            business_name: extractedName,
            step_1_vision: { conversation_context: conversationText, source: 'aurora-wizard' },
          })
          .select('id')
          .single();
        if (error) throw error;
        journeyId = data.id;
      } else if (careerType === 'coach') {
        const { data, error } = await supabase
          .from('coaching_journeys')
          .insert({
            user_id: user.id,
            coaching_niche: extractedName,
            step_1_vision: { conversation_context: conversationText, source: 'aurora-wizard' },
          })
          .select('id')
          .single();
        if (error) throw error;
        journeyId = data.id;
      } else if (careerType === 'therapist') {
        const { data, error } = await supabase
          .from('therapist_journeys')
          .insert({
            user_id: user.id,
            practice_name: extractedName,
            step_1_vision: { conversation_context: conversationText, source: 'aurora-wizard' },
          })
          .select('id')
          .single();
        if (error) throw error;
        journeyId = data.id;
      } else if (careerType === 'creator') {
        const { data, error } = await supabase
          .from('creator_journeys')
          .insert({
            user_id: user.id,
            creator_name: extractedName,
            step_1_vision: { conversation_context: conversationText, source: 'aurora-wizard' },
          })
          .select('id')
          .single();
        if (error) throw error;
        journeyId = data.id;
      } else {
        // freelancer
        const { data, error } = await supabase
          .from('freelancer_journeys')
          .insert({
            user_id: user.id,
            freelancer_name: extractedName,
            step_1_vision: { conversation_context: conversationText, source: 'aurora-wizard' },
          })
          .select('id')
          .single();
        if (error) throw error;
        journeyId = data.id;
      }

      toast.success(isHe ? 'נוצר בהצלחה!' : 'Created successfully!');
      onComplete(journeyId);
    } catch (err) {
      console.error(`Create ${careerType} error:`, err);
      toast.error(isHe ? 'שגיאה ביצירה' : 'Error creating');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">{isHe ? labels.he : labels.en}</h2>
            <p className="text-[10px] text-muted-foreground">{isHe ? labels.subtitleHe : labels.subtitleEn}</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
        <div className="space-y-4">
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
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input or Create button */}
      <div className="shrink-0 px-4 pt-3 pb-4 border-t border-border/50">
        {isReady ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              size="lg"
              className={`w-full ${config.buttonGradient} ${config.buttonHover} text-white font-semibold gap-2`}
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isHe ? labels.createHe : labels.createEn}
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
              placeholder={isHe ? 'ספר/י לי...' : 'Tell me...'}
              className="min-h-[44px] max-h-[120px] resize-none bg-card/50 text-sm"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              size="icon"
              className={`shrink-0 h-11 w-11 ${config.buttonGradient} ${config.buttonHover} text-white`}
              disabled={!input.trim() || isStreaming}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
