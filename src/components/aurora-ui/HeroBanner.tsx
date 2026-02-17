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
      'relative overflow-hidden rounded-2xl border border-border shadow-sm p-5 md:p-6',
      'bg-gradient-to-br',
      gradient,
      className
    )}>
      {/* Decorative orbs */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
          </div>
          {subtitle && <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>}
        </div>
        {action && actionLabel && (
          <Button size="sm" onClick={action} className="shrink-0 bg-primary text-primary-foreground">
            {actionLabel}
          </Button>
        )}
      </div>
      {children && <div className="relative z-10 mt-4">{children}</div>}
    </div>
  );
}
