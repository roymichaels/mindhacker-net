/**
 * @component FixLibrary
 * @purpose Selectable fix cards grouped by tier. Bilingual + RTL.
 */
import { FIX_LIBRARY } from '@/lib/presence/levers';
import { cn } from '@/lib/utils';
import { Wrench } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface FixLibraryProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function FixLibrary({ selectedIds, onSelectionChange }: FixLibraryProps) {
  const { t, isRTL } = useTranslation();

  const TIER_LABELS: Record<number, string> = {
    1: t('presence.tier1'),
    2: t('presence.tier2'),
    3: t('presence.tier3'),
  };

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onSelectionChange(next);
  };

  const getDifficultyColor = (d: string) => {
    if (d === 'easy') return 'text-emerald-500 bg-emerald-500/10';
    if (d === 'medium') return 'text-amber-500 bg-amber-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getImpactColor = (i: string) => {
    if (i === 'high') return 'text-emerald-500 bg-emerald-500/10';
    if (i === 'med') return 'text-amber-500 bg-amber-500/10';
    return 'text-muted-foreground bg-muted';
  };

  const tiers = [1, 2, 3] as const;

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">{t('presence.fixLibrary')}</h3>
      </div>
      <p className="text-[11px] text-muted-foreground">{t('presence.selectFocusItems')}</p>
      <div className="space-y-4">
        {tiers.map(tier => {
          const fixes = FIX_LIBRARY.filter(f => f.tier === tier);
          if (fixes.length === 0) return null;
          return (
            <div key={tier} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {TIER_LABELS[tier]}
              </p>
              {fixes.map(fix => {
                const selected = selectedIds.includes(fix.id);
                return (
                  <button
                    key={fix.id}
                    onClick={() => toggle(fix.id)}
                    className={cn(
                      'w-full text-start p-3 rounded-xl border transition-all',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{fix.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{fix.why}</p>
                      </div>
                      {selected && (
                        <span className="text-xs text-primary font-medium shrink-0">✓</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', getDifficultyColor(fix.difficulty))}>
                        {fix.difficulty}
                      </span>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', getImpactColor(fix.impact))}>
                        {fix.impact} {t('presence.impact')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
