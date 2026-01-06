import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguagePrompt = () => {
  const { isFirstVisit, setLanguage, setFirstVisitComplete, language } = useLanguage();

  const handleSelect = (lang: 'he' | 'en') => {
    setLanguage(lang);
    setFirstVisitComplete();
  };

  if (!isFirstVisit) return null;

  return (
    <Dialog open={isFirstVisit} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md border-primary/30 bg-background/95 backdrop-blur-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Logo - using transparent icon like header */}
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <img src="/icons/icon-96x96.png" alt="Mind Hacker" className="w-14 h-14 object-contain" />
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
