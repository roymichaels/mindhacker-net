/**
 * ExecutionModal — Action Wizard modal (HypnosisModal-style).
 * 3 modes: voice-guided (breathing/meditation), YouTube (tai chi/yoga), workout outline (combat).
 * Uses the bottom dock Aurora chat — no embedded chat.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, SkipForward, Sparkles, Clock, Flame,
  Loader2, Play, Pause, Volume2, VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { NowQueueItem, useCompleteNowAction } from '@/hooks/useNowEngine';
import { getDomainById } from '@/navigation/lifeDomains';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { synthesizeSpeech, stopBrowserSpeech, stopCurrentAudio } from '@/services/voice';
import { useHaptics } from '@/hooks/useHaptics';

// ---- Activity classification ----

const YOUTUBE_ACTIVITIES = [
  'tai_chi', 'tai chi', 'yoga', 'stretching', 'qigong', 'qi gong',
  'pilates', 'mobility', 'foam rolling',
];

const VOICE_GUIDED_ACTIVITIES = [
  'meditation', 'breathwork', 'breathing', 'cold exposure', 'visualization',
  'body scan', 'progressive relaxation', 'mindfulness',
];

const COMBAT_ACTIVITIES = [
  'combat', 'shadowboxing', 'boxing', 'muay thai', 'kickboxing', 'martial arts',
  'punching', 'striking', 'fighting', 'heavy bag',
];

const YOUTUBE_MAP: Record<string, string> = {
  'tai_chi': 'https://www.youtube.com/embed/nSGMsyERyBs',
  'tai chi': 'https://www.youtube.com/embed/nSGMsyERyBs',
  'yoga': 'https://www.youtube.com/embed/v7AYKMP6rOE',
  'stretching': 'https://www.youtube.com/embed/g_tea8ZNk5A',
  'qigong': 'https://www.youtube.com/embed/cwlvTcWR3Gs',
  'qi gong': 'https://www.youtube.com/embed/cwlvTcWR3Gs',
  'mobility': 'https://www.youtube.com/embed/TSIbzfcnv_8',
  'pilates': 'https://www.youtube.com/embed/K56Z12XNQ5c',
};

type ActionMode = 'voice' | 'youtube' | 'workout';

function classifyAction(actionType: string, title: string): ActionMode {
  const combined = `${actionType} ${title}`.toLowerCase();
  if (VOICE_GUIDED_ACTIVITIES.some(a => combined.includes(a))) return 'voice';
  if (YOUTUBE_ACTIVITIES.some(a => combined.includes(a))) return 'youtube';
  if (COMBAT_ACTIVITIES.some(a => combined.includes(a))) return 'workout';
  // Default: workout outline for anything else
  return 'workout';
}

function getYouTubeUrl(actionType: string, title: string): string | null {
  const combined = `${actionType} ${title}`.toLowerCase();
  for (const [key, url] of Object.entries(YOUTUBE_MAP)) {
    if (combined.includes(key)) return url;
  }
  return null;
}

// ---- Step definitions ----

interface ExecutionStep {
  label: string;
  detail?: string;
  durationSec?: number;
}

function buildWorkoutSteps(action: NowQueueItem, isRTL: boolean): ExecutionStep[] {
  const combined = `${action.actionType} ${action.title}`.toLowerCase();
  const isCombat = COMBAT_ACTIVITIES.some(a => combined.includes(a));

  if (isCombat) {
    return [
      { label: '🥊 Round 1 — Jab + Cross', detail: isRTL ? '100 חזרות: 50 ג׳אב שמאל, 50 קרוס ימין. קצב מהיר!' : '100 reps: 50 left jab, 50 right cross. Fast tempo!', durationSec: 180 },
      { label: '🥊 Round 2 — Hooks', detail: isRTL ? '100 חזרות: 50 הוק שמאל, 50 הוק ימין. סובב את הירכיים!' : '100 reps: 50 left hook, 50 right hook. Rotate hips!', durationSec: 180 },
      { label: '🥊 Round 3 — Uppercuts', detail: isRTL ? '100 חזרות: 50 אפרקאט שמאל, 50 ימין. דחיפה מהרגליים!' : '100 reps: 50 left uppercut, 50 right uppercut. Drive from legs!', durationSec: 180 },
      { label: '🦵 Round 4 — Kicks', detail: isRTL ? '60 חזרות: 20 ראונדהאוס לכל צד, 10 טיפ לכל צד' : '60 reps: 20 roundhouse each side, 10 teep each side', durationSec: 180 },
      { label: '💥 Round 5 — Combos', detail: isRTL ? 'ג׳אב-קרוס-הוק-אפרקאט-ראונדהאוס. 3 דקות ללא עצירה!' : 'Jab-Cross-Hook-Uppercut-Roundhouse. 3 minutes non-stop!', durationSec: 180 },
      { label: '🧘 Cooldown', detail: isRTL ? 'מתיחות כתפיים, ירכיים, שורשי כף יד. נשימות עמוקות.' : 'Stretch shoulders, hips, wrists. Deep breathing.', durationSec: 120 },
    ];
  }

  // Generic workout outline
  const dur = action.durationMin;
  const warmup = Math.max(1, Math.floor(dur * 0.1));
  const core = Math.max(1, dur - warmup - 2);
  return [
    { label: isRTL ? '🎯 חימום והכנה' : '🎯 Warm-up & Prepare', detail: isRTL ? 'נשימה עמוקה, הגדר כוונה' : 'Deep breath, set intention', durationSec: warmup * 60 },
    { label: isRTL ? `⚡ ביצוע — ${core} דק'` : `⚡ Core — ${core} min`, detail: action.title, durationSec: core * 60 },
    { label: isRTL ? '🔄 סגירה — מה למדתי?' : '🔄 Close — What did I learn?', durationSec: 120 },
  ];
}

// ---- Voice guided breathing script ----

const BREATHING_SCRIPT_HE = [
  'שב בנוחות. עצום את העיניים.',
  'נשימה עמוקה פנימה... 1... 2... 3... 4...',
  'עצור... 1... 2... 3... 4...',
  'נשוף החוצה לאט... 1... 2... 3... 4... 5... 6...',
  'שוב. נשימה פנימה... הרגש את הריאות מתמלאות...',
  'עצור... תן לגוף לספוג את החמצן...',
  'נשוף... שחרר מתח... שחרר מחשבות...',
  'ממשיכים. נשימה עמוקה...',
  'עצירה...',
  'נשיפה ארוכה...',
  'אתה עושה עבודה מעולה. עוד כמה סבבים.',
  'נשימה פנימה... הרגש את השקט...',
  'עצור...',
  'נשוף... שחרר הכל...',
  'מצוין. אתה יכול לפתוח את העיניים כשאתה מוכן.',
];

const BREATHING_SCRIPT_EN = [
  'Sit comfortably. Close your eyes.',
  'Deep breath in... 1... 2... 3... 4...',
  'Hold... 1... 2... 3... 4...',
  'Exhale slowly... 1... 2... 3... 4... 5... 6...',
  'Again. Breathe in... feel your lungs expanding...',
  'Hold... let your body absorb the oxygen...',
  'Exhale... release tension... release thoughts...',
  'Continue. Deep breath in...',
  'Hold...',
  'Long exhale...',
  'You\'re doing great. A few more rounds.',
  'Breathe in... feel the stillness...',
  'Hold...',
  'Exhale... let it all go...',
  'Wonderful. Open your eyes when you\'re ready.',
];

// ---- Main Modal ----
interface ExecutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: NowQueueItem | null;
  onComplete?: () => void;
}

export function ExecutionModal({ open, onOpenChange, action, onComplete }: ExecutionModalProps) {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const completeMutation = useCompleteNowAction();
  const isMobile = useIsMobile();
  const { impact, pattern: hapticPattern } = useHaptics();

  const [mode, setMode] = useState<ActionMode>('workout');
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [completing, setCompleting] = useState(false);

  // Voice guided state
  const [voiceState, setVoiceState] = useState<'idle' | 'playing' | 'paused' | 'complete'>('idle');
  const [voiceLineIndex, setVoiceLineIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(false);

  const orbSize = isMobile ? 120 : 160;

  // Classify and build content when action changes
  useEffect(() => {
    if (!open || !action) return;

    const actionMode = classifyAction(action.actionType, action.title);
    setMode(actionMode);
    setCheckedSteps(new Set());
    setVoiceState('idle');
    setVoiceLineIndex(0);
    playingRef.current = false;

    if (actionMode === 'workout' || actionMode === 'youtube') {
      setSteps(buildWorkoutSteps(action, isRTL));
    } else {
      setSteps([]); // Voice mode doesn't use step checklist
    }
  }, [open, action, isRTL]);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      playingRef.current = false;
      stopCurrentAudio();
      stopBrowserSpeech();
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
    }
  }, [open]);

  // Voice guided playback
  const voiceScript = isRTL ? BREATHING_SCRIPT_HE : BREATHING_SCRIPT_EN;

  const startVoice = useCallback(() => {
    setVoiceState('playing');
    playingRef.current = true;
    setVoiceLineIndex(0);
    speakLine(0);
  }, []);

  const speakLine = useCallback(async (index: number) => {
    if (!playingRef.current || index >= voiceScript.length) {
      setVoiceState('complete');
      playingRef.current = false;
      return;
    }
    setVoiceLineIndex(index);
    const text = voiceScript[index];

    try {
      await synthesizeSpeech(text);
    } catch {
      // Browser TTS fallback handled internally
    }

    // Wait between lines
    voiceTimerRef.current = setTimeout(() => {
      if (playingRef.current) {
        speakLine(index + 1);
      }
    }, 4000);
  }, [voiceScript, language]);

  const toggleVoice = () => {
    if (voiceState === 'idle') {
      startVoice();
    } else if (voiceState === 'playing') {
      playingRef.current = false;
      stopCurrentAudio();
      stopBrowserSpeech();
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
      setVoiceState('paused');
    } else if (voiceState === 'paused') {
      playingRef.current = true;
      setVoiceState('playing');
      speakLine(voiceLineIndex);
    }
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const allDone = mode === 'voice'
    ? voiceState === 'complete'
    : steps.length > 0 && checkedSteps.size === steps.length;

  const progress = mode === 'voice'
    ? Math.round((voiceLineIndex / Math.max(1, voiceScript.length)) * 100)
    : steps.length > 0 ? Math.round((checkedSteps.size / steps.length) * 100) : 0;

  const domain = action ? getDomainById(action.pillarId) : null;
  const DomainIcon = domain?.icon;
  const youtubeUrl = action ? getYouTubeUrl(action.actionType, action.title) : null;

  const handleComplete = async () => {
    if (!action) return;
    setCompleting(true);
    impact('medium');

    if (action.sourceId && (action.sourceType === 'habit' || action.sourceType === 'plan')) {
      completeMutation.mutate(
        { actionId: action.sourceId, done: true },
        {
          onSuccess: () => {
            toast.success(t('today.completedXP'));
            setCompleting(false);
            onComplete?.();
            onOpenChange(false);
          },
          onError: () => {
            toast.error(t('today.errorSaving'));
            setCompleting(false);
          },
        }
      );
    } else {
      toast.success(t('today.completedXP'));
      setCompleting(false);
      onComplete?.();
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    stopCurrentAudio();
    stopBrowserSpeech();
    playingRef.current = false;
    toast(t('today.skippedReturn'));
    onOpenChange(false);
  };

  const handleClose = () => {
    stopCurrentAudio();
    stopBrowserSpeech();
    playingRef.current = false;
    onOpenChange(false);
  };

  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(true); }}>
      <DialogContent
        className="max-w-2xl h-[85svh] max-h-[92svh] p-0 flex flex-col bg-background overflow-hidden"
        onPointerDownOutside={(e) => {
          if (voiceState === 'playing') e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (voiceState === 'playing') e.preventDefault();
        }}
      >
        <VisuallyHidden>
          <DialogTitle>{action.title}</DialogTitle>
        </VisuallyHidden>

        {/* Exit Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-3 end-3 z-50 h-9 w-9 rounded-full bg-background/80 hover:bg-destructive/20 border border-border/50"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-center gap-2 text-xs text-primary font-semibold uppercase tracking-wider mb-1">
            {DomainIcon && <DomainIcon className="h-4 w-4" />}
            <span>{domain ? (isRTL ? domain.labelHe : domain.labelEn) : action.pillarId}</span>
          </div>
          <h2 className="text-xl font-bold">{isRTL ? action.title : action.titleEn}</h2>
          <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{action.durationMin} {isRTL ? 'דק׳' : 'min'}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 flex-shrink-0">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>{isRTL ? 'התקדמות' : 'Progress'}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide" dir={isRTL ? 'rtl' : 'ltr'}>
          <AnimatePresence mode="wait">

            {/* ---- VOICE GUIDED MODE ---- */}
            {mode === 'voice' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center space-y-6 min-h-[300px]"
              >
                {/* Orb */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ width: orbSize + 60, height: orbSize + 60 }}
                >
                  <PersonalizedOrb
                    size={orbSize}
                    state={voiceState === 'playing' ? 'speaking' : 'idle'}
                    showGlow={voiceState === 'playing'}
                  />
                </div>

                {/* Current line */}
                <motion.p
                  key={voiceLineIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-lg font-medium max-w-md leading-relaxed px-4"
                >
                  {voiceState === 'idle'
                    ? (isRTL ? 'לחץ Play כדי להתחיל סשן מודרך' : 'Press Play to start a guided session')
                    : voiceState === 'complete'
                      ? (isRTL ? '✨ סשן הסתיים. כל הכבוד.' : '✨ Session complete. Well done.')
                      : voiceScript[voiceLineIndex]
                  }
                </motion.p>

                {/* Voice controls */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded-full"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  <Button
                    size="lg"
                    onClick={toggleVoice}
                    disabled={voiceState === 'complete'}
                    className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent"
                  >
                    {voiceState === 'playing'
                      ? <Pause className="h-6 w-6" />
                      : <Play className="h-6 w-6 ms-0.5" />
                    }
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ---- YOUTUBE MODE ---- */}
            {mode === 'youtube' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Video embed */}
                {youtubeUrl && (
                  <div className="rounded-xl overflow-hidden border border-border/50 aspect-video w-full">
                    <iframe
                      src={`${youtubeUrl}?rel=0&autoplay=0`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}

                {/* Steps checklist */}
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <StepItem
                      key={idx}
                      step={step}
                      idx={idx}
                      checked={checkedSteps.has(idx)}
                      onToggle={toggleStep}
                      isRTL={isRTL}
                      t={t}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---- WORKOUT MODE ---- */}
            {mode === 'workout' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2.5"
              >
                {/* Motivational banner */}
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm leading-relaxed">
                      {isRTL
                        ? '🎵 שים שיר — כל שיר זה ראונד. אין עצירות. הגוף שלך הוא כלי הנשק.'
                        : '🎵 Put on a song — each song is a round. No stops. Your body is the weapon.'}
                    </p>
                  </div>
                </div>

                {steps.map((step, idx) => (
                  <StepItem
                    key={idx}
                    step={step}
                    idx={idx}
                    checked={checkedSteps.has(idx)}
                    onToggle={toggleStep}
                    isRTL={isRTL}
                    t={t}
                  />
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/50 flex items-center gap-3 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="shrink-0 text-muted-foreground">
            <SkipForward className="h-4 w-4 me-1" />
            {isRTL ? 'דלג' : 'Skip'}
          </Button>
          <Button
            size="lg"
            className="flex-1 gap-2 rounded-xl"
            disabled={!allDone || completing}
            onClick={handleComplete}
          >
            {completing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Flame className="h-4 w-4" />
                {isRTL ? 'השלם' : 'Complete'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Step Item Component ----
function StepItem({ step, idx, checked, onToggle, isRTL, t }: {
  step: ExecutionStep;
  idx: number;
  checked: boolean;
  onToggle: (idx: number) => void;
  isRTL: boolean;
  t: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      <button
        onClick={() => onToggle(idx)}
        className={cn(
          'w-full flex items-start gap-3 p-3.5 rounded-xl border text-start transition-all',
          checked ? 'bg-primary/10 border-primary/30' : 'bg-card/50 border-border/40 hover:border-primary/20'
        )}
      >
        <div className={cn(
          'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors',
          checked ? 'border-primary bg-primary' : 'border-muted-foreground/30'
        )}>
          {checked && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', checked && 'line-through opacity-60')}>
            {step.label}
          </p>
          {step.detail && <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>}
          {step.durationSec && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 mt-1">
              <Clock className="h-2.5 w-2.5" />
              {Math.ceil(step.durationSec / 60)} {isRTL ? 'דק׳' : 'min'}
            </span>
          )}
        </div>
      </button>
    </motion.div>
  );
}

export default ExecutionModal;
