/**
 * MobileHeroGrid — "Now" page (עכשיו).
 * Shows Today's Action Queue only when a plan exists.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNowEngine, type NowQueueItem } from '@/hooks/useNowEngine';
import { getDomainById } from '@/navigation/lifeDomains';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { DailyMilestones } from '@/components/hubs/DailyMilestones';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Zap, Play, Plus, Loader2, RefreshCw, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface MobileHeroGridProps {
  planData: any;
}

export function MobileHeroGrid({ planData }: MobileHeroGridProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const { queue, isLoading, refetch, hasCoreStrategy, hasArenaStrategy } = useNowEngine();
  const hasPlan = hasCoreStrategy || hasArenaStrategy;

  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pb-8" dir={isRTL ? 'rtl' : 'ltr'}>

        {!hasPlan && !isLoading ? (
          /* No plan — show empty state prompting user to create a strategy */
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Flame className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {isHe ? 'אין תוכנית פעילה' : 'No Active Plan'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {isHe
                  ? 'צור תוכנית אסטרטגית כדי לקבל את תור הפעולה היומי שלך'
                  : 'Create a strategy plan to get your daily action queue'}
              </p>
            </div>
            <button
              onClick={() => navigate('/strategy')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isHe ? 'עבור לאסטרטגיה' : 'Go to Strategy'}
            </button>
          </div>
        ) : (
          <>
            {/* ── Header: משימות להיום ── */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                {isHe ? 'משימות להיום' : "Today's Missions"}
              </h3>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /> : <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />}
                </motion.button>
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

            {/* ── Today's Action Queue ── */}
            <div className="flex flex-col gap-3">

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : queue.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  {isHe ? 'אין פעולות בתור. רענן או הוסף חדשות.' : 'Queue empty. Refresh or add new actions.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((item, idx) => {
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
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", dotBgMap[color])}>
                          {Icon && <Icon className={cn("w-4 h-4", domainColorMap[color])} />}
                        </div>
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
                        <Play className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Daily Milestones */}
            <DailyMilestones hub="both" />
          </>
        )}

        {/* Modals */}
        <AddItemWizard open={wizardOpen} onOpenChange={setWizardOpen} hub="core" />
        <ExecutionModal
          open={executionOpen}
          onOpenChange={setExecutionOpen}
          action={executionAction}
          onComplete={() => refetch()}
        />
      </div>
    </PageShell>
  );
}
