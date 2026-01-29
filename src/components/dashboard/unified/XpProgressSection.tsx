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
    <div className={cn("space-y-2", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-lg">
            {t('unified.xpProgress.level')} {level}
          </span>
        </div>
        <span className="text-muted-foreground tabular-nums">
          {current}/{required} XP
        </span>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className="h-3 bg-muted"
      />
    </div>
  );
}
