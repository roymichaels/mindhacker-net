import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2, Sparkles, Lock, Rocket, Calendar } from 'lucide-react';
// ScrollArea removed - using native scroll for ref support
import { supabase } from '@/integrations/supabase/client';
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
  type ScriptSegment,
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

type SessionState = 'setup' | 'breathing' | 'generating' | 'playing' | 'paused' | 'complete';

// Gender is now handled by the AI based on user profile - no normalization needed

const SEGMENT_LABELS: Record<string, { he: string; en: string }> = {
  welcome: { he: 'ברוכים הבאים', en: 'Welcome' },
  induction: { he: 'כניסה לטראנס', en: 'Induction' },
  deepening: { he: 'העמקה', en: 'Deepening' },
  core_work: { he: 'העבודה המרכזית', en: 'Core Work' },
  integration: { he: 'אינטגרציה', en: 'Integration' },
  emergence: { he: 'יציאה', en: 'Emergence' },
};

// Default goal fallback used when no milestone is set

export function HypnosisModal({ open, onOpenChange }: HypnosisModalProps) {
  const { t, isRTL, language } = useTranslation();
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
  const scriptRef = useRef<HypnosisScript | null>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingCountdown, setBreathingCountdown] = useState(0);
  const [cachedAudioPaths, setCachedAudioPaths] = useState<string[] | null>(null);
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>('elevenlabs');

  const prefetchedAudioRef = useRef<Map<number, { url: string; provider: VoiceProvider }>>(new Map());
  const startTimeRef = useRef<number>(0);
  const playingRef = useRef<boolean>(false);
  const voiceStartedRef = useRef<boolean>(false); // Track when voice actually starts
  const currentPlayingSegmentRef = useRef<number>(-1); // Track which segment is currently playing to prevent race conditions
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentSegment = script?.segments[currentSegmentIndex];
  
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

  // Auto-scroll to top when segment changes
  useEffect(() => {
    if (scrollContainerRef.current && currentSegmentIndex >= 0) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSegmentIndex]);

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
      stopCurrentAudio(); // Stop any playing audio
      stopBrowserSpeech();
      setState('setup');
      setGoal('');
      setGoalInitialized(false);
      setScript(null);
      scriptRef.current = null;
      setCurrentSegmentIndex(0);
      setProgress(0);
      setElapsedTime(0);
      setShowBreathing(false);
      playingRef.current = false;
      voiceStartedRef.current = false;
      currentPlayingSegmentRef.current = -1;
      prefetchedAudioRef.current.clear();
    }
  }, [open]);

  // Progress timer - only runs when voice has actually started
  useEffect(() => {
    if (state !== 'playing') return;
    // Don't update timer until voice has started
    if (!voiceStartedRef.current) return;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setElapsedTime(elapsed);
      const totalSeconds = duration * 60;
      setProgress(Math.min((elapsed / totalSeconds) * 100, 100));
    }, 100);

    return () => clearInterval(interval);
  }, [state, duration]);

  const startBreathing = async () => {
    // Auto-set goal from milestone if not already set
    const sessionGoal = goal.trim() || currentMilestone?.title || (language === 'he' ? 'רגיעה עמוקה ושלווה' : 'Deep relaxation and peace');
    setGoal(sessionGoal);

    impact('medium');
    // Skip breathing - go directly to generating
    handleStartSession();
  };

  const handleStartSession = async () => {
    setState('generating');
    hapticPattern('selection');

    try {
      const cacheKey = generateCacheKey({
        egoState: 'personalized',
        goal,
        durationMinutes: duration,
        language: language as 'he' | 'en',
      });

      if (user?.id) {
        const cached = await checkScriptCache(user.id, cacheKey);
        
        if (cached?.script_data) {
          const cachedScript = cached.script_data as unknown as HypnosisScript;
          
          if (cachedScript?.segments?.length) {
            scriptRef.current = cachedScript;
            setScript(cachedScript);
            
            if (cached.audio_paths?.length) {
              setCachedAudioPaths(cached.audio_paths);
            }
            
            setState('playing');
            playingRef.current = true;
            voiceStartedRef.current = false; // Will be set when voice actually starts
            currentPlayingSegmentRef.current = -1; // Reset segment lock
            hapticPattern('success');
            
            playSegment(0, cachedScript, cached.audio_paths || undefined);
            return;
          }
        }
      }

      const generatedScript = await generateHypnosisScript({
        egoState: 'personalized',
        goal,
        durationMinutes: duration,
        userLevel: gameState?.level || 1,
        sessionStreak: gameState?.sessionStreak || 0,
        previousSessions: 0,
        language: language as 'he' | 'en',
      });

      if (!generatedScript?.segments?.length) {
        throw new Error('Invalid script: no segments generated');
      }

      if (user?.id) {
        await saveScriptToCache(user.id, cacheKey, generatedScript, {
          egoState: 'personalized',
          goal,
          durationMinutes: duration,
          language: language as 'he' | 'en',
        });
        cacheScriptAudio(user.id, cacheKey, generatedScript.segments, language as 'he' | 'en');
      }

      scriptRef.current = generatedScript;
      setScript(generatedScript);
      setState('playing');
      playingRef.current = true;
      voiceStartedRef.current = false; // Will be set when voice actually starts
      currentPlayingSegmentRef.current = -1; // Reset segment lock
      hapticPattern('success');
      
      prefetchedAudioRef.current.clear();
      playSegment(0, generatedScript);
    } catch (error) {
      console.error('Failed to generate script:', error);
      hapticPattern('error');
      toast({
        title: language === 'he' ? 'שגיאה ביצירת הסשן' : 'Error generating session',
        variant: 'destructive',
      });
      setState('setup');
    }
  };

  const prefetchSegmentAudio = useCallback(async (
    index: number,
    activeScript: HypnosisScript,
    activeCachedPaths?: string[]
  ) => {
    if (index >= activeScript.segments.length) return;
    if (prefetchedAudioRef.current.has(index)) return;
    if (isMuted) return;

    const nextSegment = activeScript.segments[index];
    if (!nextSegment?.text) return;

    const cachedPath = activeCachedPaths?.[index];
    if (cachedPath) {
      const signed = await getCachedAudioUrl(cachedPath);
      if (signed) {
        prefetchedAudioRef.current.set(index, { url: signed, provider: voiceProvider });
        return;
      }
    }

    const result = await synthesizeSpeech(nextSegment.text, {
      provider: voiceProvider,
      voice: 'sarah',
      speed: 0.9,
    });
    if (result?.audioUrl) {
      prefetchedAudioRef.current.set(index, { url: result.audioUrl, provider: result.provider });
    }
  }, [isMuted, voiceProvider]);

  const handleSessionComplete = useCallback(async () => {
    setState('complete');
    playingRef.current = false;
    
    // Stop any currently playing audio immediately
    stopCurrentAudio();
    stopBrowserSpeech();
    
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
  }, [user?.id, duration, goal, impact, hapticPattern, recordSession]);

  const playSegment = useCallback(async (index: number, scriptOverride?: HypnosisScript, cachedPaths?: string[]) => {
    // Early return if session was paused/stopped
    if (!playingRef.current) {
      return;
    }
    
    // Prevent race conditions - if we're already playing this or a later segment, ignore
    if (currentPlayingSegmentRef.current >= index) {
      return;
    }
    
    // Lock this segment
    currentPlayingSegmentRef.current = index;
    
    const activeScript = scriptOverride || scriptRef.current;
    const activeCachedPaths = cachedPaths || cachedAudioPaths;
    
    if (!activeScript || !activeScript.segments || activeScript.segments.length === 0) {
      return;
    }
    
    if (index >= activeScript.segments.length) {
      handleSessionComplete();
      return;
    }

    const segment = activeScript.segments[index];
    if (!segment?.text) {
      if (playingRef.current && index + 1 < activeScript.segments.length) {
        playSegment(index + 1, activeScript, activeCachedPaths);
      } else if (playingRef.current) {
        handleSessionComplete();
      }
      return;
    }

    // Stop any currently playing audio before starting new segment
    stopCurrentAudio();
    
    setCurrentSegmentIndex(index);
    impact('light');

    // Helper function to start timer on first audio
    const markVoiceStarted = () => {
      if (!voiceStartedRef.current) {
        voiceStartedRef.current = true;
        startTimeRef.current = Date.now();
      }
    };

    if (isMuted) {
      const wordsPerMinute = 130;
      const words = segment.text.split(/\s+/).length;
      const readingTime = Math.max((words / wordsPerMinute) * 60 * 1000, 2000);
      
      setTimeout(() => {
        if (playingRef.current) {
          playSegment(index + 1, activeScript, activeCachedPaths);
        }
      }, readingTime);
      return;
    }

    const prefetched = prefetchedAudioRef.current.get(index);
    if (prefetched?.url) {
      try {
        setVoiceProvider(prefetched.provider);
        await playAudioUrl(prefetched.url, {
          onStart: markVoiceStarted,
          onEnd: () => {
            if (playingRef.current) {
              playSegment(index + 1, activeScript, activeCachedPaths);
            }
          },
          onError: () => {
            // Double-check playingRef before and after timeout
            if (playingRef.current) {
              setTimeout(() => {
                if (playingRef.current) {
                  playSegment(index + 1, activeScript, activeCachedPaths);
                }
              }, 500);
            }
          },
        });
        return;
      } finally {
        if (index - 2 >= 0) prefetchedAudioRef.current.delete(index - 2);
      }
    }

    if (activeCachedPaths && activeCachedPaths[index]) {
      try {
        const cachedUrl = await getCachedAudioUrl(activeCachedPaths[index]);
        if (cachedUrl) {
          void prefetchSegmentAudio(index + 1, activeScript, activeCachedPaths);
          await playAudioUrl(cachedUrl, {
            onStart: markVoiceStarted,
            onEnd: () => {
              if (playingRef.current) {
                playSegment(index + 1, activeScript, activeCachedPaths);
              }
            },
            onError: () => {
              // Double-check playingRef before and after timeout
              if (playingRef.current) {
                setTimeout(() => {
                  if (playingRef.current) {
                    playSegment(index + 1, activeScript, activeCachedPaths);
                  }
                }, 500);
              }
            },
          });
          return;
        }
      } catch (error) {
        console.warn('Failed to get cached audio:', error);
      }
    }

    try {
      void prefetchSegmentAudio(index + 1, activeScript, activeCachedPaths);

      const result = await synthesizeSpeech(segment.text, {
        provider: voiceProvider,
        voice: 'sarah',
        speed: 0.9,
      });

      if (result) {
        setVoiceProvider(result.provider);
        await playAudioUrl(result.audioUrl, {
          onStart: markVoiceStarted,
          onEnd: () => {
            if (playingRef.current) {
              playSegment(index + 1, activeScript, activeCachedPaths);
            }
          },
          onError: () => {
            // Double-check playingRef before and after timeout
            if (playingRef.current) {
              setTimeout(() => {
                if (playingRef.current) {
                  playSegment(index + 1, activeScript, activeCachedPaths);
                }
              }, 500);
            }
          },
        });
      } else {
        const wordsPerMinute = 130;
        const words = segment.text.split(/\s+/).length;
        const readingTime = Math.max((words / wordsPerMinute) * 60 * 1000, 2000);
        
        setTimeout(() => {
          if (playingRef.current) {
            playSegment(index + 1, activeScript, activeCachedPaths);
          }
        }, readingTime);
      }
    } catch (error) {
      setTimeout(() => {
        if (playingRef.current) {
          playSegment(index + 1, activeScript, activeCachedPaths);
        }
      }, 1000);
    }
  }, [isMuted, voiceProvider, impact, cachedAudioPaths, handleSessionComplete, prefetchSegmentAudio]);

  const togglePlayPause = () => {
    impact('medium');
    if (state === 'playing') {
      setState('paused');
      playingRef.current = false;
      stopCurrentAudio(); // Stop audio playback
      stopBrowserSpeech();
    } else if (state === 'paused' && scriptRef.current) {
      setState('playing');
      playingRef.current = true;
      // Reset segment lock to allow replaying current segment
      currentPlayingSegmentRef.current = currentSegmentIndex - 1;
      playSegment(currentSegmentIndex, scriptRef.current);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Locked state for users who haven't completed launchpad
  if (!isLoadingLaunchpad && !isLaunchpadComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <VisuallyHidden>
            <DialogTitle>{t('hypnosisSession.title')}</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">
                {t('hypnosisSession.lockedTitle')}
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                {t('hypnosisSession.lockedDescription')}
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="gap-2">
              <Rocket className="w-4 h-4" />
              {t('hypnosisSession.goBack')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-2xl h-[85vh] max-h-[700px] p-0 overflow-hidden bg-background"
          dir={isRTL ? 'rtl' : 'ltr'}
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking outside during session
            if (state === 'playing' || state === 'paused' || state === 'generating' || state === 'breathing') {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // Prevent all outside interactions during active session
            if (state === 'playing' || state === 'paused' || state === 'generating' || state === 'breathing') {
              e.preventDefault();
            }
          }}
        >
        <VisuallyHidden>
          <DialogTitle>{t('hypnosisSession.title')}</DialogTitle>
        </VisuallyHidden>

        <div 
          className="flex flex-col h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Setup State */}
          <AnimatePresence mode="wait">
            {state === 'setup' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6 space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl scale-125" />
                    <PersonalizedOrb size={96} state="idle" />
                  </div>
                  <h1 className="text-2xl font-bold">
                    {t('hypnosisSession.personalHypnosis')}
                  </h1>
                </div>

                {/* Current Week Context Card - Simplified */}
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

                <Button onClick={startBreathing} size="lg" className="gap-2 px-8">
                  <Play className="w-5 h-5" />
                  {t('hypnosisSession.startSession')}
                </Button>
              </motion.div>
            )}


            {/* Generating State - Enhanced */}
            {state === 'generating' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6 space-y-6"
              >
                <PersonalizedOrb 
                  size={200} 
                  state="listening"
                />
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  
                  {/* Rotating messages */}
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
                  
                  {/* Disclaimer */}
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
                {/* Orb Area - Fixed height */}
                <div className="flex-shrink-0 flex items-center justify-center p-4 sm:p-6">
                  <PersonalizedOrb 
                    size={200} 
                    state={state === 'playing' ? 'listening' : 'idle'}
                  />
                </div>

                {/* Current Segment Text - Scrollable area with auto-scroll */}
                {currentSegment && (
                  <div 
                    className="flex-1 min-h-0 px-6 overflow-y-auto"
                    ref={scrollContainerRef}
                  >
                    <motion.div 
                      key={currentSegmentIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-4"
                    >
                      <p className="text-xs text-primary/60 uppercase tracking-wider mb-3">
                        {SEGMENT_LABELS[currentSegment.mood]?.[language as 'he' | 'en'] || currentSegment.mood}
                      </p>
                      <p className="text-lg leading-loose text-foreground/90 whitespace-pre-wrap">
                        {currentSegment.text}
                      </p>
                    </motion.div>
                  </div>
                )}

                {/* Progress - Fixed at bottom */}
                <div className="flex-shrink-0 px-6 py-2 border-t border-border/50">
                  <Progress value={progress} className="h-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTime(elapsedTime)}</span>
                    <span>{formatTime(duration * 60)}</span>
                  </div>
                </div>

                {/* Controls - Fixed at bottom */}
                <div className="flex-shrink-0 flex items-center justify-center gap-4 p-4 sm:p-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  <Button
                    size="lg"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full"
                    onClick={togglePlayPause}
                  >
                    {state === 'playing' ? <Pause className="h-6 w-6 sm:h-8 sm:w-8" /> : <Play className="h-6 w-6 sm:h-8 sm:w-8" />}
                  </Button>

                  <div className="w-10" /> {/* Spacer for symmetry */}
                </div>
              </motion.div>
            )}

            {/* Complete State */}
            {state === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-6 space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">
                    {t('hypnosisSession.sessionComplete')}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === 'he' 
                      ? `הרווחת ${duration * 10} XP`
                      : `You earned ${duration * 10} XP`}
                  </p>
                </div>
                <Button onClick={() => onOpenChange(false)} size="lg">
                  {t('hypnosisSession.finish')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
