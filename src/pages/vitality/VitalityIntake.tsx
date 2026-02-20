/**
 * @tab Life > Vitality
 * @purpose Standalone Vitality intake form using FlowRenderer
 * @data vitalityIntakeSpec, useVitalityEngine
 */
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { FlowRenderer } from '@/components/flow/FlowRenderer';
import { useTranslation } from '@/hooks/useTranslation';
import { useVitalityEngine } from '@/hooks/useVitalityEngine';
import { vitalityIntakeSpec } from '@/flows/vitalityIntakeSpec';
import { buildVitalitySnapshot } from '@/lib/vitality/scoring';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { FlowAnswers } from '@/lib/flow/types';

export default function VitalityIntake() {
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();
  const { config, saveAssessmentFromIntake, isSaving } = useVitalityEngine();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [answers, setAnswers] = useState<FlowAnswers>(() => {
    // Pre-fill from existing intake_answers if retaking
    const existing = (config as any)?.intake_answers;
    return existing ? { ...existing } : {};
  });
  const [completed, setCompleted] = useState(false);

  const steps = vitalityIntakeSpec.steps;
  const currentStep = steps[currentStepIdx];
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleAutoSave = useCallback((data: Record<string, unknown>) => {
    setAnswers(prev => {
      const next: FlowAnswers = { ...prev };
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'string' || typeof v === 'number' || Array.isArray(v)) {
          next[k] = v as string | number | string[];
        }
      }
      return next;
    });
  }, []);

  const handleStepComplete = useCallback((data: Record<string, unknown>) => {
    const merged: FlowAnswers = { ...answers };
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === 'string' || typeof v === 'number' || Array.isArray(v)) {
        merged[k] = v as string | number | string[];
      }
    }
    setAnswers(merged);

    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      handleFinish(merged);
    }
  }, [currentStepIdx, steps.length, answers]);

  const handleFinish = useCallback(async (finalAnswers: FlowAnswers) => {
    try {
      const rawData: Record<string, any> = { ...finalAnswers };
      const assessment = buildVitalitySnapshot(rawData);
      await saveAssessmentFromIntake(assessment, rawData);
      setCompleted(true);
      toast.success(language === 'he' ? 'הסריקה הושלמה!' : 'Scan complete!');
    } catch (err) {
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Error saving');
    }
  }, [saveAssessmentFromIntake, language]);

  if (completed) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <CheckCircle className="w-16 h-16 text-emerald-500" />
          <h2 className="text-2xl font-bold text-foreground">{t('vitality.intakeComplete')}</h2>
          <p className="text-muted-foreground text-center max-w-md">{t('vitality.intakeCompleteDesc')}</p>
          <Button onClick={() => navigate('/life/vitality/results')} className="bg-amber-600 hover:bg-amber-700">
            {t('vitality.viewResults')}
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-4 pb-8 max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (currentStepIdx > 0) {
              setCurrentStepIdx(currentStepIdx - 1);
            } else {
              navigate('/life/vitality');
            }
          }}
          className="gap-1"
        >
          <BackIcon className="w-4 h-4" />
          {t('common.back')}
        </Button>

        <FlowRenderer
          step={currentStep}
          stepNumber={currentStepIdx + 1}
          totalSteps={steps.length}
          savedAnswers={answers}
          allAnswers={answers}
          onAutoSave={handleAutoSave}
          onComplete={handleStepComplete}
          isCompleting={isSaving}
        />
      </div>
    </PageShell>
  );
}
