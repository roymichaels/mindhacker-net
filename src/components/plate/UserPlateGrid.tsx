/**
 * UserPlateGrid — Shows everything on the user's plate for a hub (Core or Arena).
 * Includes an "Add" button that opens the AddItemWizard.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserPlate, filterByHub } from '@/hooks/useUserPlate';
import { PlateItemCard } from './PlateItemCard';
import { AddItemWizard } from './AddItemWizard';

interface UserPlateGridProps {
  hub: 'core' | 'arena';
}

export function UserPlateGrid({ hub }: UserPlateGridProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: allItems, isLoading } = useUserPlate();
  const [wizardOpen, setWizardOpen] = useState(false);

  const items = filterByHub(allItems || [], hub);

  const sectionTitle = hub === 'core'
    ? (isHe ? 'מה על הצלחת שלך' : "What's on Your Plate")
    : (isHe ? 'מה על הצלחת שלך' : "What's on Your Plate");

  const emptyMessage = hub === 'core'
    ? (isHe ? 'אין עדיין יעדים אישיים. הוסף את הדבר הראשון!' : 'No personal goals yet. Add your first one!')
    : (isHe ? 'אין עדיין פרויקטים או עסקים. הוסף את הראשון!' : 'No projects or businesses yet. Add your first one!');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {sectionTitle}
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setWizardOpen(true)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium',
            'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          {isHe ? 'הוסף' : 'Add'}
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setWizardOpen(true)}
          className={cn(
            'w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed',
            'border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group'
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </motion.button>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <PlateItemCard key={item.id} item={item} index={i} />
          ))}
          {/* Add more card */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: items.length * 0.03, duration: 0.25 }}
            onClick={() => setWizardOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed',
              'border-muted-foreground/15 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer min-h-[100px]'
            )}
          >
            <Plus className="w-5 h-5 text-muted-foreground/50" />
            <span className="text-[11px] text-muted-foreground/50">
              {isHe ? 'הוסף עוד' : 'Add More'}
            </span>
          </motion.button>
        </div>
      )}

      <AddItemWizard open={wizardOpen} onOpenChange={setWizardOpen} hub={hub} />
    </div>
  );
}
