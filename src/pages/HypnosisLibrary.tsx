import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Sparkles, ChevronRight, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { getEgoState } from '@/lib/egoStates';
import { EgoStateSelector } from '@/components/gamification';
import { LevelProgress, StreakCounter, TokenBalance } from '@/components/gamification';
import { RecentSessions, SessionStats } from '@/components/hypnosis';
import { useGameState } from '@/contexts/GameStateContext';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

const QUICK_SESSIONS = [
  { id: 'calm', duration: 5, icon: '🧘', titleHe: 'רגיעה מהירה', titleEn: 'Quick Calm', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'focus', duration: 10, icon: '🎯', titleHe: 'מיקוד עמוק', titleEn: 'Deep Focus', gradient: 'from-purple-500 to-indigo-500' },
  { id: 'energy', duration: 7, icon: '⚡', titleHe: 'טעינת אנרגיה', titleEn: 'Energy Boost', gradient: 'from-amber-500 to-orange-500' },
  { id: 'sleep', duration: 15, icon: '🌙', titleHe: 'הכנה לשינה', titleEn: 'Sleep Prep', gradient: 'from-indigo-500 to-purple-600' },
];

const HypnosisLibrary = () => {
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { gameState } = useGameState();
  const { impact } = useHaptics();
  
  const [selectedEgoState, setSelectedEgoState] = useState(
    gameState?.activeEgoState || 'guardian'
  );

  const currentEgo = getEgoState(selectedEgoState);

  const handleStartSession = (preset?: string, duration?: number) => {
    impact('medium');
    const params = new URLSearchParams();
    params.set('ego', selectedEgoState);
    if (preset) params.set('preset', preset);
    if (duration) params.set('duration', duration.toString());
    navigate(`/hypnosis/session?${params.toString()}`);
  };

  const handleEgoSelect = (ego: import('@/lib/egoStates').EgoState) => {
    impact('light');
    setSelectedEgoState(ego.id);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Stats */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b safe-area-top">
        <div className="container py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold">
                {language === 'he' ? 'סשנים' : 'Sessions'}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <StreakCounter size="sm" showLabel={false} />
              <TokenBalance size="sm" />
            </div>
          </div>
          <LevelProgress size="sm" />
        </div>
      </header>

      <main className="container py-4 sm:py-6 space-y-6 sm:space-y-8 pb-32">
        {/* Stats Grid */}
        <section>
          <SessionStats language={language as 'he' | 'en'} />
        </section>

        {/* Ego State Selector */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {language === 'he' ? 'בחר את הארכיטיפ שלך' : 'Choose Your Archetype'}
          </h2>
          <EgoStateSelector onSelect={handleEgoSelect} />
        </section>

        {/* Start Custom Session */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 sm:p-6 cursor-pointer",
              "bg-gradient-to-br active:brightness-95 transition-all",
              currentEgo.colors.gradient
            )}
            onClick={() => handleStartSession()}
          >
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl">{currentEgo.icon}</span>
                <span className="text-xs sm:text-sm opacity-80">
                  {language === 'he' ? currentEgo.nameHe : currentEgo.name}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                {language === 'he' ? 'סשן מותאם אישית' : 'Custom Session'}
              </h3>
              <p className="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4 max-w-md">
                {language === 'he' 
                  ? 'ה-AI יבנה לך סשן היפנוזה מותאם אישית'
                  : 'AI will build a personalized hypnosis session'
                }
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                {language === 'he' ? 'התחל סשן' : 'Start Session'}
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
      </main>
    </div>
  );
};

export default HypnosisLibrary;
