/**
 * MobileHeroGrid — "Now" page (עכשיו).
 * Derives ALL content from today's tactical schedule blocks.
 * Active block = expanded, past = collapsed/muted, future = collapsed/grayed.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { useTodayExecution, type ScheduleSlot } from '@/hooks/useTodayExecution';
import { type NowQueueItem } from '@/hooks/useNowEngine';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { Zap, Play, Plus, Loader2, Flame, Target, Trophy, CheckCircle2, Circle, MapPin, Sparkles, Clock, Calendar, Brain, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Block category labels ──
const BLOCK_LABELS: Record<string, { he: string; en: string; emoji: string }> = {
  morning:   { he: 'שגרת בוקר', en: 'Morning Routine', emoji: '🌅' },
  training:  { he: 'אימון ותנועה', en: 'Training & Movement', emoji: '💪' },
  deepwork:  { he: 'מיקוד עמוק', en: 'Deep Focus', emoji: '🎯' },
  midday:    { he: 'פעולה', en: 'Action', emoji: '⚡' },
  admin:     { he: 'יצירה', en: 'Creation', emoji: '✨' },
  recovery:  { he: 'סקירה', en: 'Review', emoji: '📊' },
  social:    { he: 'חברתי', en: 'Social', emoji: '🤝' },
  evening:   { he: 'ערב', en: 'Evening', emoji: '🌙' },
  play:      { he: 'משחק', en: 'Play', emoji: '🎮' },
};

function classifySlot(slot: ScheduleSlot, nowStr: string): 'active' | 'past' | 'future' {
  const start = slot.startTime || '00:00';
  const end = slot.endTime || '23:59';
  if (nowStr >= start && nowStr < end) return 'active';
  if (nowStr >= end) return 'past';
  return 'future';
}

interface MobileHeroGridProps {
  planData: any;
}

export function MobileHeroGrid({ planData }: MobileHeroGridProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { openHypnosis } = useAuroraActions();
  const isHe = language === 'he';

  const { queue, schedule, isLoading, refetch, hasPlan } = useTodayExecution();

  const { plan } = useLifePlanWithMilestones();
  const { statusMap } = useLifeDomains();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});

  // Current time string for block classification
  const nowStr = useMemo(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }, []);

  // Current day
  const currentDay = useMemo(() => {
    if (!plan?.start_date) return 1;
    const diff = Date.now() - new Date(plan.start_date).getTime();
    return Math.max(1, Math.min(100, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [plan?.start_date]);

  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = Object.entries(statusMap).filter(([, s]) => s === 'active' || s === 'configured').length;
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

  const toggleBlock = (slotId: string) => {
    setManualOpen(prev => ({ ...prev, [slotId]: !prev[slotId] }));
  };

  const isSlotOpen = (slot: ScheduleSlot) => {
    if (manualOpen[slot.id] !== undefined) return manualOpen[slot.id];
    return classifySlot(slot, nowStr) === 'active';
  };

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

            {/* ── HYPNOSIS SESSION CARD ── */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2.5 cursor-pointer group active:scale-[0.99] transition-transform"
              onClick={openHypnosis}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <Brain className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isHe ? 'סשן מותאם אישית' : 'Personalized Session'}
                  </p>
                  <h2 className="text-sm font-bold text-foreground leading-snug">
                    {isHe ? 'היפנוזה יומית' : 'Daily Hypnosis'}
                  </h2>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                  <Play className="w-4 h-4 text-primary" />
                </div>
              </div>
            </motion.div>

            {/* ── TACTICAL TIME BLOCKS ── */}
            {schedule.length > 0 ? (
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">
                      {isHe ? 'תור הפעולה היומי' : "Today's Action Queue"}
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setWizardOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-primary text-primary-foreground border border-primary/30 hover:bg-primary/90 shadow-sm shadow-primary/20 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {isHe ? 'הוסף' : 'Add'}
                  </motion.button>
                </div>

                {/* Time blocks */}
                {schedule.map((slot) => {
                  const status = classifySlot(slot, nowStr);
                  const isActive = status === 'active';
                  const isPast = status === 'past';
                  const isFuture = status === 'future';
                  const open = isSlotOpen(slot);
                  const blockInfo = BLOCK_LABELS[slot.timeBlock] || BLOCK_LABELS.midday;
                  const label = isHe ? blockInfo.he : blockInfo.en;

                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        "rounded-2xl border overflow-hidden transition-all duration-300",
                        isActive && "border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm",
                        isPast && "border-border/30 bg-muted/20 opacity-60",
                        isFuture && "border-border/20 bg-muted/10 opacity-40",
                      )}
                    >
                      {/* Block Header */}
                      <button
                        onClick={() => toggleBlock(slot.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-start transition-colors",
                          isActive && "hover:bg-primary/5",
                          !isActive && "hover:bg-muted/30",
                        )}
                      >
                        <div className="flex flex-col items-center min-w-[40px]">
                          <span className="text-lg">{blockInfo.emoji}</span>
                          <span className={cn(
                            "text-[10px] font-mono tabular-nums mt-0.5",
                            isActive ? "text-primary font-bold" : "text-muted-foreground",
                          )}>
                            {slot.startTime}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            "text-sm font-semibold",
                            isActive && "text-foreground",
                            isPast && "text-muted-foreground line-through",
                            isFuture && "text-muted-foreground",
                          )}>
                            {label}
                          </h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {slot.actions.length} {isHe ? 'משימות' : 'tasks'}
                            {slot.endTime && ` · ${slot.startTime}–${slot.endTime}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                              <Play className="h-2.5 w-2.5 fill-primary" />
                              {isHe ? 'עכשיו' : 'Now'}
                            </span>
                          )}
                          {isPast && <CheckCircle2 className="h-4 w-4 text-muted-foreground/50" />}
                          {isFuture && <Lock className="h-3.5 w-3.5 text-muted-foreground/30" />}
                          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {/* Block Content — collapsible */}
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 space-y-1.5 border-t border-border/20 pt-2">
                              {slot.actions.map((action, i) => {
                                const domain = getDomainById(action.pillarId);
                                const DomainIcon = domain?.icon;
                                return (
                                  <button
                                    key={`${action.actionType}-${i}`}
                                    onClick={() => handleExecute(action)}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-all",
                                      "border border-border/30 hover:border-primary/30",
                                      isActive
                                        ? "bg-card/80 hover:bg-accent/10 active:scale-[0.99]"
                                        : "bg-card/40",
                                    )}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/60 border border-border/50 text-muted-foreground">
                                          {DomainIcon && <DomainIcon className="h-2.5 w-2.5" />}
                                          {isHe ? (domain?.labelHe || action.pillarId) : (domain?.labelEn || action.pillarId)}
                                        </span>
                                      </div>
                                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                                        {isHe ? action.title : action.titleEn}
                                      </p>
                                    </div>
                                    {action.isTimeBased && (
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                                        <Clock className="h-2.5 w-2.5" />
                                        {action.durationMin}{isHe ? '′' : 'm'}
                                      </span>
                                    )}
                                    {isActive && (
                                      <Play className="h-3.5 w-3.5 text-primary shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {isHe ? 'אין בלוקים מתוכננים להיום' : 'No blocks scheduled for today'}
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