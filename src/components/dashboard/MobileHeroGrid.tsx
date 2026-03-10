/**
 * MobileHeroGrid — "Now" page (עכשיו).
 * Each tactical block = a "journey" in today's adventure.
 * No graying, no exact times — just themed quests to tackle.
 */
import { useState, useMemo, useCallback } from 'react';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { useTodayExecution, type ScheduleSlot } from '@/hooks/useTodayExecution';
import { type NowQueueItem } from '@/types/planning';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { PlanNegotiateModal } from '@/components/plan/PlanNegotiateModal';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { Zap, Play, Plus, Loader2, Flame, Target, Trophy, MapPin, Sparkles, Clock, Calendar, Brain, Compass, Swords, Shield, Download, MessageSquare, CheckCircle2, Circle } from 'lucide-react';
import { getQuestName, getCampaignName } from '@/lib/questNames';
import { motion, AnimatePresence } from 'framer-motion';
import { exportNowPDF, type NowExportData, type NowPDFSlot } from '@/utils/exportNowPDF';
import { toast } from 'sonner';

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

// ── Map block types to 4 day quarters ──
const QUARTER_MAP: Record<string, 'q1_morning' | 'q2_midday' | 'q3_afternoon' | 'q4_evening'> = {
  morning: 'q1_morning',
  training: 'q1_morning',
  deepwork: 'q2_midday',
  midday: 'q2_midday',
  admin: 'q3_afternoon',
  social: 'q3_afternoon',
  play: 'q3_afternoon',
  recovery: 'q4_evening',
  evening: 'q4_evening',
};

const QUARTER_META: Record<string, { he: string; en: string; emoji: string }> = {
  q1_morning:   { he: 'רבעון בוקר',        en: 'Morning Quarter',    emoji: '🌅' },
  q2_midday:    { he: 'רבעון צהריים',       en: 'Midday Quarter',     emoji: '☀️' },
  q3_afternoon: { he: 'רבעון אחה״צ',       en: 'Afternoon Quarter',  emoji: '⚡' },
  q4_evening:   { he: 'רבעון ערב',          en: 'Evening Quarter',    emoji: '🌙' },
};

interface MobileHeroGridProps {
  planData: any;
}

export function MobileHeroGrid({ planData }: MobileHeroGridProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { openHypnosis } = useAuroraActions();
  const isHe = language === 'he';

  const { queue, schedule, isLoading, refetch, hasPlan, toggleActionComplete } = useTodayExecution();

  const { plan } = useLifePlanWithMilestones();
  const { statusMap } = useLifeDomains();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyAction, setJourneyAction] = useState<NowQueueItem | null>(null);
  const [_openBlocks, _setOpenBlocks] = useState<Record<string, boolean>>({});
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [negotiateTask, setNegotiateTask] = useState<NowQueueItem | null>(null);
  const [planChatOpen, setPlanChatOpen] = useState(false);

  const currentDay = useMemo(() => {
    return getCurrentDayInIsrael(plan?.start_date);
  }, [plan?.start_date]);

  // No empty-deps memo — must reflect current local date (not stale after midnight)
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [new Date().toDateString()]);

  const questName = useMemo(() => getQuestName(todayStr, isHe ? 'he' : 'en'), [todayStr, isHe]);

  // Generate unique quest name per quarter
  const quarterQuestNames = useMemo(() => ({
    q1_morning: getQuestName(todayStr + '-Q1', isHe ? 'he' : 'en'),
    q2_midday: getQuestName(todayStr + '-Q2', isHe ? 'he' : 'en'),
    q3_afternoon: getQuestName(todayStr + '-Q3', isHe ? 'he' : 'en'),
    q4_evening: getQuestName(todayStr + '-Q4', isHe ? 'he' : 'en'),
  }), [todayStr, isHe]);

  const campaignName = useMemo(() => {
    // Use ISO week as campaign key
    const d = new Date();
    const year = d.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    return getCampaignName(`${year}-W${String(weekNum).padStart(2, '0')}`, isHe ? 'he' : 'en');
  }, [isHe]);

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
    // Hypnosis items open the dedicated hypnosis modal
    if (item.practiceId === 'hypnosis' || item.actionType === 'hypnosis') {
      openHypnosis();
      return;
    }
    if (item.milestoneId) {
      setJourneyAction(item);
      setJourneyOpen(true);
    } else {
      setExecutionAction(item);
      setExecutionOpen(true);
    }
  };

  const handleToggleComplete = useCallback(async (item: NowQueueItem) => {
    await toggleActionComplete(item);
    refetch();
  }, [toggleActionComplete, refetch]);

  // Block toggle removed — tasks are always visible now

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
              onClick={() => navigate('/plan')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'עבור לתוכנית' : 'Go to Plan'}
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


            {/* ── TODAY'S ADVENTURE — Journey Blocks ── */}
            {schedule.length > 0 ? (
              <div className="space-y-2.5">
                {/* Quest Header */}
                <div className="px-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                      {campaignName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">
                        ⚔️ {questName}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        {schedule.length} {isHe ? 'מסלולים' : 'paths'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const quarterOrder = ['q1_morning', 'q2_midday', 'q3_afternoon', 'q4_evening'] as const;
                          const QUARTER_LABELS: Record<string, { he: string; en: string; emoji: string }> = {
                            q1_morning:   { he: 'רבעון בוקר',   en: 'Morning Quarter',   emoji: '🌅' },
                            q2_midday:    { he: 'רבעון צהריים',  en: 'Midday Quarter',    emoji: '☀️' },
                            q3_afternoon: { he: 'רבעון אחה״צ',  en: 'Afternoon Quarter',  emoji: '⚡' },
                            q4_evening:   { he: 'רבעון ערב',    en: 'Evening Quarter',    emoji: '🌙' },
                          };
                          const grouped = new Map<string, typeof schedule>();
                          for (const q of quarterOrder) grouped.set(q, []);
                          for (const slot of schedule) {
                            const q = QUARTER_MAP[slot.timeBlock] || 'q2_midday';
                            grouped.get(q)!.push(slot);
                          }
                          const quarters = quarterOrder.map(qKey => {
                            const slots = grouped.get(qKey)!;
                            const meta = QUARTER_LABELS[qKey];
                            return {
                              key: qKey,
                              label: isHe ? meta.he : meta.en,
                              emoji: meta.emoji,
                              slots: slots.map(s => {
                                const theme = JOURNEY_THEMES[s.timeBlock] || JOURNEY_THEMES.midday;
                                return {
                                  timeBlock: s.timeBlock,
                                  label: theme.he,
                                  labelEn: theme.en,
                                  emoji: theme.emoji,
                                  actions: s.actions.map(a => ({
                                    title: a.title,
                                    titleEn: a.titleEn,
                                    pillarLabel: a.pillarId,
                                    durationMin: a.durationMin,
                                    isTimeBased: a.isTimeBased,
                                  })),
                                };
                              }),
                              totalActions: slots.reduce((s2, sl) => s2 + sl.actions.length, 0),
                              totalMinutes: slots.reduce((s2, sl) => s2 + sl.actions.reduce((t, a) => t + (a.durationMin || 0), 0), 0),
                            };
                          });
                          exportNowPDF({
                            isRTL: isHe,
                            title: isHe ? 'תוכנית יומית' : 'Daily Plan',
                            subtitle: `${totalActions} ${isHe ? 'פעולות' : 'actions'}`,
                            dayLabel: `${isHe ? 'יום' : 'Day'} ${currentDay} / 100`,
                            quarters,
                          });
                          toast.success(isHe ? 'PDF הורד' : 'PDF downloaded');
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                        title={isHe ? 'ייצוא PDF' : 'Export PDF'}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
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
                  </div>
                </div>

                {/* Talk to your plan */}
                <button
                  onClick={() => setPlanChatOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-sm font-medium text-primary"
                >
                  <MessageSquare className="w-4 h-4" />
                  {isHe ? 'דבר עם התוכנית שלך' : 'Talk to Your Plan'}
                </button>

                {/* Journey blocks grouped by 4 Day Quarters */}
                {(() => {
                  // Group schedule slots by quarter
                  const quarterOrder = ['q1_morning', 'q2_midday', 'q3_afternoon', 'q4_evening'] as const;
                  const grouped = new Map<string, typeof schedule>();
                  for (const q of quarterOrder) grouped.set(q, []);
                  for (const slot of schedule) {
                    const q = QUARTER_MAP[slot.timeBlock] || 'q2_midday';
                    grouped.get(q)!.push(slot);
                  }
                  let globalIdx = 0;
                  return quarterOrder.map(qKey => {
                    const slots = grouped.get(qKey)!;
                    if (slots.length === 0) return null;
                    const meta = QUARTER_META[qKey];
                    const qName = quarterQuestNames[qKey];
                    return (
                      <div key={qKey} className="space-y-2">
                        {/* Quarter header */}
                        <div className="flex items-center gap-2 px-1 pt-2">
                          <span className="text-base">{meta.emoji}</span>
                          <span className="text-[11px] font-bold text-foreground/80">
                            {isHe ? meta.he : meta.en}
                          </span>
                          <span className="text-[9px] text-primary/70 font-semibold">
                            ⚔️ {qName}
                          </span>
                          <span className="flex-1 h-px bg-border/30" />
                          <span className="text-[9px] text-muted-foreground">
                            {slots.reduce((s, sl) => s + sl.actions.length, 0)} {isHe ? 'משימות' : 'quests'}
                          </span>
                        </div>
                        {slots.map((slot) => {
                  const blockTheme = JOURNEY_THEMES[slot.timeBlock] || JOURNEY_THEMES.midday;
                  const blockLabel = isHe ? blockTheme.he : blockTheme.en;
                  const idx = globalIdx++;

                  return (
                    <div key={slot.id} className="space-y-1.5">
                      {/* Block sub-header */}
                      <div className="flex items-center gap-2 px-1 pt-1">
                        <span className="text-sm">{blockTheme.emoji}</span>
                        <span className="text-[10px] font-semibold text-foreground/60">{blockLabel}</span>
                        <span className="text-[9px] text-muted-foreground">{slot.actions.length} {isHe ? 'משימות' : 'quests'}</span>
                      </div>

                      {/* Quest list — always visible */}
                      <div className="space-y-1.5">
                        {slot.actions.map((action, i) => {
                          const domain = getDomainById(action.pillarId);
                          const DomainIcon = domain?.icon;
                          return (
                            <motion.div
                              key={`${action.actionType}-${i}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (idx * slot.actions.length + i) * 0.03, duration: 0.25 }}
                            >
                              <button
                                onClick={() => handleExecute(action)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-all border border-border/20 bg-card/60 hover:bg-card hover:border-primary/30 active:scale-[0.99]",
                                  action.completed && "opacity-60"
                                )}
                              >
                                {/* Checkbox */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleComplete(action); }}
                                  className="shrink-0 p-0.5 rounded-full hover:bg-muted/50 transition-colors"
                                  aria-label={action.completed ? 'Mark incomplete' : 'Mark complete'}
                                >
                                  {action.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground/50 hover:text-primary" />
                                  )}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/60 border border-border/40 text-muted-foreground">
                                      {DomainIcon && <DomainIcon className="h-2.5 w-2.5" />}
                                      {isHe ? (domain?.labelHe || action.pillarId) : (domain?.labelEn || action.pillarId)}
                                    </span>
                                  </div>
                                  <p className={cn(
                                    "text-xs font-semibold text-foreground line-clamp-1",
                                    action.completed && "line-through text-muted-foreground"
                                  )}>
                                    {isHe ? action.title : action.titleEn}
                                  </p>
                                </div>
                                {action.isTimeBased && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                                    <Clock className="h-2.5 w-2.5" />
                                    {action.durationMin}{isHe ? '′' : 'm'}
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNegotiateTask(action);
                                    setNegotiateOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-border/30 bg-card/60 hover:bg-primary/10 hover:border-primary/30 transition-colors shrink-0"
                                  title={isHe ? 'דבר עם התוכנית' : 'Talk to plan'}
                                >
                                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                                </button>
                                <Play className="h-3.5 w-3.5 text-foreground/30 shrink-0" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                      </div>
                    );
                  }).filter(Boolean);
                })()}
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
      <PlanNegotiateModal
        open={negotiateOpen}
        onOpenChange={setNegotiateOpen}
        task={negotiateTask}
        onApplied={() => refetch()}
      />
      <PlanChatWizard open={planChatOpen} onOpenChange={setPlanChatOpen} />
    </div>
  );
}
