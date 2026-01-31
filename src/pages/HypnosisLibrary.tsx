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
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';

const QUICK_SESSIONS = [
  { id: 'calm', duration: 5, icon: '🧘', titleHe: 'רגיעה מהירה', titleEn: 'Quick Calm', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'focus', duration: 10, icon: '🎯', titleHe: 'מיקוד עמוק', titleEn: 'Deep Focus', gradient: 'from-purple-500 to-indigo-500' },
  { id: 'energy', duration: 7, icon: '⚡', titleHe: 'טעינת אנרגיה', titleEn: 'Energy Boost', gradient: 'from-amber-500 to-orange-500' },
  { id: 'sleep', duration: 15, icon: '🌙', titleHe: 'הכנה לשינה', titleEn: 'Sleep Prep', gradient: 'from-indigo-500 to-purple-600' },
];

const HypnosisLibrary = () => {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { impact } = useHaptics();
  const { currentMilestone, suggestedGoal, isLoading: isLoadingHypnosis } = useDailyHypnosis();
  const { isLaunchpadComplete, isLoading: isLoadingLaunchpad } = useLaunchpadProgress();

  // Gate: redirect to launchpad if not complete
  if (!isLoadingLaunchpad && !isLaunchpadComplete) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">
            {language === 'he' ? 'סשנים מותאמים אישית' : 'Personalized Sessions'}
          </h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            {language === 'he' 
              ? 'כדי ליצור סשנים מותאמים אישית בדיוק לפי הפרופיל שלך, עליך להשלים את מסע הטרנספורמציה תחילה.'
              : 'To create sessions tailored specifically to your profile, complete the Transformation Journey first.'
            }
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/launchpad')}
            className="gap-2"
          >
            <Rocket className="w-5 h-5" />
            {language === 'he' ? 'התחל את המסע' : 'Start the Journey'}
          </Button>
        </div>
      </DashboardLayout>
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
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {language === 'he' ? 'סשנים' : 'Sessions'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'he' ? 'סשנים מותאמים אישית לפי הפרופיל שלך' : 'Sessions personalized to your profile'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <section>
          <SessionStats language={language as 'he' | 'en'} />
        </section>

        {/* Daily Session Card - AI Generated */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 sm:p-6 cursor-pointer",
              "bg-gradient-to-br active:brightness-95 transition-all",
              "from-primary to-primary/80"
            )}
            onClick={handleStartDailySession}
          >
            <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-xs font-medium text-white">
                  {language === 'he' ? 'הסשן היומי' : 'Daily Session'}
                </span>
              </div>
            </div>
            
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-2 mb-2 mt-6">
                <span className="text-2xl sm:text-3xl">✨</span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm opacity-80">
                  <Clock className="w-3.5 h-3.5" />
                  15 {language === 'he' ? 'דקות' : 'minutes'}
                </div>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                {language === 'he' ? 'הסשן המותאם אישית שלך להיום' : 'Your Personalized Session for Today'}
              </h3>
              
              {currentMilestone && (
                <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm opacity-90">
                  <Target className="w-4 h-4" />
                  <span>
                    {language === 'he' ? 'יעד השבוע:' : 'This week:'} {currentMilestone.title}
                  </span>
                </div>
              )}
              
              <p className="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4 max-w-md">
                {language === 'he' 
                  ? 'סקריפט AI מותאם אישית על בסיס הפרופיל שלך, תוכנית ה-90 יום והמטרות השבועיות'
                  : 'AI script personalized based on your profile, 90-day plan and weekly goals'
                }
              </p>
              
              <Button
                size="lg"
                className="gap-2 h-11 sm:h-12 text-sm sm:text-base touch-manipulation bg-background/90 text-foreground hover:bg-background border border-border/50"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                {language === 'he' ? 'התחל סשן יומי' : 'Start Daily Session'}
              </Button>
            </div>
            
            {/* Decorative orbs */}
            <div className="absolute -top-10 -right-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 blur-xl" />
          </motion.div>
        </section>

        {/* Quick Sessions */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {language === 'he' ? 'סשנים מהירים' : 'Quick Sessions'}
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {QUICK_SESSIONS.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden p-4 cursor-pointer",
                    "hover:shadow-lg transition-all active:scale-95",
                    "touch-manipulation min-h-[88px] sm:min-h-[100px]"
                  )}
                  onClick={() => handleStartSession(session.id, session.duration)}
                >
                  <div 
                    className={cn(
                      "absolute inset-0 opacity-10 bg-gradient-to-br",
                      session.gradient
                    )}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xl sm:text-2xl">{session.icon}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {session.duration} {language === 'he' ? 'דק׳' : 'min'}
                      </div>
                    </div>
                    <h3 className="font-medium text-sm">
                      {language === 'he' ? session.titleHe : session.titleEn}
                    </h3>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Sessions */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {language === 'he' ? 'סשנים אחרונים' : 'Recent Sessions'}
            </h2>
          </div>
          <RecentSessions 
            language={language as 'he' | 'en'} 
            isRTL={isRTL}
          />
        </section>
      </div>
    </DashboardLayout>
  );
};

export default HypnosisLibrary;
