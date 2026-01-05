import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 text-foreground/80 hover:text-foreground hover:bg-primary/10"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium">
            {language === 'he' ? 'עב' : 'EN'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[140px] bg-background border border-border shadow-lg z-50"
      >
        <DropdownMenuItem 
          onClick={() => setLanguage('he')}
          className={`cursor-pointer gap-2 ${language === 'he' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <span>🇮🇱</span>
          <span>עברית</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={`cursor-pointer gap-2 ${language === 'en' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <span>🇺🇸</span>
          <span>English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
