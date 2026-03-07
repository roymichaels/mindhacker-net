/**
 * MobileHeroGrid — "Now" page (עכשיו).
 * Each tactical block = a "journey" in today's adventure.
 * No graying, no exact times — just themed quests to tackle.
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
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { Zap, Play, Plus, Loader2, Flame, Target, Trophy, MapPin, Sparkles, Clock, Calendar, Brain, ChevronDown, ChevronUp, Compass, Swords, Shield } from 'lucide-react';
import { getQuestName, getCampaignName } from '@/lib/questNames';
import { motion, AnimatePresence } from 'framer-motion';

// ── Adventure-themed block labels ──
const JOURNEY_THEMES: Record<string, { he: string; en: string; emoji: string; accent: string }> = {
  morning:   { he: 'שגרת בוקר',      en: 'Morning Ritual',         emoji: '🌅', accent: 'from-amber-500/15 to-orange-500/10 border-amber-500/25' },
  training:  { he: 'אימון ותנועה',    en: 'Training & Movement',    emoji: '⚔️', accent: 'from-red-500/15 to-rose-500/10 border-red-500/25' },
  deepwork:  { he: 'מיקוד עמוק',      en: 'Deep Focus',             emoji: '🧠', accent: 'from-violet-500/15 to-purple-500/10 border-violet-500/25' },
  midday:    { he: 'פעולה וביצוע',     en: 'Action & Execution',     emoji: '⚡', accent: 'from-sky-500/15 to-blue-500/10 border-sky-500/25' },
  admin:     { he: 'יצירה ובנייה',     en: 'Creation & Building',    emoji: '✨', accent: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/25' },
  recovery:  { he: 'סקירה והתבוננות',  en: 'Review & Reflection',    emoji: '🔮', accent: 'from-indigo-500/15 to-blue-500/10 border-indigo-500/25' },
  social:    { he: 'חיבור ומערכות יחסים', en: 'Connection & Bonds',  emoji: '🤝', accent: 'from-pink-500/15 to-rose-500/10 border-pink-500/25' },
  evening:   { he: 'סיום היום',        en: 'Evening Wind-down',      emoji: '🌙', accent: 'from-slate-500/15 to-zinc-500/10 border-slate-500/25' },
  play:      { he: 'משחק וחקירה',      en: 'Play & Explore',         emoji: '🎮', accent: 'from-lime-500/15 to-green-500/10 border-lime-500/25' },
};

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
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyAction, setJourneyAction] = useState<NowQueueItem | null>(null);
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({});

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
    if (item.milestoneId) {
      setJourneyAction(item);
      setJourneyOpen(true);
    } else {
      setExecutionAction(item);
      setExecutionOpen(true);
    }
  };

  const toggleBlock = (slotId: string) => {
    setOpenBlocks(prev => ({ ...prev, [slotId]: !prev[slotId] }));
  };

  // All blocks start collapsed — user opens what they want
  const isBlockOpen = (slotId: string) => !!openBlocks[slotId];

  return (
    <div className="flex flex-col w-full items-center pb-4" dir={isRTL ? 'rtl' : 'ltr'}>
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

            {/* ── TODAY'S ADVENTURE — Journey Blocks ── */}
            {schedule.length > 0 ? (
              <div className="space-y-2.5">
                {/* Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">
                      {isHe ? 'המסע של היום' : "Today's Journey"}
                    </h3>
                    <span className="text-[10px] text-muted-foreground">
                      {schedule.length} {isHe ? 'מסלולים' : 'paths'}
                    </span>
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

                {/* Journey blocks — all equal, no graying */}
                {schedule.map((slot, idx) => {
                  const theme = JOURNEY_THEMES[slot.timeBlock] || JOURNEY_THEMES.midday;
                  const open = isBlockOpen(slot.id);
                  const label = isHe ? theme.he : theme.en;

                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      className={cn(
                        "rounded-2xl border overflow-hidden transition-all duration-300",
                        `bg-gradient-to-br ${theme.accent}`,
                      )}
                    >
                      {/* Journey Header */}
                      <button
                        onClick={() => toggleBlock(slot.id)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-start hover:bg-foreground/[0.02] active:scale-[0.995] transition-all"
                      >
                        <span className="text-xl shrink-0">{theme.emoji}</span>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-foreground">{label}</h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {slot.actions.length} {isHe ? 'משימות' : 'quests'}
                          </p>
                        </div>

                        {open ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </button>

                      {/* Quest list — collapsible */}
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 space-y-1.5 border-t border-border/15 pt-2">
                              {slot.actions.map((action, i) => {
                                const domain = getDomainById(action.pillarId);
                                const DomainIcon = domain?.icon;
                                return (
                                  <button
                                    key={`${action.actionType}-${i}`}
                                    onClick={() => handleExecute(action)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-all border border-border/20 bg-card/60 hover:bg-card hover:border-primary/30 active:scale-[0.99]"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/60 border border-border/40 text-muted-foreground">
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
                                    <Play className="h-3.5 w-3.5 text-foreground/30 shrink-0" />
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {isHe ? 'אין מסלולים מתוכננים להיום' : 'No journeys planned for today'}
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
      <MilestoneJourneyModal
        open={journeyOpen}
        onOpenChange={setJourneyOpen}
        milestoneId={journeyAction?.milestoneId || null}
        milestoneTitle={journeyAction ? (isHe ? journeyAction.title : journeyAction.titleEn) : ''}
        focusArea={journeyAction?.pillarId || undefined}
        durationMinutes={journeyAction?.durationMin || 30}
        onComplete={() => refetch()}
      />
    </div>
  );
}
