/**
 * TodayScheduleCard — Shows today's actions grouped by PILLAR.
 * Each pillar section has icon, color, and bilingual label.
 * RTL-aware. Mobile-first.
 */
import { motion } from 'framer-motion';
import { Clock, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { NowQueueItem } from '@/hooks/useNowEngine';
import { Badge } from '@/components/ui/badge';
import { getDomainById, CORE_DOMAINS, ARENA_DOMAINS } from '@/navigation/lifeDomains';
import { useState, useMemo } from 'react';

interface PillarGroup {
  pillarId: string;
  actions: NowQueueItem[];
}

interface TodayScheduleCardProps {
  schedule: any[]; // kept for compat but we use queue directly
  onActionClick: (action: NowQueueItem) => void;
  queue?: NowQueueItem[];
}

const PILLAR_ORDER = [
  ...CORE_DOMAINS.map(d => d.id),
  ...ARENA_DOMAINS.map(d => d.id),
];

const PILLAR_BG: Record<string, string> = {
  consciousness: 'bg-blue-500/10 border-blue-500/30',
  presence: 'bg-fuchsia-500/10 border-fuchsia-500/30',
  power: 'bg-red-500/10 border-red-500/30',
  vitality: 'bg-amber-500/10 border-amber-500/30',
  focus: 'bg-cyan-500/10 border-cyan-500/30',
  combat: 'bg-slate-500/10 border-slate-400/30',
  expansion: 'bg-indigo-500/10 border-indigo-500/30',
  wealth: 'bg-emerald-500/10 border-emerald-500/30',
  influence: 'bg-purple-500/10 border-purple-500/30',
  relationships: 'bg-sky-500/10 border-sky-500/30',
  business: 'bg-rose-500/10 border-rose-500/30',
  projects: 'bg-amber-500/10 border-amber-500/30',
  play: 'bg-violet-500/10 border-violet-500/30',
};

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

export function TodayScheduleCard({ schedule, onActionClick, queue }: TodayScheduleCardProps) {
  const { t, isRTL } = useTranslation();

  // Build pillar groups from queue (preferred) or flatten schedule actions
  const pillarGroups = useMemo(() => {
    const actions = queue && queue.length > 0
      ? queue
      : schedule.flatMap(s => s.actions || []);

    const groupMap = new Map<string, NowQueueItem[]>();
    for (const action of actions) {
      const pid = action.pillarId || 'focus';
      if (!groupMap.has(pid)) groupMap.set(pid, []);
      groupMap.get(pid)!.push(action);
    }

    // Sort by pillar order
    const groups: PillarGroup[] = [];
    for (const pid of PILLAR_ORDER) {
      if (groupMap.has(pid)) {
        groups.push({ pillarId: pid, actions: groupMap.get(pid)! });
        groupMap.delete(pid);
      }
    }
    // Any remaining pillars
    for (const [pid, actions] of groupMap) {
      groups.push({ pillarId: pid, actions });
    }
    return groups;
  }, [queue, schedule]);

  const [expandedPillar, setExpandedPillar] = useState<string | null>(
    pillarGroups[0]?.pillarId || null
  );

  if (pillarGroups.length === 0) return null;

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 px-1">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          {isRTL ? 'המשימות של היום' : "Today's Actions"}
        </h3>
        <span className="text-xs text-muted-foreground ms-auto">
          {pillarGroups.reduce((sum, g) => sum + g.actions.length, 0)} {isRTL ? 'משימות' : 'tasks'}
        </span>
      </div>

      <div className="space-y-2">
        {pillarGroups.map((group, idx) => {
          const domain = getDomainById(group.pillarId);
          const DomainIcon = domain?.icon;
          const isExpanded = expandedPillar === group.pillarId;
          const bgClass = PILLAR_BG[group.pillarId] || 'bg-muted/20 border-border/30';
          const iconColor = PILLAR_ICON_COLOR[group.pillarId] || 'text-muted-foreground';
          const totalMin = group.actions.reduce((sum, a) => sum + a.durationMin, 0);

          return (
            <motion.div
              key={group.pillarId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl overflow-hidden"
            >
              {/* Pillar Header */}
              <button
                onClick={() => setExpandedPillar(isExpanded ? null : group.pillarId)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-3 border transition-all text-start rounded-xl',
                  bgClass,
                  isExpanded && 'rounded-b-none'
                )}
              >
                {DomainIcon && (
                  <div className={cn('shrink-0 p-1.5 rounded-lg bg-background/60', iconColor)}>
                    <DomainIcon className="w-4 h-4" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">
                    {domain ? (isRTL ? domain.labelHe : domain.labelEn) : group.pillarId}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {domain ? (isRTL ? domain.descriptionHe : domain.description) : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {totalMin} {isRTL ? 'ד׳' : 'min'}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {group.actions.length}
                  </Badge>
                  {isExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/50" />
                    : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                  }
                </div>
              </button>

              {/* Action list */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={cn(
                    'border border-t-0 rounded-b-xl px-2 pb-2 pt-1 space-y-1',
                    bgClass.replace('border-', 'border-').split(' ').filter(c => c.startsWith('border-')).join(' '),
                    'bg-card/20'
                  )}
                >
                  {group.actions.map((action, ai) => (
                    <button
                      key={`${action.actionType}-${ai}`}
                      onClick={() => onActionClick(action)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/20 hover:border-primary/30 hover:bg-accent/10 transition-all text-start group"
                    >
                      <div className={cn('shrink-0 w-1.5 h-8 rounded-full', `bg-${domain?.color || 'primary'}-400/60`)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {isRTL ? action.title : action.titleEn}
                        </p>
                        {action.reason && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            {action.reason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {action.durationMin}{isRTL ? 'ד׳' : 'm'}
                        </span>
                        <Play className={cn(
                          "w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors",
                          isRTL && "rotate-180"
                        )} />
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
