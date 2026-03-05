/**
 * ArenaHub — Tactics hub (טקטיקות).
 * Pillar filtering + Daily Milestones. Today's Queue moved to Now page.
 */
import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { DailyMilestones } from '@/components/hubs/DailyMilestones';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

const dotBgMap: Record<string, string> = {
  blue: 'bg-blue-500/15', fuchsia: 'bg-fuchsia-500/15', red: 'bg-red-500/15',
  amber: 'bg-amber-500/15', cyan: 'bg-cyan-500/15', slate: 'bg-slate-500/15',
  indigo: 'bg-indigo-500/15', emerald: 'bg-emerald-500/15', purple: 'bg-purple-500/15',
  sky: 'bg-sky-500/15', rose: 'bg-rose-500/15', violet: 'bg-violet-500/15', teal: 'bg-teal-500/15',
};

export default function ArenaHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  return (
    <div className="flex flex-col w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-5 flex-1 px-1 pt-2">

        {/* Pillar filter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              {isHe ? 'סינון לפי תחום' : 'Filter by Pillar'}
            </h3>
            <div className="flex items-center gap-2">
              {selectedPillar && (
                <button onClick={() => setSelectedPillar(null)} className="text-[10px] text-primary hover:underline">
                  {isHe ? 'הצג הכל' : 'Show All'}
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWizardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {isHe ? 'הוסף' : 'Add'}
              </motion.button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CORE_DOMAINS.map(d => {
              const Icon = d.icon;
              const isActive = selectedPillar === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedPillar(isActive ? null : d.id)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all",
                    isActive
                      ? `${dotBgMap[d.color]} border-current ${domainColorMap[d.color]}`
                      : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("w-3 h-3", isActive && domainColorMap[d.color])} />
                  <span className="hidden sm:inline">{isHe ? d.labelHe : d.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Milestones */}
        <DailyMilestones hub="both" pillarFilter={selectedPillar} />
      </div>

      <AddItemWizard open={wizardOpen} onOpenChange={setWizardOpen} hub="core" />
    </div>
  );
}
