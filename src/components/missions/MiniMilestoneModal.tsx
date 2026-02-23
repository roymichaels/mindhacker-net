import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Check, Zap, Loader2, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface MiniMilestoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId: string;
  milestoneTitle: string;
  color: string;
}

const gradientMap: Record<string, string> = {
  blue: 'from-blue-500/10', fuchsia: 'from-fuchsia-500/10', red: 'from-red-500/10',
  amber: 'from-amber-500/10', cyan: 'from-cyan-500/10', slate: 'from-slate-500/10',
  indigo: 'from-indigo-500/10', emerald: 'from-emerald-500/10', purple: 'from-purple-500/10',
  sky: 'from-sky-500/10', rose: 'from-rose-500/10', violet: 'from-violet-500/10', teal: 'from-teal-500/10',
};

export function MiniMilestoneModal({ open, onOpenChange, milestoneId, milestoneTitle, color }: MiniMilestoneModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();

  const { data: minis, isLoading } = useQuery({
    queryKey: ['mini-milestones', milestoneId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mini_milestones')
        .select('*')
        .eq('milestone_id', milestoneId)
        .order('mini_number');
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!milestoneId,
  });

  const toggleMini = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('mini_milestones')
        .update({ is_completed: completed })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['mini-milestones', milestoneId] });
      queryClient.invalidateQueries({ queryKey: ['plan-missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission-milestones'] });
      if (vars.completed) {
        toast.success(isHe ? '+10 XP! 🔥' : '+10 XP! 🔥');
      }
    },
  });

  const completedCount = minis?.filter(m => m.is_completed).length ?? 0;
  const totalCount = minis?.length ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[75vh] overflow-hidden p-0" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className={cn('p-4 pb-3 border-b bg-gradient-to-r to-transparent', gradientMap[color])}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {isHe ? 'אבן דרך' : 'Milestone'}
              </Badge>
              {progress === 100 && (
                <Badge className="bg-amber-500/20 text-amber-600 text-xs gap-1">
                  <Trophy className="w-3 h-3" /> {isHe ? 'הושלם' : 'Done'}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-sm font-semibold leading-snug">{milestoneTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 mt-3">
            <Progress value={progress} className="h-2 flex-1 [&>div]:bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">{completedCount}/{totalCount}</span>
          </div>
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="p-4 space-y-2">
            <h4 className="text-xs font-medium flex items-center gap-1.5 mb-3 text-muted-foreground">
              <Zap className="w-3.5 h-3.5" />
              {isHe ? 'פעולות יומיות' : 'Daily Actions'}
            </h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : totalCount === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                {isHe ? 'אין פעולות עדיין' : 'No actions yet'}
              </p>
            ) : (
              minis?.map((mini) => {
                const miniTitle = isHe ? mini.title : (mini.title_en || mini.title);
                return (
                  <button
                    key={mini.id}
                    onClick={() => toggleMini.mutate({ id: mini.id, completed: !mini.is_completed })}
                    disabled={toggleMini.isPending}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border bg-card/50 text-start transition-all hover:bg-accent/10',
                      mini.is_completed && 'opacity-60'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                      mini.is_completed ? 'bg-amber-500 border-amber-500' : 'border-muted-foreground/30 hover:border-primary'
                    )}>
                      {mini.is_completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        'text-xs block',
                        mini.is_completed && 'line-through text-muted-foreground'
                      )}>
                        {miniTitle}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[9px] shrink-0">
                      +{mini.xp_reward} XP
                    </Badge>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
