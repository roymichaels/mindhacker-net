import { Sparkles, Compass, Heart, Zap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface AuroraWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

const AuroraWelcome = ({ onSuggestionClick }: AuroraWelcomeProps) => {
  const { t, language } = useTranslation();

  const suggestions = [
    {
      icon: Compass,
      text: t('aurora.suggestions.direction'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Heart,
      text: t('aurora.suggestions.values'),
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: Zap,
      text: t('aurora.suggestions.energy'),
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: User,
      text: t('aurora.suggestions.identity'),
      color: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-8">
      {/* Aurora Avatar */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-ping opacity-20" />
      </div>

      {/* Welcome Text */}
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-bold">{t('aurora.welcomeTitle')}</h2>
        <p className="text-muted-foreground">{t('aurora.welcomeSubtitle')}</p>
      </div>

      {/* Suggestion Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-4 px-4 flex items-center gap-3 justify-start text-start hover:border-transparent hover:text-white group"
              onClick={() => onSuggestionClick(suggestion.text)}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${suggestion.color} flex items-center justify-center shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium leading-tight">{suggestion.text}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default AuroraWelcome;
