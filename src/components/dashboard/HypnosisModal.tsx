import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/contexts/GameStateContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { 
  generateHypnosisScript, 
  type HypnosisScript,
  generateCacheKey,
  checkScriptCache,
  saveScriptToCache,
  getCachedAudioUrl,
  cacheScriptAudio,
} from '@/services/hypnosis';
import { synthesizeSpeech, stopBrowserSpeech, playAudioUrl, stopCurrentAudio } from '@/services/voice';
import { saveSession } from '@/services/userMemory';
import { awardXp } from '@/services/unifiedContext';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { VoiceProvider } from '@/services/voice';

interface HypnosisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SessionState = 'setup' | 'generating' | 'playing' | 'paused' | 'complete';

export function HypnosisModal({ open, onOpenChange }: HypnosisModalProps) {
  const { t, isRTL, language } = useTranslation();
  const isMobile = useIsMobile();
  const orbSize = isMobile ? 150 : 200;
  const orbSizeCompact = isMobile ? 140 : 180;

  const { user } = useAuth();
  const { gameState, recordSession } = useGameState();
  const { isLaunchpadComplete, isLoading: isLoadingLaunchpad } = useLaunchpadProgress();
  const { impact, pattern: hapticPattern } = useHaptics();
  const { currentMilestone, suggestedGoal, isLoading: isLoadingContext } = useDailyHypnosis();

  const [state, setState] = useState<SessionState>('setup');
  const [goal, setGoal] = useState('');
  const [goalInitialized, setGoalInitialized] = useState(false);
  const [duration, setDuration] = useState(10);
  const [script, setScript] = useState<HypnosisScript | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string | null>(null);
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>('elevenlabs');
  const [voiceStarted, setVoiceStarted] = useState(false);

  const startTimeRef = useRef<number>(0);
  const playingRef = useRef<boolean>(false);
  const sessionIdRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRefs = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Rotating generating messages
  const [generatingMessageIndex, setGeneratingMessageIndex] = useState(0);
  const GENERATING_MESSAGES = {
    he: [
      'מנתח את הפרופיל שלך...',
      'מתאים את הסשן אישית...',
      'יוצר את החוויה המושלמת עבורך...',
      'הסשן כמעט מוכן...',
    ],
    en: [
      'Analyzing your profile...',
      'Personalizing your session...',
      'Creating the perfect experience...',
      'Almost ready...',
    ],
  };

  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timeoutRefs.current.delete(id);
      fn();
    }, delay);
    timeoutRefs.current.add(id);
    return id;
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(id => clearTimeout(id));
    timeoutRefs.current.clear();
  }, []);

  const fullCleanup = useCallback(() => {
    playingRef.current = false;
    clearAllTimeouts();
    stopCurrentAudio();
    stopBrowserSpeech();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [clearAllTimeouts]);

  // Rotate messages during generating
  useEffect(() => {
    if (state !== 'generating') {
      setGeneratingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setGeneratingMessageIndex((prev) => 
        (prev + 1) % GENERATING_MESSAGES[language as 'he' | 'en'].length
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [state, language]);

  // Auto-populate goal from profile context when modal opens
  useEffect(() => {
    if (open && !isLoadingContext && suggestedGoal && !goalInitialized) {
      setGoal(suggestedGoal);
      setGoalInitialized(true);
    }
  }, [open, isLoadingContext, suggestedGoal, goalInitialized]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      sessionIdRef.current++;
      fullCleanup();
      setState('setup');
      setGoal('');
      setGoalInitialized(false);
      setScript(null);
      setProgress(0);
      setElapsedTime(0);
      setVoiceStarted(false);
      setCachedAudioUrl(null);
    }
  }, [open, fullCleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionIdRef.current++;
      fullCleanup();
    };
  }, [fullCleanup]);

  // Progress timer
  useEffect(() => {
    if (state !== 'playing' || !voiceStarted) return;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setElapsedTime(elapsed);
      const totalSeconds = duration * 60;
      setProgress(Math.min((elapsed / totalSeconds) * 100, 100));
    }, 100);

    return () => clearInterval(interval);
  }, [state, duration, voiceStarted]);

  const startSession = async () => {
    const sessionGoal = goal.trim() || currentMilestone?.title || (language === 'he' ? 'רגיעה עמוקה ושלווה' : 'Deep relaxation and peace');
    setGoal(sessionGoal);
    impact('medium');
    playingRef.current = true;
    setState('generating');
    hapticPattern('selection');
    
    abortControllerRef.current = new AbortController();
    const currentSessionId = sessionIdRef.current;

    try {
      const cacheKey = generateCacheKey({
        egoState: 'personalized',
        goal: sessionGoal,
        durationMinutes: duration,
        language: language as 'he' | 'en',
      });

      // Check cache first
      if (user?.id) {
        const cached = await checkScriptCache(user.id, cacheKey);
        if (sessionIdRef.current !== currentSessionId) return;
        
        if (cached?.script_data?.fullScript) {
          setScript(cached.script_data);
          if (cached.audio_url) {
            setCachedAudioUrl(cached.audio_url);
          }
          setState('playing');
          hapticPattern('success');
          playScript(cached.script_data, cached.audio_url || undefined);
          return;
        }
      }

      // Generate new script
      const generatedScript = await generateHypnosisScript({
        egoState: 'personalized',
        goal: sessionGoal,
        durationMinutes: duration,
        userLevel: gameState?.level || 1,
        sessionStreak: gameState?.sessionStreak || 0,
        previousSessions: 0,
        language: language as 'he' | 'en',
      });

      if (sessionIdRef.current !== currentSessionId) return;

      if (!generatedScript?.fullScript) {
        throw new Error('Invalid script: no content generated');
      }

      // Save to cache
      if (user?.id) {
        await saveScriptToCache(user.id, cacheKey, generatedScript, {
          egoState: 'personalized',
          goal: sessionGoal,
          durationMinutes: duration,
          language: language as 'he' | 'en',
        });
        // Trigger background audio caching
        cacheScriptAudio(user.id, cacheKey, generatedScript.fullScript, language as 'he' | 'en');
      }

      setScript(generatedScript);
      setState('playing');
      hapticPattern('success');
      playScript(generatedScript);
    } catch (error) {
      if (sessionIdRef.current !== currentSessionId) return;
      console.error('Failed to generate script:', error);
      hapticPattern('error');
      toast({
        title: language === 'he' ? 'שגיאה ביצירת הסשן' : 'Error generating session',
        variant: 'destructive',
      });
      setState('setup');
    }
  };

  const playScript = async (activeScript: HypnosisScript, cachedUrl?: string) => {
    const currentSessionId = sessionIdRef.current;
    
    if (!playingRef.current || !activeScript.fullScript) return;

    const markVoiceStarted = () => {
      if (!voiceStarted) {
        setVoiceStarted(true);
        startTimeRef.current = Date.now();
      }
    };

    const onComplete = () => {
      if (sessionIdRef.current !== currentSessionId) return;
      handleSessionComplete();
    };

    // Try cached audio first
    if (cachedUrl) {
      try {
        const signedUrl = await getCachedAudioUrl(cachedUrl);
        if (sessionIdRef.current !== currentSessionId) return;
        
        if (signedUrl) {
          await playAudioUrl(signedUrl, {
            onStart: markVoiceStarted,
            onEnd: onComplete,
            onError: () => {
              if (sessionIdRef.current !== currentSessionId) return;
              // Fallback to synthesis
              synthesizeAndPlay(activeScript.fullScript, markVoiceStarted, onComplete, currentSessionId);
            },
          });
          return;
        }
      } catch (error) {
        console.warn('Failed to get cached audio:', error);
      }
    }

    // Synthesize new audio
    await synthesizeAndPlay(activeScript.fullScript, markVoiceStarted, onComplete, currentSessionId);
  };

  const synthesizeAndPlay = async (
    text: string, 
    onStart: () => void, 
    onEnd: () => void,
    currentSessionId: number
  ) => {
    if (isMuted) {
      onStart();
      // Calculate reading time based on words
      const wordsPerMinute = 130;
      const words = text.split(/\s+/).length;
      const readingTime = Math.max((words / wordsPerMinute) * 60 * 1000, 60000);
      
      scheduleTimeout(() => {
        if (sessionIdRef.current === currentSessionId && playingRef.current) {
          onEnd();
        }
      }, readingTime);
      return;
    }

    try {
      const result = await synthesizeSpeech(text, {
        provider: voiceProvider,
        voice: 'sarah',
        speed: 0.9,
      });

      if (sessionIdRef.current !== currentSessionId) return;

      if (result) {
        setVoiceProvider(result.provider);
        await playAudioUrl(result.audioUrl, {
          onStart,
          onEnd,
          onError: () => {
            if (sessionIdRef.current === currentSessionId && playingRef.current) {
              onEnd();
            }
          },
        });
      } else {
        // Fallback to timed display
        onStart();
        const wordsPerMinute = 130;
        const words = text.split(/\s+/).length;
        const readingTime = Math.max((words / wordsPerMinute) * 60 * 1000, 60000);
        
        scheduleTimeout(() => {
          if (sessionIdRef.current === currentSessionId && playingRef.current) {
            onEnd();
          }
        }, readingTime);
      }
    } catch (error) {
      console.error('TTS failed:', error);
      if (sessionIdRef.current === currentSessionId && playingRef.current) {
        onEnd();
      }
    }
  };

  const handleSessionComplete = useCallback(async () => {
    setState('complete');
    playingRef.current = false;
    stopCurrentAudio();
    stopBrowserSpeech();
    clearAllTimeouts();
    impact('heavy');
    hapticPattern('success');

    if (user?.id) {
      try {
        await saveSession(user.id, {
          egoState: 'personalized',
          durationSeconds: duration * 60,
          experienceGained: duration * 10,
        });
        
        await awardXp(user.id, duration * 10, 'hypnosis');
        recordSession?.({
          egoState: 'personalized',
          durationSeconds: duration * 60,
          experienceGained: duration * 10,
        });
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }
  }, [user?.id, duration, impact, hapticPattern, recordSession, clearAllTimeouts]);

  const togglePlayPause = () => {
    if (state === 'playing') {
      setState('paused');
      playingRef.current = false;
      stopCurrentAudio();
      hapticPattern('selection');
    } else if (state === 'paused') {
      setState('playing');
      playingRef.current = true;
      if (script) {
        playScript(script, cachedAudioUrl || undefined);
      }
      hapticPattern('selection');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    fullCleanup();
    onOpenChange(false);
  };

  // Prevent closing during active session
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && (state === 'generating' || state === 'playing' || state === 'paused')) {
      return;
    }
    if (!newOpen) {
      handleClose();
    } else {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-2xl h-[85svh] max-h-[92svh] p-0 flex flex-col overflow-hidden bg-background"
        onPointerDownOutside={(e) => {
          if (state === 'generating' || state === 'playing' || state === 'paused') {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (state === 'generating' || state === 'playing' || state === 'paused') {
            e.preventDefault();
          }
        }}
      >
        <VisuallyHidden>
          <DialogTitle>{t('hypnosisSession.personalHypnosis')}</DialogTitle>
        </VisuallyHidden>

        <AnimatePresence mode="wait">
          {/* Setup State */}
          {state === 'setup' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6 space-y-6"
            >
              <div className="text-center">
                <h1 className="text-2xl font-bold">
                  {t('hypnosisSession.personalHypnosis')}
                </h1>
              </div>

              {/* Current Week Context */}
              {currentMilestone ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-md"
                >
                  <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/15 to-primary/10 p-6 text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                    
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {t('hypnosisSession.week')} {currentMilestone.week_number}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {currentMilestone.title}
                    </h3>
                    
                    {currentMilestone.description && (
                      <p className="text-sm text-muted-foreground">
                        {currentMilestone.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="w-full max-w-md text-center">
                  <p className="text-muted-foreground">
                    {t('hypnosisSession.personalizedSession')}
                  </p>
                </div>
              )}

              {/* Duration Selection */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {t('hypnosisSession.duration')}
                </span>
                {[5, 10, 15].map((d) => (
                  <Button
                    key={d}
                    variant={duration === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration(d)}
                  >
                    {d} {t('hypnosisSession.minutes')}
                  </Button>
                ))}
              </div>

              <Button onClick={startSession} size="lg" className="gap-2 px-8">
                <Play className="w-5 h-5" />
                {t('hypnosisSession.startSession')}
              </Button>
            </motion.div>
          )}

          {/* Generating State */}
          {state === 'generating' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 space-y-4 sm:space-y-6"
            >
              <div className="overflow-visible">
                <PersonalizedOrb 
                  size={orbSize} 
                  state="listening"
                />
              </div>
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                
                <AnimatePresence mode="wait">
                  <motion.p
                    key={generatingMessageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-medium"
                  >
                    {GENERATING_MESSAGES[language as 'he' | 'en'][generatingMessageIndex]}
                  </motion.p>
                </AnimatePresence>
                
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {t('hypnosisSession.generatingDisclaimer')}
                </p>
              </div>
            </motion.div>
          )}

          {/* Playing/Paused State */}
          {(state === 'playing' || state === 'paused') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {/* Orb Area */}
              <div className="flex-shrink-0 flex items-center justify-center min-h-[160px] sm:min-h-[200px] p-2 sm:p-4 overflow-visible">
                <PersonalizedOrb 
                  size={orbSizeCompact} 
                  state={state === 'playing' ? 'listening' : 'idle'}
                />
              </div>

              {/* Script Text - Scrollable */}
              {script?.fullScript && (
                <div 
                  className="flex-1 min-h-0 px-6 overflow-y-auto"
                  ref={scrollContainerRef}
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-4"
                  >
                    <p className="text-lg leading-loose text-foreground/90 whitespace-pre-wrap">
                      {script.fullScript}
                    </p>
                  </motion.div>
                </div>
              )}

              {/* Progress */}
              <div className="flex-shrink-0 px-6 py-2 border-t border-border/50">
                <Progress value={progress} className="h-1" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(elapsedTime)}</span>
                  <span>{formatTime(duration * 60)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex-shrink-0 flex items-center justify-center gap-4 p-3 sm:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

                <Button
                  size="lg"
                  className="w-16 h-16 rounded-full"
                  onClick={togglePlayPause}
                >
                  {state === 'playing' ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </Button>

                <div className="w-10" /> {/* Spacer for symmetry */}
              </div>
            </motion.div>
          )}

          {/* Complete State */}
          {state === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <span className="text-4xl">✨</span>
                </motion.div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {t('hypnosisSession.sessionComplete')}
                </h2>
                <p className="text-muted-foreground">
                  {t('hypnosisSession.congratulations')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-sm text-primary">
                  +{duration * 10} XP
                </p>
                <Button onClick={handleClose} size="lg">
                  {t('common.close')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default HypnosisModal;
