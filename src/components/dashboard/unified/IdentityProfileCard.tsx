import { Heart, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { useMultiThreadOrbProfile } from '@/hooks/useMultiThreadOrbProfile';

interface IdentityTitleData {
  title: string;
  titleEn: string;
  icon: string;
}

interface IdentityProfileCardProps {
  values: string[];
  principles: string[];
  selfConcepts: string[];
  identityTitle?: IdentityTitleData | null;
  className?: string;
}

export function IdentityProfileCard({ 
  values, 
  principles, 
  selfConcepts,
  identityTitle,
  className 
}: IdentityProfileCardProps) {
  const { t, isRTL, language } = useTranslation();
  const { profile: orbProfile } = useMultiThreadOrbProfile();

  const hasContent = values.length > 0 || principles.length > 0 || selfConcepts.length > 0 || identityTitle;
  
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

  const displayTitle = language === 'he' ? identityTitle?.title : identityTitle?.titleEn;

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="h-5 w-5 text-rose-500" />
          {t('unified.identity.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Identity Title with Orb - Prominent Display */}
        {identityTitle && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20 p-4 text-center">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-accent/10 rounded-full blur-xl" />
            
            <div className="relative z-10">
              {/* Digital Orb Avatar */}
              <div className="relative mb-4 mx-auto w-fit">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl scale-110" />
                <MultiThreadOrb 
                  size={120}
                  state="idle"
                  profile={orbProfile}
                />
              </div>
              
              <span className="text-2xl mb-1 block">{identityTitle.icon}</span>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {displayTitle}
              </h3>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>{language === 'he' ? 'מי בחרת להיות' : 'Who you chose to become'}</span>
              </div>
            </div>
          </div>
        )}

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
