/**
 * SkillsModal — Shows mission-based skills with milestones + legacy XP skills.
 * Opened from HudSidebar. No route, no page — modal only.
 */
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useSkillsProgress } from '@/hooks/useSkillsProgress';
import { useMissionSkills } from '@/hooks/useMissionSkills';
import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const XP_PER_LEVEL = 100;

export function SkillsModal({ open, onOpenChange }: SkillsModalProps) {
  const { topSkills, isLoading, totalTodayXP } = useSkillsProgress();
  const { data: missionSkills, isLoading: missionLoading } = useMissionSkills();
  const { language } = useTranslation();
  const isHe = language === 'he';

  const loading = isLoading || missionLoading;
  const hasMissionSkills = missionSkills && missionSkills.length > 0;
  const hasLegacySkills = topSkills.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" dir={isHe ? 'rtl' : 'ltr'}>
        <DialogHeader
          title={isHe ? 'כישורים' : 'Skills'}
          icon={<Sparkles className="h-5 w-5" />}
          showBackArrow={false}
        />

        {totalTodayXP > 0 && (
          <p className="text-xs text-muted-foreground">
            {isHe ? `היום צברת ${totalTodayXP} XP כישורים` : `Today: +${totalTodayXP} skill XP`}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            {isHe ? 'טוען...' : 'Loading...'}
          </div>
        ) : !hasMissionSkills && !hasLegacySkills ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {isHe ? 'אין כישורים עדיין — השלם משימות כדי לצבור XP!' : 'No skills yet — complete tasks to earn skill XP!'}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mission-based skills (primary) */}
            {hasMissionSkills && missionSkills.map((ms) => {
              const completedCount = ms.milestones.filter(m => m.is_completed).length;
              const totalCount = ms.milestones.length;
              const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              const displayName = isHe ? (ms.skill_name_he || ms.skill_name) : ms.skill_name;

              return (
                <div key={ms.skill_id} className="rounded-xl border border-border/40 overflow-hidden bg-card/50">
                  {/* Skill header */}
                  <div className="flex items-center gap-3 p-3">
                    <span className="text-xl w-8 text-center shrink-0">{ms.skill_icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">{displayName}</span>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          Lv.{ms.level}
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {completedCount}/{totalCount} {isHe ? 'אבני דרך' : 'milestones'}
                      </p>
                    </div>
                  </div>

                  {/* Milestones list */}
                  {ms.milestones.length > 0 && (
                    <div className="px-3 pb-3 space-y-1">
                      {ms.milestones.map((milestone) => {
                        const msTitle = isHe
                          ? (milestone.title || milestone.title_en || '')
                          : (milestone.title_en || milestone.title || '');
                        return (
                          <div
                            key={milestone.id}
                            className={cn(
                              "flex items-start gap-2 py-1.5 px-2 rounded-lg transition-colors",
                              milestone.is_completed ? "bg-primary/5" : "bg-muted/20"
                            )}
                          >
                            {milestone.is_completed ? (
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                            )}
                            <span className={cn(
                              "text-xs leading-snug",
                              milestone.is_completed ? "text-foreground/60 line-through" : "text-foreground"
                            )}>
                              {msTitle}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Legacy XP-based skills (secondary, if any exist without mission link) */}
            {hasLegacySkills && topSkills.filter(sp => 
              !missionSkills?.some(ms => ms.skill_id === sp.skill_id)
            ).length > 0 && (
              <>
                {hasMissionSkills && (
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 pt-2">
                    {isHe ? 'כישורים נוספים' : 'Other Skills'}
                  </p>
                )}
                <div className="space-y-3">
                  {topSkills
                    .filter(sp => !missionSkills?.some(ms => ms.skill_id === sp.skill_id))
                    .map((sp) => {
                      const xpInLevel = sp.xp_total % XP_PER_LEVEL;
                      const pctLegacy = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
                      const skillName = isHe
                        ? (sp.skill?.name_he || sp.skill?.name || sp.skill_id)
                        : (sp.skill?.name || sp.skill_id);

                      return (
                        <div key={sp.skill_id} className="flex items-center gap-3">
                          <span className="text-lg w-7 text-center">{sp.skill?.icon || '⭐'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-sm font-medium truncate">{skillName}</span>
                              <span className="text-xs text-muted-foreground font-mono">Lv.{sp.level}</span>
                            </div>
                            <Progress value={pctLegacy} className="h-2" />
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {xpInLevel}/{XP_PER_LEVEL} XP
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
