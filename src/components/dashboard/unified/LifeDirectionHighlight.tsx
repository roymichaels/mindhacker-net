import { Compass } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface LifeDirectionHighlightProps {
  content: string;
  clarityScore: number;
  className?: string;
}

export function LifeDirectionHighlight({ 
  content, 
  clarityScore,
  className 
}: LifeDirectionHighlightProps) {
  const { t, isRTL } = useTranslation();

  return (
    <Card 
      className={cn(
        "border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Compass className="h-4 w-4 text-primary" />
          </div>
          {t('unified.lifeDirection.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{content}</p>
        {clarityScore > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {t('unified.lifeDirection.clarity')}
            </span>
            <Progress value={clarityScore} className="flex-1 h-1.5" />
            <span className="text-xs font-medium">{clarityScore}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
