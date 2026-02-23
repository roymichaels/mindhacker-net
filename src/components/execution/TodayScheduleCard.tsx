/**
 * TodayScheduleCard — Scrollable timeline showing time blocks with actions.
 * Uses translation keys only. RTL-aware.
 * Free: 3 blocks | Plus/Apex: hourly blocks
 */
import { motion } from 'framer-motion';
import { Clock, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ScheduleSlot } from '@/hooks/useTodayExecution';
import { NowQueueItem } from '@/hooks/useNowEngine';
import { Badge } from '@/components/ui/badge';
import { getDomainById } from '@/navigation/lifeDomains';
import { useState } from 'react';

interface TodayScheduleCardProps {
  schedule: ScheduleSlot[];
  onActionClick: (action: NowQueueItem) => void;
}

const BLOCK_EMOJIS: Record<string, string> = {
  morning: '🌅', midday: '⚡', evening: '🌙',
  training: '💪', deepwork: '🎯', admin: '📊',
  social: '🤝', recovery: '🧘', play: '🎮',
};

export function TodayScheduleCard({ schedule, onActionClick }: TodayScheduleCardProps) {
  const { t, isRTL } = useTranslation();
  const [expandedBlock, setExpandedBlock] = useState<string | null>(
    schedule.find(s => s.status === 'active')?.id || schedule[0]?.id || null
  );

  if (schedule.length === 0) return null;

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 px-1">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          {t('today.schedule')}
        </h3>
      </div>

      <div className="space-y-1.5">
        {schedule.map((slot, idx) => {
          const isExpanded = expandedBlock === slot.id;
          const isActive = slot.status === 'active';
          const isDone = slot.status === 'done';
          const emoji = BLOCK_EMOJIS[slot.timeBlock] || '📌';

          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <button
                onClick={() => setExpandedBlock(isExpanded ? null : slot.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-start',
                  isActive && 'border-primary/40 bg-primary/10',
                  isDone && 'border-border/20 bg-muted/20 opacity-60',
                  !isActive && !isDone && 'border-border/30 bg-card/40 hover:border-border/50',
                )}
              >
                <div className={cn(
                  'shrink-0 w-2 h-2 rounded-full',
                  isActive && 'bg-primary animate-pulse',
                  isDone && 'bg-muted-foreground/30',
                  !isActive && !isDone && 'bg-muted-foreground/50',
                )} />

                <span className="text-[11px] font-mono text-muted-foreground w-[85px] shrink-0">
                  {slot.startTime} – {slot.endTime}
                </span>

                <span className={cn(
                  'flex-1 text-sm font-medium',
                  isActive && 'text-primary',
                  isDone && 'line-through text-muted-foreground',
                )}>
                  {emoji} {t(slot.labelKey)}
                </span>

                <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                  {slot.actions.length}
                </Badge>

                {slot.actions.length > 0 && (
                  isExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/50" />
                    : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                )}
              </button>

              {isExpanded && slot.actions.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden ms-5 border-s-2 border-border/30 ps-3 mt-1 space-y-1"
                >
                  {slot.actions.map((action, ai) => {
                    const domain = getDomainById(action.pillarId);
                    const DomainIcon = domain?.icon;
                    return (
                      <button
                        key={`${action.actionType}-${ai}`}
                        onClick={() => onActionClick(action)}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-card/30 border border-border/20 hover:border-primary/30 hover:bg-accent/5 transition-all text-start group"
                      >
                        {DomainIcon && <DomainIcon className="w-4 h-4 text-muted-foreground/60 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{isRTL ? action.title : action.titleEn}</p>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {action.durationMin} {t('today.minutesShort')}
                          </span>
                        </div>
                        <Play className={cn(
                          "w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0",
                          isRTL && "rotate-180"
                        )} />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
