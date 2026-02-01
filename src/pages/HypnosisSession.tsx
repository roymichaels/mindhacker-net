import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, ChevronDown, Wind, Loader2, Sparkles, Lock, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/contexts/GameStateContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { useMultiThreadOrbProfile } from '@/hooks/useMultiThreadOrbProfile';
import { BreathingGuide } from '@/components/hypnosis';
import { 
  generateHypnosisScript, 
  type HypnosisScript,
  generateCacheKey,
  checkScriptCache,
  saveScriptToCache,
  getCachedAudioUrl,
  cacheScriptAudio,
} from '@/services/hypnosis';
import { synthesizeSpeech, speakWithBrowser, stopBrowserSpeech, isBrowserTTSAvailable, playAudioUrl } from '@/services/voice';
import { saveSession } from '@/services/userMemory';
import { awardXp } from '@/services/unifiedContext';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import type { VoiceProvider } from '@/services/voice';

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

const PRESET_GOALS: Record<string, { he: string; en: string }> = {
  calm: { he: 'להרגיש רגיעה עמוקה ושלווה', en: 'Feel deep calm and peace' },
  focus: { he: 'להגביר את המיקוד והריכוז', en: 'Enhance focus and concentration' },
  energy: { he: 'לטעון את האנרגיה והמוטיבציה', en: 'Boost energy and motivation' },
  sleep: { he: 'להתכונן לשינה עמוקה ומרגיעה', en: 'Prepare for deep, restful sleep' },
};

const HypnosisSession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const { gameState, recordSession } = useGameState();
  const { isLaunchpadComplete, isLoading: isLoadingLaunchpad } = useLaunchpadProgress();
  const { impact, pattern: hapticPattern, heartbeat } = useHaptics();
  const { profile: orbProfile } = useMultiThreadOrbProfile();

  const presetId = searchParams.get('preset');
  const presetDuration = searchParams.get('duration');
  const urlGoal = searchParams.get('goal');
  const isDailySession = searchParams.get('daily') === 'true';

  const [state, setState] = useState<SessionState>('setup');
  const [goal, setGoal] = useState(urlGoal || '');
  const [duration, setDuration] = useState(presetDuration ? parseInt(presetDuration) : 10);
  const [script, setScript] = useState<HypnosisScript | null>(null);
  const scriptRef = useRef<HypnosisScript | null>(null); // Sync ref for script
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingCountdown, setBreathingCountdown] = useState(0);
  const [cachedAudioPaths, setCachedAudioPaths] = useState<string[] | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>('elevenlabs');

  const [orbSize, setOrbSize] = useState(360);
  const prefetchedAudioRef = useRef<Map<number, { url: string; provider: VoiceProvider }>>(new Map());

  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef<boolean>(false);

  const currentSegment = script?.segments[currentSegmentIndex];

  useEffect(() => {
    const compute = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 390;
      const h = typeof window !== 'undefined' ? window.innerHeight : 844;
      // Make orb dominant but keep room for bottom controls.
      const size = Math.floor(Math.min(w * 0.86, (h - 220) * 0.78, 520));
      setOrbSize(Math.max(280, size));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Set preset goal
  useEffect(() => {
    if (presetId && PRESET_GOALS[presetId]) {
      setGoal(PRESET_GOALS[presetId][language as 'he' | 'en'] || '');
    }
  }, [presetId, language]);

  // Start breathing exercise before session
  const startBreathing = async () => {
    if (!goal.trim()) {
      toast({
        title: language === 'he' ? 'נא להזין מטרה' : 'Please enter a goal',
        variant: 'destructive',
      });
      return;
    }

    impact('medium');
    setState('breathing');
    setShowBreathing(true);
    setBreathingCountdown(20); // 20 seconds of breathing

    // Countdown for breathing exercise
    const interval = setInterval(() => {
      setBreathingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowBreathing(false);
          handleStartSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Skip breathing and start immediately
  const skipBreathing = () => {
    setShowBreathing(false);
    handleStartSession();
  };

  // Generate script (or load from cache)
  const handleStartSession = async () => {
    setState('generating');
    hapticPattern('selection');

    try {
      // Generate cache key (without ego state)
      const cacheKey = generateCacheKey({
        egoState: 'personalized', // Use fixed key since personalization is from profile
        goal,
        durationMinutes: duration,
        language: language as 'he' | 'en',
      });

      // Check cache first
      if (user?.id) {
        const cached = await checkScriptCache(user.id, cacheKey);
        
        if (cached?.script_data) {
          console.log('✅ Script loaded from cache');
          const cachedScript = cached.script_data as unknown as HypnosisScript;
          
          // Validate cached script
          if (cachedScript?.segments?.length) {
            scriptRef.current = cachedScript;
            setScript(cachedScript);
            setIsFromCache(true);
            
            // Check if audio is also cached
            if (cached.audio_paths?.length) {
              setCachedAudioPaths(cached.audio_paths);
              console.log('✅ Audio paths loaded from cache');
            }
            
            setState('playing');
            startTimeRef.current = Date.now();
            playingRef.current = true;
            hapticPattern('success');
            
            // Play with cached audio if available
            playSegment(0, cachedScript, cached.audio_paths || undefined);
            return;
          }
        }
      }

      // No cache - generate new script (without ego state)
      console.log('🆕 Generating new personalized script...');
      const generatedScript = await generateHypnosisScript({
        egoState: 'personalized', // Personalization comes from full profile on backend
        goal,
        durationMinutes: duration,
        userLevel: gameState?.level || 1,
        sessionStreak: gameState?.sessionStreak || 0,
        previousSessions: 0,
        language: language as 'he' | 'en',
      });

      // Validate script has segments before proceeding
      if (!generatedScript?.segments?.length) {
        throw new Error('Invalid script: no segments generated');
      }

      // Save to cache
      if (user?.id) {
        await saveScriptToCache(user.id, cacheKey, generatedScript, {
          egoState: 'personalized',
          goal,
          durationMinutes: duration,
          language: language as 'he' | 'en',
        });
        console.log('💾 Script saved to cache');
        
        // Trigger background audio caching (fire and forget)
        cacheScriptAudio(user.id, cacheKey, generatedScript.segments, language as 'he' | 'en');
      }

      // Update both ref (sync) and state (async) 
      scriptRef.current = generatedScript;
      setScript(generatedScript);
      setIsFromCache(false);
      setState('playing');
      startTimeRef.current = Date.now();
      playingRef.current = true;
      hapticPattern('success');
      
      // Pass script directly to avoid race condition
      prefetchedAudioRef.current.clear();
      playSegment(0, generatedScript);
    } catch (error) {
      console.error('Failed to generate script:', error);
      hapticPattern('error');
      toast({
        title: language === 'he' ? 'שגיאה ביצירת הסשן' : 'Error generating session',
        description: language === 'he' ? 'נסה שוב' : 'Please try again',
        variant: 'destructive',
      });
      setState('setup');
    }
  };

  // Restart session from beginning
  const restartSession = () => {
    impact('medium');
    stopBrowserSpeech();
    setCurrentSegmentIndex(0);
    setProgress(0);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    playingRef.current = true;
    setState('playing');
    prefetchedAudioRef.current.clear();
    
    if (scriptRef.current) {
      playSegment(0, scriptRef.current, cachedAudioPaths || undefined);
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

    // Prefer cached signed URL if exists
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

  // Play a segment using cached audio or ElevenLabs/OpenAI TTS with browser fallback
  // Accept optional scriptOverride and cachedPaths for initial call to avoid state race condition
  const playSegment = useCallback(async (index: number, scriptOverride?: HypnosisScript, cachedPaths?: string[]) => {
    const activeScript = scriptOverride || scriptRef.current;
    const activeCachedPaths = cachedPaths || cachedAudioPaths;
    
    // Guard against missing script or completed segments
    if (!activeScript || !activeScript.segments || activeScript.segments.length === 0) {
      console.error('playSegment called without valid script');
      return;
    }
    
    if (index >= activeScript.segments.length) {
      handleSessionComplete();
      return;
    }

    const segment = activeScript.segments[index];
    if (!segment?.text) {
      console.warn(`Segment ${index} has no text, skipping`);
      if (playingRef.current && index + 1 < activeScript.segments.length) {
        playSegment(index + 1, activeScript, activeCachedPaths);
      } else {
        handleSessionComplete();
      }
      return;
    }

    setCurrentSegmentIndex(index);
    impact('light');

    if (isMuted) {
      // If muted, simulate reading time
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

    // Fast path: already prefetched
    const prefetched = prefetchedAudioRef.current.get(index);
    if (prefetched?.url) {
      try {
        setVoiceProvider(prefetched.provider);
        await playAudioUrl(prefetched.url, {
          onEnd: () => {
            if (playingRef.current) {
              playSegment(index + 1, activeScript, activeCachedPaths);
            }
          },
          onError: (error) => {
            console.error('Prefetched audio playback error:', error);
            if (playingRef.current) {
              setTimeout(() => playSegment(index + 1, activeScript, activeCachedPaths), 500);
            }
          },
        });
        return;
      } finally {
        // Keep only a small window to avoid memory bloat
        if (index - 2 >= 0) prefetchedAudioRef.current.delete(index - 2);
      }
    }

    // Check for cached audio first
    if (activeCachedPaths && activeCachedPaths[index]) {
      try {
        const cachedUrl = await getCachedAudioUrl(activeCachedPaths[index]);
        if (cachedUrl) {
          console.log(`▶️ Playing cached audio for segment ${index}`);
          // Prefetch next while current plays
          void prefetchSegmentAudio(index + 1, activeScript, activeCachedPaths);
          await playAudioUrl(cachedUrl, {
            onEnd: () => {
              if (playingRef.current) {
                playSegment(index + 1, activeScript, activeCachedPaths);
              }
            },
            onError: (error) => {
              console.error('Cached audio playback error, continuing to next segment:', error);
              // Continue to next segment on error
              if (playingRef.current) {
                setTimeout(() => playSegment(index + 1, activeScript, activeCachedPaths), 500);
              }
            },
          });
          return;
        }
      } catch (error) {
        console.warn('Failed to get cached audio, falling back to synthesis:', error);
      }
    }

    // No cached audio, synthesize using TTS
    try {
      // Try ElevenLabs → OpenAI → Browser fallback
      // Prefetch next as early as possible (without blocking current)
      void prefetchSegmentAudio(index + 1, activeScript, activeCachedPaths);

      const result = await synthesizeSpeech(segment.text, {
        provider: voiceProvider,
        voice: 'sarah', // Premium calm female voice
        speed: 0.9,
      });

      if (result) {
        setVoiceProvider(result.provider);
        
        await playAudioUrl(result.audioUrl, {
          onEnd: () => {
            if (playingRef.current) {
              playSegment(index + 1, activeScript, activeCachedPaths);
            }
          },
          onError: (error) => {
            console.error('Audio playback error:', error);
            // Continue to next segment on error
            if (playingRef.current) {
              setTimeout(() => playSegment(index + 1, activeScript, activeCachedPaths), 500);
            }
          },
        });
      } else {
        // All TTS failed, use timer-based progression
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
      console.error('Segment playback error:', error);
      // Continue to next segment
      setTimeout(() => {
        if (playingRef.current) {
          playSegment(index + 1, activeScript, activeCachedPaths);
        }
      }, 1000);
    }
  }, [isMuted, voiceProvider, impact, cachedAudioPaths]);

  // Handle pause/resume
  const togglePlayPause = () => {
    impact('medium');
    if (state === 'playing') {
      setState('paused');
      playingRef.current = false;
      stopBrowserSpeech();
    } else if (state === 'paused' && scriptRef.current) {
      setState('playing');
      playingRef.current = true;
      playSegment(currentSegmentIndex, scriptRef.current);
    }
  };

  // Skip to next segment
  const skipSegment = () => {
    impact('light');
    stopBrowserSpeech();
    const activeScript = scriptRef.current;
    if (activeScript && currentSegmentIndex < activeScript.segments.length - 1) {
      playSegment(currentSegmentIndex + 1, activeScript);
    } else {
      handleSessionComplete();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    impact('light');
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
    hapticPattern('success');
    heartbeat();

    const sessionDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const xpGained = Math.floor(sessionDuration / 60) * 10 + 20;

    if (user?.id) {
      // Save session to hypnosis_sessions
      await saveSession(user.id, {
        egoState: 'personalized',
        action: goal,
        durationSeconds: sessionDuration,
        experienceGained: xpGained,
        scriptData: script ? { title: script.title, segments: script.segments.length } : undefined,
      });

      // Record session in game state
      await recordSession({
        egoState: 'personalized',
        durationSeconds: sessionDuration,
        action: goal,
        experienceGained: xpGained,
      });

      // Award XP through unified system
      await awardXp(user.id, xpGained, 'hypnosis', `personalized session: ${goal}`);

      // Feed session insights to Aurora Life Model (for significant sessions)
      if (sessionDuration >= 300) { // 5+ minute sessions
        try {
          await supabase.from('aurora_energy_patterns').insert({
            user_id: user.id,
            pattern_type: 'hypnosis_session',
            description: `${Math.round(sessionDuration / 60)} min personalized session: "${goal}"`,
          });
        } catch (e) {
          console.warn('Failed to log session to Aurora:', e);
        }
      }
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

  // Gate: block access if launchpad not complete
  if (!isLoadingLaunchpad && !isLaunchpadComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-white px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-center">
          {language === 'he' ? 'סשנים מותאמים אישית' : 'Personalized Sessions'}
        </h1>
        <p className="text-white/80 mb-6 max-w-md text-center">
          {language === 'he' 
            ? 'השלם את מסע הטרנספורמציה כדי לפתוח סשנים מותאמים אישית'
            : 'Complete the Transformation Journey to unlock personalized sessions'
          }
        </p>
        <Button 
          size="lg" 
          variant="secondary"
          onClick={() => navigate('/launchpad')}
          className="gap-2"
        >
          <Rocket className="w-5 h-5" />
          {language === 'he' ? 'התחל את המסע' : 'Start the Journey'}
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col",
        "bg-gradient-to-br from-primary to-primary/80",
        "overflow-hidden"
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-4 safe-area-top">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/10 touch-manipulation"
          onClick={handleExit}
        >
          <X className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/10 touch-manipulation"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </header>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col items-center justify-center px-4",
        (state === 'playing' || state === 'paused') ? "pb-28" : "pb-10",
        "safe-area-bottom"
      )}>
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
              <div className="mb-6 sm:mb-8">
                <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">✨</span>
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                  {language === 'he' ? 'סשן מותאם אישית' : 'Personalized Session'}
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
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center h-12 text-base touch-manipulation"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />

                <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                  {[5, 10, 15, 20].map((d) => (
                    <Button
                      key={d}
                      variant={duration === d ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        "min-w-[4rem] h-10 touch-manipulation",
                        duration !== d && "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                      onClick={() => {
                        impact('light');
                        setDuration(d);
                      }}
                    >
                      {d} {language === 'he' ? 'דק׳' : 'min'}
                    </Button>
                  ))}
                </div>

                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full gap-2 mt-4 sm:mt-6 h-12 sm:h-14 text-base touch-manipulation"
                  onClick={startBreathing}
                >
                  <Wind className="w-5 h-5" />
                  {language === 'he' ? 'התחל עם נשימות' : 'Start with Breathing'}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white hover:bg-white/10 touch-manipulation"
                  onClick={handleStartSession}
                >
                  {language === 'he' ? 'דלג ישירות לסשן' : 'Skip to Session'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Breathing State */}
          {state === 'breathing' && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-white"
            >
              <BreathingGuide 
                isActive={showBreathing}
                pattern={[4, 4, 4, 4]}
                language={language as 'he' | 'en'}
              />

              <p className="mt-6 text-sm text-white/60">
                {language === 'he' 
                  ? `ממשיכים בעוד ${breathingCountdown} שניות`
                  : `Continuing in ${breathingCountdown} seconds`
                }
              </p>

              <Button
                variant="ghost"
                className="mt-4 text-white/60 hover:text-white hover:bg-white/10 gap-1 touch-manipulation"
                onClick={skipBreathing}
              >
                <ChevronDown className="w-4 h-4" />
                {language === 'he' ? 'דלג' : 'Skip'}
              </Button>
            </motion.div>
          )}

          {/* Generating State - Enhanced with progress indicators */}
          {state === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-white"
            >
              <div className="relative">
                <div className="mx-auto" style={{ width: orbSize * 0.55, height: orbSize * 0.55 }}>
                  <MultiThreadOrb
                    size={Math.floor(orbSize * 0.55)}
                    showGlow={true}
                    profile={orbProfile}
                  />
                </div>
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <div className="rounded-full border-2 border-white/20 border-t-white/60" style={{ width: orbSize * 0.62, height: orbSize * 0.62 }} />
                </motion.div>
              </div>
              
              <div className="mt-6 sm:mt-8 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    {language === 'he' ? 'מכין את הסשן שלך...' : 'Preparing your session...'}
                  </h2>
                </div>
                
                <p className="text-white/60 text-sm sm:text-base">
                  {language === 'he' 
                    ? 'יוצר סקריפט מותאם אישית ומכין את הקול'
                    : 'Creating a personalized script and preparing the voice'
                  }
                </p>
                
                <motion.div 
                  className="flex items-center justify-center gap-1 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-white/60"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity, 
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.div>
                
                <p className="text-white/40 text-xs mt-4">
                  {language === 'he' 
                    ? 'זה יכול לקחת עד 30 שניות'
                    : 'This may take up to 30 seconds'
                  }
                </p>
              </div>
            </motion.div>
          )}

          {/* Playing/Paused State */}
          {(state === 'playing' || state === 'paused') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center text-center text-white"
            >
              {/* Orb - Big, dominant */}
              <div className="relative flex items-center justify-center w-full" style={{ height: `min(60vh, ${orbSize + 40}px)` }}>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/10" />
                </div>
                <div className="relative" style={{ width: orbSize, height: orbSize }}>
                  <MultiThreadOrb
                    size={orbSize}
                    state={state === 'playing' ? 'speaking' : 'idle'}
                    showGlow={true}
                    profile={orbProfile}
                  />
                </div>
              </div>

              {/* Current Segment */}
              {currentSegment && (
                <motion.div
                  key={currentSegment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3"
                >
                  <span className="text-xs sm:text-sm text-white/60 uppercase tracking-wider">
                    {SEGMENT_LABELS[currentSegment.id]?.[language as 'he' | 'en'] || currentSegment.id}
                  </span>
                </motion.div>
              )}

              {/* Cache indicator */}
              {isFromCache && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-xs text-white/40"
                >
                  ⚡ {language === 'he' ? 'נטען מהקאש' : 'Loaded from cache'}
                </motion.p>
              )}
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
              <motion.div 
                className="text-5xl sm:text-6xl mb-4 sm:mb-6"
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                ✨
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {language === 'he' ? 'כל הכבוד!' : 'Well Done!'}
              </h2>
              <p className="text-white/80 mb-6 sm:mb-8">
                {language === 'he' 
                  ? `השלמת סשן של ${formatTime(elapsedTime)}`
                  : `You completed a ${formatTime(elapsedTime)} session`
                }
              </p>

              <div className="space-y-3 max-w-xs mx-auto">
                <Button
                  variant="secondary"
                  className="w-full h-12 touch-manipulation"
                  onClick={() => {
                    impact('medium');
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
                  className="w-full h-12 text-white/80 hover:text-white hover:bg-white/10 touch-manipulation"
                  onClick={() => navigate('/dashboard')}
                >
                  {language === 'he' ? 'חזרה לדאשבורד' : 'Back to Dashboard'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Controls Bar (Playing/Paused only) */}
      {(state === 'playing' || state === 'paused') && (
        <div className="fixed bottom-0 left-0 right-0 z-30 safe-area-bottom">
          <div className="mx-auto w-full max-w-2xl px-4 pb-3">
            <div className="rounded-2xl backdrop-blur-xl bg-black/15 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.25)] overflow-hidden">
              <div className="px-4 pt-3">
                <Progress value={progress} className="h-1.5 bg-white/15" />
                <div className="mt-2 flex items-center justify-between text-white/70">
                  <span className="text-xs tabular-nums">{formatTime(elapsedTime)}</span>
                  {script ? (
                    <span className="text-xs tabular-nums">{script.metadata.durationMinutes}:00</span>
                  ) : (
                    <span className="text-xs tabular-nums">--:--</span>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full text-white/80 hover:text-white hover:bg-white/10 touch-manipulation"
                  onClick={restartSession}
                  title={language === 'he' ? 'חזור להתחלה' : 'Restart'}
                >
                  <SkipBack className="w-6 h-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-full text-white hover:bg-white/10 touch-manipulation"
                  onClick={togglePlayPause}
                >
                  {state === 'playing' ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full text-white/80 hover:text-white hover:bg-white/10 touch-manipulation"
                  onClick={skipSegment}
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
              </div>

              {isFromCache && (
                <div className="px-4 pb-3 text-center">
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-white/45">
                    ⚡ {language === 'he' ? 'נטען מהקאש' : 'Loaded from cache'}
                  </motion.p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HypnosisSession;
