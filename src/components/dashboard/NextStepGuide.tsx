/**
 * NextStepGuide — Persistent floating bar showing the next task from today's plan.
 * Time-aware: detects current quarter and surfaces the next incomplete action.
 * Falls back to platform-level guidance when all tasks are done.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodayExecution, type ScheduleSlot } from '@/hooks/useTodayExecution';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useProactiveAurora } from '@/hooks/aurora/useProactiveAurora';
import { useOverdueCount } from '@/hooks/useActionItems';
import { useSmartOnboarding } from '@/contexts/SmartOnboardingContext';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import type { NowQueueItem } from '@/types/planning';
import { Button } from '@/components/ui/button';
import {
  Play, ChevronRight, CheckCircle2, Sparkles, AlertCircle,
  Rocket, Brain, Clock, Zap, ArrowRight, X, MessageCircle,
} from 'lucide-react';

// Quarter detection based on current hour
type Quarter = 'q1_morning' | 'q2_midday' | 'q3_afternoon' | 'q4_evening';

function getCurrentQuarter(): Quarter {
  const hour = new Date().getHours();
  if (hour < 12) return 'q1_morning';
  if (hour < 15) return 'q2_midday';
  if (hour < 19) return 'q3_afternoon';
  return 'q4_evening';
}

const QUARTER_LABELS: Record<Quarter, { he: string; en: string; emoji: string }> = {
  q1_morning:   { he: 'בוקר',     en: 'Morning',    emoji: '🌅' },
  q2_midday:    { he: 'צהריים',   en: 'Midday',     emoji: '☀️' },
  q3_afternoon: { he: 'אחה״צ',   en: 'Afternoon',  emoji: '⚡' },
  q4_evening:   { he: 'ערב',      en: 'Evening',    emoji: '🌙' },
};

const BLOCK_TO_QUARTER: Record<string, Quarter> = {
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

const QUARTER_ORDER: Quarter[] = ['q1_morning', 'q2_midday', 'q3_afternoon', 'q4_evening'];

interface NextStepGuideProps {
  onExecuteTask?: (item: NowQueueItem) => void;
  className?: string;
}

export function NextStepGuide({ onExecuteTask, className }: NextStepGuideProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { smartNavigate } = useSmartOnboarding();
  const { openHypnosis } = useAuroraActions();
  const auroraChat = useAuroraChatContextSafe();
  const [dismissed, setDismissed] = useState(false);

  const { queue, schedule, hasPlan } = useTodayExecution();
  const { isLaunchpadComplete, completionPercentage } = useLaunchpadProgress();
  const { currentItem, hasPendingItems, dismissItem, markItemClicked } = useProactiveAurora();
  const { data: overdueTasks = 0 } = useOverdueCount();

  const currentQuarter = useMemo(() => getCurrentQuarter(), []);

  // Find next incomplete task, prioritizing current quarter then forward
  const nextTask = useMemo(() => {
    if (!schedule.length) return null;

    const currentQIdx = QUARTER_ORDER.indexOf(currentQuarter);

    // Build ordered list: current quarter first, then subsequent, then earlier (wrap around)
    const orderedQuarters = [
      ...QUARTER_ORDER.slice(currentQIdx),
      ...QUARTER_ORDER.slice(0, currentQIdx),
    ];

    for (const q of orderedQuarters) {
      for (const slot of schedule) {
        const slotQuarter = BLOCK_TO_QUARTER[slot.timeBlock] || 'q2_midday';
        if (slotQuarter !== q) continue;
        const incomplete = slot.actions.find(a => !a.completed);
        if (incomplete) return { item: incomplete, quarter: q, slot };
      }
    }
    return null;
  }, [schedule, currentQuarter]);

  // Count progress
  const totalTasks = queue.length;
  const completedTasks = queue.filter(q => q.completed).length;
  const allDone = totalTasks > 0 && completedTasks === totalTasks;

  if (dismissed) return null;

  // ── Determine what to show ──
  const renderContent = () => {
    // P0: Launchpad not complete
    if (!isLaunchpadComplete) {
      return (
        <GuideBar
          emoji="🚀"
          title={isHe ? 'השלם את מסע התודעה' : 'Complete Consciousness Journey'}
          subtitle={isHe ? `${completionPercentage}% הושלמו` : `${completionPercentage}% complete`}
          accentClass="border-purple-500/30 from-purple-500/15 to-indigo-500/10"
          iconColor="text-purple-400"
          actionLabel={isHe ? 'המשך' : 'Continue'}
          onAction={() => smartNavigate()}
          isRTL={isRTL}
        />
      );
    }

    // P0.5: Aurora proactive nudge — dismiss inline, don't navigate away
    if (hasPendingItems && currentItem) {
      return (
        <GuideBar
          emoji="💬"
          title={currentItem.title || (isHe ? 'אורורה רוצה לעזור' : 'Aurora wants to help')}
          subtitle={currentItem.body?.slice(0, 60) || ''}
          accentClass="border-primary/30 from-primary/15 to-accent/10"
          iconColor="text-primary"
          actionLabel={isHe ? 'פתח' : 'Open'}
          actionIcon={<MessageCircle className="w-3.5 h-3.5" />}
          onAction={() => {
            markItemClicked(currentItem.id);
            // Open AION dock inline instead of navigating away
            if (auroraChat) {
              auroraChat.setPendingProactiveMessage(`${currentItem.title}\n\n${currentItem.body}`);
              auroraChat.setIsDockVisible(true);
              auroraChat.setIsChatExpanded(true);
            }
          }}
          onDismiss={() => dismissItem(currentItem.id)}
          isRTL={isRTL}
        />
      );
    }

    // P1: Overdue tasks
    if (overdueTasks > 0) {
      return (
        <GuideBar
          emoji="⚠️"
          title={isHe ? `${overdueTasks} משימות באיחור` : `${overdueTasks} overdue tasks`}
          subtitle={isHe ? 'טפל בהן לפני שממשיכים' : 'Handle these first'}
          accentClass="border-red-500/30 from-red-500/15 to-rose-500/10"
          iconColor="text-red-400"
          actionLabel={isHe ? 'צפה' : 'View'}
          onAction={() => navigate('/play')}
          isRTL={isRTL}
        />
      );
    }

    // P2: Next task from today's plan
    if (nextTask) {
      const qLabel = QUARTER_LABELS[nextTask.quarter];
      const taskTitle = isHe ? nextTask.item.title : (nextTask.item.titleEn || nextTask.item.title);
      const isHypnosis = nextTask.item.practiceId === 'hypnosis' || nextTask.item.actionType === 'hypnosis';

      return (
        <GuideBar
          emoji={qLabel.emoji}
          title={taskTitle}
          subtitle={`${isHe ? qLabel.he : qLabel.en} · ${completedTasks}/${totalTasks} ${isHe ? 'הושלמו' : 'done'}`}
          accentClass="border-primary/30 from-primary/15 to-accent/10"
          iconColor="text-primary"
          actionLabel={isHe ? 'בצע עכשיו' : 'Do Now'}
          actionIcon={<Play className="w-3.5 h-3.5" />}
          onAction={() => {
            if (isHypnosis) {
              openHypnosis();
            } else if (onExecuteTask) {
              onExecuteTask(nextTask.item);
            } else {
              navigate('/play');
            }
          }}
          progress={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
          isRTL={isRTL}
        />
      );
    }

    // P3: All done
    if (allDone && totalTasks > 0) {
      return (
        <GuideBar
          emoji="🏆"
          title={isHe ? 'כל המשימות הושלמו!' : 'All tasks complete!'}
          subtitle={isHe ? 'יום מצוין. שוחח עם AION לתכנון מחר' : 'Great day. Chat with AION to plan tomorrow'}
          accentClass="border-emerald-500/30 from-emerald-500/15 to-teal-500/10"
          iconColor="text-emerald-400"
          actionLabel={isHe ? 'אורורה' : 'Aurora'}
          actionIcon={<Sparkles className="w-3.5 h-3.5" />}
          onAction={() => navigate('/aurora')}
          onDismiss={() => setDismissed(true)}
          isRTL={isRTL}
        />
      );
    }

    // P4: No plan
    if (!hasPlan) {
      return (
        <GuideBar
          emoji="🗺️"
          title={isHe ? 'צור תוכנית 100 יום' : 'Create a 100-day plan'}
          subtitle={isHe ? 'הבסיס לכל התקדמות' : 'The foundation for all progress'}
          accentClass="border-amber-500/30 from-amber-500/15 to-orange-500/10"
          iconColor="text-amber-400"
          actionLabel={isHe ? 'התחל' : 'Start'}
          onAction={() => navigate('/play')}
          isRTL={isRTL}
        />
      );
    }

    // Fallback: Aurora chat
    return (
      <GuideBar
        emoji="✨"
        title={isHe ? 'מה הצעד הבא?' : "What's next?"}
        subtitle={isHe ? 'שוחח עם AION' : 'Chat with AION'}
        accentClass="border-primary/30 from-primary/15 to-accent/10"
        iconColor="text-primary"
        actionLabel={isHe ? 'אורורה' : 'Aurora'}
        onAction={() => navigate('/aurora')}
        onDismiss={() => setDismissed(true)}
        isRTL={isRTL}
      />
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}

// ── Reusable Guide Bar ──
interface GuideBarProps {
  emoji: string;
  title: string;
  subtitle: string;
  accentClass: string;
  iconColor: string;
  actionLabel: string;
  actionIcon?: React.ReactNode;
  onAction: () => void;
  onDismiss?: () => void;
  progress?: number;
  isRTL: boolean;
}

function GuideBar({
  emoji, title, subtitle, accentClass, iconColor,
  actionLabel, actionIcon, onAction, onDismiss, progress, isRTL,
}: GuideBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={cn(
        "relative rounded-2xl border overflow-hidden",
        "bg-gradient-to-br backdrop-blur-sm",
        accentClass,
      )}
    >
      {/* Progress bar */}
      {progress !== undefined && progress > 0 && (
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-muted/30">
          <motion.div
            className="h-full bg-primary/60 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Emoji badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-background/60 border border-border/30 flex items-center justify-center text-lg">
          {emoji}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{subtitle}</p>
        </div>

        {/* Action button */}
        <Button
          size="sm"
          onClick={onAction}
          className="flex-shrink-0 gap-1.5 rounded-xl text-xs font-semibold h-8 px-3"
        >
          {actionIcon}
          {actionLabel}
        </Button>

        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
