import { Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface XpProgressSectionProps {
  level: number;
  current: number;
  required: number;
  percentage: number;
  className?: string;
}

export function XpProgressSection({ 
  level, 
  current, 
  required, 
  percentage,
  className 
}: XpProgressSectionProps) {
  const { t, isRTL } = useTranslation();

  return (
    <div className={cn("space-y-1", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy className="h-3 w-3 text-primary" />
          </div>
          <span className="font-bold text-sm">
            {t('unified.xpProgress.level')} {level}
          </span>
        </div>
        <span className="text-muted-foreground tabular-nums text-xs">
          {current}/{required} XP
        </span>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className="h-2 bg-muted"
      />
    </div>
  );
}
