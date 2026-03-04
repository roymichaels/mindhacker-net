/**
 * OnboardingAssessments — Sequentially runs DomainAssessChat for each selected pillar.
 * Shows progress and auto-advances to the next pillar when assessment completes.
 */
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import DomainAssessChat from '@/components/domain-assess/DomainAssessChat';
import OnboardingPresenceScan from '@/components/onboarding/OnboardingPresenceScan';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingAssessmentsProps {
  selectedPillars: string[];
  onComplete: () => void;
}

export function OnboardingAssessments({ selectedPillars, onComplete }: OnboardingAssessmentsProps) {
  const { t, language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedPillars, setCompletedPillars] = useState<string[]>([]);

  const currentPillarId = selectedPillars[currentIndex];
  const currentDomain = getDomainById(currentPillarId);
  const allDone = currentIndex >= selectedPillars.length;

  const handlePillarComplete = useCallback(() => {
    setCompletedPillars(prev => [...prev, currentPillarId]);
    
    if (currentIndex + 1 >= selectedPillars.length) {
      setTimeout(() => onComplete(), 500);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, selectedPillars, currentPillarId, onComplete]);

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
          <h2 className="text-sm font-bold text-foreground">
            {t('onboarding.assessments.pillarAssessment')}
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {currentIndex + 1}/{selectedPillars.length}
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

      {/* Assessment Chat */}
      <div className="flex-1 min-h-0">
        <DomainAssessChat
          key={currentPillarId}
          domainId={currentPillarId}
          asModal
          onClose={handlePillarComplete}
        />
      </div>
    </div>
  );
}