import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: () => void;
  actionLabel?: string;
  className?: string;
}

export function SectionHeader({ icon: Icon, emoji, title, subtitle, action, actionLabel, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-0.5', className)}>
      <div className="flex items-center gap-1.5 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
        {emoji && <span className="text-sm shrink-0">{emoji}</span>}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate">{title}</h2>
          {subtitle && <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
      {action && actionLabel && (
        <Button variant="ghost" size="sm" onClick={action} className="text-[10px] text-primary shrink-0 h-6 px-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
