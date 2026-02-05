import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

type Priority = 'low' | 'medium' | 'high' | 'critical';

interface PrioritySelectProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

const priorities: { value: Priority; color: string }[] = [
  { value: 'low', color: 'bg-green-500' },
  { value: 'medium', color: 'bg-yellow-500' },
  { value: 'high', color: 'bg-orange-500' },
  { value: 'critical', color: 'bg-red-500' },
];

export const PrioritySelect = ({ value, onChange }: PrioritySelectProps) => {
  const { t } = useTranslation();

  const getLabel = (priority: Priority) => {
    switch (priority) {
      case 'low': return t('bugReport.priorityLow');
      case 'medium': return t('bugReport.priorityMedium');
      case 'high': return t('bugReport.priorityHigh');
      case 'critical': return t('bugReport.priorityCritical');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {t('bugReport.priority')}
      </label>
      <div className="flex gap-2">
        {priorities.map(({ value: p, color }) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all flex-1",
              "hover:border-primary/50",
              value === p
                ? "border-primary bg-primary/10"
                : "border-border bg-background"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", color)} />
            <span className="text-xs font-medium">{getLabel(p)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
