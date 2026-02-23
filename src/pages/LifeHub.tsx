/**
 * CoreHub — Body content rendered inside LifeLayoutWrapper.
 * Displays the user's personalized execution grid for Core/ליבה domains.
 */
import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { DailyMilestones } from '@/components/hubs/DailyMilestones';
import { AddItemWizard } from '@/components/plate/AddItemWizard';

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="flex flex-col w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-6 flex-1 px-1 pt-2">
        {/* Section header with Add button opposite the title */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {isHe ? '⚡ משימות ליבה להיום' : '⚡ Core Missions Today'}
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWizardOpen(true)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium',
              'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            {isHe ? 'הוסף' : 'Add'}
          </motion.button>
        </div>

        <DailyMilestones hub="core" hideHeader />
      </div>
      <AddItemWizard open={wizardOpen} onOpenChange={setWizardOpen} hub="core" />
    </div>
  );
}
