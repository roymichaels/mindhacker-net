import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';
import { Mission } from '@/hooks/useMissionsRoadmap';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface MissionCardProps {
  mission: Mission;
  onToggleItem: (itemId: string, isCompleted: boolean) => Promise<boolean>;
}

export function MissionCard({ mission, onToggleItem }: MissionCardProps) {
  const { language, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(mission.progress < 100);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const isHebrew = language === 'he';

  const handleToggle = async (itemId: string, currentState: boolean) => {
    setLoadingItems((prev) => new Set(prev).add(itemId));
    await onToggleItem(itemId, !currentState);
    setLoadingItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const isFromAurora = mission.origin === 'aurora';
  const isComplete = mission.progress === 100;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card 
        className={cn(
          "transition-all duration-200",
          isComplete && "bg-green-500/5 border-green-500/20"
        )}
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-3 p-3">
            {/* Progress Circle */}
            <div className="relative shrink-0">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  className={cn(
                    "transition-all duration-500",
                    isComplete ? "stroke-green-500" : "stroke-primary"
                  )}
                  strokeWidth="3"
                  strokeDasharray={`${mission.progress}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {mission.progress}%
              </span>
            </div>

            {/* Title and Meta */}
            <div className="flex-1 min-w-0 text-start">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "font-medium text-sm truncate",
                  isComplete && "line-through text-muted-foreground"
                )}>
                  {mission.title}
                </p>
                {isFromAurora && (
                  <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {mission.completedCount}/{mission.totalCount} {isHebrew ? 'פריטים' : 'items'}
              </p>
            </div>

            {/* Expand Icon */}
            <div className="shrink-0 text-muted-foreground">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0">
            <div className="border-t pt-3 space-y-2">
              {mission.items
                .sort((a, b) => a.order_index - b.order_index)
                .map((item) => {
                  const isLoading = loadingItems.has(item.id);
                  const hasDueDate = item.due_date;
                  const isOverdue = hasDueDate && new Date(item.due_date) < new Date() && !item.is_completed;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 p-2 rounded-lg transition-colors",
                        item.is_completed ? "bg-muted/30" : "hover:bg-muted/50",
                        isLoading && "opacity-50"
                      )}
                    >
                      <Checkbox
                        checked={item.is_completed}
                        onCheckedChange={() => handleToggle(item.id, item.is_completed)}
                        disabled={isLoading}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm",
                          item.is_completed && "line-through text-muted-foreground"
                        )}>
                          {item.content}
                        </p>
                        {hasDueDate && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className={cn(
                              "h-3 w-3",
                              isOverdue ? "text-destructive" : "text-muted-foreground"
                            )} />
                            <span className={cn(
                              "text-xs",
                              isOverdue ? "text-destructive" : "text-muted-foreground"
                            )}>
                              {new Date(item.due_date!).toLocaleDateString(
                                language === 'he' ? 'he-IL' : 'en-US',
                                { month: 'short', day: 'numeric' }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
