import { useState } from 'react';
import { Loader2, Rocket, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ProfileDrawer } from './ProfileDrawer';
import {
  StatsGrid,
  NextActionBanner,
  LifeAnalysisChart,
  TodaysHabitsCard,
  PlanProgressCard,
  QuickActionsBar,
} from './v2';

interface UnifiedDashboardViewProps {
  className?: string;
  compact?: boolean;
  onOpenProfile?: () => void;
  onOpenHypnosis?: () => void;
  onOpenChat?: () => void;
}

export function UnifiedDashboardView({ 
  className, 
  onOpenProfile,
  onOpenHypnosis,
  onOpenChat,
}: UnifiedDashboardViewProps) {
  const { isRTL, t } = useTranslation();
  const navigate = useNavigate();
  const dashboard = useUnifiedDashboard();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleOpenProfile = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      setProfileOpen(true);
    }
  };

  if (dashboard.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state OR launchpad not complete - show Game Start screen
  if (dashboard.isEmpty || !isLaunchpadComplete) {
    return (
      <div className="space-y-6">
        {/* Welcome Card with game theme */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-6 sm:p-8">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-2">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold">
              {t('welcome.yourJourneyBegins')}
            </h2>
            
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('auroraLanding.lifePlanSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                onClick={() => navigate('/launchpad')}
                size="lg"
                className="gap-2"
              >
                <Rocket className="h-5 w-5" />
                {t('welcome.startTransformationJourney')}
              </Button>
              
              <Button 
                onClick={() => navigate('/aurora')}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Sparkles className="h-5 w-5" />
                {t('welcome.chatWithAurora')}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Preview */}
        <StatsGrid />
      </div>
    );
  }

  // Main dashboard - Stats-First Command Center
  return (
    <div 
      className={cn("space-y-5", className)}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {!onOpenProfile && <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />}

      {/* Zone 1: Next Action Banner - Priority-based single action */}
      <NextActionBanner
        onOpenHypnosis={onOpenHypnosis}
        onOpenChat={onOpenChat}
      />

      {/* Zone 2: Stats Grid - Level, Streak, Weekly XP, Tokens */}
      <StatsGrid />

      {/* Zone 3: Life Analysis Chart */}
      <LifeAnalysisChart />

      {/* Zone 4: Habits + Plan Progress (2 columns on desktop) */}
      <div className="grid gap-4 md:grid-cols-2">
        <TodaysHabitsCard />
        <PlanProgressCard />
      </div>

      {/* Zone 5: Quick Actions Bar */}
      <QuickActionsBar
        onOpenChat={onOpenChat}
        onOpenHypnosis={onOpenHypnosis}
      />
    </div>
  );
}

export default UnifiedDashboardView;
