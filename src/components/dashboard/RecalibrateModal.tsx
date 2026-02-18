/**
 * RecalibrateModal — Full-screen editable form of all activation answers.
 * On save, re-runs generate-launchpad-summary to rebuild the entire plan.
 */
import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { activationFlowSpec } from '@/flows/activationFlowSpec';
import { getVisibleMiniSteps } from '@/lib/flow/flowSpec';
import { cn } from '@/lib/utils';
import { RefreshCw, Loader2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FlowAnswers, MiniStep, FlowStep } from '@/lib/flow/types';

interface RecalibrateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOTIVATIONAL_MESSAGES_HE = [
  'מחשב מחדש את המסלול שלך...',
  'בונה תוכנית חדשה מותאמת אישית...',
  'מעדכן את אבני הדרך שלך...',
  'מכין את השלב הבא של הצמיחה שלך...',
];
const MOTIVATIONAL_MESSAGES_EN = [
  'Recalculating your trajectory...',
  'Building a personalized new plan...',
  'Updating your milestones...',
  'Preparing your next growth phase...',
];

export function RecalibrateModal({ open, onOpenChange }: RecalibrateModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useTranslation();
  const isHe = language === 'he';

  const [answers, setAnswers] = useState<FlowAnswers>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [motivationalIdx, setMotivationalIdx] = useState(0);

  // Cycle motivational messages while submitting
  useEffect(() => {
    if (!submitting) return;
    const interval = setInterval(() => {
      setMotivationalIdx(prev => (prev + 1) % MOTIVATIONAL_MESSAGES_HE.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [submitting]);

  // Load current answers on open
  useEffect(() => {
    if (!open || !user?.id) return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase
          .from('launchpad_progress')
          .select('step_1_intention')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.step_1_intention) {
          let parsed: Record<string, unknown> = {};
          if (typeof data.step_1_intention === 'string') {
            try { parsed = JSON.parse(data.step_1_intention); } catch { /* skip */ }
          } else if (typeof data.step_1_intention === 'object') {
            parsed = data.step_1_intention as Record<string, unknown>;
          }

          // Flatten pain/outcome dynamic keys into canonical form
          const flat: FlowAnswers = {};
          for (const [k, v] of Object.entries(parsed)) {
            flat[k] = v as string | string[];
          }

          // Map primary_pain back to its pillar-specific key
          if (flat.primary_pain && flat.primary_focus) {
            flat[`primary_pain_${flat.primary_focus}`] = flat.primary_pain;
          }
          if (flat.desired_outcome && flat.primary_focus) {
            flat[`desired_outcome_${flat.primary_focus}`] = flat.desired_outcome;
          }

          setAnswers(flat);
        }
      } catch (e) {
        console.error('Failed to load activation answers:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, user?.id]);

  // Get the 9 question steps (exclude screen 10 which is the reveal)
  const questionSteps = useMemo(
    () => activationFlowSpec.steps.filter(s => s.renderer === 'card'),
    []
  );

  const setAnswer = (key: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key: string, value: string) => {
    setAnswers(prev => {
      const current = (prev[key] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      }
      if (current.length >= 2) return prev; // max 2
      return { ...prev, [key]: [...current, value] };
    });
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    setMotivationalIdx(0);

    try {
      // Build canonical intention JSON
      const focus = answers.primary_focus as string;
      const intentionData: Record<string, unknown> = {
        primary_focus: answers.primary_focus,
        primary_pain: answers[`primary_pain_${focus}`] || answers.primary_pain,
        desired_outcome: answers[`desired_outcome_${focus}`] || answers.desired_outcome,
        commitment_level: answers.commitment_level,
        secondary_focus: answers.secondary_focus || [],
        core_obstacle: answers.core_obstacle,
        peak_productivity: answers.peak_productivity,
        identity_statement: answers.identity_statement,
        ninety_day_vision: answers.ninety_day_vision,
      };

      // 1. Save updated answers
      const { error: updateErr } = await supabase
        .from('launchpad_progress')
        .update({
          step_1_intention: JSON.stringify(intentionData),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateErr) throw updateErr;

      // 2. Archive old life plans
      await supabase
        .from('life_plans')
        .update({ status: 'archived' })
        .eq('user_id', user.id)
        .neq('status', 'archived');

      // 3. Call generate-launchpad-summary edge function
      const { data: { session } } = await supabase.auth.getSession();
      const { error: fnErr } = await supabase.functions.invoke('generate-launchpad-summary', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { userId: user.id, regenerate: true },
      });

      if (fnErr) throw fnErr;

      // 4. Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['life-plan'] }),
        queryClient.invalidateQueries({ queryKey: ['milestones'] }),
        queryClient.invalidateQueries({ queryKey: ['launchpad-data'] }),
        queryClient.invalidateQueries({ queryKey: ['launchpad-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['current-week-milestone'] }),
        queryClient.invalidateQueries({ queryKey: ['unified-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['life-plan-milestones'] }),
        queryClient.invalidateQueries({ queryKey: ['daily-roadmap'] }),
        queryClient.invalidateQueries({ queryKey: ['action-items'] }),
      ]);

      toast.success(isHe ? '✨ התוכנית שלך חושבה מחדש בהצלחה!' : '✨ Your plan has been recalculated!');
      onOpenChange(false);
    } catch (e) {
      console.error('Recalibration failed:', e);
      toast.error(isHe ? 'שגיאה בחישוב מחדש, נסה שוב' : 'Recalculation failed, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const messages = isHe ? MOTIVATIONAL_MESSAGES_HE : MOTIVATIONAL_MESSAGES_EN;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <RefreshCw className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">{isHe ? 'כיול מחדש' : 'Recalibrate'}</h2>
              <p className="text-xs text-muted-foreground">{isHe ? 'עדכן את התשובות שלך וחשב מחדש את כל התוכנית' : 'Update your answers to recalculate your entire plan'}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        {submitting ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-12 h-12 text-primary" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.p
                key={motivationalIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-semibold text-center text-foreground/80"
              >
                {messages[motivationalIdx]}
              </motion.p>
            </AnimatePresence>
            <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 12, ease: 'easeInOut' }}
              />
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 h-0">
            <div className="p-5 space-y-6 pb-28">
              {questionSteps.map((step, stepIdx) => {
                const visibleMinis = getVisibleMiniSteps(step, answers);
                if (visibleMinis.length === 0) return null;

                return (
                  <div key={step.id}>
                    {visibleMinis.map(mini => (
                      <QuestionSection
                        key={mini.id}
                        mini={mini}
                        stepIndex={stepIdx + 1}
                        totalSteps={questionSteps.length}
                        answer={answers[mini.id]}
                        isHe={isHe}
                        onSelect={(val) => setAnswer(mini.id, val)}
                        onToggleMulti={(val) => toggleMultiSelect(mini.id, val)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer CTA */}
        {!submitting && !loading && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full rounded-2xl py-3.5 text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <RefreshCw className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2" />
              {isHe ? 'חשב מחדש את התוכנית שלי' : 'Recalculate My Plan'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Individual Question Section ─── */
interface QuestionSectionProps {
  mini: MiniStep;
  stepIndex: number;
  totalSteps: number;
  answer: string | string[] | number | undefined;
  isHe: boolean;
  onSelect: (value: string) => void;
  onToggleMulti: (value: string) => void;
}

function QuestionSection({ mini, stepIndex, totalSteps, answer, isHe, onSelect, onToggleMulti }: QuestionSectionProps) {
  const title = isHe ? mini.title_he : mini.title_en;
  const prompt = isHe ? (mini.prompt_he || '') : (mini.prompt_en || '');
  const isMulti = mini.inputType === 'multi_select';
  const isTextarea = mini.inputType === 'textarea';

  return (
    <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {stepIndex}/{totalSteps}
        </span>
        <h3 className="text-sm font-semibold flex-1">{title}</h3>
      </div>
      {prompt && <p className="text-xs text-muted-foreground">{prompt}</p>}

      {/* Options or textarea */}
      {isTextarea ? (
        <Textarea
          value={(answer as string) || ''}
          onChange={(e) => onSelect(e.target.value)}
          className="min-h-[100px] rounded-xl bg-background/60 border-border/30 resize-none text-sm"
          placeholder={prompt}
          dir={isHe ? 'rtl' : 'ltr'}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {mini.options?.map(opt => {
            const selected = isMulti
              ? ((answer as string[]) || []).includes(opt.value)
              : answer === opt.value;
            const label = isHe ? opt.label_he : opt.label_en;

            return (
              <button
                key={opt.value}
                onClick={() => isMulti ? onToggleMulti(opt.value) : onSelect(opt.value)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border text-start transition-all min-h-[44px]",
                  "text-sm font-medium",
                  selected
                    ? "bg-primary/10 border-primary/40 text-foreground shadow-sm shadow-primary/10"
                    : "bg-background/40 border-border/20 text-muted-foreground hover:bg-accent/5 hover:border-border/40"
                )}
              >
                {opt.icon && <span className="text-base flex-shrink-0">{opt.icon}</span>}
                <span className="flex-1 leading-tight">{label}</span>
                {selected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
