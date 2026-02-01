import { useState } from 'react';
import { Heart, Sparkles, RefreshCw, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  showActions?: boolean;
}

export function IdentityProfileCard({ 
  values, 
  principles, 
  selfConcepts,
  identityTitle,
  className,
  showActions = true
}: IdentityProfileCardProps) {
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const hasContent = values.length > 0 || principles.length > 0 || selfConcepts.length > 0 || identityTitle;
  
  const handleEditJourney = () => {
    navigate('/launchpad');
  };

  const handleRegenerate = async () => {
    if (!user) return;
    
    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-launchpad-summary', {
        body: { userId: user.id, forceRegenerate: true }
      });

      if (error) throw error;
      
      toast.success(language === 'he' ? 'הניתוח חושב מחדש בהצלחה' : 'Analysis regenerated successfully');
      
      // Refresh the page to show new data
      window.location.reload();
    } catch (err) {
      console.error('Regeneration error:', err);
      toast.error(language === 'he' ? 'שגיאה בחישוב מחדש' : 'Error regenerating analysis');
    } finally {
      setIsRegenerating(false);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

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
    <div className={cn("space-y-4", className)} dir={isRTL ? 'rtl' : 'ltr'}>
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
              <PersonalizedOrb size={120} state="idle" />
            </div>
            
            <span className="text-2xl mb-1 block">{identityTitle.icon}</span>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {displayTitle}
            </h3>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>{language === 'he' ? 'הזהות הדיגיטלית שלך' : 'Your digital identity'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Above Values */}
      {showActions && (
        <div className="space-y-2">
          <Button
            className="w-full h-10 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
            onClick={handleEditJourney}
          >
            <Sparkles className={cn("w-4 h-4", isRTL ? 'ml-2' : 'mr-2')} />
            {language === 'he' ? 'ערוך מסע טרנספורמציה' : 'Edit Transformation Journey'}
            <ArrowIcon className={cn("w-4 h-4", isRTL ? 'mr-2' : 'ml-2')} />
          </Button>

          <Button
            variant="outline"
            className="w-full h-9 border-primary/30 hover:bg-primary/5"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <Loader2 className={cn("w-4 h-4 animate-spin", isRTL ? 'ml-2' : 'mr-2')} />
            ) : (
              <RefreshCw className={cn("w-4 h-4", isRTL ? 'ml-2' : 'mr-2')} />
            )}
            {language === 'he' ? 'חשב מחדש ניתוח AI' : 'Regenerate AI Analysis'}
          </Button>
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
    </div>
  );
}
