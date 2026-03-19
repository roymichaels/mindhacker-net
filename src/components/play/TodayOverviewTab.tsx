/**
 * TodayOverviewTab — Adventure-game styled mission card with today's task roadmap.
 * Content dynamically updates based on selected task node.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import {
  Crosshair, CheckCircle2, Zap, Target,
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

/* ── Pillar visuals ── */
const PILLAR_VIS: Record<string, { emoji: string; color: string; bg: string; labelHe: string; labelEn: string }> = {
  vitality:      { emoji: '❤️‍🔥', color: 'text-rose-400',    bg: 'bg-rose-500/15',    labelHe: 'חיוניות',       labelEn: 'Vitality' },
  power:         { emoji: '⚡',    color: 'text-orange-400',  bg: 'bg-orange-500/15',  labelHe: 'כוח',           labelEn: 'Power' },
  focus:         { emoji: '🧠',    color: 'text-sky-400',     bg: 'bg-sky-500/15',     labelHe: 'מיקוד',         labelEn: 'Focus' },
  wealth:        { emoji: '💎',    color: 'text-emerald-400', bg: 'bg-emerald-500/15', labelHe: 'עושר',          labelEn: 'Wealth' },
  consciousness: { emoji: '✨',   color: 'text-violet-400',  bg: 'bg-violet-500/15',  labelHe: 'תודעה',         labelEn: 'Consciousness' },
  combat:        { emoji: '🥊',    color: 'text-red-400',     bg: 'bg-red-500/15',     labelHe: 'לחימה',         labelEn: 'Combat' },
  expansion:     { emoji: '🌀',    color: 'text-indigo-400',  bg: 'bg-indigo-500/15',  labelHe: 'התרחבות',       labelEn: 'Expansion' },
  influence:     { emoji: '📡',    color: 'text-amber-400',   bg: 'bg-amber-500/15',   labelHe: 'השפעה',         labelEn: 'Influence' },
  relationships: { emoji: '🤝',    color: 'text-pink-400',    bg: 'bg-pink-500/15',    labelHe: 'מערכות יחסים', labelEn: 'Relationships' },
  business:      { emoji: '🚀',    color: 'text-cyan-400',    bg: 'bg-cyan-500/15',    labelHe: 'עסקים',         labelEn: 'Business' },
  projects:      { emoji: '🔧',    color: 'text-teal-400',    bg: 'bg-teal-500/15',    labelHe: 'פרויקטים',     labelEn: 'Projects' },
};
const DEFAULT_PILLAR = { emoji: '🎯', color: 'text-primary', bg: 'bg-primary/15', labelHe: 'כללי', labelEn: 'General' };

/* ── Directives ── */
const DIRECTIVES_EN = [
  'Agent — this is not a to-do list. This is your identity test for today.',
  'No drama. No excuses. Precision execution wins this day.',
  'Your mission: act before doubt gets a vote.',
];
const DIRECTIVES_HE = [
  'סוכן — זו לא רשימת משימות. זה מבחן הזהות שלך להיום.',
  'בלי דרמה, בלי תירוצים — ביצוע מדויק מנצח את היום.',
  'המשימה שלך: לפעול לפני שהספק מקבל זכות דיבור.',
];

/* ── Rich per-pillar content ── */
const FIELD_ASSESSMENT: Record<string, { en: string[]; he: string[] }> = {
  vitality: {
    en: [
      "Today's theater centers on Vitality. Your body is the vehicle for every mission that follows. Without physical readiness, strategic capacity collapses. The operators who last are the ones who treated their body like a weapon system — maintained, calibrated, deployed with intent.",
      "The field report is clear: physical readiness determines operational capacity. Every system in your life — mental clarity, emotional resilience, creative output — is downstream of how you treat the machine.",
    ],
    he: [
      "זירת היום: חיוניות. הגוף הוא הכלי לכל משימה שתבוא. בלי מוכנות פיזית, הקיבולת האסטרטגית קורסת. המבצעים שמחזיקים מעמד הם אלה שהתייחסו לגוף שלהם כמערכת נשק — מתוחזקת, מכוילת, נפרסת בכוונה.",
      "דוח השטח ברור: מוכנות פיזית קובעת קיבולת מבצעית. כל מערכת בחיים שלך — בהירות מנטלית, חוסן רגשי, תפוקה יצירתית — נמצאת במורד הזרם של איך שאתה מתייחס למכונה.",
    ],
  },
  focus: {
    en: [
      "Cognitive operations are the priority. Your mind is the command center — and today it needs to run clean. Distractions are hostile agents. Every notification is an extraction attempt on your most valuable asset: sustained attention.",
      "Today's briefing: deep work is the weapon. The battlefield is your attention span. One hour of locked-in focus produces more strategic output than an entire day of scattered effort.",
    ],
    he: [
      "מבצעים קוגניטיביים בעדיפות עליונה. המוח הוא מרכז הפיקוד — והיום הוא צריך לרוץ נקי. הסחות דעת הן סוכנים עוינים. כל התראה היא ניסיון חילוץ של הנכס היקר ביותר שלך.",
      "תדריך היום: עבודה עמוקה היא הנשק. שדה הקרב הוא טווח הקשב שלך. שעה אחת של מיקוד נעול מייצרת יותר תפוקה אסטרטגית מיום שלם של מאמץ מפוזר.",
    ],
  },
  wealth: {
    en: [
      "Economic theater is active. Today's objective: create asymmetric value. The operators who build wealth don't chase money — they build systems that generate it while they sleep. Think in decades, execute in hours.",
      "Financial intelligence report: resources flow toward clarity and decisive action. Indecision is the most expensive habit. Today's mission: create something worth more than the time it took to build it.",
    ],
    he: [
      "הזירה הכלכלית פעילה. יעד היום: ליצור ערך אסימטרי. המבצעים שבונים עושר לא רודפים אחרי כסף — הם בונים מערכות שמייצרות אותו בזמן שהם ישנים.",
      "דוח מודיעין פיננסי: משאבים זורמים לכיוון בהירות ופעולה החלטית. חוסר החלטיות הוא ההרגל היקר ביותר. המשימה: לייצר משהו ששווה יותר מהזמן שלקח לבנות אותו.",
    ],
  },
  power: {
    en: [
      "Power operations are live. Raw capacity building is today's mission. Strength is not about dominance — it's about having reserves when the world demands everything. The agent who trains when it's inconvenient performs when it matters.",
      "Power is the foundation pillar. Without raw physical and mental capacity, every other domain operates at a deficit. Today you're depositing into the account that funds everything else.",
    ],
    he: [
      "מבצעי כוח פעילים. בניית קיבולת גולמית היא משימת היום. כוח הוא לא שליטה — הוא לגבות רזרבות כשהעולם דורש הכל.",
      "כוח הוא עמוד התווך הבסיסי. בלי קיבולת פיזית ומנטלית גולמית, כל תחום אחר פועל בגירעון. היום אתה מפקיד בחשבון שמממן הכל.",
    ],
  },
  consciousness: {
    en: [
      "Inner reconnaissance is the mission. Today's terrain is internal. The most dangerous blind spots are inside — assumptions you've never questioned, patterns you've never named, reactions you've mistaken for choices.",
      "Consciousness work is not soft — it's the hardest theater of operation. Anyone can lift a weight. But sitting with the truth about yourself requires a different kind of courage entirely.",
    ],
    he: [
      "סיור פנימי הוא המשימה. שטח היום הוא פנימי. הנקודות העיוורות המסוכנות ביותר הן הפנימיות — הנחות שמעולם לא הטלת בהן ספק, דפוסים שמעולם לא קראת להם בשם.",
      "עבודת תודעה היא לא רכה — היא התיאטרון הקשה ביותר של המבצע. כל אחד יכול להרים משקל. אבל לשבת עם האמת על עצמך דורש סוג אחר לגמרי של אומץ.",
    ],
  },
  combat: {
    en: ["Combat readiness check. The body remembers what the mind forgets. Every drill, every controlled breath under pressure is a deposit into your operational bank. When the real moment comes, you'll fall to your level of training."],
    he: ["בדיקת מוכנות קרבית. הגוף זוכר מה שהמוח שוכח. כל תרגיל, כל נשימה מבוקרת תחת לחץ היא הפקדה בבנק המבצעי שלך. כשהרגע האמיתי יגיע, תיפול לרמת האימון שלך."],
  },
  expansion: {
    en: ["Expansion operations are live. Growth doesn't happen in the comfort zone — it happens at the edge. Today's mission: push one boundary you've been avoiding. The discomfort is not a warning — it's a signal you're in the right place."],
    he: ["מבצעי התרחבות חיים. צמיחה לא קורית באזור הנוחות — היא קורית בקצה. משימת היום: לדחוף גבול אחד שנמנעת ממנו. אי הנוחות היא לא אזהרה — היא אות שאתה במקום הנכון."],
  },
  influence: {
    en: ["Influence theater is active. True influence is not about volume — it's about signal clarity. Today's objective: communicate one idea with such precision that it changes how someone thinks."],
    he: ["זירת ההשפעה פעילה. השפעה אמיתית היא לא עניין של ווליום — היא עניין של בהירות אות. יעד היום: לתקשר רעיון אחד בדיוק כזה שישנה את הצורה שמישהו חושב."],
  },
  relationships: {
    en: ["Relational intelligence is today's focus. The strongest operators know: isolation is a vulnerability, not a strength. Today's mission is connection — one authentic conversation, one moment of real presence."],
    he: ["אינטליגנציה יחסית היא המיקוד של היום. המבצעים החזקים ביותר יודעים: בידוד הוא פגיעות, לא חוזק. משימת היום היא חיבור — שיחה אותנטית אחת, רגע נוכחות אחד אמיתי."],
  },
  business: {
    en: ["Business operations are hot. Every minute in meetings without outcomes is donated to entropy. Ship something. Decide something. Move the needle on one metric that matters."],
    he: ["מבצעים עסקיים לוהטים. כל דקה שמבלים בפגישות בלי תוצאות היא דקה שנתרמה לאנטרופיה. שלח משהו. החלט משהו. הזז את המחוג במדד אחד שחשוב."],
  },
  projects: {
    en: ["Project operations in effect. The difference between a dream and a project is a deadline and a next action. Today: advance one project by one concrete step. Not planning. Executing."],
    he: ["מבצעי פרויקטים בתוקף. ההבדל בין חלום לפרויקט הוא דדליין ופעולה הבאה. היום: להתקדם בפרויקט אחד בצעד אחד קונקרטי. לא תכנון. ביצוע."],
  },
};
const DEFAULT_ASSESSMENT_EN = ["Operations are live. The mission parameters are set. All that remains is execution. The plan is clear — close the gap between intention and action. The briefing is over. Move."];
const DEFAULT_ASSESSMENT_HE = ["המבצעים חיים. פרמטרי המשימה נקבעו. כל מה שנותר הוא ביצוע. התוכנית ברורה — סגור את הפער בין כוונה לפעולה. התדריך הסתיים. זוז."];

const DOCTRINE: Record<string, { en: string[]; he: string[] }> = {
  vitality: { en: ["No negotiation with comfort. Execute before the mind builds its case. The body doesn't need permission — it needs direction."], he: ["אין משא ומתן עם הנוחות. בצע לפני שהמוח בונה את הטיעון שלו. הגוף לא צריך רשות — הוא צריך כיוון."] },
  focus: { en: ["One thread at a time. Multitasking is a myth sold to the undisciplined. Guard your attention like it's the last resource on earth."], he: ["חוט אחד בכל פעם. ריבוי משימות הוא מיתוס שנמכר לחסרי משמעת. שמור על הקשב שלך כאילו הוא המשאב האחרון עלי אדמות."] },
  wealth: { en: ["Value first, revenue follows. Never chase — position and let it come. The wealthy don't hustle harder — they think clearer."], he: ["ערך קודם, הכנסה עוקבת. לעולם אל תרדוף — מקם ותן לזה להגיע. העשירים לא עובדים יותר קשה — הם חושבים יותר ברור."] },
  power: { en: ["Discomfort is the price of admission. Pay it daily or forfeit the seat. Strength is borrowed from the future version of you — today's session is the payment."], he: ["אי נוחות היא דמי הכניסה. שלם יומי או ותר על המקום. כוח מושאל מהגרסה העתידית שלך — אימון היום הוא התשלום."] },
  consciousness: { en: ["Silence is not empty — it's where the signal lives. The noise of daily life drowns the most important intelligence. Today, you tune in."], he: ["שקט הוא לא ריק — שם חי האות. הרעש של החיים היומיומיים מטביע את המודיעין החשוב ביותר. היום, אתה מכוונן."] },
  combat: { en: ["Train like the fight is tomorrow. Because one day, it will be. And you won't get to choose when."], he: ["תתאמן כאילו הקרב מחר. כי יום אחד, הוא יהיה. ולא תוכל לבחור מתי."] },
  expansion: { en: ["Growth is not optional — it's the cost of staying relevant. Stagnation is slow decay wearing a comfortable mask."], he: ["צמיחה היא לא אופציונלית — היא המחיר של להישאר רלוונטי. קיפאון הוא ריקבון איטי שלובש מסכה נוחה."] },
  influence: { en: ["Speak less. Mean more. The most powerful signal is the one people can't ignore — because it's true."], he: ["דבר פחות. התכוון ליותר. האות החזק ביותר הוא זה שאנשים לא יכולים להתעלם ממנו — כי הוא אמיתי."] },
  relationships: { en: ["Vulnerability is not weakness — it's the highest-level access protocol. Without it, you're operating alone."], he: ["פגיעות היא לא חולשה — היא פרוטוקול הגישה ברמה הגבוהה ביותר. בלעדיה, אתה פועל לבד."] },
  business: { en: ["Ship beats perfect. A decision today is worth more than a perfect plan next week. Velocity is the ultimate advantage."], he: ["שליחה מנצחת מושלם. החלטה היום שווה יותר מתוכנית מושלמת בשבוע הבא. מהירות היא היתרון האולטימטיבי."] },
  projects: { en: ["Progress is the project looking different at the end of the day than it did at the start. Everything else is theater."], he: ["התקדמות היא שהפרויקט נראה אחרת בסוף היום ממה שנראה בהתחלה. כל השאר הוא תיאטרון."] },
};
const DEFAULT_DOCTRINE_EN = ["Hesitation is a decision — and it's always the wrong one. The gap between knowing and doing is where dreams go to die."];
const DEFAULT_DOCTRINE_HE = ["היסוס הוא החלטה — והיא תמיד הלא נכונה. הפער בין לדעת ולעשות הוא המקום שבו חלומות הולכים למות."];

const INTEL_NOTES: Record<string, { en: string[]; he: string[] }> = {
  vitality: { en: ["20 minutes of high-output movement rewires threat assessment for the next 8 hours. Cortisol, decision quality, stress tolerance — all shift after a single session. This is operational intelligence."], he: ["20 דקות של תנועה בעצימות גבוהה משנות הערכת איום ל-8 השעות הבאות. קורטיזול, איכות החלטות, סבילות לחץ — הכל משתנה אחרי מפגש אחד. זה מודיעין מבצעי."] },
  focus: { en: ["A single 90-minute deep work block produces more strategic output than 8 hours of reactive task-switching. Protect the block. Kill notifications. Stay in the zone."], he: ["בלוק עבודה עמוקה אחד של 90 דקות מייצר יותר תפוקה מ-8 שעות של מיתוג משימות. הגן על הבלוק. הרוג התראות. תישאר בזון."] },
  wealth: { en: ["Compound returns apply to skills, relationships, and reputation — not just capital. Every day of real value investment pays dividends for decades."], he: ["תשואה מצטברת חלה על מיומנויות, מערכות יחסים ומוניטין — לא רק על הון. כל יום של השקעה בערך אמיתי משלם דיבידנדים לעשרות שנים."] },
  power: { en: ["Strength gains are neurological before they're muscular. The first 4 weeks are your brain learning to recruit more muscle fiber. Consistency here is everything."], he: ["רווחי כוח הם נוירולוגיים לפני שהם שריריים. 4 השבועות הראשונים הם המוח שלומד לגייס יותר סיבי שריר. עקביות כאן היא הכל."] },
  consciousness: { en: ["10 minutes of daily introspection improves decision-making accuracy by up to 30%. The ROI on self-awareness is the highest in your entire portfolio."], he: ["10 דקות התבוננות פנימית יומית משפרות דיוק קבלת החלטות בעד 30%. התשואה על מודעות עצמית היא הגבוהה ביותר בפורטפוליו שלך."] },
  combat: { en: ["Martial training reduces cortisol baseline by 23% over 8 weeks. It's controlled response under pressure — a skill that transfers everywhere."], he: ["אימון לחימה מפחית קורטיזול בסיסי ב-23% על פני 8 שבועות. תגובה מבוקרת תחת לחץ — מיומנות שמתורגמת לכל מקום."] },
};
const DEFAULT_INTEL_EN = ["Your best days share one trait — you started before you felt ready. Readiness is a feeling. Starting is a decision. The operators who win make decisions, not excuses."];
const DEFAULT_INTEL_HE = ["לימים הטובים ביותר שלך יש תכונה אחת משותפת — התחלת לפני שהרגשת מוכן. מוכנות היא תחושה. התחלה היא החלטה. המבצעים שמנצחים מקבלים החלטות, לא תירוצים."];

const COMMANDER_EN = ["End of briefing. Execute with precision. Dismissed.","Field is live. No further instructions required. Move.","The mission doesn't wait for motivation. Neither do you."];
const COMMANDER_HE = ["סוף תדריך. בצע בדייקנות. שוחרר.","השטח חי. אין צורך בהוראות נוספות. זוז.","המשימה לא מחכה למוטיבציה. גם אתה לא."];

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

/** Get content for a specific pillar key */
function getPillarContent(pillarKey: string, seed: number, isHe: boolean) {
  const assessmentPool = FIELD_ASSESSMENT[pillarKey];
  const assessment = isHe
    ? pick(assessmentPool?.he || DEFAULT_ASSESSMENT_HE, seed)
    : pick(assessmentPool?.en || DEFAULT_ASSESSMENT_EN, seed);

  const doctrinePool = DOCTRINE[pillarKey];
  const doctrine = isHe
    ? pick(doctrinePool?.he || DEFAULT_DOCTRINE_HE, seed)
    : pick(doctrinePool?.en || DEFAULT_DOCTRINE_EN, seed);

  const intelPool = INTEL_NOTES[pillarKey];
  const intel = isHe
    ? pick(intelPool?.he || DEFAULT_INTEL_HE, seed + 1)
    : pick(intelPool?.en || DEFAULT_INTEL_EN, seed + 1);

  return { assessment, doctrine, intel };
}

export function TodayOverviewTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const phasePlan = useWeeklyTacticalPlan();
  const { days, isLoading } = phasePlan as any;
  const { plan } = useLifePlanWithMilestones();
  const currentDay = useMemo(() => getCurrentDayInIsrael(plan?.start_date), [plan?.start_date]);

  const [selectedTaskIdx, setSelectedTaskIdx] = useState<number | null>(null);

  const todayPlan: DayPlan | null = useMemo(
    () => (days || []).find((d: DayPlan) => d.isToday) || null, [days],
  );
  const todayActions: TacticalAction[] = useMemo(
    () => (todayPlan ? todayPlan.blocks.flatMap((b) => b.actions) : []), [todayPlan],
  );

  const remainingCount = todayActions.filter((a) => !a.completed).length;
  const totalCount = todayActions.length;
  const completedCount = totalCount - remainingCount;
  const currentAction = todayActions.find((a) => !a.completed) || null;
  const currentActionIdx = todayActions.findIndex((a) => !a.completed);

  const now = new Date();
  const seed = now.getDate() + remainingCount;
  const directive = isHe ? pick(DIRECTIVES_HE, seed) : pick(DIRECTIVES_EN, seed);
  const commander = isHe ? pick(COMMANDER_HE, seed + 2) : pick(COMMANDER_EN, seed + 2);

  // The "active" task is: selected task if picked, else current (first incomplete)
  const activeIdx = selectedTaskIdx ?? currentActionIdx;
  const activeTask = activeIdx >= 0 ? todayActions[activeIdx] : null;
  const activePillarKey = activeTask?.focusArea || '';
  const activePillar = PILLAR_VIS[activePillarKey] || DEFAULT_PILLAR;

  // Dynamic content based on the ACTIVE task's pillar — use task index as extra seed for variety
  const taskSeed = seed + (activeIdx >= 0 ? activeIdx : 0);
  const { assessment, doctrine, intel } = useMemo(
    () => getPillarContent(activePillarKey, taskSeed, isHe),
    [activePillarKey, taskSeed, isHe],
  );

  const classification = totalCount === 0
    ? 'RECOVERY PROTOCOL'
    : remainingCount === 0 ? 'MISSION ACCOMPLISHED'
    : remainingCount <= 2 ? 'FINAL WINDOW'
    : 'ACTIVE OPERATION';

  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,30%,8%)] via-[hsl(230,25%,12%)] to-[hsl(250,20%,10%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.04] via-transparent to-violet-500/[0.06]" />
        <div className="absolute top-0 end-0 w-40 h-40 rounded-full bg-cyan-500/[0.08] blur-[60px]" />
        <div className="absolute bottom-0 start-0 w-32 h-32 rounded-full bg-violet-500/[0.06] blur-[50px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 p-4 space-y-3">
          {/* ── Header: Active Pillar + Classification ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{activePillar.emoji}</span>
              <span className="text-sm font-extrabold text-cyan-300 tracking-wide">
                {isHe ? activePillar.labelHe : activePillar.labelEn}
              </span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/[0.08]">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                remainingCount === 0 ? "bg-emerald-400" : remainingCount <= 2 ? "bg-amber-400 animate-pulse" : "bg-cyan-400 animate-pulse"
              )} />
              <span className="text-[9px] font-black tracking-[0.14em] text-cyan-200/80">{classification}</span>
            </div>
          </div>

          {/* ── Directive quote ── */}
          <p className="text-sm text-cyan-100/50 italic leading-snug">
            "{directive}"
          </p>

          {/* ── Today's Task Roadmap ── */}
          {todayActions.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-cyan-300/90">
                    {isHe ? 'משימות היום' : "Today's Missions"}
                  </span>
                  <span className="text-xs text-cyan-200/40 font-bold">
                    {completedCount}/{totalCount}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-cyan-200/40">
                  {isHe ? `יום ${currentDay}/100` : `Day ${currentDay}/100`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {/* Horizontal task nodes */}
              <ScrollArea className="w-full">
                <div className="flex gap-1 pb-0.5">
                  {todayActions.map((action, idx) => {
                    const pv = PILLAR_VIS[action.focusArea || ''] || DEFAULT_PILLAR;
                    const isSelected = activeIdx === idx;
                    const isDone = action.completed;
                    const isCurrent = !isDone && currentActionIdx === idx;

                    return (
                      <button
                        key={action.id || idx}
                        onClick={() => setSelectedTaskIdx(idx)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-all flex-shrink-0 min-w-[44px]",
                          isDone
                            ? "bg-emerald-500/10 border border-emerald-500/20"
                            : isCurrent
                              ? "bg-cyan-500/15 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                              : "border border-white/[0.06] hover:border-white/15",
                          isSelected && !isDone && "ring-2 ring-cyan-400 bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]",
                          isSelected && isDone && "ring-2 ring-emerald-400 bg-emerald-500/20"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                          isDone ? "bg-emerald-500/30" : isSelected ? "bg-cyan-500/30" : isCurrent ? "bg-cyan-500/20" : "bg-white/[0.04]"
                        )}>
                          {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <span>{pv.emoji}</span>}
                        </div>
                        <span className={cn(
                          "text-[8px] font-black",
                          isSelected ? "text-cyan-200" : isDone ? "text-emerald-400/60" : isCurrent ? "text-cyan-300" : "text-white/25"
                        )}>
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          {/* ── Active Mission Detail ── */}
          {activeTask ? (
            <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                activeTask.completed ? "bg-emerald-500/20" : "bg-cyan-500/15"
              )}>
                {activeTask.completed
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : <Crosshair className="w-4 h-4 text-cyan-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 rounded",
                    activeTask.completed ? "text-emerald-400/70 bg-emerald-500/10" : `${activePillar.color} ${activePillar.bg}`
                  )}>
                    {isHe ? activePillar.labelHe : activePillar.labelEn}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-500/50">
                    {activeTask.completed
                      ? (isHe ? 'הושלם ✓' : 'Completed ✓')
                      : (isHe ? 'משימה נוכחית' : 'Current Mission')
                    }
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-black leading-tight block",
                  activeTask.completed ? "text-white/30 line-through" : "text-white/90"
                )}>
                  {isHe ? activeTask.title : (activeTask.titleEn || activeTask.title)}
                </span>
                {activeTask.description && (
                  <p className={cn("text-xs text-white/40 leading-snug mt-0.5", activeTask.completed && "line-through opacity-50")}>
                    {isHe ? activeTask.description : (activeTask.descriptionEn || activeTask.description)}
                  </p>
                )}
              </div>
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-3">
              <span className="text-xl">🌙</span>
              <h3 className="text-sm font-black text-white mt-1">{isHe ? 'יום התאוששות' : 'Recovery Day'}</h3>
              <p className="text-xs text-cyan-200/50">{isHe ? 'מחר חוזרים חדים.' : 'Tomorrow we return sharp.'}</p>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-xl">🏆</span>
              <h3 className="text-sm font-black text-white mt-1">{isHe ? 'כל היעדים הושלמו!' : 'All objectives complete!'}</h3>
            </div>
          )}

          {/* ── Field Briefing — dynamic per active task's pillar ── */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-3 py-3 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-400/50 flex items-center gap-1.5">
              ✦ {isHe ? 'מדריך שטח' : 'Field Guide'}
            </span>
            <p className="text-sm text-cyan-100/60 leading-relaxed">
              {assessment}
            </p>
            <p className="text-sm font-semibold text-cyan-100/70 leading-relaxed flex gap-1.5">
              <span className="flex-shrink-0">⚔️</span> {doctrine}
            </p>
            <p className="text-xs italic text-cyan-100/40 leading-relaxed flex gap-1.5">
              <span className="flex-shrink-0">🔍</span> {intel}
            </p>
          </div>

          {/* ── Commander sign-off ── */}
          <div className="border-t border-white/[0.06] pt-2 text-center">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-white/15">
              {commander}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
