/**
 * AnalysisProgressBar — Unified progress bar across all 13 life domains.
 * Sleek gradient design showing combined Core + Arena completion toward
 * the 90-day Apex plan renewal.
 */
import { cn } from '@/lib/utils';
import { Sparkles, ChevronRight, ChevronLeft, Flame, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CORE_DOMAINS, ARENA_DOMAINS, LIFE_DOMAINS } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useTranslation } from '@/hooks/useTranslation';

export function AnalysisProgressBar() {
  const navigate = useNavigate();
  const { statusMap } = useLifeDomains();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const allDomains = LIFE_DOMAINS;
  const completed = allDomains.filter(d => {
    const s = statusMap[d.id];
    return s === 'active' || s === 'configured';
  }).length;
  const total = allDomains.length;
  const pct = Math.round((completed / total) * 100);

  // Core / Arena split for the mini indicators
  const coreCompleted = CORE_DOMAINS.filter(d => statusMap[d.id] === 'active' || statusMap[d.id] === 'configured').length;
  const arenaCompleted = ARENA_DOMAINS.filter(d => statusMap[d.id] === 'active' || statusMap[d.id] === 'configured').length;

  // Find next incomplete domain (core first, then arena)
  const nextDomain = allDomains.find(d => {
    const s = statusMap[d.id];
    return s !== 'active' && s !== 'configured';
  });
  const nextRoute = nextDomain
    ? CORE_DOMAINS.some(c => c.id === nextDomain.id)
      ? `/life/${nextDomain.id}`
      : `/arena/${nextDomain.id}`
    : null;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-3.5 flex flex-col gap-2.5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground/80">
            {isHe ? 'התקדמות לתוכנית Apex 90 יום' : 'Apex 90-Day Plan Progress'}
          </span>
        </div>
        <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {pct}%
        </span>
      </div>

      {/* Progress track */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Core / Arena split indicators */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-rose-400" />
          <span>{isHe ? 'ליבה' : 'Core'} {coreCompleted}/{CORE_DOMAINS.length}</span>
        </div>
        <div className="w-px h-3 bg-border/50" />
        <div className="flex items-center gap-1.5">
          <Swords className="w-3 h-3 text-amber-400" />
          <span>{isHe ? 'זירה' : 'Arena'} {arenaCompleted}/{ARENA_DOMAINS.length}</span>
        </div>
        <div className="flex-1" />
        <span className="text-muted-foreground/60">{completed}/{total} {isHe ? 'תחומים' : 'domains'}</span>
      </div>

      {/* Next pillar button */}
      {nextDomain && nextRoute && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(nextRoute)}
          className="w-full mt-0.5 h-8 text-xs font-semibold border border-border/40 rounded-xl gap-1.5 transition-all hover:bg-primary/10 hover:border-primary/30 text-foreground/70 hover:text-foreground"
        >
          {isHe ? `הבא: ${nextDomain.labelHe}` : `Next: ${nextDomain.labelEn}`}
          <ChevronIcon className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
