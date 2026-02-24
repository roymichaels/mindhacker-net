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

// Use pre-computed execution steps from the queue, or fall back to local generation
function buildWorkoutSteps(action: NowQueueItem, isRTL: boolean): ExecutionStep[] {
  // Priority 1: Use pre-computed steps from the server
  if (action.executionSteps && action.executionSteps.length > 0) {
    return action.executionSteps;
  }

  // Priority 2: Local keyword matching (fallback)
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

  // Smart step generation based on action keywords
  const dur = action.durationMin;
  const specificSteps = getSpecificSteps(combined, dur, isRTL);
  if (specificSteps) return specificSteps;

  // Final fallback: structured generic with the title as guidance
  const warmup = Math.max(1, Math.floor(dur * 0.1));
  const core = Math.max(1, dur - warmup - 2);
  return [
    { label: isRTL ? '🎯 הכנה — סביבה וכוונה' : '🎯 Prepare — Environment & Intention', detail: isRTL ? 'הכן את כל מה שצריך. הגדר כוונה ברורה למה שאתה עומד לעשות.' : 'Prepare everything you need. Set a clear intention for what you\'re about to do.', durationSec: warmup * 60 },
    { label: isRTL ? `⚡ ביצוע — ${action.title}` : `⚡ Execute — ${action.titleEn || action.title}`, detail: isRTL ? `${core} דקות של מיקוד מלא. בצע צעד אחרי צעד.` : `${core} minutes of full focus. Execute step by step.`, durationSec: core * 60 },
    { label: isRTL ? '🔄 סגירה — סיכום ותובנות' : '🔄 Close — Summary & Insights', detail: isRTL ? 'מה עשיתי? מה למדתי? מה הצעד הבא?' : 'What did I do? What did I learn? What\'s next?', durationSec: 120 },
  ];
}

/** Keyword-based specific step outlines for common activities */
function getSpecificSteps(combined: string, dur: number, isRTL: boolean): ExecutionStep[] | null {
  // Skincare / grooming
  if (/skin|טיפוח|פנים|skincare|grooming|face/.test(combined)) {
    return [
      { label: isRTL ? '🧴 ניקוי פנים' : '🧴 Cleanse', detail: isRTL ? 'שטוף פנים במים פושרים. הנח ג\'ל ניקוי ועסה בעדינות 60 שניות.' : 'Rinse face with lukewarm water. Apply cleanser and massage gently for 60 seconds.', durationSec: 120 },
      { label: isRTL ? '💧 טונר / מי פנים' : '💧 Toner', detail: isRTL ? 'הנח טונר על כף היד או פד כותנה. טפטף על הפנים והצוואר.' : 'Apply toner to palm or cotton pad. Pat onto face and neck.', durationSec: 60 },
      { label: isRTL ? '✨ סרום / טיפול' : '✨ Serum / Treatment', detail: isRTL ? 'הנח סרום (ויטמין C בבוקר / רטינול בערב). עסה פנימה בתנועות עדינות.' : 'Apply serum (Vitamin C morning / Retinol evening). Massage in with gentle upward strokes.', durationSec: 90 },
      { label: isRTL ? '🧊 קרם לחות' : '🧊 Moisturize', detail: isRTL ? 'הנח קרם לחות בנקודות על הפנים. עסה בתנועות מעגליות.' : 'Dot moisturizer on face. Massage in circular motions.', durationSec: 90 },
      { label: isRTL ? '☀️ הגנה מהשמש (בוקר)' : '☀️ Sunscreen (AM)', detail: isRTL ? 'הנח SPF בשכבה נדיבה. חכה 2 דקות לפני איפור.' : 'Apply SPF generously. Wait 2 minutes before makeup.', durationSec: 120 },
      { label: isRTL ? '👁️ אזור עיניים' : '👁️ Eye Area', detail: isRTL ? 'הנח קרם עיניים בעדינות עם האצבע הקטנה. טפטוף, לא שפשוף.' : 'Gently apply eye cream with ring finger. Pat, don\'t rub.', durationSec: 60 },
    ];
  }

  // Reading / learning / study
  if (/read|קריאה|לימוד|study|learn|book|ספר/.test(combined)) {
    return [
      { label: isRTL ? '📖 הכנה — בחר חומר' : '📖 Prepare — Choose Material', detail: isRTL ? 'בחר ספר/מאמר. סגור הסחות. הכן פנקס.' : 'Choose book/article. Close distractions. Prepare notebook.', durationSec: 120 },
      { label: isRTL ? '📚 קריאה ממוקדת' : '📚 Focused Reading', detail: isRTL ? `${Math.max(5, dur - 5)} דקות של קריאה בלי הפסקות. סמן מילות מפתח.` : `${Math.max(5, dur - 5)} minutes of uninterrupted reading. Highlight key ideas.`, durationSec: Math.max(5, dur - 5) * 60 },
      { label: isRTL ? '✍️ סיכום — 3 נקודות מפתח' : '✍️ Summary — 3 Key Takeaways', detail: isRTL ? 'כתוב 3 תובנות מרכזיות. איך ליישם אותן?' : 'Write 3 main insights. How to apply them?', durationSec: 180 },
    ];
  }

  // Journaling / reflection / writing
  if (/journal|יומן|כתיבה|reflec|writing|הרהור|חשיבה/.test(combined)) {
    return [
      { label: isRTL ? '🧘 התכוננות — שקט פנימי' : '🧘 Center — Inner Stillness', detail: isRTL ? '3 נשימות עמוקות. שאל את עצמך: מה עובר עליי עכשיו?' : '3 deep breaths. Ask yourself: what\'s on my mind right now?', durationSec: 120 },
      { label: isRTL ? '✍️ כתיבה חופשית' : '✍️ Free Writing', detail: isRTL ? 'כתוב בלי לעצור. אל תערוך, אל תשפוט. תן למילים לזרום.' : 'Write without stopping. Don\'t edit, don\'t judge. Let words flow.', durationSec: Math.max(3, dur - 4) * 60 },
      { label: isRTL ? '💎 תובנה מרכזית' : '💎 Core Insight', detail: isRTL ? 'קרא חזרה. מה הדבר המפתיע? מה הפעולה שעולה מזה?' : 'Read back. What\'s surprising? What action emerges?', durationSec: 120 },
    ];
  }

  // Walking / hiking
  if (/walk|הליכה|hiking|טיול|הליכת/.test(combined)) {
    return [
      { label: isRTL ? '👟 התחל — קצב קל' : '👟 Start — Easy Pace', detail: isRTL ? 'צא מהבית. 2 דקות הליכה איטית לחימום.' : 'Head out. 2 minutes slow walking to warm up.', durationSec: 120 },
      { label: isRTL ? '🚶 הליכה ראשית' : '🚶 Main Walk', detail: isRTL ? `${Math.max(5, dur - 4)} דקות. קצב נוח אך ערני. שים לב לנשימה.` : `${Math.max(5, dur - 4)} minutes. Comfortable but alert pace. Notice your breathing.`, durationSec: Math.max(5, dur - 4) * 60 },
      { label: isRTL ? '🌿 סגירה — האט ונשום' : '🌿 Close — Slow Down & Breathe', detail: isRTL ? 'האט בהדרגה. 3 נשימות עמוקות. מה הרגשת?' : 'Gradually slow down. 3 deep breaths. How did you feel?', durationSec: 120 },
    ];
  }

  // Cold exposure / cold shower
  if (/cold|קר|מקלחת|shower|ice/.test(combined)) {
    return [
      { label: isRTL ? '🧘 הכנה — נשימות כוח' : '🧘 Prepare — Power Breaths', detail: isRTL ? '30 נשימות עמוקות מהירות (Wim Hof). אחרי — עצור נשימה 30 שניות.' : '30 fast deep breaths (Wim Hof). Then hold breath 30 seconds.', durationSec: 120 },
      { label: isRTL ? '🧊 חשיפה לקור' : '🧊 Cold Exposure', detail: isRTL ? 'פתח מים קרים. התחל מהרגליים ועלה. נשום לאט ועמוק. אל תברח.' : 'Turn on cold water. Start from legs and work up. Breathe slow and deep. Don\'t escape.', durationSec: Math.max(1, dur - 4) * 60 },
      { label: isRTL ? '🔥 חימום — תנועה' : '🔥 Warm Up — Movement', detail: isRTL ? 'התנער, זוז, קפוץ. תן לגוף להתחמם באופן טבעי.' : 'Shake, move, jump. Let your body warm up naturally.', durationSec: 120 },
    ];
  }

  // Music / instrument practice
  if (/music|מוזיקה|גיטרה|guitar|piano|פסנתר|תרגול נגינה|instrument/.test(combined)) {
    return [
      { label: isRTL ? '🎵 חימום — סקאלות' : '🎵 Warm-up — Scales', detail: isRTL ? 'סקאלות בסיסיות לחימום אצבעות. קצב איטי.' : 'Basic scales to warm up fingers. Slow tempo.', durationSec: Math.min(300, dur * 15) },
      { label: isRTL ? '🎶 תרגול ממוקד' : '🎶 Focused Practice', detail: isRTL ? 'עבוד על הקטע/טכניקה שבחרת. חזור 5 פעמים לפחות.' : 'Work on chosen piece/technique. Repeat at least 5 times.', durationSec: Math.max(5, dur - 7) * 60 },
      { label: isRTL ? '🎸 נגינה חופשית' : '🎸 Free Play', detail: isRTL ? 'נגן מה שבא לך. תהנה מהתהליך.' : 'Play whatever you feel like. Enjoy the process.', durationSec: 120 },
    ];
  }

  // Cleaning / organizing
  if (/clean|ניקיון|סידור|organiz|tidy|order/.test(combined)) {
    return [
      { label: isRTL ? '📋 סקירה — מה לנקות?' : '📋 Survey — What to clean?', detail: isRTL ? 'עבור על החדר. בחר 3 אזורים לטפל בהם.' : 'Scan the room. Pick 3 areas to tackle.', durationSec: 120 },
      { label: isRTL ? '🧹 ניקיון/סידור ראשי' : '🧹 Main Clean/Organize', detail: isRTL ? `${Math.max(5, dur - 4)} דקות. אזור אחרי אזור. לא לדלג.` : `${Math.max(5, dur - 4)} minutes. Zone by zone. No skipping.`, durationSec: Math.max(5, dur - 4) * 60 },
      { label: isRTL ? '✅ בדיקה סופית' : '✅ Final Check', detail: isRTL ? 'עבור על מה שעשית. סדר פרטים קטנים. צפה בתוצאה.' : 'Review what you did. Fix small details. Admire the result.', durationSec: 120 },
    ];
  }

  // Work / deep work / project
  if (/work|עבודה|deep work|project|פרויקט|משימה|task/.test(combined)) {
    return [
      { label: isRTL ? '🎯 הגדרת מטרה' : '🎯 Define Goal', detail: isRTL ? 'מה בדיוק אני רוצה להשלים? כתוב משפט אחד.' : 'What exactly do I want to complete? Write one sentence.', durationSec: 120 },
      { label: isRTL ? '🔥 עבודה עמוקה' : '🔥 Deep Work', detail: isRTL ? `${Math.max(5, dur - 5)} דקות. טלפון במצב טיסה. חלון אחד פתוח. מיקוד מלא.` : `${Math.max(5, dur - 5)} minutes. Phone on airplane mode. One window open. Full focus.`, durationSec: Math.max(5, dur - 5) * 60 },
      { label: isRTL ? '📝 סיכום — מה הושג?' : '📝 Summary — What was achieved?', detail: isRTL ? 'מה סיימתי? מה נשאר? מה הצעד הבא?' : 'What did I finish? What remains? What\'s next?', durationSec: 180 },
    ];
  }

  // Social / networking / relationships
  if (/social|חברתי|relation|יחסים|networking|call|שיחה/.test(combined)) {
    return [
      { label: isRTL ? '💭 הכנה — על מה לדבר?' : '💭 Prepare — What to discuss?', detail: isRTL ? 'חשוב על 2-3 נושאים. מה חשוב לך להעביר?' : 'Think of 2-3 topics. What\'s important for you to convey?', durationSec: 120 },
      { label: isRTL ? '📞 השיחה / המפגש' : '📞 The Call / Meeting', detail: isRTL ? 'היה נוכח. הקשב באמת. שאל שאלות.' : 'Be present. Really listen. Ask questions.', durationSec: Math.max(5, dur - 4) * 60 },
      { label: isRTL ? '🤝 סגירה — מה יצא מזה?' : '🤝 Close — What came of it?', detail: isRTL ? 'האם יש פעולה להמשך? מתי הפעם הבאה?' : 'Is there a follow-up action? When\'s next time?', durationSec: 120 },
    ];
  }

  // Cooking / nutrition / food prep
  if (/cook|בישול|אוכל|food|nutrition|meal|ארוחה|prep/.test(combined)) {
    return [
      { label: isRTL ? '📋 הכנה — מצרכים וכלים' : '📋 Prep — Ingredients & Tools', detail: isRTL ? 'הוצא את כל המצרכים. הכן קרש חיתוך, סכין, קערות.' : 'Lay out all ingredients. Prepare cutting board, knife, bowls.', durationSec: 180 },
      { label: isRTL ? '🔪 חיתוך והכנה' : '🔪 Chop & Prep', detail: isRTL ? 'חתוך ירקות, תבל בשר/חלבון. הכן הכל לפני שמדליקים אש.' : 'Chop vegetables, season protein. Prepare everything before cooking.', durationSec: Math.floor(dur * 0.3) * 60 },
      { label: isRTL ? '🍳 בישול' : '🍳 Cook', detail: isRTL ? 'בשל לפי השלבים. טעם תוך כדי. התאם תיבול.' : 'Cook in order. Taste along the way. Adjust seasoning.', durationSec: Math.floor(dur * 0.4) * 60 },
      { label: isRTL ? '🍽️ הגשה וסדר' : '🍽️ Plate & Clean', detail: isRTL ? 'הגש יפה. נקה תוך כדי. תהנה מהאוכל.' : 'Plate nicely. Clean as you go. Enjoy the meal.', durationSec: Math.floor(dur * 0.2) * 60 },
    ];
  }

  return null; // No specific match — fall through to generic
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
