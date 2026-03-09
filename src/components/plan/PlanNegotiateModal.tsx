/**
 * PlanNegotiateModal — "Talk to your plan" wizard.
 * Users can swap, reschedule, or skip tasks through Aurora negotiation.
 */
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ArrowRightLeft, Clock, SkipForward, Loader2, CheckCircle2, XCircle, MessageSquare, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type NowQueueItem } from '@/types/planning';
import { toast } from 'sonner';

type NegotiateAction = 'swap' | 'reschedule' | 'skip';
type Step = 'choose' | 'input' | 'evaluating' | 'result';

interface NegotiateResult {
  approved: boolean;
  reason: string;
  suggestion?: string;
  replacement?: {
    title: string;
    titleEn: string;
    durationMin: number;
    pillar: string;
  };
}

interface PlanNegotiateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: NowQueueItem | null;
  onApplied?: () => void;
}

const ACTION_OPTIONS: { id: NegotiateAction; iconEl: typeof ArrowRightLeft; labelHe: string; labelEn: string; descHe: string; descEn: string }[] = [
  { id: 'swap', iconEl: ArrowRightLeft, labelHe: 'החלפה', labelEn: 'Swap', descHe: 'החלף במשימה שווה', descEn: 'Replace with equivalent task' },
  { id: 'reschedule', iconEl: Clock, labelHe: 'דחייה', labelEn: 'Reschedule', descHe: 'דחה ליום אחר השבוע', descEn: 'Move to another day' },
  { id: 'skip', iconEl: SkipForward, labelHe: 'דילוג', labelEn: 'Skip', descHe: 'דלג עם סיבה', descEn: 'Skip with a reason' },
];

export function PlanNegotiateModal({ open, onOpenChange, task, onApplied }: PlanNegotiateModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('choose');
  const [action, setAction] = useState<NegotiateAction | null>(null);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<NegotiateResult | null>(null);

  const resetState = () => {
    setStep('choose');
    setAction(null);
    setUserInput('');
    setResult(null);
  };

  const handleClose = (val: boolean) => {
    if (!val) resetState();
    onOpenChange(val);
  };

  const placeholders: Record<NegotiateAction, { he: string; en: string }> = {
    swap: { he: 'מה תרצה לעשות במקום? (למשל: שדובוקסינג במקום קליסטניקס)', en: 'What would you prefer? (e.g., shadowboxing instead of calisthenics)' },
    reschedule: { he: 'מתי תעדיף לבצע? (למשל: מחר בבוקר)', en: 'When would you prefer? (e.g., tomorrow morning)' },
    skip: { he: 'למה תרצה לדלג? (למשל: כאב גב)', en: 'Why do you want to skip? (e.g., back pain)' },
  };

  const handleSubmit = async () => {
    if (!task || !action || !user?.id) return;

    setStep('evaluating');

    try {
      const { data, error } = await supabase.functions.invoke('negotiate-plan', {
        body: {
          user_id: user.id,
          action_type: action,
          task_title: task.title,
          task_title_en: task.titleEn,
          task_pillar: task.pillarId,
          task_duration: task.durationMin,
          task_source_id: task.sourceId,
          milestone_id: task.milestoneId,
          user_input: userInput,
        },
      });

      if (error) throw error;
      setResult(data as NegotiateResult);
      setStep('result');
    } catch (err) {
      console.error('Negotiate failed:', err);
      toast.error(isHe ? 'שגיאה בתקשורת עם Aurora' : 'Failed to communicate with Aurora');
      setStep('input');
    }
  };

  const handleApply = async () => {
    if (!result?.approved || !task || !user?.id) return;

    try {
      if (action === 'skip' || action === 'reschedule') {
        // Mark original task as skipped
        if (task.sourceId) {
          await supabase
            .from('action_items')
            .update({ status: 'skipped', metadata: { skip_reason: userInput, negotiated: true } as any })
            .eq('id', task.sourceId);
        }
      }

      if (action === 'swap' && result.replacement) {
        // Mark original as skipped, insert replacement
        if (task.sourceId) {
          await supabase
            .from('action_items')
            .update({ status: 'skipped', metadata: { swapped_for: result.replacement.title, negotiated: true } as any })
            .eq('id', task.sourceId);
        }

        // Create replacement action item
        const today = new Date().toISOString().slice(0, 10);
        await supabase.from('action_items').insert({
          user_id: user.id,
          title: result.replacement.title,
          type: 'task',
          source: 'aurora',
          pillar: result.replacement.pillar,
          scheduled_date: today,
          time_block: task.pillarId || 'training',
          metadata: { negotiated: true, replaces: task.sourceId } as any,
        });
      }

      toast.success(isHe ? '✅ השינוי הוחל בהצלחה' : '✅ Change applied successfully');
      onApplied?.();
      handleClose(false);
    } catch (err) {
      console.error('Apply failed:', err);
      toast.error(isHe ? 'שגיאה בהחלת השינוי' : 'Failed to apply change');
    }
  };

  const taskLabel = task ? (isHe ? task.title : task.titleEn) : '';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent preventClose className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5 text-primary" />
            {isHe ? 'דבר עם התוכנית' : 'Talk to Your Plan'}
          </DialogTitle>
        </DialogHeader>

        {/* Task context */}
        {task && (
          <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground">{isHe ? 'משימה נוכחית' : 'Current task'}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{taskLabel}</p>
            {task.durationMin > 0 && (
              <Badge variant="secondary" className="mt-1.5 text-[10px]">
                {task.durationMin}{isHe ? ' דק׳' : ' min'}
              </Badge>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Choose action */}
          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-2"
            >
              <p className="text-xs text-muted-foreground">
                {isHe ? 'מה תרצה לעשות?' : 'What would you like to do?'}
              </p>
              {ACTION_OPTIONS.map((opt) => {
                const Icon = opt.iconEl;
                return (
                  <button
                    key={opt.id}
                    onClick={() => { setAction(opt.id); setStep('input'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-start"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{isHe ? opt.labelHe : opt.labelEn}</p>
                      <p className="text-[11px] text-muted-foreground">{isHe ? opt.descHe : opt.descEn}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Step 2: User input */}
          {step === 'input' && action && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              <button
                onClick={() => setStep('choose')}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className={cn("h-3 w-3", isRTL && "rotate-180")} />
                {isHe ? 'חזור' : 'Back'}
              </button>
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isHe ? placeholders[action].he : placeholders[action].en}
                className="min-h-[80px] text-sm"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <Button
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isHe ? 'שלח ל-Aurora' : 'Send to Aurora'}
              </Button>
            </motion.div>
          )}

          {/* Step 3: Evaluating */}
          {step === 'evaluating' && (
            <motion.div
              key="evaluating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {isHe ? 'Aurora מעריכה את הבקשה שלך...' : 'Aurora is evaluating your request...'}
              </p>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className={cn(
                "p-4 rounded-xl border",
                result.approved
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-destructive/5 border-destructive/20"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {result.approved ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="text-sm font-bold text-foreground">
                    {result.approved
                      ? (isHe ? 'מאושר ✅' : 'Approved ✅')
                      : (isHe ? 'לא מומלץ' : 'Not recommended')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.reason}</p>
              </div>

              {result.replacement && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-[10px] text-muted-foreground mb-1">{isHe ? 'חלופה מוצעת' : 'Suggested replacement'}</p>
                  <p className="text-sm font-semibold text-foreground">{isHe ? result.replacement.title : result.replacement.titleEn}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {result.replacement.durationMin}{isHe ? ' דק׳' : ' min'}
                  </Badge>
                </div>
              )}

              {result.suggestion && !result.approved && (
                <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-[10px] text-muted-foreground mb-1">{isHe ? 'הצעה של Aurora' : "Aurora's suggestion"}</p>
                  <p className="text-xs text-foreground leading-relaxed">{result.suggestion}</p>
                </div>
              )}

              <div className="flex gap-2">
                {result.approved && (
                  <Button onClick={handleApply} className="flex-1 gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {isHe ? 'החל שינוי' : 'Apply Change'}
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleClose(false)} className={cn(!result.approved && "flex-1")}>
                  {isHe ? 'סגור' : 'Close'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
