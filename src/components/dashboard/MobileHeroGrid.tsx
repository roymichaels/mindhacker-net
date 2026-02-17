/**
 * MobileHeroGrid - Compact 3-column mobile-only grid
 * RTL: HUD (right) | Daily Session (middle) | Plan+Tasks (left)
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useGameState } from '@/contexts/GameStateContext';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useTokens } from '@/hooks/useGameState';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, Flame, Gem, Star, ListChecks, Calendar, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import { useHaptics } from '@/hooks/useHaptics';

interface MobileHeroGridProps {
  planData: {
    currentWeek: number;
    progressPercent: number;
    currentMonth: number;
  } | null | undefined;
  habitsCount?: number;
  habitsTotal?: number;
  tasksCount?: number;
  tasksTotal?: number;
}

export function MobileHeroGrid({ planData, habitsCount = 0, habitsTotal = 0, tasksCount = 0, tasksTotal = 0 }: MobileHeroGridProps) {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useTokens();
  const { suggestedGoal } = useDailyHypnosis();
  const { impact } = useHaptics();

  const handleStartDailySession = () => {
    impact('medium');
    const params = new URLSearchParams();
    params.set('duration', '15');
    params.set('goal', suggestedGoal);
    params.set('daily', 'true');
    navigate(`/hypnosis/session?${params.toString()}`);
  };

  const identityTitle = dashboard.identityTitle;

  return (
    <div className="grid grid-cols-3 gap-1.5 md:hidden">
      {/* RIGHT COL (first in RTL) - HUD */}
      <div className="rounded-xl border border-border bg-card p-2 flex flex-col items-center gap-1.5 min-h-0">
        {/* Orb */}
        <div className="relative" style={{ width: 44, height: 44 }}>
          <PersonalizedOrb size={44} state="idle" />
        </div>
        
        {/* Identity */}
        {identityTitle && (
          <div className="flex items-center gap-1 min-w-0 w-full justify-center">
            <span className="text-xs flex-shrink-0">{identityTitle.icon}</span>
            <span className="text-[9px] font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              {language === 'he' ? identityTitle.title : identityTitle.titleEn}
            </span>
          </div>
        )}

        {/* Pills row */}
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
            <Star className="h-2.5 w-2.5" />{xp.level}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-yellow-500">
            <Gem className="h-2.5 w-2.5" />{tokens.balance}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-orange-500">
            <Flame className="h-2.5 w-2.5" />{streak.streak}
          </span>
        </div>

        {/* Micro metric bars */}
        <div className="w-full space-y-1 px-0.5">
          {[
            { label: language === 'he' ? 'מוכנות' : 'Ready', value: Math.min(100, xp.percentage), color: 'bg-green-500' },
            { label: language === 'he' ? 'בהירות' : 'Clarity', value: dashboard.selfConcepts.length > 0 ? 70 : 20, color: 'bg-blue-500' },
            { label: language === 'he' ? 'תודעה' : 'Aware', value: dashboard.values.length > 0 ? 60 : 15, color: 'bg-purple-500' },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-1">
              <span className="text-[7px] text-muted-foreground w-6 text-end truncate">{m.label}</span>
              <div className="flex-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", m.color)} style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE COL - Daily Session Hero */}
      <div
        className="rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 p-2 flex flex-col items-center justify-center gap-1 cursor-pointer active:brightness-90 transition-all touch-manipulation"
        onClick={handleStartDailySession}
      >
        <span className="text-2xl">✨</span>
        <h3 className="text-[10px] font-bold text-white leading-tight text-center">
          {language === 'he' ? 'הסשן היומי שלך' : 'Daily Session'}
        </h3>
        <span className="text-[9px] text-white/70 flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" />15 {language === 'he' ? 'דק׳' : 'min'}
        </span>
        <div className="flex items-center gap-1 bg-background/90 text-foreground rounded-full px-2.5 py-1 text-[9px] font-semibold shadow-md mt-0.5">
          <Play className="w-2.5 h-2.5" />
          {language === 'he' ? 'התחל' : 'Start'}
        </div>
      </div>

      {/* LEFT COL (last in RTL) - Plan Modules */}
      <div className="rounded-xl border border-border bg-card p-2 flex flex-col gap-1.5 min-h-0">
        {/* Habits mini */}
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">{language === 'he' ? 'הרגלים' : 'Habits'}</span>
              <span className="text-[8px] font-bold">{habitsCount}/{habitsTotal}</span>
            </div>
            <div className="h-1 rounded-full bg-muted/50 overflow-hidden mt-0.5">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${habitsTotal > 0 ? (habitsCount / habitsTotal) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* 90-Day Plan mini */}
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">{language === 'he' ? '90 יום' : '90 Day'}</span>
              <span className="text-[8px] font-bold">{language === 'he' ? `ש׳${planData?.currentWeek || 1}` : `W${planData?.currentWeek || 1}`}</span>
            </div>
            <div className="h-1 rounded-full bg-muted/50 overflow-hidden mt-0.5">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${planData?.progressPercent || 0}%` }} />
            </div>
          </div>
        </div>

        {/* Tasks mini */}
        <div className="flex items-center gap-1">
          <ListChecks className="w-3 h-3 text-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">{language === 'he' ? 'משימות' : 'Tasks'}</span>
              <span className="text-[8px] font-bold">{tasksCount}/{tasksTotal}</span>
            </div>
            <div className="h-1 rounded-full bg-muted/50 overflow-hidden mt-0.5">
              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${tasksTotal > 0 ? (tasksCount / tasksTotal) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
