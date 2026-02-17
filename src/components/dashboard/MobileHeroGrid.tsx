/**
 * MobileHeroGrid - 3-row (mobile) / 3-column (desktop) hero grid
 * RTL order: HUD (right/first) | Daily Session (middle) | Plan+Tasks (left/last)
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useTokens } from '@/hooks/useGameState';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Play, Clock, Flame, Gem, Star, ListChecks, Calendar, CheckCircle2, TrendingUp, Eye, Zap } from 'lucide-react';
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
  const readinessVal = Math.min(100, xp.percentage || 85);
  const clarityVal = dashboard.selfConcepts.length > 0 ? 65 : 20;
  const consciousnessVal = dashboard.values.length > 0 ? 72 : 15;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {/* ===== ROW 1 / RIGHT COL - HUD ===== */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/30 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-950 p-4 flex flex-col items-center gap-3">
        {/* Orb */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl scale-150" />
          <div className="relative" style={{ width: 64, height: 64 }}>
            <PersonalizedOrb size={64} state="idle" />
          </div>
        </div>

        {/* Identity title */}
        {identityTitle && (
          <div className="flex items-center gap-1.5">
            <span className="text-base">{identityTitle.icon}</span>
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {language === 'he' ? identityTitle.title : identityTitle.titleEn}
            </span>
          </div>
        )}

        {/* Pills */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
            <Star className="h-3 w-3" />Lv.{xp.level}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
            <Gem className="h-3 w-3" />{tokens.balance}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <Flame className="h-3 w-3" />{streak.streak}
          </span>
        </div>

        {/* 3 metric cards row */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {[
            { icon: TrendingUp, label: language === 'he' ? 'מוכנות' : 'Readiness', value: `${readinessVal}%`, color: 'text-green-500' },
            { icon: Eye, label: language === 'he' ? 'בהירות' : 'Clarity', value: `${clarityVal}%`, color: 'text-blue-500' },
            { icon: Zap, label: language === 'he' ? 'תודעה' : 'Awareness', value: String(consciousnessVal), color: 'text-purple-500' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-muted/30 dark:bg-muted/10 border border-border/50 p-2.5 flex flex-col items-center gap-1">
              <m.icon className={cn("w-4 h-4", m.color)} />
              <span className="text-lg font-bold leading-none">{m.value}</span>
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ROW 2 / MIDDLE COL - Daily Session Hero ===== */}
      <div
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer active:brightness-90 transition-all touch-manipulation min-h-[160px]"
        onClick={handleStartDailySession}
      >
        <div className="absolute inset-0 bg-white/5" />
        <span className="text-4xl">✨</span>
        <h3 className="text-lg font-bold text-white leading-tight text-center">
          {language === 'he' ? 'הסשן היומי שלך' : 'Your Daily Session'}
        </h3>
        <span className="text-sm text-white/80 flex items-center gap-1">
          <Clock className="w-4 h-4" />15 {language === 'he' ? 'דקות' : 'minutes'}
        </span>
        <div className="flex items-center gap-1.5 bg-background/90 text-foreground rounded-full px-5 py-2 text-sm font-semibold shadow-lg mt-1">
          <Play className="w-4 h-4" />
          {language === 'he' ? 'התחל עכשיו' : 'Start Now'}
        </div>
      </div>

      {/* ===== ROW 3 / LEFT COL - Plan Modules ===== */}
      <div className="grid grid-cols-3 gap-2">
        {/* Habits card */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-xs font-semibold text-center">{language === 'he' ? 'הרגלים' : 'Habits'}</span>
          <span className="text-lg font-bold">{habitsCount}/{habitsTotal}</span>
          <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${habitsTotal > 0 ? (habitsCount / habitsTotal) * 100 : 0}%` }} />
          </div>
        </div>

        {/* 90-Day Plan card */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-center">{language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}</span>
          <span className="text-lg font-bold">{language === 'he' ? `שבוע ${planData?.currentWeek || 1}` : `Week ${planData?.currentWeek || 1}`}</span>
          <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${planData?.progressPercent || 0}%` }} />
          </div>
        </div>

        {/* Tasks card */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-2">
          <ListChecks className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-semibold text-center">{language === 'he' ? 'משימות' : 'Tasks'}</span>
          <span className="text-lg font-bold">{tasksCount}/{tasksTotal}</span>
          <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${tasksTotal > 0 ? (tasksCount / tasksTotal) * 100 : 0}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
