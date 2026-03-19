/**
 * TodayOverviewTab — Web3-styled unified mission card with today's task roadmap.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import {
  Crosshair, CheckCircle2,
  Zap, Target,
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

/* ── Field Assessment ── */
const FIELD_ASSESSMENT: Record<string, { en: string[]; he: string[] }> = {
  vitality: {
    en: ["Today's theater centers on Vitality. Your body is the vehicle for every mission that follows.","The field report is clear: physical readiness determines operational capacity."],
    he: ["זירת היום: חיוניות. הגוף הוא הכלי לכל משימה שתבוא.","דוח השטח ברור: מוכנות פיזית קובעת קיבולת מבצעית."],
  },
  focus: {
    en: ["Cognitive operations are the priority. Your mind is the command center.","Today's briefing: deep work is the weapon. The battlefield is your attention span."],
    he: ["מבצעים קוגניטיביים בעדיפות עליונה. המוח הוא מרכז הפיקוד.","תדריך היום: עבודה עמוקה היא הנשק. שדה הקרב הוא טווח הקשב שלך."],
  },
  wealth: {
    en: ["Economic theater is active. Today's objective: create asymmetric value.","Financial intelligence report: resources flow toward clarity and decisive action."],
    he: ["הזירה הכלכלית פעילה. יעד היום: ליצור ערך אסימטרי.","דוח מודיעין פיננסי: משאבים זורמים לכיוון בהירות ופעולה החלטית."],
  },
  power: {
    en: ["Power operations are live. Raw capacity building is today's mission."],
    he: ["מבצעי כוח פעילים. בניית קיבולת גולמית היא משימת היום."],
  },
  consciousness: {
    en: ["Inner reconnaissance is the mission. Today's terrain is internal."],
    he: ["סיור פנימי הוא המשימה. שטח היום הוא פנימי."],
  },
};
const DEFAULT_ASSESSMENT_EN = ["Operations are live. The mission parameters are set. All that remains is execution."];
const DEFAULT_ASSESSMENT_HE = ["המבצעים חיים. פרמטרי המשימה נקבעו. כל מה שנותר הוא ביצוע."];

/* ── Operational Doctrine ── */
const DOCTRINE: Record<string, { en: string[]; he: string[] }> = {
  vitality: { en: ["No negotiation with comfort. Execute before the mind builds its case."], he: ["אין משא ומתן עם הנוחות. בצע לפני שהמוח בונה את הטיעון שלו."] },
  focus: { en: ["One thread at a time. Multitasking is a myth sold to the undisciplined."], he: ["חוט אחד בכל פעם. ריבוי משימות הוא מיתוס שנמכר לחסרי משמעת."] },
  wealth: { en: ["Value first, revenue follows. Never chase — position and let it come."], he: ["ערך קודם, הכנסה עוקבת. לעולם אל תרדוף — מקם ותן לזה להגיע."] },
  power: { en: ["Discomfort is the price of admission. Pay it daily or forfeit the seat."], he: ["אי נוחות היא דמי הכניסה. שלם יומי או ותר על המקום."] },
  consciousness: { en: ["Silence is not empty — it's where the signal lives."], he: ["שקט הוא לא ריק — שם חי האות."] },
};
const DEFAULT_DOCTRINE_EN = ["Hesitation is a decision — and it's always the wrong one."];
const DEFAULT_DOCTRINE_HE = ["היסוס הוא החלטה — והיא תמיד הלא נכונה."];

/* ── Intelligence Notes ── */
const INTEL_NOTES: Record<string, { en: string[]; he: string[] }> = {
  vitality: { en: ["20 minutes of high-output movement rewires threat assessment for the next 8 hours."], he: ["20 דקות של תנועה בעצימות גבוהה משנות הערכת איום ל-8 השעות הבאות."] },
  focus: { en: ["A single 90-minute deep work block produces more signal than 8 hours of reactive task-switching."], he: ["בלוק עבודה עמוקה אחד של 90 דקות מייצר יותר אות מ-8 שעות של מיתוג משימות תגובתי."] },
  wealth: { en: ["Compound returns apply to skills, relationships, and reputation — not just capital."], he: ["תשואה מצטברת חלה על מיומנויות, מערכות יחסים ומוניטין — לא רק על הון."] },
};
const DEFAULT_INTEL_EN = ["Your best days share one trait — you started before you felt ready."];
const DEFAULT_INTEL_HE = ["לימים הטובים ביותר שלך יש תכונה אחת משותפת — התחלת לפני שהרגשת מוכן."];

/* ── Commander's Directive ── */
const COMMANDER_EN = ["End of briefing. Execute with precision. Dismissed.","Field is live. No further instructions required. Move.","The mission doesn't wait for motivation. Neither do you."];
const COMMANDER_HE = ["סוף תדריך. בצע בדייקנות. שוחרר.","השטח חי. אין צורך בהוראות נוספות. זוז.","המשימה לא מחכה למוטיבציה. גם אתה לא."];

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

export function TodayOverviewTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const phasePlan = useWeeklyTacticalPlan();
  const { days, isLoading } = phasePlan as any;
  const { plan } = useLifePlanWithMilestones();
  const currentDay = useMemo(() => getCurrentDayInIsrael(plan?.start_date), [plan?.start_date]);

  // Selected task index for the task roadmap
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

  // Progress
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Selected task detail
  const selectedTask = selectedTaskIdx !== null ? todayActions[selectedTaskIdx] : null;
  const selectedPillar = selectedTask ? (PILLAR_VIS[selectedTask.focusArea || ''] || DEFAULT_PILLAR) : null;

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

          {/* ── Today's Task Roadmap ── */}
          {todayActions.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300/90">
                    {isHe ? 'משימות היום' : "Today's Missions"}
                  </span>
                  <span className="text-[9px] text-cyan-200/40 font-semibold">
                    {completedCount}/{totalCount}
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

              {/* Horizontal task nodes */}
              <ScrollArea className="w-full">
                <div className="flex gap-1.5 pb-1">
                  {todayActions.map((action, idx) => {
                    const pv = PILLAR_VIS[action.focusArea || ''] || DEFAULT_PILLAR;
                    const isSelected = selectedTaskIdx === idx;
                    const isDone = action.completed;
                    const isCurrent = !isDone && todayActions.findIndex(a => !a.completed) === idx;

                    return (
                      <button
                        key={action.id || idx}
                        onClick={() => setSelectedTaskIdx(isSelected ? null : idx)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-all flex-shrink-0 min-w-[48px]",
                          isDone
                            ? "bg-emerald-500/10 border border-emerald-500/20"
                            : isCurrent
                              ? "bg-cyan-500/15 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                              : "border border-white/[0.06] hover:border-white/15",
                          isSelected && "ring-1 ring-cyan-400/60"
                        )}
                      >
                        {/* Status icon */}
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                          isDone ? "bg-emerald-500/30" : isCurrent ? "bg-cyan-500/20" : "bg-white/[0.04]"
                        )}>
                          {isDone ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <span>{pv.emoji}</span>
                          )}
                        </div>
                        {/* Index */}
                        <span className={cn(
                          "text-[8px] font-black",
                          isDone ? "text-emerald-400/60" : isCurrent ? "text-cyan-300" : "text-white/25"
                        )}>
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* Selected task detail — rendered inline below roadmap */}
              {selectedTask && selectedPillar && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="flex items-start gap-2.5">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                      selectedTask.completed ? "bg-emerald-500/20" : "bg-cyan-500/15"
                    )}>
                      {selectedTask.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-sm">{selectedPillar.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 rounded",
                          selectedTask.completed
                            ? "text-emerald-400/70 bg-emerald-500/10"
                            : `${selectedPillar.color} ${selectedPillar.bg}`
                        )}>
                          {isHe ? selectedPillar.labelHe : selectedPillar.labelEn}
                        </span>
                        {selectedTask.completed && (
                          <span className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-wider">
                            {isHe ? 'הושלם' : 'Done'}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs font-bold leading-snug",
                        selectedTask.completed ? "text-white/30 line-through" : "text-white/90"
                      )}>
                        {isHe ? selectedTask.title : (selectedTask.titleEn || selectedTask.title)}
                      </p>
                      {selectedTask.description && (
                        <p className="text-[10px] text-white/30 leading-snug mt-1">
                          {isHe ? selectedTask.description : (selectedTask.descriptionEn || selectedTask.description)}
                        </p>
                      )}
                      {(selectedTask as any).timeBlock && (
                        <span className="text-[9px] text-cyan-300/40 font-semibold mt-1 inline-block">
                          ⏱ {(selectedTask as any).timeBlock}
                        </span>
                      )}
                </div>
              )}
            </div>
          )}

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
