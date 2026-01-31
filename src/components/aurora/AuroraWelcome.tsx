import { Sparkles, CheckCircle2, Brain, Target, Heart, Lightbulb, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import { useSmartSuggestions } from '@/hooks/aurora/useSmartSuggestions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AuroraWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

const iconMap = {
  task: CheckCircle2,
  hypnosis: Brain,
  plan: Target,
  habit: Heart,
  reflection: Lightbulb,
  milestone: CalendarCheck,
};

const AuroraWelcome = ({ onSuggestionClick }: AuroraWelcomeProps) => {
  const { t, tg, isRTL } = useGenderedTranslation();
  const { suggestions, isLoading } = useSmartSuggestions();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6">
      {/* Aurora Icon */}
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>

      {/* Welcome Text */}
      <div className="text-center space-y-1.5 max-w-md">
        <h2 className="text-xl font-semibold">{t('aurora.welcomeTitle')}</h2>
        <p className="text-muted-foreground text-sm">{tg('aurora.welcomeSubtitle')}</p>
      </div>

      {/* Smart Suggestion Cards */}
      <div className={cn(
        "flex flex-col gap-2.5 w-full max-w-md",
        isRTL && "text-right"
      )}>
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))
        ) : (
          suggestions.map((suggestion) => {
            const Icon = iconMap[suggestion.icon];
            return (
              <Button
                key={suggestion.id}
                variant="outline"
                className={cn(
                  "h-auto py-3 px-4 text-sm font-normal rounded-xl",
                  "hover:bg-primary/5 hover:border-primary/30 hover:text-primary",
                  "transition-all duration-200",
                  "flex items-center gap-3",
                  isRTL ? "flex-row-reverse justify-end" : "justify-start"
                )}
                onClick={() => onSuggestionClick(suggestion.prompt)}
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-start">{suggestion.text}</span>
              </Button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AuroraWelcome;
