/**
 * ArenaHub — Live Execution layer for all 14 pillars.
 * Shows Today Queue (NowEngine), Daily Milestones, with pillar filtering.
 * No assessment/planning — that stays in Core (/life).
 */
import { useState, useMemo } from 'react';
import { Plus, Zap, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNowEngine, useCompleteNowAction, type NowQueueItem } from '@/hooks/useNowEngine';
import { DailyMilestones } from '@/components/hubs/DailyMilestones';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { CORE_DOMAINS, getDomainById } from '@/navigation/lifeDomains';
import { CheckCircle2, Play, Loader2, RefreshCw } from 'lucide-react';

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
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const { queue, isLoading, refetch, tier, energyLevel, dayIntensity, hasCoreStrategy, hasArenaStrategy } = useNowEngine();
  const completeMutation = useCompleteNowAction();
  const hasPlan = hasCoreStrategy || hasArenaStrategy;

  // Filter queue by selected pillar
  const filteredQueue = useMemo(() => {
    if (!selectedPillar) return queue;
    return queue.filter(item => item.pillarId === selectedPillar);
  }, [queue, selectedPillar]);

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  return (
    <div className="flex flex-col w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-5 flex-1 px-1 pt-2">

        {hasPlan && (<>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              {isHe ? 'סינון לפי תחום' : 'Filter by Pillar'}
            </h3>
            {selectedPillar && (
              <button
                onClick={() => setSelectedPillar(null)}
                className="text-[10px] text-primary hover:underline"
              >
                {isHe ? 'הצג הכל' : 'Show All'}
              </button>
            )}
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

        {/* ── Today Queue (NowEngine) ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              {isHe ? '⚡ תור הפעולה של היום' : '⚡ Today\'s Action Queue'}
            </h3>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refetch()}
                disabled={isLoading}
                className="p-1.5 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                title={isHe ? 'רענן' : 'Refresh'}
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /> : <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />}
              </motion.button>
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
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              {selectedPillar
                ? (isHe ? 'אין פעולות לתחום זה היום' : 'No actions for this pillar today')
                : (isHe ? 'אין פעולות בתור. רענן או הוסף חדשות.' : 'Queue empty. Refresh or add new actions.')
              }
            </div>
          ) : (
            <div className="space-y-2">
              {filteredQueue.map((item, idx) => {
                const domain = getDomainById(item.pillarId);
                const Icon = domain?.icon;
                const color = domain?.color || 'amber';
                return (
                  <motion.div
                    key={`${item.pillarId}-${item.title}-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all group cursor-pointer hover:shadow-sm",
                      "bg-card/60 border-border/40 hover:border-primary/30"
                    )}
                    onClick={() => handleExecute(item)}
                  >
                    {/* Pillar icon */}
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", dotBgMap[color])}>
                      {Icon && <Icon className={cn("w-4 h-4", domainColorMap[color])} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", domainColorMap[color])}>
                          {isHe ? (domain?.labelHe || item.pillarId) : (domain?.labelEn || item.pillarId)}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {item.durationMin}{isHe ? 'ד' : 'm'}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-snug truncate">
                        {isHe ? item.title : item.titleEn}
                      </p>
                      {item.reason && (
                        <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{item.reason}</p>
                      )}
                    </div>

                    {/* Execute button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Play className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        </>)}
        <div className="flex flex-col gap-2">
          <DailyMilestones hub="both" />
        </div>
      </div>

      <AddItemWizard open={wizardOpen} onOpenChange={setWizardOpen} hub="core" />

      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => {}}
      />
    </div>
  );
}
