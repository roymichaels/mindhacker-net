/**
 * ExecutionModal — Full-screen modal for executing a Today Engine action.
 * Free: deterministic checklist. Plus/Apex: AI-generated steps via aurora-task-brief.
 * Uses translation keys only. RTL-aware.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, SkipForward, Sparkles, Clock, Flame,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { NowQueueItem, useCompleteNowAction } from '@/hooks/useNowEngine';
import { getDomainById } from '@/navigation/lifeDomains';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

// Combat/training activities that get special routines
const COMBAT_ACTIVITIES = [
  'combat', 'shadowboxing', 'boxing', 'muay thai', 'kickboxing', 'martial arts',
  'punching', 'striking', 'fighting', 'heavy bag',
];

function isYouTubeActivity(actionType: string, title: string): boolean {
  const combined = `${actionType} ${title}`.toLowerCase();
  return YOUTUBE_ACTIVITIES.some(a => combined.includes(a));
}

function isCombatActivity(actionType: string, title: string): boolean {
  const combined = `${actionType} ${title}`.toLowerCase();
  return COMBAT_ACTIVITIES.some(a => combined.includes(a));
}

function YouTubeEmbed({ url }: { url: string }) {
  // Extract video ID from various YouTube URL formats
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${match[1]}?rel=0`}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

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

  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [auroraMessage, setAuroraMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  const domain = action ? getDomainById(action.pillarId) : null;
  const DomainIcon = domain?.icon;

  // Use a ref to track what we last generated for, to prevent infinite loops
  const lastGeneratedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !action || !user?.id) return;
    
    const actionKey = `${action.actionType}-${action.pillarId}-${action.durationMin}`;
    if (lastGeneratedRef.current === actionKey) return;
    lastGeneratedRef.current = actionKey;

    let cancelled = false;
    setLoading(true);
    setCheckedSteps(new Set());

    const fetchSteps = async () => {
      try {
        const wantYouTube = isYouTubeActivity(action.actionType, action.title);
        const wantCombat = isCombatActivity(action.actionType, action.title);

        // Race the edge function against a 8s timeout
        let data: any = null;
        let fetchError: any = null;
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
              want_youtube: wantYouTube,
              want_combat_routine: wantCombat,
            },
          });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 8000)
          );
          const res = await Promise.race([edgeCall, timeoutPromise]);
          data = (res as any).data;
          fetchError = (res as any).error;
        } catch (e: any) {
          fetchError = e;
        }

        if (cancelled) return;
        if (!fetchError && data?.steps?.length) {
          setSteps(data.steps);
          setAuroraMessage(data.aurora_message || '');
        } else {
          // Build smart fallback based on activity type
          if (wantCombat) {
            const rounds = [
              { label: '🥊 Round 1 — Jab + Cross', detail: '100 reps: 50 left jab, 50 right cross. Fast tempo!', durationSec: 180 },
              { label: '🥊 Round 2 — Hooks', detail: '100 reps: 50 left hook, 50 right hook. Rotate hips!', durationSec: 180 },
              { label: '🥊 Round 3 — Uppercuts', detail: '100 reps: 50 left uppercut, 50 right uppercut. Drive from legs!', durationSec: 180 },
              { label: '🦵 Round 4 — Kicks (Muay Thai)', detail: '60 reps: 20 roundhouse each side, 10 teep each side. Full power!', durationSec: 180 },
              { label: '💥 Round 5 — Combos', detail: 'Jab-Cross-Hook-Uppercut-Roundhouse. Non-stop 3 minutes!', durationSec: 180 },
              { label: '🧘 Cooldown', detail: 'Stretch shoulders, hips, wrists. Deep breathing.', durationSec: 120 },
            ];
            setSteps(rounds);
            setAuroraMessage(isRTL 
              ? '🎵 שים שיר — כל שיר זה ראונד. אין עצירות. הגוף שלך הוא כלי הנשק.' 
              : '🎵 Put on a song — each song is a round. No stops. Your body is the weapon.');
          } else {
            const dur = action.durationMin;
            const coreMin = Math.max(1, dur - 4);
            setSteps([
              { label: t('today.prepare'), durationSec: 60 },
              { label: `${t('today.coreExecution')} — ${coreMin} ${t('today.minutesShort')}`, detail: action.title, durationSec: coreMin * 60 },
              { label: t('today.reflect'), durationSec: 120 },
            ]);
            setAuroraMessage(`${t('today.letsBegin')} ${action.durationMin} ${t('today.minutesShort')}. ${t('today.withYou')}`);
          }
        }
      } catch {
        if (cancelled) return;
        const dur = action.durationMin;
        const coreMin = Math.max(1, dur - 4);
        setSteps([
          { label: t('today.prepare'), durationSec: 60 },
          { label: `${t('today.coreExecution')} — ${coreMin} ${t('today.minutesShort')}`, detail: action.title, durationSec: coreMin * 60 },
          { label: t('today.reflect'), durationSec: 120 },
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSteps();
    return () => { cancelled = true; };
  }, [open, action, user?.id, language, t]);

  // Reset ref when modal closes
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
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              {DomainIcon && <DomainIcon className="h-5 w-5 text-primary" />}
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {domain ? (isRTL ? domain.labelHe : domain.labelEn) : action.pillarId}
              </span>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 max-w-lg mx-auto w-full">
            <div>
              <h2 className="text-xl font-bold">{isRTL ? action.title : action.titleEn}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {action.durationMin} {t('today.minutesShort')}
                </span>
              </div>
            </div>

            {/* Aurora Message */}
            {(loading || auroraMessage) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-primary/10 border border-primary/20 p-3.5"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t('today.auroraComputing')}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{auroraMessage}</p>
                  )}
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

            {/* Checklist */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map((step, idx) => {
                  const checked = checkedSteps.has(idx);
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      onClick={() => toggleStep(idx)}
                      className={cn(
                        'w-full flex items-start gap-3 p-3.5 rounded-xl border text-start transition-all',
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
                        {step.youtubeUrl && <div className="mt-2"><YouTubeEmbed url={step.youtubeUrl} /></div>}
                        {step.durationSec && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 mt-1">
                            <Clock className="h-2.5 w-2.5" />
                            {Math.ceil(step.durationSec / 60)} {t('today.minutesShort')}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 flex items-center gap-3 max-w-lg mx-auto w-full">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
