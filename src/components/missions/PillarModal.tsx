/**
 * PillarModal — Opens when clicking a pillar card in the hub grid.
 * Shows pillar info + its 3 mission cards (roadmap).
 */
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronRight, ChevronLeft, LucideIcon } from 'lucide-react';
import { MissionCard } from './MissionCard';

const gradientMap: Record<string, string> = {
  blue: 'from-blue-500/10', fuchsia: 'from-fuchsia-500/10', red: 'from-red-500/10',
  amber: 'from-amber-500/10', cyan: 'from-cyan-500/10', slate: 'from-slate-500/10',
  indigo: 'from-indigo-500/10', emerald: 'from-emerald-500/10', purple: 'from-purple-500/10',
  sky: 'from-sky-500/10', rose: 'from-rose-500/10', violet: 'from-violet-500/10', teal: 'from-teal-500/10',
};

const iconColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

interface PillarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pillar: {
    id: string;
    labelHe: string;
    labelEn: string;
    descriptionHe: string;
    description: string;
    color: string;
    icon: LucideIcon;
  };
  missions: {
    id: string;
    title: string;
    title_en: string | null;
    description: string | null;
    description_en: string | null;
    mission_number: number;
    is_completed: boolean;
    xp_reward: number;
    pillar: string;
  }[];
  milestonesByMission: Record<string, {
    id: string;
    title: string;
    title_en: string | null;
    is_completed: boolean | null;
    milestone_number: number | null;
  }[]>;
  isActive: boolean;
}

export function PillarModal({ open, onOpenChange, pillar, missions, milestonesByMission, isActive }: PillarModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const label = isHe ? pillar.labelHe : pillar.labelEn;
  const desc = isHe ? pillar.descriptionHe : pillar.description;
  const Icon = pillar.icon;

  const totalMilestones = missions.reduce((sum, m) => sum + (milestonesByMission[m.id]?.length || 0), 0);
  const completedMilestones = missions.reduce(
    (sum, m) => sum + (milestonesByMission[m.id]?.filter(ms => ms.is_completed).length || 0), 0
  );
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const completedMissions = missions.filter(m => m.is_completed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden p-0" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className={cn('p-4 pb-3 border-b bg-gradient-to-r to-transparent', gradientMap[pillar.color])}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg bg-background/60 backdrop-blur-sm')}>
                <Icon className={cn('w-6 h-6', iconColorMap[pillar.color])} />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-base font-bold">{label}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              {isActive && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            </div>
          </DialogHeader>

          {/* Stats bar */}
          <div className="flex items-center gap-3 mt-3">
            <Progress value={progress} className="h-2 flex-1 [&>div]:bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              {completedMissions}/{missions.length} {isHe ? 'משימות' : 'missions'}
            </span>
          </div>
        </div>

        {/* Missions list */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              {isHe ? 'מפת הדרכים' : 'Roadmap'}
            </h4>
            {missions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {isHe ? 'אין משימות עדיין — יש ליצור תוכנית 100 יום' : 'No missions yet — generate a 100-day plan'}
              </p>
            ) : (
              missions.map((mission, mi) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  milestones={milestonesByMission[mission.id] || []}
                  color={pillar.color}
                  index={mi}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
