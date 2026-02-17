import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  gradient?: string;
}

export function MetricCard({ icon, label, value, suffix = '', gradient = 'from-primary to-primary-glow' }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm p-4 md:p-5 text-center hover:shadow-md transition-shadow">
      <div className={cn('absolute inset-0 opacity-10 bg-gradient-to-br', gradient)} />
      <div className="relative z-10">
        <div className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-full mb-1.5 text-primary-foreground bg-gradient-to-br',
          gradient
        )}>
          {icon}
        </div>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}{suffix}</p>
      </div>
    </div>
  );
}
