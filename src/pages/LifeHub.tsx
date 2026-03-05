/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Shows the active plan roadmap, or a "Create Plan" CTA when no plan exists.
 */
import { useState } from 'react';
import { Flame, Sparkles, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { DailyMilestones } from '@/components/hubs/DailyMilestones';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { useQueryClient } from '@tanstack/react-query';

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { plan, isLoading } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
  };

  return (
    <div className="flex flex-col w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-6 flex-1 px-1 pt-2">

        {!hasPlan && !isLoading ? (
          /* No plan — show CTA to create one */
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
        ) : (
          /* Has plan — show missions/milestones */
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {isHe ? 'משימות להיום' : "Today's Missions"}
              </h3>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWizardOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isHe ? 'כיול מחדש' : 'Recalibrate'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAddItemOpen(true)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium',
                    'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors'
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isHe ? 'הוסף' : 'Add'}
                </motion.button>
              </div>
            </div>
            <DailyMilestones hub="both" hideHeader />
          </>
        )}
      </div>

      {/* Modals */}
      <StrategyPillarWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onPlanGenerated={handlePlanGenerated}
      />
      <AddItemWizard open={addItemOpen} onOpenChange={setAddItemOpen} hub="core" />
    </div>
  );
}
