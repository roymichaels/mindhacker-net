/**
 * TodayOverviewTab — "Mission Briefing" card.
 * Secret-agent / RPG gamified aesthetic. Emotional, strategic, zero fluff.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import { getOrbRarity } from '@/lib/orbRarity';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import {
  Heart, Dumbbell, Brain, Briefcase, Target, Sparkles,
  Sun, Sunset, Moon, Zap, Flame, TrendingUp, Clock, Shield,
} from 'lucide-react';

const PILLAR_META: Record<string, { icon: typeof Target; he: string; en: string; color: string; bg: string }> = {
  vitality:      { icon: Heart,     he: 'חיוניות',   en: 'Vitality',      color: 'text-rose-400',    bg: 'bg-rose-500/15' },
  power:         { icon: Dumbbell,  he: 'כוח',       en: 'Power',          color: 'text-orange-400',  bg: 'bg-orange-500/15' },
  combat:        { icon: Shield,    he: 'לחימה',     en: 'Combat',         color: 'text-red-400',     bg: 'bg-red-500/15' },
  focus:         { icon: Brain,     he: 'פוקוס',     en: 'Focus',          color: 'text-sky-400',     bg: 'bg-sky-500/15' },
  consciousness: { icon: Sparkles, he: 'תודעה',     en: 'Consciousness',  color: 'text-violet-400',  bg: 'bg-violet-500/15' },
  expansion:     { icon: Sparkles, he: 'הרחבה',     en: 'Expansion',      color: 'text-indigo-400',  bg: 'bg-indigo-500/15' },
  wealth:        { icon: Briefcase, he: 'עושר',      en: 'Wealth',         color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  influence:     { icon: Target,    he: 'השפעה',     en: 'Influence',      color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  relationships: { icon: Heart,     he: 'מערכות יחסים', en: 'Relationships', color: 'text-pink-400', bg: 'bg-pink-500/15' },
  business:      { icon: Briefcase, he: 'עסקים',     en: 'Business',       color: 'text-cyan-400',    bg: 'bg-cyan-500/15' },
  projects:      { icon: Target,    he: 'פרויקטים',  en: 'Projects',       color: 'text-teal-400',    bg: 'bg-teal-500/15' },
};

// Emotional greetings based on time + progress
function getGreeting(isHe: boolean, hour: number, pct: number) {
  if (pct === 100) return isHe ? 'מלך. סיימת הכל.' : 'King. All done.';
  if (hour < 6) return isHe ? 'הלוחם שלא ישן' : 'The warrior who doesn\'t sleep';
  if (hour < 12) return isHe ? 'בוקר טוב' : 'Good Morning';
  if (hour < 17) return isHe ? 'צהריים טובים' : 'Good Afternoon';
  if (hour < 21) return isHe ? 'ערב טוב' : 'Good Evening';
  return isHe ? 'עוד לא נגמר' : 'Not done yet';
}

function getSubGreeting(isHe: boolean, hour: number, total: number, totalMin: number, pct: number) {
  if (total === 0) return isHe ? 'יום חופשי. נצל אותו בחוכמה.' : 'Day off. Use it wisely.';
  if (pct === 100) return isHe ? 'כל המשימות הושלמו. מחר — שלב חדש.' : 'All missions complete. Tomorrow — new level.';
  const hours = Math.round(totalMin / 60) || 1;
  if (isHe) return `${total} משימות ב${hours} שעות. המשימה שלך — להוכיח שאתה שווה את זה.`;
  return `${total} missions in ~${hours}h. Your mission — prove you're worth it.`;
}

export function TodayOverviewTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const phasePlan = useWeeklyTacticalPlan();
  const { days, phase, isLoading } = phasePlan as any;
  const { plan } = useLifePlanWithMilestones();
  const xp = useXpProgress();
  const streak = useStreak();
  const energy = useEnergy();
  const rarity = getOrbRarity(xp.level);

  const currentDay = useMemo(() => getCurrentDayInIsrael(plan?.start_date), [plan?.start_date]);

  const todayPlan: DayPlan | null = useMemo(() =>
    (days || []).find((d: DayPlan) => d.isToday) || null, [days]);

  const todayActions: TacticalAction[] = useMemo(() =>
    todayPlan ? todayPlan.blocks.flatMap(b => b.actions) : [], [todayPlan]);

  const completedCount = todayActions.filter(a => a.completed).length;
  const totalCount = todayActions.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalMinutes = todayActions.reduce((s, a) => s + (a.estimatedMinutes || 0), 0);

  const grouped = useMemo(() => {
    const g: Record<string, { total: number; done: number }> = {};
    for (const a of todayActions) {
      const k = a.focusArea || 'general';
      if (!g[k]) g[k] = { total: 0, done: 0 };
      g[k].total++;
      if (a.completed) g[k].done++;
    }
    return Object.entries(g);
  }, [todayActions]);

  const now = new Date();
  const hour = now.getHours();
  const TimeIcon = hour < 12 ? Sun : hour < 17 ? Sunset : Moon;
  const dayName = now.toLocaleDateString(isHe ? 'he-IL' : 'en-US', { weekday: 'long' });
  const xpReward = totalCount * 10;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      dir={isHe ? 'rtl' : 'ltr'}
      className={cn(
        'relative rounded-2xl border-2 overflow-hidden',
        'bg-gradient-to-br from-card via-card to-background',
        rarity.borderClass,
        rarity.shimmer && 'shadow-xl',
        rarity.glowClass,
      )}
    >
      {/* Shimmer */}
      {rarity.shimmer && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            background: `linear-gradient(105deg, transparent 40%, ${rarity.color} 50%, transparent 60%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="relative z-20 p-4 space-y-4">

        {/* ── HEADER: Greeting + Day/Rarity ── */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <TimeIcon className="w-3 h-3 text-primary/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/80">{dayName}</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground leading-none mb-1">
              {getGreeting(isHe, hour, progressPct)}
            </h2>
            <p className="text-[11px] leading-snug text-muted-foreground/80 font-medium">
              {getSubGreeting(isHe, hour, totalCount, totalMinutes, progressPct)}
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0 ms-3">
            <div className={cn(
              'px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider',
              rarity.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400' :
              rarity.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
              rarity.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
              rarity.rarity === 'uncommon' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-muted/30 text-muted-foreground'
            )}>
              {isHe ? rarity.label.he : rarity.label.en}
            </div>
            <span className="text-[9px] text-muted-foreground/60 font-medium">
              {isHe ? `יום ${currentDay}/100` : `Day ${currentDay}/100`}
            </span>
          </div>
        </div>

        {/* ── STATS ROW: 4 compact stat cells ── */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { icon: TrendingUp, value: `+${xpReward}`, label: 'XP', color: 'text-emerald-400' },
            { icon: Zap, value: energy.balance, label: isHe ? 'אנרגיה' : 'Energy', color: 'text-amber-400' },
            { icon: Flame, value: streak.streak, label: isHe ? 'סטריק' : 'Streak', color: 'text-orange-400' },
            { icon: Clock, value: `${totalMinutes}'`, label: isHe ? 'זמן' : 'Time', color: 'text-sky-400' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center rounded-xl bg-background/30 border border-border/15 py-2 gap-0.5">
              <s.icon className={cn("w-3 h-3", s.color)} />
              <span className="text-xs font-black text-foreground leading-none">{s.value}</span>
              <span className="text-[7px] text-muted-foreground/70 font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── ACTIVE DOMAINS — pillar pills with progress ── */}
        {grouped.length > 0 && (
          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
              {isHe ? 'תחומים פעילים' : 'Active Domains'}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {grouped.map(([pillar, { total, done }]) => {
                const meta = PILLAR_META[pillar];
                const PIcon = meta?.icon || Target;
                return (
                  <div key={pillar} className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/15',
                    meta?.bg || 'bg-muted/15',
                  )}>
                    <PIcon className={cn('w-3 h-3', meta?.color || 'text-muted-foreground')} />
                    <span className={cn('text-[10px] font-bold', meta?.color || 'text-muted-foreground')}>
                      {isHe ? meta?.he : meta?.en || pillar}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 font-semibold">{done}/{total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MISSION LIST — numbered, tight, emotional ── */}
        {totalCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                {isHe ? 'משימות היום' : "Today's Missions"}
              </h3>
              <span className="text-[9px] text-muted-foreground/50 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" /> ~{totalMinutes}{isHe ? ' דק׳' : 'm'}
              </span>
            </div>
            <div className="space-y-1">
              {todayActions.map((action, i) => (
                <div key={action.id} className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg',
                  action.completed
                    ? 'bg-primary/[0.04] opacity-40'
                    : 'bg-background/20 border border-border/10',
                )}>
                  <span className={cn(
                    'w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0',
                    action.completed ? 'bg-primary/15 text-primary' : 'bg-muted/20 text-foreground/50'
                  )}>
                    {action.completed ? '✓' : i + 1}
                  </span>
                  <span className={cn(
                    'text-xs font-semibold flex-1 min-w-0 truncate',
                    action.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  )}>
                    {isHe ? action.title : (action.titleEn || action.title)}
                  </span>
                  <span className="text-[9px] text-muted-foreground/50 flex-shrink-0 font-medium">
                    {action.estimatedMinutes}′
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROGRESS BAR FOOTER ── */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/60 mb-1 font-medium">
            <span>{isHe ? `שלב ${phase || 'A'}` : `Phase ${phase || 'A'}`}</span>
            <span className="font-bold text-foreground/70">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-muted/15 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                progressPct === 100
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "bg-gradient-to-r from-primary to-primary/60"
              )}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ── Empty state ── */}
        {totalCount === 0 && !isLoading && (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🌙</div>
            <h3 className="text-sm font-bold text-foreground">{isHe ? 'יום מנוחה' : 'Rest Day'}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isHe ? 'הגוף שלך מתאושש. המוח שלך מתחדש. מחר חוזרים.' : 'Your body recovers. Your mind resets. Tomorrow we go again.'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
