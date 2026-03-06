/**
 * MobileHeroGrid — "Now" page (עכשיו).
 * Same layout style as Tactics & Strategy.
 * Roadmap section shows TODAY's daily queue (not phase milestones).
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNowEngine, type NowQueueItem } from '@/hooks/useNowEngine';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { Zap, Play, Plus, Loader2, Flame, Target, Trophy, CheckCircle2, Circle, MapPin, Sparkles, Clock, Calendar } from 'lucide-react';
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
  const remainingQueue = queue.slice(1);

  const { plan } = useLifePlanWithMilestones();
  const { statusMap } = useLifeDomains();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  // Current day
  const currentDay = useMemo(() => {
    if (!plan?.start_date) return 1;
    const diff = Date.now() - new Date(plan.start_date).getTime();
    return Math.max(1, Math.min(100, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [plan?.start_date]);

  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = Object.entries(statusMap).filter(([, s]) => s === 'active' || s === 'configured').length;
  const completedActions = 0; // queue items don't track completion inline
  const totalActions = queue.length;

  const statItems = [
    { icon: Zap, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים' : 'Pillars', color: 'text-amber-400' },
    { icon: Target, value: totalActions, label: isHe ? 'פעולות היום' : "Today's Actions", color: 'text-teal-400' },
    { icon: MapPin, value: `${isHe ? 'יום' : 'Day'} ${currentDay}`, label: isHe ? 'מתוך 100' : 'of 100', color: 'text-orange-400' },
    { icon: Trophy, value: `${Math.round((currentDay / 100) * 100)}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-emerald-400' },
  ];

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  // Group queue by pillar
  const pillarGroups = useMemo(() => {
    const groups: Record<string, NowQueueItem[]> = {};
    for (const item of remainingQueue) {
      const key = item.pillarId || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [remainingQueue]);

  return (
    <div className="flex flex-col w-full items-center min-h-[60vh] pb-40 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 max-w-xl w-full px-4 pt-4">

        {!hasPlan && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isHe ? 'אין תוכנית פעילה' : 'No Active Plan'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                {isHe ? 'צור תוכנית אסטרטגית כדי לקבל את תור הפעולה היומי שלך' : 'Create a strategy plan to get your daily action queue'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/strategy')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'עבור לאסטרטגיה' : 'Go to Strategy'}
            </motion.button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* ── STATS GRID ── */}
            <div className="grid grid-cols-4 gap-2">
              {statItems.map((s) => (
                <div key={s.label} className="rounded-xl bg-card border border-border/30 p-2.5 flex flex-col items-center gap-1">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                  <span className="text-sm font-bold text-foreground">{s.value}</span>
                  <span className="text-[9px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            {/* ── NEXT ACTION HERO CARD ── */}
            {nextAction ? (() => {
              const domain = getDomainById(nextAction.pillarId);
              const Icon = domain?.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl border border-border/40 bg-card px-4 py-2.5 cursor-pointer group active:scale-[0.99] transition-transform"
                  onClick={() => handleExecute(nextAction)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center shrink-0">
                      {Icon && <Icon className="w-4.5 h-4.5 text-foreground/70" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {isHe ? (domain?.labelHe || nextAction.pillarId) : (domain?.labelEn || nextAction.pillarId)}
                        <span className="mx-1.5 text-border">·</span>
                        {nextAction.durationMin} {isHe ? 'דק׳' : 'min'}
                      </p>
                      <h2 className="text-sm font-bold text-foreground leading-snug">
                        {isHe ? nextAction.title : nextAction.titleEn}
                      </h2>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/20 transition-colors">
                      <Play className="w-4 h-4 text-destructive" />
                    </div>
                  </div>
                </motion.div>
              );
            })() : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {isHe ? 'אין פעולה הבאה כרגע' : 'No next action right now'}
              </div>
            )}

            {/* ── DAILY ROADMAP ── */}
            {remainingQueue.length > 0 && (
              <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-border/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground">
                        {isHe ? 'תור הפעולה היומי' : "Today's Action Queue"}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {remainingQueue.length} {isHe ? 'פעולות נוספות' : 'more actions'}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setWizardOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {isHe ? 'הוסף' : 'Add'}
                    </motion.button>
                  </div>
                </div>

                {/* Actions by pillar */}
                <div className="px-4 py-3 space-y-3">
                  {Object.entries(pillarGroups).map(([pillarKey, items]) => {
                    const domain = getDomainById(pillarKey);
                    const Icon = domain?.icon;

                    return (
                      <div key={pillarKey} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center">
                            {Icon ? <Icon className="w-3.5 h-3.5 text-foreground/60" /> : <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
                          </div>
                          <span className="text-xs font-bold text-foreground/80 flex-1">
                            {isHe ? (domain?.labelHe || pillarKey) : (domain?.labelEn || pillarKey)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {items.length}
                          </span>
                        </div>

                        <div className="space-y-0.5 ps-3">
                          {items.map((item, idx) => (
                            <div
                              key={`${item.pillarId}-${idx}`}
                              className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer active:scale-[0.99]"
                              onClick={() => handleExecute(item)}
                            >
                              <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs leading-snug text-foreground/80">
                                  {isHe ? item.title : item.titleEn}
                                </p>
                                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {item.durationMin} {isHe ? 'דק׳' : 'min'}
                                </span>
                              </div>
                              <Play className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddItemWizard open={wizardOpen} onOpenChange={setWizardOpen} hub="core" />
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => refetch()}
      />
    </div>
  );
}
