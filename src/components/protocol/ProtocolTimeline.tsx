import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, SkipForward, Lock, Clock, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ProtocolBlock,
  LifeProtocol,
  getBlockTypeColor,
  getBlockTypeIcon,
  formatTimeShort,
  isProtocolLocked,
  useCompleteBlock,
  useSkipBlock,
} from '@/hooks/useLifeProtocol';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Props {
  protocol: LifeProtocol;
  blocks: ProtocolBlock[];
  compliance?: { compliance_pct: number; completed_blocks: number; total_blocks: number } | null;
}

export function ProtocolTimeline({ protocol, blocks, compliance }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const completeBlock = useCompleteBlock();
  const skipBlock = useSkipBlock();
  const locked = isProtocolLocked(protocol);

  // Current time marker
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Find active block
  const activeBlockIdx = useMemo(() => {
    return blocks.findIndex((b) => {
      const [sh, sm] = b.start_time.split(':').map(Number);
      const [eh, em] = b.end_time.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      return nowMinutes >= start && nowMinutes < end;
    });
  }, [blocks, nowMinutes]);

  // Next block countdown
  const nextBlock = useMemo(() => {
    const upcoming = blocks.find((b) => {
      const [sh, sm] = b.start_time.split(':').map(Number);
      return sh * 60 + sm > nowMinutes && !b.is_completed && !b.skipped;
    });
    if (!upcoming) return null;
    const [sh, sm] = upcoming.start_time.split(':').map(Number);
    const diff = sh * 60 + sm - nowMinutes;
    return { block: upcoming, minutesUntil: diff };
  }, [blocks, nowMinutes]);

  const compliancePct = compliance?.compliance_pct ?? 0;
  const completedCount = blocks.filter((b) => b.is_completed).length;
  const totalCount = blocks.length;

  return (
    <div className="space-y-4">
      {/* Header with compliance meter */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold">
            {isHe ? 'פרוטוקול היום' : "Today's Protocol"}
          </h3>
          {locked && (
            <span className="inline-flex items-center gap-1 text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded px-2 py-0.5">
              <Lock className="w-3 h-3" />
              {isHe ? 'נעול' : 'LOCKED'}
            </span>
          )}
        </div>
        <div className="text-end">
          <span className="text-2xl font-bold font-mono tabular-nums">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Compliance bar */}
      <div className="space-y-1">
        <Progress value={(completedCount / Math.max(1, totalCount)) * 100} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{isHe ? 'ציות' : 'Compliance'}</span>
          <span className="font-mono">{Math.round((completedCount / Math.max(1, totalCount)) * 100)}%</span>
        </div>
      </div>

      {/* Next block countdown */}
      {nextBlock && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Timer className="w-4 h-4 text-primary" />
          <span className="text-sm">
            {isHe ? 'הבלוק הבא' : 'Next block'}:{' '}
            <strong>{nextBlock.block.title}</strong>{' '}
            {isHe ? 'בעוד' : 'in'}{' '}
            <span className="font-mono text-primary">
              {nextBlock.minutesUntil >= 60
                ? `${Math.floor(nextBlock.minutesUntil / 60)}h ${nextBlock.minutesUntil % 60}m`
                : `${nextBlock.minutesUntil}m`}
            </span>
          </span>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {blocks.map((block, idx) => {
          const isActive = idx === activeBlockIdx;
          const isPast =
            !block.is_completed &&
            !block.skipped &&
            (() => {
              const [eh, em] = block.end_time.split(':').map(Number);
              return eh * 60 + em < nowMinutes;
            })();
          const typeColor = getBlockTypeColor(block.block_type);
          const icon = getBlockTypeIcon(block.block_type);

          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: isHe ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                'relative flex items-stretch gap-3 py-1',
                isActive && 'z-10'
              )}
            >
              {/* Time column */}
              <div className="w-14 shrink-0 text-end">
                <span className={cn('text-xs font-mono tabular-nums', isActive ? 'text-primary font-bold' : 'text-muted-foreground')}>
                  {formatTimeShort(block.start_time)}
                </span>
              </div>

              {/* Timeline line */}
              <div className="relative flex flex-col items-center w-5 shrink-0">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full border-2 z-10',
                    block.is_completed && 'bg-emerald-500 border-emerald-500',
                    block.skipped && 'bg-muted border-muted-foreground/40',
                    isActive && !block.is_completed && 'bg-primary border-primary animate-pulse',
                    !isActive && !block.is_completed && !block.skipped && 'bg-background border-muted-foreground/30',
                    isPast && !block.is_completed && 'border-destructive/50'
                  )}
                >
                  {block.is_completed && <Check className="w-2 h-2 text-white" />}
                </div>
                {idx < blocks.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 w-px min-h-[24px]',
                      block.is_completed ? 'bg-emerald-500/40' : 'bg-border'
                    )}
                  />
                )}
              </div>

              {/* Block card */}
              <div
                className={cn(
                  'flex-1 rounded-lg border p-3 transition-all',
                  typeColor,
                  isActive && 'ring-2 ring-primary/40 shadow-lg shadow-primary/10',
                  block.is_completed && 'opacity-60',
                  block.skipped && 'opacity-40 line-through'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{icon}</span>
                    <div className="min-w-0">
                      <p className={cn('text-sm font-semibold truncate', block.is_completed && 'line-through')}>
                        {block.title}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider opacity-70 font-mono">
                        {formatTimeShort(block.start_time)}–{formatTimeShort(block.end_time)} · {block.block_type}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {!block.is_completed && !block.skipped && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => completeBlock.mutate({ blockId: block.id, protocolId: block.protocol_id })}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-50 hover:opacity-100"
                        onClick={() => skipBlock.mutate({ blockId: block.id, protocolId: block.protocol_id })}
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                  {block.is_completed && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
                {block.description && (
                  <p className="text-xs mt-1 opacity-70 line-clamp-1">{block.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
