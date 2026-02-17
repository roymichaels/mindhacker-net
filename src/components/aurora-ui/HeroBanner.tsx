import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

interface HeroBannerProps {
  gradient?: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: () => void;
  actionLabel?: string;
  children?: ReactNode;
  className?: string;
}

export function HeroBanner({ gradient = 'from-primary/10 to-accent/10', icon, title, subtitle, action, actionLabel, children, className }: HeroBannerProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-border shadow-sm p-6',
      'bg-gradient-to-br',
      gradient,
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && actionLabel && (
          <Button size="sm" onClick={action} className="shrink-0 bg-primary text-primary-foreground">
            {actionLabel}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
