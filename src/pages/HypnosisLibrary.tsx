import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Sparkles, Zap, Star, Target, Lock, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { RecentSessions, SessionStats } from '@/components/hypnosis';
import { useHaptics } from '@/hooks/useHaptics';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
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
    <PageShell className="space-y-1.5">
      {/* Stats */}
      <SessionStats language={language as 'he' | 'en'} />

      {/* Daily Session - compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-xl p-3 cursor-pointer bg-gradient-to-br from-primary to-primary/80 active:brightness-95 transition-all"
        onClick={handleStartDailySession}
      >
        <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2">
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-[10px] font-medium text-white">
              {language === 'he' ? 'יומי' : 'Daily'}
            </span>
          </div>
        </div>
        
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-2 mb-1 mt-3">
            <span className="text-xl">✨</span>
            <span className="text-[10px] opacity-80 flex items-center gap-1">
              <Clock className="w-3 h-3" />15 {language === 'he' ? 'דק׳' : 'min'}
            </span>
          </div>
          <h3 className="text-sm font-semibold mb-0.5">
            {language === 'he' ? 'הסשן המותאם שלך להיום' : 'Your Session for Today'}
          </h3>
          {currentMilestone && (
            <p className="text-[10px] opacity-80 flex items-center gap-1 mb-1.5">
              <Target className="w-3 h-3" />
              {currentMilestone.title}
            </p>
          )}
          <Button size="sm" className="gap-1.5 h-7 text-[11px] bg-background/90 text-foreground hover:bg-background border border-border/50">
            <Play className="w-3.5 h-3.5" />
            {language === 'he' ? 'התחל' : 'Start'}
          </Button>
        </div>
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      {/* Quick Sessions - 4 across */}
      <div className="grid grid-cols-4 gap-1.5">
        {QUICK_SESSIONS.map((session) => (
          <Card
            key={session.id}
            className="relative overflow-hidden p-2 cursor-pointer hover:shadow-md transition-all active:scale-95 touch-manipulation"
            onClick={() => handleStartSession(session.id, session.duration)}
          >
            <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", session.gradient)} />
            <div className="relative z-10 text-center">
              <span className="text-base">{session.icon}</span>
              <p className="text-[10px] font-semibold mt-0.5 leading-tight">
                {language === 'he' ? session.titleHe : session.titleEn}
              </p>
              <p className="text-[9px] text-muted-foreground">{session.duration}{language === 'he' ? 'דק׳' : 'm'}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Sessions */}
      <RecentSessions language={language as 'he' | 'en'} isRTL={isRTL} />
    </PageShell>
  );
};

export default HypnosisLibrary;
