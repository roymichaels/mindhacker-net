/**
 * NowSection — Time-block based daily view.
 * Shows ALL tactical blocks for the day:
 * - Past blocks: collapsed, muted
 * - Current block (by time): expanded with actions
 * - Future blocks: collapsed, grayed out
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, CheckCircle2, Sparkles, Loader2, ChevronDown, ChevronUp, Play, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodayExecution, type ScheduleSlot } from '@/hooks/useTodayExecution';
import { type NowQueueItem } from '@/hooks/useNowEngine';
import { getDomainById } from '@/navigation/lifeDomains';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { DailyRoadmap } from '@/components/dashboard/DailyRoadmap';

// ── Block category labels ──
const BLOCK_LABELS: Record<string, { he: string; en: string; emoji: string }> = {
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

// ── Time Block Row ──
function TimeBlockRow({
  slot,
  isActive,
  isPast,
  isFuture,
  onToggle,
  isOpen,
  onExecute,
  isHe,
}: {
  slot: ScheduleSlot;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
  onToggle: () => void;
  isOpen: boolean;
  onExecute: (item: NowQueueItem) => void;
  isHe: boolean;
}) {
  const blockInfo = BLOCK_LABELS[slot.timeBlock] || BLOCK_LABELS.midday;
  const completedCount = slot.actions.filter(a => a.sourceId).length; // placeholder
  const label = isHe ? blockInfo.he : blockInfo.en;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-300",
      isActive && "border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm",
      isPast && "border-border/30 bg-muted/20 opacity-60",
      isFuture && "border-border/20 bg-muted/10 opacity-40",
      !isActive && !isPast && !isFuture && "border-border/30 bg-card/50",
    )}>
      {/* Block Header — always visible */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-start transition-colors",
          isActive && "hover:bg-primary/5",
          !isActive && "hover:bg-muted/30",
        )}
      >
        {/* Time + Emoji */}
        <div className="flex flex-col items-center min-w-[40px]">
          <span className="text-lg">{blockInfo.emoji}</span>
          <span className={cn(
            "text-[10px] font-mono tabular-nums mt-0.5",
            isActive ? "text-primary font-bold" : "text-muted-foreground",
          )}>
            {slot.startTime}
          </span>
        </div>

        {/* Title + status */}
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

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
              <Play className="h-2.5 w-2.5 fill-primary" />
              {isHe ? 'עכשיו' : 'Now'}
            </span>
          )}
          {isPast && (
            <CheckCircle2 className="h-4 w-4 text-muted-foreground/50" />
          )}
          {isFuture && (
            <Lock className="h-3.5 w-3.5 text-muted-foreground/30" />
          )}
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
                      <PillarBadge pillarId={action.pillarId} hub={action.hub} />
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{action.title}</p>
                  </div>
                  {action.isTimeBased && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      {action.durationMin}{isHe ? '′' : 'm'}
                    </span>
                  )}
                  {isActive && (
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
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
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});

  // Determine current time to classify blocks
  const now = useMemo(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }, []);

  const classifySlot = (slot: ScheduleSlot) => {
    const start = slot.startTime || '00:00';
    const end = slot.endTime || '23:59';
    if (now >= start && now < end) return 'active';
    if (now >= end) return 'past';
    return 'future';
  };

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  const toggleBlock = (slotId: string) => {
    setManualOpen(prev => ({ ...prev, [slotId]: !prev[slotId] }));
  };

  const isSlotOpen = (slot: ScheduleSlot) => {
    // Manual override takes priority
    if (manualOpen[slot.id] !== undefined) return manualOpen[slot.id];
    // Auto: only active block is open
    return classifySlot(slot) === 'active';
  };

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
        {schedule.map((slot) => {
          const status = classifySlot(slot);
          return (
            <TimeBlockRow
              key={slot.id}
              slot={slot}
              isActive={status === 'active'}
              isPast={status === 'past'}
              isFuture={status === 'future'}
              onToggle={() => toggleBlock(slot.id)}
              isOpen={isSlotOpen(slot)}
              onExecute={handleExecute}
              isHe={isHe}
            />
          );
        })}
      </div>

      {/* ─── DAILY ROADMAP ─── */}
      <DailyRoadmap />

      {/* Execution Modal */}
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => refetch()}
      />
    </div>
  );
}
