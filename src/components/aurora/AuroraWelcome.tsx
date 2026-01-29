import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface AuroraWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

const AuroraWelcome = ({ onSuggestionClick }: AuroraWelcomeProps) => {
  const { t, isRTL } = useTranslation();

  const suggestions = [
    t('aurora.suggestions.direction'),
    t('aurora.suggestions.values'),
    t('aurora.suggestions.energy'),
    t('aurora.suggestions.identity'),
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-8">
      {/* Aurora Icon */}
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Sparkles className="h-7 w-7 text-muted-foreground" />
      </div>

      {/* Welcome Text */}
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-semibold">{t('aurora.welcomeTitle')}</h2>
        <p className="text-muted-foreground text-sm">{t('aurora.welcomeSubtitle')}</p>
      </div>

      {/* Suggestion Pills */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg",
        isRTL && "text-right"
      )}>
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-3 px-4 text-sm font-normal justify-start text-start rounded-xl hover:bg-muted"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AuroraWelcome;
