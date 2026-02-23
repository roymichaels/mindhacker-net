/**
 * TodayScheduleCard — Shows today's actions as a 3-column grid of cards.
 * Each card shows pillar badge, title, and duration.
 * RTL-aware. Mobile-first.
 */
import { motion } from 'framer-motion';
import { Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { NowQueueItem } from '@/hooks/useNowEngine';
import { getDomainById, CORE_DOMAINS, ARENA_DOMAINS } from '@/navigation/lifeDomains';
import { useMemo } from 'react';

interface TodayScheduleCardProps {
  schedule: any[];
  onActionClick: (action: NowQueueItem) => void;
  queue?: NowQueueItem[];
}

const PILLAR_ICON_COLOR: Record<string, string> = {
  consciousness: 'text-blue-400',
  presence: 'text-fuchsia-400',
  power: 'text-red-400',
  vitality: 'text-amber-400',
  focus: 'text-cyan-400',
  combat: 'text-slate-300',
  expansion: 'text-indigo-400',
  wealth: 'text-emerald-400',
  influence: 'text-purple-400',
  relationships: 'text-sky-400',
  business: 'text-rose-400',
  projects: 'text-amber-400',
  play: 'text-violet-400',
};

const PILLAR_ACCENT: Record<string, string> = {
  consciousness: 'border-blue-500/30 hover:border-blue-500/50',
  presence: 'border-fuchsia-500/30 hover:border-fuchsia-500/50',
  power: 'border-red-500/30 hover:border-red-500/50',
  vitality: 'border-amber-500/30 hover:border-amber-500/50',
  focus: 'border-cyan-500/30 hover:border-cyan-500/50',
  combat: 'border-slate-400/30 hover:border-slate-400/50',
  expansion: 'border-indigo-500/30 hover:border-indigo-500/50',
  wealth: 'border-emerald-500/30 hover:border-emerald-500/50',
  influence: 'border-purple-500/30 hover:border-purple-500/50',
  relationships: 'border-sky-500/30 hover:border-sky-500/50',
  business: 'border-rose-500/30 hover:border-rose-500/50',
  projects: 'border-amber-500/30 hover:border-amber-500/50',
  play: 'border-violet-500/30 hover:border-violet-500/50',
};

export function TodayScheduleCard({ schedule, onActionClick, queue }: TodayScheduleCardProps) {
  const { isRTL } = useTranslation();

  const allActions = useMemo(() => {
    return queue && queue.length > 0
      ? queue
      : schedule.flatMap(s => s.actions || []);
  }, [queue, schedule]);

  if (allActions.length === 0) return null;

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 px-1">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          {isRTL ? 'המשימות של היום' : "Today's Actions"}
        </h3>
        <span className="text-xs text-muted-foreground ms-auto">
          {allActions.length} {isRTL ? 'משימות' : 'tasks'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allActions.map((action, i) => {
          const domain = getDomainById(action.pillarId);
          const DomainIcon = domain?.icon;
          const iconColor = PILLAR_ICON_COLOR[action.pillarId] || 'text-muted-foreground';
          const accentBorder = PILLAR_ACCENT[action.pillarId] || 'border-border/40 hover:border-primary/30';

          return (
            <motion.button
              key={`${action.actionType}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onActionClick(action)}
              className={cn(
                'flex flex-col gap-2 p-3 rounded-xl bg-card/50 border text-start',
                'hover:bg-accent/10 transition-all group',
                accentBorder
              )}
            >
              <div className="flex items-center justify-between">
                {DomainIcon && (
                  <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/60 border border-border/50', iconColor)}>
                    <DomainIcon className="h-3 w-3" />
                    {domain ? (isRTL ? domain.labelHe : domain.labelEn) : action.pillarId}
                  </span>
                )}
                <Play className={cn(
                  "w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0",
                  isRTL && "rotate-180"
                )} />
              </div>
              <p className="text-xs font-semibold leading-tight line-clamp-2">
                {isRTL ? action.title : action.titleEn}
              </p>
              <div className="flex items-center gap-1.5 mt-auto">
                <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {action.durationMin} {isRTL ? 'דק׳' : 'min'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
