/**
 * CoreHub — Body content rendered inside LifeLayoutWrapper.
 * Displays the user's personalized execution grid for Core/ליבה domains.
 */
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { HubPillarsList } from '@/components/hubs/HubPillarsList';
import { DailyMilestones } from '@/components/hubs/DailyMilestones';
import { AddItemWizard } from '@/components/plate/AddItemWizard';

export default function LifeHub() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-6 flex-1 px-1 pt-2">
        <div className="flex justify-start">
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
        <DailyMilestones hub="core" />
        <HubPillarsList hub="core" />
      </div>
      <AddItemWizard open={wizardOpen} onOpenChange={setWizardOpen} hub="core" />
    </div>
  );
}
