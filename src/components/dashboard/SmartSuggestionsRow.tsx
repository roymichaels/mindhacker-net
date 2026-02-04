import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Target, Brain, Flame, CheckCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { useSmartSuggestions, SmartSuggestion, SuggestionAction } from '@/hooks/aurora/useSmartSuggestions';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SmartSuggestionsRowProps {
  onOpenHypnosis?: () => void;
  onSendMessage?: (prompt: string) => void;
}

export function SmartSuggestionsRow({ 
  onOpenHypnosis, 
  onSendMessage,
}: SmartSuggestionsRowProps) {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { suggestions, isLoading } = useSmartSuggestions();
  const scrollRef = useRef<HTMLDivElement>(null);

  const getIcon = (iconType: SmartSuggestion['icon']) => {
    switch (iconType) {
      case 'hypnosis': return Brain;
      case 'task': return CheckCircle;
      case 'plan': return Target;
      case 'habit': return Sparkles;
      case 'milestone': return Flame;
      case 'reflection': return Lightbulb;
      default: return Sparkles;
    }
  };

  const getIconColor = (iconType: SmartSuggestion['icon']) => {
    switch (iconType) {
      case 'hypnosis': return 'text-purple-500';
      case 'task': return 'text-green-500';
      case 'plan': return 'text-blue-500';
      case 'habit': return 'text-amber-500';
      case 'milestone': return 'text-orange-500';
      case 'reflection': return 'text-cyan-500';
      default: return 'text-primary';
    }
  };

  const handleAction = (action: SuggestionAction) => {
    switch (action.type) {
      case 'open_hypnosis':
        onOpenHypnosis?.();
        break;
      case 'open_dashboard':
        navigate('/dashboard');
        break;
      case 'send_message':
        onSendMessage?.(action.prompt);
        break;
      case 'navigate':
        navigate(action.path);
        break;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="flex-shrink-0 h-10 w-48 rounded-full bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="relative group" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Scroll buttons - desktop only */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm",
          "opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex",
          isRTL ? "-right-3" : "-left-3"
        )}
        onClick={() => scroll(isRTL ? 'right' : 'left')}
      >
        <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm",
          "opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex",
          isRTL ? "-left-3" : "-right-3"
        )}
        onClick={() => scroll(isRTL ? 'left' : 'right')}
      >
        <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
      </Button>

      {/* Suggestions scroll area */}
      <ScrollArea className="w-full" ref={scrollRef}>
        <div className="flex gap-2 pb-2">
          {suggestions.map((suggestion) => {
            const Icon = getIcon(suggestion.icon);
            const iconColor = getIconColor(suggestion.icon);
            
            return (
              <button
                key={suggestion.id}
                onClick={() => handleAction(suggestion.action)}
                className={cn(
                  "flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-muted/60 hover:bg-muted border border-border/50",
                  "text-sm font-medium transition-all duration-200",
                  "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", iconColor)} />
                <span className="whitespace-nowrap">{suggestion.text}</span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
}
