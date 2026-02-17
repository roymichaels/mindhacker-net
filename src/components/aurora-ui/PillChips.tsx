import { cn } from '@/lib/utils';

type ColorScheme = 'pink' | 'violet' | 'green' | 'amber' | 'blue' | 'red' | 'primary';

const colorMap: Record<ColorScheme, string> = {
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  green: 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  red: 'bg-destructive/10 text-destructive border-destructive/20',
  primary: 'bg-primary/10 text-primary border-primary/20',
};

interface PillChipsProps {
  items: string[];
  colorScheme?: ColorScheme;
  maxItems?: number;
  className?: string;
}

export function PillChips({ items, colorScheme = 'primary', maxItems, className }: PillChipsProps) {
  const displayed = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayed.map((item, i) => (
        <span
          key={i}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium border',
            colorMap[colorScheme]
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
