/**
 * ExecutionModal — Full-screen modal for executing a Now Engine action
 * Shows Aurora live guidance, checklist steps, complete/skip controls
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, SkipForward, Sparkles, Clock, Flame,
  ChevronRight, Loader2, ArrowRight,
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
}

interface ExecutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: NowQueueItem | null;
  onComplete?: () => void;
}

export function ExecutionModal({ open, onOpenChange, action, onComplete }: ExecutionModalProps) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const completeMutation = useCompleteNowAction();

  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [auroraMessage, setAuroraMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  const isHe = language === 'he';
  const domain = action ? getDomainById(action.pillarId) : null;
  const DomainIcon = domain?.icon;

  // Generate steps via Aurora or fallback
  const generateSteps = useCallback(async () => {
    if (!action || !user?.id) return;
    setLoading(true);
    setCheckedSteps(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('generate-today-queue', {
        body: {
          user_id: user.id,
          language,
          mode: 'execution_steps',
          action_type: action.actionType,
          pillar: action.pillarId,
          duration_min: action.durationMin,
        },
      });

      if (!error && data?.steps?.length) {
        setSteps(data.steps);
        setAuroraMessage(data.aurora_message || '');
      } else {
        // Fallback: generate simple steps client-side
        generateFallbackSteps();
      }
    } catch {
      generateFallbackSteps();
    } finally {
      setLoading(false);
    }
  }, [action, user?.id, language]);

  const generateFallbackSteps = () => {
    if (!action) return;
    const dur = action.durationMin;
    const baseSteps: ExecutionStep[] = isHe
      ? [
          { label: 'הכנה — נשימות עמוקות ומיקוד כוונה', durationSec: 60 },
          { label: `ביצוע ליבה — ${action.title}`, detail: `${Math.max(1, dur - 4)} דקות של עבודה ממוקדת`, durationSec: Math.max(60, (dur - 4) * 60) },
          { label: 'סיכום — מה למדתי? מה השלב הבא?', durationSec: 120 },
        ]
      : [
          { label: 'Prepare — deep breaths & set intention', durationSec: 60 },
          { label: `Core execution — ${action.title}`, detail: `${Math.max(1, dur - 4)} minutes of focused work`, durationSec: Math.max(60, (dur - 4) * 60) },
          { label: 'Reflect — what did I learn? What\'s next?', durationSec: 120 },
        ];
    setSteps(baseSteps);
    setAuroraMessage(
      isHe
        ? `בוא נתחיל. ${action.title} — ${dur} דקות. אני איתך.`
        : `Let's go. ${action.title} — ${dur} minutes. I'm with you.`
    );
  };

  useEffect(() => {
    if (open && action) {
      generateSteps();
    }
  }, [open, action, generateSteps]);

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
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
            toast.success(isHe ? 'הושלם! 🎉 +XP' : 'Completed! 🎉 +XP');
            setCompleting(false);
            onComplete?.();
            onOpenChange(false);
          },
          onError: () => {
            toast.error(isHe ? 'שגיאה בשמירה' : 'Error saving');
            setCompleting(false);
          },
        }
      );
    } else {
      // Template action — just close with success
      toast.success(isHe ? 'הושלם! 🎉' : 'Completed! 🎉');
      setCompleting(false);
      onComplete?.();
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    toast(isHe ? 'דילגת — הפעולה תחזור מחר' : 'Skipped — action will return tomorrow');
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
                {isHe ? (action.hub === 'core' ? 'ליבה' : 'זירה') : action.hub}
                {' · '}
                {domain ? (isHe ? domain.labelHe : domain.labelEn) : action.pillarId}
              </span>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 max-w-lg mx-auto w-full">
            {/* Action Title */}
            <div>
              <h2 className="text-xl font-bold">{action.title}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {action.durationMin} {isHe ? 'דקות' : 'min'}
                </span>
                <span className="text-muted-foreground/50">{action.reason}</span>
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
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {isHe ? 'אורורה מחשבת...' : 'Aurora is computing...'}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{auroraMessage}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{isHe ? 'התקדמות' : 'Progress'}</span>
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

            {/* Checklist Steps */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
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
                        checked
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-card/50 border-border/40 hover:border-primary/20'
                      )}
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors',
                        checked ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      )}>
                        {checked && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', checked && 'line-through opacity-60')}>
                          {step.label}
                        </p>
                        {step.detail && (
                          <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                        )}
                        {step.durationSec && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 mt-1">
                            <Clock className="h-2.5 w-2.5" />
                            {Math.ceil(step.durationSec / 60)} {isHe ? 'דק׳' : 'min'}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/50 flex items-center gap-3 max-w-lg mx-auto w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="flex-shrink-0 text-muted-foreground"
            >
              <SkipForward className="h-4 w-4 me-1" />
              {isHe ? 'דלג' : 'Skip'}
            </Button>

            <Button
              size="lg"
              className="flex-1 gap-2"
              disabled={!allDone || completing}
              onClick={handleComplete}
            >
              {completing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Flame className="h-4 w-4" />
                  {isHe ? 'השלם' : 'Complete'}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
