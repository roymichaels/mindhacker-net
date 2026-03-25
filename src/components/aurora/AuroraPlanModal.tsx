import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Target, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StoryPlanSurface } from '@/components/story/StorySurfaceShell';

interface AuroraPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useTodayActions() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['aurora-plan-today', user?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_items')
        .select('id, title, status, type, pillar, xp_reward, completed_at')
        .eq('user_id', user!.id)
        .or(`scheduled_date.eq.${today},due_at.gte.${today}T00:00:00,due_at.lte.${today}T23:59:59`)
        .in('status', ['todo', 'doing', 'done'])
        .order('order_index', { ascending: true })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function AuroraPlanModal({ open, onOpenChange }: AuroraPlanModalProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: actions = [], isLoading } = useTodayActions();

  const done = actions.filter((a) => a.status === 'done').length;
  const total = actions.length;

  return (
    <StoryPlanSurface
      open={open}
      onOpenChange={onOpenChange}
      title={isHe ? 'התוכנית שלי' : 'My Plan'}
      subtitle={`${done}/${total} ${isHe ? 'הושלמו' : 'done'}`}
      description="AION plan overview"
      className="max-w-lg h-[80vh]"
    >
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {isHe ? 'אין משימות להיום' : 'No tasks for today'}
              </p>
            </div>
          ) : (
            actions.map((action) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border border-border/60 transition-colors bg-black/10",
                  action.status === 'done' ? 'opacity-60' : ''
                )}
              >
                {action.status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm truncate", action.status === 'done' && 'line-through text-muted-foreground')}>
                    {action.title}
                  </p>
                  {action.pillar ? (
                    <span className="text-[10px] text-muted-foreground">{action.pillar}</span>
                  ) : null}
                </div>
                {action.xp_reward > 0 ? (
                  <span className="text-[10px] font-bold text-primary shrink-0">+{action.xp_reward}xp</span>
                ) : null}
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </StoryPlanSurface>
  );
}
