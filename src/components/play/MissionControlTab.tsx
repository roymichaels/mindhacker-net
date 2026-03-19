/**
 * MissionControlTab — Single unified media player card.
 * No roadmap here (only in queue modal). Queue & Talk buttons flanking controls.
 * Motivation merged into the player card.
 */
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { FocusQueueModal } from './FocusQueueModal';
import { useQueryClient } from '@tanstack/react-query';
import type { NowQueueItem } from '@/types/planning';
import {
  Play, SkipBack, SkipForward, Check,
  ListMusic, MessageSquare, Clock, Flame, Sparkles, Target,
} from 'lucide-react';

function tacticalToNowItem(action: TacticalAction): NowQueueItem {
  return {
    pillarId: action.focusArea || action.blockCategory || 'general',
    hub: 'arena',
    actionType: action.actionType || action.blockCategory || 'milestone',
    title: action.title,
    titleEn: action.titleEn || action.title,
    durationMin: action.estimatedMinutes,
    isTimeBased: action.executionTemplate === 'timer_focus' || action.executionTemplate === 'sets_reps_timer',
    urgencyScore: 80,
    reason: '',
    sourceType: 'milestone',
    sourceId: action.sourceMilestoneId || undefined,
    milestoneId: action.sourceMilestoneId || undefined,
    milestoneTitle: action.title,
    missionId: action.missionId || undefined,
    executionTemplate: (action.executionTemplate as NowQueueItem['executionTemplate']) || undefined,
    completed: !!action.completed,
    calendarDate: action.calendarDate,
  };
}

const PILLAR_META: Record<string, {
  label: string; labelEn: string; color: string;
  motivation: string; motivationEn: string;
  strategy: string; strategyEn: string;
  aim: string; aimEn: string;
  tactic: string; tacticEn: string;
}> = {
  vitality: {
    label: 'חיוניות', labelEn: 'Vitality', color: 'text-rose-400',
    motivation: 'הגוף שלך הוא המקדש — כל תנועה מקרבת אותך לגרסה החזקה ביותר שלך.',
    motivationEn: 'Your body is your temple — every movement brings you closer to your strongest self.',
    strategy: 'אסטרטגיה: בנה את התשתית הביולוגית שמאפשרת ביצוע בכל תחום אחר.',
    strategyEn: 'Strategy: Build the biological infrastructure that enables peak performance across all domains.',
    aim: 'מטרה: להפוך תנועה ותזונה להרגל אוטומטי — לא דבר שדורש החלטה.',
    aimEn: 'Aim: Make movement and nutrition automatic habits — not daily decisions.',
    tactic: 'טקטיקה: התחל עם הדבר הפיזי הראשון ביום. אל תפתח מסך לפני שהגוף זז.',
    tacticEn: 'Tactic: Start with the first physical thing each day. No screens before your body moves.',
  },
  power: {
    label: 'כוח', labelEn: 'Power', color: 'text-orange-400',
    motivation: 'כוח אמיתי נבנה במשמעת היומית. כל חזרה חורטת את הזהות שלך.',
    motivationEn: 'Real power is forged in daily discipline. Each rep sculpts your identity.',
    strategy: 'אסטרטגיה: צבור עוצמה מצטברת — כוח פיזי, נפשי ומעמדי בו-זמנית.',
    strategyEn: 'Strategy: Accumulate compound strength — physical, mental, and positional power simultaneously.',
    aim: 'מטרה: שהיכולת שלך תהיה בלתי ניתנת להתווכחות.',
    aimEn: 'Aim: Make your capability undeniable.',
    tactic: 'טקטיקה: עלה בעומס. כל שבוע קצת יותר ממה שהיה נוח.',
    tacticEn: 'Tactic: Progressive overload. Every week, slightly beyond what was comfortable.',
  },
  focus: {
    label: 'מיקוד', labelEn: 'Focus', color: 'text-sky-400',
    motivation: 'ריכוז הוא כוח-על. 30 דקות של עבודה עמוקה שוות שעות של הסחה.',
    motivationEn: 'Focus is your superpower. 30 minutes of deep work beats hours of distraction.',
    strategy: 'אסטרטגיה: הגן על זמן העבודה העמוקה בכל מחיר — זה המשאב הנדיר ביותר.',
    strategyEn: 'Strategy: Protect deep work time at all costs — it\'s your scarcest resource.',
    aim: 'מטרה: בלוק אחד של 90 דקות ביום ללא הפרעה.',
    aimEn: 'Aim: One uninterrupted 90-minute block per day.',
    tactic: 'טקטיקה: טלפון במצב טיסה. טיימר על השולחן. התחל לפני שאתה מוכן.',
    tacticEn: 'Tactic: Phone on airplane mode. Timer on desk. Start before you feel ready.',
  },
  wealth: {
    label: 'עושר', labelEn: 'Wealth', color: 'text-emerald-400',
    motivation: 'כל פעולה כלכלית חכמה מייצרת תנופה. אתה בונה חופש — צעד אחד בכל פעם.',
    motivationEn: 'Every smart financial move builds momentum. You\'re building freedom — one step at a time.',
    strategy: 'אסטרטגיה: צור ערך אסימטרי — פעולות קטנות עם תשואה גדולה.',
    strategyEn: 'Strategy: Create asymmetric value — small actions with outsized returns.',
    aim: 'מטרה: בנה מנגנון הכנסה שעובד גם כשאתה ישן.',
    aimEn: 'Aim: Build an income mechanism that works while you sleep.',
    tactic: 'טקטיקה: 20 דקות ביום על הדבר שמייצר הכנסה. לא על מה שנראה דחוף.',
    tacticEn: 'Tactic: 20 minutes daily on what generates income. Not what feels urgent.',
  },
  consciousness: {
    label: 'תודעה', labelEn: 'Consciousness', color: 'text-violet-400',
    motivation: 'התודעה שלך היא הכלי הכי חזק. שקט פנימי = בהירות חיצונית.',
    motivationEn: 'Your awareness is your most powerful tool. Inner quiet = outer clarity.',
    strategy: 'אסטרטגיה: פתח את היכולת לצפות במחשבות בלי להגיב אליהן.',
    strategyEn: 'Strategy: Develop the ability to observe thoughts without reacting to them.',
    aim: 'מטרה: 10 דקות של שקט מוחלט ביום — בלי גירויים.',
    aimEn: 'Aim: 10 minutes of absolute stillness daily — zero stimulation.',
    tactic: 'טקטיקה: מיד אחרי שאתה קם. לפני כל מסך, לפני כל שיחה.',
    tacticEn: 'Tactic: Right after waking. Before any screen, before any conversation.',
  },
  combat: {
    label: 'לחימה', labelEn: 'Combat', color: 'text-red-400',
    motivation: 'הלוחם בפנים מתעורר. כל אימון הוא קרב שאתה בוחר לנצח.',
    motivationEn: 'The warrior within is awakening. Every session is a battle you choose to win.',
    strategy: 'אסטרטגיה: בנה יכולת פיזית ומנטלית להתמודד עם לחץ ואי ודאות.',
    strategyEn: 'Strategy: Build physical and mental capacity to handle pressure and uncertainty.',
    aim: 'מטרה: שהלחץ יהפוך לדלק ולא למשתק.',
    aimEn: 'Aim: Transform pressure into fuel, not paralysis.',
    tactic: 'טקטיקה: הכנס לסיטואציה לא נוחה אחת ביום — במודע.',
    tacticEn: 'Tactic: Enter one uncomfortable situation daily — deliberately.',
  },
  expansion: {
    label: 'התרחבות', labelEn: 'Expansion', color: 'text-indigo-400',
    motivation: 'צמיחה קורית מחוץ לאזור הנוחות. לך אל מה שמפחיד — שם הגודל.',
    motivationEn: 'Growth lives outside comfort zones. Step into what scares you — that\'s where greatness lives.',
    strategy: 'אסטרטגיה: הרחב את מפת העולם שלך — אנשים חדשים, מיומנויות חדשות, חוויות חדשות.',
    strategyEn: 'Strategy: Expand your world map — new people, new skills, new experiences.',
    aim: 'מטרה: דבר חדש אחד בשבוע שמאתגר את הזהות הנוכחית.',
    aimEn: 'Aim: One new thing per week that challenges your current identity.',
    tactic: 'טקטיקה: אמור "כן" לדבר הבא שמרגיש לא נוח אבל לא מסוכן.',
    tacticEn: 'Tactic: Say "yes" to the next thing that feels uncomfortable but not dangerous.',
  },
  influence: {
    label: 'השפעה', labelEn: 'Influence', color: 'text-amber-400',
    motivation: 'ההשפעה שלך מתרחבת עם כל פעולה אותנטית. אנשים מרגישים מנהיגות אמיתית.',
    motivationEn: 'Your influence grows with each authentic action. People feel real leadership.',
    strategy: 'אסטרטגיה: בנה אמון דרך עקביות — לא דרך מניפולציה.',
    strategyEn: 'Strategy: Build trust through consistency — not manipulation.',
    aim: 'מטרה: שאנשים יחפשו את הדעה שלך לפני שאתה מציע אותה.',
    aimEn: 'Aim: Have people seek your opinion before you offer it.',
    tactic: 'טקטיקה: תן ערך אחד היום בלי לבקש כלום בחזרה.',
    tacticEn: 'Tactic: Deliver one value today without asking for anything in return.',
  },
  relationships: {
    label: 'מערכות יחסים', labelEn: 'Relationships', color: 'text-pink-400',
    motivation: 'קשרים עמוקים הם העושר האמיתי. תן — וקבל פי עשר.',
    motivationEn: 'Deep connections are true wealth. Give — and receive tenfold in return.',
    strategy: 'אסטרטגיה: השקע באנשים שמרימים אותך — ותרחק ממי שמנקז.',
    strategyEn: 'Strategy: Invest in people who elevate you — distance from those who drain.',
    aim: 'מטרה: שיחה עמוקה אחת ביום עם מישהו שחשוב לך.',
    aimEn: 'Aim: One deep conversation daily with someone who matters.',
    tactic: 'טקטיקה: שאל שאלה אמיתית. הקשב עד הסוף. אל תמהר לפתרונות.',
    tacticEn: 'Tactic: Ask a real question. Listen fully. Don\'t rush to solutions.',
  },
  business: {
    label: 'עסקים', labelEn: 'Business', color: 'text-cyan-400',
    motivation: 'כל פעולה עסקית מחושבת מקרבת אותך לחזון. בנה בסבלנות, פעל בנחישות.',
    motivationEn: 'Every calculated business move brings you closer to your vision. Build patiently, act decisively.',
    strategy: 'אסטרטגיה: מקד את האנרגיה במנוף אחד שמזיז את העסק — לא בעשר משימות שוליות.',
    strategyEn: 'Strategy: Focus energy on the one lever that moves the business — not ten marginal tasks.',
    aim: 'מטרה: תוצאה עסקית מדידה אחת בשבוע.',
    aimEn: 'Aim: One measurable business result per week.',
    tactic: 'טקטיקה: 90 דקות ביום על הדבר שמניע הכנסה. שום דבר אחר לפני.',
    tacticEn: 'Tactic: 90 minutes daily on revenue-driving work. Nothing else before it.',
  },
  projects: {
    label: 'פרויקטים', labelEn: 'Projects', color: 'text-teal-400',
    motivation: 'פרויקטים הם איך שאתה הופך חלומות למציאות. כל שלב קטן מוביל לתוצאה גדולה.',
    motivationEn: 'Projects are how you turn dreams into reality. Every small step leads to a big outcome.',
    strategy: 'אסטרטגיה: שבור כל פרויקט לאבני דרך שבועיות — אף פעם לא "עושים הכל ביום אחד".',
    strategyEn: 'Strategy: Break every project into weekly milestones — never "do it all in one day."',
    aim: 'מטרה: אבן דרך אחת בשבוע שמתקדמת לקו הסיום.',
    aimEn: 'Aim: One milestone per week that moves toward the finish line.',
    tactic: 'טקטיקה: גדיר את הפעולה הקטנה ביותר שאפשר לעשות ב-15 דקות — ועשה אותה עכשיו.',
    tacticEn: 'Tactic: Define the smallest action doable in 15 minutes — and do it now.',
  },
  play: {
    label: 'משחק', labelEn: 'Play', color: 'text-fuchsia-400',
    motivation: 'חיים בלי הנאה הם לא חיים. המשחק מחדד יצירתיות ומחדש אנרגיה.',
    motivationEn: 'A life without joy isn\'t life. Play sharpens creativity and renews energy.',
    strategy: 'אסטרטגיה: שלב הנאה יומית בלוח הזמנים — זה לא בזבוז, זה תחזוקה.',
    strategyEn: 'Strategy: Schedule daily enjoyment — it\'s not waste, it\'s maintenance.',
    aim: 'מטרה: לפחות 20 דקות ביום של משהו שעושה אותך חי.',
    aimEn: 'Aim: At least 20 minutes daily of something that makes you feel alive.',
    tactic: 'טקטיקה: תכנן את ההנאה — אחרת הדחוף תמיד ינצח.',
    tacticEn: 'Tactic: Plan your fun — otherwise urgency always wins.',
  },
};

export function MissionControlTab() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();

  const phasePlan = useWeeklyTacticalPlan();
  const { days, isLoading, toggleActionComplete } = phasePlan as any;

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyAction, setJourneyAction] = useState<TacticalAction | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTaskTitle, setChatTaskTitle] = useState<string | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);

  const todayIndex = useMemo(() => {
    const idx = (days || []).findIndex((d: DayPlan) => d.isToday);
    return idx >= 0 ? idx : 0;
  }, [days]);

  const activeDay = selectedDay ?? todayIndex;
  const activeDayPlan: DayPlan | null = days?.[activeDay] || null;

  const dayActions: TacticalAction[] = useMemo(() => {
    if (!activeDayPlan) return [];
    return [...activeDayPlan.blocks.flatMap((b: any) => b.actions)].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    });
  }, [activeDayPlan]);

  const incompleteActions = dayActions.filter(a => !a.completed);
  const nextAction = incompleteActions[0] || null;
  const completedCount = dayActions.filter(a => a.completed).length;
  const totalCount = dayActions.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const nextIndex = nextAction ? dayActions.indexOf(nextAction) : -1;

  const handleExecute = useCallback((action: TacticalAction) => {
    if (action.sourceMilestoneId) {
      setJourneyAction(action);
      setJourneyOpen(true);
    } else {
      setExecutionAction(tacticalToNowItem(action));
      setExecutionOpen(true);
    }
  }, []);

  const handleTalkToTask = useCallback((taskTitle: string) => {
    setChatTaskTitle(taskTitle);
    setChatOpen(true);
  }, []);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
  }, [queryClient]);

  const currentPillar = nextAction?.focusArea || 'focus';
  const pillarMeta = PILLAR_META[currentPillar] || PILLAR_META.focus;
  const currentTitle = nextAction
    ? (isHe ? nextAction.title : (nextAction.titleEn || nextAction.title))
    : (isHe ? 'כל המשימות הושלמו!' : 'All missions complete!');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ── Single Unified Media Player Card ── */}
        <div className="rounded-2xl border border-border/40 bg-card p-4 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-28 h-28 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            {/* ── Check (complete) button — top start ── */}
            {nextAction && (
              <div className="flex justify-start mb-2">
                <button
                  onClick={() => nextAction && toggleActionComplete?.(nextAction.id, true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-all text-primary text-[10px] font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isHe ? 'סמן כבוצע' : 'Mark Done'}
                </button>
              </div>
            )}

            {/* Now playing info */}
            <div className="text-center mb-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={nextAction?.id || 'done'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mb-0.5">
                    {nextAction ? `${isHe ? 'משימה' : 'Mission'} ${nextIndex + 1}/${totalCount}` : (isHe ? 'סיום' : 'Complete')}
                  </p>
                  <h3 className="text-sm font-bold text-foreground line-clamp-1 px-6">
                    {currentTitle}
                  </h3>
                  {nextAction && (
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className={cn("text-[10px] font-semibold", pillarMeta.color)}>
                        {isHe ? pillarMeta.label : pillarMeta.labelEn}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {nextAction.estimatedMinutes}{isHe ? ' דק׳' : 'min'}
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted/40 rounded-full overflow-hidden mb-3 mx-4">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Controls: Queue | Prev | PLAY | Next | Talk */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setQueueOpen(true)}
                className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all text-primary"
                title={isHe ? 'תור משימות' : 'Task Queue'}
              >
                <ListMusic className="w-4 h-4" />
              </button>

              <button
                onClick={() => { if (nextIndex > 0) handleExecute(dayActions[nextIndex - 1]); }}
                disabled={nextIndex <= 0}
                className="w-9 h-9 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <motion.button
                onClick={() => { if (nextAction) handleExecute(nextAction); }}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "relative w-14 h-14 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-primary via-primary to-secondary",
                  "shadow-[0_0_24px_hsl(var(--primary)/0.4)]",
                  "hover:shadow-[0_0_36px_hsl(var(--primary)/0.6)]",
                  "transition-shadow duration-300",
                  !nextAction && "opacity-60 from-emerald-500 via-emerald-400 to-teal-500"
                )}
              >
                {nextAction ? (
                  <Play className="w-6 h-6 text-primary-foreground ms-0.5" fill="currentColor" />
                ) : (
                  <span className="text-lg">🏆</span>
                )}
              </motion.button>

              <button
                onClick={() => {
                  if (nextAction && incompleteActions.length > 1) handleExecute(incompleteActions[1]);
                }}
                disabled={incompleteActions.length <= 1}
                className="w-9 h-9 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => nextAction && handleTalkToTask(nextAction.title)}
                disabled={!nextAction}
                className="w-9 h-9 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 flex items-center justify-center transition-all text-violet-400 disabled:opacity-30"
                title={isHe ? 'דבר על המשימה' : 'Talk to Task'}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>

            {nextAction && (
              <p className="text-center text-[10px] text-muted-foreground/60 mt-2 font-medium">
                {isHe ? 'לחץ Play להתחלת סשן' : 'Press Play to start session'}
              </p>
            )}

            {/* ── Compressed Motivation + Progress (no scroll needed) ── */}
            {nextAction ? (
              <div className="mt-3 pt-2.5 border-t border-border/20 space-y-2">
                {/* Motivation — single compact line */}
                <div className="flex items-start gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                    {isHe ? pillarMeta.motivation : pillarMeta.motivationEn}
                  </p>
                </div>

                {/* Progress context — compact row */}
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground/60">
                    {completedCount}/{totalCount} {isHe ? 'הושלמו' : 'done'}
                    {incompleteActions.length > 1 && (
                      <> · {incompleteActions.length - 1} {isHe ? 'נותרו' : 'left'}</>
                    )}
                  </span>
                  <span className="font-bold text-foreground/60">
                    {Math.round(progressPct)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 pt-2.5 border-t border-border/20 text-center">
                <div className="text-2xl mb-1">🏆</div>
                <h4 className="text-xs font-bold text-foreground mb-0.5">
                  {isHe ? 'כל המשימות הושלמו!' : 'All Missions Complete!'}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  {isHe ? 'עבודה מדהימה — מחר מגיע עם אתגרים חדשים.' : 'Amazing work — tomorrow brings new challenges.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Focus Queue Modal */}
      <FocusQueueModal
        open={queueOpen}
        onOpenChange={setQueueOpen}
        onExecuteAction={handleExecute}
        onTalkToTask={handleTalkToTask}
      />

      <ExecutionModal open={executionOpen} onOpenChange={setExecutionOpen} action={executionAction} onComplete={invalidateAll} />
      <MilestoneJourneyModal
        open={journeyOpen} onOpenChange={setJourneyOpen}
        milestoneId={journeyAction?.sourceMilestoneId || null}
        milestoneTitle={journeyAction?.title || ''}
        milestoneDescription={journeyAction?.description || undefined}
        focusArea={journeyAction?.focusArea || undefined}
        durationMinutes={journeyAction?.estimatedMinutes || 30}
        onComplete={invalidateAll}
      />
      <PlanChatWizard
        open={chatOpen} onOpenChange={setChatOpen}
        focusDayNumber={activeDayPlan?.dayNumber || null}
        focusTaskTitle={chatTaskTitle}
      />
    </>
  );
}
