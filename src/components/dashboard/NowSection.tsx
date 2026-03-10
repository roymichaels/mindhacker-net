/**
 * NowSection — Quarter-based daily view.
 * Shows tactical blocks grouped into 4 day quarters.
 * No exact times — adventure-themed quarters.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, CheckCircle2, Circle, Sparkles, Loader2, ChevronDown, ChevronUp, Play, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodayExecution, type ScheduleSlot } from '@/hooks/useTodayExecution';
import { type NowQueueItem } from '@/types/planning';
import { getDomainById } from '@/navigation/lifeDomains';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { DailyRoadmap } from '@/components/dashboard/DailyRoadmap';

// ── Quarter labels ──
const QUARTER_LABELS: Record<string, { he: string; en: string; emoji: string }> = {
  morning: { he: 'שגרת בוקר', en: 'Morning Routine', emoji: '🌅' },
  training: { he: 'אימון ותנועה', en: 'Training & Movement', emoji: '💪' },
  deepwork: { he: 'מיקוד עמוק', en: 'Deep Focus', emoji: '🎯' },
  midday: { he: 'פעולה', en: 'Action', emoji: '⚡' },
  admin: { he: 'יצירה', en: 'Creation', emoji: '✨' },
  recovery: { he: 'סקירה', en: 'Review', emoji: '📊' },
  social: { he: 'חברתי', en: 'Social', emoji: '🤝' },
  evening: { he: 'ערב', en: 'Evening', emoji: '🌙' },
  play: { he: 'משחק', en: 'Play', emoji: '🎮' },
};

function PillarBadge({ pillarId, hub }: { pillarId: string; hub: 'core' | 'arena' }) {
  const { language } = useTranslation();
  const domain = getDomainById(pillarId);
  if (!domain) return null;
  const Icon = domain.icon;
  const label = language === 'he' ? domain.labelHe : domain.labelEn;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/60 border border-border/50 text-muted-foreground">
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

// ── Quarter Block Row ──
function QuarterBlockRow({
  slot,
  quarterIndex,
  onToggle,
  isOpen,
  onExecute,
  isHe,
}: {
  slot: ScheduleSlot;
  quarterIndex: number;
  onToggle: () => void;
  isOpen: boolean;
  onExecute: (item: NowQueueItem) => void;
  isHe: boolean;
}) {
  const blockInfo = QUARTER_LABELS[slot.timeBlock] || QUARTER_LABELS.midday;
  const label = isHe ? blockInfo.he : blockInfo.en;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-300",
      "border-border/30 bg-card/50",
    )}>
      {/* Block Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-muted/30 transition-colors"
      >
        {/* Emoji */}
        <div className="flex flex-col items-center min-w-[40px]">
          <span className="text-lg">{blockInfo.emoji}</span>
        </div>

        {/* Title + status */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            {label}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {slot.actions.length} {isHe ? 'משימות' : 'tasks'}
          </p>
        </div>

        {/* Expand/collapse */}
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Block Content — collapsible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1.5 border-t border-border/20 pt-2">
              {slot.actions.map((action, i) => (
                <button
                  key={`${action.actionType}-${i}`}
                  onClick={() => onExecute(action)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-all border border-border/30 hover:border-primary/30 bg-card/80 hover:bg-accent/10 active:scale-[0.99]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <PillarBadge pillarId={action.pillarId} hub={action.hub} />
                      {action.missionTitle && (
                        <span className="text-[9px] text-muted-foreground/60 truncate max-w-[120px]">
                          {action.missionTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{action.title}</p>
                    {action.milestoneTitle && action.milestoneTitle !== action.title && (
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5 line-clamp-1 flex items-center gap-1">
                        <span className="opacity-40">↳</span> {action.milestoneTitle}
                      </p>
                    )}
                  </div>
                  {action.isTimeBased && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      {action.durationMin}{isHe ? '′' : 'm'}
                    </span>
                  )}
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NowSection() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { schedule, isLoading, refetch, hasPlan } = useTodayExecution();
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyAction, setJourneyAction] = useState<NowQueueItem | null>(null);
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});

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
    setManualOpen(prev => ({ ...prev, [slotId]: !prev[slotId] }));
  };

  const isSlotOpen = (slotId: string) => !!manualOpen[slotId];

  if (isLoading) {
    return (
      <Card className="border border-border/50 bg-card/30">
        <CardContent className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{isHe ? 'מחשב את היום שלך...' : 'Computing your day...'}</span>
        </CardContent>
      </Card>
    );
  }

  if (!hasPlan || schedule.length === 0) return null;

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ─── DAY BLOCKS ─── */}
      <div className="space-y-2">
        {schedule.map((slot, idx) => (
          <QuarterBlockRow
            key={slot.id}
            slot={slot}
            quarterIndex={idx}
            onToggle={() => toggleBlock(slot.id)}
            isOpen={isSlotOpen(slot.id)}
            onExecute={handleExecute}
            isHe={isHe}
          />
        ))}
      </div>

      {/* ─── DAILY ROADMAP ─── */}
      <DailyRoadmap />

      {/* Execution Modal (non-milestone actions) */}
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => refetch()}
      />

      {/* Milestone Journey Modal (milestone-backed actions) */}
      <MilestoneJourneyModal
        open={journeyOpen}
        onOpenChange={setJourneyOpen}
        milestoneId={journeyAction?.milestoneId || null}
        milestoneTitle={journeyAction ? (isHe ? journeyAction.title : journeyAction.titleEn) : ''}
        milestoneDescription={journeyAction?.reason || undefined}
        focusArea={journeyAction?.pillarId || undefined}
        durationMinutes={journeyAction?.durationMin || 30}
        onComplete={() => refetch()}
      />
    </div>
  );
}
