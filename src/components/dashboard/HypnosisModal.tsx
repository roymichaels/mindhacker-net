import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2, Sparkles, Lock, Rocket, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const scriptRef = useRef<HypnosisScript | null>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingCountdown, setBreathingCountdown] = useState(0);
  const [cachedAudioPaths, setCachedAudioPaths] = useState<string[] | null>(null);
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>('elevenlabs');
  
  // NEW: State (not just ref) for timer reactivity
  const [voiceStarted, setVoiceStarted] = useState(false);

  const prefetchedAudioRef = useRef<Map<number, { url: string; provider: VoiceProvider }>>(new Map());
  const startTimeRef = useRef<number>(0);
  const playingRef = useRef<boolean>(false);
  const voiceStartedRef = useRef<boolean>(false); // Track when voice actually starts (ref for sync checks)
  const currentPlayingSegmentRef = useRef<number>(-1); // Track which segment is currently playing to prevent race conditions
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // NEW: Timeout tracking for cleanup
  const timeoutRefs = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  
  // NEW: Session ID for stale callback detection
  const sessionIdRef = useRef<number>(0);
  
  // NEW: Abort controller for async operations
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // NEW: Helper to schedule timeouts that can be tracked and cleared
  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timeoutRefs.current.delete(id);
      fn();
    }, delay);
    timeoutRefs.current.add(id);
    return id;
  }, []);

  // NEW: Clear all tracked timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(id => clearTimeout(id));
    timeoutRefs.current.clear();
  }, []);

  // NEW: Comprehensive cleanup function
  const fullCleanup = useCallback(() => {
    // 1. Stop the playing flag immediately
    playingRef.current = false;
    
    // 2. Clear ALL scheduled timeouts
    clearAllTimeouts();
    
    // 3. Stop all audio elements
    stopCurrentAudio();
    stopBrowserSpeech();
    
    // 4. Abort any pending fetch/synthesis requests
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

  // Auto-scroll to top when segment changes
  useEffect(() => {
    if (scrollContainerRef.current && currentSegmentIndex >= 0) {
      // Defer to the next frame so layout is ready (prevents "doesn't scroll" on mobile)
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }, [currentSegmentIndex]);

  // Auto-populate goal from profile context when modal opens
  useEffect(() => {
    if (open && !isLoadingContext && suggestedGoal && !goalInitialized) {
      setGoal(suggestedGoal);
      setGoalInitialized(true);
    }
  }, [open, isLoadingContext, suggestedGoal, goalInitialized]);

  // Reset state when modal closes - ENHANCED with session ID invalidation
  useEffect(() => {
    if (!open) {
      // Increment session ID to invalidate all pending callbacks
      sessionIdRef.current++;
      
      // Full cleanup
      fullCleanup();

      // Reset all state
      setState('setup');
      setGoal('');
      setGoalInitialized(false);
      setScript(null);
      scriptRef.current = null;
      setCurrentSegmentIndex(0);
      setProgress(0);
      setElapsedTime(0);
      setShowBreathing(false);
      setVoiceStarted(false);
      voiceStartedRef.current = false;
      currentPlayingSegmentRef.current = -1;
      prefetchedAudioRef.current.clear();
    }
  }, [open, fullCleanup]);

  // Hard cleanup on unmount (route changes etc.)
  useEffect(() => {
    return () => {
      sessionIdRef.current++;
      fullCleanup();
    };
  }, [fullCleanup]);

  // Progress timer - NOW properly reacts to voiceStarted state
  useEffect(() => {
    if (state !== 'playing') return;
    // Don't update timer until voice has actually started
    if (!voiceStarted) return;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setElapsedTime(elapsed);
      const totalSeconds = duration * 60;
      setProgress(Math.min((elapsed / totalSeconds) * 100, 100));
    }, 100);

    return () => clearInterval(interval);
  }, [state, duration, voiceStarted]); // Added voiceStarted as dependency

  // Helper to mark voice as started - updates both ref and state
  const markVoiceStarted = useCallback(() => {
    if (!voiceStartedRef.current) {
      voiceStartedRef.current = true;
      setVoiceStarted(true); // Trigger state update for timer effect
      startTimeRef.current = Date.now();
    }
  }, []);

  const startBreathing = async () => {
    // Auto-set goal from milestone if not already set
    const sessionGoal = goal.trim() || currentMilestone?.title || (language === 'he' ? 'רגיעה עמוקה ושלווה' : 'Deep relaxation and peace');
    setGoal(sessionGoal);

    impact('medium');
    // Ensure we're marked as playing before we start generating
    playingRef.current = true;

    // Skip breathing - go directly to generating
    handleStartSession();
  };

  const handleStartSession = async () => {
    setState('generating');
    hapticPattern('selection');
    playingRef.current = true;
    
    // Create new abort controller for this session
    abortControllerRef.current = new AbortController();
    const currentSessionId = sessionIdRef.current;

    try {
      const cacheKey = generateCacheKey({
        egoState: 'personalized',
        goal,
        durationMinutes: duration,
        language: language as 'he' | 'en',
      });

      if (user?.id) {
        const cached = await checkScriptCache(user.id, cacheKey);
        
        // Check if session was cancelled during cache check
        if (sessionIdRef.current !== currentSessionId) return;
        
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
            voiceStartedRef.current = false;
            setVoiceStarted(false);
            currentPlayingSegmentRef.current = -1;
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

      // Check if session was cancelled during script generation
      if (sessionIdRef.current !== currentSessionId) return;

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
      voiceStartedRef.current = false;
      setVoiceStarted(false);
      currentPlayingSegmentRef.current = -1;
      hapticPattern('success');
      
      prefetchedAudioRef.current.clear();
      playSegment(0, generatedScript);
    } catch (error) {
      // Check if this was an abort
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
  }, [user?.id, duration, goal, impact, hapticPattern, recordSession, clearAllTimeouts]);

  const playSegment = useCallback(async (index: number, scriptOverride?: HypnosisScript, cachedPaths?: string[]) => {
    // Capture session ID at the start of this call
    const currentSessionId = sessionIdRef.current;
    
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

    if (isMuted) {
      const wordsPerMinute = 130;
      const words = segment.text.split(/\s+/).length;
      const readingTime = Math.max((words / wordsPerMinute) * 60 * 1000, 2000);
      
      // Use tracked timeout instead of raw setTimeout
      scheduleTimeout(() => {
        // Guard against stale callbacks
        if (sessionIdRef.current !== currentSessionId) return;
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
            // Guard against stale callbacks
            if (sessionIdRef.current !== currentSessionId) return;
            if (playingRef.current) {
              playSegment(index + 1, activeScript, activeCachedPaths);
            }
          },
          onError: () => {
            // Guard against stale callbacks
            if (sessionIdRef.current !== currentSessionId) return;
            if (playingRef.current) {
              scheduleTimeout(() => {
                if (sessionIdRef.current !== currentSessionId) return;
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
        
        // Check if session was cancelled during fetch
        if (sessionIdRef.current !== currentSessionId) return;
        
        if (cachedUrl) {
          void prefetchSegmentAudio(index + 1, activeScript, activeCachedPaths);
          await playAudioUrl(cachedUrl, {
            onStart: markVoiceStarted,
            onEnd: () => {
              // Guard against stale callbacks
              if (sessionIdRef.current !== currentSessionId) return;
              if (playingRef.current) {
                playSegment(index + 1, activeScript, activeCachedPaths);
              }
            },
            onError: () => {
              // Guard against stale callbacks
              if (sessionIdRef.current !== currentSessionId) return;
              if (playingRef.current) {
                scheduleTimeout(() => {
                  if (sessionIdRef.current !== currentSessionId) return;
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
        // Check if session was cancelled
        if (sessionIdRef.current !== currentSessionId) return;
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

      // Check if session was cancelled during synthesis
      if (sessionIdRef.current !== currentSessionId) return;

      if (result) {
        setVoiceProvider(result.provider);
        await playAudioUrl(result.audioUrl, {
          onStart: markVoiceStarted,
          onEnd: () => {
            // Guard against stale callbacks
            if (sessionIdRef.current !== currentSessionId) return;
            if (playingRef.current) {
              playSegment(index + 1, activeScript, activeCachedPaths);
            }
          },
          onError: () => {
            // Guard against stale callbacks
            if (sessionIdRef.current !== currentSessionId) return;
            if (playingRef.current) {
              scheduleTimeout(() => {
                if (sessionIdRef.current !== currentSessionId) return;
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
        
        // Use tracked timeout
        scheduleTimeout(() => {
          if (sessionIdRef.current !== currentSessionId) return;
          if (playingRef.current) {
            playSegment(index + 1, activeScript, activeCachedPaths);
          }
        }, readingTime);
      }
    } catch (error) {
      // Check if session was cancelled
      if (sessionIdRef.current !== currentSessionId) return;
      
      // Use tracked timeout
      scheduleTimeout(() => {
        if (sessionIdRef.current !== currentSessionId) return;
        if (playingRef.current) {
          playSegment(index + 1, activeScript, activeCachedPaths);
        }
      }, 1000);
    }
  }, [isMuted, voiceProvider, impact, cachedAudioPaths, handleSessionComplete, prefetchSegmentAudio, markVoiceStarted, scheduleTimeout]);

  const togglePlayPause = () => {
    impact('medium');
    if (state === 'playing') {
      setState('paused');
      playingRef.current = false;
      stopCurrentAudio();
      stopBrowserSpeech();
      clearAllTimeouts(); // Clear any pending segment timeouts
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

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Increment session ID to invalidate all pending callbacks
      sessionIdRef.current++;
      fullCleanup();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="max-w-2xl h-[85svh] max-h-[92svh] p-0 flex flex-col overflow-hidden bg-background"
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
                  <div className="relative w-24 h-24 mx-auto mb-4 overflow-visible">
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
                className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 space-y-4 sm:space-y-6"
              >
                <div className="overflow-visible">
                  <PersonalizedOrb 
                    size={orbSize} 
                    state="listening"
                    renderer="css"
                  />
                </div>
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
                {/* Orb Area - Explicit minimum height */}
                <div className="flex-shrink-0 flex items-center justify-center min-h-[160px] sm:min-h-[200px] p-2 sm:p-4 overflow-visible">
                  <PersonalizedOrb 
                    size={orbSizeCompact} 
                    state={state === 'playing' ? 'listening' : 'idle'}
                    renderer="css"
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
                <div className="flex-shrink-0 flex items-center justify-center gap-4 p-3 sm:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
