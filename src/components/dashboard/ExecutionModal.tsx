/**
 * ExecutionModal — Full-screen modal for executing a Today Engine action.
 * Shows immediate deterministic content, upgrades with AI steps if available.
 * Includes a persistent Aurora chat panel on the side.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, SkipForward, Sparkles, Clock, Flame,
  Loader2, Play, MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { NowQueueItem, useCompleteNowAction } from '@/hooks/useNowEngine';
import { getDomainById } from '@/navigation/lifeDomains';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AuroraChatInput from '@/components/aurora/AuroraChatInput';
import AuroraChatMessage from '@/components/aurora/AuroraChatMessage';
import AuroraTypingIndicator from '@/components/aurora/AuroraTypingIndicator';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExecutionStep {
  label: string;
  detail?: string;
  durationSec?: number;
  youtubeUrl?: string;
}

// Activities that should get YouTube video embeds
const YOUTUBE_ACTIVITIES = [
  'tai_chi', 'tai chi', 'yoga', 'meditation', 'stretching', 'qigong', 'qi gong',
  'pilates', 'breathwork', 'mobility', 'foam rolling', 'cold exposure',
];

const COMBAT_ACTIVITIES = [
  'combat', 'shadowboxing', 'boxing', 'muay thai', 'kickboxing', 'martial arts',
  'punching', 'striking', 'fighting', 'heavy bag',
];

const YOUTUBE_SEARCH_MAP: Record<string, string> = {
  'tai_chi': 'https://www.youtube.com/embed/nSGMsyERyBs',
  'tai chi': 'https://www.youtube.com/embed/nSGMsyERyBs',
  'yoga': 'https://www.youtube.com/embed/v7AYKMP6rOE',
  'meditation': 'https://www.youtube.com/embed/inpok4MKVLM',
  'stretching': 'https://www.youtube.com/embed/g_tea8ZNk5A',
  'qigong': 'https://www.youtube.com/embed/cwlvTcWR3Gs',
  'qi gong': 'https://www.youtube.com/embed/cwlvTcWR3Gs',
  'breathwork': 'https://www.youtube.com/embed/tybOi4hjZFQ',
  'mobility': 'https://www.youtube.com/embed/TSIbzfcnv_8',
  'pilates': 'https://www.youtube.com/embed/K56Z12XNQ5c',
};

function isYouTubeActivity(actionType: string, title: string): boolean {
  const combined = `${actionType} ${title}`.toLowerCase();
  return YOUTUBE_ACTIVITIES.some(a => combined.includes(a));
}

function isCombatActivity(actionType: string, title: string): boolean {
  const combined = `${actionType} ${title}`.toLowerCase();
  return COMBAT_ACTIVITIES.some(a => combined.includes(a));
}

function getYouTubeUrl(actionType: string, title: string): string | null {
  const combined = `${actionType} ${title}`.toLowerCase();
  for (const [key, url] of Object.entries(YOUTUBE_SEARCH_MAP)) {
    if (combined.includes(key)) return url;
  }
  return null;
}

function YouTubeEmbed({ url }: { url: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 aspect-video w-full">
      <iframe
        src={`${url}?rel=0&autoplay=0`}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

function buildFallbackSteps(action: NowQueueItem, t: any, isRTL: boolean): { steps: ExecutionStep[]; message: string } {
  const wantCombat = isCombatActivity(action.actionType, action.title);
  const wantYouTube = isYouTubeActivity(action.actionType, action.title);

  if (wantCombat) {
    return {
      steps: [
        { label: '🥊 Round 1 — Jab + Cross', detail: '100 reps: 50 left jab, 50 right cross. Fast tempo!', durationSec: 180 },
        { label: '🥊 Round 2 — Hooks', detail: '100 reps: 50 left hook, 50 right hook. Rotate hips!', durationSec: 180 },
        { label: '🥊 Round 3 — Uppercuts', detail: '100 reps: 50 left uppercut, 50 right uppercut. Drive from legs!', durationSec: 180 },
        { label: '🦵 Round 4 — Kicks', detail: '60 reps: 20 roundhouse each side, 10 teep each side. Full power!', durationSec: 180 },
        { label: '💥 Round 5 — Combos', detail: 'Jab-Cross-Hook-Uppercut-Roundhouse. Non-stop 3 minutes!', durationSec: 180 },
        { label: '🧘 Cooldown', detail: 'Stretch shoulders, hips, wrists. Deep breathing.', durationSec: 120 },
      ],
      message: isRTL
        ? '🎵 שים שיר — כל שיר זה ראונד. אין עצירות. הגוף שלך הוא כלי הנשק.'
        : '🎵 Put on a song — each song is a round. No stops. Your body is the weapon.',
    };
  }

  const dur = action.durationMin;
  const warmup = Math.max(1, Math.floor(dur * 0.1));
  const core = Math.max(1, dur - warmup - 2);
  const youtubeUrl = wantYouTube ? getYouTubeUrl(action.actionType, action.title) : null;

  const steps: ExecutionStep[] = [
    { label: isRTL ? '🎯 הכנה — כוונה ונוכחות' : '🎯 Prepare — Set intention', detail: isRTL ? 'נשימה עמוקה, הגדר כוונה לתרגול' : 'Deep breath, set intention for the practice', durationSec: warmup * 60 },
  ];

  if (youtubeUrl) {
    steps.push({ label: isRTL ? '▶️ תרגול מודרך' : '▶️ Guided Practice', detail: action.title, durationSec: core * 60, youtubeUrl });
  } else {
    steps.push({ label: isRTL ? `⚡ ביצוע — ${core} דק'` : `⚡ Core execution — ${core} min`, detail: action.title, durationSec: core * 60 });
  }

  steps.push({ label: isRTL ? '🔄 סגירה — מה למדתי? מה הצעד הבא?' : '🔄 Close — What did I learn? What\'s next?', durationSec: 120 });

  return {
    steps,
    message: isRTL
      ? `בוא נתחיל. ${action.durationMin} דקות של מיקוד. אני איתך.`
      : `Let's begin. ${action.durationMin} minutes of focus. I'm with you.`,
  };
}

// ---- Mini Aurora Chat for the execution modal ----
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function ExecutionAuroraChat({ action, isRTL }: { action: NowQueueItem; isRTL: boolean }) {
  const { user } = useAuth();
  const { language } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([{
      role: 'assistant',
      content: isRTL
        ? `אני כאן איתך לאורך כל התרגול. שאל אותי כל שאלה, בקש טיפים, או שתף מה אתה מרגיש. 💫`
        : `I'm here with you throughout this practice. Ask me anything, request tips, or share how you're feeling. 💫`,
    }]);
  }, [action, isRTL]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    try {
      const allMessages = [...messages, userMsg];
      const systemPrompt = language === 'he'
        ? `אתה אורורה, מאמן AI אישי. המשתמש כרגע מבצע: "${action.title}" (${action.durationMin} דק'). עזור, עודד, תן טיפים קצרים. תענה תמיד בעברית.`
        : `You are Aurora, a personal AI coach. The user is currently doing: "${action.title}" (${action.durationMin} min). Help, encourage, give short tips.`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt,
          userId: user?.id,
          language,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Stream failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantSoFar = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > 1) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { /* partial JSON, wait */ }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isRTL ? 'סליחה, משהו השתבש. נסה שוב.' : 'Sorry, something went wrong. Try again.',
      }]);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming, action, user?.id, language, isRTL]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 flex-shrink-0">
        <AuroraHoloOrb size={24} glow="subtle" />
        <span className="text-sm font-semibold text-foreground">{isRTL ? 'אורורה — מלווה חי' : 'Aurora — Live Guide'}</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
        {messages.map((msg, i) => (
          <AuroraChatMessage
            key={i}
            id={`exec-${i}`}
            content={msg.content}
            isOwn={msg.role === 'user'}
            isAI={msg.role === 'assistant'}
          />
        ))}
        {isStreaming && <AuroraTypingIndicator />}
      </div>
      <div className="flex-shrink-0 border-t border-border/30">
        <AuroraChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}

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

  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [auroraMessage, setAuroraMessage] = useState('');
  const [completing, setCompleting] = useState(false);
  const [showChat, setShowChat] = useState(!isMobile);

  const lastGeneratedRef = useRef<string | null>(null);

  // Immediately build fallback content, then try to upgrade with AI
  useEffect(() => {
    if (!open || !action || !user?.id) return;

    const actionKey = `${action.actionType}-${action.pillarId}-${action.durationMin}`;
    if (lastGeneratedRef.current === actionKey) return;
    lastGeneratedRef.current = actionKey;

    setCheckedSteps(new Set());

    // Show content IMMEDIATELY with fallback
    const fallback = buildFallbackSteps(action, t, isRTL);
    setSteps(fallback.steps);
    setAuroraMessage(fallback.message);

    // Try to upgrade with AI in background
    const controller = new AbortController();
    (async () => {
      try {
        const edgeCall = supabase.functions.invoke('generate-today-queue', {
          body: {
            user_id: user.id,
            language,
            mode: 'execution_steps',
            action_type: action.actionType,
            pillar: action.pillarId,
            duration_min: action.durationMin,
            title: action.title,
            want_youtube: isYouTubeActivity(action.actionType, action.title),
            want_combat_routine: isCombatActivity(action.actionType, action.title),
          },
        });
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
        const res = await Promise.race([edgeCall, timeout]) as any;
        if (!controller.signal.aborted && !res.error && res.data?.steps?.length) {
          setSteps(res.data.steps);
          if (res.data.aurora_message) setAuroraMessage(res.data.aurora_message);
        }
      } catch {
        // Keep fallback content — no error needed
      }
    })();

    return () => { controller.abort(); };
  }, [open, action, user?.id, language, t, isRTL]);

  useEffect(() => {
    if (!open) lastGeneratedRef.current = null;
  }, [open]);

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const allDone = steps.length > 0 && checkedSteps.size === steps.length;
  const progress = steps.length > 0 ? Math.round((checkedSteps.size / steps.length) * 100) : 0;

  const domain = action ? getDomainById(action.pillarId) : null;
  const DomainIcon = domain?.icon;

  const handleComplete = async () => {
    if (!action) return;
    setCompleting(true);
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
    toast(t('today.skippedReturn'));
    onOpenChange(false);
  };

  if (!open || !action) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              {DomainIcon && <DomainIcon className="h-5 w-5 text-primary" />}
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {domain ? (isRTL ? domain.labelHe : domain.labelEn) : action.pillarId}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-medium truncate max-w-[300px]">{isRTL ? action.title : action.titleEn}</span>
            </div>
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChat(!showChat)}
                  className={cn('rounded-full', showChat && 'bg-primary/10 text-primary')}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
              <button onClick={() => onOpenChange(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body — split layout */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Main content */}
            <div className={cn(
              'flex-1 flex flex-col min-h-0',
              !isMobile && showChat && 'border-e border-border/30'
            )}>
              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
                <div className="max-w-2xl mx-auto space-y-5">
                  {/* Title & Duration */}
                  <div>
                    <h2 className="text-2xl font-bold">{isRTL ? action.title : action.titleEn}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {action.durationMin} {t('today.minutesShort')}
                      </span>
                    </div>
                  </div>

                  {/* Aurora message */}
                  {auroraMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-primary/10 border border-primary/20 p-4"
                    >
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm leading-relaxed">{auroraMessage}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t('today.progress')}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Steps Checklist */}
                  <div className="space-y-2.5">
                    {steps.map((step, idx) => {
                      const checked = checkedSteps.has(idx);
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                        >
                          <button
                            onClick={() => toggleStep(idx)}
                            className={cn(
                              'w-full flex items-start gap-3 p-4 rounded-xl border text-start transition-all',
                              checked ? 'bg-primary/10 border-primary/30' : 'bg-card/50 border-border/40 hover:border-primary/20'
                            )}
                          >
                            <div className={cn(
                              'shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors',
                              checked ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                            )}>
                              {checked && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-medium', checked && 'line-through opacity-60')}>
                                {step.label}
                              </p>
                              {step.detail && <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>}
                              {step.durationSec && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 mt-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {Math.ceil(step.durationSec / 60)} {t('today.minutesShort')}
                                </span>
                              )}
                            </div>
                          </button>
                          {/* YouTube embed below the step */}
                          {step.youtubeUrl && (
                            <div className="mt-2 ms-9">
                              <YouTubeEmbed url={step.youtubeUrl} />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/50 flex items-center gap-3 max-w-2xl mx-auto w-full flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={handleSkip} className="shrink-0 text-muted-foreground">
                  <SkipForward className="h-4 w-4 me-1" />
                  {t('today.skip')}
                </Button>
                <Button size="lg" className="flex-1 gap-2" disabled={!allDone || completing} onClick={handleComplete}>
                  {completing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Flame className="h-4 w-4" />
                      {t('today.complete')}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Aurora Chat Panel — side panel on desktop, overlay on mobile */}
            {showChat && (
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                className={cn(
                  isMobile
                    ? 'absolute inset-0 z-10 bg-background'
                    : 'w-[360px] flex-shrink-0'
                )}
              >
                <ExecutionAuroraChat action={action} isRTL={isRTL} />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
