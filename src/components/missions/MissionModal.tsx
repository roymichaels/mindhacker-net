import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Check, Target, Trophy, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MiniMilestoneModal } from './MiniMilestoneModal';

interface MissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: {
    id: string;
    title: string;
    title_en: string | null;
    description: string | null;
    description_en: string | null;
    mission_number: number;
    is_completed: boolean;
    xp_reward: number;
    pillar: string;
  };
  milestones: {
    id: string;
    title: string;
    title_en: string | null;
    is_completed: boolean | null;
    milestone_number: number | null;
  }[];
  color: string;
}

const iconColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

const gradientMap: Record<string, string> = {
  blue: 'from-blue-500/10', fuchsia: 'from-fuchsia-500/10', red: 'from-red-500/10',
  amber: 'from-amber-500/10', cyan: 'from-cyan-500/10', slate: 'from-slate-500/10',
  indigo: 'from-indigo-500/10', emerald: 'from-emerald-500/10', purple: 'from-purple-500/10',
  sky: 'from-sky-500/10', rose: 'from-rose-500/10', violet: 'from-violet-500/10', teal: 'from-teal-500/10',
};

export function MissionModal({ open, onOpenChange, mission, milestones, color }: MissionModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [selectedMilestone, setSelectedMilestone] = useState<typeof milestones[0] | null>(null);

  const title = isHe ? mission.title : (mission.title_en || mission.title);
  const desc = isHe ? mission.description : (mission.description_en || mission.description);
  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalXP = mission.xp_reward + milestones.length * 20;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden p-0" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={cn('p-4 pb-3 border-b bg-gradient-to-r to-transparent', gradientMap[color])}>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {isHe ? `משימה ${mission.mission_number}` : `Mission ${mission.mission_number}`}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">{mission.pillar}</Badge>
                {mission.is_completed && (
                  <Badge className="bg-amber-500/20 text-amber-600 text-xs gap-1">
                    <Trophy className="w-3 h-3" /> {isHe ? 'הושלם' : 'Done'}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-base font-semibold leading-snug">{title}</DialogTitle>
            </DialogHeader>
            {desc && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>}
            <div className="flex items-center gap-3 mt-3">
              <Progress value={progress} className="h-2 flex-1 [&>div]:bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">{completedCount}/{totalCount}</span>
              <Badge variant="secondary" className="text-[10px]">+{totalXP} XP</Badge>
            </div>
          </div>

          <ScrollArea className="max-h-[55vh]">
            <div className="p-4 space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5 mb-3">
                <Target className={cn('w-4 h-4', iconColorMap[color])} />
                {isHe ? 'אבני דרך' : 'Milestones'}
              </h4>
              {milestones.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  {isHe ? 'אין אבני דרך עדיין' : 'No milestones yet'}
                </p>
              ) : (
                milestones.map((ms, idx) => {
                  const msTitle = isHe ? ms.title : (ms.title_en || ms.title);
                  return (
                    <button
                      key={ms.id}
                      onClick={() => setSelectedMilestone(ms)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg border bg-card/50 text-start transition-all hover:bg-accent/10',
                        ms.is_completed && 'opacity-70'
                      )}
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
                        ms.is_completed ? 'bg-amber-500 border-amber-500' : 'border-muted-foreground/30'
                      )}>
                        {ms.is_completed ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          'text-xs font-medium block',
                          ms.is_completed && 'line-through text-muted-foreground'
                        )}>
                          {msTitle}
                        </span>
                      </div>
                      <ChevronIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedMilestone && (
        <MiniMilestoneModal
          open={!!selectedMilestone}
          onOpenChange={(o) => !o && setSelectedMilestone(null)}
          milestoneId={selectedMilestone.id}
          milestoneTitle={isHe ? selectedMilestone.title : (selectedMilestone.title_en || selectedMilestone.title)}
          color={color}
        />
      )}
    </>
  );
}
