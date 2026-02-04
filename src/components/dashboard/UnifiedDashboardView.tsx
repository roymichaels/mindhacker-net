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

  // Main dashboard - Stats-First Command Center
  // All components handle empty/zero data gracefully - no special empty state needed
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
