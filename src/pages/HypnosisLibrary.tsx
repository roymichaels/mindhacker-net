import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Zap, Star, Target, Lock, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { RecentSessions } from '@/components/hypnosis';
import { useHaptics } from '@/hooks/useHaptics';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useGameState } from '@/contexts/GameStateContext';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { cn } from '@/lib/utils';

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
  const { sessionStats, gameState } = useGameState();

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
          <p className="text-xs text-muted-foreground mb-4 max-w-md">
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

  const handleStartSession = (preset?: string, duration?: number) => {
    impact('medium');
    const params = new URLSearchParams();
    if (preset) params.set('preset', preset);
    if (duration) params.set('duration', duration.toString());
    navigate(`/hypnosis/session?${params.toString()}`);
  };

  const handleStartDailySession = () => {
    impact('medium');
    const params = new URLSearchParams();
    params.set('duration', '15');
    params.set('goal', suggestedGoal);
    params.set('daily', 'true');
    navigate(`/hypnosis/session?${params.toString()}`);
  };

  return (
    <PageShell className="space-y-3">
      {/* ===== 3-COLUMN HERO GRID ===== */}
      <div className="grid grid-cols-3 gap-3">
        {/* Column 1: Dark card with daily session */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-xl p-4 cursor-pointer bg-gradient-to-br from-primary to-primary/80 active:brightness-95 transition-all flex flex-col items-center justify-center text-center"
          onClick={handleStartDailySession}
        >
          <div className="absolute inset-0 bg-white/5" />
          <div className="relative z-10 text-white flex flex-col items-center gap-1.5">
            <span className="text-3xl">✨</span>
            <h3 className="text-sm font-bold leading-tight">
              {language === 'he' ? 'הסשן היומי' : 'Daily Session'}
            </h3>
            <span className="text-xs opacity-80 flex items-center gap-1">
              <Clock className="w-3 h-3" />15 {language === 'he' ? 'דק׳' : 'min'}
            </span>
            <div className="mt-1 flex items-center gap-1.5 bg-background/90 text-foreground rounded-full px-3 py-1 text-sm font-medium">
              <Play className="w-3.5 h-3.5" />
              {language === 'he' ? 'התחל' : 'Start'}
            </div>
          </div>
        </motion.div>

        {/* Column 2: 4 vertical stats */}
        <div className="flex flex-col gap-1.5">
          {[
            { icon: Target, value: sessionStats?.totalSessions || 0, label: language === 'he' ? 'סשנים' : 'Sessions', color: 'text-blue-500' },
            { icon: Clock, value: sessionStats?.totalDurationSeconds ? Math.floor(sessionStats.totalDurationSeconds / 60) : 0, label: language === 'he' ? 'דקות' : 'Min', color: 'text-green-500' },
            { icon: Zap, value: gameState?.experience || 0, label: 'XP', color: 'text-amber-500' },
            { icon: Star, value: gameState?.level || 1, label: language === 'he' ? 'רמה' : 'Lvl', color: 'text-purple-500' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card border border-border p-3 flex items-center gap-2 flex-1">
              <stat.icon className={cn("w-4 h-4 shrink-0", stat.color)} />
              <div className="min-w-0">
                <p className="text-lg font-bold leading-none">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Column 3: 2x2 quick sessions */}
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_SESSIONS.map((session) => (
            <Card
              key={session.id}
              className="relative overflow-hidden p-3 cursor-pointer hover:shadow-md transition-all active:scale-95 touch-manipulation"
              onClick={() => handleStartSession(session.id, session.duration)}
            >
              <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", session.gradient)} />
              <div className="relative z-10 text-center">
                <span className="text-xl">{session.icon}</span>
                <p className="text-xs font-semibold leading-tight mt-0.5">
                  {language === 'he' ? session.titleHe : session.titleEn}
                </p>
                <p className="text-[10px] text-muted-foreground">{session.duration}{language === 'he' ? 'דק׳' : 'm'}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <RecentSessions language={language as 'he' | 'en'} isRTL={isRTL} />
    </PageShell>
  );
};

export default HypnosisLibrary;
