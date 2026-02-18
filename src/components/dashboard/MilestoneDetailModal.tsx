/**
 * MilestoneDetailModal - Full detail view for a single milestone.
 */
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompleteMilestone } from '@/hooks/useLifePlan';
import { useTranslation } from '@/hooks/useTranslation';
import { Check, Target, Star, Zap, ListChecks, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneForModal {
  id: string;
  plan_id?: string;
  week_number: number;
  title: string;
  description?: string | null;
  focus_area?: string | null;
  goal?: string | null;
  challenge?: string | null;
  tasks?: string[];
  is_completed: boolean;
  completed_at?: string | null;
  xp_reward?: number;
  tokens_reward?: number;
}

interface MilestoneDetailModalProps {
  milestone: MilestoneForModal | null;
  planId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MilestoneDetailModal({ milestone, planId, open, onOpenChange }: MilestoneDetailModalProps) {
  const { language } = useTranslation();
  const completeMilestone = useCompleteMilestone();
  const isHe = language === 'he';

  if (!milestone) return null;

  const handleComplete = () => {
    if (!planId) return;
    completeMilestone.mutate({ milestoneId: milestone.id, planId }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs font-bold">
              {isHe ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`}
            </Badge>
            {milestone.is_completed ? (
              <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
                <Check className="w-3 h-3 mr-1" />
                {isHe ? 'הושלם' : 'Completed'}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                {isHe ? 'פעיל' : 'Active'}
              </Badge>
            )}
            {milestone.focus_area && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {milestone.focus_area}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg font-bold mt-1">{milestone.title}</DialogTitle>
          {milestone.description && (
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {milestone.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Goal */}
          {milestone.goal && (
            <div className="rounded-xl bg-muted/30 dark:bg-muted/15 border border-border/30 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">{isHe ? 'מטרה' : 'Goal'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{milestone.goal}</p>
            </div>
          )}

          {/* Tasks */}
          {milestone.tasks && milestone.tasks.length > 0 && (
            <div className="rounded-xl bg-muted/30 dark:bg-muted/15 border border-border/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-4 h-4 text-chart-2" />
                <span className="text-xs font-bold text-foreground">{isHe ? 'משימות' : 'Tasks'}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {milestone.tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5",
                      milestone.is_completed
                        ? "bg-emerald-500/20 border-emerald-500/40"
                        : "border-border/50"
                    )}>
                      {milestone.is_completed && <Check className="w-2.5 h-2.5 text-emerald-500" />}
                    </div>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenge */}
          {milestone.challenge && (
            <div className="rounded-xl bg-muted/30 dark:bg-muted/15 border border-border/30 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-foreground">{isHe ? 'אתגר שבועי' : 'Weekly Challenge'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{milestone.challenge}</p>
            </div>
          )}

          {/* Rewards */}
          {(milestone.xp_reward || milestone.tokens_reward) && (
            <div className="flex items-center gap-3 justify-center py-2">
              {milestone.xp_reward ? (
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-primary">+{milestone.xp_reward} XP</span>
                </div>
              ) : null}
              {milestone.tokens_reward ? (
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Zap className="w-4 h-4 text-accent-foreground" />
                  <span className="text-accent-foreground">+{milestone.tokens_reward}</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Completed date */}
          {milestone.is_completed && milestone.completed_at && (
            <p className="text-xs text-muted-foreground text-center">
              {isHe ? 'הושלם ב-' : 'Completed on '}
              {new Date(milestone.completed_at).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
            </p>
          )}

          {/* Complete button */}
          {!milestone.is_completed && planId && (
            <Button
              onClick={handleComplete}
              disabled={completeMilestone.isPending}
              className="w-full bg-gradient-to-r from-primary to-emerald-500 hover:brightness-110"
            >
              <Check className="w-4 h-4 mr-2" />
              {completeMilestone.isPending
                ? (isHe ? 'משלים...' : 'Completing...')
                : (isHe ? 'סמן כהושלם' : 'Mark Complete')
              }
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
