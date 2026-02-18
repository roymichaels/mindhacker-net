import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Zap, Star, Target, Lock, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { RecentSessions } from '@/components/hypnosis';
import { useHaptics } from '@/hooks/useHaptics';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useGameState } from '@/contexts/GameStateContext';
import { useEnergy } from '@/hooks/useGameState';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { ENERGY_COSTS } from '@/lib/energyCosts';
import { hasFreeWeeklySession } from '@/lib/freeWeeklySession';
import EnergySpendModal from '@/components/energy/EnergySpendModal';
import { cn } from '@/lib/utils';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';
import { toast } from 'sonner';

const QUICK_SESSIONS = [
  { id: 'calm', duration: 5, icon: '🧘', titleHe: 'רגיעה', titleEn: 'Calm', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'focus', duration: 10, icon: '🎯', titleHe: 'מיקוד', titleEn: 'Focus', gradient: 'from-purple-500 to-indigo-500' },
  { id: 'energy', duration: 7, icon: '⚡', titleHe: 'אנרגיה', titleEn: 'Energy', gradient: 'from-amber-500 to-orange-500' },
  { id: 'sleep', duration: 15, icon: '🌙', titleHe: 'שינה', titleEn: 'Sleep', gradient: 'from-indigo-500 to-purple-600' },
];

const HypnosisLibrary = () => {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { impact } = useHaptics();
  const { currentMilestone, suggestedGoal, isLoading: isLoadingHypnosis } = useDailyHypnosis();
  const { isLaunchpadComplete, isLoading: isLoadingLaunchpad } = useLaunchpadProgress();
  const { sessionStats, gameState, spendEnergy } = useGameState();
  const { openHypnosis } = useAuroraActions();
  const { canAfford } = useEnergy();
  const { user } = useAuth();
  const [energyModalOpen, setEnergyModalOpen] = useState(false);
  const [freeSessionAvailable, setFreeSessionAvailable] = useState(false);
  const { canAccessHypnosis, showUpgradePrompt, upgradeFeature, dismissUpgrade } = useSubscriptionGate();

  useEffect(() => {
    if (user?.id) {
      hasFreeWeeklySession(user.id).then(setFreeSessionAvailable);
    }
  }, [user?.id]);

  if (!isLoadingLaunchpad && !isLaunchpadComplete) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-lg font-bold mb-2">
            {language === 'he' ? 'סשנים מותאמים אישית' : 'Personalized Sessions'}
          </h1>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {language === 'he' 
              ? 'השלם את מסע הטרנספורמציה תחילה.'
              : 'Complete the Transformation Journey first.'
            }
          </p>
          <Button size="sm" onClick={() => navigate('/launchpad')} className="gap-1.5">
            <Rocket className="w-4 h-4" />
            {language === 'he' ? 'התחל' : 'Start'}
          </Button>
        </div>
      </PageShell>
    );
  }

  const requestSession = () => {
    if (!canAccessHypnosis) {
      showUpgradePrompt('hypnosis');
      return;
    }
    if (freeSessionAvailable) {
      setFreeSessionAvailable(false);
      openHypnosis();
      toast.success(language === 'he' ? '🎁 סשן שבועי חינם!' : '🎁 Free weekly session!');
      return;
    }
    impact('medium');
    setEnergyModalOpen(true);
  };

  const confirmSpendAndStart = async () => {
    setEnergyModalOpen(false);
    const ok = await spendEnergy(ENERGY_COSTS.HYPNOSIS_STANDARD, 'hypnosis', 'Standard session');
    if (ok) {
      openHypnosis();
    }
  };

  const handleStartSession = (preset?: string, duration?: number) => {
    requestSession();
  };

  const handleStartDailySession = () => {
    requestSession();
  };

  return (
    <PageShell className="space-y-4">
      {/* ===== FULL-WIDTH DAILY SESSION HERO ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-gradient-to-br from-primary to-primary/80 active:brightness-95 transition-all"
        onClick={handleStartDailySession}
      >
        <div className="absolute inset-0 bg-white/5" />
        <div className="relative z-10 text-white flex flex-col items-center text-center gap-2">
          <span className="text-4xl">✨</span>
          <h2 className="text-xl font-bold leading-tight">
            {language === 'he' ? 'הסשן היומי שלך' : 'Your Daily Session'}
          </h2>
          <span className="text-sm opacity-80 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />15 {language === 'he' ? 'דקות' : 'minutes'}
          </span>
          <div className="mt-2 flex items-center gap-2 bg-background/90 text-foreground rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg">
            <Play className="w-4 h-4" />
            {language === 'he' ? 'התחל עכשיו' : 'Start Now'}
          </div>
        </div>
      </motion.div>

      {/* ===== STATS ROW ===== */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Target, value: sessionStats?.totalSessions || 0, label: language === 'he' ? 'סשנים' : 'Sessions', color: 'text-blue-500' },
          { icon: Clock, value: sessionStats?.totalDurationSeconds ? Math.floor(sessionStats.totalDurationSeconds / 60) : 0, label: language === 'he' ? 'דקות' : 'Min', color: 'text-green-500' },
          { icon: Zap, value: gameState?.experience || 0, label: 'XP', color: 'text-amber-500' },
          { icon: Star, value: gameState?.level || 1, label: language === 'he' ? 'רמה' : 'Lvl', color: 'text-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-card border border-border p-3 flex flex-col items-center text-center">
            <stat.icon className={cn("w-5 h-5 mb-1", stat.color)} />
            <p className="text-lg font-bold leading-none">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ===== QUICK SESSIONS ROW ===== */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_SESSIONS.map((session) => (
          <Card
            key={session.id}
            className="relative overflow-hidden p-3 cursor-pointer hover:shadow-md transition-all active:scale-95 touch-manipulation"
            onClick={() => handleStartSession(session.id, session.duration)}
          >
            <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", session.gradient)} />
            <div className="relative z-10 text-center flex flex-col items-center gap-1">
              <span className="text-2xl">{session.icon}</span>
              <p className="text-xs font-semibold leading-tight">
                {language === 'he' ? session.titleHe : session.titleEn}
              </p>
              <p className="text-[11px] text-muted-foreground">{session.duration}{language === 'he' ? 'דק׳' : 'm'}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Sessions */}
      <RecentSessions language={language as 'he' | 'en'} isRTL={isRTL} />

      {/* Energy Spend Confirmation */}
      <EnergySpendModal
        open={energyModalOpen}
        cost={ENERGY_COSTS.HYPNOSIS_STANDARD}
        source="hypnosis"
        onConfirm={confirmSpendAndStart}
        onCancel={() => setEnergyModalOpen(false)}
      />
      <UpgradePromptModal feature={upgradeFeature} onDismiss={dismissUpgrade} />
    </PageShell>
  );
};

export default HypnosisLibrary;
