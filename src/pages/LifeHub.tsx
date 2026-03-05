/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Body shows ONLY the current phase summary card.
 * Full 100-day roadmap is in the left sidebar.
 */
import { useState, useMemo } from 'react';
import { Flame, Sparkles, MapPin, Target, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById } from '@/navigation/lifeDomains';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { plan, milestones, isLoading } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);

  // Compute current day/phase
  const currentDay = useMemo(() => {
    if (!plan?.start_date) return 1;
    const diff = Date.now() - new Date(plan.start_date).getTime();
    return Math.max(1, Math.min(100, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [plan?.start_date]);

  const currentPhase = Math.ceil(currentDay / 10);
  const phaseLabel = PHASE_LABELS[(currentPhase || 1) - 1] || '?';

  // Current phase milestones
  const phaseMilestones = useMemo(() => {
    return milestones.filter(m => m.week_number === currentPhase);
  }, [milestones, currentPhase]);

  const phaseCompleted = phaseMilestones.filter(m => m.is_completed).length;
  const phaseTotal = phaseMilestones.length;
  const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

  // Focus areas for current phase
  const focusAreas = useMemo(() => {
    const areas = new Set<string>();
    phaseMilestones.forEach(m => {
      const area = isHe ? m.focus_area : (m.focus_area_en || m.focus_area);
      if (area) areas.add(area);
    });
    return Array.from(areas);
  }, [phaseMilestones, isHe]);

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
  };

  return (
    <div className="flex flex-col w-full items-center justify-center min-h-[60vh]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 max-w-lg w-full px-4">

        {!hasPlan && !isLoading ? (
          /* No plan CTA */
          <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isHe ? 'טרם יצרת תוכנית 100 יום' : 'No 100-Day Plan Yet'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                {isHe
                  ? 'בחר עמודים, אבחן אותם, וצור את תוכנית הטרנספורמציה שלך'
                  : 'Select pillars, assess them, and create your transformation plan'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setWizardOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'צור תוכנית 100 יום' : 'Create 100-Day Plan'}
            </motion.button>
          </div>
        ) : hasPlan ? (
          /* ── CURRENT PHASE SUMMARY CARD ── */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-sm"
          >
            {/* Phase badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary">
                  {isHe ? `שלב ${phaseLabel}` : `Phase ${phaseLabel}`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                  {isHe ? 'עכשיו' : 'NOW'}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWizardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isHe ? 'כיול מחדש' : 'Recalibrate'}
              </motion.button>
            </div>

            {/* Day counter */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{isHe ? `יום ${currentDay} מתוך 100` : `Day ${currentDay} of 100`}</span>
                <span className="font-bold text-primary">{currentDay}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${currentDay}%` }} />
              </div>
            </div>

            {/* Phase progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{isHe ? 'התקדמות בשלב' : 'Phase Progress'}</span>
                <span className="font-bold text-primary">{phaseCompleted}/{phaseTotal}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${phasePct}%` }} />
              </div>
            </div>

            {/* Focus areas */}
            {focusAreas.length > 0 && (
              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {isHe ? 'תחומי מיקוד' : 'Focus Areas'}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {focusAreas.map(area => (
                    <span key={area} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones preview */}
            {phaseMilestones.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {isHe ? 'אבני דרך בשלב' : 'Phase Milestones'}
                </span>
                <div className="mt-1.5 space-y-1">
                  {phaseMilestones.slice(0, 5).map(m => (
                    <div key={m.id} className="flex items-start gap-2">
                      {m.is_completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                      )}
                      <span className={cn(
                        "text-xs leading-snug",
                        m.is_completed ? "line-through text-muted-foreground" : "text-foreground/80"
                      )}>
                        {isHe ? (m.title || m.title_en) : (m.title_en || m.title)}
                      </span>
                    </div>
                  ))}
                  {phaseMilestones.length > 5 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{phaseMilestones.length - 5} {isHe ? 'נוספים' : 'more'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ) : null}
      </div>

      <StrategyPillarWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onPlanGenerated={handlePlanGenerated}
      />
    </div>
  );
}
