/**
 * PlateItemCard — Displays a single item from the user's plate.
 */
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, Briefcase, Target, Repeat, Flag, CheckSquare } from 'lucide-react';
import type { PlateItem, PlateItemType } from '@/hooks/useUserPlate';
import { getDomainById } from '@/navigation/lifeDomains';
import { useTranslation } from '@/hooks/useTranslation';

const typeIcons: Record<PlateItemType, typeof FolderKanban> = {
  project: FolderKanban,
  business: Briefcase,
  goal: Target,
  habit: Repeat,
  milestone: Flag,
  task: CheckSquare,
};

const typeLabels: Record<PlateItemType, { he: string; en: string }> = {
  project: { he: 'פרויקט', en: 'Project' },
  business: { he: 'עסק', en: 'Business' },
  goal: { he: 'יעד', en: 'Goal' },
  habit: { he: 'הרגל', en: 'Habit' },
  milestone: { he: 'אבן דרך', en: 'Milestone' },
  task: { he: 'משימה', en: 'Task' },
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  todo: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  doing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  complete: 'bg-muted text-muted-foreground border-border/30',
  paused: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

interface PlateItemCardProps {
  item: PlateItem;
  index: number;
  onClick?: () => void;
}

export function PlateItemCard({ item, index, onClick }: PlateItemCardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const Icon = typeIcons[item.type] || Target;
  const domain = item.pillar ? getDomainById(item.pillar) : null;
  const DomainIcon = domain?.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col gap-2 p-4 rounded-2xl border bg-card/60 backdrop-blur-sm',
        'hover:bg-card/80 hover:border-border/60 transition-all duration-200 cursor-pointer group text-start w-full'
      )}
    >
      {/* Top row: type icon + domain badge */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {isHe ? typeLabels[item.type].he : typeLabels[item.type].en}
          </span>
        </div>
        {DomainIcon && (
          <DomainIcon className={cn('w-3.5 h-3.5 opacity-50')} />
        )}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
        {item.title}
      </h4>

      {/* Description */}
      {item.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
          {item.description}
        </p>
      )}

      {/* Progress bar */}
      {item.progress !== undefined && item.progress > 0 && (
        <div className="w-full bg-muted/30 rounded-full h-1.5 mt-1">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all"
            style={{ width: `${Math.min(item.progress, 100)}%` }}
          />
        </div>
      )}

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn('text-[9px] w-fit', statusColors[item.status] || statusColors.active)}
      >
        {item.status}
      </Badge>
    </motion.button>
  );
}
