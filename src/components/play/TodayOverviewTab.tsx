/**
 * TodayOverviewTab — Web3-styled CIA briefing with horizontal milestone roadmap.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import {
  ShieldAlert, Crosshair, Flag, Sparkles, Lock,
  CheckCircle2, ChevronDown, Clock, Zap, Target, X,
} from 'lucide-react';

/* ── Focus area intel ── */
const FOCUS_INTEL: Record<string, { codename: string; emoji: string; aimHe: string; aimEn: string; color: string }> = {
  vitality:      { codename: 'PULSE',  emoji: '❤️‍🔥', aimHe: 'לייצב את הגוף כדי לייצר מוח חד לאורך כל היום.', aimEn: 'Stabilize your body to unlock a sharp mind all day.', color: 'text-rose-400' },
  focus:         { codename: 'LASER',  emoji: '🧠', aimHe: 'לסגור רעש חיצוני ולהחזיר שליטה מנטלית.', aimEn: 'Shut down noise and reclaim mental command.', color: 'text-sky-400' },
  wealth:        { codename: 'LEVER',  emoji: '💎', aimHe: 'להתקדם במהלך שמגדיל חופש כלכלי.', aimEn: 'Advance a move that increases financial freedom.', color: 'text-emerald-400' },
  power:         { codename: 'FORGE',  emoji: '⚡', aimHe: 'לבנות כוח אמיתי דרך משמעת יומית.', aimEn: 'Build real power through daily discipline.', color: 'text-orange-400' },
  influence:     { codename: 'ECHO',   emoji: '📡', aimHe: 'לזקק מסר חד ולהפעיל השפעה מדויקת.', aimEn: 'Sharpen your message and create precise influence.', color: 'text-amber-400' },
  relationships: { codename: 'BOND',   emoji: '🤝', aimHe: 'לבנות אמון דרך פעולה מכוונת.', aimEn: 'Build deep trust through deliberate action.', color: 'text-pink-400' },
  business:      { codename: 'VECTOR', emoji: '🚀', aimHe: 'להזיז את העסק קדימה בצעד שיוצר מומנטום.', aimEn: 'Move the business forward with real momentum.', color: 'text-cyan-400' },
  projects:      { codename: 'BUILD',  emoji: '🔧', aimHe: 'לסיים מהלך קריטי אחד שמוריד עומס.', aimEn: 'Finish one critical move that reduces friction.', color: 'text-teal-400' },
  consciousness: { codename: 'PRISM',  emoji: '✨', aimHe: 'שקט פנימי = בהירות חיצונית.', aimEn: 'Inner quiet = outer clarity.', color: 'text-violet-400' },
  combat:        { codename: 'STRIKE', emoji: '🥊', aimHe: 'כל אימון הוא קרב שאתה בוחר לנצח.', aimEn: 'Every session is a battle you choose to win.', color: 'text-red-400' },
  expansion:     { codename: 'SCOPE',  emoji: '🌀', aimHe: 'צמיחה מחוץ לאזור הנוחות.', aimEn: 'Growth lives outside comfort zones.', color: 'text-indigo-400' },
};
const DEFAULT_INTEL = { codename: 'PRIME', emoji: '🎯', aimHe: 'לבצע את המשימה המרכזית בלי פיצול קשב.', aimEn: 'Execute the primary mission without fragmentation.', color: 'text-primary' };

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

  const completedCount = todayActions.filter((a) => a.completed).length;
  const totalCount = todayActions.length;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentAction = todayActions.find((a) => !a.completed) || null;
  const totalMinutes = todayActions.reduce((s, a) => s + (a.estimatedMinutes || 0), 0);

  const now = new Date();
  const seed = now.getDate() + remainingCount;
  const intel = FOCUS_INTEL[currentAction?.focusArea || ''] || DEFAULT_INTEL;
  const directive = isHe ? pick(DIRECTIVES_HE, seed) : pick(DIRECTIVES_EN, seed);

  const classification = totalCount === 0
    ? 'RECOVERY PROTOCOL'
    : remainingCount === 0 ? 'MISSION ACCOMPLISHED'
    : remainingCount <= 2 ? 'FINAL WINDOW'
    : 'ACTIVE OPERATION';

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
      {/* ═══ HORIZONTAL MILESTONE ROADMAP ═══ */}
      {milestones.length > 0 && (
        <div className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-3 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(var(--primary)/0.08),transparent_70%)] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {isHe ? `100 ימים // יום ${currentDay}` : `100 Days // Day ${currentDay}`}
              </span>
            </div>

            {/* Roadmap track */}
            <div className="relative flex items-center gap-0 overflow-x-auto no-scrollbar pb-1">
              {milestones.map((ms: any, i: number) => {
                const isActive = ms.week_number === currentWeek;
                const isDone = ms.is_completed;
                const isPast = ms.week_number < currentWeek;
                const isSelected = selectedMilestone === ms.id;

                return (
                  <div key={ms.id} className="flex items-center flex-shrink-0">
                    {/* Connector line */}
                    {i > 0 && (
                      <div className={cn(
                        "w-4 h-[2px] -mx-px",
                        isDone || isPast
                          ? "bg-gradient-to-r from-primary/80 to-primary/60"
                          : "bg-border/30"
                      )} />
                    )}

                    {/* Node */}
                    <button
                      onClick={() => setSelectedMilestone(isSelected ? null : ms.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-1 transition-all",
                        "group"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border-2",
                        isDone
                          ? "bg-primary/20 border-primary/50 text-primary"
                          : isActive
                            ? "bg-primary border-primary text-primary-foreground shadow-[0_0_12px_hsla(var(--primary)/0.5)] scale-110"
                            : isPast
                              ? "bg-muted/30 border-border/40 text-muted-foreground"
                              : "bg-background/50 border-border/20 text-foreground/40",
                        isSelected && "ring-2 ring-primary/40 ring-offset-1 ring-offset-card"
                      )}>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span>{ms.week_number}</span>
                        )}
                      </div>
                      <span className={cn(
                        "text-[7px] font-bold leading-none max-w-[32px] text-center truncate",
                        isActive ? "text-primary" : "text-muted-foreground/60"
                      )}>
                        {String.fromCharCode(64 + ms.week_number)}
                      </span>

                      {/* Active pulse */}
                      {isActive && (
                        <div className="absolute -inset-1 rounded-xl border border-primary/20 animate-pulse pointer-events-none" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Selected Milestone Card (expandable) ── */}
          <AnimatePresence>
            {selectedMs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                          selectedMs.is_completed
                            ? "bg-primary/15 text-primary"
                            : selectedMs.week_number === currentWeek
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-muted/30 text-muted-foreground"
                        )}>
                          {selectedMs.is_completed
                            ? (isHe ? 'הושלם' : 'COMPLETED')
                            : selectedMs.week_number === currentWeek
                              ? (isHe ? 'פעיל' : 'ACTIVE')
                              : (isHe ? `שלב ${selectedMs.week_number}` : `Phase ${selectedMs.week_number}`)
                          }
                        </span>
                        {selectedMs.focus_area && (
                          <span className="text-[9px] text-muted-foreground/60">
                            {FOCUS_INTEL[selectedMs.focus_area]?.emoji || '🎯'} {selectedMs.focus_area}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-2">
                        {isHe ? selectedMs.title : (selectedMs.title_en || selectedMs.title)}
                      </h4>
                      {selectedMs.description && (
                        <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2">
                          {isHe ? selectedMs.description : (selectedMs.description_en || selectedMs.description)}
                        </p>
                      )}
                      {selectedMs.goal && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Target className="w-3 h-3 text-primary/60" />
                          <span className="text-[10px] text-foreground/70">
                            {isHe ? selectedMs.goal : (selectedMs.goal_en || selectedMs.goal)}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedMilestone(null)}
                      className="p-1 rounded-md hover:bg-muted/30 text-muted-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══ MISSION BRIEFING CARD ═══ */}
      <div className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsla(var(--primary)/0.12),transparent_60%)]" />
        <div className="pointer-events-none absolute bottom-0 start-0 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 p-3.5 space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/30 px-2 py-1">
              <ShieldAlert className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black tracking-[0.16em] text-muted-foreground">{classification}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1">
              <span className="text-sm">{intel.emoji}</span>
              <span className="text-[9px] font-black text-primary tracking-wider">{intel.codename}</span>
            </div>
          </div>

          {/* Directive text */}
          <p className="text-[11px] font-semibold text-foreground/80 leading-snug">
            {directive}
          </p>

          {/* ── Today's Aim — hero block ── */}
          <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <Crosshair className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">
                {isHe ? "יעד היום" : "Today's Aim"}
              </span>
            </div>
            {currentAction ? (
              <div>
                <h3 className="text-sm font-black text-foreground leading-tight">
                  {isHe ? currentAction.title : (currentAction.titleEn || currentAction.title)}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                  {isHe ? intel.aimHe : intel.aimEn}
                </p>
              </div>
            ) : totalCount === 0 ? (
              <div>
                <h3 className="text-sm font-black text-foreground">
                  {isHe ? 'התאוששות מכוונת' : 'Deliberate Recovery'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isHe ? 'לטעון אנרגיה בצורה מכוונת — מחר חוזרים חדים.' : 'Recharge intentionally — tomorrow we return sharp.'}
                </p>
              </div>
            ) : (
              <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                🏆 {isHe ? 'כל היעדים הושלמו' : 'All objectives complete'}
              </h3>
            )}
          </div>

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              {
                label: isHe ? 'יעדים' : 'Objectives',
                value: `${completedCount}/${totalCount}`,
                icon: Target,
                accent: progressPct === 100 ? 'text-emerald-400' : 'text-primary',
              },
              {
                label: isHe ? 'זמן' : 'Time',
                value: `${totalMinutes}′`,
                icon: Clock,
                accent: 'text-sky-400',
              },
              {
                label: isHe ? 'התקדמות' : 'Progress',
                value: `${progressPct}%`,
                icon: Sparkles,
                accent: progressPct === 100 ? 'text-emerald-400' : 'text-amber-400',
              },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 rounded-lg border border-border/20 bg-background/20 px-2.5 py-2">
                <s.icon className={cn("w-3.5 h-3.5 flex-shrink-0", s.accent)} />
                <div className="min-w-0">
                  <span className="text-xs font-black text-foreground block leading-none">{s.value}</span>
                  <span className="text-[8px] text-muted-foreground/60 font-medium">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Progress bar ── */}
          <div>
            <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  progressPct === 100
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : "bg-gradient-to-r from-primary via-primary to-primary/50"
                )}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* ── Execution rule ── */}
          <div className="flex items-start gap-2 rounded-lg border border-border/15 bg-background/15 p-2.5">
            <Lock className="w-3.5 h-3.5 text-primary/60 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground/80 leading-snug">
              {isHe
                ? 'כלל ביצוע: לא מחכים למוטיבציה — פעולה מייצרת מוטיבציה.'
                : 'Rule of execution: don\'t seek motivation first — action creates motivation.'
              }
            </p>
          </div>

          {/* ── CTA ── */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <Flag className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">
              {isHe ? 'עבור לבקרת משימות ובצע ←' : '→ Switch to Mission Control and execute'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
