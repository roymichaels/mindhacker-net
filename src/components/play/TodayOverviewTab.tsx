/**
 * TodayOverviewTab — Premium single-container "Daily Mission Card" in Web3/NFT style.
 * Inspired by the Profile page's OrbNFTCard aesthetic — rarity borders, shimmer,
 * gradient backgrounds, gamified stats. Everything visible without scrolling.
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
  Sun, Sunset, Moon, Zap, Flame, TrendingUp, Clock,
} from 'lucide-react';

const PILLAR_META: Record<string, { icon: typeof Target; labelHe: string; labelEn: string; color: string; bg: string }> = {
  vitality:      { icon: Heart,     labelHe: 'חיוניות',   labelEn: 'Vitality',      color: 'text-rose-400',    bg: 'bg-rose-500/15' },
  power:         { icon: Dumbbell,  labelHe: 'כוח',       labelEn: 'Power',          color: 'text-orange-400',  bg: 'bg-orange-500/15' },
  combat:        { icon: Target,    labelHe: 'לחימה',     labelEn: 'Combat',         color: 'text-red-400',     bg: 'bg-red-500/15' },
  focus:         { icon: Brain,     labelHe: 'פוקוס',     labelEn: 'Focus',          color: 'text-sky-400',     bg: 'bg-sky-500/15' },
  consciousness: { icon: Sparkles, labelHe: 'תודעה',     labelEn: 'Consciousness',  color: 'text-violet-400',  bg: 'bg-violet-500/15' },
  expansion:     { icon: Sparkles, labelHe: 'הרחבה',     labelEn: 'Expansion',      color: 'text-indigo-400',  bg: 'bg-indigo-500/15' },
  wealth:        { icon: Briefcase, labelHe: 'עושר',      labelEn: 'Wealth',         color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  influence:     { icon: Target,    labelHe: 'השפעה',     labelEn: 'Influence',      color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  relationships: { icon: Heart,     labelHe: 'מערכות יחסים', labelEn: 'Relationships', color: 'text-pink-400', bg: 'bg-pink-500/15' },
  business:      { icon: Briefcase, labelHe: 'עסקים',     labelEn: 'Business',       color: 'text-cyan-400',    bg: 'bg-cyan-500/15' },
  projects:      { icon: Target,    labelHe: 'פרויקטים',  labelEn: 'Projects',       color: 'text-teal-400',    bg: 'bg-teal-500/15' },
};

export function TodayOverviewTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const phasePlan = useWeeklyTacticalPlan();
  const { days, phase, isLoading } = phasePlan as any;
  const { plan, milestones } = useLifePlanWithMilestones();
  const xp = useXpProgress();
  const streak = useStreak();
  const energy = useEnergy();
  const rarity = getOrbRarity(xp.level);

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
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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

  const pillarEntries = Object.entries(groupedByPillar);

  // Total estimated minutes
  const totalMinutes = todayActions.reduce((sum, a) => sum + (a.estimatedMinutes || 0), 0);

  // Time of day
  const now = new Date();
  const hour = now.getHours();
  const greeting = isHe
    ? hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב'
    : hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const TimeIcon = hour < 12 ? Sun : hour < 17 ? Sunset : Moon;

  const dayName = now.toLocaleDateString(isHe ? 'he-IL' : 'en-US', { weekday: 'long' });

  // Pillar names for strategy sentence
  const pillarNames = pillarEntries
    .filter(([k]) => k !== 'general')
    .map(([k]) => {
      const meta = PILLAR_META[k];
      return meta ? (isHe ? meta.labelHe : meta.labelEn) : k;
    });

  // XP reward estimate (rough: 10xp per action)
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
        'bg-gradient-to-br',
        rarity.bgClass,
        rarity.borderClass,
        rarity.shimmer && 'shadow-xl',
        rarity.glowClass,
      )}
    >
      {/* Shimmer overlay for epic/legendary */}
      {rarity.shimmer && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              background: `linear-gradient(105deg, transparent 40%, ${rarity.color} 50%, transparent 60%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Subtle top glow line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-20 p-4 sm:p-5 space-y-4">

        {/* ── Header: Day Badge + Greeting ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TimeIcon className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">{dayName}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-none">
              {greeting}
            </h2>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className={cn(
              'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider',
              rarity.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400' :
              rarity.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
              rarity.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
              rarity.rarity === 'uncommon' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-zinc-500/20 text-zinc-400'
            )}>
              {isHe ? rarity.label.he : rarity.label.en}
            </div>
            <span className="text-[9px] text-muted-foreground font-medium">
              {isHe ? `יום ${currentDay}/100` : `Day ${currentDay}/100`}
            </span>
          </div>
        </div>

        {/* ── Strategy Context ── */}
        <p className="text-xs leading-relaxed text-muted-foreground font-medium">
          {totalCount > 0
            ? isHe
              ? `היום מתמקד ב${pillarNames.length > 0 ? pillarNames.join(', ') : 'התקדמות כללית'} — ${totalCount} משימות ב${Math.round(totalMinutes / 60) || 1} שעות.`
              : `Today focuses on ${pillarNames.length > 0 ? pillarNames.join(', ') : 'general progress'} — ${totalCount} missions in ~${Math.round(totalMinutes / 60) || 1}h.`
            : isHe ? 'יום מנוחה — נצל את הזמן להתבוננות.' : 'Rest day — use this time for reflection.'
          }
        </p>

        {/* ── Main Progress Ring + Stats ── */}
        <div className="flex items-center gap-4">
          {/* Circular progress */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted) / 0.2)" strokeWidth="3" />
              <motion.circle
                cx="18" cy="18" r="15" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 15}`}
                animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - progressPct / 100) }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-foreground leading-none">{progressPct}%</span>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-xl bg-background/40 border border-border/20 py-2 px-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
              <span className="text-xs font-bold text-foreground">{energy}</span>
              <span className="text-[8px] text-muted-foreground">{isHe ? 'אנרגיה' : 'Energy'}</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-background/40 border border-border/20 py-2 px-1">
              <Flame className="w-3.5 h-3.5 text-orange-400 mb-0.5" />
              <span className="text-xs font-bold text-foreground">{streak}</span>
              <span className="text-[8px] text-muted-foreground">{isHe ? 'סטריק' : 'Streak'}</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-background/40 border border-border/20 py-2 px-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
              <span className="text-xs font-bold text-foreground">+{xpReward}</span>
              <span className="text-[8px] text-muted-foreground">XP</span>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-border/20" />

        {/* ── Pillar Breakdown — compact horizontal pills ── */}
        {totalCount > 0 && (
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {isHe ? 'תחומים פעילים' : 'Active Domains'}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {pillarEntries.map(([pillar, actions]) => {
                const meta = PILLAR_META[pillar];
                const PillarIcon = meta?.icon || Target;
                const pillarLabel = meta ? (isHe ? meta.labelHe : meta.labelEn) : (isHe ? 'כללי' : 'General');
                const done = actions.filter(a => a.completed).length;

                return (
                  <div key={pillar} className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/20',
                    meta?.bg || 'bg-muted/20',
                  )}>
                    <PillarIcon className={cn('w-3 h-3', meta?.color || 'text-muted-foreground')} />
                    <span className={cn('text-[10px] font-bold', meta?.color || 'text-muted-foreground')}>
                      {pillarLabel}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-medium">
                      {done}/{actions.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Mission List — compact, no checkboxes, just info ── */}
        {totalCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {isHe ? 'משימות היום' : "Today's Missions"}
              </h3>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                <span>~{totalMinutes}{isHe ? ' דק׳' : 'm'}</span>
              </div>
            </div>
            <div className="space-y-1">
              {todayActions.slice(0, 8).map((action, i) => {
                const meta = PILLAR_META[action.focusArea || ''];
                return (
                  <div key={action.id} className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    action.completed
                      ? 'bg-primary/5 opacity-50'
                      : 'bg-background/30 border border-border/10',
                  )}>
                    <span className={cn(
                      'w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0',
                      action.completed ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'
                    )}>
                      {action.completed ? '✓' : i + 1}
                    </span>
                    <span className={cn(
                      'text-xs font-medium flex-1 min-w-0 truncate',
                      action.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    )}>
                      {isHe ? action.title : (action.titleEn || action.title)}
                    </span>
                    <span className="text-[9px] text-muted-foreground flex-shrink-0">
                      {action.estimatedMinutes}{isHe ? '′' : 'm'}
                    </span>
                  </div>
                );
              })}
              {todayActions.length > 8 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  +{todayActions.length - 8} {isHe ? 'נוספות' : 'more'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Phase & XP Bar (footer) ── */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
            <span>{isHe ? `שלב ${phase || 'A'}` : `Phase ${phase || 'A'}`}</span>
            <span>{xp.current}/{xp.required} XP</span>
          </div>
          <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              animate={{ width: `${xp.percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ── Empty state ── */}
        {totalCount === 0 && !isLoading && (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🌙</div>
            <h3 className="text-sm font-bold text-foreground">
              {isHe ? 'יום מנוחה' : 'Rest Day'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isHe ? 'אין משימות. תהנה או תכנן את המחר.' : 'No missions. Recharge or plan ahead.'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
