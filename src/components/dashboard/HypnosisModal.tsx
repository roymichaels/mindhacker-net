import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2, X } from 'lucide-react';
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
import { KaraokeText } from '@/components/hypnosis/KaraokeText';
import { toast } from '@/hooks/use-toast';
import type { VoiceProvider } from '@/services/voice';

interface HypnosisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SessionState = 'generating' | 'playing' | 'paused' | 'complete';

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

  const [state, setState] = useState<SessionState>('generating');
  const [goal, setGoal] = useState('');
  const [script, setScript] = useState<HypnosisScript | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0); // seconds, calculated from script
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string | null>(null);
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>('elevenlabs');
  const [voiceStarted, setVoiceStarted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // 0-1 for karaoke effect

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

  // Auto-start session when modal opens
  useEffect(() => {
    if (open && !isLoadingContext) {
      const sessionGoal = suggestedGoal || currentMilestone?.title || (language === 'he' ? 'רגיעה עמוקה ושלווה' : 'Deep relaxation and peace');
      setGoal(sessionGoal);
      startSession(sessionGoal);
    }
  }, [open, isLoadingContext]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      sessionIdRef.current++;
      fullCleanup();
      setState('generating');
      setGoal('');
      setScript(null);
      setProgress(0);
      setElapsedTime(0);
      setVoiceStarted(false);
      setCachedAudioUrl(null);
      setAudioProgress(0);
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
    if (state !== 'playing' || !voiceStarted || estimatedDuration <= 0) return;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setElapsedTime(elapsed);
      setProgress(Math.min((elapsed / estimatedDuration) * 100, 100));
    }, 100);

    return () => clearInterval(interval);
  }, [state, estimatedDuration, voiceStarted]);

  const startSession = async (initialGoal?: string) => {
    const sessionGoal = initialGoal || goal.trim() || currentMilestone?.title || (language === 'he' ? 'רגיעה עמוקה ושלווה' : 'Deep relaxation and peace');
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
        durationMinutes: 5, // Use fixed value for cache key consistency
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

      // Generate new script (let AI decide optimal length based on context)
      const generatedScript = await generateHypnosisScript({
        egoState: 'personalized',
        goal: sessionGoal,
        durationMinutes: 5, // Target ~5 min but AI can adjust
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
          durationMinutes: 5,
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
      handleClose();
    }
  };

  const playScript = async (activeScript: HypnosisScript, cachedUrl?: string) => {
    const currentSessionId = sessionIdRef.current;
    
    if (!playingRef.current || !activeScript.fullScript) return;

    // Calculate duration based on word count (130 words per minute for slow hypnosis speech)
    const wordCount = activeScript.fullScript.split(/\s+/).length;
    const calculatedDuration = (wordCount / 130) * 60; // in seconds
    setEstimatedDuration(calculatedDuration);

    const markVoiceStarted = () => {
      if (!voiceStarted) {
        setVoiceStarted(true);
        startTimeRef.current = Date.now();
      }
    };

    const handleTimeUpdate = (currentTime: number, audioDuration: number) => {
      if (audioDuration > 0) {
        setAudioProgress(currentTime / audioDuration);
        // Update estimated duration if we get actual audio duration
        if (audioDuration !== calculatedDuration) {
          setEstimatedDuration(audioDuration);
        }
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
            onTimeUpdate: handleTimeUpdate,
            onStart: markVoiceStarted,
            onEnd: onComplete,
            onError: () => {
              if (sessionIdRef.current !== currentSessionId) return;
              // Fallback to synthesis
              synthesizeAndPlay(activeScript.fullScript, markVoiceStarted, handleTimeUpdate, onComplete, currentSessionId);
            },
          });
          return;
        }
      } catch (error) {
        console.warn('Failed to get cached audio:', error);
      }
    }

    // Synthesize new audio
    await synthesizeAndPlay(activeScript.fullScript, markVoiceStarted, handleTimeUpdate, onComplete, currentSessionId);
  };

  const synthesizeAndPlay = async (
    text: string, 
    onStart: () => void, 
    onTimeUpdate: (currentTime: number, audioDuration: number) => void,
    onEnd: () => void,
    currentSessionId: number
  ) => {
    if (isMuted) {
      onStart();
      // Calculate reading time based on words and simulate progress
      const wordsPerMinute = 130;
      const words = text.split(/\s+/).length;
      const readingTime = Math.max((words / wordsPerMinute) * 60 * 1000, 60000);
      
      // Simulate progress for muted mode
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const simulatedProgress = Math.min(elapsed / readingTime, 1);
        onTimeUpdate(elapsed / 1000, readingTime / 1000);
        
        if (simulatedProgress >= 1) {
          clearInterval(progressInterval);
        }
      }, 100);
      
      scheduleTimeout(() => {
        clearInterval(progressInterval);
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
          onTimeUpdate,
          onStart,
          onEnd,
          onError: () => {
            if (sessionIdRef.current === currentSessionId && playingRef.current) {
              onEnd();
            }
          },
        });
      } else {
        // Fallback to timed display with simulated progress
        onStart();
        const wordsPerMinute = 130;
        const words = text.split(/\s+/).length;
        const readingTime = Math.max((words / wordsPerMinute) * 60 * 1000, 60000);
        
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          onTimeUpdate(elapsed / 1000, readingTime / 1000);
          if (elapsed >= readingTime) clearInterval(progressInterval);
        }, 100);
        
        scheduleTimeout(() => {
          clearInterval(progressInterval);
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

    // Calculate XP based on actual duration (10 XP per minute)
    const actualDurationMinutes = Math.max(1, Math.round(estimatedDuration / 60));
    const xpEarned = actualDurationMinutes * 10;

    if (user?.id) {
      try {
        await saveSession(user.id, {
          egoState: 'personalized',
          durationSeconds: estimatedDuration,
          experienceGained: xpEarned,
        });
        
        await awardXp(user.id, xpEarned, 'hypnosis');
        recordSession?.({
          egoState: 'personalized',
          durationSeconds: estimatedDuration,
          experienceGained: xpEarned,
        });
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }
  }, [user?.id, estimatedDuration, impact, hapticPattern, recordSession, clearAllTimeouts]);

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
        className="max-w-2xl h-[85svh] max-h-[92svh] p-0 flex flex-col bg-background overflow-visible"
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
        
        {/* Exit Button - Always visible */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-4 end-4 z-50 h-10 w-10 rounded-full bg-background/80 hover:bg-destructive/20 border border-border/50"
        >
          <X className="h-5 w-5" />
        </Button>

        <AnimatePresence mode="wait">

          {/* Generating State */}
          {state === 'generating' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-visible"
            >
              <div 
                className="flex-shrink-0 p-8"
                style={{ minHeight: orbSize + 80 }}
              >
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
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Orb Area - with extra padding for glow/particles */}
              <div 
                className="flex-shrink-0 flex items-center justify-center p-6 sm:p-8"
                style={{ minHeight: orbSizeCompact + 60 }}
              >
                <PersonalizedOrb 
                  size={orbSizeCompact} 
                  state={state === 'playing' ? 'listening' : 'idle'}
                />
              </div>

              {/* Script Text - Scrollable with Karaoke Effect */}
              {script?.fullScript && (
                <div 
                  className="flex-1 min-h-0 px-6 overflow-y-auto"
                  ref={scrollContainerRef}
                  data-scroll-container
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <KaraokeText 
                      text={script.fullScript}
                      progress={audioProgress}
                      isRTL={isRTL}
                    />
                  </motion.div>
                </div>
              )}

              {/* Progress */}
              <div className="flex-shrink-0 px-6 py-2 border-t border-border/50">
                <Progress value={progress} className="h-1" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(elapsedTime)}</span>
                  <span>{formatTime(estimatedDuration)}</span>
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
                  +{Math.max(1, Math.round(estimatedDuration / 60)) * 10} XP
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
