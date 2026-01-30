import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { Progress } from '@/components/ui/progress';
import { LaunchpadProgress } from '@/components/launchpad';
import { cn } from '@/lib/utils';
import {
  StatsBar,
  XpProgressSection,
  EgoStateDisplay,
  LifeDirectionHighlight,
  CurrentFocusCard,
  DailyAnchorsDisplay,
  IdentityProfileCard,
  CommitmentsCard,
  TraitsCard,
  ChecklistsCard,
} from './unified';

interface UnifiedDashboardViewProps {
  className?: string;
  compact?: boolean;
}

export function UnifiedDashboardView({ className, compact = false }: UnifiedDashboardViewProps) {
  const { t, isRTL } = useTranslation();
  const dashboard = useUnifiedDashboard();
  const { isLaunchpadComplete } = useLaunchpadProgress();

  if (dashboard.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (dashboard.isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{t('unified.empty.title')}</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {t('unified.empty.subtitle')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("space-y-4", className)}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Launchpad Progress (if not complete) */}
      {!isLaunchpadComplete && (
        <LaunchpadProgress compact />
      )}

      {/* XP Progress - Full Width */}
      <XpProgressSection
        level={dashboard.level}
        current={dashboard.xpProgress.current}
        required={dashboard.xpProgress.required}
        percentage={dashboard.xpProgress.percentage}
      />

      {/* Stats Bar */}
      <StatsBar
        streak={dashboard.streak}
        tokens={dashboard.tokens}
        sessions={dashboard.totalSessions}
        level={dashboard.level}
      />

      {/* Ego State */}
      <EgoStateDisplay
        id={dashboard.egoState.id}
        name={dashboard.egoState.name}
        nameHe={dashboard.egoState.nameHe}
        icon={dashboard.egoState.icon}
        gradient={dashboard.egoState.gradient}
      />

      {/* Life Direction - Highlighted */}
      {dashboard.lifeDirection && (
        <LifeDirectionHighlight
          content={dashboard.lifeDirection.content}
          clarityScore={dashboard.lifeDirection.clarityScore}
        />
      )}

      {/* Two Column Grid */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Checklists / My Tasks - Full Width on top */}
          <ChecklistsCard />

          {/* Current Focus */}
          {dashboard.activeFocusPlan && (
            <CurrentFocusCard
              title={dashboard.activeFocusPlan.title}
              description={dashboard.activeFocusPlan.description}
              durationDays={dashboard.activeFocusPlan.durationDays}
              daysRemaining={dashboard.activeFocusPlan.daysRemaining}
            />
          )}

          {/* Daily Anchors */}
          <DailyAnchorsDisplay anchors={dashboard.dailyAnchors} />

          {/* Identity Profile */}
          <IdentityProfileCard
            values={dashboard.values}
            principles={dashboard.principles}
            selfConcepts={dashboard.selfConcepts}
          />

          {/* Character Traits */}
          <TraitsCard traitIds={dashboard.characterTraits} />

          {/* Commitments */}
          <CommitmentsCard commitments={dashboard.activeCommitments} />
        </div>
      )}

      {/* Life Model Progress (if not complete) */}
      {!dashboard.isLifeModelComplete && dashboard.onboardingProgress > 0 && (
        <div className="p-4 rounded-xl bg-muted/50 border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('unified.progress.lifeModel')}
            </span>
            <span className="font-medium">{dashboard.onboardingProgress}%</span>
          </div>
          <Progress value={dashboard.onboardingProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}

export default UnifiedDashboardView;
