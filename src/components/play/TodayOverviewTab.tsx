/**
 * TodayOverviewTab — Default tab: text-focused, motivating daily overview.
 * Shows greeting, strategy context, all tasks explained, and why today's agenda matters.
 * No interactive buttons, no media player — just clarity and motivation.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import {
  Heart, Dumbbell, Brain, Briefcase, Target, Sparkles,
  Sun, Sunset, Moon, CheckCircle2,
} from 'lucide-react';

const PILLAR_META: Record<string, { icon: typeof Target; labelHe: string; labelEn: string; accent: string }> = {
  vitality:      { icon: Heart,     labelHe: 'חיוניות',   labelEn: 'Vitality',      accent: 'text-rose-400' },
  power:         { icon: Dumbbell,  labelHe: 'כוח',       labelEn: 'Power',          accent: 'text-orange-400' },
  combat:        { icon: Target,    labelHe: 'לחימה',     labelEn: 'Combat',         accent: 'text-red-400' },
  focus:         { icon: Brain,     labelHe: 'פוקוס',     labelEn: 'Focus',          accent: 'text-sky-400' },
  consciousness: { icon: Sparkles, labelHe: 'תודעה',     labelEn: 'Consciousness',  accent: 'text-violet-400' },
  expansion:     { icon: Sparkles, labelHe: 'הרחבה',     labelEn: 'Expansion',      accent: 'text-indigo-400' },
  wealth:        { icon: Briefcase, labelHe: 'עושר',      labelEn: 'Wealth',         accent: 'text-emerald-400' },
  influence:     { icon: Target,    labelHe: 'השפעה',     labelEn: 'Influence',      accent: 'text-amber-400' },
  relationships: { icon: Heart,     labelHe: 'מערכות יחסים', labelEn: 'Relationships', accent: 'text-pink-400' },
  business:      { icon: Briefcase, labelHe: 'עסקים',     labelEn: 'Business',       accent: 'text-cyan-400' },
  projects:      { icon: Target,    labelHe: 'פרויקטים',  labelEn: 'Projects',       accent: 'text-teal-400' },
};

export function TodayOverviewTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const phasePlan = useWeeklyTacticalPlan();
  const { days, phase, isLoading } = phasePlan as any;
  const { plan } = useLifePlanWithMilestones();

  const currentDay = useMemo(() => getCurrentDayInIsrael(plan?.start_date), [plan?.start_date]);

  const todayPlan: DayPlan | null = useMemo(() => {
    return (days || []).find((d: DayPlan) => d.isToday) || null;
  }, [days]);

  const todayActions: TacticalAction[] = useMemo(() => {
    if (!todayPlan) return [];
    return todayPlan.blocks.flatMap(b => b.actions);
  }, [todayPlan]);

  const completedCount = todayActions.filter(a => a.completed).length;
  const totalCount = todayActions.length;

  // Group actions by pillar
  const groupedByPillar = useMemo(() => {
    const groups: Record<string, TacticalAction[]> = {};
    for (const a of todayActions) {
      const key = a.focusArea || 'general';
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    }
    return groups;
  }, [todayActions]);

  // Time of day
  const now = new Date();
  const hour = now.getHours();
  const greeting = isHe
    ? hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב'
    : hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const TimeIcon = hour < 12 ? Sun : hour < 17 ? Sunset : Moon;

  const dayName = now.toLocaleDateString(isHe ? 'he-IL' : 'en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString(isHe ? 'he-IL' : 'en-US', { month: 'long', day: 'numeric' });

  // Strategy context sentence
  const pillarNames = Object.keys(groupedByPillar)
    .filter(k => k !== 'general')
    .map(k => {
      const meta = PILLAR_META[k];
      return meta ? (isHe ? meta.labelHe : meta.labelEn) : k;
    });

  const strategyContext = isHe
    ? totalCount > 0
      ? `היום מתמקד ב${pillarNames.length > 0 ? pillarNames.join(', ') : 'התקדמות כללית'} — ${totalCount} פעולות שנבחרו מתוך האסטרטגיה שלך ליום ${currentDay} מתוך 100.`
      : 'אין משימות מתוכננות להיום. יום מנוחה או זמן לתכנון מחדש.'
    : totalCount > 0
      ? `Today focuses on ${pillarNames.length > 0 ? pillarNames.join(', ') : 'general progress'} — ${totalCount} actions selected from your strategy for Day ${currentDay} of 100.`
      : 'No missions scheduled today. A rest day or time to recalibrate.';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* ── Greeting & Date ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 sm:p-7">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="flex items-center gap-2 mb-1">
          <TimeIcon className="w-4 h-4 text-primary/60" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{dayName}</span>
          <span className="text-[10px] text-muted-foreground tracking-wide">{dateStr}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight mt-2">
          {greeting}
        </h2>

        {plan && (
          <p className="text-[11px] text-muted-foreground/70 mt-1 font-medium">
            {isHe ? `יום ${currentDay} מתוך 100` : `Day ${currentDay} of 100`}
            {phase && <span className="text-primary/60"> · {isHe ? `שלב ${phase}` : `Phase ${phase}`}</span>}
          </p>
        )}

        <div className="my-4 h-px bg-border/30" />

        {/* Strategy context */}
        <p className="text-sm leading-relaxed text-muted-foreground font-medium">
          {strategyContext}
        </p>

        {/* Progress summary */}
        {totalCount > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-bold text-foreground tabular-nums">
              {completedCount}/{totalCount}
            </span>
          </div>
        )}
      </div>

      {/* ── Tasks by Pillar ── */}
      {totalCount > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            {isHe ? 'מה על הלוח היום' : "Today's Agenda"}
          </h3>

          {Object.entries(groupedByPillar).map(([pillar, actions]) => {
            const meta = PILLAR_META[pillar];
            const PillarIcon = meta?.icon || Target;
            const accent = meta?.accent || 'text-muted-foreground';
            const pillarLabel = meta ? (isHe ? meta.labelHe : meta.labelEn) : (isHe ? 'כללי' : 'General');

            return (
              <div key={pillar} className="rounded-xl border border-border/30 bg-card/50 overflow-hidden">
                {/* Pillar header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20">
                  <PillarIcon className={cn("w-3.5 h-3.5", accent)} />
                  <span className={cn("text-xs font-bold", accent)}>{pillarLabel}</span>
                  <span className="text-[10px] text-muted-foreground ms-auto">
                    {actions.filter(a => a.completed).length}/{actions.length}
                  </span>
                </div>

                {/* Actions */}
                <div className="divide-y divide-border/10">
                  {actions.map(action => (
                    <div key={action.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {action.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-semibold leading-snug",
                          action.completed ? "line-through text-muted-foreground" : "text-foreground"
                        )}>
                          {isHe ? action.title : (action.titleEn || action.title)}
                        </p>
                        {action.description && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed line-clamp-2">
                            {isHe ? action.description : (action.descriptionEn || action.description)}
                          </p>
                        )}
                        <span className="text-[10px] text-muted-foreground/50 mt-1 inline-block">
                          {action.estimatedMinutes}{isHe ? ' דק׳' : ' min'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {totalCount === 0 && !isLoading && (
        <div className="rounded-2xl border border-border/30 bg-card/50 p-8 text-center">
          <div className="text-4xl mb-3">🌙</div>
          <h3 className="text-base font-bold text-foreground mb-1">
            {isHe ? 'יום מנוחה' : 'Rest Day'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isHe ? 'אין משימות מתוכננות. תהנה מהיום או תכנן את המחר.' : 'No missions scheduled. Enjoy the day or plan ahead.'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
