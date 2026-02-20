/**
 * @component FixLibrary
 * @purpose Selectable fix cards with name, why, difficulty, impact.
 */
import { FIX_LIBRARY } from '@/lib/presence/levers';
import { cn } from '@/lib/utils';
import { Wrench } from 'lucide-react';

interface FixLibraryProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function FixLibrary({ selectedIds, onSelectionChange }: FixLibraryProps) {
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Fix Library</h3>
      </div>
      <p className="text-[11px] text-muted-foreground">Select items to add to your focus.</p>
      <div className="space-y-2">
        {FIX_LIBRARY.map(fix => {
          const selected = selectedIds.includes(fix.id);
          return (
            <button
              key={fix.id}
              onClick={() => toggle(fix.id)}
              className={cn(
                'w-full text-left p-3 rounded-xl border transition-all',
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
                  {fix.impact} impact
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
