/**
 * TodayOverviewTab — Web3-styled unified mission card with embedded roadmap.
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
  Zap, Target, X, Shield, Eye, ChevronDown,
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

/* ── Field Assessment ── */
const FIELD_ASSESSMENT: Record<string, { en: string[]; he: string[] }> = {
  vitality: {
    en: ["Today's theater centers on Vitality. Your body is the vehicle for every mission that follows. Neglect it and all other operations degrade.","The field report is clear: physical readiness determines operational capacity. Today you sharpen the blade that cuts through everything else."],
    he: ["זירת היום: חיוניות. הגוף הוא הכלי לכל משימה שתבוא. הזנח אותו — וכל מערך הפעולה מתדרדר.","דוח השטח ברור: מוכנות פיזית קובעת קיבולת מבצעית. היום משחיזים את הלהב שחותך דרך הכל."],
  },
  focus: {
    en: ["Cognitive operations are the priority. Your mind is the command center — every distraction is an enemy infiltration. Seal the perimeter.","Today's briefing: deep work is the weapon. The battlefield is your attention span. Defend it with lethal precision."],
    he: ["מבצעים קוגניטיביים בעדיפות עליונה. המוח הוא מרכז הפיקוד — כל הסחה היא חדירת אויב. אטום את המתחם.","תדריך היום: עבודה עמוקה היא הנשק. שדה הקרב הוא טווח הקשב שלך. הגן עליו בדיוק קטלני."],
  },
  wealth: {
    en: ["Economic theater is active. Today's objective: create asymmetric value. One well-placed move outweighs a hundred busy hours.","Financial intelligence report: resources flow toward clarity and decisive action. Today you operate with both."],
    he: ["הזירה הכלכלית פעילה. יעד היום: ליצור ערך אסימטרי. מהלך אחד ממוקם שווה יותר ממאה שעות עסוקות.","דוח מודיעין פיננסי: משאבים זורמים לכיוון בהירות ופעולה החלטית. היום אתה פועל עם שניהם."],
  },
  power: {
    en: ["Power operations are live. Raw capacity building is today's mission — strength isn't optional, it's infrastructure."],
    he: ["מבצעי כוח פעילים. בניית קיבולת גולמית היא משימת היום — כוח הוא לא אופציה, הוא תשתית."],
  },
  consciousness: {
    en: ["Inner reconnaissance is the mission. Today's terrain is internal — map the blind spots before they map you."],
    he: ["סיור פנימי הוא המשימה. שטח היום הוא פנימי — מפה את הנקודות העיוורות לפני שהן ממפות אותך."],
  },
};
const DEFAULT_ASSESSMENT_EN = ["Operations are live. The mission parameters are set. All that remains is execution — clean, decisive, without negotiation.","Today's terrain is mapped. Your objectives are locked. The only variable left is your willingness to move."];
const DEFAULT_ASSESSMENT_HE = ["המבצעים חיים. פרמטרי המשימה נקבעו. כל מה שנותר הוא ביצוע — נקי, החלטי, ללא משא ומתן.","שטח היום ממופה. היעדים נעולים. המשתנה היחיד שנותר הוא הנכונות שלך לזוז."];

/* ── Operational Doctrine ── */
const DOCTRINE: Record<string, { en: string[]; he: string[] }> = {
  vitality: { en: ["No negotiation with comfort. Execute before the mind builds its case."], he: ["אין משא ומתן עם הנוחות. בצע לפני שהמוח בונה את הטיעון שלו."] },
  focus: { en: ["One thread at a time. Multitasking is a myth sold to the undisciplined."], he: ["חוט אחד בכל פעם. ריבוי משימות הוא מיתוס שנמכר לחסרי משמעת."] },
  wealth: { en: ["Value first, revenue follows. Never chase — position and let it come."], he: ["ערך קודם, הכנסה עוקבת. לעולם אל תרדוף — מקם ותן לזה להגיע."] },
  power: { en: ["Discomfort is the price of admission. Pay it daily or forfeit the seat."], he: ["אי נוחות היא דמי הכניסה. שלם יומי או ותר על המקום."] },
  consciousness: { en: ["Silence is not empty — it's where the signal lives. Listen before you lead."], he: ["שקט הוא לא ריק — שם חי האות. הקשב לפני שאתה מוביל."] },
};
const DEFAULT_DOCTRINE_EN = ["Hesitation is a decision — and it's always the wrong one."];
const DEFAULT_DOCTRINE_HE = ["היסוס הוא החלטה — והיא תמיד הלא נכונה."];

/* ── Intelligence Notes ── */
const INTEL_NOTES: Record<string, { en: string[]; he: string[] }> = {
  vitality: { en: ["Field data confirms: 20 minutes of high-output movement rewires threat assessment for the next 8 hours. The ROI is non-negotiable."], he: ["נתוני שטח מאשרים: 20 דקות של תנועה בעצימות גבוהה משנות הערכת איום ל-8 השעות הבאות. התשואה לא ניתנת למשא ומתן."] },
  focus: { en: ["A single 90-minute deep work block produces more signal than 8 hours of reactive task-switching. Protect the block at all costs."], he: ["בלוק עבודה עמוקה אחד של 90 דקות מייצר יותר אות מ-8 שעות של מיתוג משימות תגובתי. הגן על הבלוק בכל מחיר."] },
  wealth: { en: ["Compound returns apply to skills, relationships, and reputation — not just capital. Every interaction is an investment."], he: ["תשואה מצטברת חלה על מיומנויות, מערכות יחסים ומוניטין — לא רק על הון. כל אינטראקציה היא השקעה."] },
};
const DEFAULT_INTEL_EN = ["Pattern recognition: your best days share one trait — you started before you felt ready. File that under 'operational doctrine'.","Historical analysis: every breakthrough in your record came after sustained discomfort. The data doesn't lie."];
const DEFAULT_INTEL_HE = ["זיהוי דפוסים: לימים הטובים ביותר שלך יש תכונה אחת משותפת — התחלת לפני שהרגשת מוכן. תייק את זה תחת 'דוקטרינה מבצעית'.","ניתוח היסטורי: כל פריצת דרך ברשומות שלך הגיעה אחרי אי נוחות מתמשכת. הנתונים לא משקרים."];

/* ── Commander's Directive ── */
const COMMANDER_EN = ["End of briefing. Execute with precision. Dismissed.","Field is live. No further instructions required. Move.","This briefing is classified. Your actions today are your only response.","The mission doesn't wait for motivation. Neither do you."];
const COMMANDER_HE = ["סוף תדריך. בצע בדייקנות. שוחרר.","השטח חי. אין צורך בהוראות נוספות. זוז.","תדריך זה מסווג. הפעולות שלך היום הן התגובה היחידה.","המשימה לא מחכה למוטיבציה. גם אתה לא."];

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

  // Phase data
  const phaseCount = milestones.length > 0 ? Math.min(10, milestones.length) : 0;
  const completedCount = milestones.filter((m: any) => m.is_completed).length;
  const progressPct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
  const phases = Array.from({ length: phaseCount }, (_, i) => {
    const phaseMs = milestones.filter((m: any) => m.week_number === i + 1);
    const allDone = phaseMs.length > 0 && phaseMs.every((m: any) => m.is_completed);
    const isActive = i + 1 === currentWeek;
    return { index: i, letter: String.fromCharCode(65 + i), milestones: phaseMs, allDone, isActive };
  });

  const selectedPhaseWeek = selectedMilestone ? selectedMilestone.charCodeAt(0) - 64 : null;
  const selectedPhaseMilestones = selectedPhaseWeek
    ? milestones.filter((m: any) => m.week_number === selectedPhaseWeek)
    : [];

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
      {/* ═══ UNIFIED WEB3 CARD ═══ */}
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20">
        {/* Gradient background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,30%,8%)] via-[hsl(230,25%,12%)] to-[hsl(250,20%,10%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.04] via-transparent to-violet-500/[0.06]" />
        <div className="absolute top-0 end-0 w-40 h-40 rounded-full bg-cyan-500/[0.08] blur-[60px]" />
        <div className="absolute bottom-0 start-0 w-32 h-32 rounded-full bg-violet-500/[0.06] blur-[50px]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 p-4 space-y-4">
          {/* ── Header: Pillar + Classification ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{currentPillar.emoji}</span>
              <span className="text-xs font-extrabold text-cyan-300 tracking-wide">
                {isHe ? currentPillar.labelHe : currentPillar.labelEn}
              </span>
              <Zap className="w-3 h-3 text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/[0.08]">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                remainingCount === 0 ? "bg-emerald-400" : remainingCount <= 2 ? "bg-amber-400 animate-pulse" : "bg-cyan-400 animate-pulse"
              )} />
              <span className="text-[9px] font-black tracking-[0.14em] text-cyan-200/80">{classification}</span>
            </div>
          </div>

          {/* ── Directive ── */}
          <p className="text-[11px] font-semibold text-cyan-100/60 leading-snug italic">
            "{directive}"
          </p>

          {/* ── Current Mission ── */}
          {currentAction ? (
            <div className="flex items-baseline gap-2.5 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Crosshair className="w-4 h-4 text-cyan-400 flex-shrink-0 relative top-[2px]" />
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-500/50 block mb-0.5">
                  {isHe ? 'משימה נוכחית' : 'Current Mission'}
                </span>
                <span className="text-sm font-black text-white leading-tight">
                  {isHe ? currentAction.title : (currentAction.titleEn || currentAction.title)}
                </span>
              </div>
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-3">
              <span className="text-xl">🌙</span>
              <h3 className="text-sm font-black text-white mt-1">{isHe ? 'יום התאוששות' : 'Recovery Day'}</h3>
              <p className="text-[10px] text-cyan-200/50">{isHe ? 'מחר חוזרים חדים.' : 'Tomorrow we return sharp.'}</p>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-xl">🏆</span>
              <h3 className="text-sm font-black text-white mt-1">{isHe ? 'כל היעדים הושלמו!' : 'All objectives complete!'}</h3>
            </div>
          )}

          {/* ── Embedded Roadmap ── */}
          {milestones.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2.5">
              {/* Roadmap header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-300/90">
                    {isHe ? `שלב ${String.fromCharCode(64 + currentWeek)}` : `Phase ${String.fromCharCode(64 + currentWeek)}`}
                  </span>
                  <span className="text-[9px] text-cyan-200/40 font-semibold">
                    {completedCount}/{milestones.length}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-cyan-200/40">
                  {isHe ? `יום ${currentDay}/100` : `Day ${currentDay}/100`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {/* Phase pills A-J */}
              <div className="flex justify-between px-0.5">
                {phases.map((phase) => {
                  const isSelected = selectedMilestone === phase.letter;
                  return (
                    <button
                      key={phase.letter}
                      onClick={() => setSelectedMilestone(isSelected ? null : phase.letter)}
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black transition-all",
                        phase.allDone
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : phase.isActive
                            ? "bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                            : "text-white/20 hover:text-white/40 border border-transparent hover:border-white/10",
                        isSelected && !phase.isActive && "ring-1 ring-cyan-400/50"
                      )}
                    >
                      {phase.letter}
                    </button>
                  );
                })}
              </div>

              {/* Expanded Phase Milestones */}
              <AnimatePresence>
                {selectedPhaseMilestones.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 border-t border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-cyan-300/70 uppercase tracking-wider">
                          {isHe ? `אבני דרך — שלב ${selectedMilestone}` : `Milestones — Phase ${selectedMilestone}`}
                        </span>
                        <button onClick={() => setSelectedMilestone(null)} className="p-0.5 rounded text-white/30 hover:text-white/60">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {selectedPhaseMilestones.map((ms: any) => {
                        const pv = PILLAR_VIS[ms.focus_area] || DEFAULT_PILLAR;
                        return (
                          <div key={ms.id} className="flex items-start gap-2">
                            <div className={cn(
                              "w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center",
                              ms.is_completed ? "bg-emerald-500" : "border border-white/20"
                            )}>
                              {ms.is_completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {ms.focus_area && <span className="text-[9px]">{pv.emoji}</span>}
                                <span className={cn("text-xs font-bold", ms.is_completed ? "text-white/30 line-through" : "text-white/90")}>
                                  {isHe ? ms.title : (ms.title_en || ms.title)}
                                </span>
                              </div>
                              {ms.description && (
                                <p className="text-[10px] text-white/30 leading-snug line-clamp-2">
                                  {isHe ? ms.description : (ms.description_en || ms.description)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Narrative Briefing ── */}
          <div className="space-y-2.5 text-[11px] leading-relaxed text-cyan-100/60">
            <p>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500/50 me-2 relative top-[-1px]" />
              {assessment}
            </p>
            <p className="font-bold text-cyan-100/75">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500/50 me-2 relative top-[-1px]" />
              {doctrine}
            </p>
            <p className="italic text-cyan-100/40">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/50 me-2 relative top-[-1px]" />
              {intel}
            </p>
          </div>

          {/* ── Commander's Directive ── */}
          <div className="border-t border-white/[0.06] pt-2.5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20">
              {commander}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
