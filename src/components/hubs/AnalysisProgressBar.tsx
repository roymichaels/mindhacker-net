/**
 * AnalysisProgressBar — Shows completion % toward next analysis & 90-day plan.
 * Includes a "Go to next pillar" button linking to the first uncompleted domain.
 */
import { cn } from '@/lib/utils';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { LifeDomain } from '@/navigation/lifeDomains';

interface AnalysisProgressBarProps {
  completionPct: number;
  isHe: boolean;
  isRTL?: boolean;
  accentColor?: string; // e.g. 'rose' for Core, 'amber' for Arena
  /** Domains list to find the next incomplete one */
  domains?: LifeDomain[];
  /** Status map keyed by domain id */
  statusMap?: Record<string, string>;
  /** Route prefix, e.g. '/life' or '/arena' */
  routePrefix?: string;
}

export function AnalysisProgressBar({
  completionPct,
  isHe,
  isRTL = false,
  accentColor = 'rose',
  domains,
  statusMap,
  routePrefix,
}: AnalysisProgressBarProps) {
  const navigate = useNavigate();

  const colorMap: Record<string, { text: string; indicator: string; bg: string; border: string; btn: string }> = {
    rose:  { text: 'text-rose-400',  indicator: 'bg-gradient-to-r from-rose-500 to-rose-400',  bg: 'bg-rose-500/10',  border: 'border-rose-500/20',  btn: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30' },
    amber: { text: 'text-amber-400', indicator: 'bg-gradient-to-r from-amber-500 to-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', btn: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30' },
  };
  const colors = colorMap[accentColor] ?? colorMap.rose;

  // Find next incomplete domain
  const nextDomain = domains?.find(d => {
    const s = statusMap?.[d.id];
    return s !== 'active' && s !== 'configured';
  });

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

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
      {nextDomain && routePrefix && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`${routePrefix}/${nextDomain.id}`)}
          className={cn('w-full mt-1 h-8 text-xs font-semibold border rounded-xl gap-1.5 transition-colors', colors.btn)}
        >
          {isHe ? `הבא: ${nextDomain.labelHe}` : `Next: ${nextDomain.labelEn}`}
          <ChevronIcon className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
