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
  const { t, isRTL, language } = useTranslation();

  if (anchors.length === 0) {
    return (
      <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Anchor className="h-5 w-5 text-green-500" />
            {t('unified.dailyAnchors.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Anchor className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            {language === 'he' 
              ? 'עדיין אין עוגנים יומיים' 
              : 'No daily anchors yet'}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {language === 'he' 
              ? 'דבר עם אורורה כדי להגדיר הרגלי עוגן'
              : 'Talk to Aurora to set anchor habits'}
          </p>
        </CardContent>
      </Card>
    );
  }

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
