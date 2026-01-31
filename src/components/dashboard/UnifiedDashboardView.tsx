import { useState } from 'react';
import { Loader2, Rocket, Sparkles, UserCog } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { Progress } from '@/components/ui/progress';
import { LaunchpadProgress } from '@/components/launchpad';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ProfileDrawer } from './ProfileDrawer';
import { QuickAccessGrid } from './QuickAccessGrid';
import {
  AIAnalysisModal,
  LifePlanModal,
  ChecklistsModal,
  ConsciousnessModal,
  BehavioralModal,
  IdentityModal,
  TraitsModal,
  CommitmentsModal,
  AnchorsModal,
  FocusModal,
} from './DashboardModals';
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
  LaunchpadSummaryCard,
  ConsciousnessCard,
  BehavioralInsightsCard,
} from './unified';
import LifePlanCard from './unified/LifePlanCard';

interface UnifiedDashboardViewProps {
  className?: string;
  compact?: boolean;
}

type ModalType = 'ai' | 'plan' | 'tasks' | 'consciousness' | 'behavioral' | 'identity' | 'traits' | 'commitments' | 'anchors' | 'focus' | null;

export function UnifiedDashboardView({ className, compact = false }: UnifiedDashboardViewProps) {
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const dashboard = useUnifiedDashboard();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  if (dashboard.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If launchpad is complete - show compact dashboard with quick access grid
  if (isLaunchpadComplete) {
    return (
      <div 
        className={cn("space-y-4", className)}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* XP Progress */}
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

        {/* Edit Profile Button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setProfileOpen(true)}
        >
          <UserCog className="h-4 w-4" />
          {language === 'he' ? 'ערוך פרופיל' : 'Edit Profile'}
        </Button>
        <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />

        {/* Quick Access Grid - Opens Modals */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {language === 'he' ? 'גישה מהירה' : 'Quick Access'}
          </h3>
          <QuickAccessGrid
            language={language}
            onOpenAI={() => setActiveModal('ai')}
            onOpenPlan={() => setActiveModal('plan')}
            onOpenTasks={() => setActiveModal('tasks')}
            onOpenConsciousness={() => setActiveModal('consciousness')}
            onOpenBehavioral={() => setActiveModal('behavioral')}
            onOpenIdentity={() => setActiveModal('identity')}
            onOpenTraits={() => setActiveModal('traits')}
            onOpenCommitments={() => setActiveModal('commitments')}
            onOpenAnchors={() => setActiveModal('anchors')}
            onOpenFocus={() => setActiveModal('focus')}
            hasFocusPlan={!!dashboard.activeFocusPlan}
          />
        </div>

        {/* All Modals */}
        <AIAnalysisModal 
          open={activeModal === 'ai'} 
          onOpenChange={(open) => !open && setActiveModal(null)} 
          language={language} 
        />
        <LifePlanModal 
          open={activeModal === 'plan'} 
          onOpenChange={(open) => !open && setActiveModal(null)} 
          language={language} 
        />
        <ChecklistsModal 
          open={activeModal === 'tasks'} 
          onOpenChange={(open) => !open && setActiveModal(null)} 
          language={language} 
        />
        <ConsciousnessModal 
          open={activeModal === 'consciousness'} 
          onOpenChange={(open) => !open && setActiveModal(null)} 
          language={language} 
        />
        <BehavioralModal 
          open={activeModal === 'behavioral'} 
          onOpenChange={(open) => !open && setActiveModal(null)} 
          language={language} 
        />
        <IdentityModal 
          open={activeModal === 'identity'} 
          onOpenChange={(open) => !open && setActiveModal(null)} 
          language={language}
          values={dashboard.values}
          principles={dashboard.principles}
          selfConcepts={dashboard.selfConcepts}
          identityTitle={dashboard.identityTitle}
        />
        <TraitsModal 
          open={activeModal === 'traits'} 
          onOpenChange={(open) => !open && setActiveModal(null)} 
          language={language}
        />
        <CommitmentsModal 
          open={activeModal === 'commitments'} 
          onOpenChange={(open) => !open && setActiveModal(null)} 
          language={language}
          commitments={dashboard.activeCommitments}
        />
        <AnchorsModal 
          open={activeModal === 'anchors'} 
          onOpenChange={(open) => !open && setActiveModal(null)} 
          language={language}
          anchors={dashboard.dailyAnchors}
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

  // Empty state - Game Start screen for new users (not completed launchpad)
  if (dashboard.isEmpty) {
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
              {language === 'he' ? 'המסע שלך מתחיל' : 'Your Journey Begins'}
            </h2>
            
            <p className="text-muted-foreground max-w-md mx-auto">
              {language === 'he' 
                ? 'התחל שיחה עם אורורה או השלם סשן כדי להתחיל לבנות את מודל החיים שלך.'
                : 'Start a chat with Aurora or complete a session to begin building your life model.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                onClick={() => navigate('/aurora')}
                size="lg"
                className="gap-2"
              >
                <Sparkles className="h-5 w-5" />
                {language === 'he' ? 'שוחח עם אורורה' : 'Chat with Aurora'}
              </Button>
              
              <Button 
                onClick={() => navigate('/launchpad')}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Rocket className="h-5 w-5" />
                {language === 'he' ? 'התחל Launchpad' : 'Start Launchpad'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Preview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-card border text-center">
            <div className="text-2xl font-bold text-primary">1</div>
            <div className="text-xs text-muted-foreground">
              {language === 'he' ? 'רמה' : 'Level'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border text-center">
            <div className="text-2xl font-bold text-orange-500">0</div>
            <div className="text-xs text-muted-foreground">
              {language === 'he' ? 'סטריק' : 'Streak'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border text-center">
            <div className="text-2xl font-bold text-yellow-500">0</div>
            <div className="text-xs text-muted-foreground">
              {language === 'he' ? 'טוקנים' : 'Tokens'}
            </div>
          </div>
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
          {/* Life Plan Card */}
          <LifePlanCard />

          {/* Checklists / My Tasks */}
          <ChecklistsCard />

          {/* Consciousness Analysis - NEW */}
          <ConsciousnessCard />

          {/* Behavioral Insights - NEW */}
          <BehavioralInsightsCard />

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
            identityTitle={dashboard.identityTitle}
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
