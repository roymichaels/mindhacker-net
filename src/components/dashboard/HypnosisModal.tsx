import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X, Wind, Loader2, Sparkles, Lock, Rocket, Calendar, Target } from 'lucide-react';
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
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { useMultiThreadOrbProfile } from '@/hooks/useMultiThreadOrbProfile';
import { BreathingGuide } from '@/components/hypnosis';
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
import { synthesizeSpeech, stopBrowserSpeech, playAudioUrl } from '@/services/voice';
import { saveSession } from '@/services/userMemory';
import { awardXp } from '@/services/unifiedContext';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import type { VoiceProvider } from '@/services/voice';

interface HypnosisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SessionState = 'setup' | 'breathing' | 'generating' | 'playing' | 'paused' | 'complete';

function normalizeHebrewGender(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bאתה\b/g, 'את/ה'],
    [/\bאת\b/g, 'את/ה'],
    [/\bתוכל\b/g, 'תוכל/י'],
    [/\bתוכלי\b/g, 'תוכל/י'],
    [/\bתעשה\b/g, 'תעשה/י'],
    [/\bתעשי\b/g, 'תעשה/י'],
    [/\bתרגיש\b/g, 'תרגיש/י'],
    [/\bתרגישי\b/g, 'תרגיש/י'],
  ];
  return replacements.reduce((acc, [re, rep]) => acc.replace(re, rep), text);
}

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

export function HypnosisModal({ open, onOpenChange }: HypnosisModalProps) {
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const { gameState, recordSession } = useGameState();
  const { isLaunchpadComplete, isLoading: isLoadingLaunchpad } = useLaunchpadProgress();
  const { impact, pattern: hapticPattern } = useHaptics();
  const { profile: orbProfile } = useMultiThreadOrbProfile();
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

  const currentSegment = script?.segments[currentSegmentIndex];

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
      prefetchedAudioRef.current.clear();
    }
  }, [open]);

  // Progress timer
  useEffect(() => {
    if (state !== 'playing') return;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setElapsedTime(elapsed);
      const totalSeconds = duration * 60;
      setProgress(Math.min((elapsed / totalSeconds) * 100, 100));
    }, 100);

    return () => clearInterval(interval);
  }, [state, duration]);

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
    setBreathingCountdown(20);

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

  const skipBreathing = () => {
    setShowBreathing(false);
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
            startTimeRef.current = Date.now();
            playingRef.current = true;
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
      startTimeRef.current = Date.now();
      playingRef.current = true;
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

    const normalized = normalizeHebrewGender(nextSegment.text);
    const result = await synthesizeSpeech(normalized, {
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
      } else {
        handleSessionComplete();
      }
      return;
    }

    setCurrentSegmentIndex(index);
    impact('light');

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
          onEnd: () => {
            if (playingRef.current) {
              playSegment(index + 1, activeScript, activeCachedPaths);
            }
          },
          onError: () => {
            if (playingRef.current) {
              setTimeout(() => playSegment(index + 1, activeScript, activeCachedPaths), 500);
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
            onEnd: () => {
              if (playingRef.current) {
                playSegment(index + 1, activeScript, activeCachedPaths);
              }
            },
            onError: () => {
              if (playingRef.current) {
                setTimeout(() => playSegment(index + 1, activeScript, activeCachedPaths), 500);
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
      const normalized = normalizeHebrewGender(segment.text);
      void prefetchSegmentAudio(index + 1, activeScript, activeCachedPaths);

      const result = await synthesizeSpeech(normalized, {
        provider: voiceProvider,
        voice: 'sarah',
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
          onError: () => {
            if (playingRef.current) {
              setTimeout(() => playSegment(index + 1, activeScript, activeCachedPaths), 500);
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
      stopBrowserSpeech();
    } else if (state === 'paused' && scriptRef.current) {
      setState('playing');
      playingRef.current = true;
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
            <DialogTitle>{language === 'he' ? 'היפנוזה' : 'Hypnosis'}</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">
                {language === 'he' ? 'השלם את ה-Launchpad' : 'Complete Launchpad First'}
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                {language === 'he' 
                  ? 'כדי לקבל חוויית היפנוזה מותאמת אישית, עליך להשלים את ה-Launchpad תחילה'
                  : 'To receive a personalized hypnosis experience, complete the Launchpad first'}
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="gap-2">
              <Rocket className="w-4 h-4" />
              {language === 'he' ? 'חזור' : 'Go Back'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-2xl h-[90vh] p-0 overflow-hidden bg-background"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
        <VisuallyHidden>
          <DialogTitle>{language === 'he' ? 'היפנוזה' : 'Hypnosis Session'}</DialogTitle>
        </VisuallyHidden>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex flex-col h-full">
          {/* Setup State */}
          <AnimatePresence mode="wait">
            {state === 'setup' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-start p-6 space-y-6 overflow-y-auto"
              >
                <div className="text-center space-y-2">
                  <Sparkles className="w-10 h-10 mx-auto text-primary mb-2" />
                  <h1 className="text-2xl font-bold">
                    {language === 'he' ? 'סשן היפנוזה אישי' : 'Personal Hypnosis'}
                  </h1>
                </div>

                {/* Current Week Context Card */}
                {currentMilestone && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                  >
                    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-4">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                      
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-primary">
                              {language === 'he' ? `שבוע ${currentMilestone.week_number}` : `Week ${currentMilestone.week_number}`}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground truncate">
                            {currentMilestone.title}
                          </h3>
                          {currentMilestone.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {currentMilestone.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full mt-3 gap-2"
                        onClick={() => setGoal(currentMilestone.title)}
                      >
                        <Target className="w-4 h-4" />
                        {language === 'he' ? 'השתמש במטרת השבוע' : 'Use weekly goal'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="w-full max-w-md space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground text-center block">
                      {currentMilestone 
                        ? (language === 'he' ? 'או הזן מטרה אחרת:' : 'Or enter a different goal:')
                        : (language === 'he' ? 'הזן את המטרה שלך לסשן:' : 'Enter your goal for this session:')}
                    </label>
                    <Input
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder={language === 'he' ? 'למשל: להרגיש רגיעה עמוקה' : 'e.g., Feel deep relaxation'}
                      className="text-center"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap justify-center">
                    {Object.entries(PRESET_GOALS).map(([key, labels]) => (
                      <Button
                        key={key}
                        variant={goal === labels[language as 'he' | 'en'] ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGoal(labels[language as 'he' | 'en'])}
                      >
                        {labels[language as 'he' | 'en']}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-4">
                    <span className="text-sm text-muted-foreground">
                      {language === 'he' ? 'משך:' : 'Duration:'}
                    </span>
                    {[5, 10, 15].map((d) => (
                      <Button
                        key={d}
                        variant={duration === d ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDuration(d)}
                      >
                        {d} {language === 'he' ? 'דק׳' : 'min'}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button onClick={startBreathing} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  {language === 'he' ? 'התחל סשן' : 'Start Session'}
                </Button>
              </motion.div>
            )}

            {/* Breathing State */}
            {state === 'breathing' && showBreathing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6"
              >
                <BreathingGuide isActive={true} language={language as 'he' | 'en'} />
                <p className="mt-8 text-muted-foreground">
                  {language === 'he' ? `ממשיכים בעוד ${breathingCountdown} שניות...` : `Continuing in ${breathingCountdown}s...`}
                </p>
                <Button variant="ghost" size="sm" onClick={skipBreathing} className="mt-4">
                  <Wind className="w-4 h-4 me-2" />
                  {language === 'he' ? 'דלג' : 'Skip'}
                </Button>
              </motion.div>
            )}

            {/* Generating State */}
            {state === 'generating' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6 space-y-6"
              >
                <MultiThreadOrb 
                  size={200} 
                  state="listening"
                  profile={orbProfile}
                />
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-lg font-medium">
                    {language === 'he' ? 'יוצר את הסשן שלך...' : 'Creating your session...'}
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
                className="flex-1 flex flex-col"
              >
                {/* Orb Area */}
                <div className="flex-1 flex items-center justify-center p-6">
                  <MultiThreadOrb 
                    size={280} 
                    state={state === 'playing' ? 'listening' : 'idle'}
                    profile={orbProfile}
                  />
                </div>

                {/* Current Segment Text */}
                {currentSegment && (
                  <div className="px-6 pb-4 text-center">
                    <p className="text-xs text-primary/60 uppercase tracking-wider mb-2">
                      {SEGMENT_LABELS[currentSegment.mood]?.[language as 'he' | 'en'] || currentSegment.mood}
                    </p>
                    <p className="text-lg leading-relaxed text-foreground/90 max-h-24 overflow-y-auto">
                      {currentSegment.text}
                    </p>
                  </div>
                )}

                {/* Progress */}
                <div className="px-6 pb-2">
                  <Progress value={progress} className="h-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTime(elapsedTime)}</span>
                    <span>{formatTime(duration * 60)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 p-6 border-t border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  <Button
                    size="lg"
                    className="w-16 h-16 rounded-full"
                    onClick={togglePlayPause}
                  >
                    {state === 'playing' ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
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
                    {language === 'he' ? 'סשן הושלם!' : 'Session Complete!'}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === 'he' 
                      ? `הרווחת ${duration * 10} XP`
                      : `You earned ${duration * 10} XP`}
                  </p>
                </div>
                <Button onClick={() => onOpenChange(false)} size="lg">
                  {language === 'he' ? 'סיום' : 'Finish'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
