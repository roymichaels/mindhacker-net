import { Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface CurrentFocusCardProps {
  title: string;
  description: string | null;
  durationDays: number;
  daysRemaining: number;
  className?: string;
}

export function CurrentFocusCard({ 
  title, 
  description, 
  durationDays,
  daysRemaining,
  className 
}: CurrentFocusCardProps) {
  const { t, isRTL } = useTranslation();

  const progress = Math.round(((durationDays - daysRemaining) / durationDays) * 100);

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-amber-500" />
          {t('unified.currentFocus.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {daysRemaining} {t('unified.currentFocus.daysLeft')}
          </Badge>
          <Badge variant="secondary">
            {progress}% {t('unified.currentFocus.complete')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
