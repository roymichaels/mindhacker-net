/**
 * ArenaHub — Tactics page (טקטיקה).
 * 10-day phase execution plan derived from strategy milestones → mini_milestones.
 * Renders by Day → Block → Action with difficulty badges and XP.
 */
import { useState, useMemo, useCallback } from 'react';
import { Swords, Sparkles, Loader2, Target, Trophy, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Zap, Calendar, BarChart3, RefreshCw, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useAuth } from '@/contexts/AuthContext';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { useQueryClient } from '@tanstack/react-query';
import { useNowEngine, type NowQueueItem } from '@/hooks/useNowEngine';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { useWeeklyTacticalPlan, type DayPlan, type TacticalBlock, type TacticalAction, type BlockCategory, type Difficulty } from '@/hooks/useWeeklyTacticalPlan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BLOCK_ICONS: Record<BlockCategory, typeof Swords> = {
  health: Zap,
  training: Swords,
  focus: Target,
  action: CheckCircle2,
  creation: Sparkles,
  review: BarChart3,
  social: Trophy,
};

const BLOCK_COLORS: Record<BlockCategory, string> = {
  health: 'text-emerald-400',
  training: 'text-red-400',
  focus: 'text-amber-400',
  action: 'text-blue-400',
  creation: 'text-purple-400',
  review: 'text-teal-400',
  social: 'text-pink-400',
};

const DIFFICULTY_STYLES: Record<Difficulty, { bg: string; text: string; label: { he: string; en: string } }> = {
  easy: { bg: 'bg-emerald-500/15', text: 'text-emerald-500', label: { he: 'קל', en: 'Easy' } },
  medium: { bg: 'bg-amber-500/15', text: 'text-amber-500', label: { he: 'בינוני', en: 'Medium' } },
  hard: { bg: 'bg-red-500/15', text: 'text-red-500', label: { he: 'קשה', en: 'Hard' } },
};

export default function ArenaHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { plan, milestones, isLoading: planLoading, currentWeek: currentPhase } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [tacticalRecalibrating, setTacticalRecalibrating] = useState(false);

  const { queue, refetch } = useNowEngine();

  const handleTacticalRecalibrate = useCallback(async () => {
    if (!user?.id || tacticalRecalibrating) return;
    const phaseMilestones = milestones.filter(m => m.week_number === currentPhase);
    if (phaseMilestones.length === 0) return;

    setTacticalRecalibrating(true);
    try {
      const milestoneIds = phaseMilestones.map(m => m.id);
      const { error: delError } = await supabase
        .from('mini_milestones')
        .delete()
        .in('milestone_id', milestoneIds);
      if (delError) throw delError;

      for (let i = 0; i < phaseMilestones.length; i += 3) {
        const batch = phaseMilestones.slice(i, i + 3);
        await Promise.allSettled(
          batch.map(m =>
            supabase.functions.invoke('generate-phase-actions', {
              body: { milestone_id: m.id, user_id: user.id },
            })
          )
        );
      }

      queryClient.invalidateQueries({ queryKey: ['phase-minis-check'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-tactical-minis'] });
      queryClient.invalidateQueries({ queryKey: ['now-engine'] });
      queryClient.invalidateQueries({ queryKey: ['action-items'] });

      toast({ title: isHe ? '✅ הטקטיקה כוילה מחדש' : '✅ Tactics recalibrated' });
    } catch (e) {
      console.error('Tactical recalibration failed:', e);
      toast({ title: isHe ? 'שגיאה בכיול' : 'Recalibration failed', variant: 'destructive' });
    } finally {
      setTacticalRecalibrating(false);
    }
  }, [user?.id, milestones, currentPhase, tacticalRecalibrating, queryClient, toast, isHe]);

  const phasePlan = useWeeklyTacticalPlan();
  const { days, phase, totalActions, completedActions, totalMinutes, generating, isLoading } = phasePlan;

  // Find today's day index within the 10-day phase
  const todayIndex = useMemo(() => {
    const idx = days.findIndex(d => d.isToday);
    return idx >= 0 ? idx : 0;
  }, [days]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const activeDay = selectedDay ?? todayIndex;

  const completionPct = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  const activeDays = days.filter(d => d.totalActions > 0).length;
  const activeBlocks = days.reduce((s, d) => s + d.blocks.length, 0);

  const statItems = [
    { icon: Calendar, value: `${activeDays}/10`, label: isHe ? 'ימים פעילים' : 'Active Days', color: 'text-amber-400' },
    { icon: Target, value: activeBlocks, label: isHe ? 'בלוקים' : 'Blocks', color: 'text-teal-400' },
    { icon: CheckCircle2, value: `${completedActions}/${totalActions}`, label: isHe ? 'פעולות' : 'Actions', color: 'text-orange-400' },
    { icon: Clock, value: `${Math.round(totalMinutes / 10)}′`, label: isHe ? 'דק׳/יום' : 'Min/Day', color: 'text-emerald-400' },
  ];

  const handleToggleAction = async (action: TacticalAction) => {
    const newCompleted = !action.completed;
    const { error } = await supabase
      .from('mini_milestones')
      .update({ is_completed: newCompleted })
      .eq('id', action.id);

    if (error) {
      toast({ title: isHe ? 'שגיאה' : 'Error', variant: 'destructive' });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['weekly-tactical-minis'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    if (newCompleted) {
      toast({ title: isHe ? '✅ בוצע!' : '✅ Done!', description: `+${action.xpReward} XP` });
    }
  };

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-tactical-minis'] });
    queryClient.invalidateQueries({ queryKey: ['phase-minis-check'] });
  };

  return (
    <div className="flex flex-col w-full items-center min-h-[60vh] pb-40" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 max-w-xl w-full px-4 pt-4">

        {!hasPlan && !planLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Swords className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isHe ? 'טרם יצרת תוכנית 100 יום' : 'No 100-Day Plan Yet'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                {isHe ? 'צור אסטרטגיה כדי לראות את הטקטיקה שלך' : 'Create a strategy to see your tactical breakdown'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setWizardOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'צור תוכנית 100 יום' : 'Create 100-Day Plan'}
            </motion.button>
          </div>
        ) : hasPlan ? (
          <>
            {/* ── PHASE STATS ── */}
            <div className="grid grid-cols-4 gap-2">
              {statItems.map((s) => (
                <div key={s.label} className="rounded-xl bg-card border border-border/30 p-2.5 flex flex-col items-center gap-1">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                  <span className="text-sm font-bold text-foreground">{s.value}</span>
                  <span className="text-[9px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            {/* ── PHASE + PROGRESS ── */}
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-destructive/15 border border-destructive/25 flex items-center justify-center">
                    <span className="text-sm font-bold text-destructive">{phase}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      {isHe ? `שלב ${phase} — תוכנית 10 ימים` : `Phase ${phase} — 10-Day Plan`}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {completedActions}/{totalActions} {isHe ? 'משימות' : 'missions'} · {completionPct}%
                    </p>
                  </div>
                  <button
                    onClick={handleTacticalRecalibrate}
                    disabled={tacticalRecalibrating || generating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(204,88%,53%)]/10 border border-[hsl(204,88%,53%)]/25 hover:bg-[hsl(204,88%,53%)]/20 transition-all text-[hsl(204,88%,53%)] text-[11px] font-semibold disabled:opacity-50"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", tacticalRecalibrating && "animate-spin")} />
                    {tacticalRecalibrating
                      ? (isHe ? 'מכייל...' : 'Recalibrating...')
                      : (isHe ? 'כיול מחדש' : 'Recalibrate')}
                  </button>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mt-2.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-destructive to-destructive/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* ── 10-DAY SELECTOR ── */}
              <div className="flex gap-1 px-3 py-2.5 overflow-x-auto no-scrollbar border-b border-border/20">
                {days.map((day) => {
                  const isActive = day.dayIndex === activeDay;
                  const hasActions = day.totalActions > 0;
                  const dayPct = day.totalActions > 0 ? Math.round((day.completedActions / day.totalActions) * 100) : 0;

                  return (
                    <button
                      key={day.dayIndex}
                      onClick={() => setSelectedDay(day.dayIndex)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[38px] relative",
                        isActive
                          ? "bg-destructive/15 border border-destructive/30"
                          : hasActions
                            ? "bg-muted/20 border border-border/20 hover:bg-muted/40"
                            : "bg-transparent border border-transparent opacity-40"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-bold",
                        isActive ? "text-destructive" : "text-foreground/60"
                      )}>
                        {day.dayNumber}
                      </span>
                      <span className={cn(
                        "text-[8px]",
                        isActive ? "text-destructive/70" : "text-muted-foreground"
                      )}>
                        {day.totalActions > 0 ? `${day.completedActions}/${day.totalActions}` : '—'}
                      </span>
                      {day.isToday && (
                        <div className="absolute -top-0.5 -end-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                      {dayPct === 100 && day.totalActions > 0 && (
                        <div className="absolute -top-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── DAY CONTENT ── */}
              <div className="px-4 py-3">
                {(isLoading || generating) && totalActions === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {generating
                        ? (isHe ? 'מייצר תוכנית שלב...' : 'Generating phase plan...')
                        : (isHe ? 'טוען...' : 'Loading...')}
                    </p>
                  </div>
                ) : (
                  <DayView
                    day={days[activeDay]}
                    isHe={isHe}
                    onToggleAction={handleToggleAction}
                  />
                )}
              </div>
            </div>

            {/* ── PHASE OVERVIEW ── */}
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30">
                <h3 className="text-xs font-bold text-foreground/70">
                  {isHe ? 'סקירת עומס שלב' : 'Phase Load Overview'}
                </h3>
              </div>
              <div className="px-4 py-3 space-y-1.5">
                {days.map((day) => {
                  const loadPct = totalMinutes > 0 ? Math.round((day.totalMinutes / (totalMinutes / 10)) * 50) : 0;

                  return (
                    <button
                      key={day.dayIndex}
                      onClick={() => setSelectedDay(day.dayIndex)}
                      className="flex items-center gap-2 w-full hover:bg-muted/10 rounded-lg px-1 py-0.5 transition-colors"
                    >
                      <span className={cn(
                        "text-[10px] w-8 text-start font-medium",
                        day.isToday ? "text-primary font-bold" : "text-muted-foreground"
                      )}>
                        {isHe ? `${day.dayNumber}` : `D${day.dayNumber}`}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            day.completedActions === day.totalActions && day.totalActions > 0
                              ? "bg-emerald-500/60"
                              : day.isToday
                                ? "bg-primary/50"
                                : "bg-foreground/15"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, loadPct)}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground w-8 text-end">
                        {day.totalMinutes > 0 ? `${day.totalMinutes}′` : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <StrategyPillarWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onPlanGenerated={handlePlanGenerated}
      />
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => refetch()}
      />
    </div>
  );
}

// ── Day View Component ──

function DayView({
  day,
  isHe,
  onToggleAction,
}: {
  day: DayPlan;
  isHe: boolean;
  onToggleAction: (action: TacticalAction) => void;
}) {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  if (!day || day.totalActions === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground">
          {isHe ? 'יום מנוחה — אין משימות מתוכננות' : 'Rest day — no missions scheduled'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Day summary */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground/70">
          {isHe ? day.label : day.labelEn}
          {day.isToday && <span className="text-primary ms-1.5 text-[9px]">({isHe ? 'היום' : 'Today'})</span>}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {day.blocks.length} {isHe ? 'בלוקים' : 'blocks'} · {day.totalMinutes}{isHe ? ' דק׳' : ' min'}
        </span>
      </div>

      {/* Blocks */}
      {day.blocks.map((block) => {
        const Icon = BLOCK_ICONS[block.category] || Swords;
        const color = BLOCK_COLORS[block.category] || 'text-foreground/60';
        const isExpanded = expandedBlock === block.id;
        const allDone = block.completedCount === block.actions.length;

        return (
          <div key={block.id} className={cn(
            "rounded-xl border transition-colors",
            allDone
              ? "bg-emerald-500/5 border-emerald-500/15"
              : "bg-muted/10 border-border/20"
          )}>
            {/* Block header */}
            <button
              onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-start"
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                allDone ? "bg-emerald-500/15" : "bg-muted/30"
              )}>
                <Icon className={cn("w-3.5 h-3.5", allDone ? "text-emerald-500" : color)} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-xs font-bold block",
                  allDone ? "text-emerald-600 dark:text-emerald-400" : "text-foreground/80"
                )}>
                  {isHe ? block.title : block.titleEn}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {block.completedCount}/{block.actions.length} · {block.estimatedMinutes}{isHe ? ' דק׳' : ' min'}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/40" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
              )}
            </button>

            {/* Actions */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-2.5 space-y-1">
                    {block.actions.map((action) => {
                      const diffStyle = DIFFICULTY_STYLES[action.difficulty];
                      return (
                        <button
                          key={action.id}
                          onClick={() => onToggleAction(action)}
                          className={cn(
                            "flex items-start gap-2 w-full text-start py-1.5 px-2 rounded-lg transition-colors",
                            action.completed ? "opacity-50" : "hover:bg-muted/20"
                          )}
                        >
                          {action.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-xs leading-snug",
                              action.completed ? "line-through text-muted-foreground" : "text-foreground/80"
                            )}>
                              {isHe ? action.title : (action.titleEn || action.title)}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {/* Difficulty badge */}
                              <span className={cn("text-[8px] font-semibold px-1.5 py-0.5 rounded-full", diffStyle.bg, diffStyle.text)}>
                                {isHe ? diffStyle.label.he : diffStyle.label.en}
                              </span>
                              <span className="text-[8px] text-muted-foreground/50 flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5" />
                                {action.xpReward} XP
                              </span>
                              <span className="text-[8px] text-muted-foreground/50">
                                {action.estimatedMinutes}{isHe ? ' דק׳' : ' min'}
                              </span>
                            </div>
                          </div>
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
  );
}
