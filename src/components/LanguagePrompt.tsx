import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';

export const LanguagePrompt = () => {
  const { isFirstVisit, setLanguage, setFirstVisitComplete, language } = useLanguage();
  const { theme } = useThemeSettings();

  const brandName = language === 'he' ? theme.brand_name : theme.brand_name_en;

  const handleSelect = (lang: 'he' | 'en') => {
    setLanguage(lang);
    setFirstVisitComplete();
  };

  if (!isFirstVisit) return null;

  return (
    <Dialog open={isFirstVisit} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md border-border bg-card shadow-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">
          {language === 'he' ? 'בחר שפה' : 'Select Language'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {language === 'he' 
            ? 'בחר את השפה המועדפת עליך לצפייה באתר' 
            : 'Choose your preferred language for viewing the site'}
        </DialogDescription>
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Logo - using AuroraOrbIcon */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
            <AuroraOrbIcon size={64} className="text-primary" />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {language === 'he' ? 'ברוך הבא!' : 'Welcome!'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'he' 
                ? 'בחר את השפה המועדפת עליך' 
                : 'Choose your preferred language'}
            </p>
          </div>

          {/* Language Options */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={() => handleSelect('he')}
              variant={language === 'he' ? 'default' : 'outline'}
              className="flex-1 h-14 text-lg gap-2"
            >
              <span className="text-xl">🇮🇱</span>
              <span>עברית</span>
            </Button>
            <Button
              onClick={() => handleSelect('en')}
              variant={language === 'en' ? 'default' : 'outline'}
              className="flex-1 h-14 text-lg gap-2"
            >
              <span className="text-xl">🇺🇸</span>
              <span>English</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
