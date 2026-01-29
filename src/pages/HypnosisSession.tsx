import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/contexts/GameStateContext';
import { Orb } from '@/components/orb';
import { getEgoState } from '@/lib/egoStates';
import { generateHypnosisScript, type HypnosisScript } from '@/services/hypnosis';
import { speakWithBrowser, stopBrowserSpeech, isBrowserTTSAvailable } from '@/services/voice';
import { saveSession } from '@/services/userMemory';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

type SessionState = 'setup' | 'generating' | 'playing' | 'paused' | 'complete';

const SEGMENT_LABELS: Record<string, { he: string; en: string }> = {
  welcome: { he: 'ברוכים הבאים', en: 'Welcome' },
  induction: { he: 'כניסה לטראנס', en: 'Induction' },
  deepening: { he: 'העמקה', en: 'Deepening' },
  core_work: { he: 'העבודה המרכזית', en: 'Core Work' },
  integration: { he: 'אינטגרציה', en: 'Integration' },
  emergence: { he: 'יציאה', en: 'Emergence' },
};

const HypnosisSession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const { gameState, recordSession } = useGameState();

  const egoStateId = searchParams.get('ego') || gameState?.activeEgoState || 'guardian';
  const presetId = searchParams.get('preset');
  const presetDuration = searchParams.get('duration');

  const egoState = getEgoState(egoStateId);

  const [state, setState] = useState<SessionState>('setup');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(presetDuration ? parseInt(presetDuration) : 10);
  const [script, setScript] = useState<HypnosisScript | null>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTimeRef = useRef<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const playingRef = useRef<boolean>(false);

  const currentSegment = script?.segments[currentSegmentIndex];

  // Set preset goal
  useEffect(() => {
    if (presetId) {
      const presetGoals: Record<string, { he: string; en: string }> = {
        calm: { he: 'להרגיש רגיעה עמוקה ושלווה', en: 'Feel deep calm and peace' },
        focus: { he: 'להגביר את המיקוד והריכוז', en: 'Enhance focus and concentration' },
        energy: { he: 'לטעון את האנרגיה והמוטיבציה', en: 'Boost energy and motivation' },
        sleep: { he: 'להתכונן לשינה עמוקה ומרגיעה', en: 'Prepare for deep, restful sleep' },
      };
      setGoal(presetGoals[presetId]?.[language] || '');
    }
  }, [presetId, language]);

  // Generate script
  const handleStartSession = async () => {
    if (!goal.trim()) {
      toast({
        title: language === 'he' ? 'נא להזין מטרה' : 'Please enter a goal',
        variant: 'destructive',
      });
      return;
    }

    setState('generating');

    try {
      const generatedScript = await generateHypnosisScript({
        egoState: egoStateId,
        goal,
        durationMinutes: duration,
        userLevel: gameState?.level || 1,
        sessionStreak: gameState?.sessionStreak || 0,
        previousSessions: 0,
        language: language as 'he' | 'en',
      });

      setScript(generatedScript);
      setState('playing');
      startTimeRef.current = Date.now();
      playingRef.current = true;
      playSegment(0);
    } catch (error) {
      console.error('Failed to generate script:', error);
      toast({
        title: language === 'he' ? 'שגיאה ביצירת הסשן' : 'Error generating session',
        description: language === 'he' ? 'נסה שוב' : 'Please try again',
        variant: 'destructive',
      });
      setState('setup');
    }
  };

  // Play a segment
  const playSegment = useCallback((index: number) => {
    if (!script || index >= script.segments.length) {
      handleSessionComplete();
      return;
    }

    const segment = script.segments[index];
    setCurrentSegmentIndex(index);

    if (isMuted || !isBrowserTTSAvailable()) {
      // If muted, simulate reading time
      const wordsPerMinute = 130;
      const words = segment.text.split(/\s+/).length;
      const readingTime = (words / wordsPerMinute) * 60 * 1000;
      
      setTimeout(() => {
        if (playingRef.current) {
          playSegment(index + 1);
        }
      }, readingTime);
      return;
    }

    // Use browser TTS
    utteranceRef.current = speakWithBrowser(segment.text, {
      rate: 0.85,
      onEnd: () => {
        if (playingRef.current) {
          playSegment(index + 1);
        }
      },
      onError: (error) => {
        console.error('TTS error:', error);
        // Continue to next segment even on error
        setTimeout(() => playSegment(index + 1), 1000);
      },
    });
  }, [script, isMuted]);

  // Handle pause/resume
  const togglePlayPause = () => {
    if (state === 'playing') {
      setState('paused');
      playingRef.current = false;
      stopBrowserSpeech();
    } else if (state === 'paused') {
      setState('playing');
      playingRef.current = true;
      playSegment(currentSegmentIndex);
    }
  };

  // Skip to next segment
  const skipSegment = () => {
    stopBrowserSpeech();
    if (script && currentSegmentIndex < script.segments.length - 1) {
      playSegment(currentSegmentIndex + 1);
    } else {
      handleSessionComplete();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopBrowserSpeech();
    }
  };

  // Session complete
  const handleSessionComplete = async () => {
    setState('complete');
    playingRef.current = false;
    stopBrowserSpeech();

    const sessionDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const xpGained = Math.floor(sessionDuration / 60) * 10 + 20;

    if (user?.id) {
      await saveSession(user.id, {
        egoState: egoStateId,
        action: goal,
        durationSeconds: sessionDuration,
        experienceGained: xpGained,
        scriptData: script ? { title: script.title, segments: script.segments.length } : undefined,
      });

      await recordSession({
        egoState: egoStateId,
        durationSeconds: sessionDuration,
        action: goal,
        experienceGained: xpGained,
      });
    }
  };

  // Exit session
  const handleExit = () => {
    playingRef.current = false;
    stopBrowserSpeech();
    navigate('/hypnosis');
  };

  // Update elapsed time
  useEffect(() => {
    if (state !== 'playing') return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);

      if (script) {
        const totalDuration = script.metadata.durationMinutes * 60;
        setProgress(Math.min((elapsed / totalDuration) * 100, 100));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state, script]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playingRef.current = false;
      stopBrowserSpeech();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col bg-gradient-to-br",
        egoState.colors.gradient
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={handleExit}
        >
          <X className="h-6 w-6" />
        </Button>

        {state !== 'setup' && (
          <div className="flex items-center gap-2 text-white/80">
            <span className="text-sm">{formatTime(elapsedTime)}</span>
            {script && (
              <>
                <span>/</span>
                <span className="text-sm">{script.metadata.durationMinutes}:00</span>
              </>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        <AnimatePresence mode="wait">
          {/* Setup State */}
          {state === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md text-center text-white"
            >
              <div className="mb-8">
                <span className="text-5xl mb-4 block">{egoState.icon}</span>
                <h1 className="text-2xl font-bold mb-2">
                  {language === 'he' ? egoState.nameHe : egoState.name}
                </h1>
                <p className="text-white/70 text-sm">
                  {language === 'he' 
                    ? 'הזן את המטרה שלך לסשן זה'
                    : 'Enter your goal for this session'
                  }
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={language === 'he' ? 'מה תרצה להשיג?' : 'What do you want to achieve?'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />

                <div className="flex items-center justify-center gap-2">
                  {[5, 10, 15, 20].map((d) => (
                    <Button
                      key={d}
                      variant={duration === d ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        duration !== d && "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                      onClick={() => setDuration(d)}
                    >
                      {d} {language === 'he' ? 'דק׳' : 'min'}
                    </Button>
                  ))}
                </div>

                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full gap-2 mt-6"
                  onClick={handleStartSession}
                >
                  <Play className="w-5 h-5" />
                  {language === 'he' ? 'התחל סשן' : 'Start Session'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Generating State */}
          {state === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-white"
            >
              <Orb size={200} state="thinking" />
              <p className="mt-8 text-lg">
                {language === 'he' 
                  ? 'יוצר את הסשן המותאם אישית שלך...'
                  : 'Creating your personalized session...'
                }
              </p>
            </motion.div>
          )}

          {/* Playing/Paused State */}
          {(state === 'playing' || state === 'paused') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md text-center text-white"
            >
              {/* Orb */}
              <div className="mb-8">
                <Orb 
                  size={220} 
                  state={state === 'playing' ? 'speaking' : 'idle'}
                />
              </div>

              {/* Current Segment */}
              {currentSegment && (
                <motion.div
                  key={currentSegment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <span className="text-sm text-white/60 uppercase tracking-wider">
                    {SEGMENT_LABELS[currentSegment.id]?.[language] || currentSegment.id}
                  </span>
                </motion.div>
              )}

              {/* Progress */}
              <div className="mb-8">
                <Progress value={progress} className="h-1 bg-white/20" />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-14 h-14 rounded-full text-white hover:bg-white/10"
                  onClick={togglePlayPause}
                >
                  {state === 'playing' ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                  onClick={skipSegment}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Complete State */}
          {state === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center text-white"
            >
              <div className="text-6xl mb-6">✨</div>
              <h2 className="text-2xl font-bold mb-2">
                {language === 'he' ? 'כל הכבוד!' : 'Well Done!'}
              </h2>
              <p className="text-white/80 mb-8">
                {language === 'he' 
                  ? `השלמת סשן של ${formatTime(elapsedTime)}`
                  : `You completed a ${formatTime(elapsedTime)} session`
                }
              </p>

              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setScript(null);
                    setState('setup');
                    setProgress(0);
                    setElapsedTime(0);
                  }}
                >
                  {language === 'he' ? 'סשן נוסף' : 'Another Session'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => navigate('/dashboard')}
                >
                  {language === 'he' ? 'חזרה לדאשבורד' : 'Back to Dashboard'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default HypnosisSession;
