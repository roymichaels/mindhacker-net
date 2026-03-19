/**
 * OnboardingAssessments — Sequentially runs DomainAssessChat for each selected pillar.
 * Shows progress and auto-advances to the next pillar when assessment completes.
 * Skips pillars that already have assessment data to avoid re-asking.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import DomainAssessChat from '@/components/domain-assess/DomainAssessChat';
import OnboardingPresenceScan from '@/components/onboarding/OnboardingPresenceScan';
import { getDomainById } from '@/navigation/lifeDomains';
import { CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingAssessmentsProps {
  selectedPillars: string[];
  onComplete: () => void;
  onBack?: () => void;
}

export function OnboardingAssessments({ selectedPillars, onComplete, onBack }: OnboardingAssessmentsProps) {
  const { t, language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { getDomain } = useLifeDomains();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedPillars, setCompletedPillars] = useState<string[]>([]);
  const [checking, setChecking] = useState(true);
  const skipChecked = useRef(false);

  // On mount: detect which pillars already have completed assessments and skip them
  useEffect(() => {
    if (skipChecked.current) return;
    skipChecked.current = true;

    const alreadyDone: string[] = [];
    for (const pillarId of selectedPillars) {
      const row = getDomain(pillarId);
      const config = row?.domain_config as Record<string, any> | null;
      if (config?.completed) {
        alreadyDone.push(pillarId);
      }
    }

    if (alreadyDone.length > 0) {
      setCompletedPillars(alreadyDone);
      // Find first non-completed pillar
      const firstPending = selectedPillars.findIndex(p => !alreadyDone.includes(p));
      if (firstPending === -1) {
        // All pillars already assessed — skip straight to plan generation
        setTimeout(() => onComplete(), 300);
      } else {
        setCurrentIndex(firstPending);
      }
    }
    setChecking(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentPillarId = selectedPillars[currentIndex];
  const allDone = currentIndex >= selectedPillars.length;

  const handlePillarComplete = useCallback(() => {
    const newCompleted = [...completedPillars, currentPillarId];
    setCompletedPillars(newCompleted);

    // Find next non-completed pillar
    let nextIndex = currentIndex + 1;
    while (nextIndex < selectedPillars.length && newCompleted.includes(selectedPillars[nextIndex])) {
      nextIndex++;
    }

    if (nextIndex >= selectedPillars.length) {
      setTimeout(() => onComplete(), 500);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, selectedPillars, currentPillarId, onComplete, completedPillars]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (allDone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
          <h2 className="text-xl font-bold">{t('onboarding.assessments.allComplete')}</h2>
          <p className="text-sm text-muted-foreground">{t('onboarding.assessments.preparingPlan')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress Header */}
      <div className="px-4 pt-4 pb-2 space-y-3 shrink-0 border-b border-border/30">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (currentIndex === 0 && onBack) {
                onBack();
              } else if (currentIndex > 0) {
                let prevIndex = currentIndex - 1;
                while (prevIndex >= 0 && completedPillars.includes(selectedPillars[prevIndex])) {
                  prevIndex--;
                }
                if (prevIndex >= 0) {
                  setCurrentIndex(prevIndex);
                } else if (onBack) {
                  onBack();
                }
              }
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {isHe ? 'חזרה' : 'Back'}
          </button>
          <span className="text-xs text-muted-foreground font-medium">
            {Math.min(completedPillars.length + 1, selectedPillars.length)}/{selectedPillars.length}
          </span>
        </div>
        
        {/* Pillar pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {selectedPillars.map((pillarId, i) => {
            const domain = getDomainById(pillarId);
            const isCompleted = completedPillars.includes(pillarId);
            const isCurrent = i === currentIndex;
            const Icon = domain?.icon;

            return (
              <div
                key={pillarId}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 border transition-all',
                  isCompleted
                    ? 'bg-primary/15 border-primary/30 text-primary'
                    : isCurrent
                      ? 'bg-accent/15 border-accent/30 text-foreground ring-1 ring-primary/50'
                      : 'bg-muted/30 border-border/20 text-muted-foreground/50'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : Icon ? (
                  <Icon className="w-3 h-3" />
                ) : null}
                {isHe ? domain?.labelHe : domain?.labelEn}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assessment — bio-scan for presence, chat for everything else */}
      <div className="flex-1 min-h-0">
        {currentPillarId === 'presence' ? (
          <OnboardingPresenceScan
            key={currentPillarId}
            onComplete={handlePillarComplete}
            onCancel={handlePillarComplete}
          />
        ) : (
          <DomainAssessChat
            key={currentPillarId}
            domainId={currentPillarId}
            asModal
            hideHeader
            onClose={handlePillarComplete}
          />
        )}
      </div>
    </div>
  );
}
