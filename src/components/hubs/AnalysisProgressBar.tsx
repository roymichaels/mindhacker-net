/**
 * AnalysisProgressBar — Shows completion % toward next analysis & 90-day plan.
 */
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface AnalysisProgressBarProps {
  completionPct: number;
  isHe: boolean;
  accentColor?: string; // e.g. 'rose' for Core, 'amber' for Arena
}

export function AnalysisProgressBar({ completionPct, isHe, accentColor = 'rose' }: AnalysisProgressBarProps) {
  const colorMap: Record<string, { text: string; indicator: string; bg: string; border: string }> = {
    rose:   { text: 'text-rose-400',  indicator: 'bg-gradient-to-r from-rose-500 to-rose-400',  bg: 'bg-rose-500/10',  border: 'border-rose-500/20' },
    amber:  { text: 'text-amber-400', indicator: 'bg-gradient-to-r from-amber-500 to-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  };
  const colors = colorMap[accentColor] ?? colorMap.rose;

  return (
    <div className={cn('rounded-2xl border p-3 flex flex-col gap-2', colors.bg, colors.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={cn('w-3.5 h-3.5', colors.text)} />
          <span className="text-xs font-semibold text-foreground/80">
            {isHe ? 'התקדמות לאנליזה וחידוש תוכנית 90 יום' : 'Progress to Analysis & 90-Day Plan Renewal'}
          </span>
        </div>
        <span className={cn('text-xs font-bold', colors.text)}>{completionPct}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-background/30">
        <div
          className={cn('h-full rounded-full transition-all', colors.indicator)}
          style={{ width: `${completionPct}%` }}
        />
      </div>
    </div>
  );
}
