/**
 * DomainAssessChat — Uses Aurora chat UI for domain assessments.
 * Streams messages from domain-assess edge function, extracts profile via tool call.
 * Messages are persisted to the database for continuity across sessions.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDomainAssessment } from '@/hooks/useDomainAssessment';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence } from 'framer-motion';
import AuroraChatMessage from '@/components/aurora/AuroraChatMessage';
import AuroraTypingIndicator from '@/components/aurora/AuroraTypingIndicator';
import AuroraChatInput from '@/components/aurora/AuroraChatInput';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import type { DomainAssessmentResult, Confidence } from '@/lib/domain-assess/types';
import { DOMAIN_ASSESS_META } from '@/lib/domain-assess/types';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
    he: '🔋 **ברוכים הבאים לסריקת חיוניות**\n\nכאן אנחנו בודקים את רמת האנרגיה, איכות השינה, התזונה וההתאוששות שלך — הבסיס הפיזיולוגי לכל השאר.\n\n**למה?** בלי חיוניות גבוהה, אין ביצועים. זה המנוע.\n\n**מה נשאל?** שאלות על שינה, תזונה, חומרים, אנרגיה יומית, התאוששות ויציבות קירקדית. ענה בכנות — אין תשובות נכונות או לא נכונות.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '🔋 **Welcome to the Vitality Scan**\n\nHere we assess your energy levels, sleep quality, nutrition, and recovery — the physiological foundation for everything else.\n\n**Why?** Without high vitality, there\'s no performance. This is your engine.\n\n**What will we ask?** Questions about sleep, nutrition, substances, daily energy, recovery, and circadian stability. Answer honestly — there are no right or wrong answers.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  focus: {
    he: '🎯 **ברוכים הבאים לסריקת מיקוד**\n\nכאן אנחנו מודדים את יכולת הריכוז, עמידות בפני הסחות, שליטה בדופמין ויכולת כניסה לעבודה עמוקה.\n\n**למה?** מיקוד הוא הכלי שמפריד בין אנשים שחולמים לבין אנשים שמבצעים.\n\n**מה נשאל?** שאלות על הרגלי ריכוז, מדיטציה, זמני מסך, עבודה עמוקה ועמידות קוגניטיבית.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '🎯 **Welcome to the Focus Scan**\n\nHere we measure your concentration capacity, distraction resistance, dopamine control, and deep work ability.\n\n**Why?** Focus is the tool that separates dreamers from executors.\n\n**What will we ask?** Questions about concentration habits, meditation, screen time, deep work, and cognitive endurance.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  power: {
    he: '💪 **ברוכים הבאים לסריקת עוצמה**\n\nכאן אנחנו מודדים את הכוח הפיזי שלך — כוח מקסימלי, כוח יחסי, מיומנויות קליסטניקס, כוח פיצוצי ועמידות מבנית.\n\n**למה?** הגוף שלך הוא הכלי הראשון. עוצמה פיזית משפיעה על ביטחון, נוכחות ויכולת פעולה.\n\n**מה נשאל?** שאלות על אימונים, הרמות, תרגילי משקל גוף, ספרינטים, קפיצות והחזקות.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '💪 **Welcome to the Power Scan**\n\nHere we measure your physical strength — max strength, relative strength, calisthenics skills, explosive power, and structural strength.\n\n**Why?** Your body is your first tool. Physical power affects confidence, presence, and capacity for action.\n\n**What will we ask?** Questions about training, lifts, bodyweight exercises, sprints, jumps, and holds.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  combat: {
    he: '⚔️ **ברוכים הבאים לסריקת לחימה**\n\nכאן אנחנו מודדים את יכולות הלחימה שלך — מכות, היאבקות, מהירות תגובה, כושר לחימתי ומודעות טקטית.\n\n**למה?** לחימה היא הביטוי הגולמי ביותר של שליטה עצמית תחת לחץ.\n\n**מה נשאל?** שאלות על ניסיון בלחימה, אימונים, יכולות טכניות, התמודדות עם לחץ ואסטרטגיה.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '⚔️ **Welcome to the Combat Scan**\n\nHere we measure your fighting capabilities — striking, grappling, reaction speed, combat conditioning, and tactical awareness.\n\n**Why?** Combat is the rawest expression of self-control under pressure.\n\n**What will we ask?** Questions about combat experience, training, technical abilities, pressure handling, and strategy.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  expansion: {
    he: '🧠 **ברוכים הבאים לסריקת התרחבות**\n\nכאן אנחנו מודדים את הצמיחה האינטלקטואלית שלך — למידה, יצירתיות, טווח אינטלקטואלי וחשיבה מורכבת.\n\n**למה?** התרחבות מנטלית היא מה שמפריד בין חיים שטוחים לחיים עם עומק.\n\n**מה נשאל?** שאלות על הרגלי למידה, יצירה, שפות, קריאה, סקרנות ויישום ידע.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '🧠 **Welcome to the Expansion Scan**\n\nHere we measure your intellectual growth — learning drive, creativity, intellectual range, and complex thinking.\n\n**Why?** Mental expansion is what separates a flat life from one with depth.\n\n**What will we ask?** Questions about learning habits, creation, languages, reading, curiosity, and knowledge application.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  consciousness: {
    he: '🔮 **ברוכים הבאים לסריקת תודעה**\n\nכאן אנחנו מודדים את רמת המודעות העצמית שלך — בהירות כוונה, מודעות למסכות, יציבות פנימית וקוהרנטיות.\n\n**למה?** תודעה היא השכבה העמוקה ביותר. בלעדיה, כל השאר הוא אוטופילוט.\n\n**מה נשאל?** שאלות על מודעות עצמית, אותנטיות, חיבור פנימי, בהירות כוונה ויישור פנימי.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '🔮 **Welcome to the Consciousness Scan**\n\nHere we measure your self-awareness level — intention clarity, mask awareness, inner stability, and coherence.\n\n**Why?** Consciousness is the deepest layer. Without it, everything else is autopilot.\n\n**What will we ask?** Questions about self-awareness, authenticity, inner connection, intention clarity, and inner alignment.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  presence: {
    he: '👁️ **ברוכים הבאים לסריקת נוכחות**\n\nכאן אנחנו מודדים את האימג\' החיצוני שלך — מבנה גוף, סטייל, טיפוח, יציבה ומודעות לתדמית.\n\n**למה?** הנוכחות שלך היא הדבר הראשון שאנשים קולטים. היא משדרת מי אתה לפני שאמרת מילה.\n\n**מה נשאל?** שאלות על סטייל, טיפוח, יציבה, הרכב גוף ומודעות עצמית חזותית. תוכל גם להעלות תמונות.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '👁️ **Welcome to the Presence Scan**\n\nHere we assess your external image — body composition, style, grooming, posture, and image awareness.\n\n**Why?** Your presence is the first thing people perceive. It communicates who you are before you say a word.\n\n**What will we ask?** Questions about style, grooming, posture, body composition, and visual self-awareness. You can also upload images.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  wealth: {
    he: '💰 **ברוכים הבאים לסריקת עושר**\n\nכאן אנחנו מודדים את המצב הפיננסי שלך — בהירות הכנסה, משמעת כלכלית, יצירת ערך ומיצוב אסטרטגי.\n\n**למה?** עושר הוא כלי לחופש. בלי שליטה פיננסית, אתה עבד למערכת.\n\n**מה נשאל?** שאלות על הכנסות, הוצאות, השקעות, מנטליות כלכלית ותכנון אסטרטגי.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '💰 **Welcome to the Wealth Scan**\n\nHere we assess your financial state — income clarity, financial discipline, value creation, and strategic positioning.\n\n**Why?** Wealth is a tool for freedom. Without financial control, you\'re enslaved to the system.\n\n**What will we ask?** Questions about income, expenses, investments, financial mindset, and strategic planning.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  influence: {
    he: '👑 **ברוכים הבאים לסריקת השפעה**\n\nכאן אנחנו מודדים את כוח ההשפעה שלך — תקשורת, נוכחות, מנהיגות, אינטליגנציה חברתית ושכנוע.\n\n**למה?** השפעה היא היכולת לזוז אנשים. בלעדיה, אתה בלתי נראה.\n\n**מה נשאל?** שאלות על יכולת דיבור, נוכחות בחדר, מנהיגות, קריאת אנשים ואותנטיות.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '👑 **Welcome to the Influence Scan**\n\nHere we measure your influence power — communication, presence, leadership, social intelligence, and persuasion.\n\n**Why?** Influence is the ability to move people. Without it, you\'re invisible.\n\n**What will we ask?** Questions about speaking ability, room presence, leadership, reading people, and authenticity.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  relationships: {
    he: '❤️ **ברוכים הבאים לסריקת מערכות יחסים**\n\nכאן אנחנו מודדים את איכות הקשרים שלך — עומק חיבור, גבולות, פגיעות, איכות רשת ויכולת קונפליקט.\n\n**למה?** מערכות יחסים הן המראה הכי אמיתית שלך. הן מגדירות את איכות החיים.\n\n**מה נשאל?** שאלות על קשרים קרובים, גבולות, פתיחות רגשית, קונפליקטים ואיזון בנתינה וקבלה.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '❤️ **Welcome to the Relationships Scan**\n\nHere we measure your connection quality — depth, boundaries, vulnerability, network quality, and conflict capacity.\n\n**Why?** Relationships are your truest mirror. They define your quality of life.\n\n**What will we ask?** Questions about close connections, boundaries, emotional openness, conflicts, and give-take balance.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  business: {
    he: '🏢 **ברוכים הבאים לסריקת עסק**\n\nכאן אנחנו מודדים את המצב העסקי שלך — בהירות, מנוע הכנסות, בשלות תפעולית ויכולת צמיחה.\n\n**למה?** העסק שלך הוא הביטוי של הערך שאתה יוצר בעולם.\n\n**מה נשאל?** שאלות על מודל עסקי, הכנסות, תפעול, מיצוב שוק וחוסן יזמי.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '🏢 **Welcome to the Business Scan**\n\nHere we assess your business state — clarity, revenue engine, operational maturity, and growth capacity.\n\n**Why?** Your business is the expression of the value you create in the world.\n\n**What will we ask?** Questions about business model, revenue, operations, market positioning, and founder resilience.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  projects: {
    he: '🔭 **ברוכים הבאים לסריקת פרויקטים**\n\nכאן אנחנו מודדים את יכולת הביצוע שלך — בהירות חזון, משמעת ביצוע, ניהול משאבים ושיעור השלמה.\n\n**למה?** פרויקטים הם הגשר בין חזון למציאות. בלי ביצוע, חלומות נשארים חלומות.\n\n**מה נשאל?** שאלות על פרויקטים פעילים, סדרי עדיפויות, התמודדות עם מכשולים ויכולת סיום.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '🔭 **Welcome to the Projects Scan**\n\nHere we measure your execution capacity — vision clarity, execution discipline, resource management, and completion rate.\n\n**Why?** Projects are the bridge between vision and reality. Without execution, dreams stay dreams.\n\n**What will we ask?** Questions about active projects, priorities, obstacle handling, and completion ability.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  play: {
    he: '🎮 **ברוכים הבאים לסריקת משחק והתחדשות**\n\nכאן אנחנו מודדים את יכולת ההתחדשות שלך — תדירות משחק, יכולת שמחה, מגוון פעילויות, מנוחה ללא אשמה וחיבור גופני.\n\n**למה?** משחק הוא לא מותרות — הוא תרופה. בלי התחדשות מכוונת, שחיקה בלתי נמנעת.\n\n**מה נשאל?** שאלות על תחביבים, טיולים, ספורט כיפי, חיי חברה, הרפתקאות, גיימינג וכל מה שמשמח אותך.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '🎮 **Welcome to the Play & Regeneration Scan**\n\nHere we measure your regeneration capacity — play frequency, joy capacity, activity variety, guilt-free rest, and somatic connection.\n\n**Why?** Play isn\'t luxury — it\'s medicine. Without intentional regeneration, burnout is inevitable.\n\n**What will we ask?** Questions about hobbies, trips, fun sports, social life, adventures, gaming, and everything that brings you joy.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
  order: {
    he: '✨ **ברוכים הבאים לסריקת סדר וניקיון**\n\nכאן אנחנו מודדים את רמת הסדר בחיים שלך — ניקיון הסביבה, ארגון מערכות, סדר דיגיטלי, עקביות שגרה ומינימליזם.\n\n**למה?** סביבה מסודרת = מוח מסודר. סדר חיצוני משפיע ישירות על בהירות פנימית, פרודוקטיביות ושליטה.\n\n**מה נשאל?** שאלות על ניקיון הבית, ארגון חפצים, סדר דיגיטלי, שגרות ניקיון, מינימליזם ושליטה בסביבה.\n\n🔒 *כל המידע שלך מאובטח ושמור רק עבורך. שום דבר לא דולף החוצה.*',
    en: '✨ **Welcome to the Order & Cleanliness Scan**\n\nHere we measure your environmental mastery — space cleanliness, system organization, digital order, routine consistency, and minimalism clarity.\n\n**Why?** An ordered environment = an ordered mind. External order directly impacts internal clarity, productivity, and control.\n\n**What will we ask?** Questions about home cleanliness, item organization, digital order, cleaning routines, minimalism, and environmental mastery.\n\n🔒 *All your data is encrypted and stored securely — only you can access it.*',
  },
};

function isCoreDomain(domainId: string): boolean {
  return CORE_DOMAINS.some(d => d.id === domainId);
}

function getBasePath(_domainId: string): string {
  return '/life';
}

interface Props {
  domainId: string;
  asModal?: boolean;
  asDock?: boolean;
  dockHeightVh?: number;
  onClose?: () => void;
}

export default function DomainAssessChat({ domainId, asModal, asDock, dockHeightVh, onClose }: Props) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { setLanguage } = useLanguage();
  const { saveAssessment } = useDomainAssessment(domainId);
  const { user } = useAuth();

  const meta = DOMAIN_ASSESS_META[domainId];
  const domain = getDomainById(domainId);

  const isHe = language === 'he';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  let msgCounter = useRef(0);
  const startedRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // ─── DB persistence helpers ───
  const saveMessageToDB = useCallback(async (convId: string, role: 'user' | 'assistant', content: string) => {
    if (!user?.id) return;
    await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: role === 'user' ? user.id : null,
      content,
      is_ai_message: role === 'assistant',
    });
  }, [user?.id]);

  // ─── Load or create conversation + history ───
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const init = async () => {
      // Get or create pillar conversation
      const { data: convId, error: convErr } = await supabase.rpc('get_or_create_pillar_conversation', {
        p_user_id: user.id,
        p_pillar: domainId,
      });

      if (convErr || !convId) {
        console.error('Failed to get pillar conversation:', convErr);
        setLoadingHistory(false);
        return;
      }

      if (cancelled) return;
      setConversationId(convId);

      // Fetch existing messages
      const { data: existing, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (cancelled) return;

      if (!msgErr && existing && existing.length > 0) {
        // Filter out any previously saved intro messages — we render them dynamically
        const loaded: ChatMessage[] = existing
          .filter((m: any) => {
            // Skip saved intro messages (first assistant message that matches an intro pattern)
            if (m.is_ai_message && existing.indexOf(m) === 0) {
              const introText = DOMAIN_INTROS[domainId];
              if (introText && (m.content === introText.he || m.content === introText.en)) {
                return false;
              }
            }
            return true;
          })
          .map((m: any) => ({
            id: m.id,
            role: m.is_ai_message ? 'assistant' as const : 'user' as const,
            content: m.content,
            created_at: m.created_at,
          }));
        msgCounter.current = loaded.length;
        setMessages(loaded);
        if (loaded.length > 0) {
          setStarted(true);
          startedRef.current = true;
        }
      }
      // No else — intro is always rendered dynamically based on current language
      setLoadingHistory(false);
    };

    init();
    return () => { cancelled = true; };
  }, [user?.id, domainId, saveMessageToDB]);

  const handleToolCall = useCallback(async (toolArgs: any) => {
    const subscores = toolArgs.subscores as Record<string, number>;
    const subsystems = meta.subsystems;

    let domain_index = 0;
    for (const sub of subsystems) {
      domain_index += (subscores[sub.id] ?? 0) * sub.weight;
    }
    domain_index = Math.round(domain_index);

    // Build full result including willingness + domain_metrics (Phase 2: save full payload)
    const result: DomainAssessmentResult = {
      assessed_at: new Date().toISOString(),
      domain_index,
      confidence: toolArgs.confidence as Confidence,
      subscores,
      findings: toolArgs.findings ?? [],
      mirror_statement: toolArgs.mirror_statement,
      one_next_step: toolArgs.one_next_step,
      selected_focus_items: [],
      // Preserve willingness + domain_metrics for plan generation
      willingness: toolArgs.willingness ?? { willing_to_do: [], not_willing_to_do: [] },
      ...(toolArgs.domain_metrics ? { [`${domainId}_metrics`]: toolArgs.domain_metrics, domain_metrics: toolArgs.domain_metrics } : {}),
    };

    setSaving(true);
    try {
      await saveAssessment(result);
      if ((asModal || asDock) && onClose) {
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
          if (!choice) continue;

          // Check for tool call
          const toolCall = choice.delta?.tool_calls?.[0];
          if (toolCall) {
            isToolCallFlag = true;
            if (toolCall.function?.arguments) {
              toolCallArgs += toolCall.function.arguments;
            }
            continue;
          }

          // Regular content
          const content = choice.delta?.content as string | undefined;
          if (content) onDelta(content);

          // If finish_reason is 'tool_calls', process accumulated args
          if (choice.finish_reason === 'tool_calls' && toolCallArgs) {
            try {
              const args = JSON.parse(toolCallArgs);
              onToolCall(args);
            } catch (pe) {
              console.error('Failed to parse tool args:', pe, toolCallArgs);
            }
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore partial leftovers */ }
      }
    }

    // Handle tool call that finished without explicit finish_reason
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
      id: `assess-ai-${msgCounter.current}`,
      role: 'assistant',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    // Save to DB
    if (conversationId) {
      saveMessageToDB(conversationId, 'assistant', content);
    }
    // Emit event for voice mode auto-play
    window.dispatchEvent(new CustomEvent('aurora:response', { detail: { text: content } }));
  }, [conversationId, saveMessageToDB]);

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
  }, [language, handleToolCall, addAssistantMessage]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    msgCounter.current += 1;
    const userMsg: ChatMessage = {
      id: `assess-user-${msgCounter.current}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    const updated = [...messagesRef.current, userMsg];
    setMessages(updated);

    // Save user message to DB
    if (conversationId) {
      saveMessageToDB(conversationId, 'user', text);
    }

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
  }, [isStreaming, handleToolCall, addAssistantMessage, conversationId, saveMessageToDB]);

  // Auto-start only after history is loaded and no existing messages
  useEffect(() => {
    if (!loadingHistory && !startedRef.current && conversationId) {
      startConversation();
    }
  }, [loadingHistory, conversationId, startConversation]);

  const Icon = domain?.icon;

  const Wrapper = asDock ? 'div' : asModal ? 'div' : PageShell;
  const isEmbedded = asModal || asDock;
  const embeddedHeightClass = asDock ? '' : 'h-full';

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

  if (loadingHistory) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{isHe ? 'טוען שיחה...' : 'Loading chat...'}</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper className={isEmbedded ? cn('flex flex-col', embeddedHeightClass) : undefined}>
      <div
        className={cn("flex flex-col", isEmbedded ? embeddedHeightClass : "h-[calc(100vh-120px)]")}
        style={asDock && dockHeightVh ? { height: `${dockHeightVh}vh` } : undefined}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header — Aurora style */}
        <div className="flex items-center gap-3 py-3 px-4 shrink-0 border-b border-border/30">
          {!asModal && !asDock && (
            <Button variant="ghost" size="icon" onClick={() => navigate(getBasePath(domainId))} className="shrink-0">
              <BackIcon className="w-5 h-5" />
            </Button>
          )}
          <AuroraHoloOrb size={32} glow="subtle" />
          <div className="flex-1">
            <h1 className="text-sm font-bold text-foreground">
              {isHe ? 'אורורה' : 'Aurora'}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {isHe ? (domain?.labelHe ?? domainId) : (domain?.labelEn ?? domainId)}
            </p>
          </div>
          <button
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-medium flex items-center gap-1"
            aria-label="Switch language"
          >
            <Globe className="w-4 h-4" />
            {language === 'he' ? 'EN' : 'עב'}
          </button>

        {/* Chat messages — Aurora style */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
            <div className="space-y-6">
              {/* Dynamic intro — always rendered in current language */}
              {DOMAIN_INTROS[domainId] && (
                <AuroraChatMessage
                  key={`intro-${language}`}
                  id={`intro-${language}`}
                  content={isHe ? DOMAIN_INTROS[domainId].he : DOMAIN_INTROS[domainId].en}
                  isOwn={false}
                  isAI
                  timestamp={new Date().toISOString()}
                />
              )}

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

        {/* Input — Aurora style (hidden when docked, uses root GlobalChatInput instead) */}
        {!asDock && <AuroraChatInput onSend={sendMessage} disabled={isStreaming} bypassLimits={asModal} />}
      </div>
    </Wrapper>
  );
}
