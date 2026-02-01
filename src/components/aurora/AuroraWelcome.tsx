import { CheckCircle2, Brain, Target, Heart, Lightbulb, CalendarCheck } from 'lucide-react';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import { useSmartSuggestions, SuggestionAction } from '@/hooks/aurora/useSmartSuggestions';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';

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

// Color schemes for the 2x2 grid cards
const cardColors = [
  { bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', icon: 'text-purple-400', hover: 'hover:border-purple-400/50 hover:from-purple-500/30' },
  { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', icon: 'text-cyan-400', hover: 'hover:border-cyan-400/50 hover:from-cyan-500/30' },
  { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', icon: 'text-amber-400', hover: 'hover:border-amber-400/50 hover:from-amber-500/30' },
  { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', hover: 'hover:border-emerald-400/50 hover:from-emerald-500/30' },
];

const AuroraWelcome = ({ onSuggestionClick }: AuroraWelcomeProps) => {
  const { t, tg, isRTL } = useGenderedTranslation();
  const { suggestions, isLoading } = useSmartSuggestions();
  const { openHypnosis, openDashboard } = useAuroraActions();

  const handleSuggestionAction = (action: SuggestionAction) => {
    switch (action.type) {
      case 'open_hypnosis':
        openHypnosis();
        break;
      case 'open_dashboard':
        openDashboard(action.view);
        break;
      case 'send_message':
        onSuggestionClick(action.prompt);
        break;
      case 'navigate':
        // Future: implement navigation
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 space-y-5">
      {/* Aurora Orb Avatar */}
      <div className="relative">
        <PersonalizedOrb 
          size={80} 
          state="idle"
        />
      </div>

      {/* Welcome Text */}
      <div className="text-center space-y-1.5 max-w-md">
        <h2 className="text-xl font-semibold">{t('aurora.welcomeTitle')}</h2>
        <p className="text-muted-foreground text-sm">{tg('aurora.welcomeSubtitle')}</p>
      </div>

      {/* Smart Suggestion Cards - 2x2 Grid */}
      <div className={cn(
        "grid grid-cols-2 gap-3 w-full max-w-md",
        isRTL && "text-right"
      )}>
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : (
          suggestions.slice(0, 4).map((suggestion, index) => {
            const Icon = iconMap[suggestion.icon];
            const colors = cardColors[index % cardColors.length];
            return (
              <button
                key={suggestion.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl p-3",
                  "bg-gradient-to-br border backdrop-blur-sm",
                  "transition-all duration-300 ease-out",
                  "flex flex-col items-start gap-2",
                  colors.bg,
                  colors.border,
                  colors.hover
                )}
                onClick={() => handleSuggestionAction(suggestion.action)}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-background/50 backdrop-blur-sm"
                )}>
                  <Icon className={cn("h-4 w-4 shrink-0", colors.icon)} />
                </div>
                <span className={cn(
                  "text-xs font-medium text-foreground/90 leading-tight",
                  "line-clamp-2 text-start"
                )}>
                  {suggestion.text}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AuroraWelcome;
