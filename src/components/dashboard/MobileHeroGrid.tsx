/**
 * MobileHeroGrid — "Now" page (עכשיו).
 * Body shows ONLY the next action hero card.
 * Daily roadmap is in the left sidebar.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNowEngine, type NowQueueItem } from '@/hooks/useNowEngine';
import { getDomainById } from '@/navigation/lifeDomains';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Zap, Play, Plus, Loader2, Clock, Crosshair, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileHeroGridProps {
  planData: any;
}

export function MobileHeroGrid({ planData }: MobileHeroGridProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const { queue, isLoading, refetch, hasCoreStrategy, hasArenaStrategy } = useNowEngine();
  const hasPlan = hasCoreStrategy || hasArenaStrategy;
  const nextAction = queue[0] || null;

  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto w-full px-4" dir={isRTL ? 'rtl' : 'ltr'}>

        {!hasPlan && !isLoading ? (
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
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : nextAction ? (() => {
          const domain = getDomainById(nextAction.pillarId);
          const Icon = domain?.icon;
          return (
            <div className="flex flex-col gap-4 w-full">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground/80">
                    {isHe ? 'עכשיו' : 'Now'}
                  </span>
                </div>
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

              {/* Next action hero card */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 cursor-pointer group"
                onClick={() => handleExecute(nextAction)}
              >
                <div className="flex items-center gap-1.5 mb-4">
                  <Crosshair className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {isHe ? 'הפעולה הבאה' : 'Next Action'}
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    {Icon && <Icon className="w-7 h-7 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70 mb-1">
                      {isHe ? (domain?.labelHe || nextAction.pillarId) : (domain?.labelEn || nextAction.pillarId)}
                    </p>
                    <h2 className="text-lg font-bold text-foreground">
                      {isHe ? nextAction.title : nextAction.titleEn}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {nextAction.durationMin} {isHe ? 'דקות' : 'min'}
                      </span>
                    </div>
                    {nextAction.reason && (
                      <p className="text-xs text-muted-foreground/60 mt-1">{nextAction.reason}</p>
                    )}
                  </div>
                  <Play className="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors shrink-0 mt-3" />
                </div>
              </motion.div>

              {/* Remaining queue count */}
              {queue.length > 1 && (
                <p className="text-xs text-muted-foreground text-center">
                  {isHe ? `עוד ${queue.length - 1} פעולות בתור` : `${queue.length - 1} more actions in queue`}
                </p>
              )}
            </div>
          );
        })() : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {isHe ? 'אין פעולות בתור. רענן או הוסף חדשות.' : 'Queue empty. Refresh or add new actions.'}
          </div>
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
