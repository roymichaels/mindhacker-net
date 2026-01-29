import { Anchor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface DailyAnchor {
  id: string;
  title: string;
  category: string | null;
}

interface DailyAnchorsDisplayProps {
  anchors: DailyAnchor[];
  className?: string;
}

export function DailyAnchorsDisplay({ anchors, className }: DailyAnchorsDisplayProps) {
  const { t, isRTL } = useTranslation();

  if (anchors.length === 0) return null;

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Anchor className="h-5 w-5 text-green-500" />
          {t('unified.dailyAnchors.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {anchors.map((anchor) => (
            <Badge 
              key={anchor.id} 
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            >
              {anchor.title}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
