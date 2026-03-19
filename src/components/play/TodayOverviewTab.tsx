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
      {milestones.length > 0 && (
        <div className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(var(--primary)/0.06),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 px-3 pt-3 pb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground">
                  {isHe ? `שלב ${String.fromCharCode(64 + currentWeek)}` : `Phase ${String.fromCharCode(64 + currentWeek)}`}
                </span>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground">
                {isHe ? `יום ${currentDay} מתוך 100` : `Day ${currentDay} of 100`}
              </span>
            </div>

            {/* Connected nodes */}
            <div className="relative">
              <div className="absolute top-4 inset-x-4 h-[2px] bg-border/20 z-0" />
              <div
                className="absolute top-4 start-4 h-[2px] bg-gradient-to-r from-primary to-primary/60 z-[1] transition-all duration-500"
                style={{ width: `${Math.max(0, ((currentWeek - 1) / Math.max(1, milestones.length - 1)) * 100)}%` }}
              />

              <div className="relative z-[2] flex justify-between">
                {milestones.map((ms: any) => {
                  const isActive = ms.week_number === currentWeek;
                  const isDone = ms.is_completed;
                  const isPast = ms.week_number < currentWeek;
                  const isSelected = selectedMilestone === ms.id;

                  return (
                    <button
                      key={ms.id}
                      onClick={() => setSelectedMilestone(isSelected ? null : ms.id)}
                      className="flex flex-col items-center gap-1 group relative"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2",
                        isDone
                          ? "bg-primary/20 border-primary text-primary"
                          : isActive
                            ? "bg-primary border-primary text-primary-foreground shadow-[0_0_16px_hsla(var(--primary)/0.5)]"
                            : isPast
                              ? "bg-muted/40 border-primary/40 text-primary/60"
                              : "bg-card border-border/40 text-foreground/30",
                        isSelected && "ring-2 ring-primary/50 ring-offset-2 ring-offset-card"
                      )}>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : ms.week_number}
                      </div>
                      <span className={cn(
                        "text-[8px] font-bold",
                        isActive ? "text-primary" : isDone || isPast ? "text-muted-foreground/60" : "text-foreground/20"
                      )}>
                        {String.fromCharCode(64 + ms.week_number)}
                      </span>
                      {isActive && !isDone && (
                        <motion.div
                          className="absolute -top-1 w-2 h-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

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
                <div className="mx-3 mb-3 p-3 rounded-xl border border-border/30 bg-background/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                          selectedMs.is_completed ? "bg-primary/15 text-primary"
                            : selectedMs.week_number === currentWeek ? "bg-amber-500/15 text-amber-400"
                            : "bg-muted/30 text-muted-foreground"
                        )}>
                          {selectedMs.is_completed
                            ? (isHe ? '✓ הושלם' : '✓ DONE')
                            : selectedMs.week_number === currentWeek
                              ? (isHe ? '● פעיל עכשיו' : '● ACTIVE')
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
      )}

      {/* ═══ MAIN BRIEFING CARD ═══ */}
      <div className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsla(var(--primary)/0.1),transparent_60%)]" />

        <div className="relative z-10 p-3.5 space-y-4">
          {/* Classification + Pillar */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/30 px-2 py-1">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black tracking-[0.14em] text-muted-foreground">{classification}</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1">
              <span className="text-xs">{currentPillar.emoji}</span>
              <span className="text-[9px] font-black text-primary">{isHe ? currentPillar.labelHe : currentPillar.labelEn}</span>
            </div>
          </div>

          {/* Directive */}
          <p className="text-[11px] font-semibold text-foreground/80 leading-snug italic">
            "{directive}"
          </p>

          {/* ═══ CURRENT MISSION — title + pillar only ═══ */}
          <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Crosshair className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-primary">
                {isHe ? 'משימה נוכחית' : 'Current Mission'}
              </span>
            </div>

            {currentAction ? (
              <h3 className="text-base font-black text-foreground leading-tight">
                {isHe ? currentAction.title : (currentAction.titleEn || currentAction.title)}
              </h3>
            ) : totalCount === 0 ? (
              <div className="text-center py-2">
                <span className="text-2xl">🌙</span>
                <h3 className="text-sm font-black text-foreground mt-1">{isHe ? 'יום התאוששות' : 'Recovery Day'}</h3>
                <p className="text-[10px] text-muted-foreground">{isHe ? 'מחר חוזרים חדים.' : 'Tomorrow we return sharp.'}</p>
              </div>
            ) : (
              <div className="text-center py-1">
                <span className="text-2xl">🏆</span>
                <h3 className="text-sm font-black text-foreground mt-1">{isHe ? 'כל היעדים הושלמו!' : 'All objectives complete!'}</h3>
              </div>
            )}
          </div>

          {/* ═══ FIELD ASSESSMENT ═══ */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border/20 bg-background/20 p-3">
            <Eye className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.14em] text-primary/60 block mb-1">
                {isHe ? 'הערכת שטח' : 'Field Assessment'}
              </span>
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                {assessment}
              </p>
            </div>
          </div>

          {/* ═══ OPERATIONAL DOCTRINE ═══ */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border/20 bg-background/20 p-3">
            <Shield className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.14em] text-primary/60 block mb-1">
                {isHe ? 'דוקטרינה מבצעית' : 'Operational Doctrine'}
              </span>
              <p className="text-[11px] font-bold text-foreground leading-relaxed">
                {doctrine}
              </p>
            </div>
          </div>

          {/* ═══ INTELLIGENCE NOTE ═══ */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border/20 bg-background/20 p-3">
            <Lock className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.14em] text-primary/60 block mb-1">
                {isHe ? 'סיכום מודיעיני' : 'Intelligence Note'}
              </span>
              <p className="text-[11px] text-foreground/70 leading-relaxed italic">
                {intel}
              </p>
            </div>
          </div>

          {/* ═══ COMMANDER'S DIRECTIVE ═══ */}
          <div className="border-t border-border/20 pt-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground/60">
              {commander}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
