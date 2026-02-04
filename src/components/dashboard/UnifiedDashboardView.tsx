import { useState } from 'react';
import { Loader2, Rocket, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ProfileDrawer } from './ProfileDrawer';
import { QuickAccessGrid } from './QuickAccessGrid';
import {
  ChecklistsModal,
  FocusModal,
} from './DashboardModals';
import { CharacterHUD } from './unified';

interface UnifiedDashboardViewProps {
  className?: string;
  compact?: boolean;
  onOpenProfile?: () => void;
}

type ModalType = 'tasks' | 'focus' | null;

export function UnifiedDashboardView({ className, onOpenProfile }: UnifiedDashboardViewProps) {
  const { isRTL, t, language } = useTranslation();
  const navigate = useNavigate();
  const dashboard = useUnifiedDashboard();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

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
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-card border text-center">
            <div className="text-2xl font-bold text-primary">1</div>
            <div className="text-xs text-muted-foreground">
              {t('welcome.level')}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border text-center">
            <div className="text-2xl font-bold text-orange-500">0</div>
            <div className="text-xs text-muted-foreground">
              {t('welcome.streak')}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border text-center">
            <div className="text-2xl font-bold text-yellow-500">0</div>
            <div className="text-xs text-muted-foreground">
              {t('welcome.tokens')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard - Launchpad complete
  return (
    <div 
      className={cn("space-y-4", className)}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* MapleStory-style Character HUD - Compact with Orb, XP, Stats - Clickable to open Profile */}
      <CharacterHUD
        identityTitle={dashboard.identityTitle}
        level={dashboard.level}
        xp={dashboard.xpProgress}
        streak={dashboard.streak}
        tokens={dashboard.tokens}
        onClick={handleOpenProfile}
      />
      {!onOpenProfile && <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />}

      {/* Quick Access Grid - Opens Modals */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t('welcome.quickAccess')}
        </h3>
        <QuickAccessGrid
          language={language}
          onOpenTasks={() => setActiveModal('tasks')}
          onOpenFocus={() => setActiveModal('focus')}
          hasFocusPlan={!!dashboard.activeFocusPlan}
        />
      </div>

      {/* Modals - Only tasks and focus remain in dashboard */}
      <ChecklistsModal 
        open={activeModal === 'tasks'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language} 
      />
      <FocusModal 
        open={activeModal === 'focus'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language}
        focusPlan={dashboard.activeFocusPlan}
      />
    </div>
  );
}

export default UnifiedDashboardView;
