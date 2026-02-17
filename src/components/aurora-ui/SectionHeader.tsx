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
    <div className={cn('flex items-center justify-between mb-1', className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && <Icon className="w-5 h-5 text-primary shrink-0" />}
        {emoji && <span className="text-lg shrink-0">{emoji}</span>}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold truncate">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
      {action && actionLabel && (
        <Button variant="ghost" size="sm" onClick={action} className="text-xs text-primary shrink-0">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
