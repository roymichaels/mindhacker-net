/**
 * CommandTimeline — Plus/Apex daily execution timeline.
 * Shows schedule blocks ordered by start_time with Start/Done/Skip actions.
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodayBlocks, useDailyCompliance, useToggleBlock, useHasCommandSchedule } from '@/hooks/useCommandSchedule';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, SkipForward, Clock, Play, Dumbbell, Brain, Coffee, Gamepad2, BookOpen, Briefcase, Sunset, Moon, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ScheduleBlock } from '@/services/scheduleBlocks';

const BLOCK_ICONS: Record<string, React.ElementType> = {
  wake: Sunset,
  focus: Brain,
  work: Briefcase,
  training: Dumbbell,
  recovery: Coffee,
  play: Gamepad2,
  learning: BookOpen,
  admin: Briefcase,
  reflection: Moon,
  shutdown: Moon,
  sleep: Moon,
};

const BLOCK_COLORS: Record<string, string> = {
  wake: 'text-amber-500',
  focus: 'text-violet-500',
  work: 'text-blue-500',
  training: 'text-emerald-500',
  recovery: 'text-cyan-500',
  play: 'text-pink-500',
  learning: 'text-indigo-500',
  admin: 'text-slate-500',
  reflection: 'text-purple-500',
  shutdown: 'text-orange-500',
  sleep: 'text-blue-400',
};

export function CommandTimeline() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const hasAccess = useHasCommandSchedule();
  const { data: blocks = [], isLoading } = useTodayBlocks();
  const { data: compliance = 0 } = useDailyCompliance();
  const toggleBlock = useToggleBlock();

  if (!hasAccess || blocks.length === 0) return null;

  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const getBlockStatus = (block: ScheduleBlock) => {
    if (block.status === 'done') return 'done';
    if (block.status === 'skipped') return 'skipped';
    if (block.end_time && block.end_time < currentTimeStr) return 'missed';
    if (block.start_time <= currentTimeStr && (!block.end_time || block.end_time >= currentTimeStr)) return 'active';
    return 'upcoming';
  };

  const handleAction = (id: string, status: 'done' | 'skipped') => {
    toggleBlock.mutate({ id, status });
  };

  const completedCount = blocks.filter(b => b.status === 'done').length;
  const totalCount = blocks.length;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-base font-bold">
            {isHe ? 'לו״ז ביצוע' : 'Command Schedule'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            {completedCount}/{totalCount}
          </span>
          <span className="text-xs font-semibold text-primary">{compliance}%</span>
        </div>
      </div>

      <Progress value={compliance} className="h-1.5 mb-4" />

      {/* Timeline */}
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {blocks.map((block, idx) => {
            const blockType = (block.metadata as any)?.block_type || 'work';
            const status = getBlockStatus(block);
            const Icon = BLOCK_ICONS[blockType] || Clock;
            const colorClass = BLOCK_COLORS[blockType] || 'text-muted-foreground';

            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all',
                  status === 'active' && 'bg-primary/5 border border-primary/20',
                  status === 'done' && 'opacity-50',
                  status === 'skipped' && 'opacity-40',
                  status === 'missed' && 'opacity-60',
                  status === 'upcoming' && 'hover:bg-muted/30',
                )}
              >
                {/* Time */}
                <div className="w-[52px] shrink-0 text-end">
                  <span className="text-xs font-mono text-muted-foreground">
                    {block.start_time?.slice(0, 5)}
                  </span>
                </div>

                {/* Icon */}
                <div className={cn('shrink-0', colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    'text-sm font-medium truncate block',
                    status === 'done' && 'line-through text-muted-foreground',
                  )}>
                    {block.title}
                  </span>
                  {block.end_time && (
                    <span className="text-[10px] text-muted-foreground">
                      {block.start_time?.slice(0, 5)}–{block.end_time?.slice(0, 5)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {(status === 'active' || status === 'upcoming' || status === 'missed') && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleAction(block.id, 'done')}
                        title={isHe ? 'בוצע' : 'Done'}
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleAction(block.id, 'skipped')}
                        title={isHe ? 'דילוג' : 'Skip'}
                      >
                        <SkipForward className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                  {status === 'done' && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                  {status === 'skipped' && (
                    <SkipForward className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
