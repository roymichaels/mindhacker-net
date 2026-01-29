import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { getEgoState } from '@/lib/egoStates';
import { EgoStateSelector } from '@/components/gamification';
import { LevelProgress, StreakCounter, TokenBalance } from '@/components/gamification';
import { useGameState } from '@/contexts/GameStateContext';
import { cn } from '@/lib/utils';

const QUICK_SESSIONS = [
  { id: 'calm', duration: 5, icon: '🧘', titleHe: 'רגיעה מהירה', titleEn: 'Quick Calm' },
  { id: 'focus', duration: 10, icon: '🎯', titleHe: 'מיקוד עמוק', titleEn: 'Deep Focus' },
  { id: 'energy', duration: 7, icon: '⚡', titleHe: 'טעינת אנרגיה', titleEn: 'Energy Boost' },
  { id: 'sleep', duration: 15, icon: '🌙', titleHe: 'הכנה לשינה', titleEn: 'Sleep Prep' },
];

const HypnosisLibrary = () => {
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { gameState } = useGameState();
  const [selectedEgoState, setSelectedEgoState] = useState(
    gameState?.activeEgoState || 'guardian'
  );

  const currentEgo = getEgoState(selectedEgoState);

  const handleStartSession = (preset?: string, duration?: number) => {
    const params = new URLSearchParams();
    params.set('ego', selectedEgoState);
    if (preset) params.set('preset', preset);
    if (duration) params.set('duration', duration.toString());
    navigate(`/hypnosis/session?${params.toString()}`);
  };

  const handleEgoSelect = (ego: import('@/lib/egoStates').EgoState) => {
    setSelectedEgoState(ego.id);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Stats */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {language === 'he' ? 'סשנים' : 'Sessions'}
            </h1>
            <div className="flex items-center gap-3">
              <StreakCounter />
              <TokenBalance />
            </div>
          </div>
          <LevelProgress />
        </div>
      </header>

      <main className="container py-6 space-y-8 pb-32">
        {/* Ego State Selector */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            {language === 'he' ? 'בחר את הארכיטיפ שלך' : 'Choose Your Archetype'}
          </h2>
          <EgoStateSelector onSelect={handleEgoSelect} />
        </section>

        {/* Start Custom Session */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "relative overflow-hidden rounded-2xl p-6",
              "bg-gradient-to-br",
              currentEgo.colors.gradient
            )}
          >
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{currentEgo.icon}</span>
                <span className="text-sm opacity-80">
                  {language === 'he' ? currentEgo.nameHe : currentEgo.name}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {language === 'he' ? 'סשן מותאם אישית' : 'Custom Session'}
              </h3>
              <p className="text-sm opacity-90 mb-4 max-w-md">
                {language === 'he' 
                  ? 'ה-AI יבנה לך סשן היפנוזה מותאם אישית לפי המטרה שלך'
                  : 'AI will build a personalized hypnosis session based on your goal'
                }
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                onClick={() => handleStartSession()}
              >
                <Play className="w-5 h-5" />
                {language === 'he' ? 'התחל סשן' : 'Start Session'}
              </Button>
            </div>
            
            {/* Decorative orb */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          </motion.div>
        </section>

        {/* Quick Sessions */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {language === 'he' ? 'סשנים מהירים' : 'Quick Sessions'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_SESSIONS.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleStartSession(session.id, session.duration)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{session.icon}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {session.duration} {language === 'he' ? 'דק׳' : 'min'}
                    </div>
                  </div>
                  <h3 className="font-medium text-sm">
                    {language === 'he' ? session.titleHe : session.titleEn}
                  </h3>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Sessions */}
        {gameState && (gameState.level > 1) && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {language === 'he' ? 'הסשנים האחרונים שלך' : 'Your Recent Sessions'}
              </h2>
              <Button variant="ghost" size="sm" className="gap-1">
                {language === 'he' ? 'הכל' : 'All'}
                <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
              </Button>
            </div>
            <Card className="p-4 text-center text-muted-foreground">
              {language === 'he' 
                ? 'היסטוריית הסשנים תופיע כאן'
                : 'Session history will appear here'
              }
            </Card>
          </section>
        )}
      </main>
    </div>
  );
};

export default HypnosisLibrary;
