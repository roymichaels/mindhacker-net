import { Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface IdentityProfileCardProps {
  values: string[];
  principles: string[];
  selfConcepts: string[];
  className?: string;
}

export function IdentityProfileCard({ 
  values, 
  principles, 
  selfConcepts,
  className 
}: IdentityProfileCardProps) {
  const { t, isRTL, language } = useTranslation();

  const hasContent = values.length > 0 || principles.length > 0 || selfConcepts.length > 0;
  
  if (!hasContent) {
    return (
      <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-5 w-5 text-rose-500" />
            {t('unified.identity.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Heart className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            {language === 'he' 
              ? 'עדיין אין נתוני זהות' 
              : 'No identity data yet'}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {language === 'he' 
              ? 'השלם את ה-Launchpad או דבר עם אורורה'
              : 'Complete the Launchpad or chat with Aurora'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="h-5 w-5 text-rose-500" />
          {t('unified.identity.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {values.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {t('unified.identity.values')}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {values.slice(0, 5).map((v, i) => (
                <Badge 
                  key={i} 
                  className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-xs"
                >
                  {v}
                </Badge>
              ))}
              {values.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{values.length - 5}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {principles.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {t('unified.identity.principles')}
            </h4>
            <ul className="text-sm space-y-1">
              {principles.slice(0, 3).map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span className="line-clamp-1">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {selfConcepts.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {t('unified.identity.selfConcepts')}
            </h4>
            <p className="text-sm italic text-muted-foreground line-clamp-2">
              "{selfConcepts[0]}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
