import { Monitor, Zap, AlertCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

type Category = 'ui' | 'performance' | 'feature' | 'other';

interface CategorySelectProps {
  value: Category;
  onChange: (value: Category) => void;
}

const categories: { value: Category; icon: React.ElementType }[] = [
  { value: 'ui', icon: Monitor },
  { value: 'performance', icon: Zap },
  { value: 'feature', icon: AlertCircle },
  { value: 'other', icon: HelpCircle },
];

export const CategorySelect = ({ value, onChange }: CategorySelectProps) => {
  const { t } = useTranslation();

  const getLabel = (cat: Category) => {
    switch (cat) {
      case 'ui': return t('bugReport.categoryUI');
      case 'performance': return t('bugReport.categoryPerformance');
      case 'feature': return t('bugReport.categoryFeature');
      case 'other': return t('bugReport.categoryOther');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {t('bugReport.category')}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {categories.map(({ value: cat, icon: Icon }) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg border transition-all",
              "hover:border-primary/50 hover:bg-primary/5",
              value === cat
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{getLabel(cat)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
