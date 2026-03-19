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
  Crosshair, Sparkles, Lock, CheckCircle2,
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
  const remainingMinutes = todayActions.filter(a => !a.completed).reduce((s, a) => s + (a.estimatedMinutes || 0), 0);

  // Group actions by focus area for domain summary
  const domainSummary = useMemo(() => {
    const map: Record<string, { total: number; done: number; mins: number }> = {};
    for (const a of todayActions) {
      const k = a.focusArea || 'general';
      if (!map[k]) map[k] = { total: 0, done: 0, mins: 0 };
      map[k].total++;
      if (a.completed) map[k].done++;
      map[k].mins += a.estimatedMinutes || 0;
    }
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [todayActions]);

  const now = new Date();
  const seed = now.getDate() + remainingCount;
  const hour = now.getHours();
  const directive = isHe ? pick(DIRECTIVES_HE, seed) : pick(DIRECTIVES_EN, seed);
  const currentPillar = PILLAR_VIS[currentAction?.focusArea || ''] || DEFAULT_PILLAR;

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
      {/* ═══ PHASE ROADMAP ═══ */}
      {milestones.length > 0 && (
        <div className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(var(--primary)/0.06),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 px-3 pt-3 pb-2">
            {/* Header */}
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

            {/* ── Connected nodes ── */}
            <div className="relative">
              {/* Background connector line */}
              <div className="absolute top-4 inset-x-4 h-[2px] bg-border/20 z-0" />
              {/* Filled progress line */}
              <div
                className="absolute top-4 start-4 h-[2px] bg-gradient-to-r from-primary to-primary/60 z-[1] transition-all duration-500"
                style={{ width: `${Math.max(0, ((currentWeek - 1) / Math.max(1, milestones.length - 1)) * 100)}%` }}
              />

              <div className="relative z-[2] flex justify-between">
                {milestones.map((ms: any, i: number) => {
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
                      {/* Circle node */}
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

                      {/* Label */}
                      <span className={cn(
                        "text-[8px] font-bold",
                        isActive ? "text-primary" : isDone || isPast ? "text-muted-foreground/60" : "text-foreground/20"
                      )}>
                        {String.fromCharCode(64 + ms.week_number)}
                      </span>

                      {/* Active indicator dot */}
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

          {/* ── Selected Milestone Detail ── */}
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

        <div className="relative z-10 p-3.5 space-y-3">
          {/* Classification + Codename */}
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

          {/* ═══ CURRENT MISSION — hero card ═══ */}
          <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Crosshair className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-primary">
                  {isHe ? 'משימה נוכחית' : 'Current Mission'}
                </span>
              </div>
              {currentAction && (
                <span className="text-[9px] font-bold text-muted-foreground">
                  #{todayActions.indexOf(currentAction) + 1}/{totalCount}
                </span>
              )}
            </div>

            {currentAction ? (
              <>
                <h3 className="text-base font-black text-foreground leading-tight">
                  {isHe ? currentAction.title : (currentAction.titleEn || currentAction.title)}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md", currentPillar.color, currentPillar.bg)}>
                    {isHe ? currentPillar.labelHe : currentPillar.labelEn}
                  </span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {currentAction.estimatedMinutes}{isHe ? ' דק׳' : ' min'}
                  </span>
                  {currentAction.description && (
                    <span className="text-[9px] text-muted-foreground/60 line-clamp-1">
                      {currentAction.description.slice(0, 60)}{currentAction.description.length > 60 ? '…' : ''}
                    </span>
                  )}
                </div>
              </>
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

          {/* ═══ TODAY'S AGENDA — full task list ═══ */}
          {totalCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flag className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-foreground">
                    {isHe ? 'אג׳נדה יומית' : "Today's Agenda"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {remainingMinutes}{isHe ? ' דק׳' : 'm'}</span>
                  <span className="font-bold text-foreground">{completedCount}/{totalCount}</span>
                </div>
              </div>

              {/* Task list */}
              <div className="space-y-1">
                {todayActions.map((action, i) => {
                  const pv = PILLAR_VIS[action.focusArea || ''] || DEFAULT_PILLAR;
                  const isCurrent = currentAction?.id === action.id;

                  return (
                    <div
                      key={action.id}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all",
                        action.completed
                          ? "opacity-40"
                          : isCurrent
                            ? "bg-primary/[0.08] border border-primary/20"
                            : "bg-background/20 border border-border/10"
                      )}
                    >
                      {/* Index / check */}
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0",
                        action.completed ? "bg-primary/15 text-primary" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted/20 text-foreground/40"
                      )}>
                        {action.completed ? '✓' : i + 1}
                      </div>

                      {/* Pillar emoji */}
                      <span className="text-xs flex-shrink-0">{pv.emoji}</span>

                      {/* Title */}
                      <span className={cn(
                        "text-[11px] font-semibold flex-1 min-w-0 truncate",
                        action.completed ? "line-through text-muted-foreground" : "text-foreground"
                      )}>
                        {isHe ? action.title : (action.titleEn || action.title)}
                      </span>

                      {/* Duration */}
                      <span className="text-[9px] text-muted-foreground/50 flex-shrink-0 font-medium">
                        {action.estimatedMinutes}′
                      </span>

                      {isCurrent && <ChevronRight className="w-3 h-3 text-primary flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ DOMAIN BREAKDOWN ═══ */}
          {domainSummary.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {domainSummary.map(([domain, stats]) => {
                const pv = PILLAR_VIS[domain] || DEFAULT_PILLAR;
                return (
                  <div key={domain} className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border/15",
                    pv.bg
                  )}>
                    <span className="text-[10px]">{pv.emoji}</span>
                    <span className={cn("text-[9px] font-bold", pv.color)}>
                      {stats.done}/{stats.total}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ PROGRESS BAR ═══ */}
          {totalCount > 0 && (
            <div>
              <div className="flex items-center justify-between text-[9px] mb-1">
                <span className="text-muted-foreground font-medium">{isHe ? 'התקדמות היום' : "Today's Progress"}</span>
                <span className="font-black text-foreground">{progressPct}%</span>
              </div>
              <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
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
              {remainingCount > 0 && (
                <p className="text-[9px] text-muted-foreground/60 mt-1">
                  {isHe
                    ? `${remainingCount} משימות נותרו · ~${remainingMinutes} דקות`
                    : `${remainingCount} remaining · ~${remainingMinutes} min`}
                </p>
              )}
            </div>
          )}

          {/* ═══ EXECUTION RULE ═══ */}
          <div className="flex items-start gap-2 rounded-xl border border-border/15 bg-background/15 p-2.5">
            <Lock className="w-3.5 h-3.5 text-primary/60 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground/80 leading-snug">
              {isHe
                ? 'כלל ביצוע: לא מחכים למוטיבציה — פעולה מייצרת מוטיבציה.'
                : 'Rule of execution: don\'t seek motivation first — action creates motivation.'}
            </p>
          </div>

          {/* ═══ CTA ═══ */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary">
              {isHe ? 'עבור לבקרת משימות ובצע ←' : '→ Switch to Mission Control and execute'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
