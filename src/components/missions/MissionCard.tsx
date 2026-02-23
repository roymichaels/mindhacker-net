import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Target, Trophy, ChevronRight, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MissionModal } from './MissionModal';

interface MissionCardProps {
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
  index: number;
}

const cardColorMap: Record<string, string> = {
  blue: 'from-blue-500/15 to-blue-600/5 border-blue-500/30',
  fuchsia: 'from-fuchsia-500/15 to-fuchsia-600/5 border-fuchsia-500/30',
  red: 'from-red-500/15 to-red-600/5 border-red-500/30',
  amber: 'from-amber-500/15 to-amber-600/5 border-amber-500/30',
  cyan: 'from-cyan-500/15 to-cyan-600/5 border-cyan-500/30',
  slate: 'from-slate-500/15 to-slate-600/5 border-slate-500/30',
  indigo: 'from-indigo-500/15 to-indigo-600/5 border-indigo-500/30',
  emerald: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/30',
  purple: 'from-purple-500/15 to-purple-600/5 border-purple-500/30',
  sky: 'from-sky-500/15 to-sky-600/5 border-sky-500/30',
  rose: 'from-rose-500/15 to-rose-600/5 border-rose-500/30',
  violet: 'from-violet-500/15 to-violet-600/5 border-violet-500/30',
  teal: 'from-teal-500/15 to-teal-600/5 border-teal-500/30',
};

const iconColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

export function MissionCard({ mission, milestones, color, index }: MissionCardProps) {
  const [open, setOpen] = useState(false);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const title = isHe ? mission.title : (mission.title_en || mission.title);
  const desc = isHe ? mission.description : (mission.description_en || mission.description);
  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.25 }}
        onClick={() => setOpen(true)}
        className={cn(
          'w-full rounded-xl border bg-gradient-to-br p-3 text-start transition-all hover:scale-[1.02] hover:shadow-lg',
          cardColorMap[color] || cardColorMap.purple,
          mission.is_completed && 'ring-1 ring-amber-500/40'
        )}
      >
        <div className="flex items-start gap-2.5">
          <div className={cn('mt-0.5', iconColorMap[color])}>
            {mission.is_completed ? <Trophy className="w-4 h-4 text-amber-400" /> : <Target className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {isHe ? `משימה ${mission.mission_number}` : `Mission ${mission.mission_number}`}
              </Badge>
              {mission.is_completed && (
                <Badge className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0">
                  {isHe ? 'הושלם' : 'Done'}
                </Badge>
              )}
            </div>
            <p className="text-xs font-medium line-clamp-2 mb-1">{title}</p>
            {desc && <p className="text-[10px] text-muted-foreground line-clamp-1">{desc}</p>}
            <div className="flex items-center gap-2 mt-2">
              <Progress value={progress} className="h-1 flex-1 [&>div]:bg-primary" />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{completedCount}/{totalCount}</span>
            </div>
          </div>
          <ChevronIcon className="w-3.5 h-3.5 text-muted-foreground/40 mt-1 shrink-0" />
        </div>
      </motion.button>

      <MissionModal
        open={open}
        onOpenChange={setOpen}
        mission={mission}
        milestones={milestones}
        color={color}
      />
    </>
  );
}
