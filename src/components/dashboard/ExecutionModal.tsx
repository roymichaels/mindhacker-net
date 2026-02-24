/**
 * ExecutionModal — Action Wizard modal with 6 execution templates.
 * Templates: tts_guided, video_embed, sets_reps_timer, step_by_step, timer_focus, social_checklist
 * Template is pre-assigned by strategy generation; falls back to pillar-based inference.
 * 
 * AI Enhancement: When modal opens, a background call to generate-execution-steps
 * fetches detailed, AI-generated steps with an 8-second timeout. If successful,
 * steps are swapped in smoothly. Otherwise, static fallback steps are used.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, SkipForward, Sparkles, Clock, Flame,
  Loader2, Play, Pause, Volume2, VolumeX, Timer, Users, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { NowQueueItem, ExecutionTemplate, useCompleteNowAction } from '@/hooks/useNowEngine';
import { getDomainById } from '@/navigation/lifeDomains';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { BreathingGuide } from '@/components/hypnosis/BreathingGuide';
import { synthesizeSpeech, stopBrowserSpeech, stopCurrentAudio } from '@/services/voice';
import { useHaptics } from '@/hooks/useHaptics';
import { supabase } from '@/integrations/supabase/client';

// ---- Template inference fallback ----
function inferTemplate(action: NowQueueItem): ExecutionTemplate {
  if (action.executionTemplate) return action.executionTemplate;
  
  const combined = `${action.actionType} ${action.title} ${action.pillarId}`.toLowerCase();
  
  if (/meditation|breathwork|body.?scan|visualization|mindful|breathing|relaxation|מדיטציה|נשימ|סריקת.?גוף|ויזואליזציה|הרפיה/.test(combined)) return 'tts_guided';
  if (/yoga|tai.?chi|qigong|qi.?gong|pilates|stretching|mobility|יוגה|טאי.?צ׳י/.test(combined)) return 'video_embed';
  if (/combat|shadow|boxing|strength|power|hiit|calisthenics|push.?up|pull.?up|squat|לחימה|אגרוף|כוח|אימון/.test(combined) && !/influence|השפעה/.test(combined)) return 'sets_reps_timer';
  if (/relation|networking|social|outreach|call|meeting|dating|יחסים|נטוורקינג|שיחה/.test(combined) && action.pillarId !== 'business') return 'social_checklist';
  if (/deep.?work|business|wealth|project|sprint|revenue|content.?creation|study|learn|course|עבודה.?עמוקה|עסק|פרויקט|למידה/.test(combined)) return 'timer_focus';
  if (['wealth', 'business', 'projects', 'expansion', 'influence'].includes(action.pillarId)) return 'timer_focus';
  
  return 'step_by_step';
}

// ---- YouTube URL map ----
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

// ---- Social tips ----
const SOCIAL_TIPS = {
  he: [
    'הקשב יותר ממה שאתה מדבר — שאל שאלות פתוחות',
    'שים לב לשפת הגוף — שלך ושלהם',
    'אנשים זוכרים איך גרמת להם להרגיש, לא מה אמרת',
    'הכן 2-3 נושאים מראש — זה מוריד לחץ',
    'חיוך אמיתי פותח כל דלת',
    'היה סקרן באמת — תן לאנשים לספר את הסיפור שלהם',
  ],
  en: [
    'Listen more than you speak — ask open-ended questions',
    'Pay attention to body language — yours and theirs',
    'People remember how you made them feel, not what you said',
    'Prepare 2-3 topics in advance — it reduces pressure',
    'A genuine smile opens every door',
    'Be genuinely curious — let people tell their story',
  ],
};

// ---- Voice scripts ----
type VoiceScriptType = 'body_scan' | 'breathing' | 'visualization' | 'mindfulness' | 'relaxation';

function detectScriptType(actionType: string, title: string): VoiceScriptType {
  const combined = `${actionType} ${title}`.toLowerCase();
  if (/body.?scan|סריקת[\s_]?גוף|body_scan/.test(combined)) return 'body_scan';
  if (/visuali|דמיון[\s_]?מודרך|ויזואליזציה/.test(combined)) return 'visualization';
  if (/mindful|מיינדפולנס|נוכחות|מודעות[\s_]?קשובה|תודעה/.test(combined)) return 'mindfulness';
  if (/relax|הרפיה|הרגעה[\s_]?עמוקה|רגיעה|מתח/.test(combined)) return 'relaxation';
  return 'breathing';
}

const VOICE_SCRIPTS: Record<VoiceScriptType, { he: string[]; en: string[] }> = {
  body_scan: {
    he: ['שכב על הגב בנוחות. עצום את העיניים.','קח 3 נשימות עמוקות... הרגש את הגוף שוקע לתוך המשטח.','הפנה את תשומת הלב לקודקוד הראש... מה אתה מרגיש שם?','יורד למצח... לרקות... שים לב אם יש מתח.','עיניים... לסת... שחרר כל לחיצה בלסת.','צוואר... כתפיים... הורד את הכתפיים רחוק מהאוזניים.','זרועות... כפות ידיים... אצבעות. הרגש כל אצבע.','חזה... הרגש את הנשימה עולה ויורדת.','בטן... שחרר את שרירי הבטן לגמרי.','גב תחתון... אגן... שחרר.','ירכיים... ברכיים... שוקיים.','כפות רגליים... אצבעות רגליים. הרגש את כל הגוף כמקשה אחת.','עכשיו סרוק את כל הגוף — איפה יש נקודות של מתח? של נעימות?','נשימה עמוקה... ועם הנשיפה, שחרר כל מה שמצאת.','קח רגע. פתח את העיניים כשאתה מוכן. רשום מה גילית.'],
    en: ['Lie down comfortably. Close your eyes.','Take 3 deep breaths... feel your body sinking into the surface.','Bring your attention to the top of your head... what do you feel there?','Move down to your forehead... temples... notice any tension.','Eyes... jaw... release any clenching in your jaw.','Neck... shoulders... drop your shoulders away from your ears.','Arms... palms... fingers. Feel each finger.','Chest... feel the breath rising and falling.','Belly... completely release your abdominal muscles.','Lower back... pelvis... let go.','Thighs... knees... calves.','Feet... toes. Feel your entire body as one.','Now scan your whole body — where is there tension? Pleasure?','Deep breath in... and with the exhale, release everything you found.','Take a moment. Open your eyes when ready. Note what you discovered.'],
  },
  breathing: {
    he: ['שב בנוחות. עצום את העיניים.','נשימה עמוקה פנימה... 1... 2... 3... 4...','עצור... 1... 2... 3... 4...','נשוף החוצה לאט... 1... 2... 3... 4... 5... 6...','שוב. נשימה פנימה... הרגש את הריאות מתמלאות...','עצור... תן לגוף לספוג את החמצן...','נשוף... שחרר מתח... שחרר מחשבות...','ממשיכים. נשימה עמוקה...','עצירה...','נשיפה ארוכה...','אתה עושה עבודה מעולה. עוד כמה סבבים.','נשימה פנימה... הרגש את השקט...','עצור...','נשוף... שחרר הכל...','מצוין. אתה יכול לפתוח את העיניים כשאתה מוכן.'],
    en: ['Sit comfortably. Close your eyes.','Deep breath in... 1... 2... 3... 4...','Hold... 1... 2... 3... 4...','Exhale slowly... 1... 2... 3... 4... 5... 6...','Again. Breathe in... feel your lungs expanding...','Hold... let your body absorb the oxygen...','Exhale... release tension... release thoughts...','Continue. Deep breath in...','Hold...','Long exhale...','You\'re doing great. A few more rounds.','Breathe in... feel the stillness...','Hold...','Exhale... let it all go...','Wonderful. Open your eyes when you\'re ready.'],
  },
  visualization: {
    he: ['שב בנוחות. עצום את העיניים. קח 3 נשימות עמוקות.','דמיין מקום שאתה מרגיש בו בטוח ושלו...','מה אתה רואה סביבך? צבעים, צורות, אור...','מה אתה שומע? קולות, שקט, מוזיקה...','מה אתה מרגיש על העור? רוח, חום, מגע...','עכשיו דמיין את עצמך בגרסה הטובה ביותר שלך...','איך אתה עומד? איך אתה מדבר? מה הביטוי בעיניים?','הרגש את הביטחון, את הכוח, את השקט הפנימי.','זה אתה. זה מי שאתה באמת.','קח את התמונה הזו איתך. נשום עמוק.','לאט לאט, חזור לחדר. פתח את העיניים.'],
    en: ['Sit comfortably. Close your eyes. Take 3 deep breaths.','Imagine a place where you feel safe and peaceful...','What do you see around you? Colors, shapes, light...','What do you hear? Sounds, silence, music...','What do you feel on your skin? Wind, warmth, touch...','Now visualize yourself at your very best...','How do you stand? How do you speak? What\'s the look in your eyes?','Feel the confidence, the strength, the inner calm.','This is you. This is who you really are.','Take this image with you. Breathe deeply.','Slowly, return to the room. Open your eyes.'],
  },
  mindfulness: {
    he: ['שב ישר. כפות הרגליים על הרצפה. ידיים על הברכיים.','עצום עיניים. שים לב לנשימה — בלי לשנות אותה.','רק צפה. אוויר נכנס... אוויר יוצא...','מחשבות יגיעו. זה בסדר. שים לב אליהן ותן להן ללכת.','חזור לנשימה. תמיד חזור לנשימה.','שים לב לקולות סביבך. אל תשפוט. רק שמע.','שים לב לתחושות בגוף. חום, קור, לחץ, קלילות.','כל מה שעולה — קבל אותו. אל תיאבק.','אתה כאן. עכשיו. זה כל מה שיש.','נשימה אחת עמוקה... ופתח את העיניים.'],
    en: ['Sit upright. Feet flat on the floor. Hands on your knees.','Close your eyes. Notice your breathing — without changing it.','Just observe. Air coming in... air going out...','Thoughts will come. That\'s okay. Notice them and let them go.','Return to the breath. Always return to the breath.','Notice the sounds around you. Don\'t judge. Just hear.','Notice sensations in your body. Warmth, cold, pressure, lightness.','Whatever arises — accept it. Don\'t fight.','You are here. Now. That\'s all there is.','One deep breath... and open your eyes.'],
  },
  relaxation: {
    he: ['שכב בנוחות. עצום עיניים. נשימה עמוקה.','כווץ את שרירי הפנים חזק... 5 שניות... ושחרר.','כתפיים — הרם אותן לאוזניים... 5 שניות... ושחרר.','אגרופים — כווץ חזק... 5 שניות... ושחרר. הרגש את ההבדל.','בטן — כווץ... 5 שניות... ושחרר.','רגליים — כווץ את כפות הרגליים... 5 שניות... ושחרר.','עכשיו הרגש את כל הגוף רפוי ומשוחרר.','נשימה עמוקה... כל נשיפה מעמיקה את ההרפיה.','אתה בטוח. אתה רגוע. אתה משוחרר.','כשאתה מוכן, פתח את העיניים לאט.'],
    en: ['Lie down comfortably. Close your eyes. Deep breath.','Tense your facial muscles tightly... 5 seconds... and release.','Shoulders — lift them to your ears... 5 seconds... and release.','Fists — clench hard... 5 seconds... and release. Feel the difference.','Belly — tense... 5 seconds... and release.','Legs — curl your toes... 5 seconds... and release.','Now feel your entire body loose and relaxed.','Deep breath... each exhale deepens the relaxation.','You are safe. You are calm. You are released.','When you\'re ready, slowly open your eyes.'],
  },
};

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

  const [template, setTemplate] = useState<ExecutionTemplate>('step_by_step');
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [completing, setCompleting] = useState(false);
  const [scriptType, setScriptType] = useState<VoiceScriptType>('breathing');

  // AI enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const enhanceCacheRef = useRef<Map<string, { steps: ExecutionStep[]; tts_script?: string[] }>>(new Map());

  // Voice guided state
  const [voiceState, setVoiceState] = useState<'idle' | 'playing' | 'paused' | 'complete'>('idle');
  const [voiceLineIndex, setVoiceLineIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(false);

  // Timer state (for timer_focus and sets_reps_timer)
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerStartRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sets/reps state
  const [currentRound, setCurrentRound] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restCountdown, setRestCountdown] = useState(0);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Breathing timer state (for TTS)
  const [breathElapsed, setBreathElapsed] = useState(0);
  const breathStartRef = useRef<number>(0);
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Custom AI voice script
  const [aiVoiceScript, setAiVoiceScript] = useState<string[] | null>(null);

  const orbSize = isMobile ? 120 : 160;

  // Classify and build content when action changes
  useEffect(() => {
    if (!open || !action) return;

    const tmpl = inferTemplate(action);
    setTemplate(tmpl);
    setScriptType(detectScriptType(action.actionType, action.title));
    setCheckedSteps(new Set());
    setVoiceState('idle');
    setVoiceLineIndex(0);
    setTimerElapsed(0);
    setTimerRunning(false);
    setCurrentRound(0);
    setIsResting(false);
    setIsEnhanced(false);
    setAiVoiceScript(null);
    playingRef.current = false;

    if (tmpl !== 'tts_guided') {
      setSteps(action.executionSteps || []);
    } else {
      setSteps([]);
    }
  }, [open, action, isRTL]);

  // AI Enhancement: fetch detailed steps in background with 8s timeout
  useEffect(() => {
    if (!open || !action) return;

    const cacheKey = `${action.actionType}_${action.title}_${language}`;
    const cached = enhanceCacheRef.current.get(cacheKey);
    if (cached) {
      setSteps(cached.steps);
      if (cached.tts_script) setAiVoiceScript(cached.tts_script);
      setIsEnhanced(true);
      return;
    }

    const tmpl = inferTemplate(action);
    let cancelled = false;

    setIsEnhancing(true);

    const timeoutId = setTimeout(() => {
      cancelled = true;
      setIsEnhancing(false);
      console.log('AI enhancement timed out — keeping static fallback');
    }, 20_000);

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-execution-steps', {
          body: {
            title: action.title,
            pillar: action.pillarId,
            execution_template: tmpl,
            action_type: action.actionType,
            duration_min: action.durationMin,
            language,
            userId: user?.id || null,
          },
        });

        if (cancelled) return;

        if (!error && data?.steps && Array.isArray(data.steps) && data.steps.length > 0) {
          const aiSteps = data.steps.map((s: any) => ({
            label: s.label || '',
            detail: s.detail,
            durationSec: s.durationSec || 60,
          }));

          enhanceCacheRef.current.set(cacheKey, { steps: aiSteps, tts_script: data.tts_script });
          
          if (tmpl !== 'tts_guided') {
            setSteps(aiSteps);
          }
          if (data.tts_script && Array.isArray(data.tts_script)) {
            setAiVoiceScript(data.tts_script);
          }
          setIsEnhanced(true);
        }
      } catch (e) {
        console.log('AI enhancement skipped:', e instanceof Error ? e.message : 'unknown');
      } finally {
        if (!cancelled) {
          setIsEnhancing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      setIsEnhancing(false);
    };
  }, [open, action, language]);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      playingRef.current = false;
      stopCurrentAudio();
      stopBrowserSpeech();
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      setBreathElapsed(0);
      setTimerElapsed(0);
      setTimerRunning(false);
    }
  }, [open]);

  // Voice guided playback — use AI script if available, else static
  const voiceScriptData = VOICE_SCRIPTS[scriptType];
  const voiceScript = aiVoiceScript || (isRTL ? voiceScriptData.he : voiceScriptData.en);

  const startVoice = useCallback(() => {
    setVoiceState('playing');
    playingRef.current = true;
    setVoiceLineIndex(0);
    setBreathElapsed(0);
    breathStartRef.current = Date.now();
    breathIntervalRef.current = setInterval(() => {
      setBreathElapsed(Math.floor((Date.now() - breathStartRef.current) / 1000));
    }, 1000);
    speakLine(0);
  }, []);

  const speakLine = useCallback(async (index: number) => {
    if (!playingRef.current || index >= voiceScript.length) {
      setVoiceState('complete');
      playingRef.current = false;
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      return;
    }
    setVoiceLineIndex(index);
    try {
      if (!isMuted) await synthesizeSpeech(voiceScript[index]);
    } catch { /* fallback handled */ }
    voiceTimerRef.current = setTimeout(() => {
      if (playingRef.current) speakLine(index + 1);
    }, 4000);
  }, [voiceScript, isMuted]);

  const toggleVoice = () => {
    if (voiceState === 'idle') {
      startVoice();
    } else if (voiceState === 'playing') {
      playingRef.current = false;
      stopCurrentAudio();
      stopBrowserSpeech();
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      setVoiceState('paused');
    } else if (voiceState === 'paused') {
      playingRef.current = true;
      setVoiceState('playing');
      breathStartRef.current = Date.now() - breathElapsed * 1000;
      breathIntervalRef.current = setInterval(() => {
        setBreathElapsed(Math.floor((Date.now() - breathStartRef.current) / 1000));
      }, 1000);
      speakLine(voiceLineIndex);
    }
  };

  // Timer controls (for timer_focus)
  const toggleTimer = () => {
    if (timerRunning) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTimerRunning(false);
    } else {
      const startOffset = timerElapsed;
      timerStartRef.current = Date.now() - startOffset * 1000;
      timerIntervalRef.current = setInterval(() => {
        setTimerElapsed(Math.floor((Date.now() - timerStartRef.current) / 1000));
      }, 1000);
      setTimerRunning(true);
    }
  };

  // Sets/reps controls
  const startRest = (durationSec: number = 60) => {
    setIsResting(true);
    setRestCountdown(durationSec);
    restIntervalRef.current = setInterval(() => {
      setRestCountdown(prev => {
        if (prev <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          setIsResting(false);
          impact('heavy');
          try { navigator.vibrate?.([200, 100, 200]); } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeRound = () => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    toggleStep(currentRound);
    if (nextRound < steps.length) {
      startRest(60);
    }
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const timerTarget = (action?.durationMin || 25) * 60;
  const timerDone = timerElapsed >= timerTarget;

  const allDone = (() => {
    switch (template) {
      case 'tts_guided': return voiceState === 'complete';
      case 'timer_focus': return timerDone;
      case 'sets_reps_timer': return steps.length > 0 && checkedSteps.size === steps.length;
      default: return steps.length > 0 && checkedSteps.size === steps.length;
    }
  })();

  const progress = (() => {
    switch (template) {
      case 'tts_guided': return Math.round((voiceLineIndex / Math.max(1, voiceScript.length)) * 100);
      case 'timer_focus': return Math.min(100, Math.round((timerElapsed / timerTarget) * 100));
      default: return steps.length > 0 ? Math.round((checkedSteps.size / steps.length) * 100) : 0;
    }
  })();

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

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(true); }}>
      <DialogContent
        className="max-w-2xl h-[85svh] max-h-[92svh] p-0 flex flex-col bg-background overflow-hidden"
        onPointerDownOutside={(e) => {
          if (voiceState === 'playing' || timerRunning) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (voiceState === 'playing' || timerRunning) e.preventDefault();
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
          {/* AI Enhancement indicator */}
          {isEnhancing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-1.5 mt-2 text-xs text-primary/70">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>{isRTL ? 'מייצר תוכן מותאם אישית...' : 'Generating personalized content...'}</span>
            </motion.div>
          )}
          {isEnhanced && !isEnhancing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-1.5 mt-2 text-xs text-primary/50">
              <Sparkles className="h-3 w-3" />
              <span>{isRTL ? 'תוכן מותאם אישית ✓' : 'Personalized content ✓'}</span>
            </motion.div>
          )}
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

            {/* ======== TTS GUIDED ======== */}
            {template === 'tts_guided' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[380px] py-4">
                {voiceState === 'idle' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center space-y-6 text-center">
                    <div className="relative flex items-center justify-center" style={{ width: orbSize + 60, height: orbSize + 60 }}>
                      <PersonalizedOrb size={orbSize} state="idle" showGlow={false} />
                    </div>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      {isRTL ? 'שב בנוחות, עצום עיניים, ולחץ כדי להתחיל' : 'Sit comfortably, close your eyes, and press to begin'}
                    </p>
                    <Button size="lg" onClick={toggleVoice} className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                      <Play className="h-7 w-7 ms-0.5" />
                    </Button>
                  </motion.div>
                )}

                {(voiceState === 'playing' || voiceState === 'paused') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-5 w-full">
                    <BreathingGuide isActive={voiceState === 'playing'} pattern={[4, 4, 4, 4]} language={language as 'he' | 'en'} className="my-2" />
                    <div className="text-center">
                      <span className="text-3xl font-mono font-light tabular-nums tracking-wider">
                        {formatTime(breathElapsed)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">/ {action?.durationMin ?? 5} {isRTL ? 'דק׳' : 'min'}</p>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p key={voiceLineIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center text-sm text-muted-foreground max-w-xs leading-relaxed px-4 min-h-[3rem]">
                        {voiceScript[voiceLineIndex]}
                      </motion.p>
                    </AnimatePresence>
                    <div className="flex items-center gap-5 pt-2">
                      <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="rounded-full h-10 w-10">
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      <Button size="lg" onClick={toggleVoice} className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                        {voiceState === 'playing' ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ms-0.5" />}
                      </Button>
                      <div className="w-10" />
                    </div>
                  </motion.div>
                )}

                {voiceState === 'complete' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center space-y-5 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-4xl">✨</span>
                    </motion.div>
                    <h3 className="text-xl font-bold">{isRTL ? 'סשן הושלם' : 'Session Complete'}</h3>
                    <p className="text-muted-foreground text-sm">{isRTL ? `${Math.floor(breathElapsed / 60)} דקות. כל הכבוד.` : `${Math.floor(breathElapsed / 60)} minutes. Well done.`}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ======== VIDEO EMBED ======== */}
            {template === 'video_embed' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {youtubeUrl && (
                  <div className="rounded-xl overflow-hidden border border-border/50 aspect-video w-full">
                    <iframe src={`${youtubeUrl}?rel=0&autoplay=0`} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  </div>
                )}
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <StepItem key={idx} step={step} idx={idx} checked={checkedSteps.has(idx)} onToggle={toggleStep} isRTL={isRTL} t={t} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ======== SETS / REPS / TIMER ======== */}
            {template === 'sets_reps_timer' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {/* Round indicator */}
                <div className="text-center py-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {isRTL ? 'סיבוב' : 'Round'}
                  </p>
                  <p className="text-4xl font-bold tabular-nums">
                    {Math.min(currentRound + 1, steps.length)} <span className="text-muted-foreground text-xl">/ {steps.length}</span>
                  </p>
                </div>

                {/* Rest countdown overlay */}
                {isResting && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-primary/10 border border-primary/30 p-6 text-center space-y-2">
                    <p className="text-sm text-primary font-medium">{isRTL ? '⏸️ מנוחה' : '⏸️ Rest'}</p>
                    <p className="text-5xl font-mono font-bold tabular-nums">{restCountdown}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'שניות' : 'seconds'}</p>
                  </motion.div>
                )}

                {/* Motivational banner */}
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm leading-relaxed">
                      {isRTL ? '🎵 שים שיר — כל שיר זה ראונד. אין עצירות. הגוף שלך הוא כלי הנשק.' : '🎵 Put on a song — each song is a round. No stops. Your body is the weapon.'}
                    </p>
                  </div>
                </div>

                {/* Steps as rounds */}
                {steps.map((step, idx) => (
                  <StepItem key={idx} step={step} idx={idx} checked={checkedSteps.has(idx)} onToggle={toggleStep} isRTL={isRTL} t={t} highlight={idx === currentRound && !isResting} />
                ))}

                {/* Complete round button */}
                {!isResting && currentRound < steps.length && (
                  <Button onClick={completeRound} className="w-full rounded-xl h-12 gap-2" variant="outline">
                    <Flame className="h-4 w-4" />
                    {isRTL ? `סיים סיבוב ${currentRound + 1}` : `Complete Round ${currentRound + 1}`}
                  </Button>
                )}
              </motion.div>
            )}

            {/* ======== STEP BY STEP ======== */}
            {template === 'step_by_step' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
                {steps.map((step, idx) => (
                  <StepItem key={idx} step={step} idx={idx} checked={checkedSteps.has(idx)} onToggle={toggleStep} isRTL={isRTL} t={t} />
                ))}
              </motion.div>
            )}

            {/* ======== TIMER FOCUS (Pomodoro) ======== */}
            {template === 'timer_focus' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[380px] py-4 space-y-6">
                {/* Minimal dark focus screen */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{isRTL ? action.title : action.titleEn}</p>
                </div>

                {/* Big timer */}
                <div className="text-center">
                  <span className={cn("text-6xl font-mono font-light tabular-nums tracking-wider", timerDone && "text-primary")}>
                    {formatTime(timerElapsed)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-2">/ {formatTime(timerTarget)}</p>
                </div>

                {/* Timer done message */}
                {timerDone && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-2">
                    <span className="text-4xl">🎯</span>
                    <p className="text-primary font-semibold">{isRTL ? 'זמן הושלם!' : 'Time Complete!'}</p>
                  </motion.div>
                )}

                {/* Start/Pause button */}
                {!timerDone && (
                  <Button size="lg" onClick={toggleTimer} className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                    {timerRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ms-0.5" />}
                  </Button>
                )}

                {/* Minimal focus tip */}
                <p className="text-xs text-muted-foreground/50 max-w-[200px] text-center">
                  {isRTL ? 'טלפון במצב טיסה. חלון אחד. מיקוד מלא.' : 'Phone on airplane mode. One window. Full focus.'}
                </p>
              </motion.div>
            )}

            {/* ======== SOCIAL CHECKLIST ======== */}
            {template === 'social_checklist' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {/* Random social tip */}
                <div className="rounded-xl bg-accent/10 border border-accent/20 p-3">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                    <p className="text-sm leading-relaxed italic">
                      {isRTL
                        ? SOCIAL_TIPS.he[Math.floor(Math.random() * SOCIAL_TIPS.he.length)]
                        : SOCIAL_TIPS.en[Math.floor(Math.random() * SOCIAL_TIPS.en.length)]}
                    </p>
                  </div>
                </div>

                {/* Steps */}
                {steps.map((step, idx) => (
                  <StepItem key={idx} step={step} idx={idx} checked={checkedSteps.has(idx)} onToggle={toggleStep} isRTL={isRTL} t={t} />
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
function StepItem({ step, idx, checked, onToggle, isRTL, t, highlight }: {
  step: ExecutionStep;
  idx: number;
  checked: boolean;
  onToggle: (idx: number) => void;
  isRTL: boolean;
  t: any;
  highlight?: boolean;
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
          checked ? 'bg-primary/10 border-primary/30' : 'bg-card/50 border-border/40 hover:border-primary/20',
          highlight && !checked && 'ring-2 ring-primary/50 border-primary/40'
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
