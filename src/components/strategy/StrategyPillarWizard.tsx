/**
 * StrategyPillarWizard — Modal flow for pillar selection + sequential assessment.
 * 1. User selects pillars based on tier limits
 * 2. Clicking a pillar opens DomainAssessModal
 * 3. After finishing assessment, returns to this modal
 * 4. Once all selected pillars are assessed, user can proceed to plan generation
 */
import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DomainAssessModal } from '@/components/domain-assess/DomainAssessModal';
import { useTranslation } from '@/hooks/useTranslation';
import { usePillarAccess } from '@/hooks/usePillarAccess';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CORE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { CheckCircle2, Lock, Loader2, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

const cardBgMap: Record<string, string> = {
  blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/40',
  fuchsia: 'from-fuchsia-500/10 to-fuchsia-600/5 border-fuchsia-500/40',
  red: 'from-red-500/10 to-red-600/5 border-red-500/40',
  amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/40',
  cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/40',
  slate: 'from-slate-500/10 to-slate-600/5 border-slate-500/40',
  indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/40',
  emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/40',
  purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/40',
  sky: 'from-sky-500/10 to-sky-600/5 border-sky-500/40',
  rose: 'from-rose-500/10 to-rose-600/5 border-rose-500/40',
  violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/40',
  teal: 'from-teal-500/10 to-teal-600/5 border-teal-500/40',
};

interface StrategyPillarWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanGenerated?: () => void;
}

// ── Progress screen with animated checks ──
function PlanGenerationProgress({ isHe, isRTL, onError }: {
  isHe: boolean;
  isRTL: boolean;
  onError: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = isHe
    ? ['מנתח תוצאות אבחון...', 'מזהה דפוסים...', 'מחשב סדרי עדיפויות...', 'בונה משימות...', 'יוצר אבני דרך...', 'מכייל פעולות יומיות...', 'מסיים תוכנית...']
    : ['Analyzing assessment results...', 'Identifying patterns...', 'Computing priorities...', 'Building missions...', 'Creating milestones...', 'Calibrating daily actions...', 'Finalizing plan...'];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, currentStep === 0 ? 800 : 1200);
    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary mb-6"
      />

      <h2 className="text-lg font-bold text-foreground mb-1">
        {isHe ? 'בונה את התוכנית שלך...' : 'Building your plan...'}
      </h2>
      <p className="text-xs text-muted-foreground mb-6">
        {isHe ? 'זה יכול לקחת עד דקה' : 'This may take up to a minute'}
      </p>

      <div className="w-full max-w-xs space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{
              opacity: i <= currentStep ? 1 : 0.25,
              x: i <= currentStep ? 0 : (isRTL ? 20 : -20),
            }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm"
          >
            {i < currentStep ? (
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            ) : i === currentStep ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
            ) : (
              <span className="w-4 h-4 shrink-0" />
            )}
            <span className={cn(
              i <= currentStep ? 'text-foreground' : 'text-muted-foreground/50'
            )}>{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function StrategyPillarWizard({ open, onOpenChange, onPlanGenerated }: StrategyPillarWizardProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { selectedPillars, togglePillar, totalLimit, isApex, isPillarSelected } = usePillarAccess();
  const { statusMap, isLoading: domainsLoading } = useLifeDomains();

  const [assessingDomain, setAssessingDomain] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const allSelected = [...selectedPillars.core, ...selectedPillars.arena];
  const selectedCount = allSelected.length;

  // Check which selected pillars have completed assessment
  const assessedPillars = allSelected.filter(id => {
    const status = statusMap[id];
    return status === 'configured' || status === 'active';
  });
  const allAssessed = selectedCount > 0 && assessedPillars.length === selectedCount;

  const handlePillarClick = (domain: LifeDomain) => {
    const isSelected = isPillarSelected(domain.id);
    const status = statusMap[domain.id];
    const isAssessed = status === 'configured' || status === 'active';

    if (isSelected && !isAssessed) {
      setAssessingDomain(domain.id);
    } else if (isSelected && isAssessed) {
      setAssessingDomain(domain.id);
    } else {
      togglePillar(domain.id).then(() => {
        setAssessingDomain(domain.id);
      });
    }
  };

  const handleAssessmentClose = () => {
    setAssessingDomain(null);
  };

  const handleGeneratePlan = async () => {
    if (!user?.id || !allAssessed) return;
    setGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-100day-strategy', {
        body: {
          user_id: user.id,
          hub: 'both',
          force_regenerate: true,
          skip_quality_gate: true,
        },
      });
      if (error) throw error;
      toast.success(isHe ? 'התוכנית נוצרה בהצלחה!' : 'Plan generated successfully!');
      onOpenChange(false);
      onPlanGenerated?.();
    } catch (err: any) {
      console.error('Plan generation error:', err);
      toast.error(isHe ? 'שגיאה ביצירת התוכנית' : 'Failed to generate plan');
      setGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={open && !assessingDomain} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto p-5 gap-0 border-border/50 bg-background/95 backdrop-blur-xl" dir={isRTL ? 'rtl' : 'ltr'}>
          
          {/* ── Generating: show progress screen ── */}
          {generating ? (
            <PlanGenerationProgress isHe={isHe} isRTL={isRTL} onError={() => setGenerating(false)} />
          ) : (
            <>
              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-3 end-3 z-10 p-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="text-center space-y-2 mb-5">
                <h2 className="text-lg font-bold text-foreground">
                  {isHe ? 'בחר את העמודים שלך' : 'Choose Your Pillars'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isHe
                    ? 'בחר עמודים ואבחן אותם לפני יצירת התוכנית'
                    : 'Select pillars and assess them before creating your plan'}
                </p>
              </div>

              {/* Progress bar */}
              {selectedCount > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{isHe ? 'אבחונים שהושלמו' : 'Assessments completed'}</span>
                    <span>{assessedPillars.length}/{selectedCount}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: selectedCount > 0 ? `${(assessedPillars.length / selectedCount) * 100}%` : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Pillar Grid — 3 cols on mobile, 4 on sm+ */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CORE_DOMAINS.map((domain, i) => {
                  const isSelected = isPillarSelected(domain.id);
                  const atLimit = !isApex && selectedCount >= totalLimit;
                  const status = statusMap[domain.id];
                  const isAssessed = status === 'configured' || status === 'active';
                  const Icon = domain.icon;

                  return (
                    <motion.button
                      key={domain.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => handlePillarClick(domain)}
                      disabled={!isSelected && atLimit && !isApex}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl border bg-gradient-to-br p-2.5 text-center transition-all relative',
                        isSelected
                          ? cardBgMap[domain.color]
                          : 'bg-card/20 border-border/20 hover:border-border/40',
                        !isSelected && atLimit && !isApex && 'opacity-30 cursor-not-allowed',
                        isSelected && !isAssessed && 'ring-1 ring-amber-500/50',
                        isSelected && isAssessed && 'ring-1 ring-emerald-500/50'
                      )}
                    >
                      {/* Status badge */}
                      {isSelected && isAssessed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute top-1 end-1" />
                      )}
                      {isSelected && !isAssessed && (
                        <span className="absolute top-1 end-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                      {!isSelected && atLimit && !isApex && (
                        <Lock className="w-3 h-3 text-muted-foreground/40 absolute top-1 end-1" />
                      )}

                      <Icon className={cn('w-5 h-5', isSelected ? domainColorMap[domain.color] : 'text-muted-foreground/50')} />
                      <span className={cn(
                        'text-[10px] font-semibold leading-tight',
                        isSelected ? domainColorMap[domain.color] : 'text-foreground/50'
                      )}>
                        {isHe ? domain.labelHe : domain.labelEn}
                      </span>
                      {isSelected && isAssessed && (
                        <span className="text-[8px] text-emerald-400 font-medium">
                          {isHe ? 'הושלם ✓' : 'Done ✓'}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Generate Plan Button */}
              {allAssessed && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleGeneratePlan}
                  disabled={generating}
                  className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isHe ? 'צור תוכנית 100 יום' : 'Generate 100-Day Plan'}
                </motion.button>
              )}

              {/* Hint when pillars selected but not all assessed */}
              {selectedCount > 0 && !allAssessed && (
                <p className="text-center text-[10px] text-muted-foreground mt-4">
                  {isHe
                    ? 'לחץ על כל עמוד כדי לבצע אבחון. לאחר סיום כל האבחונים תוכל ליצור תוכנית.'
                    : 'Tap each pillar to assess. Once all are done you can generate a plan.'}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assessment Modal — opens when a pillar is clicked */}
      {assessingDomain && (
        <DomainAssessModal
          open={!!assessingDomain}
          onOpenChange={(o) => {
            if (!o) handleAssessmentClose();
          }}
          domainId={assessingDomain}
        />
      )}
    </>
  );
}
