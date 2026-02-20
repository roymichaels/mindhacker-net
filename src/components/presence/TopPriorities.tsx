/**
 * @component TopPriorities
 * @purpose Auto-selected top 3 levers with "Add to My Focus" buttons. Bilingual + RTL.
 */
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FixItem } from '@/lib/presence/types';
import { useTranslation } from '@/hooks/useTranslation';

interface TopPrioritiesProps {
  priorities: FixItem[];
  selectedIds: string[];
  onToggle: (ids: string[]) => void;
}

export default function TopPriorities({ priorities, selectedIds, onToggle }: TopPrioritiesProps) {
  const { t, isRTL } = useTranslation();

  const PRIORITY_LABELS = [
    t('presence.topPriority'),
    t('presence.secondary'),
    t('presence.optional'),
  ];

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onToggle(next);
  };

  if (priorities.length === 0) return null;

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">{t('presence.whatToWorkOnNow')}</h3>
      </div>
      <div className="space-y-2">
        {priorities.slice(0, 3).map((fix, i) => {
          const isFocused = selectedIds.includes(fix.id);
          return (
            <div
              key={fix.id}
              className={cn(
                'p-4 rounded-xl border',
                i === 0
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={cn(
                    'text-[10px] uppercase font-bold tracking-wider',
                    i === 0 ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {PRIORITY_LABELS[i]}
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">{fix.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fix.why}</p>
                </div>
              </div>
              <Button
                variant={isFocused ? 'default' : 'outline'}
                size="sm"
                className="mt-3 w-full"
                onClick={() => toggle(fix.id)}
              >
                {isFocused ? t('presence.inMyFocus') : t('presence.addToFocus')}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
