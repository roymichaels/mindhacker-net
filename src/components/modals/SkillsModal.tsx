/**
 * SkillsModal — Shows top skills from user_skill_progress.
 * Opened from HudSidebar. No route, no page — modal only.
 */
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useSkillsProgress } from '@/hooks/useSkillsProgress';
import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles } from 'lucide-react';

interface SkillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const XP_PER_LEVEL = 100;

export function SkillsModal({ open, onOpenChange }: SkillsModalProps) {
  const { topSkills, isLoading, totalTodayXP } = useSkillsProgress();
  const { language } = useTranslation();
  const isHe = language === 'he';

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

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            {isHe ? 'טוען...' : 'Loading...'}
          </div>
        ) : topSkills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {isHe ? 'אין כישורים עדיין — השלם משימות כדי לצבור XP!' : 'No skills yet — complete tasks to earn skill XP!'}
          </div>
        ) : (
          <div className="space-y-3">
            {topSkills.map((sp) => {
              const xpInLevel = sp.xp_total % XP_PER_LEVEL;
              const pct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
              const skillName = isHe
                ? (sp.skill?.name_he || sp.skill?.name || sp.skill_id)
                : (sp.skill?.name || sp.skill_id);

              return (
                <div key={sp.skill_id} className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">{sp.skill?.icon || '⭐'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium truncate">{skillName}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Lv.{sp.level}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {xpInLevel}/{XP_PER_LEVEL} XP
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
