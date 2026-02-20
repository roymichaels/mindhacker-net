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

/** Static intro messages per domain — explains goal, why we ask, what we'll cover */
const DOMAIN_INTROS: Record<string, { he: string; en: string }> = {
  vitality: {
    he: '🔋 **ברוכים הבאים לסריקת חיוניות**\n\nכאן אנחנו בודקים את רמת האנרגיה, איכות השינה, התזונה וההתאוששות שלך — הבסיס הפיזיולוגי לכל השאר.\n\n**למה?** בלי חיוניות גבוהה, אין ביצועים. זה המנוע.\n\n**מה נשאל?** שאלות על שינה, תזונה, חומרים, אנרגיה יומית, התאוששות ויציבות קירקדית. ענה בכנות — אין תשובות נכונות או לא נכונות.',
    en: '🔋 **Welcome to the Vitality Scan**\n\nHere we assess your energy levels, sleep quality, nutrition, and recovery — the physiological foundation for everything else.\n\n**Why?** Without high vitality, there\'s no performance. This is your engine.\n\n**What will we ask?** Questions about sleep, nutrition, substances, daily energy, recovery, and circadian stability. Answer honestly — there are no right or wrong answers.',
  },
  focus: {
    he: '🎯 **ברוכים הבאים לסריקת מיקוד**\n\nכאן אנחנו מודדים את יכולת הריכוז, עמידות בפני הסחות, שליטה בדופמין ויכולת כניסה לעבודה עמוקה.\n\n**למה?** מיקוד הוא הכלי שמפריד בין אנשים שחולמים לבין אנשים שמבצעים.\n\n**מה נשאל?** שאלות על הרגלי ריכוז, מדיטציה, זמני מסך, עבודה עמוקה ועמידות קוגניטיבית.',
    en: '🎯 **Welcome to the Focus Scan**\n\nHere we measure your concentration capacity, distraction resistance, dopamine control, and deep work ability.\n\n**Why?** Focus is the tool that separates dreamers from executors.\n\n**What will we ask?** Questions about concentration habits, meditation, screen time, deep work, and cognitive endurance.',
  },
  power: {
    he: '💪 **ברוכים הבאים לסריקת עוצמה**\n\nכאן אנחנו מודדים את הכוח הפיזי שלך — כוח מקסימלי, כוח יחסי, מיומנויות קליסטניקס, כוח פיצוצי ועמידות מבנית.\n\n**למה?** הגוף שלך הוא הכלי הראשון. עוצמה פיזית משפיעה על ביטחון, נוכחות ויכולת פעולה.\n\n**מה נשאל?** שאלות על אימונים, הרמות, תרגילי משקל גוף, ספרינטים, קפיצות והחזקות.',
    en: '💪 **Welcome to the Power Scan**\n\nHere we measure your physical strength — max strength, relative strength, calisthenics skills, explosive power, and structural strength.\n\n**Why?** Your body is your first tool. Physical power affects confidence, presence, and capacity for action.\n\n**What will we ask?** Questions about training, lifts, bodyweight exercises, sprints, jumps, and holds.',
  },
  combat: {
    he: '⚔️ **ברוכים הבאים לסריקת לחימה**\n\nכאן אנחנו מודדים את יכולות הלחימה שלך — מכות, היאבקות, מהירות תגובה, כושר לחימתי ומודעות טקטית.\n\n**למה?** לחימה היא הביטוי הגולמי ביותר של שליטה עצמית תחת לחץ.\n\n**מה נשאל?** שאלות על ניסיון בלחימה, אימונים, יכולות טכניות, התמודדות עם לחץ ואסטרטגיה.',
    en: '⚔️ **Welcome to the Combat Scan**\n\nHere we measure your fighting capabilities — striking, grappling, reaction speed, combat conditioning, and tactical awareness.\n\n**Why?** Combat is the rawest expression of self-control under pressure.\n\n**What will we ask?** Questions about combat experience, training, technical abilities, pressure handling, and strategy.',
  },
  expansion: {
    he: '🧠 **ברוכים הבאים לסריקת התרחבות**\n\nכאן אנחנו מודדים את הצמיחה האינטלקטואלית שלך — למידה, יצירתיות, טווח אינטלקטואלי וחשיבה מורכבת.\n\n**למה?** התרחבות מנטלית היא מה שמפריד בין חיים שטוחים לחיים עם עומק.\n\n**מה נשאל?** שאלות על הרגלי למידה, יצירה, שפות, קריאה, סקרנות ויישום ידע.',
    en: '🧠 **Welcome to the Expansion Scan**\n\nHere we measure your intellectual growth — learning drive, creativity, intellectual range, and complex thinking.\n\n**Why?** Mental expansion is what separates a flat life from one with depth.\n\n**What will we ask?** Questions about learning habits, creation, languages, reading, curiosity, and knowledge application.',
  },
  consciousness: {
    he: '🔮 **ברוכים הבאים לסריקת תודעה**\n\nכאן אנחנו מודדים את רמת המודעות העצמית שלך — בהירות כוונה, מודעות למסכות, יציבות פנימית וקוהרנטיות.\n\n**למה?** תודעה היא השכבה העמוקה ביותר. בלעדיה, כל השאר הוא אוטופילוט.\n\n**מה נשאל?** שאלות על מודעות עצמית, אותנטיות, חיבור פנימי, בהירות כוונה ויישור פנימי.',
    en: '🔮 **Welcome to the Consciousness Scan**\n\nHere we measure your self-awareness level — intention clarity, mask awareness, inner stability, and coherence.\n\n**Why?** Consciousness is the deepest layer. Without it, everything else is autopilot.\n\n**What will we ask?** Questions about self-awareness, authenticity, inner connection, intention clarity, and inner alignment.',
  },
  presence: {
    he: '👁️ **ברוכים הבאים לסריקת נוכחות**\n\nכאן אנחנו מודדים את האימג\' החיצוני שלך — מבנה גוף, סטייל, טיפוח, יציבה ומודעות לתדמית.\n\n**למה?** הנוכחות שלך היא הדבר הראשון שאנשים קולטים. היא משדרת מי אתה לפני שאמרת מילה.\n\n**מה נשאל?** שאלות על סטייל, טיפוח, יציבה, הרכב גוף ומודעות עצמית חזותית. תוכל גם להעלות תמונות.',
    en: '👁️ **Welcome to the Presence Scan**\n\nHere we assess your external image — body composition, style, grooming, posture, and image awareness.\n\n**Why?** Your presence is the first thing people perceive. It communicates who you are before you say a word.\n\n**What will we ask?** Questions about style, grooming, posture, body composition, and visual self-awareness. You can also upload images.',
  },
  wealth: {
    he: '💰 **ברוכים הבאים לסריקת עושר**\n\nכאן אנחנו מודדים את המצב הפיננסי שלך — בהירות הכנסה, משמעת כלכלית, יצירת ערך ומיצוב אסטרטגי.\n\n**למה?** עושר הוא כלי לחופש. בלי שליטה פיננסית, אתה עבד למערכת.\n\n**מה נשאל?** שאלות על הכנסות, הוצאות, השקעות, מנטליות כלכלית ותכנון אסטרטגי.',
    en: '💰 **Welcome to the Wealth Scan**\n\nHere we assess your financial state — income clarity, financial discipline, value creation, and strategic positioning.\n\n**Why?** Wealth is a tool for freedom. Without financial control, you\'re enslaved to the system.\n\n**What will we ask?** Questions about income, expenses, investments, financial mindset, and strategic planning.',
  },
  influence: {
    he: '👑 **ברוכים הבאים לסריקת השפעה**\n\nכאן אנחנו מודדים את כוח ההשפעה שלך — תקשורת, נוכחות, מנהיגות, אינטליגנציה חברתית ושכנוע.\n\n**למה?** השפעה היא היכולת לזוז אנשים. בלעדיה, אתה בלתי נראה.\n\n**מה נשאל?** שאלות על יכולת דיבור, נוכחות בחדר, מנהיגות, קריאת אנשים ואותנטיות.',
    en: '👑 **Welcome to the Influence Scan**\n\nHere we measure your influence power — communication, presence, leadership, social intelligence, and persuasion.\n\n**Why?** Influence is the ability to move people. Without it, you\'re invisible.\n\n**What will we ask?** Questions about speaking ability, room presence, leadership, reading people, and authenticity.',
  },
  relationships: {
    he: '❤️ **ברוכים הבאים לסריקת מערכות יחסים**\n\nכאן אנחנו מודדים את איכות הקשרים שלך — עומק חיבור, גבולות, פגיעות, איכות רשת ויכולת קונפליקט.\n\n**למה?** מערכות יחסים הן המראה הכי אמיתית שלך. הן מגדירות את איכות החיים.\n\n**מה נשאל?** שאלות על קשרים קרובים, גבולות, פתיחות רגשית, קונפליקטים ואיזון בנתינה וקבלה.',
    en: '❤️ **Welcome to the Relationships Scan**\n\nHere we measure your connection quality — depth, boundaries, vulnerability, network quality, and conflict capacity.\n\n**Why?** Relationships are your truest mirror. They define your quality of life.\n\n**What will we ask?** Questions about close connections, boundaries, emotional openness, conflicts, and give-take balance.',
  },
  business: {
    he: '🏢 **ברוכים הבאים לסריקת עסק**\n\nכאן אנחנו מודדים את המצב העסקי שלך — בהירות, מנוע הכנסות, בשלות תפעולית ויכולת צמיחה.\n\n**למה?** העסק שלך הוא הביטוי של הערך שאתה יוצר בעולם.\n\n**מה נשאל?** שאלות על מודל עסקי, הכנסות, תפעול, מיצוב שוק וחוסן יזמי.',
    en: '🏢 **Welcome to the Business Scan**\n\nHere we assess your business state — clarity, revenue engine, operational maturity, and growth capacity.\n\n**Why?** Your business is the expression of the value you create in the world.\n\n**What will we ask?** Questions about business model, revenue, operations, market positioning, and founder resilience.',
  },
  projects: {
    he: '🔭 **ברוכים הבאים לסריקת פרויקטים**\n\nכאן אנחנו מודדים את יכולת הביצוע שלך — בהירות חזון, משמעת ביצוע, ניהול משאבים ושיעור השלמה.\n\n**למה?** פרויקטים הם הגשר בין חזון למציאות. בלי ביצוע, חלומות נשארים חלומות.\n\n**מה נשאל?** שאלות על פרויקטים פעילים, סדרי עדיפויות, התמודדות עם מכשולים ויכולת סיום.',
    en: '🔭 **Welcome to the Projects Scan**\n\nHere we measure your execution capacity — vision clarity, execution discipline, resource management, and completion rate.\n\n**Why?** Projects are the bridge between vision and reality. Without execution, dreams stay dreams.\n\n**What will we ask?** Questions about active projects, priorities, obstacle handling, and completion ability.',
  },
};

function isCoreDomain(domainId: string): boolean {
  return CORE_DOMAINS.some(d => d.id === domainId);
}

function getBasePath(domainId: string): string {
  return isCoreDomain(domainId) ? '/life' : '/arena';
}

interface Props {
  domainId: string;
  asModal?: boolean;
  onClose?: () => void;
}

export default function DomainAssessChat({ domainId, asModal, onClose }: Props) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { saveAssessment } = useDomainAssessment(domainId);

  const meta = DOMAIN_ASSESS_META[domainId];
  const domain = getDomainById(domainId);

  const isHe = language === 'he';

  // Build intro message for this domain
  const introText = DOMAIN_INTROS[domainId];
  const introMessage: ChatMessage | null = introText ? {
    id: 'intro-static',
    role: 'assistant',
    content: isHe ? introText.he : introText.en,
    created_at: new Date().toISOString(),
  } : null;

  const [messages, setMessages] = useState<ChatMessage[]>(introMessage ? [introMessage] : []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  // isHe already declared above
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
      if (asModal && onClose) {
        onClose();
      } else {
        navigate(`${getBasePath(domainId)}/${domainId}/results`);
      }
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

  const Wrapper = asModal ? 'div' : PageShell;

  if (saving) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{isHe ? 'מעבד תוצאות...' : 'Processing results...'}</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper className={asModal ? 'flex flex-col h-full' : undefined}>
      <div className={cn("flex flex-col", asModal ? "h-full" : "h-[calc(100vh-120px)]")} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header — Aurora style */}
        <div className="flex items-center gap-3 py-3 px-4 shrink-0 border-b border-border/30">
          {!asModal && (
            <Button variant="ghost" size="icon" onClick={() => navigate(getBasePath(domainId))} className="shrink-0">
              <BackIcon className="w-5 h-5" />
            </Button>
          )}
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
    </Wrapper>
  );
}
