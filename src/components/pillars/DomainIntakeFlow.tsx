/**
 * DomainIntakeFlow — Multi-step structured intake for a Life domain.
 * Collects config data step-by-step and saves to life_domains.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { getIntakeSteps, type IntakeStep } from '@/navigation/domainIntakeQuestions';
import { getDomainById } from '@/navigation/lifeDomains';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  domainId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function DomainIntakeFlow({ domainId, onComplete, onCancel }: Props) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { upsertDomain } = useLifeDomains();
  const domain = getDomainById(domainId);
  const steps = getIntakeSteps(domainId);

  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;
  const isSummary = stepIdx === steps.length; // virtual summary step
  const progress = ((stepIdx + 1) / (steps.length + 1)) * 100;

  const currentAnswer = answers[step?.fieldKey];

  const canProceed = useCallback(() => {
    if (!step) return true;
    const ans = answers[step.fieldKey];
    if (step.type === 'text') return true; // text is optional (constraints can be empty)
    if (step.type === 'single') return !!ans;
    if (step.type === 'multi') return Array.isArray(ans) && ans.length > 0;
    return true;
  }, [step, answers]);

  const setAnswer = (fieldKey: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldKey]: value }));
  };

  const toggleMulti = (fieldKey: string, value: string) => {
    setAnswers(prev => {
      const arr: string[] = prev[fieldKey] ?? [];
      return {
        ...prev,
        [fieldKey]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const handleNext = () => {
    if (isLast && step?.fieldKey === 'goal_description' && !answers[step.fieldKey]?.trim()) {
      // Goal is required
      toast.error(isHe ? 'נא להגדיר מטרה' : 'Please set a goal');
      return;
    }
    if (!canProceed()) return;
    setStepIdx(prev => prev + 1);
  };

  const handleBack = () => {
    if (stepIdx > 0) setStepIdx(prev => prev - 1);
    else onCancel();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertDomain.mutateAsync({
        domainId,
        config: answers,
        status: 'configured',
      });
      toast.success(isHe ? 'התחום הוגדר בהצלחה!' : 'Domain configured!');
      onComplete();
    } catch {
      toast.error(isHe ? 'שגיאה בשמירה' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  // Summary view
  if (isSummary) {
    return (
      <div className="space-y-6">
        <Progress value={100} className="h-1.5" />
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-foreground">
            {isHe ? 'סיכום ואישור' : 'Summary & Confirm'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isHe ? 'בדוק את ההגדרות לפני שמירה' : 'Review your config before saving'}
          </p>
        </div>

        <div className="space-y-2">
          {steps.map(s => {
            const val = answers[s.fieldKey];
            const display = Array.isArray(val) ? val.join(', ') : (val || '—');
            return (
              <div key={s.id} className="flex justify-between items-start p-3 rounded-lg bg-muted/40">
                <span className="text-sm text-muted-foreground">{isHe ? s.titleHe : s.titleEn}</span>
                <span className="text-sm font-medium text-foreground text-end max-w-[60%]">{display}</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <BackIcon className="w-4 h-4" />
            {isHe ? 'חזור' : 'Back'}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            {isHe ? 'שמור והפעל' : 'Save & Activate'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Progress value={progress} className="h-1.5" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Step header */}
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {stepIdx + 1} / {steps.length}
            </p>
            <h2 className="text-xl font-bold text-foreground">
              {isHe ? step.titleHe : step.titleEn}
            </h2>
            {(step.subtitleEn || step.subtitleHe) && (
              <p className="text-sm text-muted-foreground">
                {isHe ? step.subtitleHe : step.subtitleEn}
              </p>
            )}
          </div>

          {/* Options for single select */}
          {step.type === 'single' && step.options && (
            <div className="space-y-2">
              {step.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAnswer(step.fieldKey, opt.value)}
                  className={cn(
                    'w-full p-3.5 rounded-xl border text-start transition-all text-sm font-medium',
                    currentAnswer === opt.value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border/60 bg-card/60 text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {isHe ? opt.labelHe : opt.labelEn}
                </button>
              ))}
            </div>
          )}

          {/* Options for multi select */}
          {step.type === 'multi' && step.options && (
            <div className="space-y-2">
              {step.options.map(opt => {
                const selected = (answers[step.fieldKey] as string[] | undefined)?.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleMulti(step.fieldKey, opt.value)}
                    className={cn(
                      'w-full p-3.5 rounded-xl border text-start transition-all text-sm font-medium flex items-center gap-3',
                      selected
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border/60 bg-card/60 text-muted-foreground hover:border-primary/40'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                      selected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                    )}>
                      {selected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                    {isHe ? opt.labelHe : opt.labelEn}
                  </button>
                );
              })}
            </div>
          )}

          {/* Text input */}
          {step.type === 'text' && (
            <Textarea
              value={answers[step.fieldKey] ?? ''}
              onChange={(e) => setAnswer(step.fieldKey, e.target.value)}
              placeholder={step.placeholder}
              rows={4}
              className="resize-none"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} size="lg" className="flex-1">
          <BackIcon className="w-4 h-4" />
          {stepIdx === 0 ? (isHe ? 'ביטול' : 'Cancel') : (isHe ? 'חזור' : 'Back')}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          size="lg"
          className="flex-1"
        >
          {isLast ? (isHe ? 'סיכום' : 'Review') : (isHe ? 'הבא' : 'Next')}
          <NextIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
