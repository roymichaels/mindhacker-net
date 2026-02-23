/**
 * PillarModal — Opens when clicking a pillar card in the hub grid.
 * Shows pillar info + its 3 mission cards (roadmap).
 */
import { useTranslation } from '@/hooks/useTranslation';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, Rocket, LucideIcon } from 'lucide-react';
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
  hub: 'core' | 'arena';
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

export function PillarModal({ open, onOpenChange, hub, pillar, missions, milestonesByMission, isActive }: PillarModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { generateStrategy, isGenerating } = useStrategyPlans();

  const label = isHe ? pillar.labelHe : pillar.labelEn;
  const desc = isHe ? pillar.descriptionHe : pillar.description;
  const Icon = pillar.icon;

  const totalMilestones = missions.reduce((sum, m) => sum + (milestonesByMission[m.id]?.length || 0), 0);
  const completedMilestones = missions.reduce(
    (sum, m) => sum + (milestonesByMission[m.id]?.filter(ms => ms.is_completed).length || 0), 0
  );
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const completedMissions = missions.filter(m => m.is_completed).length;

  const handleGenerate = () => {
    generateStrategy.mutate({ hub });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden p-0" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className={cn('p-4 pb-3 border-b bg-gradient-to-r to-transparent', gradientMap[pillar.color])}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/60 backdrop-blur-sm">
                <Icon className={cn('w-6 h-6', iconColorMap[pillar.color])} />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-base font-bold">{label}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              {isActive && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            </div>
          </DialogHeader>

          {missions.length > 0 && (
            <div className="flex items-center gap-3 mt-3">
              <Progress value={progress} className="h-2 flex-1 [&>div]:bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {completedMissions}/{missions.length} {isHe ? 'משימות' : 'missions'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              {isHe ? 'מפת הדרכים' : 'Roadmap'}
            </h4>
            {missions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Rocket className={cn('w-10 h-10', iconColorMap[pillar.color], 'opacity-50')} />
                <p className="text-sm text-muted-foreground text-center">
                  {isHe
                    ? 'עדיין אין תוכנית — ייצר תוכנית 100 יום כדי להתחיל'
                    : 'No plan yet — generate a 100-day plan to start'}
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4" />
                  )}
                  {isHe ? 'ייצר תוכנית 100 יום' : 'Generate 100-Day Plan'}
                </Button>
              </div>
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
