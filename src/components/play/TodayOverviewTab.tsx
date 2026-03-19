/**
 * TodayOverviewTab — Pure CIA-style narrative field briefing. No lists, no stats, no progress bars.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import {
  Crosshair, Lock, CheckCircle2,
  Zap, Target, X, Shield, Eye,
} from 'lucide-react';

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

/* ── Field Assessment — pillar-keyed narrative prose ── */
const FIELD_ASSESSMENT: Record<string, { en: string[]; he: string[] }> = {
  vitality: {
    en: [
      "Today's theater centers on Vitality. Your body is the vehicle for every mission that follows. Neglect it and all other operations degrade.",
      "The field report is clear: physical readiness determines operational capacity. Today you sharpen the blade that cuts through everything else.",
    ],
    he: [
      "זירת היום: חיוניות. הגוף הוא הכלי לכל משימה שתבוא. הזנח אותו — וכל מערך הפעולה מתדרדר.",
      "דוח השטח ברור: מוכנות פיזית קובעת קיבולת מבצעית. היום משחיזים את הלהב שחותך דרך הכל.",
    ],
  },
  focus: {
    en: [
      "Cognitive operations are the priority. Your mind is the command center — every distraction is an enemy infiltration. Seal the perimeter.",
      "Today's briefing: deep work is the weapon. The battlefield is your attention span. Defend it with lethal precision.",
    ],
    he: [
      "מבצעים קוגניטיביים בעדיפות עליונה. המוח הוא מרכז הפיקוד — כל הסחה היא חדירת אויב. אטום את המתחם.",
      "תדריך היום: עבודה עמוקה היא הנשק. שדה הקרב הוא טווח הקשב שלך. הגן עליו בדיוק קטלני.",
    ],
  },
  wealth: {
    en: [
      "Economic theater is active. Today's objective: create asymmetric value. One well-placed move outweighs a hundred busy hours.",
      "Financial intelligence report: resources flow toward clarity and decisive action. Today you operate with both.",
    ],
    he: [
      "הזירה הכלכלית פעילה. יעד היום: ליצור ערך אסימטרי. מהלך אחד ממוקם שווה יותר ממאה שעות עסוקות.",
      "דוח מודיעין פיננסי: משאבים זורמים לכיוון בהירות ופעולה החלטית. היום אתה פועל עם שניהם.",
    ],
  },
  power: {
    en: [
      "Power operations are live. Raw capacity building is today's mission — strength isn't optional, it's infrastructure.",
    ],
    he: [
      "מבצעי כוח פעילים. בניית קיבולת גולמית היא משימת היום — כוח הוא לא אופציה, הוא תשתית.",
    ],
  },
  consciousness: {
    en: [
      "Inner reconnaissance is the mission. Today's terrain is internal — map the blind spots before they map you.",
    ],
    he: [
      "סיור פנימי הוא המשימה. שטח היום הוא פנימי — מפה את הנקודות העיוורות לפני שהן ממפות אותך.",
    ],
  },
};
const DEFAULT_ASSESSMENT_EN = [
  "Operations are live. The mission parameters are set. All that remains is execution — clean, decisive, without negotiation.",
  "Today's terrain is mapped. Your objectives are locked. The only variable left is your willingness to move.",
];
const DEFAULT_ASSESSMENT_HE = [
  "המבצעים חיים. פרמטרי המשימה נקבעו. כל מה שנותר הוא ביצוע — נקי, החלטי, ללא משא ומתן.",
  "שטח היום ממופה. היעדים נעולים. המשתנה היחיד שנותר הוא הנכונות שלך לזוז.",
];

/* ── Operational Doctrine ── */
const DOCTRINE: Record<string, { en: string[]; he: string[] }> = {
  vitality: {
    en: ["No negotiation with comfort. Execute before the mind builds its case."],
    he: ["אין משא ומתן עם הנוחות. בצע לפני שהמוח בונה את הטיעון שלו."],
  },
  focus: {
    en: ["One thread at a time. Multitasking is a myth sold to the undisciplined."],
    he: ["חוט אחד בכל פעם. ריבוי משימות הוא מיתוס שנמכר לחסרי משמעת."],
  },
  wealth: {
    en: ["Value first, revenue follows. Never chase — position and let it come."],
    he: ["ערך קודם, הכנסה עוקבת. לעולם אל תרדוף — מקם ותן לזה להגיע."],
  },
  power: {
    en: ["Discomfort is the price of admission. Pay it daily or forfeit the seat."],
    he: ["אי נוחות היא דמי הכניסה. שלם יומי או ותר על המקום."],
  },
  consciousness: {
    en: ["Silence is not empty — it's where the signal lives. Listen before you lead."],
    he: ["שקט הוא לא ריק — שם חי האות. הקשב לפני שאתה מוביל."],
  },
};
const DEFAULT_DOCTRINE_EN = ["Hesitation is a decision — and it's always the wrong one."];
const DEFAULT_DOCTRINE_HE = ["היסוס הוא החלטה — והיא תמיד הלא נכונה."];

/* ── Intelligence Notes ── */
const INTEL_NOTES: Record<string, { en: string[]; he: string[] }> = {
  vitality: {
    en: [
      "Field data confirms: 20 minutes of high-output movement rewires threat assessment for the next 8 hours. The ROI is non-negotiable.",
    ],
    he: [
      "נתוני שטח מאשרים: 20 דקות של תנועה בעצימות גבוהה משנות הערכת איום ל-8 השעות הבאות. התשואה לא ניתנת למשא ומתן.",
    ],
  },
  focus: {
    en: [
      "A single 90-minute deep work block produces more signal than 8 hours of reactive task-switching. Protect the block at all costs.",
    ],
    he: [
      "בלוק עבודה עמוקה אחד של 90 דקות מייצר יותר אות מ-8 שעות של מיתוג משימות תגובתי. הגן על הבלוק בכל מחיר.",
    ],
  },
  wealth: {
    en: [
      "Compound returns apply to skills, relationships, and reputation — not just capital. Every interaction is an investment.",
    ],
    he: [
      "תשואה מצטברת חלה על מיומנויות, מערכות יחסים ומוניטין — לא רק על הון. כל אינטראקציה היא השקעה.",
    ],
  },
};
const DEFAULT_INTEL_EN = [
  "Pattern recognition: your best days share one trait — you started before you felt ready. File that under 'operational doctrine'.",
  "Historical analysis: every breakthrough in your record came after sustained discomfort. The data doesn't lie.",
];
const DEFAULT_INTEL_HE = [
  "זיהוי דפוסים: לימים הטובים ביותר שלך יש תכונה אחת משותפת — התחלת לפני שהרגשת מוכן. תייק את זה תחת 'דוקטרינה מבצעית'.",
  "ניתוח היסטורי: כל פריצת דרך ברשומות שלך הגיעה אחרי אי נוחות מתמשכת. הנתונים לא משקרים.",
];

/* ── Commander's Directive ── */
const COMMANDER_EN = [
  "End of briefing. Execute with precision. Dismissed.",
  "Field is live. No further instructions required. Move.",
  "This briefing is classified. Your actions today are your only response.",
  "The mission doesn't wait for motivation. Neither do you.",
];
const COMMANDER_HE = [
  "סוף תדריך. בצע בדייקנות. שוחרר.",
  "השטח חי. אין צורך בהוראות נוספות. זוז.",
  "תדריך זה מסווג. הפעולות שלך היום הן התגובה היחידה.",
  "המשימה לא מחכה למוטיבציה. גם אתה לא.",
];

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

export function TodayOverviewTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const phasePlan = useWeeklyTacticalPlan();
  const { days, isLoading } = phasePlan as any;
  const { milestones, currentWeek, plan } = useLifePlanWithMilestones();
  const currentDay = useMemo(() => getCurrentDayInIsrael(plan?.start_date), [plan?.start_date]);

  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const todayPlan: DayPlan | null = useMemo(
    () => (days || []).find((d: DayPlan) => d.isToday) || null, [days],
  );
  const todayActions: TacticalAction[] = useMemo(
    () => (todayPlan ? todayPlan.blocks.flatMap((b) => b.actions) : []), [todayPlan],
  );

  const remainingCount = todayActions.filter((a) => !a.completed).length;
  const totalCount = todayActions.length;
  const currentAction = todayActions.find((a) => !a.completed) || null;

  const now = new Date();
  const seed = now.getDate() + remainingCount;
  const directive = isHe ? pick(DIRECTIVES_HE, seed) : pick(DIRECTIVES_EN, seed);
  const currentPillar = PILLAR_VIS[currentAction?.focusArea || ''] || DEFAULT_PILLAR;
  const pillarKey = currentAction?.focusArea || '';

  const classification = totalCount === 0
    ? 'RECOVERY PROTOCOL'
    : remainingCount === 0 ? 'MISSION ACCOMPLISHED'
    : remainingCount <= 2 ? 'FINAL WINDOW'
    : 'ACTIVE OPERATION';

  // Pillar-aware narrative content
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

  const commander = isHe ? pick(COMMANDER_HE, seed + 2) : pick(COMMANDER_EN, seed + 2);

  const selectedMs = milestones.find((m: any) => m.id === selectedMilestone);

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
      className="space-y-3"
    >
      {/* ═══ PHASE ROADMAP ═══ */}
      {milestones.length > 0 && (() => {
        const totalPhases = milestones.length;
        const completedCount = milestones.filter((m: any) => m.is_completed).length;
        const progressPct = Math.round(((currentWeek - 1) / Math.max(1, totalPhases)) * 100);

        return (
          <div className="rounded-2xl border border-border/30 bg-card p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground">
                  {isHe ? `שלב ${String.fromCharCode(64 + currentWeek)}` : `Phase ${String.fromCharCode(64 + currentWeek)}`}
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold">
                  {completedCount}/{totalPhases}
                </span>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground">
                {isHe ? `יום ${currentDay}/100` : `Day ${currentDay}/100`}
              </span>
            </div>

            {/* Progress bar with phase ticks */}
            <div className="relative h-2 rounded-full bg-border/20 overflow-hidden mb-2">
              <motion.div
                className="absolute inset-y-0 start-0 rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Phase labels row — only show A through J (10 phases max) */}
            <div className="flex justify-between px-0.5">
              {milestones.slice(0, 10).map((ms: any) => {
                const isActive = ms.week_number === currentWeek;
                const isDone = ms.is_completed;
                const isSelected = selectedMilestone === ms.id;
                const letter = String.fromCharCode(64 + ms.week_number);

                return (
                  <button
                    key={ms.id}
                    onClick={() => setSelectedMilestone(isSelected ? null : ms.id)}
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black transition-all",
                      isDone
                        ? "bg-primary/15 text-primary"
                        : isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground/40 hover:text-muted-foreground/70",
                      isSelected && "ring-1 ring-primary/50"
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

            {/* Selected Milestone Detail */}
            <AnimatePresence>
              {selectedMs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-2.5 border-t border-border/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                            selectedMs.is_completed ? "bg-primary/15 text-primary"
                              : selectedMs.week_number === currentWeek ? "bg-amber-500/15 text-amber-400"
                              : "bg-muted/30 text-muted-foreground"
                          )}>
                            {selectedMs.is_completed
                              ? (isHe ? '✓ הושלם' : '✓ DONE')
                              : selectedMs.week_number === currentWeek
                                ? (isHe ? '● פעיל' : '● ACTIVE')
                                : `${isHe ? 'שלב' : 'Phase'} ${selectedMs.week_number}`}
                          </span>
                          {selectedMs.focus_area && (
                            <span className={cn("text-[9px] font-semibold", PILLAR_VIS[selectedMs.focus_area]?.color || 'text-muted-foreground')}>
                              {PILLAR_VIS[selectedMs.focus_area]?.emoji} {isHe ? PILLAR_VIS[selectedMs.focus_area]?.labelHe : PILLAR_VIS[selectedMs.focus_area]?.labelEn}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-foreground mb-0.5">
                          {isHe ? selectedMs.title : (selectedMs.title_en || selectedMs.title)}
                        </h4>
                        {selectedMs.description && (
                          <p className="text-[10px] text-muted-foreground/80 leading-snug line-clamp-2">
                            {isHe ? selectedMs.description : (selectedMs.description_en || selectedMs.description)}
                          </p>
                        )}
                        {selectedMs.goal && (
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-foreground/70">
                            <Target className="w-3 h-3 text-primary/60 flex-shrink-0" />
                            <span className="line-clamp-1">{isHe ? selectedMs.goal : (selectedMs.goal_en || selectedMs.goal)}</span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => setSelectedMilestone(null)} className="p-1 rounded-md hover:bg-muted/30 text-muted-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* ═══ MAIN BRIEFING CARD ═══ */}
      <div className="rounded-2xl border border-border/30 bg-card p-3 space-y-3">
        {/* Classification + Pillar — compact single line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-primary/60" />
            <span className="text-[9px] font-black tracking-[0.12em] text-muted-foreground">{classification}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs">{currentPillar.emoji}</span>
            <span className="text-[9px] font-bold text-primary">{isHe ? currentPillar.labelHe : currentPillar.labelEn}</span>
          </div>
        </div>

        {/* Directive */}
        <p className="text-[11px] font-semibold text-foreground/70 leading-snug italic">
          "{directive}"
        </p>

        {/* Current Mission — inline bold title, no sub-card */}
        {currentAction ? (
          <div className="flex items-baseline gap-2">
            <Crosshair className="w-3.5 h-3.5 text-primary flex-shrink-0 relative top-[2px]" />
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.12em] text-primary/50 block mb-0.5">
                {isHe ? 'משימה נוכחית' : 'Current Mission'}
              </span>
              <span className="text-sm font-black text-foreground leading-tight">
                {isHe ? currentAction.title : (currentAction.titleEn || currentAction.title)}
              </span>
            </div>
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-2">
            <span className="text-xl">🌙</span>
            <h3 className="text-sm font-black text-foreground mt-1">{isHe ? 'יום התאוששות' : 'Recovery Day'}</h3>
            <p className="text-[10px] text-muted-foreground">{isHe ? 'מחר חוזרים חדים.' : 'Tomorrow we return sharp.'}</p>
          </div>
        ) : (
          <div className="text-center py-1">
            <span className="text-xl">🏆</span>
            <h3 className="text-sm font-black text-foreground mt-1">{isHe ? 'כל היעדים הושלמו!' : 'All objectives complete!'}</h3>
          </div>
        )}

        {/* Flowing narrative — no inner cards, dot separators */}
        <div className="space-y-2.5 text-[11px] leading-relaxed text-foreground/75">
          <p>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50 mr-2 relative top-[-1px]" />
            {assessment}
          </p>
          <p className="font-bold text-foreground/85">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50 mr-2 relative top-[-1px]" />
            {doctrine}
          </p>
          <p className="italic text-foreground/60">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50 mr-2 relative top-[-1px]" />
            {intel}
          </p>
        </div>

        {/* Commander's Directive */}
        <div className="border-t border-border/20 pt-2.5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">
            {commander}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
