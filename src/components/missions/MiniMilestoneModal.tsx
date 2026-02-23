import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Check, Zap, Loader2, Trophy, Sparkles, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [auroraInsight, setAuroraInsight] = useState<string | null>(null);

  // Fetch existing minis
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

  // Auto-generate when opening a milestone with no minis
  const generateMinis = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-phase-actions', {
        body: { milestone_id: milestoneId, user_id: user!.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mini-milestones', milestoneId] });
      const insight = isHe ? data?.aurora_insight_he : data?.aurora_insight_en;
      if (insight) setAuroraInsight(insight);
      toast.success(isHe ? '✨ פעולות יומיות נוצרו!' : '✨ Daily actions generated!');
    },
    onError: (err) => {
      toast.error(isHe ? 'שגיאה ביצירת פעולות' : 'Failed to generate actions');
      console.error(err);
    },
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
  const needsGeneration = !isLoading && totalCount === 0;

  const handleTalkToAurora = () => {
    onOpenChange(false);
    navigate('/aurora');
  };

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
          {totalCount > 0 && (
            <div className="flex items-center gap-3 mt-3">
              <Progress value={progress} className="h-2 flex-1 [&>div]:bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">{completedCount}/{totalCount}</span>
            </div>
          )}
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="p-4 space-y-2">
            {/* Aurora insight banner */}
            {auroraInsight && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground/80 leading-relaxed">{auroraInsight}</p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : needsGeneration ? (
              /* Phase entry — generate actions on demand */
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">
                    {isHe ? 'הגעת לשלב חדש! 🎯' : 'New phase reached! 🎯'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[250px] mx-auto">
                    {isHe
                      ? 'אורורה תנתח את ההתקדמות שלך ותיצור 5 פעולות יומיות מותאמות אישית'
                      : 'Aurora will analyze your progress and create 5 personalized daily actions'}
                  </p>
                </div>
                <Button
                  onClick={() => generateMinis.mutate()}
                  disabled={generateMinis.isPending}
                  className="gap-2"
                  size="sm"
                >
                  {generateMinis.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isHe ? 'צור פעולות יומיות' : 'Generate Daily Actions'}
                </Button>
              </div>
            ) : (
              <>
                <h4 className="text-xs font-medium flex items-center gap-1.5 mb-3 text-muted-foreground">
                  <Zap className="w-3.5 h-3.5" />
                  {isHe ? 'פעולות יומיות' : 'Daily Actions'}
                </h4>
                {minis?.map((mini) => {
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
                })}
              </>
            )}

            {/* Aurora chat prompt — always visible */}
            <div className="pt-3 border-t border-border/30 mt-3">
              <button
                onClick={handleTalkToAurora}
                className="w-full flex items-center gap-2.5 p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-start"
              >
                <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {isHe ? 'דברי עם אורורה 💬' : 'Talk to Aurora 💬'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isHe
                      ? 'שאלי אותה על אסטרטגיות, טיפים, ותכנון מותאם אישית'
                      : 'Ask her about strategies, tips, and personalized planning'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
